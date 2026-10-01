from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone
from faker import Faker

from fleet.models import Vehicle
from maintenance.models import MaintenanceRecord, Mechanic
from offices.models import Office


class Command(BaseCommand):
    help = "Fill the database with dummy fleet maintenance data."

    def add_arguments(self, parser):
        parser.add_argument("--offices", type=int, default=5)
        parser.add_argument("--vehicles", type=int, default=50)
        parser.add_argument("--mechanics", type=int, default=10)
        parser.add_argument("--maintenance-records", type=int, default=200)
        parser.add_argument("--seed", type=int, default=42)
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete existing fleet data before creating the dummy data.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        office_count = options["offices"]
        vehicle_count = options["vehicles"]
        mechanic_count = options["mechanics"]
        maintenance_record_count = options["maintenance_records"]

        self._validate_counts(
            offices=office_count,
            vehicles=vehicle_count,
            mechanics=mechanic_count,
            maintenance_records=maintenance_record_count,
        )

        if options["clear"]:
            self._clear_data()
        elif self._data_exists():
            raise CommandError(
                "Fleet data already exists. Run the command with --clear to replace it."
            )

        fake = Faker()
        fake.seed_instance(options["seed"])

        offices = self._create_offices(fake, office_count)
        mechanics = self._create_mechanics(fake, mechanic_count)
        vehicles = self._create_vehicles(fake, vehicle_count, offices)
        maintenance_records = self._create_maintenance_records(
            fake,
            maintenance_record_count,
            vehicles,
            mechanics,
        )

        self.stdout.write(
            self.style.SUCCESS(
                "Created "
                f"{len(offices)} offices, "
                f"{len(vehicles)} vehicles, "
                f"{len(mechanics)} mechanics and "
                f"{len(maintenance_records)} maintenance records."
            )
        )

    def _validate_counts(self, **counts):
        invalid_options = [name for name, value in counts.items() if value <= 0]

        if invalid_options:
            joined_options = ", ".join(
                f"--{name.replace('_', '-')}" for name in invalid_options
            )
            raise CommandError(
                f"These options must be greater than zero: {joined_options}."
            )

    def _data_exists(self):
        return any(
            model.objects.exists()
            for model in [Office, Vehicle, Mechanic, MaintenanceRecord]
        )

    def _clear_data(self):
        MaintenanceRecord.objects.all().delete()
        Vehicle.objects.all().delete()
        Mechanic.objects.all().delete()
        Office.objects.all().delete()

    def _create_offices(self, fake, count):
        offices = []

        for _ in range(count):
            city = fake.city()
            offices.append(
                Office(
                    name=f"{city} Office",
                    city=city,
                )
            )

        return Office.objects.bulk_create(offices)

    def _create_mechanics(self, fake, count):
        mechanics = [
            Mechanic(
                name=fake.name(),
                certification_number=f"CERT-{index:05d}",
                active=fake.boolean(chance_of_getting_true=90),
            )
            for index in range(1, count + 1)
        ]
        return Mechanic.objects.bulk_create(mechanics)

    def _create_vehicles(self, fake, count, offices):
        makes_and_models = [
            ("Chevrolet", "Silverado"),
            ("Ford", "Transit"),
            ("Honda", "Civic"),
            ("Toyota", "Corolla"),
            ("Volkswagen", "Transporter"),
        ]
        current_year = timezone.localdate().year
        vehicles = []

        for index in range(1, count + 1):
            make, model = fake.random_element(makes_and_models)
            vehicles.append(
                Vehicle(
                    vin=f"SEEDVIN{index:010d}",
                    license_plate=f"SEED-{index:05d}",
                    make=make,
                    model=model,
                    year=fake.random_int(min=2000, max=current_year),
                    office=fake.random_element(offices),
                    active=fake.boolean(chance_of_getting_true=85),
                )
            )

        return Vehicle.objects.bulk_create(vehicles)

    def _create_maintenance_records(self, fake, count, vehicles, mechanics):
        maintenance_types = [
            "Brake service",
            "Engine repair",
            "Inspection",
            "Oil change",
            "Tire replacement",
        ]
        today = timezone.localdate()
        maintenance_vehicles = vehicles[: max(1, int(len(vehicles) * 0.8))]
        records = [
            MaintenanceRecord(
                vehicle=fake.random_element(maintenance_vehicles),
                mechanic=fake.random_element(mechanics),
                maintenance_date=fake.date_between(
                    start_date=today - timedelta(days=365 * 5),
                    end_date=today,
                ),
                maintenance_type=fake.random_element(maintenance_types),
                cost=Decimal(fake.random_int(min=2500, max=500000)) / Decimal("100"),
                notes=fake.sentence(),
            )
            for _ in range(count)
        ]
        return MaintenanceRecord.objects.bulk_create(records)
