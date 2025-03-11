import os
import shutil
import pandas as pd
import numpy as np
from pathlib import Path
from tqdm import tqdm
import csv

from ..ml.feature_extractor import FeatureExtractor

class DataInitializer:
    """
    Classe pour initialiser les données du système à partir de fichiers existants
    """
    def __init__(self, data_dir: str, source_dir: str):
        """
        Initialise l'outil de chargement des données
        
        Args:
            data_dir: Répertoire de destination des données
            source_dir: Répertoire source contenant les fichiers CSV et images
        """
        self.data_dir = data_dir
        self.source_dir = source_dir
        self.images_dir = os.path.join(data_dir, "images")
        
        # Créer les répertoires nécessaires
        os.makedirs(self.data_dir, exist_ok=True)
        os.makedirs(self.images_dir, exist_ok=True)

    def load_csv_data(self):
        """
        Charge les données depuis les fichiers CSV
        """
        images_csv_path = os.path.join(self.source_dir, "images.csv")
        
        # Vérifier si le fichier existe
        if not os.path.exists(images_csv_path):
            print(f"Fichier non trouvé: {images_csv_path}")
            return None
        
        # Charger les données
        try:
            # Le fichier utilise des points-virgules comme séparateurs et a des guillemets
            df = pd.read_csv(images_csv_path, sep=';', quotechar='"')
            
            # Renommer les colonnes pour correspondre à notre modèle
            column_mapping = {
                'id': 'id',
                'title': 'title',
                'artistid': 'artist',  # Nous utiliserons l'ID de l'artiste pour l'instant
                'year': 'year',
                'imagepath': 'imagepath'
            }
            
            # Sélectionner uniquement les colonnes dont nous avons besoin
            df_cleaned = df[list(column_mapping.keys())].copy()
            
            # Renommer les colonnes
            df_cleaned.rename(columns=column_mapping, inplace=True)
            
            # Convertir l'année en entier (en gérant les cas où ce n'est pas un nombre)
            df_cleaned['year'] = pd.to_numeric(df_cleaned['year'].str.replace('"', ''), errors='coerce').fillna(0).astype(int)
            
            # Assurez-vous que l'ID est un entier
            df_cleaned['id'] = df_cleaned['id'].astype(int)
            
            # Enregistrer le DataFrame nettoyé
            df_cleaned.to_csv(os.path.join(self.data_dir, "artworks.csv"), index=False)
            
            print(f"Données chargées avec succès: {len(df_cleaned)} œuvres d'art")
            return df_cleaned
            
        except Exception as e:
            print(f"Erreur lors du chargement des données: {e}")
            return None

    def copy_images(self):
        """
        Copie les images depuis le répertoire source vers le répertoire de destination
        """
        source_images_dir = os.path.join(self.source_dir, "images")
        
        # Vérifier si le répertoire existe
        if not os.path.exists(source_images_dir):
            print(f"Répertoire non trouvé: {source_images_dir}")
            return False
        
        # Lire le fichier CSV pour obtenir les noms des images
        df = pd.read_csv(os.path.join(self.data_dir, "artworks.csv"))
        image_files = df['imagepath'].tolist()
        
        # Copier les images
        counter = 0
        for img_file in tqdm(image_files, desc="Copie des images"):
            src_path = os.path.join(source_images_dir, os.path.basename(img_file))
            dst_path = os.path.join(self.images_dir, os.path.basename(img_file))
            
            # Vérifier si l'image source existe
            if os.path.exists(src_path):
                # Vérifier si l'image de destination n'existe pas déjà
                if not os.path.exists(dst_path):
                    try:
                        shutil.copy2(src_path, dst_path)
                        counter += 1
                    except Exception as e:
                        print(f"Erreur lors de la copie de {img_file}: {e}")
                else:
                    counter += 1  # L'image existe déjà, on la compte quand même
        
        print(f"Images copiées avec succès: {counter} sur {len(image_files)}")
        return True

    def extract_features(self):
        """
        Extrait les caractéristiques des images pour l'algorithme d'active learning
        """
        # Lire le fichier CSV pour obtenir les chemins des images
        df = pd.read_csv(os.path.join(self.data_dir, "artworks.csv"))
        image_files = df['imagepath'].tolist()
        
        # Initialiser l'extracteur de caractéristiques
        extractor = FeatureExtractor()
        
        # Préparer les chemins complets des images
        image_paths = [os.path.join(self.images_dir, img) for img in image_files]
        
        # Vérifier quelles images existent réellement
        existing_paths = [path for path in image_paths if os.path.exists(path)]
        
        if not existing_paths:
            print("Aucune image trouvée pour extraire les caractéristiques")
            return False
        
        # Extraire les caractéristiques
        print(f"Extraction des caractéristiques pour {len(existing_paths)} images...")
        features = extractor.batch_extract_features(existing_paths)
        
        # Enregistrer les caractéristiques
        features_path = os.path.join(self.data_dir, "features.npy")
        np.save(features_path, features)
        
        print(f"Caractéristiques extraites et enregistrées: {features.shape}")
        return True

    def initialize(self):
        """
        Initialise le système avec les données existantes
        """
        print("Initialisation du système avec les données existantes...")
        
        # Charger les données CSV
        df = self.load_csv_data()
        if df is None:
            return False
        
        # Copier les images
        if not self.copy_images():
            return False
        
        # Extraire les caractéristiques
        if not self.extract_features():
            return False
        
        print("Initialisation terminée avec succès!")
        return True


def initialize_system(data_dir: str, source_dir: str):
    """
    Fonction utilitaire pour initialiser le système
    
    Args:
        data_dir: Répertoire de destination des données
        source_dir: Répertoire source contenant les fichiers CSV et images
    
    Returns:
        True si l'initialisation a réussi, False sinon
    """
    initializer = DataInitializer(data_dir, source_dir)
    return initializer.initialize() 