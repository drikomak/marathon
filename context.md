# Projet : Interface Web pour Active Learning dans les Musées

## 📌 **Contexte**
Ce projet vise à créer une interface web permettant au personnel de musée d’utiliser un algorithme d’active learning pour classifier des œuvres d’art.  
L'objectif est de permettre à l'algorithme d'apprendre à reconnaître automatiquement des patterns en se basant sur des réponses fournies par le personnel du musée.

---

## 🎯 **Objectifs**
✅ Créer une interface intuitive et accessible pour le personnel du musée.  
✅ Permettre une interaction directe avec l'algorithme à travers une série de questions personnalisées.  
✅ Améliorer progressivement la précision de l'algorithme grâce à l'apprentissage actif.  
✅ Offrir une vue claire de la progression de l'algorithme via une courbe de performance.  
✅ Permettre la classification automatique une fois les patterns appris.  

---

## 🚀 **Fonctionnalités Clés**

### 1. **Module de questionnaire personnalisable**
- L'utilisateur (personnel du musée) peut :  
   - Poser une question personnalisée du type :  
     *"Est-ce que cette œuvre est une nature morte ou un portrait ?"*  
   - Définir les choix de réponse (exemple : `Nature morte`, `Portrait`, `Abstrait`).  
   - Les questions peuvent être fermées (choix multiples) ou ouvertes (réponses textuelles).  
   - Interface conviviale avec champs pré-remplis, suggestions automatiques, et boutons clairs.  

---

### 2. **Phase d'apprentissage supervisé (active learning)**
- L'algorithme présente une série d'œuvres à l'utilisateur.  
- L'utilisateur répond aux questions en sélectionnant les options proposées.  
- L'algorithme ajuste progressivement son modèle en fonction des réponses fournies :  
   - Exclusion automatique des réponses incohérentes.  
   - Poids ajusté en fonction de la confiance dans les réponses.  
   - Augmentation de la précision avec chaque itération.  
- L'interface affiche :  
   - Une barre de progression pour visualiser le nombre d'œuvres classées.  
   - Une courbe de progression pour montrer l'amélioration des performances de l'algorithme.  
   - Messages de feedback pour informer l'utilisateur de l'évolution du modèle.  

---

### 3. **Phase de classification automatique**
- Une fois que l'algorithme atteint un seuil de confiance défini :  
   - L'algorithme classe automatiquement les œuvres restantes.  
   - L'interface affiche une liste de toutes les œuvres classées avec le statut (confiance élevée, moyenne, faible).  
   - Possibilité de réviser une classification manuellement en cas d'erreur.  
- L'interface fournit :  
   - Un résumé des performances (précision globale, faux positifs/négatifs).  
   - Une option pour exporter les résultats au format CSV/PDF.  

---

### 4. **Courbe de progression en temps réel**
- Graphique interactif montrant :  
   - La précision de l'algorithme au fil du temps.  
   - Le nombre d'œuvres correctement classées.  
   - La vitesse d'apprentissage (réduction du temps de classification).  
- Option pour filtrer les résultats par catégorie (type d'œuvre, période, style).  
- Possibilité de zoomer sur des périodes spécifiques.  

---

## 🎨 **Design de l'interface**
➡️ **Barre latérale de navigation** pour accéder rapidement aux fonctionnalités principales.  
➡️ **Interface moderne** avec une palette de couleurs sobre et élégante adaptée au contexte muséal.  
➡️ **Accessibilité** : taille de police ajustable, mode sombre/clair.  
➡️ **Réactivité** : interface adaptée aux tablettes et smartphones.  


---

## 🔨 **Étape actuelle**
✅ **Phase de développement du frontend**  
- Mise en place de l'interface utilisateur.  
- Création du système de questionnaire.  
- Développement du module de courbe de progression.  

🚧 **Prochaines étapes**  
- Intégration de l'algorithme d'active learning avec le backend.  
- Configuration de la base de données et gestion des états via Supabase.  
- Tests utilisateurs et ajustements.  