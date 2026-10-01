from datetime import date
from decimal import Decimal

from django.db import IntegrityError, transaction
from django.db.models.deletion import ProtectedError
from django.test import TestCase

from fleet.models import (
    MaintenanceRecord,
    MaintenanceType,
    Mechanic,
    Office,
    Vehicle,
    VehicleMake,
    VehicleModel,
)


class FleetModelTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.office = Office.objects.create(name="Calgary", city="Calgary")
        cls.other_office = Office.objects.create(name="Edmonton", city="Edmonton")
        cls.mechanic = Mechanic.objects.create(
            name="Alex Rivera",
            certification_number="CERT-001",
        )
        cls.maintenance_type = MaintenanceType.objects.create(name="Oil Change")
        cls.make = VehicleMake.objects.create(name="Ford")
        cls.vehicle_model = VehicleModel.objects.create(make=cls.make, name="Transit")

    def create_vehicle(self, *, vin, license_plate, office=None, active=True):
        return Vehicle.objects.create(
            vin=vin,
            license_plate=license_plate,
            model=self.vehicle_model,
            year=2022,
            office=office or self.office,
            active=active,
        )

    def create_maintenance_record(
        self,
        *,
        vehicle,
        mechanic=None,
        maintenance_type=None,
        performed_on=date(2026, 1, 1),
        cost=Decimal("125.50"),
    ):
        return MaintenanceRecord.objects.create(
            vehicle=vehicle,
            mechanic=mechanic or self.mechanic,
            type=maintenance_type or self.maintenance_type,
            performed_on=performed_on,
            cost=cost,
            notes="Routine service",
        )

    def test_maintenance_type_is_persisted(self):
        maintenance_type = MaintenanceType.objects.get(name="Oil Change")

        self.assertEqual(maintenance_type, self.maintenance_type)

    def test_duplicate_maintenance_type_name_is_rejected_by_the_database(self):
        with self.assertRaises(IntegrityError), transaction.atomic():
            MaintenanceType.objects.create(name="Oil Change")

    def test_duplicate_vehicle_make_name_is_rejected_by_the_database(self):
        with self.assertRaises(IntegrityError), transaction.atomic():
            VehicleMake.objects.create(name="Ford")

    def test_vehicle_model_belongs_to_one_make(self):
        f150 = VehicleModel.objects.create(make=self.make, name="F-150")

        self.assertEqual(f150.make, self.make)
        self.assertEqual(
            list(self.make.models.order_by("name")),
            [f150, self.vehicle_model],
        )

    def test_duplicate_model_name_within_a_make_is_rejected_by_the_database(self):
        with self.assertRaises(IntegrityError), transaction.atomic():
            VehicleModel.objects.create(make=self.make, name="Transit")

    def test_same_model_name_may_exist_under_different_makes(self):
        other_make = VehicleMake.objects.create(name="Ram")

        other_transit = VehicleModel.objects.create(make=other_make, name="Transit")

        self.assertEqual(
            VehicleModel.objects.filter(name="Transit").count(),
            2,
        )
        self.assertNotEqual(other_transit.make, self.vehicle_model.make)

    def test_vehicle_references_a_model_and_derives_its_make_from_it(self):
        vehicle = self.create_vehicle(vin="1FTBR1C80NKA00016", license_plate="AB-9005")

        self.assertEqual(vehicle.model, self.vehicle_model)
        self.assertEqual(vehicle.model.make, self.make)
        self.assertEqual(list(self.vehicle_model.vehicles.all()), [vehicle])
        self.assertNotIn(
            "make",
            [field.name for field in Vehicle._meta.get_fields()],
        )

    def test_duplicate_certification_number_is_rejected_by_the_database(self):
        with self.assertRaises(IntegrityError), transaction.atomic():
            Mechanic.objects.create(name="Sam Lee", certification_number="CERT-001")

    def test_duplicate_vin_is_rejected_by_the_database(self):
        self.create_vehicle(vin="1FTBR1C80NKA00001", license_plate="AB-1001")

        with self.assertRaises(IntegrityError), transaction.atomic():
            self.create_vehicle(vin="1FTBR1C80NKA00001", license_plate="AB-1002")

    def test_two_active_vehicles_cannot_share_a_license_plate(self):
        self.create_vehicle(vin="1FTBR1C80NKA00002", license_plate="AB-2001")

        with self.assertRaises(IntegrityError), transaction.atomic():
            self.create_vehicle(vin="1FTBR1C80NKA00003", license_plate="AB-2001")

    def test_inactive_vehicles_can_reuse_a_license_plate(self):
        active_vehicle = self.create_vehicle(
            vin="1FTBR1C80NKA00004",
            license_plate="AB-3001",
        )
        first_inactive_vehicle = self.create_vehicle(
            vin="1FTBR1C80NKA00005",
            license_plate="AB-3001",
            active=False,
        )
        second_inactive_vehicle = self.create_vehicle(
            vin="1FTBR1C80NKA00006",
            license_plate="AB-3001",
            active=False,
        )

        self.assertEqual(
            Vehicle.objects.filter(license_plate="AB-3001").count(),
            3,
        )
        self.assertTrue(active_vehicle.active)
        self.assertFalse(first_inactive_vehicle.active)
        self.assertFalse(second_inactive_vehicle.active)

    def test_direct_relationships_expose_expected_reverse_collections(self):
        vehicle = self.create_vehicle(
            vin="1FTBR1C80NKA00007",
            license_plate="AB-4001",
            office=self.other_office,
        )
        record = self.create_maintenance_record(vehicle=vehicle)

        self.assertEqual(list(self.other_office.vehicles.all()), [vehicle])
        self.assertEqual(list(vehicle.maintenance_records.all()), [record])
        self.assertEqual(list(self.mechanic.maintenance_records.all()), [record])
        self.assertEqual(record.type, self.maintenance_type)
        self.assertEqual(
            list(self.maintenance_type.maintenance_records.all()),
            [record],
        )

    def test_maintenance_records_default_to_newest_first_with_pk_tiebreaker(self):
        vehicle = self.create_vehicle(
            vin="1FTBR1C80NKA00008",
            license_plate="AB-5001",
        )
        oldest = self.create_maintenance_record(
            vehicle=vehicle,
            performed_on=date(2025, 1, 1),
        )
        first_same_day = self.create_maintenance_record(
            vehicle=vehicle,
            performed_on=date(2026, 1, 1),
        )
        second_same_day = self.create_maintenance_record(
            vehicle=vehicle,
            performed_on=date(2026, 1, 1),
        )

        self.assertEqual(
            list(vehicle.maintenance_records.all()),
            [second_same_day, first_same_day, oldest],
        )

    def test_office_deletion_is_protected_while_a_vehicle_references_it(self):
        self.create_vehicle(vin="1FTBR1C80NKA00009", license_plate="AB-6001")

        with self.assertRaises(ProtectedError):
            self.office.delete()

    def test_mechanic_deletion_is_protected_while_a_record_references_it(self):
        vehicle = self.create_vehicle(
            vin="1FTBR1C80NKA00010",
            license_plate="AB-7001",
        )
        self.create_maintenance_record(vehicle=vehicle)

        with self.assertRaises(ProtectedError):
            self.mechanic.delete()

    def test_maintenance_type_deletion_is_protected_while_a_record_references_it(
        self,
    ):
        vehicle = self.create_vehicle(
            vin="1FTBR1C80NKA00012",
            license_plate="AB-9001",
        )
        self.create_maintenance_record(vehicle=vehicle)

        with self.assertRaises(ProtectedError):
            self.maintenance_type.delete()

    def test_vehicle_make_deletion_is_protected_while_a_model_references_it(self):
        with self.assertRaises(ProtectedError):
            self.make.delete()

    def test_vehicle_model_deletion_is_protected_while_a_vehicle_references_it(self):
        self.create_vehicle(vin="1FTBR1C80NKA00017", license_plate="AB-9006")

        with self.assertRaises(ProtectedError):
            self.vehicle_model.delete()

    def test_vehicle_deletion_cascades_to_maintenance_records(self):
        vehicle = self.create_vehicle(
            vin="1FTBR1C80NKA00011",
            license_plate="AB-8001",
        )
        record = self.create_maintenance_record(vehicle=vehicle)

        vehicle.delete()

        self.assertFalse(MaintenanceRecord.objects.filter(pk=record.pk).exists())

    def test_negative_maintenance_cost_is_rejected_by_the_database(self):
        vehicle = self.create_vehicle(
            vin="1FTBR1C80NKA00014",
            license_plate="AB-9003",
        )

        with self.assertRaises(IntegrityError), transaction.atomic():
            self.create_maintenance_record(vehicle=vehicle, cost=Decimal("-0.01"))

    def test_zero_maintenance_cost_is_allowed(self):
        vehicle = self.create_vehicle(
            vin="1FTBR1C80NKA00015",
            license_plate="AB-9004",
        )

        record = self.create_maintenance_record(vehicle=vehicle, cost=Decimal("0.00"))

        self.assertEqual(record.cost, Decimal("0.00"))

    def test_models_have_concise_domain_string_representations(self):
        vehicle = self.create_vehicle(
            vin="1FTBR1C80NKA00013",
            license_plate="AB-9002",
        )
        record = self.create_maintenance_record(vehicle=vehicle)

        self.assertEqual(str(self.office), "Calgary (Calgary)")
        self.assertEqual(str(self.make), "Ford")
        self.assertEqual(str(self.vehicle_model), "Ford Transit")
        self.assertEqual(str(vehicle), "Ford Transit (AB-9002)")
        self.assertEqual(str(self.mechanic), "Alex Rivera (CERT-001)")
        self.assertEqual(str(self.maintenance_type), "Oil Change")
        self.assertEqual(
            str(record),
            "Ford Transit (AB-9002) - Oil Change on 2026-01-01",
        )

    def test_models_define_the_requested_explicit_indexes(self):
        self.assertEqual(
            [tuple(index.fields) for index in Vehicle._meta.indexes],
            [("office", "active")],
        )
        self.assertEqual(
            [tuple(index.fields) for index in MaintenanceRecord._meta.indexes],
            [
                ("vehicle", "-performed_on", "-id"),
                ("performed_on",),
                ("mechanic", "performed_on"),
            ],
        )
