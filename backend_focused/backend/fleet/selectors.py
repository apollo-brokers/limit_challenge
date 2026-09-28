from datetime import date, timedelta
from decimal import Decimal

from django.db.models import (
    Count,
    DecimalField,
    Exists,
    F,
    Max,
    OuterRef,
    Q,
    Subquery,
    Sum,
    Value,
)
from django.db.models.functions import Coalesce

from fleet.models import MaintenanceRecord, Mechanic, Office, Vehicle

MAINTENANCE_DUE_AFTER_DAYS = 365


def one_year_before(day):
    """Return the same calendar date one year earlier.

    "Last 12 months" follows the calendar instead of subtracting 365 days, so the window does not
    drift by a day across leap years. Feb 29 maps to Feb 28 because the previous year has no
    leap day.
    """
    try:
        return day.replace(year=day.year - 1)
    except ValueError:
        return day.replace(year=day.year - 1, day=28)


def office_summaries(*, today):
    """Annotate every office with active vehicle count, last-12-month cost and last maintenance.

    The cost window is ``one_year_before(today) <= performed_on <= today``, inclusive at both
    ends. Records dated after ``today`` are ignored. Office history is not stored, so records
    count for the vehicle's current office, including records made before a move.
    """
    performed = Q(vehicles__maintenance_records__performed_on__lte=today)
    in_last_year = performed & Q(
        vehicles__maintenance_records__performed_on__gte=one_year_before(today)
    )
    return Office.objects.annotate(
        # The join to maintenance records repeats each vehicle row once per record,
        # so a plain Count would over-count vehicles that have maintenance.
        active_vehicle_count=Count(
            "vehicles",
            filter=Q(vehicles__active=True),
            distinct=True,
        ),
        maintenance_cost_last_year=Coalesce(
            Sum("vehicles__maintenance_records__cost", filter=in_last_year),
            Value(Decimal("0.00")),
            output_field=DecimalField(max_digits=12, decimal_places=2),
        ),
        last_maintenance=Max(
            "vehicles__maintenance_records__performed_on",
            filter=performed,
        ),
    ).order_by("name", "id")


def mechanic_workload(*, today):
    """Annotate every mechanic with current-year record count and cost, busiest first.

    The window is January 1 to ``today`` inclusive, so future-dated records are ignored. The
    period filter lives in the aggregates, not in ``filter()``, so mechanics without work this
    year stay in the result with zero totals.
    """
    in_current_year = Q(
        maintenance_records__performed_on__gte=date(today.year, 1, 1),
        maintenance_records__performed_on__lte=today,
    )
    return Mechanic.objects.annotate(
        maintenance_count=Count("maintenance_records", filter=in_current_year),
        total_cost=Coalesce(
            Sum("maintenance_records__cost", filter=in_current_year),
            Value(Decimal("0.00")),
            output_field=DecimalField(max_digits=12, decimal_places=2),
        ),
    ).order_by("-maintenance_count", "-total_cost", "name", "id")


def filter_vehicles(
    queryset,
    *,
    office=None,
    active=None,
    make=None,
    model=None,
    maintained_from=None,
    maintained_to=None,
    mechanic_certification=None,
):
    """Apply the vehicle search filters; ``None`` means the filter was not sent.

    ``office``, ``make`` and ``model`` are model instances. The make is read through the vehicle
    model, since a vehicle stores only its model. The maintenance filters
    (inclusive date bounds and mechanic certification) must all match the same record, so one
    correlated ``EXISTS`` is used. A join would need ``distinct()`` to avoid one row per
    matching record, and separate joins would let different records satisfy each filter.
    """
    if office is not None:
        queryset = queryset.filter(office=office)
    if active is not None:
        queryset = queryset.filter(active=active)
    if make is not None:
        queryset = queryset.filter(model__make=make)
    if model is not None:
        queryset = queryset.filter(model=model)

    if (
        maintained_from is not None
        or maintained_to is not None
        or mechanic_certification is not None
    ):
        records = MaintenanceRecord.objects.filter(vehicle=OuterRef("pk"))
        if maintained_from is not None:
            records = records.filter(performed_on__gte=maintained_from)
        if maintained_to is not None:
            records = records.filter(performed_on__lte=maintained_to)
        if mechanic_certification is not None:
            records = records.filter(
                mechanic__certification_number=mechanic_certification
            )
        queryset = queryset.filter(Exists(records))

    return queryset


def vehicles_needing_maintenance(*, today):
    """Return active vehicles never maintained or last maintained more than 365 days ago.

    ``last_maintenance`` comes from a correlated subquery that reads only the latest record up to
    ``today``, so future-dated records do not hide an overdue vehicle. Exactly 365 days ago is
    not due yet. Never-maintained vehicles sort first as the most overdue, then oldest first.
    """
    last_performed_on = (
        MaintenanceRecord.objects.filter(vehicle=OuterRef("pk"), performed_on__lte=today)
        .order_by("-performed_on")
        .values("performed_on")[:1]
    )
    due_before = today - timedelta(days=MAINTENANCE_DUE_AFTER_DAYS)
    return (
        Vehicle.objects.filter(active=True)
        .select_related("office", "model__make")
        .annotate(last_maintenance=Subquery(last_performed_on))
        .filter(Q(last_maintenance__isnull=True) | Q(last_maintenance__lt=due_before))
        .order_by(F("last_maintenance").asc(nulls_first=True), "id")
    )


def vehicle_conflicts(*, vin, license_plate):
    """Return the fields that clash with existing vehicles, in the order ``vin, license_plate``.

    A VIN conflicts with any vehicle, active or not. A license plate conflicts only with an
    active vehicle, matching the conditional unique constraint. Values are compared exactly;
    whitespace trimming happens at the HTTP boundary before this is called.
    """
    conflicts = []
    if Vehicle.objects.filter(vin=vin).exists():
        conflicts.append("vin")
    if Vehicle.objects.filter(license_plate=license_plate, active=True).exists():
        conflicts.append("license_plate")
    return conflicts
