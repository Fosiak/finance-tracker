from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView

from users.serializers.auth import (
    RegisterSerializer,
    SecureTokenObtainPairSerializer,
)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    throttle_scope = "register"


class SecureLoginView(TokenObtainPairView):
    serializer_class = SecureTokenObtainPairSerializer
    permission_classes = [AllowAny]
    throttle_scope = "login"
