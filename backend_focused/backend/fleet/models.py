from django.db import models
from django.db.models.functions import Lower

from fleet.querysets import VehicleQuerySet


class Vehicle(models.Model):
    vin = models.CharField(max_length=17)
    license_plate = models.CharField(max_length=20)
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.PositiveSmallIntegerField()
    office = models.ForeignKey(
        "offices.Office",
        on_delete=models.PROTECT,
        related_name="vehicles",
    )
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = VehicleQuerySet.as_manager()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                Lower("vin"),
                name="unique_vehicle_vin_ci",
            ),
            models.UniqueConstraint(
                Lower("license_plate"),
                condition=models.Q(active=True),
                name="unique_active_vehicle_plate_ci",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.make} {self.model} ({self.license_plate})"
