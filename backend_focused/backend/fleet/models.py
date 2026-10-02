from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import Q


class Office(models.Model):
    name = models.CharField(max_length=255)
    city = models.CharField(max_length=255)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return f"{self.name} ({self.city})"


class Vehicle(models.Model):
    vin = models.CharField(max_length=17, unique=True)
    license_plate = models.CharField(max_length=20)
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.PositiveIntegerField()
    office = models.ForeignKey(
        Office,
        on_delete=models.PROTECT,
        related_name="vehicles",
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["vin"]
        constraints = [
            models.UniqueConstraint(
                fields=["license_plate"],
                condition=Q(is_active=True),
                name="unique_active_license_plate",
            ),
        ]
        indexes = [
            models.Index(fields=["make", "model"]),
            models.Index(fields=["is_active"]),
            models.Index(fields=["office", "is_active"]),
        ]

    def __str__(self) -> str:
        return f"{self.vin} ({self.license_plate})"


class Mechanic(models.Model):
    name = models.CharField(max_length=255)
    certification_number = models.CharField(max_length=64, unique=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return f"{self.name} ({self.certification_number})"


class MaintenanceRecord(models.Model):
    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.CASCADE,
        related_name="maintenance_records",
    )
    mechanic = models.ForeignKey(
        Mechanic,
        on_delete=models.PROTECT,
        related_name="maintenance_records",
    )
    maintenance_date = models.DateField()
    maintenance_type = models.CharField(max_length=100)
    cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    notes = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["-maintenance_date", "-id"]
        indexes = [
            models.Index(fields=["maintenance_date"]),
            models.Index(fields=["vehicle", "-maintenance_date"]),
            models.Index(fields=["mechanic", "maintenance_date"]),
        ]

    def __str__(self) -> str:
        return f"{self.vehicle_id} @ {self.maintenance_date} ({self.maintenance_type})"
