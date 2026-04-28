import os
from django.conf import settings
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Prediction
from .serializers import PredictionSerializer
from .ai.inference import predict_lesion


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return Response({
                'message': 'Login successful',
                'username': user.username,
                'user_id': user.id,
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email', '')

        if not username or not password:
            return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already taken.'}, status=status.HTTP_400_BAD_REQUEST)

        User.objects.create_user(username=username, password=password, email=email)
        return Response({'message': 'User registered successfully.'}, status=status.HTTP_201_CREATED)


class PredictionView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        image_file = request.FILES.get('image')
        if not image_file:
            return Response({'error': 'No image file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads')
        os.makedirs(upload_dir, exist_ok=True)

        file_path = os.path.join(upload_dir, image_file.name)
        with open(file_path, 'wb+') as dest:
            for chunk in image_file.chunks():
                dest.write(chunk)

        relative_path = os.path.join('uploads', image_file.name)
        result = predict_lesion(file_path)

        if 'error' in result:
            return Response({'error': result['error']}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        user_id = request.data.get('user_id')
        if user_id:
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

            prediction = Prediction.objects.create(
                user=user,
                image_path=relative_path,
                lesion_type=result['lesion_type'],
                confidence=result['confidence'],
                risk_level=result['risk_level'],
            )
            serializer = PredictionSerializer(prediction)
            response_data = serializer.data
            response_data['all_predictions'] = result.get('all_predictions', {})
            return Response(response_data, status=status.HTTP_201_CREATED)

        return Response(result, status=status.HTTP_200_OK)


class HistoryView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user_id = request.query_params.get('user_id')
        if user_id:
            predictions = Prediction.objects.filter(user_id=user_id).order_by('-created_at')
        else:
            predictions = Prediction.objects.none()
        serializer = PredictionSerializer(predictions, many=True)
        return Response(serializer.data)
