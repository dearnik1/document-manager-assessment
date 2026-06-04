from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from propylon_document_manager.file_versions.models import User


class SignUpView(APIView):
    """Create a new user account and return an auth token."""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip()
        password = request.data.get("password", "")
        password_confirm = request.data.get("password_confirm", "")

        # Validation
        errors = {}
        if not email:
            errors["email"] = ["This field is required."]
        if not password:
            errors["password"] = ["This field is required."]
        if not password_confirm:
            errors["password_confirm"] = ["This field is required."]
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        if password != password_confirm:
            return Response(
                {"password_confirm": ["Passwords do not match."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(password) < 8:
            return Response(
                {"password": ["Password must be at least 8 characters."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {"email": ["A user with this email already exists."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.create_user(email=email, password=password)
        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {"token": token.key, "email": user.email},
            status=status.HTTP_201_CREATED,
        )


class DeleteAccountView(APIView):
    """Delete the currently authenticated user's account."""
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        request.user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
