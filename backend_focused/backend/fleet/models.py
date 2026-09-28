from django.db import models


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

    def __str__(self) -> str:
        return f"{self.make} {self.model} ({self.license_plate})"
