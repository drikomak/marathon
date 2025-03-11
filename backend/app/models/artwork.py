from pydantic import BaseModel
from typing import Dict, List, Optional, Union

class Artwork(BaseModel):
    """
    Modèle de données pour une œuvre d'art
    """
    id: int
    title: str
    artist: str
    year: int
    imagepath: str
    features: Optional[List[float]] = None  # Vecteur de caractéristiques extraites

class ArtworkClassification(BaseModel):
    """
    Modèle pour la classification d'une œuvre d'art
    """
    artwork_id: int
    classification: Dict[str, str]  # Question -> Réponse

class Question(BaseModel):
    """
    Modèle pour une question de quiz
    """
    id: int
    text: str
    options: List[str]
    correct_answer: str

class ModelStats(BaseModel):
    """
    Statistiques du modèle d'apprentissage actif
    """
    accuracy: float
    classified_count: int
    total_count: int
    confidence_distribution: Dict[str, int]
    learning_curve: List[float] 