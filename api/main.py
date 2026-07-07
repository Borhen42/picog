import os
os.environ.setdefault("TF_ENABLE_ONEDNN_OPTS", "0")
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")  # suppress INFO/WARNING logs

from contextlib import asynccontextmanager
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing import image
from pathlib import Path
import shutil
import uuid

# -------------------
# CONFIG
# -------------------
CLASS_NAMES = ["Alzheimer", "Early_Stage", "Normal"]

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "ai-model" / "alzheimer_cnn_3class.h5"
UPLOAD_DIR = BASE_DIR / "api" / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# Global model state — populated during lifespan startup
model = None
IMG_SIZE = None

# -------------------
# LIFESPAN — load model only in the worker process, not the reloader
# -------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    global model, IMG_SIZE
    model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    IMG_SIZE = model.input_shape[1]
    print(f"[SUCCESS] Model loaded (input {IMG_SIZE}x{IMG_SIZE})")
    yield
    # nothing to clean up

# -------------------
# APP INIT
# -------------------
app = FastAPI(title="Alzheimer MRI Detection API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------
# UTILS
# -------------------
def preprocess_image(img_path: Path):
    img = image.load_img(img_path, target_size=(IMG_SIZE, IMG_SIZE))
    img_array = image.img_to_array(img)
    img_array = img_array / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

# -------------------
# ROUTES
# -------------------
@app.get("/")
def root():
    return {"message": "Alzheimer MRI Detection API is running"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Save uploaded file
    file_ext = Path(file.filename).suffix
    file_name = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / file_name

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Preprocess & predict
    img_array = preprocess_image(file_path)
    preds = model.predict(img_array)[0]

    pred_index = int(np.argmax(preds))
    pred_class = CLASS_NAMES[pred_index]
    confidence = float(preds[pred_index] * 100)

    # Cleanup
    file_path.unlink(missing_ok=True)

    return {
        "prediction": pred_class,
        "confidence": round(confidence, 2),
        "probabilities": {
            CLASS_NAMES[i]: round(float(preds[i] * 100), 2)
            for i in range(len(CLASS_NAMES))
        }
    }
