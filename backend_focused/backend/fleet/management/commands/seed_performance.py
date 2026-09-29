from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from fleet.models import Vehicle
from maintenance.models import MaintenanceRecord, Mechanic
from offices.models import Office

HISTORY_SIZES = (1_000, 10_000, 50_000, 100_000)
BATCH_SIZE = 1_000
MAINTENANCE_TYPES = (
    "Inspection",
    "Oil change",
    "Brake service",
    "Tire replacement",
    "Engine repair",
)


class Command(BaseCommand):
    help = "Add four named performance vehicles without replacing existing fleet data."

    @transaction.atomic
    def handle(self, *args, **options):
        office, _ = Office.objects.get_or_create(
            name="Performance test office", city="Seed data"
        )
        mechanic, _ = Mechanic.objects.get_or_create(
            certification_number="PERF-SEED-001",
            defaults={"name": "Performance test mechanic", "active": True},
        )
        today = timezone.localdate()
        total_created = 0

        # Newest vehicles appear first: create the largest history first so the
        # initial list progresses from 1k to 100k without assigning artificial IDs.
        for count in reversed(HISTORY_SIZES):
            vin = f"PERF{count:013d}"
            plate = f"PERF-{count:06d}"
            label = f"{count // 1000} mil" if count % 1000 == 0 else str(count)
            vehicle, _ = Vehicle.objects.get_or_create(
                vin__iexact=vin,
                defaults={
                    "vin": vin,
                    "license_plate": plate,
                    "make": "Veiculo",
                    "model": f"{label} registros",
                    "year": today.year,
                    "office": office,
                    "active": True,
                },
            )
            if vehicle.license_plate.casefold() != plate.casefold():
                raise CommandError(
                    f"VIN {vin} already belongs to a different vehicle; no data changed."
                )

            existing = vehicle.maintenance_records.count()
            if existing > count:
                self.stdout.write(
                    self.style.WARNING(
                        f"Vehicle #{vehicle.pk} already has {existing:,} records "
                        f"(target {count:,}); preserving all existing records."
                    )
                )

            for start in range(existing, count, BATCH_SIZE):
                records = [
                    MaintenanceRecord(
                        vehicle=vehicle,
                        mechanic=mechanic,
                        maintenance_date=today - timedelta(days=index % 730),
                        maintenance_type=MAINTENANCE_TYPES[
                            index % len(MAINTENANCE_TYPES)
                        ],
                        cost=Decimal(2500 + index % 497501) / Decimal("100"),
                        notes=f"Performance seed: record {index + 1} of {count}.",
                    )
                    for index in range(start, min(start + BATCH_SIZE, count))
                ]
                MaintenanceRecord.objects.bulk_create(records, batch_size=BATCH_SIZE)

            added = max(0, count - existing)
            total_created += added
            self.stdout.write(
                f"{vehicle.make} {vehicle.model} | #{vehicle.pk} | "
                f"{max(count, existing):,} records ({added:,} added) | "
                f"/vehicles/{vehicle.pk}"
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Performance seed ready: {total_created:,} maintenance records added. "
                "Existing data was preserved."
            )
        )
