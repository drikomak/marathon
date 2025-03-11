# Interface de Classification d'Œuvres d'Art avec Active Learning

Ce projet permet au personnel des musées de classifier des œuvres d'art avec un algorithme d'active learning qui apprend efficacement à partir des classifications humaines.

## Comment démarrer

### Avec les données existantes

Pour démarrer le système avec les données d'œuvres d'art déjà existantes :

```bash
# Installer les dépendances
cd museum-interface
npm install

cd ../backend
pip install -r requirements.txt

# Lancer l'application avec initialisation des données
cd ../museum-interface
npm run dev:init
```

### Fonctionnement du système

1. **Créez vos questions de classification** :
   - Allez dans l'onglet "Questionnaire"
   - Créez des questions avec leurs réponses possibles (ex: "Est-ce une nature morte ou un portrait?")

2. **Classifiez les œuvres** :
   - Allez dans l'onglet "Learning Phase"
   - L'algorithme vous montrera des œuvres d'art
   - Répondez aux questions pour chaque œuvre
   - L'algorithme sélectionne intelligemment les œuvres à vous montrer pour maximiser l'apprentissage

3. **Suivez la progression** :
   - L'onglet "Progress Curve" vous montre l'évolution des performances
   - Plus vous classifiez d'œuvres, plus l'algorithme devient précis

## Structure du projet

- `museum-interface/` : Interface utilisateur frontend (Next.js)
- `backend/` : API et algorithme d'active learning (FastAPI)

## Architecture

Le projet est composé de deux parties principales :

1. **Frontend** : Application web Next.js avec Tailwind CSS pour l'interface utilisateur
2. **Backend** : API FastAPI avec algorithme d'active learning pour la classification des œuvres

## 🚀 Installation et démarrage

### Prérequis

- Node.js 18+ et npm
- Python 3.9+
- Pip pour l'installation des dépendances Python

### Installation du frontend

```bash
# Se positionner dans le répertoire museum-interface
cd museum-interface

# Installer les dépendances
npm install
```

### Installation du backend

```bash
# Se positionner dans le répertoire backend
cd backend

# Installer les dépendances Python
pip install -r requirements.txt

# Créer les répertoires nécessaires
mkdir -p data/images
```

### Démarrage de l'application

Vous pouvez démarrer le frontend et le backend séparément :

```bash
# Démarrer le backend (depuis le répertoire backend)
python main.py

# Démarrer le frontend (depuis le répertoire museum-interface)
npm run dev
```

Ou les deux en même temps (depuis le répertoire museum-interface) :

```bash
npm run dev:all
```

L'application sera accessible à l'adresse : [http://localhost:3000](http://localhost:3000)

## 🖥️ Utilisation de l'interface

### 1. Configuration des questions

1. Accédez à la page "Questionnaire" pour créer et gérer les questions que vous souhaitez poser sur les œuvres d'art
2. Créez différentes questions avec leurs options de réponse

### 2. Ajout d'œuvres d'art

Avant de commencer le processus d'apprentissage, vous devez ajouter des œuvres d'art au système :

1. Accédez à la page "Dataset"
2. Utilisez le formulaire pour ajouter de nouvelles œuvres avec leurs métadonnées et images

### 3. Phase d'apprentissage

1. Accédez à la page "Learning Phase"
2. Le système vous présentera automatiquement les œuvres à classifier selon l'algorithme d'active learning
3. Répondez aux questions pour chaque œuvre et cliquez sur "Classifier"
4. Le système apprendra progressivement de vos classifications

### 4. Suivi des performances

1. Consultez la page "Progress Curve" pour voir l'évolution des performances du modèle
2. Analysez les différentes métriques pour évaluer la qualité de la classification

## 🧠 Algorithme d'Active Learning

L'algorithme implémenté suit une approche en plusieurs étapes :

1. **Initialisation** : Sélection des œuvres les plus éloignées entre elles pour maximiser la diversité
2. **Construction de la frontière** : Classification pour établir une frontière de décision
3. **Optimisation** : Sélection des œuvres proches de la frontière de décision pour affiner le modèle
4. **Classification automatique** : Une fois suffisamment entraîné, le modèle peut classifier automatiquement de nouvelles œuvres

## 📁 Structure du projet

### Frontend (museum-interface)

```
museum-interface/
├── src/
│   ├── app/                 # Pages de l'application
│   │   ├── layout/          # Composants de mise en page
│   │   └── ui/              # Composants d'interface utilisateur
│   └── services/            # Services d'API et utilitaires
└── public/                  # Fichiers statiques
```

### Backend (backend)

```
backend/
├── app/
│   ├── api/                 # Routes de l'API
│   ├── ml/                  # Algorithmes d'active learning
│   ├── models/              # Modèles de données
│   └── utils/               # Utilitaires
├── data/                    # Données persistantes
│   └── images/              # Images des œuvres d'art
└── main.py                  # Point d'entrée de l'application
``` 