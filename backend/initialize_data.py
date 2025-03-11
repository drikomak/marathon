#!/usr/bin/env python3
"""
Script d'initialisation du système d'active learning pour les œuvres d'art.
Charge les données depuis le répertoire source et initialise le système.
"""

import os
import sys
import argparse
from pathlib import Path

# Ajouter le répertoire parent au path pour pouvoir importer les modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.data_initializer import initialize_system

def main():
    # Analyser les arguments de la ligne de commande
    parser = argparse.ArgumentParser(description="Initialiser le système d'active learning avec des données existantes")
    parser.add_argument("--source", type=str, required=True, help="Répertoire source contenant les fichiers CSV et images")
    parser.add_argument("--data-dir", type=str, default="data", help="Répertoire de destination des données (par défaut: data)")
    
    args = parser.parse_args()
    
    # Convertir les chemins en chemins absolus
    source_dir = os.path.abspath(args.source)
    data_dir = os.path.abspath(args.data_dir)
    
    # Vérifier que le répertoire source existe
    if not os.path.exists(source_dir):
        print(f"Erreur: Le répertoire source {source_dir} n'existe pas.")
        return 1
    
    # Initialiser le système
    success = initialize_system(data_dir, source_dir)
    
    if success:
        print(f"Le système a été initialisé avec succès!")
        print(f"Données enregistrées dans: {data_dir}")
        return 0
    else:
        print("Erreur lors de l'initialisation du système.")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 