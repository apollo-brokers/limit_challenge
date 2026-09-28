from django.db import models


class Office(models.Model):
    name = models.CharField(max_length=255)
    city = models.CharField(max_length=255)

    def __str__(self) -> str:
        return f"{self.name} - {self.city}"
