import os
import sys
import json
import torch
import torch.nn as nn
from torchvision import models, transforms, datasets
from torch.utils.data import DataLoader

# Ensure UTF-8 output encoding for Windows terminals
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_BASE_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "..", "..", "..", "..", "..", "archive_and_training", "medimind_ai_trail_model", "data"))
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

MODELS_CONFIG = {
    "bodypart": {"weights": "bodypart_classifier.pth", "classes": "bodypart_classes.json", "data": "bodypart_classifier_split/val"},
    "chest":    {"weights": "chest_model.pth",          "classes": "chest_classes.json",    "data": "chest/chest_xray/val"},
    "skin":     {"weights": "skin_model.pth",           "classes": "skin_classes.json",     "data": "skin_split/val"},
    "brain":    {"weights": "brain_model.pth",          "classes": "brain_classes.json",    "data": "brain_split/val"},
    "bone":     {"weights": "bone_model.pth",           "classes": "bone_classes.json",     "data": "bone_split/val"},
    "eye":      {"weights": "eye_model.pth",            "classes": "eye_classes.json",      "data": "eye/OCT2017/val"},
}

TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])


def load_model(weights_path: str, num_classes: int) -> nn.Module:
    """Loads ResNet-18 model weights safely on configured device."""
    model = models.resnet18(weights=None)
    model.fc = nn.Linear(model.fc.in_features, num_classes)
    try:
        state_dict = torch.load(weights_path, map_location=DEVICE, weights_only=True)
    except TypeError:
        state_dict = torch.load(weights_path, map_location=DEVICE)
    model.load_state_dict(state_dict)
    return model.to(DEVICE).eval()


def evaluate_dataset(model_name: str, custom_data_dir: str = None) -> dict:
    """Evaluates specified PyTorch ResNet model on a validation/test dataset."""
    cfg = MODELS_CONFIG.get(model_name)
    if not cfg:
        print(f"[X] Invalid model name: {model_name}")
        return None

    weights_path = os.path.join(BASE_DIR, cfg["weights"])
    classes_path = os.path.join(BASE_DIR, cfg["classes"])
    dataset_dir = custom_data_dir or os.path.join(DATA_BASE_DIR, cfg["data"])

    if not os.path.exists(weights_path) or not os.path.exists(classes_path):
        print(f"[X] Artifacts missing for '{model_name}' in {BASE_DIR}")
        return None

    if not os.path.exists(dataset_dir):
        print(f"[X] Dataset path not found: {dataset_dir}")
        return None

    with open(classes_path, "r") as f:
        classes = json.load(f)

    val_dataset = datasets.ImageFolder(dataset_dir, transform=TRANSFORM)
    val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False)
    model = load_model(weights_path, len(classes))

    all_preds, all_targets = [], []
    with torch.no_grad():
        for imgs, labels in val_loader:
            outputs = model(imgs.to(DEVICE))
            preds = torch.argmax(outputs, dim=1)
            all_preds.extend(preds.cpu().numpy())
            all_targets.extend(labels.numpy())

    total = len(all_targets)
    correct = sum(p == t for p, t in zip(all_preds, all_targets))
    overall_acc = (correct / total * 100) if total > 0 else 0.0

    print(f"\n{'='*50}\nEVALUATING MODEL: {model_name.upper()} ({len(classes)} classes)\nDevice: {DEVICE} | Total Samples: {total}\n{'='*50}")
    print(f"[*] Overall Accuracy: {overall_acc:.2f}% ({correct}/{total})")

    # Per-class breakdown
    print("\n[*] Per-Class Accuracy:")
    for idx, name in enumerate(val_dataset.classes):
        cls_total = sum(t == idx for t in all_targets)
        cls_correct = sum(p == idx and t == idx for p, t in zip(all_preds, all_targets))
        cls_acc = (cls_correct / cls_total * 100) if cls_total > 0 else 0.0
        print(f"  - {name:<15}: {cls_acc:6.2f}% ({cls_correct}/{cls_total})")

    try:
        from sklearn.metrics import classification_report
        print("\n[*] Classification Report:")
        print(classification_report(all_targets, all_preds, target_names=val_dataset.classes, digits=4))
    except Exception:
        pass

    return {"model": model_name, "acc": overall_acc, "correct": correct, "total": total}


def evaluate_all():
    """Runs evaluation across all 6 diagnostic models and prints summary table."""
    print(f"\n=======================================================")
    print(f"🚀 COMPREHENSIVE EVALUATION FOR ALL 6 MODELS ({DEVICE})")
    print(f"=======================================================")

    results = [res for m in MODELS_CONFIG if (res := evaluate_dataset(m))]

    print(f"\n{'='*60}\n🏆 MASTER ACCURACY SUMMARY REPORT 🏆\n{'='*60}")
    print(f"{'MODEL':<15} | {'ACCURACY':<12} | {'CORRECT / TOTAL':<15}")
    print("-" * 60)
    for r in results:
        print(f"{r['model'].upper():<15} | {r['acc']:6.2f}%      | {r['correct']}/{r['total']}")
    print("=" * 60)


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="MediMind AI Diagnostic Models Evaluation Suite")
    parser.add_argument("--model", type=str, default="all", choices=["all"] + list(MODELS_CONFIG.keys()), help="Model to evaluate")
    parser.add_argument("--dataset", type=str, default=None, help="Custom validation dataset path")
    args = parser.parse_args()

    evaluate_all() if args.model == "all" else evaluate_dataset(args.model, args.dataset)
