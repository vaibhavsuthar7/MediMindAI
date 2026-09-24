import os
import io
import json
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

_bodypart_classes = None
_bodypart_model = None
_region_models = {}
_region_classes = {}

def load_model(weights_path: str, num_classes: int):
    model = models.resnet18(weights=None)
    model.fc = nn.Linear(model.fc.in_features, num_classes)
    model.load_state_dict(torch.load(weights_path, map_location=device))
    model.to(device)
    model.eval()
    return model

def _init_models():
    global _bodypart_classes, _bodypart_model, _region_models, _region_classes
    if _bodypart_model is not None:
        return

    bp_classes_path = os.path.join(BASE_DIR, "bodypart_classes.json")
    bp_model_path = os.path.join(BASE_DIR, "bodypart_classifier.pth")

    if not os.path.exists(bp_classes_path) or not os.path.exists(bp_model_path):
        raise FileNotFoundError(f"Bodypart classifier files missing in {BASE_DIR}")

    with open(bp_classes_path, "r") as f:
        _bodypart_classes = json.load(f)

    _bodypart_model = load_model(bp_model_path, len(_bodypart_classes))

def _get_region_model(reg: str):
    global _region_models, _region_classes
    if reg in _region_models:
        return _region_models[reg], _region_classes[reg]

    cls_path = os.path.join(BASE_DIR, f"{reg}_classes.json")
    mdl_path = os.path.join(BASE_DIR, f"{reg}_model.pth")
    if os.path.exists(cls_path) and os.path.exists(mdl_path):
        with open(cls_path, "r") as f:
            _region_classes[reg] = json.load(f)
        _region_models[reg] = load_model(mdl_path, len(_region_classes[reg]))
        return _region_models[reg], _region_classes[reg]
    return None, None

def load_image_from_bytes(image_bytes: bytes) -> Image.Image:
    # 1. Try standard PIL decode
    try:
        return Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception:
        pass

    # 2. Try DICOM decode via pydicom
    try:
        import pydicom
        import numpy as np
        ds = pydicom.dcmread(io.BytesIO(image_bytes), force=True)
        if hasattr(ds, "pixel_array"):
            arr = ds.pixel_array.astype(np.float32)
            arr_min = arr.min()
            arr_max = arr.max()
            if arr_max > arr_min:
                normalized = ((arr - arr_min) / (arr_max - arr_min) * 255.0).astype(np.uint8)
            else:
                normalized = arr.astype(np.uint8)
            return Image.fromarray(normalized).convert("RGB")
        else:
            raise ValueError("DICOM file contains metadata but no pixel_array.")
    except Exception as dcm_err:
        raise ValueError(f"Failed to parse image/DICOM file: {dcm_err}")


def predict(image_bytes: bytes) -> dict:
    _init_models()

    img = load_image_from_bytes(image_bytes)
    tensor = transform(img).unsqueeze(0).to(device)

    # Stage 1: Body Part Classifier
    with torch.no_grad():
        out = _bodypart_model(tensor)
        probs = torch.softmax(out, dim=1)[0]
        idx = torch.argmax(probs).item()
        body_part = _bodypart_classes[idx]
        bodypart_confidence = probs[idx].item()

    # Stage 2: Region Diagnosis
    diag_model, classes = _get_region_model(body_part)
    if diag_model is None or not classes:
        raise ValueError(f"No diagnosis model loaded for body part: {body_part}")

    with torch.no_grad():
        out = diag_model(tensor)
        probs = torch.softmax(out, dim=1)[0]
        idx = torch.argmax(probs).item()
        diagnosis = classes[idx]
        diagnosis_confidence = probs[idx].item()

    return {
        "body_part": body_part,
        "body_part_confidence": round(float(bodypart_confidence), 4),
        "diagnosis": diagnosis,
        "diagnosis_confidence": round(float(diagnosis_confidence), 4)
    }
