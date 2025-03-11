from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import List, Dict, Optional
import os
import json
import shutil
from pathlib import Path

from ..models.artwork import Artwork, ArtworkClassification, Question, ModelStats
from ..ml.active_learner import ActiveLearner
from ..ml.feature_extractor import FeatureExtractor
from ..utils.data_manager import DataManager

# Initialisation des chemins
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = os.path.join(BASE_DIR, "data")
IMAGES_DIR = os.path.join(DATA_DIR, "images")
MODEL_STATE_PATH = os.path.join(DATA_DIR, "model_state.json")

# Créer les répertoires s'ils n'existent pas
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(IMAGES_DIR, exist_ok=True)

# Initialisation de l'API
app = FastAPI(title="Museum Active Learning API")

# Configuration CORS pour permettre au frontend d'accéder à l'API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Variables globales pour stocker les instances
data_manager = DataManager(DATA_DIR)
feature_extractor = FeatureExtractor()
active_learner = None

# Initialisation du learner si les données sont disponibles
if data_manager.get_features() is not None and data_manager.artwork_data is not None:
    active_learner = ActiveLearner(data_manager.get_features(), data_manager.artwork_data)
    # Charger l'état du modèle s'il existe
    if os.path.exists(MODEL_STATE_PATH):
        active_learner.load_state(MODEL_STATE_PATH)

# Servir les images statiques
app.mount("/images", StaticFiles(directory=IMAGES_DIR), name="images")

# Routes API

@app.get("/api/status")
async def get_status():
    """
    Vérifie le statut de l'API
    """
    return {
        "status": "active",
        "artworks_count": len(data_manager.artwork_data) if data_manager.artwork_data is not None else 0,
        "features_available": data_manager.get_features() is not None,
        "active_learner_initialized": active_learner is not None
    }

@app.get("/api/artworks")
async def get_artworks():
    """
    Récupère toutes les œuvres d'art
    """
    return data_manager.get_all_artworks()

@app.get("/api/artworks/{artwork_id}")
async def get_artwork(artwork_id: int):
    """
    Récupère une œuvre d'art par son ID
    """
    artwork = data_manager.get_artwork_by_id(artwork_id)
    if artwork is None:
        raise HTTPException(status_code=404, detail="Artwork not found")
    return artwork

@app.get("/api/next-artwork")
async def get_next_artwork():
    """
    Obtient la prochaine œuvre à classifier selon l'algorithme d'active learning
    """
    if active_learner is None:
        raise HTTPException(status_code=400, detail="Active learner not initialized")
    
    index, artwork = active_learner.get_next_artwork()
    return artwork

@app.post("/api/artworks/classify")
async def classify_artwork(classification: ArtworkClassification):
    """
    Enregistre la classification d'une œuvre et met à jour le modèle
    """
    if active_learner is None:
        raise HTTPException(status_code=400, detail="Active learner not initialized")
    
    try:
        active_learner.update(classification.artwork_id, classification.classification)
        # Sauvegarder l'état du modèle
        active_learner.save_state(MODEL_STATE_PATH)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to classify artwork: {str(e)}")

@app.get("/api/model/stats")
async def get_model_stats():
    """
    Récupère les statistiques du modèle
    """
    if active_learner is None:
        raise HTTPException(status_code=400, detail="Active learner not initialized")
    
    return active_learner.get_stats()

@app.get("/api/questions")
async def get_questions():
    """
    Récupère toutes les questions disponibles
    """
    return data_manager.get_questions()

@app.post("/api/questions")
async def create_question(question: Question):
    """
    Crée une nouvelle question
    """
    questions = data_manager.get_questions()
    # Générer un ID pour la nouvelle question
    new_id = 1
    if questions:
        new_id = max([q.get("id", 0) for q in questions]) + 1
    
    question_dict = {
        "id": new_id,
        "text": question.text,
        "options": question.options,
        "correct_answer": question.correct_answer
    }
    
    questions.append(question_dict)
    data_manager.save_questions(questions)
    
    return question_dict

@app.put("/api/questions/{question_id}")
async def update_question(question_id: int, question: Question):
    """
    Met à jour une question existante
    """
    questions = data_manager.get_questions()
    
    for i, q in enumerate(questions):
        if q.get("id") == question_id:
            questions[i] = {
                "id": question_id,
                "text": question.text,
                "options": question.options,
                "correct_answer": question.correct_answer
            }
            data_manager.save_questions(questions)
            return questions[i]
    
    raise HTTPException(status_code=404, detail="Question not found")

@app.delete("/api/questions/{question_id}")
async def delete_question(question_id: int):
    """
    Supprime une question
    """
    questions = data_manager.get_questions()
    
    for i, q in enumerate(questions):
        if q.get("id") == question_id:
            del questions[i]
            data_manager.save_questions(questions)
            return {"status": "success"}
    
    raise HTTPException(status_code=404, detail="Question not found")

@app.post("/api/artworks/upload")
async def upload_artwork(
    title: str = Form(...),
    artist: str = Form(...),
    year: int = Form(...),
    image: UploadFile = File(...)
):
    """
    Télécharge une nouvelle œuvre d'art et extrait ses caractéristiques
    """
    # Sauvegarder l'image
    image_filename = f"{title.replace(' ', '_')}_{artist.replace(' ', '_')}.jpg"
    image_path = os.path.join(IMAGES_DIR, image_filename)
    
    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
    
    # Créer l'entrée d'œuvre d'art
    artwork = {
        "title": title,
        "artist": artist,
        "year": year,
        "imagepath": f"/images/{image_filename}"
    }
    
    # Ajouter l'œuvre à la base de données
    artwork_id = data_manager.add_artwork(artwork)
    
    # Extraire les caractéristiques
    features = feature_extractor.extract_features(image_path)
    
    # Mettre à jour les caractéristiques dans le gestionnaire de données
    if data_manager.get_features() is None:
        # Première œuvre, initialiser le tableau de caractéristiques
        data_manager.update_features(features.reshape(1, -1))
    else:
        # Ajouter les nouvelles caractéristiques
        all_features = np.vstack([data_manager.get_features(), features.reshape(1, -1)])
        data_manager.update_features(all_features)
    
    # Réinitialiser le active learner avec les données mises à jour
    global active_learner
    active_learner = ActiveLearner(data_manager.get_features(), data_manager.artwork_data)
    
    # Charger l'état du modèle s'il existe
    if os.path.exists(MODEL_STATE_PATH):
        active_learner.load_state(MODEL_STATE_PATH)
    
    return {
        "id": artwork_id,
        "title": title,
        "artist": artist,
        "year": year,
        "imagepath": f"/images/{image_filename}"
    } 