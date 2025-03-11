"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, Check, X, Info, HelpCircle, Loader2 } from "lucide-react";
import { api, Artwork, Question, ModelStats } from "@/services/api";
import { toast } from "sonner";

export default function LearningPage() {
  // États pour gérer les données et l'interface utilisateur
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentArtwork, setCurrentArtwork] = useState<Artwork | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [classification, setClassification] = useState<Record<string, string>>({});
  const [modelStats, setModelStats] = useState<ModelStats | null>(null);
  
  // Chargement initial des données
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        
        // Charger les questions
        const loadedQuestions = await api.getQuestions();
        setQuestions(loadedQuestions);
        
        // Charger l'œuvre suivante
        await loadNextArtwork();
        
        // Charger les statistiques du modèle
        await loadModelStats();
        
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement initial:", error);
        toast.error("Erreur lors du chargement des données");
        setLoading(false);
      }
    }
    
    loadInitialData();
  }, []);
  
  // Fonction pour charger la prochaine œuvre à classifier
  const loadNextArtwork = async () => {
    try {
      const artwork = await api.getNextArtwork();
      setCurrentArtwork(artwork);
      setClassification({});
    } catch (error) {
      console.error("Erreur lors du chargement de l'œuvre suivante:", error);
      toast.error("Impossible de charger l'œuvre suivante");
    }
  };
  
  // Fonction pour charger les statistiques du modèle
  const loadModelStats = async () => {
    try {
      const stats = await api.getModelStats();
      setModelStats(stats);
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
    }
  };
  
  // Fonction pour gérer la classification d'une œuvre
  const handleClassification = (questionId: number, answer: string) => {
    setClassification(prev => ({
      ...prev,
      [questionId.toString()]: answer
    }));
  };
  
  // Fonction pour soumettre la classification et passer à l'œuvre suivante
  const handleNext = async () => {
    if (!currentArtwork || !isArtworkClassified()) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Envoyer la classification au backend
      await api.classifyArtwork({
        artwork_id: currentArtwork.id,
        classification: classification
      });
      
      // Mettre à jour les statistiques
      await loadModelStats();
      
      // Charger l'œuvre suivante
      await loadNextArtwork();
      
      toast.success("Classification enregistrée avec succès");
      setSubmitting(false);
    } catch (error) {
      console.error("Erreur lors de la classification:", error);
      toast.error("Erreur lors de l'enregistrement de la classification");
      setSubmitting(false);
    }
  };
  
  // Fonction pour ignorer l'œuvre actuelle
  const handleSkip = () => {
    loadNextArtwork();
    toast.info("Œuvre ignorée");
  };
  
  // Vérifier si toutes les questions ont été répondues
  const isArtworkClassified = () => {
    return questions.every(q => classification[q.id.toString()]);
  };
  
  // Affichage d'un écran de chargement pendant l'initialisation
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Chargement de l'interface d'apprentissage...</p>
      </div>
    );
  }
  
  // Afficher un message si aucune question n'est définie
  if (questions.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Apprentissage</h1>
          <p className="text-muted-foreground">
            Phase d'apprentissage où vous classifiez les œuvres d'art.
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Aucune question définie</CardTitle>
            <CardDescription>
              Vous devez d'abord créer des questions avant de commencer la classification.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <HelpCircle className="h-16 w-16 mx-auto text-muted-foreground opacity-20 mb-4" />
              <p className="text-muted-foreground mb-4">
                Vous devez d'abord créer des questions via l'onglet "Questionnaire" avant de pouvoir classifier les œuvres.
              </p>
              <Button 
                onClick={() => window.location.href = '/questionnaire'}
                className="mt-2"
              >
                Aller à la page Questionnaire
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Afficher un message si aucune œuvre n'est disponible
  if (!currentArtwork) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Apprentissage</h1>
          <p className="text-muted-foreground">
            Phase d'apprentissage où vous classifiez les œuvres d'art.
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Aucune œuvre disponible</CardTitle>
            <CardDescription>
              Toutes les œuvres ont été classifiées ou aucune œuvre n'est disponible dans le système.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center py-8 text-muted-foreground">
              Vous avez classifié toutes les œuvres disponibles ou aucune œuvre n'a été ajoutée au système.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Calculer les valeurs dérivées pour l'affichage
  const progress = modelStats ? (modelStats.classified_count / modelStats.total_count) * 100 : 0;
  const modelConfidence = modelStats ? Math.round(modelStats.accuracy * 100) : 0;
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Apprentissage Actif</h1>
        <p className="text-muted-foreground">
          Répondez aux questions pour chaque œuvre. L'algorithme sélectionne intelligemment les œuvres pour apprendre plus efficacement de vos réponses.
        </p>
      </div>
      
      <Card className="border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-medium mb-1">Comment fonctionne l'apprentissage actif ?</h3>
            <p className="text-sm text-muted-foreground">
              1. <strong>Vous répondez aux questions</strong> pour l'œuvre affichée<br/>
              2. <strong>L'algorithme apprend</strong> de vos réponses et améliore son modèle<br/>
              3. <strong>Le système sélectionne</strong> les œuvres les plus pertinentes à vous montrer ensuite
            </p>
          </div>
        </div>
      </Card>
      
      <div className="flex justify-between items-center">
        <div className="text-sm">
          Œuvres classifiées: {modelStats?.classified_count || 0} sur {modelStats?.total_count || 0}
        </div>
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">
            Précision du modèle: <span className="font-medium text-foreground">{modelConfidence}%</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 grid md:grid-cols-2 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Œuvre à classifier</CardTitle>
            <CardDescription>
              {currentArtwork.title} par Artiste ID: {currentArtwork.artist}, {currentArtwork.year}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <div className="border rounded-lg overflow-hidden artwork-card">
              <img
                src={`http://localhost:8000/images/${currentArtwork.imagepath}`}
                alt={currentArtwork.title}
                className="w-full h-[400px] object-contain bg-secondary/30"
              />
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button
              variant="outline"
              onClick={handleSkip}
              disabled={submitting}
            >
              <X className="h-4 w-4 mr-2" />
              Ignorer
            </Button>
            <Button 
              onClick={handleNext} 
              disabled={!isArtworkClassified() || submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Classification...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Classifier
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Questions de classification</CardTitle>
            <CardDescription>
              Répondez à ces questions pour cette œuvre
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {questions.map((question) => (
                <div key={question.id} className="space-y-3">
                  <h3 className="font-medium">{question.text}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {question.options.map((option) => (
                      <Button
                        key={option}
                        variant={classification[question.id.toString()] === option ? "default" : "outline"}
                        className="justify-start"
                        onClick={() => handleClassification(question.id, option)}
                        disabled={submitting}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progression globale</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {modelStats && modelStats.classified_count > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              <span>Analyse de l'œuvre</span>
            </CardTitle>
            <CardDescription>
              Prédictions actuelles du modèle pour cette œuvre (basées sur vos classifications précédentes)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Affichage de l'analyse est simulé pour l'instant */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Style prédit</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Impressionnisme</span>
                  <span className="text-xs font-medium bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                    {Math.round(70 + modelConfidence * 0.1)}% de confiance
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Post-Impressionnisme</span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                    {Math.round(15 - modelConfidence * 0.05)}% de confiance
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Sujet</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Paysage</span>
                  <span className="text-xs font-medium bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                    {Math.round(85 + modelConfidence * 0.05)}% de confiance
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Nature</span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                    {Math.round(10 - modelConfidence * 0.05)}% de confiance
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Palette de couleurs</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Vive</span>
                  <span className="text-xs font-medium bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                    {Math.round(60 + modelConfidence * 0.1)}% de confiance
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tons froids</span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                    {Math.round(25 - modelConfidence * 0.05)}% de confiance
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 