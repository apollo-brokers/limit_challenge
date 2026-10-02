from rest_framework import serializers

from .models import MaintenanceRecord, Mechanic, Office, Vehicle


class OfficeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Office
        fields = ["id", "name", "city"]


class MechanicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mechanic
        fields = ["id", "name", "certification_number", "is_active"]


class VehicleSerializer(serializers.ModelSerializer):
    office = OfficeSerializer(read_only=True)
    office_id = serializers.PrimaryKeyRelatedField(
        queryset=Office.objects.all(),
        source="office",
        write_only=True,
    )

    class Meta:
        model = Vehicle
        fields = [
            "id",
            "vin",
            "license_plate",
            "make",
            "model",
            "year",
            "office",
            "office_id",
            "is_active",
        ]

    def validate_vin(self, value: str) -> str:
        value = value.strip().upper()
        if len(value) < 11 or len(value) > 17:
            raise serializers.ValidationError(
                "VIN must be between 11 and 17 characters."
            )
        return value

    def validate_license_plate(self, value: str) -> str:
        return value.strip().upper()

    def validate_year(self, value: int) -> int:
        if value < 1980 or value > 2100:
            raise serializers.ValidationError("Year must be between 1980 and 2100.")
        return value

    def validate(self, attrs):
        license_plate = attrs.get(
            "license_plate",
            getattr(self.instance, "license_plate", None),
        )
        is_active = attrs.get(
            "is_active",
            getattr(self.instance, "is_active", True),
        )

        if is_active and license_plate:
            qs = Vehicle.objects.filter(
                license_plate=license_plate,
                is_active=True,
            )
            if self.instance is not None:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    {
                        "license_plate": (
                            "An active vehicle with this license plate already exists."
                        )
                    }
                )
        return attrs


class MaintenanceRecordSerializer(serializers.ModelSerializer):
    vehicle_id = serializers.PrimaryKeyRelatedField(
        queryset=Vehicle.objects.all(),
        source="vehicle",
    )
    mechanic_id = serializers.PrimaryKeyRelatedField(
        queryset=Mechanic.objects.all(),
        source="mechanic",
    )
    mechanic = MechanicSerializer(read_only=True)

    class Meta:
        model = MaintenanceRecord
        fields = [
            "id",
            "vehicle_id",
            "mechanic_id",
            "mechanic",
            "maintenance_date",
            "maintenance_type",
            "cost",
            "notes",
        ]


class MaintenanceRecordNestedSerializer(serializers.ModelSerializer):
    mechanic = MechanicSerializer(read_only=True)

    class Meta:
        model = MaintenanceRecord
        fields = [
            "id",
            "mechanic",
            "maintenance_date",
            "maintenance_type",
            "cost",
            "notes",
        ]


class VehicleDetailSerializer(serializers.ModelSerializer):
    office = OfficeSerializer(read_only=True)
    maintenance_history = MaintenanceRecordNestedSerializer(
        source="maintenance_records",
        many=True,
        read_only=True,
    )

    class Meta:
        model = Vehicle
        fields = [
            "id",
            "vin",
            "license_plate",
            "make",
            "model",
            "year",
            "is_active",
            "office",
            "maintenance_history",
        ]


class OfficeSummarySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    city = serializers.CharField()
    active_vehicle_count = serializers.IntegerField()
    maintenance_cost_last_year = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
    )
    last_maintenance = serializers.DateField(allow_null=True)


class MechanicWorkloadSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    records_this_year = serializers.IntegerField()
    total_cost_this_year = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
    )


class AssignVehicleSerializer(serializers.Serializer):
    office_id = serializers.PrimaryKeyRelatedField(
        queryset=Office.objects.all(),
        source="office",
    )


class DuplicateCheckSerializer(serializers.Serializer):
    vin = serializers.CharField(max_length=17)
    license_plate = serializers.CharField(max_length=20)
    exclude_id = serializers.IntegerField(required=False)
    # Defaults to True: plate conflicts only matter when registering/keeping a vehicle active.
    is_active = serializers.BooleanField(required=False, default=True)

    def validate_vin(self, value: str) -> str:
        return value.strip().upper()

    def validate_license_plate(self, value: str) -> str:
        return value.strip().upper()

    def get_conflicts(self) -> list[str]:
        vin = self.validated_data["vin"]
        license_plate = self.validated_data["license_plate"]
        exclude_id = self.validated_data.get("exclude_id")
        is_active = self.validated_data.get("is_active", True)

        conflicts: list[str] = []

        vin_qs = Vehicle.objects.filter(vin=vin)
        if exclude_id is not None:
            vin_qs = vin_qs.exclude(pk=exclude_id)

        if vin_qs.exists():
            conflicts.append("vin")

        # Inactive vehicles may reuse plates occupied by active ones (and vice versa).
        if is_active:
            plate_qs = Vehicle.objects.filter(
                license_plate=license_plate,
                is_active=True,
            )
            if exclude_id is not None:
                plate_qs = plate_qs.exclude(pk=exclude_id)
            if plate_qs.exists():
                conflicts.append("license_plate")

        return conflicts
