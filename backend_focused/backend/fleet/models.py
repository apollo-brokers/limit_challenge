from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models


class Office(models.Model):
    name = models.CharField(max_length=120)
    city = models.CharField(max_length=120)

    def __str__(self):
        return f"{self.name} ({self.city})"


class VehicleMake(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class VehicleModel(models.Model):
    make = models.ForeignKey(
        VehicleMake,
        related_name="models",
        on_delete=models.PROTECT,
    )
    name = models.CharField(max_length=100)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("make", "name"),
                name="uniq_vehicle_model_per_make",
            ),
        ]

    def __str__(self):
        return f"{self.make} {self.name}"


class Vehicle(models.Model):
    vin = models.CharField(max_length=17, unique=True)
    license_plate = models.CharField(max_length=20)
    # The make is always model.make. Storing it here too could create a make/model mismatch.
    model = models.ForeignKey(
        VehicleModel,
        related_name="vehicles",
        on_delete=models.PROTECT,
    )
    year = models.PositiveSmallIntegerField()
    office = models.ForeignKey(
        Office,
        related_name="vehicles",
        on_delete=models.PROTECT,
    )
    active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("license_plate",),
                condition=models.Q(active=True),
                name="uniq_active_vehicle_plate",
            ),
        ]
        indexes = [
            models.Index(
                fields=("office", "active"),
                name="fleet_veh_off_act_idx",
            ),
        ]

    def __str__(self):
        return f"{self.model} ({self.license_plate})"


class Mechanic(models.Model):
    name = models.CharField(max_length=120)
    certification_number = models.CharField(max_length=64, unique=True)
    active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.certification_number})"


class MaintenanceType(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class MaintenanceRecord(models.Model):
    vehicle = models.ForeignKey(
        Vehicle,
        related_name="maintenance_records",
        on_delete=models.CASCADE,
    )
    mechanic = models.ForeignKey(
        Mechanic,
        related_name="maintenance_records",
        on_delete=models.PROTECT,
    )
    type = models.ForeignKey(
        MaintenanceType,
        related_name="maintenance_records",
        on_delete=models.PROTECT,
    )
    performed_on = models.DateField()
    cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0"))],
    )
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ("-performed_on", "-pk")
        constraints = [
            models.CheckConstraint(
                condition=models.Q(cost__gte=0),
                name="maint_cost_non_negative",
            ),
        ]
        indexes = [
            models.Index(
                fields=("vehicle", "-performed_on", "-id"),
                name="fleet_mr_veh_perf_id_idx",
            ),
            models.Index(
                fields=("performed_on",),
                name="fleet_mr_perf_idx",
            ),
            models.Index(
                fields=("mechanic", "performed_on"),
                name="fleet_mr_mech_perf_idx",
            ),
        ]

    def __str__(self):
        return f"{self.vehicle} - {self.type} on {self.performed_on}"
