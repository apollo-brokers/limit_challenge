from rest_framework import serializers

from fleet.models import Vehicle
from fleet.services import VehicleConflictError, VehicleService


CONFLICT_MESSAGES = {
    "vin": "A vehicle with this VIN already exists.",
    "license_plate": "This license plate is already assigned to an active vehicle.",
}


class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = "__all__"

    def create(self, validated_data):
        try:
            return VehicleService().create(validated_data)
        except VehicleConflictError as error:
            raise serializers.ValidationError(
                {
                    field: CONFLICT_MESSAGES[field]
                    for field in error.conflicts
                }
            ) from error

    def update(self, instance, validated_data):
        try:
            return VehicleService().update(instance, validated_data)
        except VehicleConflictError as error:
            raise serializers.ValidationError(
                {
                    field: CONFLICT_MESSAGES[field]
                    for field in error.conflicts
                }
            ) from error
