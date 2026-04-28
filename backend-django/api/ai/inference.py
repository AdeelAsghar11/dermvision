import numpy as np
from PIL import Image
from .model import model, CLASS_ORDER, RISK_MAP


def preprocess_image(image_path):
    img = Image.open(image_path).convert('RGB')
    img = img.resize((224, 224))
    arr = np.array(img, dtype=np.float32) / 255.0
    return np.expand_dims(arr, axis=0)


def predict_lesion(image_path):
    if model is None:
        return {'error': 'Model not loaded'}

    image_array = preprocess_image(image_path)
    input_name = model.get_inputs()[0].name
    predictions = model.run(None, {input_name: image_array})[0][0]

    idx = int(np.argmax(predictions))
    lesion_type = CLASS_ORDER[idx]
    confidence = round(float(predictions[idx]), 4)
    risk_level = RISK_MAP[lesion_type]
    all_predictions = {CLASS_ORDER[i]: round(float(predictions[i]), 4) for i in range(7)}

    return {
        'lesion_type': lesion_type,
        'confidence': confidence,
        'risk_level': risk_level,
        'all_predictions': all_predictions,
    }
