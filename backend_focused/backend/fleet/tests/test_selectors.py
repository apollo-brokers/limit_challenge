from datetime import date, timedelta
from decimal import Decimal

from django.test import SimpleTestCase, TestCase

from fleet import selectors
from fleet.models import (
    MaintenanceRecord,
    MaintenanceType,
    Mechanic,
    Office,
    Vehicle,
    VehicleMake,
    VehicleModel,
)

TODAY = date(2026, 9, 26)


class SelectorTestCase(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.office = Office.objects.create(name="Calgary", city="Calgary")
        cls.mechanic = Mechanic.objects.create(
            name="Alex Rivera",
            certification_number="CERT-001",
        )
        cls.maintenance_type = MaintenanceType.objects.create(name="Oil Change")
        cls.ford = VehicleMake.objects.create(name="Ford")
        cls.transit = VehicleModel.objects.create(make=cls.ford, name="Transit")

    def create_vehicle(
        self,
        license_plate,
        *,
        vin=None,
        office=None,
        active=True,
        model=None,
    ):
        return Vehicle.objects.create(
            vin=vin or f"VIN-{license_plate}",
            license_plate=license_plate,
            model=model or self.transit,
            year=2022,
            office=office or self.office,
            active=active,
        )

    def create_record(self, vehicle, performed_on, *, cost="100.00", mechanic=None):
        return MaintenanceRecord.objects.create(
            vehicle=vehicle,
            mechanic=mechanic or self.mechanic,
            type=self.maintenance_type,
            performed_on=performed_on,
            cost=Decimal(cost),
        )


class OneYearBeforeTests(SimpleTestCase):
    def test_returns_same_calendar_date_one_year_earlier(self):
        self.assertEqual(selectors.one_year_before(date(2026, 9, 26)), date(2025, 9, 26))

    def test_leap_day_maps_to_february_28(self):
        self.assertEqual(selectors.one_year_before(date(2028, 2, 29)), date(2027, 2, 28))


class OfficeSummaryTests(SelectorTestCase):
    def summary(self, office, today=TODAY):
        return selectors.office_summaries(today=today).get(pk=office.pk)

    def test_active_vehicles_are_counted_once_despite_many_records(self):
        for license_plate, active in (
            ("AB-1001", True),
            ("AB-1002", True),
            ("AB-1003", False),
        ):
            vehicle = self.create_vehicle(license_plate, active=active)
            for days_ago in (10, 20, 30):
                self.create_record(vehicle, TODAY - timedelta(days=days_ago))

        office = self.summary(self.office)

        self.assertEqual(office.active_vehicle_count, 2)
        # Inactive vehicle records still count toward cost and last date.
        self.assertEqual(office.maintenance_cost_last_year, Decimal("900.00"))
        self.assertEqual(office.last_maintenance, TODAY - timedelta(days=10))

    def test_cost_window_is_inclusive_at_both_ends(self):
        vehicle = self.create_vehicle("AB-1001")
        self.create_record(vehicle, date(2025, 9, 25), cost="1.00")
        self.create_record(vehicle, date(2025, 9, 26), cost="10.00")
        self.create_record(vehicle, date(2026, 9, 26), cost="100.00")
        self.create_record(vehicle, date(2026, 9, 27), cost="1000.00")

        office = self.summary(self.office)

        self.assertEqual(office.maintenance_cost_last_year, Decimal("110.00"))
        self.assertEqual(office.last_maintenance, date(2026, 9, 26))

    def test_leap_day_window_starts_on_february_28(self):
        vehicle = self.create_vehicle("AB-1001")
        self.create_record(vehicle, date(2027, 2, 27), cost="1.00")
        self.create_record(vehicle, date(2027, 2, 28), cost="10.00")

        office = self.summary(self.office, today=date(2028, 2, 29))

        self.assertEqual(office.maintenance_cost_last_year, Decimal("10.00"))

    def test_records_outside_window_still_set_last_maintenance(self):
        vehicle = self.create_vehicle("AB-1001")
        self.create_record(vehicle, date(2024, 5, 1))

        office = self.summary(self.office)

        self.assertEqual(office.maintenance_cost_last_year, Decimal("0.00"))
        self.assertEqual(office.last_maintenance, date(2024, 5, 1))

    def test_office_without_vehicles_has_empty_totals(self):
        empty_office = Office.objects.create(name="Edmonton", city="Edmonton")

        office = self.summary(empty_office)

        self.assertEqual(office.active_vehicle_count, 0)
        self.assertEqual(office.maintenance_cost_last_year, Decimal("0.00"))
        self.assertIsNone(office.last_maintenance)

    def test_offices_are_ordered_by_name(self):
        Office.objects.create(name="Airdrie", city="Airdrie")

        names = [office.name for office in selectors.office_summaries(today=TODAY)]

        self.assertEqual(names, ["Airdrie", "Calgary"])


class MechanicWorkloadTests(SelectorTestCase):
    def workload(self, today=TODAY):
        return list(selectors.mechanic_workload(today=today))

    def test_counts_records_from_january_first_to_today(self):
        vehicle = self.create_vehicle("AB-1001")
        self.create_record(vehicle, date(2025, 12, 31), cost="1.00")
        self.create_record(vehicle, date(2026, 1, 1), cost="10.00")
        self.create_record(vehicle, date(2026, 9, 26), cost="100.00")
        self.create_record(vehicle, date(2026, 9, 27), cost="1000.00")

        [mechanic] = self.workload()

        self.assertEqual(mechanic.maintenance_count, 2)
        self.assertEqual(mechanic.total_cost, Decimal("110.00"))

    def test_includes_inactive_and_idle_mechanics(self):
        inactive = Mechanic.objects.create(
            name="Blair Stone",
            certification_number="CERT-002",
            active=False,
        )
        vehicle = self.create_vehicle("AB-1001")
        self.create_record(vehicle, date(2026, 3, 1), mechanic=inactive)

        rows = {
            mechanic.name: (mechanic.maintenance_count, mechanic.total_cost)
            for mechanic in self.workload()
        }

        self.assertEqual(
            rows,
            {
                "Blair Stone": (1, Decimal("100.00")),
                "Alex Rivera": (0, Decimal("0.00")),
            },
        )

    def test_orders_busiest_first_then_cost_then_name(self):
        vehicle = self.create_vehicle("AB-1001")
        busy = Mechanic.objects.create(name="Zoe Park", certification_number="CERT-002")
        pricey = Mechanic.objects.create(name="Yan Cole", certification_number="CERT-003")
        second = Mechanic.objects.create(name="Bea Moss", certification_number="CERT-004")
        first = Mechanic.objects.create(name="Abe Moss", certification_number="CERT-005")
        for _ in range(2):
            self.create_record(vehicle, date(2026, 5, 1), mechanic=busy, cost="10.00")
        self.create_record(vehicle, date(2026, 5, 1), mechanic=pricey, cost="500.00")
        self.create_record(vehicle, date(2026, 5, 1), mechanic=second, cost="50.00")
        self.create_record(vehicle, date(2026, 5, 1), mechanic=first, cost="50.00")

        names = [mechanic.name for mechanic in self.workload()]

        self.assertEqual(
            names,
            ["Zoe Park", "Yan Cole", "Abe Moss", "Bea Moss", "Alex Rivera"],
        )


class FilterVehiclesTests(SelectorTestCase):
    def search(self, **filters):
        return list(selectors.filter_vehicles(Vehicle.objects.order_by("id"), **filters))

    def test_no_filters_returns_every_vehicle(self):
        vehicles = [self.create_vehicle("AB-1001"), self.create_vehicle("AB-1002", active=False)]

        self.assertEqual(self.search(), vehicles)

    def test_filters_by_office_and_active(self):
        other_office = Office.objects.create(name="Edmonton", city="Edmonton")
        calgary_active = self.create_vehicle("AB-1001")
        calgary_inactive = self.create_vehicle("AB-1002", active=False)
        edmonton_active = self.create_vehicle("AB-1003", office=other_office)

        self.assertEqual(self.search(office=other_office), [edmonton_active])
        self.assertEqual(self.search(active=False), [calgary_inactive])
        self.assertEqual(self.search(office=self.office, active=True), [calgary_active])

    def test_make_matches_through_the_vehicle_model(self):
        ram = VehicleMake.objects.create(name="Ram")
        connect = VehicleModel.objects.create(make=self.ford, name="Transit Connect")
        ram_transit = VehicleModel.objects.create(make=ram, name="Transit")
        transit = self.create_vehicle("AB-1001")
        transit_connect = self.create_vehicle("AB-1002", model=connect)
        other_make = self.create_vehicle("AB-1003", model=ram_transit)

        self.assertEqual(self.search(make=self.ford), [transit, transit_connect])
        self.assertEqual(self.search(make=ram), [other_make])

    def test_model_matches_the_model_row_not_its_name(self):
        ram = VehicleMake.objects.create(name="Ram")
        ram_transit = VehicleModel.objects.create(make=ram, name="Transit")
        transit = self.create_vehicle("AB-1001")
        self.create_vehicle("AB-1002", model=ram_transit)

        self.assertEqual(self.search(model=self.transit), [transit])
        self.assertEqual(self.search(make=self.ford, model=self.transit), [transit])
        self.assertEqual(self.search(make=ram, model=self.transit), [])

    def test_maintenance_dates_are_inclusive(self):
        self.create_vehicle("AB-1000")  # never maintained, never matches
        before = self.create_vehicle("AB-1001")
        first = self.create_vehicle("AB-1002")
        last = self.create_vehicle("AB-1003")
        after = self.create_vehicle("AB-1004")
        self.create_record(before, date(2026, 3, 31))
        self.create_record(first, date(2026, 4, 1))
        self.create_record(last, date(2026, 4, 30))
        self.create_record(after, date(2026, 5, 1))

        self.assertEqual(
            self.search(maintained_from=date(2026, 4, 1), maintained_to=date(2026, 4, 30)),
            [first, last],
        )
        self.assertEqual(self.search(maintained_from=date(2026, 4, 30)), [last, after])
        self.assertEqual(self.search(maintained_to=date(2026, 4, 1)), [before, first])

    def test_date_range_and_mechanic_must_match_the_same_record(self):
        other_mechanic = Mechanic.objects.create(name="Sam Lee", certification_number="CERT-002")
        split = self.create_vehicle("AB-1001")
        self.create_record(split, date(2026, 4, 10), mechanic=self.mechanic)
        self.create_record(split, date(2026, 6, 10), mechanic=other_mechanic)
        same = self.create_vehicle("AB-1002")
        self.create_record(same, date(2026, 4, 15), mechanic=other_mechanic)

        self.assertEqual(
            self.search(
                maintained_from=date(2026, 4, 1),
                maintained_to=date(2026, 4, 30),
                mechanic_certification="CERT-002",
            ),
            [same],
        )

    def test_vehicle_with_many_matching_records_appears_once(self):
        vehicle = self.create_vehicle("AB-1001")
        for day in (1, 2, 3):
            self.create_record(vehicle, date(2026, 4, day))

        queryset = selectors.filter_vehicles(
            Vehicle.objects.order_by("id"),
            maintained_from=date(2026, 4, 1),
            mechanic_certification="CERT-001",
        )

        self.assertEqual(list(queryset), [vehicle])
        self.assertEqual(queryset.count(), 1)

    def test_explicit_date_range_can_match_future_records(self):
        vehicle = self.create_vehicle("AB-1001")
        self.create_record(vehicle, date(2027, 1, 10))

        self.assertEqual(self.search(maintained_from=date(2027, 1, 1)), [vehicle])

    def test_unknown_certification_returns_no_vehicles(self):
        vehicle = self.create_vehicle("AB-1001")
        self.create_record(vehicle, date(2026, 4, 1))

        self.assertEqual(self.search(mechanic_certification="CERT-404"), [])


class VehiclesNeedingMaintenanceTests(SelectorTestCase):
    def due(self, today=TODAY):
        return list(selectors.vehicles_needing_maintenance(today=today))

    def test_loads_office_model_and_make_with_the_vehicles(self):
        self.create_vehicle("AB-1001")
        self.create_vehicle("AB-1002")

        with self.assertNumQueries(1):
            rows = [
                (vehicle.office.name, vehicle.model.name, vehicle.model.make.name)
                for vehicle in self.due()
            ]

        self.assertEqual(rows, [("Calgary", "Transit", "Ford")] * 2)

    def test_never_maintained_active_vehicle_is_due(self):
        vehicle = self.create_vehicle("AB-1001")

        [row] = self.due()

        self.assertEqual(row, vehicle)
        self.assertIsNone(row.last_maintenance)

    def test_inactive_vehicles_are_never_due(self):
        self.create_vehicle("AB-1001", active=False)

        self.assertEqual(self.due(), [])

    def test_365_day_boundary_is_strict(self):
        exactly_365_days = self.create_vehicle("AB-1001")
        self.create_record(exactly_365_days, date(2025, 9, 26))
        days_366 = self.create_vehicle("AB-1002")
        self.create_record(days_366, date(2025, 9, 25))

        self.assertEqual(self.due(), [days_366])

    def test_recent_record_wins_over_old_records(self):
        vehicle = self.create_vehicle("AB-1001")
        self.create_record(vehicle, date(2024, 1, 1))
        self.create_record(vehicle, date(2026, 6, 1))

        self.assertEqual(self.due(), [])

    def test_future_records_are_ignored(self):
        only_future = self.create_vehicle("AB-1001")
        self.create_record(only_future, date(2026, 10, 1))
        old_and_future = self.create_vehicle("AB-1002")
        self.create_record(old_and_future, date(2025, 1, 1))
        self.create_record(old_and_future, date(2026, 12, 1))

        rows = {vehicle.license_plate: vehicle.last_maintenance for vehicle in self.due()}

        self.assertEqual(rows, {"AB-1001": None, "AB-1002": date(2025, 1, 1)})

    def test_orders_never_maintained_first_then_oldest(self):
        stale_recent = self.create_vehicle("AB-1001")
        self.create_record(stale_recent, date(2025, 6, 1))
        never_first = self.create_vehicle("AB-1002")
        stale_oldest = self.create_vehicle("AB-1003")
        self.create_record(stale_oldest, date(2024, 6, 1))
        never_second = self.create_vehicle("AB-1004")

        self.assertEqual(
            self.due(),
            [never_first, never_second, stale_oldest, stale_recent],
        )


class VehicleConflictsTests(SelectorTestCase):
    def test_no_conflicts(self):
        self.create_vehicle("AB-1001")

        self.assertEqual(selectors.vehicle_conflicts(vin="VIN-NEW", license_plate="NEW-1"), [])

    def test_vin_conflicts_with_any_vehicle(self):
        vehicle = self.create_vehicle("AB-1001", active=False)

        self.assertEqual(
            selectors.vehicle_conflicts(vin=vehicle.vin, license_plate="NEW-1"),
            ["vin"],
        )

    def test_plate_conflicts_with_active_vehicle(self):
        self.create_vehicle("AB-1001")

        self.assertEqual(
            selectors.vehicle_conflicts(vin="VIN-NEW", license_plate="AB-1001"),
            ["license_plate"],
        )

    def test_plate_used_only_by_inactive_vehicles_is_not_a_conflict(self):
        self.create_vehicle("AB-1001", active=False)
        self.create_vehicle("AB-1001", vin="VIN-OLD-2", active=False)

        self.assertEqual(selectors.vehicle_conflicts(vin="VIN-NEW", license_plate="AB-1001"), [])

    def test_conflicts_from_different_vehicles_are_reported_in_fixed_order(self):
        by_vin = self.create_vehicle("AB-1001")
        self.create_vehicle("AB-2002")

        self.assertEqual(
            selectors.vehicle_conflicts(vin=by_vin.vin, license_plate="AB-2002"),
            ["vin", "license_plate"],
        )

    def test_matching_is_exact(self):
        self.create_vehicle("AB-1001")

        for vin, license_plate in (("vin-ab-1001", "ab-1001"), (" VIN-AB-1001", "AB-1001 ")):
            with self.subTest(vin=vin, license_plate=license_plate):
                self.assertEqual(
                    selectors.vehicle_conflicts(vin=vin, license_plate=license_plate),
                    [],
                )
