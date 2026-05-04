from django.db import models
from django.contrib.auth.models import User

class Student(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    study_hours = models.FloatField()
    attendance = models.FloatField()
    previous_grade = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Prediction(models.Model):
    RESULT_CHOICES = [
        ('Pass', 'Pass'),
        ('Fail', 'Fail'),
    ]
    student = models.OneToOneField(Student, on_delete=models.CASCADE)
    result = models.CharField(max_length=10, choices=RESULT_CHOICES)
    confidence = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.name} - {self.result}"

# Create your models here.
