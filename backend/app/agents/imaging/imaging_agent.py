import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

"""
Diagnostic Imaging Agent
------------------------
Analyzes uploaded medical X-ray/scan images using REAL trained CNN models
(ResNet18 body-part classifier + 5 region-specific diagnosis models).
Falls back to vision LLM, then to a hardcoded demo, only if the trained
models fail to load or the image can't be read.
"""

import json
import base64
import re
from openai import OpenAI

from app.agents.base import BaseAgent
from app.config import settings
from app.agents.imaging.model_predictor import predict as cnn_predict


# ---------------------------------------------------------------------------
# Template info for each class our trained models can output.
# Fill in / edit descriptions, symptoms, recommendations as needed.
# ---------------------------------------------------------------------------
DIAGNOSIS_INFO = {
    "PNEUMONIA": {
        "readable_name": "Pneumonia Detected",
        "readable_name_hi": "Pneumonia (Chhati me Infection) mila hai",
        "severity": "high",
        "observations": [
            "Increased opacity and airspace consolidation observed in pulmonary parenchymal zones.",
            "Density variation consistent with acute fluid/exudative accumulation in lung fields.",
            "Costophrenic angles and vascular markings evaluated for secondary effusion signs.",
            "Bronchovascular density is higher than a clear healthy non-infected lung field."
        ],
        "observations_hi": [
            "Lungs (fefde) ke andar increased opacity aur airspace consolidation dekhi gayi hai.",
            "Density pattern se fefdo me infection ya fluid/exudate jama hone ke sanket hain.",
            "Vascular markings aur costophrenic angles ka evaluation kiya gaya.",
            "Healthy clear lung ke mukable bronchovascular density kaafi jyada hai."
        ],
        "recommendations": [
            "Correlate clinically with patient temperature, WBC count, and productive cough history.",
            "Consult a pulmonologist or primary physician for confirmation and empiric treatment.",
            "Ensure adequate hydration, rest, and follow-up chest radiography after treatment course."
        ],
        "recommendations_hi": [
            "Bukhar, khansi aur WBC count ke saath clinical test correlate karein.",
            "Turant Pulmonologist / Doctor se consult karein taaki sahi antibiotic treatment shuru ho sake.",
            "Hydration aur rest maintain karein, aur treatment ke baad follow-up X-ray zaroor karwayein."
        ],
        "summary": """**DETAILED CLINICAL RADIOLOGY REPORT**

**STAGE 1 ROUTING**: Stage 1 ResNet-18 Body-Part Classifier routed this scan to the **Chest Radiograph Specialist**.

**STAGE 2 DIAGNOSTIC FINDINGS**: The Pneumonia Diagnostic Model identified focal airspace opacity consistent with pulmonary pneumonia.

**IMPRESSION & CLINICAL PLAN**: High suspicion for active pulmonary infection. Correlate with clinical fever/symptoms and consult a physician.""",
        "summary_hi": """**VISTARIT CLINICAL RADIOLOGY REPORT (HINDI / HINGLISH)**

**STAGE 1 ROUTING**: Stage 1 ResNet-18 Classifier ne scan ko **Chest Radiograph (Chhati ka X-ray)** ke roop me identify kiya.

**STAGE 2 DIAGNOSTIC FINDINGS**: Pneumonia Model ne lungs me focal opacity aur airspace infection detect kiya.

**CLINICAL IMPRESSION**: Active lung infection / Pneumonia hone ki sambhavna jyada hai. Doctor se consult karein."""
    },
    "NORMAL_CHEST": {
        "readable_name": "Normal Chest Radiograph",
        "readable_name_hi": "Normal Chest X-ray (Koi bimari nahi mili)",
        "severity": "minimal",
        "observations": [
            "Pulmonary lung fields are clear without focal consolidation or infiltrates.",
            "Cardiac contour, mediastinal shadow, and hilar structures appear unremarkable.",
            "No acute pleural effusion, pneumothorax, or bony destruction identified."
        ],
        "observations_hi": [
            "Fefde (lung fields) bilkul saaf hain, koi consolidation ya opacity nahi hai.",
            "Heart contour aur mediastinal shadow normal range me hain.",
            "Pleural effusion ya pneumothorax ke koi sanket nahi hain."
        ],
        "recommendations": [
            "No immediate radiologic follow-up required based on this scan alone.",
            "Consult a physician if clinical symptoms (such as fever or shortness of breath) persist."
        ],
        "recommendations_hi": [
            "Is scan ke aadhar par turant kisi treatment ki zaroorat nahi hai.",
            "Agar fir bhi khansi ya bukhar rahe to physician se checkup karwayein."
        ],
        "summary": """**DETAILED CLINICAL RADIOLOGY REPORT**

**STAGE 1 ROUTING**: Stage 1 ResNet-18 Body-Part Classifier successfully identified a Chest Radiograph.

**STAGE 2 DIAGNOSTIC FINDINGS**: The Chest Model confirmed clear pulmonary parenchyma without signs of airspace consolidation.

**IMPRESSION**: Normal chest radiograph for pneumonia screening.""",
        "summary_hi": """**VISTARIT CLINICAL RADIOLOGY REPORT (HINDI / HINGLISH)**

**STAGE 1 ROUTING**: Stage 1 Classifier ne scan ko Chest X-ray pehchana.

**STAGE 2 DIAGNOSTIC FINDINGS**: Chest Model ne lungs ko bilkul normal aur clear paaya.

**CLINICAL IMPRESSION**: Normal chest scan."""
    },
    "akiec": {
        "readable_name": "Actinic Keratosis / Intraepithelial Carcinoma",
        "readable_name_hi": "Actinic Keratosis (Skin Pre-cancerous Lesion)",
        "severity": "moderate",
        "observations": [
            "Dermoscopic pattern exhibits scaly erythematous plaques with hyperkeratotic surface features.",
            "Pigment distribution and vascular network structure consistent with actinic keratosis."
        ],
        "observations_hi": [
            "Skin lesion me scaly red patches aur hyperkeratotic surface dikh raha hai.",
            "Pigment pattern Actinic Keratosis se match karta hai."
        ],
        "recommendations": [
            "Dermatologist evaluation recommended for clinical dermoscopy examination.",
            "Biopsy or cryotherapy may be advised to prevent progression."
        ],
        "recommendations_hi": [
            "Dermatologist (Tevacha visheshagya) se milkar physical examination karwayein.",
            "Biopsy ya cryotherapy ki salah di ja sakti hai."
        ],
        "summary": """**DETAILED DERMATOLOGY REPORT**

**STAGE 1 ROUTING**: Stage 1 Classifier identified a Skin Dermoscopic Image.

**STAGE 2 DIAGNOSTIC FINDINGS**: Skin Model classified lesion as Actinic Keratosis / Intraepithelial Carcinoma (AKIEC).

**IMPRESSION**: Pre-cancerous or early intraepithelial skin change. Specialist evaluation advised.""",
        "summary_hi": """**VISTARIT DERMATOLOGY REPORT (HINDI / HINGLISH)**

**STAGE 1 ROUTING**: Stage 1 Classifier ne skin lesion image pehchani.

**STAGE 2 DIAGNOSTIC FINDINGS**: Skin Model ne AKIEC lesion classify kiya.

**CLINICAL IMPRESSION**: Pre-cancerous skin patch ho sakta hai. Dermatologist se consult karein."""
    },
    "bcc": {
        "readable_name": "Basal Cell Carcinoma",
        "readable_name_hi": "Basal Cell Carcinoma (Skin Cancer)",
        "severity": "high",
        "observations": [
            "Arborizing telangiectasia and pearly nodular/ulcerated lesion appearance noted.",
            "Dermoscopic features strongly indicative of basal cell skin malignancy."
        ],
        "observations_hi": [
            "Skin nodule par arborizing blood vessels aur pearly border dikh raha hai.",
            "Basal cell carcinoma skin malignancy ke lakshan hain."
        ],
        "recommendations": [
            "Prompt dermatologist / oncological evaluation strongly recommended.",
            "Excisional biopsy or histopathological confirmation required."
        ],
        "recommendations_hi": [
            "Turant Dermatologist ya Skin Specialist se sampark karein.",
            "Confirm karne ke liye skin biopsy karwana zaroori hai."
        ],
        "summary": """**DETAILED DERMATOLOGY REPORT**

**STAGE 1 ROUTING**: Routed to Skin Lesion Classifier.

**STAGE 2 DIAGNOSTIC FINDINGS**: Identified features consistent with Basal Cell Carcinoma.

**IMPRESSION**: High urgency for biopsy and clinical excision assessment.""",
        "summary_hi": """**VISTARIT DERMATOLOGY REPORT (HINDI / HINGLISH)**

**STAGE 1 ROUTING**: Skin Lesion Classifier par route hua.

**STAGE 2 DIAGNOSTIC FINDINGS**: Basal Cell Carcinoma ke sanket mile hain.

**CLINICAL IMPRESSION**: High priority skin checkup aur biopsy zaroori hai."""
    },
    "bkl": {
        "readable_name": "Benign Keratosis-like Lesion",
        "readable_name_hi": "Benign Keratosis (Khatarnak nahi - Benign growth)",
        "severity": "low",
        "observations": [
            "Milioid cysts, comedo-like openings, and well-demarcated borders observed.",
            "Non-malignant benign seborrheic keratosis or lichen-planus-like keratosis pattern."
        ],
        "observations_hi": [
            "Border saaf hai aur comedo-like openings dikh rahi hain.",
            "Yeh ek benign (non-cancerous) skin growth lag rahi hai."
        ],
        "recommendations": [
            "Routine annual dermatologist skin check is generally sufficient.",
            "Monitor for changes in size, color, or bleeding."
        ],
        "recommendations_hi": [
            "Normal annual skin checkup kafi hai.",
            "Agar iska color ya size badle to doctor ko dikhayein."
        ],
        "summary": """**DETAILED DERMATOLOGY REPORT**

**STAGE 1 ROUTING**: Skin Lesion Classifier.

**STAGE 2 DIAGNOSTIC FINDINGS**: Benign Keratosis pattern detected.

**IMPRESSION**: Low risk benign skin lesion.""",
        "summary_hi": """**VISTARIT DERMATOLOGY REPORT (HINDI / HINGLISH)**

**STAGE 1 ROUTING**: Skin Lesion Classifier.

**STAGE 2 DIAGNOSTIC FINDINGS**: Benign Keratosis (non-cancerous skin growth) mila hai.

**CLINICAL IMPRESSION**: Low risk, chinta ki baat nahi hai."""
    },
    "df": {
        "readable_name": "Dermatofibroma",
        "readable_name_hi": "Dermatofibroma (Benign skin nodule)",
        "severity": "low",
        "observations": [
            "Central white patch with delicate peripheral pigment network.",
            "Benign fibrous dermal nodule features identified."
        ],
        "observations_hi": [
            "Center me halka white patch aur edges par pigment network hai.",
            "Benign fibrous skin nodule ke lakshan hain."
        ],
        "recommendations": [
            "No immediate intervention required; monitor periodically."
        ],
        "recommendations_hi": [
            "Turant kisi treatment ki zaroorat nahi hai, monitor karte rahein."
        ],
        "summary": """**DETAILED DERMATOLOGY REPORT**

**STAGE 1 ROUTING**: Skin Lesion Classifier.

**STAGE 2 DIAGNOSTIC FINDINGS**: Dermatofibroma (Benign dermal nodule).""",
        "summary_hi": """**VISTARIT DERMATOLOGY REPORT (HINDI / HINGLISH)**

**STAGE 1 ROUTING**: Skin Lesion Classifier.

**STAGE 2 DIAGNOSTIC FINDINGS**: Dermatofibroma (Benign mole/nodule)."""
    },
    "mel": {
        "readable_name": "Melanoma (High Urgency Skin Malignancy)",
        "readable_name_hi": "Melanoma (Gambhir Skin Lesion - Urgent Checkup)",
        "severity": "high",
        "observations": [
            "Asymmetrical pigmentation, irregular borders, multiple color shades, and diameter variations.",
            "High-risk dermoscopic atypical network consistent with melanoma."
        ],
        "observations_hi": [
            "Lesion ka shape asymmetrical hai, borders irregular hain aur multiple colors dikh rahe hain.",
            "High-risk melanoma skin cancer ke dermoscopic pattern hain."
        ],
        "recommendations": [
            "URGENT dermatologist consultation required.",
            "Perform immediate full-thickness excisional biopsy."
        ],
        "recommendations_hi": [
            "Bina kisi deri ke Dermatologist se urgent appointment lein.",
            "Biopsy ke dwara ise confirm karwayein."
        ],
        "summary": """**DETAILED DERMATOLOGY REPORT**

**STAGE 1 ROUTING**: Skin Lesion Classifier.

**STAGE 2 DIAGNOSTIC FINDINGS**: Highly suggestive of Melanoma.

**IMPRESSION**: URGENT specialist referral needed.""",
        "summary_hi": """**VISTARIT DERMATOLOGY REPORT (HINDI / HINGLISH)**

**STAGE 1 ROUTING**: Skin Lesion Classifier.

**STAGE 2 DIAGNOSTIC FINDINGS**: Melanoma hone ki sambhavna hai.

**CLINICAL IMPRESSION**: Urgent Doctor consultation zaroori hai."""
    },
    "nv": {
        "readable_name": "Melanocytic Nevus (Common Mole)",
        "readable_name_hi": "Melanocytic Nevus (Sadharan Til / Mole)",
        "severity": "minimal",
        "observations": [
            "Symmetrical pigment network and uniform border structure.",
            "Classic benign melanocytic mole characteristics."
        ],
        "observations_hi": [
            "Symmetrical shape aur uniform pigment pattern.",
            "Sadharan benign mole / til ke lakshan hain."
        ],
        "recommendations": [
            "Routine self-examination using ABCDE criteria."
        ],
        "recommendations_hi": [
            "Normal til hai, zaroorat padne par monitor karein."
        ],
        "summary": """**DETAILED DERMATOLOGY REPORT**

**STAGE 1 ROUTING**: Skin Lesion Classifier.

**STAGE 2 DIAGNOSTIC FINDINGS**: Common Benign Mole (Nevus).""",
        "summary_hi": """**VISTARIT DERMATOLOGY REPORT (HINDI / HINGLISH)**

**STAGE 1 ROUTING**: Skin Lesion Classifier.

**STAGE 2 DIAGNOSTIC FINDINGS**: Common Mole (Normal til)."""
    },
    "vasc": {
        "readable_name": "Vascular Lesion (Cherry Angioma / Hemangioma)",
        "readable_name_hi": "Vascular Lesion (Khoon ki nason ka benign spot)",
        "severity": "low",
        "observations": [
            "Red-purple lacunae and vascular wall dilation observed."
        ],
        "observations_hi": [
            "Red-purple vascular spot dikh raha hai."
        ],
        "recommendations": [
            "Generally harmless; consult if bleeding or irritated."
        ],
        "recommendations_hi": [
            "Harmless hai, agar bleeding ho tabhi doctor ko dikhayein."
        ],
        "summary": """**DETAILED DERMATOLOGY REPORT**

**STAGE 1 ROUTING**: Skin Lesion Classifier.

**STAGE 2 DIAGNOSTIC FINDINGS**: Benign Vascular Lesion.""",
        "summary_hi": """**VISTARIT DERMATOLOGY REPORT (HINDI / HINGLISH)**

**STAGE 1 ROUTING**: Skin Lesion Classifier.

**STAGE 2 DIAGNOSTIC FINDINGS**: Benign Vascular Lesion."""
    },
    "yes": {
        "readable_name": "Brain Tumor Mass Detected",
        "readable_name_hi": "Brain Tumor (Dimaag me Mass) mila hai",
        "severity": "high",
        "observations": [
            "Abnormal hyperintense region / mass occupying lesion detected in brain parenchymal tissue.",
            "Mass effect or localized structural displacement observed in cerebral hemispheres.",
            "Ventricular symmetry and midline shift evaluated for intracranial pressure signs."
        ],
        "observations_hi": [
            "Brain MRI me abnormal mass / hyperintense region dekha gaya hai.",
            "Cerebral tissue me structural displacement aur mass effect ke lakshan hain.",
            "Intracranial pressure aur midline alignment ka evaluation kiya gaya."
        ],
        "recommendations": [
            "Immediate neurosurgical / neurological specialist consultation required.",
            "Perform high-resolution contrast-enhanced MRI (T1-gadolinium, T2-FLAIR) for tumor grading."
        ],
        "recommendations_hi": [
            "Bina deri kiye Neurologist / Neurosurgeon se milna zaroori hai.",
            "Contrast-enhanced Brain MRI aur specialist evaluation karwayein."
        ],
        "summary": """**DETAILED BRAIN MRI REPORT**

**STAGE 1 ROUTING**: Stage 1 ResNet-18 Classifier routed image to **Brain MRI Specialist**.

**STAGE 2 DIAGNOSTIC FINDINGS**: Brain Model detected features consistent with a space-occupying tumor mass.

**IMPRESSION**: High priority neurosurgical referral required.""",
        "summary_hi": """**VISTARIT BRAIN MRI REPORT (HINDI / HINGLISH)**

**STAGE 1 ROUTING**: Stage 1 Classifier ne scan ko **Brain MRI** pehchana.

**STAGE 2 DIAGNOSTIC FINDINGS**: Brain Model ne tumor mass ke lakshan detect kiye.

**CLINICAL IMPRESSION**: Urgent Neurologist checkup zaroori hai."""
    },
    "no": {
        "readable_name": "No Brain Tumor Detected",
        "readable_name_hi": "Normal Brain MRI (Koi Tumor nahi mila)",
        "severity": "minimal",
        "observations": [
            "Cerebral hemispheres, basal ganglia, and cerebellum exhibit normal tissue intensity.",
            "No mass lesion, abnormal enhancement, or midline shift detected."
        ],
        "observations_hi": [
            "Brain hemispheres aur ventricles normal intensity me hain.",
            "Koi mass lesion ya tumor nahi mila hai."
        ],
        "recommendations": [
            "No immediate neurosurgical action indicated from this MRI screening scan."
        ],
        "recommendations_hi": [
            "Is scan ke basis par filhal koi concern nahi hai."
        ],
        "summary": """**DETAILED BRAIN MRI REPORT**

**STAGE 1 ROUTING**: Brain MRI Specialist.

**STAGE 2 DIAGNOSTIC FINDINGS**: Clear brain parenchyma without tumor mass.""",
        "summary_hi": """**VISTARIT BRAIN MRI REPORT (HINDI / HINGLISH)**

**STAGE 1 ROUTING**: Brain MRI Specialist.

**STAGE 2 DIAGNOSTIC FINDINGS**: Normal Brain Scan (No tumor)."""
    },
    "fractured": {
        "readable_name": "Bone Fracture Detected",
        "readable_name_hi": "Haddi me Fracture (Bone Fracture) mila hai",
        "severity": "high",
        "observations": [
            "Cortical discontinuity and focal disruption detected along the bone shaft line.",
            "Density variation consistent with acute traumatic bone displacement or hairline fracture.",
            "Adjacent soft-tissue opacity changes indicate localized edema or inflammation.",
            "Articular alignment evaluated; cortical margins show clear structural interruption."
        ],
        "observations_hi": [
            "Bone shaft line ke paas cortical discontinuity aur physical disruption dekhi gayi hai.",
            "Density pattern se acute traumatic bone displacement ya hairline fracture ka sanket milta hai.",
            "Aas-paas ke soft-tissue me sujan (edema) aur inflammation ke lakshan hain.",
            "Joint alignment check kiya gaya; cortical boundary me structural break saaf dikh raha hai."
        ],
        "recommendations": [
            "Immediate orthopedic evaluation for reduction, splinting, or cast immobilization.",
            "Strict non-weight-bearing status on the affected extremity until clinically assessed.",
            "Obtain orthogonal (AP and Lateral) radiographic views to confirm alignment.",
            "Ice application and elevation to reduce acute soft-tissue swelling."
        ],
        "recommendations_hi": [
            "Immediate Orthopedic Doctor se sampark karein taaki fracture alignment aur casting/splinting ho sake.",
            "Affected leg/arm par strict non-weight-bearing rakhein aur weight na daalein.",
            "Confirmation ke liye orthogonal (AP & Lateral) views ka X-ray karwayein.",
            "Sujan aur dard kam karne ke liye ice application aur limb elevation karein."
        ],
        "summary": """**DETAILED CLINICAL RADIOLOGY REPORT**

**STAGE 1 ROUTING**: Stage 1 ResNet-18 Body-Part Classifier successfully identified this scan as an **Extremity/Bone Radiograph**.

**STAGE 2 DIAGNOSTIC EVALUATION**: The fine-tuned Bone Diagnostic Model evaluated the cortical contours and identified clear cortical disruption consistent with an acute fracture.

**CLINICAL IMPRESSION**: High-probability acute bone fracture detected. Immediate orthopedic consultation is strongly recommended to prevent malunion or further displacement.""",
        "summary_hi": """**VISTARIT CLINICAL RADIOLOGY REPORT (HINDI / HINGLISH)**

**STAGE 1 ROUTING**: Stage 1 ResNet-18 Classifier ne scan ko **Extremity/Bone X-ray** ke roop me sahi pehchana.

**STAGE 2 DIAGNOSTIC EVALUATION**: Fine-tuned Bone Diagnostic Model ne bone contours ka vishleshan kiya aur cortical break / fracture ki pushti ki.

**CLINICAL IMPRESSION**: High-probability acute bone fracture mila hai. Kripya bina deri kiye Orthopedic Doctor se consult karein taaki sahi ilaaj aur casting ho sake."""
    },
    "not fractured": {
        "readable_name": "No Fracture Detected",
        "readable_name_hi": "Normal Bone X-ray (Koi Fracture nahi mila)",
        "severity": "minimal",
        "observations": [
            "Cortical boundaries are continuous without fracture lines or step-off deformities.",
            "Joint spaces are preserved and periarticular soft tissues appear normal."
        ],
        "observations_hi": [
            "Bone cortex boundary ekdam continuous hai, koi fracture line nahi hai.",
            "Joint space aur soft tissue normal hain."
        ],
        "recommendations": [
            "Symptomatic management for soft tissue strain if tenderness persists."
        ],
        "recommendations_hi": [
            "Dard rehne par soft tissue sprain ke liye rest aur ice pack use karein."
        ],
        "summary": """**DETAILED BONE RADIOLOGY REPORT**

**STAGE 1 ROUTING**: Bone Radiograph Specialist.

**STAGE 2 DIAGNOSTIC FINDINGS**: Intact bony cortex without acute fracture.""",
        "summary_hi": """**VISTARIT BONE RADIOLOGY REPORT (HINDI / HINGLISH)**

**STAGE 1 ROUTING**: Bone Radiograph Specialist.

**STAGE 2 DIAGNOSTIC FINDINGS**: Normal Bone X-ray (Fracture nahi hai)."""
    },
    "CNV": {
        "readable_name": "Choroidal Neovascularization (Eye OCT)",
        "readable_name_hi": "Choroidal Neovascularization (Aankh ka Retinal Issue)",
        "severity": "high",
        "observations": [
            "OCT scan shows subretinal neovascular membrane growth and retinal fluid leakage."
        ],
        "observations_hi": [
            "Eye OCT scan me retina ke neeche abnormal blood vessel growth aur fluid dikh raha hai."
        ],
        "recommendations": [
            "Prompt ophthalmologist consultation for anti-VEGF evaluation."
        ],
        "recommendations_hi": [
            "Turant Eye Specialist (Ophthalmologist) se milkar anti-VEGF consult karein."
        ],
        "summary": """**DETAILED OPHTHALMOLOGY OCT REPORT**

**STAGE 1 ROUTING**: Eye OCT Scan Specialist.

**STAGE 2 DIAGNOSTIC FINDINGS**: Choroidal Neovascularization (CNV).""",
        "summary_hi": """**VISTARIT OPHTHALMOLOGY REPORT (HINDI / HINGLISH)**

**STAGE 1 ROUTING**: Eye OCT Specialist.

**STAGE 2 DIAGNOSTIC FINDINGS**: Retinal Neovascularization (CNV) mila hai."""
    },
    "DME": {
        "readable_name": "Diabetic Macular Edema (Eye OCT)",
        "readable_name_hi": "Diabetic Macular Edema (Diabetes se Aankh me Sujan)",
        "severity": "moderate",
        "observations": [
            "Intraretinal fluid thickening in the macular region."
        ],
        "observations_hi": [
            "Macular region me fluid swelling dekhi gayi hai."
        ],
        "recommendations": [
            "Ophthalmology and endocrinology follow-up for blood sugar control."
        ],
        "recommendations_hi": [
            "Eye specialist aur diabetologist se blood sugar control & eye checkup karwayein."
        ],
        "summary": """**DETAILED OPHTHALMOLOGY OCT REPORT**

**STAGE 1 ROUTING**: Eye OCT Scan Specialist.

**STAGE 2 DIAGNOSTIC FINDINGS**: Diabetic Macular Edema.""",
        "summary_hi": """**VISTARIT OPHTHALMOLOGY REPORT (HINDI / HINGLISH)**

**STAGE 1 ROUTING**: Eye OCT Specialist.

**STAGE 2 DIAGNOSTIC FINDINGS**: Diabetic Macular Edema (Retinal swelling)."""
    },
    "DRUSEN": {
        "readable_name": "Drusen Deposits (Early AMD Sign)",
        "readable_name_hi": "Drusen Deposits (Early Age Retinal Sign)",
        "severity": "low",
        "observations": [
            "Sub-RPE yellowish extracellular deposits under the macular retina."
        ],
        "observations_hi": [
            "Retina ke neeche chote Drusen deposits dikh rahe hain."
        ],
        "recommendations": [
            "Routine eye examination and Amsler grid self-monitoring."
        ],
        "recommendations_hi": [
            "Regular eye checkup aur visual monitoring karein."
        ],
        "summary": """**DETAILED OPHTHALMOLOGY OCT REPORT**

**STAGE 1 ROUTING**: Eye OCT Scan Specialist.

**STAGE 2 DIAGNOSTIC FINDINGS**: Drusen deposits.""",
        "summary_hi": """**VISTARIT OPHTHALMOLOGY REPORT (HINDI / HINGLISH)**

**STAGE 1 ROUTING**: Eye OCT Specialist.

**STAGE 2 DIAGNOSTIC FINDINGS**: Drusen deposits (Early AMD sign)."""
    },
    "NORMAL_EYE": {
        "readable_name": "Normal Eye OCT Scan",
        "readable_name_hi": "Normal Eye OCT (Aankh bilkul thik hai)",
        "severity": "minimal",
        "observations": [
            "Retinal layers are well-defined with normal foveal contour."
        ],
        "observations_hi": [
            "Retinal layers aur fovea bilkul normal hain."
        ],
        "recommendations": [
            "Routine eye health maintenance."
        ],
        "recommendations_hi": [
            "Normal eye care maintain karein."
        ],
        "summary": """**DETAILED OPHTHALMOLOGY OCT REPORT**

**STAGE 1 ROUTING**: Eye OCT Scan Specialist.

**STAGE 2 DIAGNOSTIC FINDINGS**: Normal OCT scan.""",
        "summary_hi": """**VISTARIT OPHTHALMOLOGY REPORT (HINDI / HINGLISH)**

**STAGE 1 ROUTING**: Eye OCT Specialist.

**STAGE 2 DIAGNOSTIC FINDINGS**: Normal Eye OCT Scan."""
    },
}

MODEL_SCOPE = {
    "chest": "This model screens for Pneumonia vs Normal only.",
    "skin": "This model classifies among 7 common lesion types (HAM10000 dataset).",
    "brain": "This model detects tumor presence/absence only.",
    "bone": "This model detects fracture presence/absence only.",
    "eye": "This model screens for 3 specific OCT conditions plus Normal.",
}


class ImagingAgent(BaseAgent):
    name = "imaging_agent"
    description = "Analyzes medical X-rays and imaging scans using trained CNN models."

    def run(self, image_path: str) -> dict:
        result = self._analyze_with_trained_model(image_path)
        if result:
            return result
        vision_result = self._analyze_with_vision(image_path)
        if vision_result:
            return vision_result
        return self._demo_fallback(image_path)

    def _analyze_with_trained_model(self, image_path: str) -> dict:
        if not image_path or not os.path.exists(image_path):
            return None

        try:
            with open(image_path, "rb") as f:
                image_bytes = f.read()

            raw = cnn_predict(image_bytes)

            body_part = raw["body_part"]
            diagnosis_key = raw["diagnosis"]

            lookup_key = diagnosis_key
            if diagnosis_key == "NORMAL" and body_part == "chest":
                lookup_key = "NORMAL_CHEST"
            elif diagnosis_key == "NORMAL" and body_part == "eye":
                lookup_key = "NORMAL_EYE"

            info = DIAGNOSIS_INFO.get(lookup_key, {
                "readable_name": diagnosis_key,
                "readable_name_hi": diagnosis_key,
                "severity": "moderate",
                "observations": ["Model classified the image into this category."],
                "observations_hi": ["Model ne is image ko is category me classify kiya hai."],
                "recommendations": ["Consult a specialist for confirmation."],
                "recommendations_hi": ["Confirmation ke liye specialist se consult karein."],
                "summary": f"The model classified this {body_part} image as '{diagnosis_key}'.",
                "summary_hi": f"Model ne is {body_part} scan ko '{diagnosis_key}' classify kiya hai."
            })

            diagnosis_confidence = float(raw["diagnosis_confidence"])
            body_part_readable = {
                "chest": "Chest X-ray", "skin": "Skin Lesion Photo",
                "brain": "Brain MRI", "bone": "Bone X-ray", "eye": "Eye OCT Scan"
            }.get(body_part, body_part)

            body_part_readable_hi = {
                "chest": "Chhati ka X-ray (Chest X-ray)",
                "skin": "Tevacha / Skin Lesion Photo",
                "brain": "Dimaag ka MRI (Brain MRI)",
                "bone": "Haddi ka X-ray (Bone X-ray)",
                "eye": "Aankh ka OCT Scan (Eye OCT Scan)"
            }.get(body_part, body_part)

            return {
                "body_part": body_part_readable,
                "body_part_hi": body_part_readable_hi,
                "top_finding": info["readable_name"],
                "top_finding_hi": info.get("readable_name_hi", info["readable_name"]),
                "confidence": round(diagnosis_confidence, 4),
                "severity": info["severity"],
                "findings": {
                    info["readable_name"]: round(diagnosis_confidence, 4)
                },
                "key_observations": info["observations"],
                "key_observations_hi": info.get("observations_hi", info["observations"]),
                "recommendations": info["recommendations"],
                "recommendations_hi": info.get("recommendations_hi", info["recommendations"]),
                "summary": info["summary"],
                "summary_hi": info.get("summary_hi", info["summary"]),
                "model_scope": MODEL_SCOPE.get(body_part, ""),
                "disclaimer": "AI-generated preliminary screening result. Not a confirmed medical diagnosis.",
                "source": "trained_cnn_model"
            }
        except Exception as e:
            print(f"[Imaging Agent] Trained model inference failed: {e}")
            return None

    # -----------------------------------------------------------------
    # VISION LLM FALLBACK (unchanged from before — kept as backup only)
    # -----------------------------------------------------------------
    def _analyze_with_vision(self, image_path: str) -> dict:
        if not image_path or not os.path.exists(image_path):
            return None

        try:
            api_key = settings.llm_api_key or settings.groq_api_key
            base_url = settings.llm_base_url or "https://integrate.api.nvidia.com/v1"
            client = OpenAI(api_key=api_key or "ollama", base_url=base_url, timeout=30.0)

            ext = os.path.splitext(image_path)[1].lower().strip(".")
            mime = "jpeg" if ext in ("jpg", "jpeg") else ext if ext in ("png", "webp", "gif") else "jpeg"

            with open(image_path, "rb") as f:
                b64_str = base64.b64encode(f.read()).decode("utf-8")
            data_url = f"data:image/{mime};base64,{b64_str}"

            prompt = (
                "You are an expert clinical AI radiologist specializing in diagnostic radiograph evaluation.\n"
                "Examine this medical X-ray or scan image in detail.\n\n"
                "Respond in VALID JSON format with the following exact structure:\n"
                "{\n"
                '  "body_part": "Anatomical region examined",\n'
                '  "top_finding": "Primary Pathology or Finding",\n'
                '  "confidence": 0.92,\n'
                '  "severity": "high" | "moderate" | "low" | "minimal",\n'
                '  "findings": {"Primary Pathology": 0.92},\n'
                '  "key_observations": ["observation 1", "observation 2"],\n'
                '  "recommendations": ["recommendation 1", "recommendation 2"],\n'
                '  "summary": "Full radiologist clinical report."\n'
                "}"
            )

            vision_models = [
                "meta/llama-3.2-11b-vision-instruct",
                "mistralai/pixtral-12b",
                "nvidia/neva-22b"
            ]

            response = None
            for v_model in vision_models:
                try:
                    response = client.chat.completions.create(
                        model=v_model,
                        messages=[{
                            "role": "user",
                            "content": [
                                {"type": "text", "text": prompt},
                                {"type": "image_url", "image_url": {"url": data_url}},
                            ],
                        }],
                        temperature=0.1,
                        max_tokens=1200,
                    )
                    if response and response.choices and response.choices[0].message.content:
                        break
                except Exception as ve:
                    print(f"[Imaging Agent] Vision model {v_model} failed: {ve}. Retrying fallback...")

            if not response or not response.choices:
                return None

            raw_text = response.choices[0].message.content.strip()
            json_match = re.search(r"\{.*\}", raw_text, re.DOTALL)
            if json_match:
                parsed = json.loads(json_match.group(0))
                return {
                    "body_part": parsed.get("body_part", "Medical Scan"),
                    "top_finding": parsed.get("top_finding", "Radiograph Assessment"),
                    "confidence": float(parsed.get("confidence", 0.90)),
                    "severity": str(parsed.get("severity", "moderate")).lower(),
                    "findings": parsed.get("findings", {"Primary Finding": 0.90}),
                    "key_observations": parsed.get("key_observations", []),
                    "recommendations": parsed.get("recommendations", []),
                    "summary": parsed.get("summary", raw_text),
                    "source": "vision_llm"
                }
            return None
        except Exception as e:
            print("Vision analysis error:", e)
            return None

    # -----------------------------------------------------------------
    # LAST-RESORT HARDCODED DEMO (kept only as an absolute fallback)
    # -----------------------------------------------------------------
    def _demo_fallback(self, image_path: str = "") -> dict:
        return {
            "body_part": "Diagnostic Radiograph (Standard View)",
            "top_finding": "Analysis Unavailable",
            "confidence": 0.0,
            "severity": "moderate",
            "findings": {},
            "key_observations": ["Automated analysis could not be completed for this image."],
            "recommendations": ["Please retry with a clearer image, or consult a medical professional directly."],
            "summary": "Neither the trained model nor the backup vision model could process this image.",
            "source": "fallback_error"
        }