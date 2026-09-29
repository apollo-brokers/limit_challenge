from rest_framework import serializers

from fleet.models import Vehicle
from fleet.services import VehicleConflictError, VehicleService
from maintenance.serializers import MaintenanceRecordDetailSerializer
from offices.models import Office
from offices.serializers import OfficeSerializer

CONFLICT_MESSAGES = {
    "vin": "A vehicle with this VIN already exists.",
    "license_plate": "This license plate is already assigned to an active vehicle.",
}


class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = "__all__"

    def create(self, validated_data):
        vehicle_service = VehicleService()

        try:
            return vehicle_service.create(validated_data)
        except VehicleConflictError as error:
            raise serializers.ValidationError(
                {field: CONFLICT_MESSAGES[field] for field in error.conflicts}
            ) from error

    def update(self, instance, validated_data):
        vehicle_service = VehicleService()

        try:
            return vehicle_service.update(instance, validated_data)
        except VehicleConflictError as error:
            raise serializers.ValidationError(
                {field: CONFLICT_MESSAGES[field] for field in error.conflicts}
            ) from error


class VehicleDetailSerializer(serializers.ModelSerializer):
    office = OfficeSerializer(read_only=True)
    maintenance_records = MaintenanceRecordDetailSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Vehicle
        fields = "__all__"


class VehicleAssignmentSerializer(serializers.Serializer):
    office = serializers.PrimaryKeyRelatedField(queryset=Office.objects.all())


class VehicleNeedingMaintenanceSerializer(serializers.ModelSerializer):
    last_maintenance = serializers.DateField(allow_null=True)

    class Meta:
        model = Vehicle
        fields = "__all__"


class VehicleDuplicateCheckSerializer(serializers.Serializer):
    vin = serializers.CharField(max_length=17)
    license_plate = serializers.CharField(max_length=20)
