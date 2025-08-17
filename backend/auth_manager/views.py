from datetime import timedelta
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from rest_framework.decorators import action
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from django.core.mail import send_mail
from django.conf import settings
import random

OTP_STORE = {}

class AuthViewSet(ViewSet):

    @action(detail=False, methods=["post"])
    def register(self, request):
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")

        if User.objects.filter(username=username).exists():
            return Response({"meta": {"message": "Username already exists", "status_code": 400}}, status=400)
        if User.objects.filter(email=email).exists():
            return Response({"meta": {"message": "Email already exists", "status_code": 400}}, status=400)

        user = User.objects.create_user(username=username, email=email, password=password, is_active=False)
        token = default_token_generator.make_token(user)
        verification_link = f"{settings.BACKEND_URL}/auth/verify_email/?uid={user.id}&token={token}"

        send_mail(
            "Verify Your Email",
            f"Hi {username},\n\nClick the link below to verify your email:\n{verification_link}\n\nThank you!",
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )

        return Response({"meta": {"message": "User registered successfully. Please verify your email."}})

    @action(detail=False, methods=["get"])
    def verify_email(self, request):
        uid = request.query_params.get("uid")
        token = request.query_params.get("token")

        try:
            user = User.objects.get(id=uid)
        except User.DoesNotExist:
            return Response({"meta": {"message": "Invalid user"}}, status=400)

        if default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            return Response({"meta": {"message": "Email verified successfully. You can now log in."}})
        else:
            return Response({"meta": {"message": "Invalid or expired token"}}, status=400)

    @action(detail=False, methods=["post"])
    def login(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)
        if not user:
            return Response({"meta": {"message": "Invalid credentials", "status_code": 400}}, status=400)
        if not user.is_active:
            return Response({"meta": {"message": "Email not verified. Please verify your email first."}}, status=400)

        otp = random.randint(100000, 999999)
        OTP_STORE[username] = otp

        send_mail(
            "Your Login OTP",
            f"Hi {user.username},\n\nYour OTP for login is: {otp}\n\nIt is valid for 5 minutes.",
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )

        return Response({"meta": {"message": "OTP sent to your email. Enter OTP to complete login."}})

    @action(detail=False, methods=["post"])
    def verify_otp(self, request):
        username = request.data.get("username")
        otp_code = request.data.get("otp")

        if username not in OTP_STORE or str(OTP_STORE[username]) != str(otp_code):
            return Response({"meta": {"message": "Invalid or expired OTP"}}, status=400)

        user = User.objects.get(username=username)
        refresh = RefreshToken.for_user(user)
        access = AccessToken.for_user(user)
        access.set_exp(lifetime=timedelta(hours=10))

        del OTP_STORE[username]

        return Response({
            "message": "Login successful",
            "data": {
                "name": user.username,
                "access": str(access),
                "refresh": str(refresh),
            },
        })

