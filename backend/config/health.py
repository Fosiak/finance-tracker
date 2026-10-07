import os
import time

from django.db import connection
from rest_framework.permissions import AllowAny
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

_STARTED_AT = time.monotonic()


class HealthView(APIView):
    """Public liveness probe (Render + portfolio).

    SECURITY: exposes only status, process uptime and a short commit SHA.
    No DB contents, no versions, no user data. No auth, so no cookies or
    CSRF are involved either.
    """

    authentication_classes = []
    permission_classes = [AllowAny]
    renderer_classes = [JSONRenderer]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "health"
    schema = None  # keep out of the public Swagger docs

    def get(self, request):
        try:
            connection.ensure_connection()
        except Exception:
            # never leak the exception text
            return Response({"status": "degraded"}, status=503)

        return Response(
            {
                "status": "ok",
                "uptimeSec": int(time.monotonic() - _STARTED_AT),
                "commit": os.environ.get("RENDER_GIT_COMMIT", "dev")[:7],
            },
            headers={"Cache-Control": "no-store"},
        )
