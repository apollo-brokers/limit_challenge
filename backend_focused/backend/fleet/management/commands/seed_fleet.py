from datetime import timedelta
from decimal import Decimal
import random

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from faker import Faker

from fleet.models import MaintenanceRecord, Mechanic, Office, Vehicle


OFFICES = [
    ("New York", "New York"),
    ("Chicago Hub", "Chicago"),
    ("Dallas Yard", "Dallas"),
    ("Seattle Depot", "Seattle"),
    ("Miami Fleet", "Miami"),
]

MAKES_MODELS = [
    ("Toyota", ["Camry", "Corolla", "Hilux"]),
    ("Ford", ["F-150", "Transit", "Explorer"]),
    ("Chevrolet", ["Silverado", "Malibu", "Express"]),
    ("Honda", ["Civic", "Accord", "CR-V"]),
    ("Ram", ["1500", "ProMaster"]),
]

MAINTENANCE_TYPES = [
    "Oil Change",
    "Brake Service",
    "Tire Rotation",
    "Inspection",
    "Engine Repair",
    "Transmission Service",
    "Battery Replacement",
]


class Command(BaseCommand):
    help = "Populate the database with realistic fleet dummy data."

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear existing fleet data before seeding.",
        )
        parser.add_argument(
            "--vehicles",
            type=int,
            default=40,
            help="Number of vehicles to create (default: 40).",
        )
        parser.add_argument(
            "--mechanics",
            type=int,
            default=12,
            help="Number of mechanics to create (default: 12).",
        )
        parser.add_argument(
            "--seed",
            type=int,
            default=42,
            help="Random seed for reproducible data (default: 42).",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        fake = Faker()
        Faker.seed(options["seed"])
        random.seed(options["seed"])

        if options["clear"]:
            self.stdout.write("Clearing existing fleet data...")
            MaintenanceRecord.objects.all().delete()
            Vehicle.objects.all().delete()
            Mechanic.objects.all().delete()
            Office.objects.all().delete()

        offices = []
        for name, city in OFFICES:
            office, _ = Office.objects.get_or_create(name=name, city=city)
            offices.append(office)
        self.stdout.write(f"Offices: {len(offices)}")

        mechanics = []
        for i in range(options["mechanics"]):
            mechanic, _ = Mechanic.objects.get_or_create(
                certification_number=f"CERT-{1000 + i}",
                defaults={
                    "name": fake.name(),
                    "is_active": random.random() > 0.1,
                },
            )
            mechanics.append(mechanic)
        self.stdout.write(f"Mechanics: {len(mechanics)}")

        today = timezone.localdate()
        vehicles = []
        used_plates = set(
            Vehicle.objects.filter(is_active=True).values_list(
                "license_plate", flat=True
            )
        )
        used_vins = set(Vehicle.objects.values_list("vin", flat=True))

        target = options["vehicles"]
        created = 0
        attempts = 0
        while created < target and attempts < target * 20:
            attempts += 1
            make, models = random.choice(MAKES_MODELS)
            model = random.choice(models)
            vin = fake.unique.bothify(text="1??????????????").upper()
            plate = fake.unique.bothify(text="???-####").upper()
            if vin in used_vins or (plate in used_plates):
                continue

            is_active = random.random() > 0.15
            vehicle = Vehicle.objects.create(
                vin=vin,
                license_plate=plate,
                make=make,
                model=model,
                year=random.randint(2014, 2025),
                office=random.choice(offices),
                is_active=is_active,
            )
            used_vins.add(vin)
            if is_active:
                used_plates.add(plate)
            vehicles.append(vehicle)
            created += 1

        self.stdout.write(f"Vehicles: {len(vehicles)}")

        # Ensure a few never-maintained active vehicles and a few overdue ones.
        record_count = 0
        for idx, vehicle in enumerate(vehicles):
            if not vehicle.is_active:
                continue

            # ~15% never maintained
            if idx % 7 == 0:
                continue

            if idx % 5 == 0:
                # Overdue: last maintenance > 365 days ago
                dates = [
                    today - timedelta(days=random.randint(400, 900))
                    for _ in range(random.randint(1, 3))
                ]
            else:
                dates = [
                    today - timedelta(days=random.randint(0, 340))
                    for _ in range(random.randint(1, 8))
                ]
                # Add a couple of older historical records
                dates.extend(
                    today - timedelta(days=random.randint(400, 1200))
                    for _ in range(random.randint(0, 3))
                )

            for maint_date in sorted(set(dates)):
                MaintenanceRecord.objects.create(
                    vehicle=vehicle,
                    mechanic=random.choice(mechanics),
                    maintenance_date=maint_date,
                    maintenance_type=random.choice(MAINTENANCE_TYPES),
                    cost=Decimal(str(round(random.uniform(40, 1800), 2))),
                    notes=fake.sentence(),
                )
                record_count += 1

        # Dedicated heavy-history vehicle for details performance smoke testing.
        heavy, heavy_created = Vehicle.objects.get_or_create(
            vin="HEAVYHISTORYVIN001",
            defaults={
                "license_plate": "HVY-0001",
                "make": "Ford",
                "model": "Transit",
                "year": 2020,
                "office": random.choice(offices),
                "is_active": True,
            },
        )
        if heavy_created:
            for i in range(120):
                MaintenanceRecord.objects.create(
                    vehicle=heavy,
                    mechanic=random.choice(mechanics),
                    maintenance_date=today - timedelta(days=i * 3),
                    maintenance_type=random.choice(MAINTENANCE_TYPES),
                    cost=Decimal(str(round(random.uniform(50, 500), 2))),
                    notes=f"Bulk seed record {i}",
                )
                record_count += 1

        self.stdout.write(f"Maintenance records: {record_count}")
        self.stdout.write(self.style.SUCCESS("Seed complete."))
