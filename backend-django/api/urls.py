from django.urls import path
from .views import LoginView, RegisterView, PredictionView, HistoryView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('predict/', PredictionView.as_view(), name='predict'),
    path('history/', HistoryView.as_view(), name='history'),
]
