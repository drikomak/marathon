#!/bin/bash

# Répertoire du script
SCRIPT_DIR=$(dirname "$(readlink -f "$0")")
cd "$SCRIPT_DIR"

# Vérifie si les arguments sont fournis
if [ "$1" == "--init" ]; then
    # Vérifie si le chemin source est fourni
    if [ -z "$2" ]; then
        echo "Erreur: Veuillez fournir le chemin du répertoire source"
        echo "Usage: $0 --init <chemin_source>"
        exit 1
    fi
    
    # Initialise les données
    SOURCE_PATH="$2"
    echo "Initialisation des données depuis $SOURCE_PATH..."
    python initialize_data.py --source "$SOURCE_PATH"
    
    # Vérifie si l'initialisation a réussi
    if [ $? -ne 0 ]; then
        echo "Erreur: L'initialisation des données a échoué"
        exit 1
    fi
fi

# Démarrer le backend
echo "Démarrage du backend..."
python main.py 