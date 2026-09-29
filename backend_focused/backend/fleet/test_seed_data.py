from io import StringIO

import pytest
from django.core.management import call_command
from django.core.management.base import CommandError

from fleet.models import Vehicle
from maintenance.models import MaintenanceRecord, Mechanic
from offices.models import Office


@pytest.mark.django_db
def test_seed_data_creates_requested_records():
    output = StringIO()

    call_command(
        "seed_data",
        offices=2,
        vehicles=5,
        mechanics=3,
        maintenance_records=7,
        seed=123,
        stdout=output,
    )

    assert Office.objects.count() == 2
    assert Vehicle.objects.count() == 5
    assert Mechanic.objects.count() == 3
    assert MaintenanceRecord.objects.count() == 7
    assert Vehicle.objects.values("vin").distinct().count() == 5
    assert Vehicle.objects.values("license_plate").distinct().count() == 5
    assert "Created 2 offices, 5 vehicles, 3 mechanics" in output.getvalue()


@pytest.mark.django_db
def test_seed_data_requires_clear_to_replace_existing_data():
    options = {
        "offices": 1,
        "vehicles": 2,
        "mechanics": 1,
        "maintenance_records": 2,
        "seed": 123,
    }
    call_command("seed_data", **options)

    with pytest.raises(CommandError, match="Fleet data already exists"):
        call_command("seed_data", **options)

    call_command(
        "seed_data",
        **options,
        clear=True,
    )

    assert Office.objects.count() == 1
    assert Vehicle.objects.count() == 2
    assert Mechanic.objects.count() == 1
    assert MaintenanceRecord.objects.count() == 2
