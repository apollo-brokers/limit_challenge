# Generated manually for Fleet Maintenance API

import django.core.validators
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Mechanic",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=255)),
                ("certification_number", models.CharField(max_length=64, unique=True)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={
                "ordering": ["name"],
            },
        ),
        migrations.CreateModel(
            name="Office",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=255)),
                ("city", models.CharField(max_length=255)),
            ],
            options={
                "ordering": ["name"],
            },
        ),
        migrations.CreateModel(
            name="Vehicle",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("vin", models.CharField(max_length=17, unique=True)),
                ("license_plate", models.CharField(max_length=20)),
                ("make", models.CharField(max_length=100)),
                ("model", models.CharField(max_length=100)),
                ("year", models.PositiveIntegerField()),
                ("is_active", models.BooleanField(default=True)),
                (
                    "office",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="vehicles",
                        to="fleet.office",
                    ),
                ),
            ],
            options={
                "ordering": ["vin"],
            },
        ),
        migrations.CreateModel(
            name="MaintenanceRecord",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("maintenance_date", models.DateField()),
                ("maintenance_type", models.CharField(max_length=100)),
                (
                    "cost",
                    models.DecimalField(
                        decimal_places=2,
                        max_digits=12,
                        validators=[django.core.validators.MinValueValidator(0)],
                    ),
                ),
                ("notes", models.TextField(blank=True, default="")),
                (
                    "mechanic",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="maintenance_records",
                        to="fleet.mechanic",
                    ),
                ),
                (
                    "vehicle",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="maintenance_records",
                        to="fleet.vehicle",
                    ),
                ),
            ],
            options={
                "ordering": ["-maintenance_date", "-id"],
            },
        ),
        migrations.AddIndex(
            model_name="vehicle",
            index=models.Index(
                fields=["make", "model"], name="fleet_vehic_make_7ad857_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="vehicle",
            index=models.Index(fields=["is_active"], name="fleet_vehic_is_acti_007c2e_idx"),
        ),
        migrations.AddIndex(
            model_name="vehicle",
            index=models.Index(
                fields=["office", "is_active"], name="fleet_vehic_office__7d2dc4_idx"
            ),
        ),
        migrations.AddConstraint(
            model_name="vehicle",
            constraint=models.UniqueConstraint(
                condition=models.Q(("is_active", True)),
                fields=("license_plate",),
                name="unique_active_license_plate",
            ),
        ),
        migrations.AddIndex(
            model_name="maintenancerecord",
            index=models.Index(
                fields=["maintenance_date"], name="fleet_maint_mainten_177bd9_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="maintenancerecord",
            index=models.Index(
                fields=["vehicle", "-maintenance_date"],
                name="fleet_maint_vehicle_584dc6_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="maintenancerecord",
            index=models.Index(
                fields=["mechanic", "maintenance_date"],
                name="fleet_maint_mechani_04e282_idx",
            ),
        ),
    ]
