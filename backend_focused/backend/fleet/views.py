from datetime import date, timedelta
from decimal import Decimal

from django.db import IntegrityError
from django.db.models import Count, DecimalField, F, Max, Prefetch, Q, Sum, Value
from django.db.models.deletion import ProtectedError
from django.db.models.functions import Coalesce
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import MaintenanceRecord, Mechanic, Office, Vehicle
from .serializers import (
    AssignVehicleSerializer,
    DuplicateCheckSerializer,
    MaintenanceRecordNestedSerializer,
    MaintenanceRecordSerializer,
    MechanicSerializer,
    MechanicWorkloadSerializer,
    OfficeSerializer,
    OfficeSummarySerializer,
    VehicleDetailSerializer,
    VehicleSerializer,
)


class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


def parse_bool(value: str | None) -> bool | None:
    if value is None or value == "":
        return None
    lowered = value.lower()
    if lowered in {"true", "1", "yes"}:
        return True
    if lowered in {"false", "0", "no"}:
        return False
    raise ValidationError({"active": "Must be a boolean value (true/false)."})


def parse_date(value: str | None, field_name: str) -> date | None:
    if value is None or value == "":
        return None
    try:
        return date.fromisoformat(value)
    except ValueError as exc:
        raise ValidationError({field_name: "Invalid date. Use YYYY-MM-DD."}) from exc


def parse_office_id(value: str) -> int:
    try:
        return int(value)
    except (TypeError, ValueError) as exc:
        raise ValidationError({"office": "Must be a valid office id."}) from exc


class OfficeViewSet(viewsets.ModelViewSet):
    queryset = Office.objects.all()
    serializer_class = OfficeSerializer
    pagination_class = StandardPagination

    def perform_destroy(self, instance):
        try:
            instance.delete()
        except ProtectedError as exc:
            raise ValidationError(
                {
                    "detail": (
                        "Cannot delete this office while vehicles are still assigned to it."
                    )
                }
            ) from exc


class MechanicViewSet(viewsets.ModelViewSet):
    queryset = Mechanic.objects.all()
    serializer_class = MechanicSerializer
    pagination_class = StandardPagination

    def perform_destroy(self, instance):
        try:
            instance.delete()
        except ProtectedError as exc:
            raise ValidationError(
                {
                    "detail": (
                        "Cannot delete this mechanic while maintenance records reference them."
                    )
                }
            ) from exc


class MaintenanceRecordViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceRecord.objects.select_related("mechanic", "vehicle")
    serializer_class = MaintenanceRecordSerializer
    pagination_class = StandardPagination


class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.select_related("office")
    serializer_class = VehicleSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        qs = super().get_queryset()
        # Keep detail/custom actions free of list-only query filters to avoid false 404s.
        if getattr(self, "action", None) != "list":
            return qs

        params = self.request.query_params
        office = params.get("office")
        make = params.get("make")
        model = params.get("model")
        active = parse_bool(params.get("active"))

        if office:
            qs = qs.filter(office_id=parse_office_id(office))
        if make:
            qs = qs.filter(make__iexact=make)
        if model:
            qs = qs.filter(model__iexact=model)
        if active is not None:
            qs = qs.filter(is_active=active)
        return qs

    def perform_create(self, serializer):
        try:
            serializer.save()
        except IntegrityError as exc:
            raise ValidationError(
                {
                    "detail": (
                        "Could not create vehicle due to a uniqueness conflict "
                        "(VIN or active license plate)."
                    )
                }
            ) from exc

    def perform_update(self, serializer):
        try:
            serializer.save()
        except IntegrityError as exc:
            raise ValidationError(
                {
                    "detail": (
                        "Could not update vehicle due to a uniqueness conflict "
                        "(VIN or active license plate)."
                    )
                }
            ) from exc

    @action(detail=True, methods=["get"], url_path="details")
    def details(self, request, pk=None):
        qs = Vehicle.objects.select_related("office").prefetch_related(
            Prefetch(
                "maintenance_records",
                queryset=MaintenanceRecord.objects.select_related("mechanic").order_by(
                    "-maintenance_date", "-id"
                ),
            )
        )
        vehicle = qs.filter(pk=pk).first()
        if vehicle is None:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = VehicleDetailSerializer(vehicle)
        return Response(serializer.data)

    @action(detail=True, methods=["get"], url_path="maintenance-history")
    def maintenance_history(self, request, pk=None):
        vehicle = self.get_object()
        records = (
            MaintenanceRecord.objects.filter(vehicle=vehicle)
            .select_related("mechanic")
            .order_by("-maintenance_date", "-id")
        )
        page = self.paginate_queryset(records)
        if page is not None:
            serializer = MaintenanceRecordNestedSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = MaintenanceRecordNestedSerializer(records, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="assign")
    def assign(self, request, pk=None):
        vehicle = self.get_object()
        serializer = AssignVehicleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_office = serializer.validated_data["office"]

        if vehicle.office_id == new_office.id:
            raise ValidationError(
                {"office_id": "Vehicle is already assigned to this office."}
            )

        vehicle.office = new_office
        vehicle.save(update_fields=["office"])
        return Response(VehicleSerializer(vehicle).data)

    @action(detail=False, methods=["get"], url_path="search")
    def search(self, request):
        params = request.query_params
        qs = Vehicle.objects.select_related("office").distinct()

        office = params.get("office")
        make = params.get("make")
        model = params.get("model")
        active = parse_bool(params.get("active"))
        maintained_from = parse_date(
            params.get("maintained_from") or params.get("maintenance_from"),
            "maintained_from",
        )
        maintained_to = parse_date(
            params.get("maintained_to") or params.get("maintenance_to"),
            "maintained_to",
        )
        cert = params.get("mechanic_certification") or params.get("certification_number")

        if office:
            qs = qs.filter(office_id=parse_office_id(office))
        if make:
            qs = qs.filter(make__iexact=make.strip())
        if model:
            qs = qs.filter(model__iexact=model.strip())
        if active is not None:
            qs = qs.filter(is_active=active)

        if maintained_from and maintained_to and maintained_from > maintained_to:
            raise ValidationError(
                {"maintained_from": "maintained_from must be on or before maintained_to."}
            )

        maintenance_filter = Q()
        if maintained_from:
            maintenance_filter &= Q(
                maintenance_records__maintenance_date__gte=maintained_from
            )
        if maintained_to:
            maintenance_filter &= Q(
                maintenance_records__maintenance_date__lte=maintained_to
            )
        if cert:
            maintenance_filter &= Q(
                maintenance_records__mechanic__certification_number__iexact=cert.strip()
            )

        if maintenance_filter:
            qs = qs.filter(maintenance_filter)

        page = self.paginate_queryset(qs.order_by("vin"))
        if page is not None:
            serializer = VehicleSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = VehicleSerializer(qs.order_by("vin"), many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="needing-maintenance")
    def needing_maintenance(self, request):
        cutoff = timezone.localdate() - timedelta(days=365)
        qs = (
            Vehicle.objects.filter(is_active=True)
            .select_related("office")
            .annotate(last_maintenance=Max("maintenance_records__maintenance_date"))
            .filter(Q(last_maintenance__isnull=True) | Q(last_maintenance__lt=cutoff))
            .order_by(F("last_maintenance").asc(nulls_first=True), "id")
        )
        page = self.paginate_queryset(qs)
        if page is not None:
            data = VehicleSerializer(page, many=True).data
            for item, obj in zip(data, page):
                item["last_maintenance"] = obj.last_maintenance
            return self.get_paginated_response(data)

        vehicles = list(qs)
        data = VehicleSerializer(vehicles, many=True).data
        for item, obj in zip(data, vehicles):
            item["last_maintenance"] = obj.last_maintenance
        return Response(data)

    @action(detail=False, methods=["post"], url_path="duplicate-check")
    def duplicate_check(self, request):
        serializer = DuplicateCheckSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({"conflicts": serializer.get_conflicts()})


class OfficeSummaryView(APIView):
    def get(self, request):
        today = timezone.localdate()
        one_year_ago = today - timedelta(days=365)

        offices = (
            Office.objects.annotate(
                active_vehicle_count=Count(
                    "vehicles",
                    filter=Q(vehicles__is_active=True),
                    distinct=True,
                ),
                maintenance_cost_last_year=Coalesce(
                    Sum(
                        "vehicles__maintenance_records__cost",
                        filter=Q(
                            vehicles__maintenance_records__maintenance_date__gte=one_year_ago,
                            vehicles__maintenance_records__maintenance_date__lte=today,
                        ),
                    ),
                    Value(Decimal("0.00")),
                    output_field=DecimalField(max_digits=14, decimal_places=2),
                ),
                last_maintenance=Max("vehicles__maintenance_records__maintenance_date"),
            )
            .order_by("name")
            .values(
                "id",
                "name",
                "city",
                "active_vehicle_count",
                "maintenance_cost_last_year",
                "last_maintenance",
            )
        )
        serializer = OfficeSummarySerializer(offices, many=True)
        return Response(serializer.data)


class MechanicWorkloadView(APIView):
    def get(self, request):
        year = timezone.localdate().year
        year_start = date(year, 1, 1)
        year_end = date(year, 12, 31)

        mechanics = (
            Mechanic.objects.annotate(
                records_this_year=Count(
                    "maintenance_records",
                    filter=Q(
                        maintenance_records__maintenance_date__gte=year_start,
                        maintenance_records__maintenance_date__lte=year_end,
                    ),
                ),
                total_cost_this_year=Coalesce(
                    Sum(
                        "maintenance_records__cost",
                        filter=Q(
                            maintenance_records__maintenance_date__gte=year_start,
                            maintenance_records__maintenance_date__lte=year_end,
                        ),
                    ),
                    Value(Decimal("0.00")),
                    output_field=DecimalField(max_digits=14, decimal_places=2),
                ),
            )
            .order_by("-records_this_year", "-total_cost_this_year", "name")
            .values("id", "name", "records_this_year", "total_cost_this_year")
        )
        serializer = MechanicWorkloadSerializer(mechanics, many=True)
        return Response(serializer.data)
