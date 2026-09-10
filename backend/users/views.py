from rest_framework import generics
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
)
from rest_framework_simplejwt.views import TokenObtainPairView

from .auth_serializers import (
    SecureTokenObtainPairSerializer,
)
from .serializers import (
    RegisterSerializer,
    ProfileSerializer,
)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    throttle_scope = "register"


class SecureLoginView(TokenObtainPairView):
    serializer_class = SecureTokenObtainPairSerializer
    permission_classes = [AllowAny]
    throttle_scope = "login"


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user