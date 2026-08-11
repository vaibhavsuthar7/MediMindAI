# MediMind AI — Multi-Region Imaging Agent Evaluation Report

**Date:** August 2026  
**Architecture:** 2-Stage Deep Transfer Learning (ResNet-18 Backbone)  
**Framework:** PyTorch & Torchvision  

---

## 📌 Executive Summary

The MediMind Diagnostic Imaging Agent uses a two-stage computer vision pipeline designed for multi-region medical scan interpretation:

1. **Stage 1 (Body-Part Classifier)**: Receives an unlabelled radiograph/scan, resizes to $224 \times 224$, and routes it to one of five anatomical categories (`chest`, `skin`, `brain`, `bone`, `eye`).
2. **Stage 2 (Region-Specific Specialist Models)**: Executes the target fine-tuned ResNet-18 model to predict primary pathology/condition with confidence scoring and severity triage.

---

## 📊 Model Performance Summary Table

| Model Target | Anatomical Scope | Target Diagnostic Classes | Fine-Tuning Strategy | Output Artifacts |
|---|---|---|---|---|
| **Body-Part Classifier** | Stage 1 Router | Chest, Skin, Brain, Bone, Eye | Unfrozen `fc` layer, CrossEntropyLoss | `bodypart_classifier.pth`, `bodypart_classifier_curve.png` |
| **Chest Specialist** | Chest X-ray | Pneumonia, Normal | ResNet-18 (`layer4` + `fc` unfreezing), LR 1e-4 | `chest_model.pth`, `chest_confusion_matrix.png`, `chest_training_curve.png` |
| **Skin Specialist** | Dermoscopy | 7 HAM10000 classes (`akiec`, `bcc`, `bkl`, `df`, `mel`, `nv`, `vasc`) | Class-weighted loss, Early stopping | `skin_model.pth`, `skin_confusion_matrix.png`, `skin_training_curve.png` |
| **Brain Specialist** | MRI Scan | Tumor Detected (`yes`), No Tumor (`no`) | Fine-tuned deep feature extractor | `brain_model.pth`, `brain_confusion_matrix.png`, `brain_training_curve.png` |
| **Bone Specialist** | Extremities X-ray | Fractured, Not Fractured | Balanced sampling, ReduceLROnPlateau | `bone_model.pth`, `bone_confusion_matrix.png`, `bone_training_curve.png` |
| **Eye Specialist** | OCT Scan | CNV, DME, DRUSEN, Normal | Fine-tuned fine-grained retinal layer classifier | `eye_model.pth` |

---

## 🖼️ Report & Presentation Artifacts (Visual Evidence)

Below are the generated evaluation figures ready to include in your project presentation slides and final report:

### Stage 1: Body Part Router Training Curve
![Body Part Classifier Curve](file:///c:/Users/vaibh/Desktop/medical/medimind-ai/medimind/report_artifacts/bodypart_classifier_curve.png)

### Stage 2: Chest Diagnosis Evaluation
![Chest Training Curve](file:///c:/Users/vaibh/Desktop/medical/medimind-ai/medimind/report_artifacts/chest_training_curve.png)
![Chest Confusion Matrix](file:///c:/Users/vaibh/Desktop/medical/medimind-ai/medimind/report_artifacts/chest_confusion_matrix.png)

### Stage 2: Skin Lesion Diagnosis Evaluation
![Skin Training Curve](file:///c:/Users/vaibh/Desktop/medical/medimind-ai/medimind/report_artifacts/skin_training_curve.png)
![Skin Confusion Matrix](file:///c:/Users/vaibh/Desktop/medical/medimind-ai/medimind/report_artifacts/skin_confusion_matrix.png)

### Stage 2: Brain MRI Diagnosis Evaluation
![Brain Training Curve](file:///c:/Users/vaibh/Desktop/medical/medimind-ai/medimind/report_artifacts/brain_training_curve.png)
![Brain Confusion Matrix](file:///c:/Users/vaibh/Desktop/medical/medimind-ai/medimind/report_artifacts/brain_confusion_matrix.png)

### Stage 2: Bone Fracture Diagnosis Evaluation
![Bone Training Curve](file:///c:/Users/vaibh/Desktop/medical/medimind-ai/medimind/report_artifacts/bone_training_curve.png)
![Bone Confusion Matrix](file:///c:/Users/vaibh/Desktop/medical/medimind-ai/medimind/report_artifacts/bone_confusion_matrix.png)

---

## 🚀 Presentation Highlights for Demonstration

1. **Self-Routing Intelligence**: Show live upload of a Chest X-ray vs a Skin Lesion image; point out how the system automatically identifies the anatomical site without requiring the user to select dropdowns.
2. **Graduated Fallback Pipeline**: 
   - **Tier 1**: Real PyTorch ResNet-18 Neural Network (Instant & offline-capable).
   - **Tier 2**: Multimodal Vision LLM (NVIDIA/Meta Vision fallback).
   - **Tier 3**: Graceful demo fallback handling.
3. **Seamless RAG Integration**: Diagnostic scan results automatically feed into ChromaDB vector memory for context-aware patient chat Q&A.
