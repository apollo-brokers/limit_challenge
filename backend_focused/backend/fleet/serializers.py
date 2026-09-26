from rest_framework import serializers

from fleet.models import (
    MaintenanceRecord,
    MaintenanceType,
    Mechanic,
    Office,
    Vehicle,
)


class OfficeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Office
        fields = ("id", "name", "city")


class MechanicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mechanic
        fields = ("id", "name", "certification_number", "active")


class MaintenanceTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceType
        fields = ("id", "name")


class VehicleSerializer(serializers.ModelSerializer):
    office = OfficeSerializer(read_only=True)
    office_id = serializers.PrimaryKeyRelatedField(
        source="office",
        queryset=Office.objects.all(),
        write_only=True,
    )

    class Meta:
        model = Vehicle
        fields = (
            "id",
            "vin",
            "license_plate",
            "make",
            "model",
            "year",
            "active",
            "office",
            "office_id",
        )
        # The automatic validator only sees the conditional constraint partially,
        # so the active-plate rule is checked in validate() instead.
        extra_kwargs = {"license_plate": {"validators": []}}

    def validate(self, attrs):
        """Reject the vehicle when it would share its plate with another active vehicle.

        Fields omitted from a partial update fall back to the current instance values,
        so the check always runs against the resulting vehicle state.
        """
        license_plate = attrs.get(
            "license_plate",
            getattr(self.instance, "license_plate", None),
        )
        active = attrs.get("active", getattr(self.instance, "active", True))

        if active:
            conflicts = Vehicle.objects.filter(
                active=True,
                license_plate=license_plate,
            )
            if self.instance is not None:
                conflicts = conflicts.exclude(pk=self.instance.pk)
            if conflicts.exists():
                raise serializers.ValidationError(
                    {
                        "license_plate": [
                            "An active vehicle with this license plate already exists."
                        ]
                    }
                )

        return attrs


class VehicleSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = ("id", "vin", "license_plate", "make", "model")


class MaintenanceRecordSerializer(serializers.ModelSerializer):
    vehicle = VehicleSummarySerializer(read_only=True)
    vehicle_id = serializers.PrimaryKeyRelatedField(
        source="vehicle",
        queryset=Vehicle.objects.all(),
        write_only=True,
    )
    mechanic = MechanicSerializer(read_only=True)
    mechanic_id = serializers.PrimaryKeyRelatedField(
        source="mechanic",
        queryset=Mechanic.objects.all(),
        write_only=True,
    )
    type = MaintenanceTypeSerializer(read_only=True)
    type_id = serializers.PrimaryKeyRelatedField(
        source="type",
        queryset=MaintenanceType.objects.all(),
        write_only=True,
    )

    class Meta:
        model = MaintenanceRecord
        fields = (
            "id",
            "vehicle",
            "vehicle_id",
            "mechanic",
            "mechanic_id",
            "type",
            "type_id",
            "performed_on",
            "cost",
            "notes",
        )
