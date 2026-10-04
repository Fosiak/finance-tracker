from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie

from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class CsrfTokenView(APIView):
    """
    The frontend hits this once (e.g. on app boot) so Django sets the
    readable `csrftoken` cookie. The frontend then echoes its value
    back in the X-CSRFToken header on unsafe requests.
    """

    permission_classes = [AllowAny]

    @method_decorator(ensure_csrf_cookie)
    def get(self, request):
        return Response({"detail": "CSRF cookie set."})
