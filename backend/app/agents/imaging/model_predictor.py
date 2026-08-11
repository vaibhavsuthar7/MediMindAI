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

    regions = ["chest", "skin", "brain", "bone", "eye"]
    for reg in regions:
        cls_path = os.path.join(BASE_DIR, f"{reg}_classes.json")
        mdl_path = os.path.join(BASE_DIR, f"{reg}_model.pth")
        if os.path.exists(cls_path) and os.path.exists(mdl_path):
            with open(cls_path, "r") as f:
                _region_classes[reg] = json.load(f)
            _region_models[reg] = load_model(mdl_path, len(_region_classes[reg]))

def predict(image_bytes: bytes) -> dict:
    _init_models()

    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    tensor = transform(img).unsqueeze(0).to(device)

    # Stage 1: Body Part Classifier
    with torch.no_grad():
        out = _bodypart_model(tensor)
        probs = torch.softmax(out, dim=1)[0]
        idx = torch.argmax(probs).item()
        body_part = _bodypart_classes[idx]
        bodypart_confidence = probs[idx].item()

    # Stage 2: Region Diagnosis
    if body_part not in _region_models:
        raise ValueError(f"No diagnosis model loaded for body part: {body_part}")

    diag_model = _region_models[body_part]
    classes = _region_classes[body_part]

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
