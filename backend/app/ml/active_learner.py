import numpy as np
from typing import Dict, List, Tuple, Set, Optional
from sklearn.metrics.pairwise import euclidean_distances
import pandas as pd
import os
import json

class ActiveLearner:
    """
    Implémentation de l'algorithme d'active learning pour la classification des œuvres d'art.
    
    Cette implémentation suit l'algorithme décrit dans le README:
    1. Sélection des images les plus éloignées pour les premières classifications
    2. Optimisation de la frontière de décision
    3. Sélection des images proches de la frontière
    """
    
    def __init__(self, features: np.ndarray, artwork_data: pd.DataFrame):
        """
        Initialise le learner avec les caractéristiques et les données des œuvres
        
        Args:
            features: Matrice de caractéristiques (une ligne par œuvre)
            artwork_data: DataFrame contenant les métadonnées des œuvres
        """
        self.features = features
        self.artwork_data = artwork_data
        self.num_artworks = features.shape[0]
        
        # Structures de données pour suivre les classifications
        self.labeled_indices: Set[int] = set()  # Indices des œuvres classifiées
        self.classifications: Dict[int, Dict[str, str]] = {}  # Classifications par œuvre et question
        
        # Structures pour les classes
        self.class_assignments: Dict[int, str] = {}  # Classe attribuée à chaque œuvre
        self.class_vectors: Dict[str, np.ndarray] = {}  # Vecteur moyen par classe
        
        # Historique d'apprentissage
        self.learning_curve: List[float] = []
        self.accuracy: float = 0.0
    
    def _compute_distance_matrix(self) -> np.ndarray:
        """
        Calcule la matrice des distances euclidiennes entre toutes les images
        
        Returns:
            Matrice des distances carrées
        """
        return euclidean_distances(self.features, squared=True)
    
    def get_next_artwork(self) -> Tuple[int, Dict]:
        """
        Sélectionne la prochaine œuvre à classifier selon la stratégie d'active learning
        
        Returns:
            Tuple contenant l'index de l'œuvre et ses métadonnées
        """
        # Si aucune œuvre n'a été classifiée, sélectionner deux œuvres les plus éloignées
        if len(self.labeled_indices) == 0:
            # Calculer la matrice des distances
            distance_matrix = self._compute_distance_matrix()
            
            # Trouver les deux œuvres les plus éloignées
            i, j = np.unravel_index(np.argmax(distance_matrix), distance_matrix.shape)
            
            # Retourner la première
            return i, self.artwork_data.iloc[i].to_dict()
        
        # Si une seule œuvre a été classifiée, retourner la plus éloignée
        elif len(self.labeled_indices) == 1:
            labeled_idx = list(self.labeled_indices)[0]
            
            # Calculer les distances par rapport à l'œuvre déjà classifiée
            distances = euclidean_distances([self.features[labeled_idx]], self.features)[0]
            
            # Ignorer les œuvres déjà classifiées
            distances[list(self.labeled_indices)] = -1
            
            # Sélectionner l'œuvre la plus éloignée
            next_idx = np.argmax(distances)
            return next_idx, self.artwork_data.iloc[next_idx].to_dict()
        
        # Si on a des œuvres de deux classes différentes
        elif len(set(self.class_assignments.values())) >= 2:
            # Calculer le vecteur normal à la frontière de décision
            classes = set(self.class_assignments.values())
            class_vectors = {}
            
            # Calculer le vecteur moyen pour chaque classe
            for class_name in classes:
                indices = [idx for idx, cls in self.class_assignments.items() if cls == class_name]
                if indices:
                    class_vectors[class_name] = np.mean([self.features[idx] for idx in indices], axis=0)
            
            # Si on a au moins deux classes avec des vecteurs
            if len(class_vectors) >= 2:
                class_names = list(class_vectors.keys())
                # Calculer le vecteur normal w (différence entre les moyennes des classes)
                w = class_vectors[class_names[0]] - class_vectors[class_names[1]]
                
                # Calculer les produits scalaires avec w
                products = np.dot(self.features, w)
                
                # Trouver les œuvres les plus proches de la frontière (produit scalaire proche de 0)
                absolute_products = np.abs(products)
                
                # Ignorer les œuvres déjà classifiées
                absolute_products[list(self.labeled_indices)] = float('inf')
                
                # Sélectionner l'œuvre la plus proche de la frontière
                next_idx = np.argmin(absolute_products)
                return next_idx, self.artwork_data.iloc[next_idx].to_dict()
        
        # Si toutes les œuvres classifiées appartiennent à la même classe
        # Sélectionner l'œuvre la plus éloignée du centre des œuvres classifiées
        labeled_features = self.features[list(self.labeled_indices)]
        center = np.mean(labeled_features, axis=0)
        
        # Calculer les distances par rapport au centre
        distances = euclidean_distances([center], self.features)[0]
        
        # Ignorer les œuvres déjà classifiées
        distances[list(self.labeled_indices)] = -1
        
        # Sélectionner l'œuvre la plus éloignée
        next_idx = np.argmax(distances)
        return next_idx, self.artwork_data.iloc[next_idx].to_dict()
    
    def update(self, artwork_id: int, classification: Dict[str, str]) -> None:
        """
        Met à jour le modèle avec une nouvelle classification
        
        Args:
            artwork_id: ID de l'œuvre
            classification: Dictionnaire des classifications (question -> réponse)
        """
        # Trouver l'index de l'œuvre dans le DataFrame
        artwork_idx = self.artwork_data[self.artwork_data['id'] == artwork_id].index[0]
        
        # Enregistrer la classification
        self.labeled_indices.add(artwork_idx)
        self.classifications[artwork_idx] = classification
        
        # Extraire la classification principale (par simplicité, on prend la première question/réponse)
        if classification:
            first_key = list(classification.keys())[0]
            class_label = classification[first_key]
            self.class_assignments[artwork_idx] = class_label
            
            # Mettre à jour les vecteurs de classe
            classes = set(self.class_assignments.values())
            for class_name in classes:
                indices = [idx for idx, cls in self.class_assignments.items() if cls == class_name]
                if indices:
                    self.class_vectors[class_name] = np.mean([self.features[idx] for idx in indices], axis=0)
        
        # Mettre à jour la courbe d'apprentissage (simulation)
        self._update_learning_curve()
    
    def _update_learning_curve(self) -> None:
        """
        Met à jour la courbe d'apprentissage en fonction du nombre d'œuvres classifiées
        Note: dans un cas réel, on calculerait la précision sur un ensemble de validation
        """
        progress = len(self.labeled_indices) / self.num_artworks
        # Simulation d'une courbe d'apprentissage qui s'améliore avec plus de données
        # La formule ci-dessous est juste une approximation pour simuler l'amélioration
        self.accuracy = min(0.5 + 0.45 * (1 - np.exp(-5 * progress)), 0.95)
        self.learning_curve.append(self.accuracy)
    
    def get_stats(self) -> Dict:
        """
        Retourne les statistiques actuelles du modèle
        
        Returns:
            Dictionnaire contenant les statistiques
        """
        # Distribution de confiance (simulée)
        confidence_ranges = ["90-100%", "80-89%", "70-79%", "60-69%", "50-59%", "<50%"]
        
        # Simuler une distribution basée sur l'accuracy actuelle
        confidence_distribution = {}
        unlabeled_count = self.num_artworks - len(self.labeled_indices)
        
        if self.accuracy > 0.9:
            confidence_distribution = {
                "90-100%": int(unlabeled_count * 0.4),
                "80-89%": int(unlabeled_count * 0.3),
                "70-79%": int(unlabeled_count * 0.2),
                "60-69%": int(unlabeled_count * 0.05),
                "50-59%": int(unlabeled_count * 0.03),
                "<50%": int(unlabeled_count * 0.02)
            }
        elif self.accuracy > 0.8:
            confidence_distribution = {
                "90-100%": int(unlabeled_count * 0.2),
                "80-89%": int(unlabeled_count * 0.4),
                "70-79%": int(unlabeled_count * 0.2),
                "60-69%": int(unlabeled_count * 0.1),
                "50-59%": int(unlabeled_count * 0.05),
                "<50%": int(unlabeled_count * 0.05)
            }
        else:
            confidence_distribution = {
                "90-100%": int(unlabeled_count * 0.05),
                "80-89%": int(unlabeled_count * 0.15),
                "70-79%": int(unlabeled_count * 0.2),
                "60-69%": int(unlabeled_count * 0.3),
                "50-59%": int(unlabeled_count * 0.2),
                "<50%": int(unlabeled_count * 0.1)
            }
        
        return {
            "accuracy": float(self.accuracy),
            "classified_count": len(self.labeled_indices),
            "total_count": self.num_artworks,
            "confidence_distribution": confidence_distribution,
            "learning_curve": self.learning_curve,
            "class_distribution": {cls: len([idx for idx, c in self.class_assignments.items() if c == cls]) 
                                  for cls in set(self.class_assignments.values())} if self.class_assignments else {}
        }

    def save_state(self, filepath: str) -> None:
        """
        Sauvegarde l'état du modèle
        
        Args:
            filepath: Chemin du fichier de sauvegarde
        """
        state = {
            "labeled_indices": list(self.labeled_indices),
            "classifications": {str(k): v for k, v in self.classifications.items()},
            "class_assignments": {str(k): v for k, v in self.class_assignments.items()},
            "learning_curve": self.learning_curve,
            "accuracy": self.accuracy
        }
        
        with open(filepath, 'w') as f:
            json.dump(state, f)
    
    def load_state(self, filepath: str) -> None:
        """
        Charge l'état du modèle
        
        Args:
            filepath: Chemin du fichier de sauvegarde
        """
        if not os.path.exists(filepath):
            return
        
        with open(filepath, 'r') as f:
            state = json.load(f)
        
        self.labeled_indices = set(state["labeled_indices"])
        self.classifications = {int(k): v for k, v in state["classifications"].items()}
        self.class_assignments = {int(k): v for k, v in state["class_assignments"].items()}
        self.learning_curve = state["learning_curve"]
        self.accuracy = state["accuracy"]
        
        # Recalculer les vecteurs de classe
        classes = set(self.class_assignments.values())
        for class_name in classes:
            indices = [idx for idx, cls in self.class_assignments.items() if cls == class_name]
            if indices:
                self.class_vectors[class_name] = np.mean([self.features[idx] for idx in indices], axis=0) 