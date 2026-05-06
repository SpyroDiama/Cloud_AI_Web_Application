import joblib
import numpy as np
import os


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import Student, Prediction
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    StudentSerializer,
    PredictionSerializer
)

# AUTHENTICATION

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    return Response(
        {'error': 'Invalid credentials'},
        status=status.HTTP_401_UNAUTHORIZED
    )


# STUDENTS CRUD 

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_students(request):
    students = Student.objects.filter(user=request.user)
    serializer = StudentSerializer(students, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_student(request):
    serializer = StudentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_student(request, pk):
    try:
        student = Student.objects.get(pk=pk, user=request.user)
    except Student.DoesNotExist:
        return Response(
            {'error': 'Student not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    serializer = StudentSerializer(student)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_student(request, pk):
    try:
        student = Student.objects.get(pk=pk, user=request.user)
    except Student.DoesNotExist:
        return Response(
            {'error': 'Student not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    serializer = StudentSerializer(student, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_student(request, pk):
    try:
        student = Student.objects.get(pk=pk, user=request.user)
    except Student.DoesNotExist:
        return Response(
            {'error': 'Student not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    student.delete()
    return Response(
        {'message': 'Student deleted'},
        status=status.HTTP_204_NO_CONTENT
    )


# AI PREDICTION 

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def predict(request, pk):
    try:
        student = Student.objects.get(pk=pk, user=request.user)
    except Student.DoesNotExist:
        return Response(
            {'error': 'Student not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    try:
        # Load model and scaler
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        model = joblib.load(os.path.join(base_dir, 'ai', 'model.pkl'))
        scaler = joblib.load(os.path.join(base_dir, 'ai', 'scaler.pkl'))

        # Prepare input data
        features = np.array([[
            student.study_hours,
            student.attendance,
            student.previous_grade
        ]])

        # Scale and predict
        features_scaled = scaler.transform(features)
        prediction = model.predict(features_scaled)[0]
        confidence = model.predict_proba(features_scaled)[0].max()

        result = 'Pass' if prediction == 1 else 'Fail'

        # Save prediction to database
        pred_obj, created = Prediction.objects.update_or_create(
            student=student,
            defaults={
                'result': result,
                'confidence': round(confidence, 2)
            }
        )

        return Response({
            'student': student.name,
            'result': result,
            'confidence': round(confidence * 100, 1),
            'study_hours': student.study_hours,
            'attendance': student.attendance,
            'previous_grade': student.previous_grade,
        })

    except Exception as e:
        return Response(
            {'error': f'Prediction failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )