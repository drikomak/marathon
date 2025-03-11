import pandas as pd
import numpy as np
import os
from typing import List, Dict, Tuple, Optional
import json

class DataManager:
    """
    Gestionnaire pour charger et maintenir les données des œuvres d'art
    """
    def __init__(self, data_dir: str):
        """
        Initialise le gestionnaire avec le répertoire de données
        
        Args:
            data_dir: Chemin vers le répertoire contenant les données
        """
        self.data_dir = data_dir
        self.artwork_data = None
        self.features = None
        self.questions = []
        
        # Charger les données si le répertoire existe
        if os.path.exists(data_dir):
            self._load_data()
    
    def _load_data(self) -> None:
        """
        Charge les données des œuvres et les caractéristiques
        """
        # Chemin vers les fichiers de données
        artwork_csv = os.path.join(self.data_dir, 'artworks.csv')
        features_npy = os.path.join(self.data_dir, 'features.npy')
        questions_json = os.path.join(self.data_dir, 'questions.json')
        
        # Charger les données des œuvres
        if os.path.exists(artwork_csv):
            self.artwork_data = pd.read_csv(artwork_csv)
            # Assurer que l'ID est une colonne
            if 'id' not in self.artwork_data.columns:
                self.artwork_data['id'] = range(len(self.artwork_data))
        else:
            # Créer un DataFrame vide avec des colonnes par défaut
            self.artwork_data = pd.DataFrame({
                'id': [],
                'title': [],
                'artist': [],
                'year': [],
                'imagepath': []
            })
        
        # Charger les caractéristiques
        if os.path.exists(features_npy):
            self.features = np.load(features_npy)
            # Vérifier que le nombre de caractéristiques correspond au nombre d'œuvres
            if len(self.artwork_data) != self.features.shape[0]:
                print(f"Attention: Le nombre d'œuvres ({len(self.artwork_data)}) ne correspond pas au nombre de caractéristiques ({self.features.shape[0]})")
        
        # Charger les questions
        if os.path.exists(questions_json):
            with open(questions_json, 'r') as f:
                self.questions = json.load(f)
        else:
            # Créer quelques questions par défaut
            self.questions = [
                {
                    "id": 1, 
                    "text": "Quel est le style principal de cette œuvre ?",
                    "options": ["Renaissance", "Baroque", "Impressionnisme", "Cubisme", "Autre"]
                },
                {
                    "id": 2,
                    "text": "Quel est le sujet principal de cette œuvre ?",
                    "options": ["Portrait", "Paysage", "Nature morte", "Scène historique", "Scène religieuse", "Abstrait"]
                }
            ]
            # Sauvegarder les questions par défaut
            self.save_questions(self.questions)
    
    def save_questions(self, questions: List[Dict]) -> None:
        """
        Sauvegarde les questions
        
        Args:
            questions: Liste des questions
        """
        self.questions = questions
        questions_json = os.path.join(self.data_dir, 'questions.json')
        with open(questions_json, 'w') as f:
            json.dump(questions, f)
    
    def get_artwork_by_id(self, artwork_id: int) -> Optional[Dict]:
        """
        Récupère les informations d'une œuvre par son ID
        
        Args:
            artwork_id: ID de l'œuvre
        
        Returns:
            Dictionnaire contenant les informations de l'œuvre ou None si non trouvée
        """
        artwork = self.artwork_data[self.artwork_data['id'] == artwork_id]
        if len(artwork) == 0:
            return None
        return artwork.iloc[0].to_dict()
    
    def get_all_artworks(self) -> List[Dict]:
        """
        Récupère toutes les œuvres
        
        Returns:
            Liste des œuvres
        """
        return [row.to_dict() for _, row in self.artwork_data.iterrows()]
    
    def get_questions(self) -> List[Dict]:
        """
        Récupère toutes les questions
        
        Returns:
            Liste des questions
        """
        return self.questions
    
    def add_artwork(self, artwork: Dict) -> int:
        """
        Ajoute une nouvelle œuvre
        
        Args:
            artwork: Dictionnaire contenant les informations de l'œuvre
        
        Returns:
            ID de la nouvelle œuvre
        """
        # Générer un nouvel ID
        new_id = 0 if len(self.artwork_data) == 0 else self.artwork_data['id'].max() + 1
        artwork['id'] = new_id
        
        # Ajouter l'œuvre au DataFrame
        self.artwork_data = pd.concat([self.artwork_data, pd.DataFrame([artwork])], ignore_index=True)
        
        # Sauvegarder les données
        artwork_csv = os.path.join(self.data_dir, 'artworks.csv')
        self.artwork_data.to_csv(artwork_csv, index=False)
        
        return new_id
    
    def update_features(self, features: np.ndarray) -> None:
        """
        Met à jour les caractéristiques des œuvres
        
        Args:
            features: Matrice de caractéristiques
        """
        self.features = features
        features_npy = os.path.join(self.data_dir, 'features.npy')
        np.save(features_npy, features)
    
    def get_features(self) -> Optional[np.ndarray]:
        """
        Récupère les caractéristiques
        
        Returns:
            Matrice de caractéristiques ou None si non disponibles
        """
        return self.features 