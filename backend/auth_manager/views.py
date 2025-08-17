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
        is_admin = request.data.get("is_admin", False)
        provided_key = request.data.get("admin_key")

        # If admin registration is requested, validate key
        if is_admin:
            if provided_key != settings.ADMIN_REGISTRATION_KEY:
                return Response(
                    {"meta": {"message": "Unauthorized admin registration", "status_code": 403}},
                    status=403
                )

        # Prevent duplicates
        if User.objects.filter(username=username).exists():
            return Response({"meta": {"message": "Username already exists", "status_code": 400}}, status=400)
        if User.objects.filter(email=email).exists():
            return Response({"meta": {"message": "Email already exists", "status_code": 400}}, status=400)

        # Create user
        user = User.objects.create_user(username=username, email=email, password=password)

        if is_admin:
            user.is_staff = True
            user.is_superuser = True
            user.save()

        return Response({
            "meta": {"message": "User registered successfully."},
            "data": {
                "name": username,
                "email": email,
                "is_admin": is_admin
            }
        })
    
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
        
        refresh = RefreshToken.for_user(user)
        access = AccessToken.for_user(user)
        access.set_exp(lifetime=timedelta(hours=10))
        # if not user.is_active:
        #     return Response({"meta": {"message": "Email not verified. Please verify your email first."}}, status=400)

        # otp = random.randint(100000, 999999)
        # OTP_STORE[username] = otp

        # send_mail(
        #     "Your Login OTP",
        #     f"Hi {user.username},\n\nYour OTP for login is: {otp}\n\nIt is valid for 5 minutes.",
        #     settings.DEFAULT_FROM_EMAIL,
        #     [user.email],
        #     fail_silently=False,
        # )

        return Response({
            "message": "Login successful",
            "data": {
                "name": user.username,
                "access": str(access),
                "refresh": str(refresh),
            },
        })

    # @action(detail=False, methods=["post"])
    # def verify_otp(self, request):
    #     username = request.data.get("username")
    #     otp_code = request.data.get("otp")

    #     if username not in OTP_STORE or str(OTP_STORE[username]) != str(otp_code):
    #         return Response({"meta": {"message": "Invalid or expired OTP"}}, status=400)

    #     user = User.objects.get(username=username)
    #     refresh = RefreshToken.for_user(user)
    #     access = AccessToken.for_user(user)
    #     access.set_exp(lifetime=timedelta(hours=10))

    #     del OTP_STORE[username]

    #     return Response({
    #         "message": "Login successful",
    #         "data": {
    #             "name": user.username,
    #             "access": str(access),
    #             "refresh": str(refresh),
    #         },
    #     })

