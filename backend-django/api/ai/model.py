import onnxruntime as ort
import os
import json

CLASS_ORDER = [
    'Actinic keratosis',
    'Basal cell carcinoma',
    'Benign keratosis',
    'Dermatofibroma',
    'Melanocytic nevi',
    'Melanoma',
    'Vascular lesion',
]

RISK_MAP = {
    'Melanoma': 'high',
    'Basal cell carcinoma': 'high',
    'Actinic keratosis': 'medium',
    'Dermatofibroma': 'medium',
    'Melanocytic nevi': 'low',
    'Benign keratosis': 'low',
    'Vascular lesion': 'low',
}

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'visualderm_model.onnx')


def load_model():
    if os.path.exists(MODEL_PATH):
        session = ort.InferenceSession(MODEL_PATH)
        print("ONNX model loaded successfully")
        return session
    print("Model file not found")
    return None


model = load_model()
