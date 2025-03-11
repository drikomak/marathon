import torch
import timm
import numpy as np
from torchvision import transforms
from PIL import Image
import os
from typing import List, Optional

class FeatureExtractor:
    """
    Extracteur de caractéristiques utilisant un modèle ResNet18 préentraîné
    """
    def __init__(self, model_name: str = 'resnet18', device: Optional[str] = None):
        # Déterminer le device (CPU ou GPU)
        if device is None:
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        else:
            self.device = torch.device(device)
        
        # Charger le modèle préentraîné sans la couche de classification
        self.model = timm.create_model(model_name, pretrained=True, num_classes=0)
        self.model.eval()
        self.model.to(self.device)
        
        # Définir les transformations pour les images
        self.transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])
    
    def extract_features(self, image_path: str) -> np.ndarray:
        """
        Extrait les caractéristiques d'une image
        
        Args:
            image_path: Chemin vers l'image
            
        Returns:
            Vecteur de caractéristiques de l'image
        """
        try:
            # Charger et transformer l'image
            image = Image.open(image_path).convert('RGB')
            image_tensor = self.transform(image).unsqueeze(0).to(self.device)
            
            # Extraire les caractéristiques
            with torch.no_grad():
                features = self.model(image_tensor)
            
            return features.cpu().numpy().flatten()
        
        except Exception as e:
            print(f"Erreur lors de l'extraction des caractéristiques de {image_path}: {e}")
            # Retourner un vecteur de zéros en cas d'erreur
            return np.zeros(512)  # ResNet18 produit un vecteur de 512 dimensions
    
    def batch_extract_features(self, image_paths: List[str], batch_size: int = 32) -> np.ndarray:
        """
        Extrait les caractéristiques d'un lot d'images
        
        Args:
            image_paths: Liste des chemins d'images
            batch_size: Taille du lot pour le traitement
            
        Returns:
            Matrice de caractéristiques (une ligne par image)
        """
        all_features = []
        
        for i in range(0, len(image_paths), batch_size):
            batch_paths = image_paths[i:i+batch_size]
            batch_tensors = []
            
            for path in batch_paths:
                try:
                    image = Image.open(path).convert('RGB')
                    tensor = self.transform(image)
                    batch_tensors.append(tensor)
                except Exception as e:
                    print(f"Erreur lors du chargement de {path}: {e}")
                    # Ajouter un tenseur de zéros en cas d'erreur
                    batch_tensors.append(torch.zeros(3, 224, 224))
            
            # Combiner les tensors en un seul batch
            batch = torch.stack(batch_tensors).to(self.device)
            
            # Extraire les caractéristiques
            with torch.no_grad():
                features = self.model(batch)
            
            all_features.append(features.cpu().numpy())
        
        # Concaténer tous les lots
        return np.vstack(all_features) 