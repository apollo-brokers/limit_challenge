from django.db.models import ProtectedError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler


def exception_handler(exc, context):
    """Extend DRF's exception handler to map ``ProtectedError`` to 409 Conflict.

    Every other exception keeps the standard DRF behavior.
    """
    response = drf_exception_handler(exc, context)
    if response is None and isinstance(exc, ProtectedError):
        return Response(
            {
                "detail": "This object cannot be deleted because other records reference it."
            },
            status=status.HTTP_409_CONFLICT,
        )
    return response
