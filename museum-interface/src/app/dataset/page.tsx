"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, Search, Filter, Image as ImageIcon } from "lucide-react";
import { api, Artwork } from "@/services/api";
import { toast } from "sonner";

export default function DatasetPage() {
  const [loading, setLoading] = useState(true);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  
  // Charger les œuvres d'art au chargement de la page
  useEffect(() => {
    async function loadArtworks() {
      try {
        setLoading(true);
        const data = await api.getArtworks();
        setArtworks(data);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des œuvres:", error);
        toast.error("Impossible de charger les œuvres d'art");
        setLoading(false);
      }
    }
    
    loadArtworks();
  }, []);
  
  // Filtrer les œuvres d'art en fonction du terme de recherche
  const filteredArtworks = artworks.filter(artwork => 
    artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(artwork.artist).toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(artwork.year).includes(searchTerm)
  );
  
  // Gestionnaire d'upload d'une nouvelle œuvre
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Créer un formulaire pour l'envoi de l'image
    const formData = new FormData();
    formData.append("title", "Nouvelle œuvre");
    formData.append("artist", "Inconnu");
    formData.append("year", String(new Date().getFullYear()));
    formData.append("image", file);
    
    try {
      setUploading(true);
      
      // TODO: Implémenter l'upload réel vers le backend
      // const newArtwork = await api.uploadArtwork("Nouvelle œuvre", "Inconnu", new Date().getFullYear(), file);
      
      // Simuler un délai pour l'instant
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Œuvre ajoutée avec succès");
      setUploading(false);
      
      // Recharger les œuvres
      const data = await api.getArtworks();
      setArtworks(data);
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      toast.error("Erreur lors de l'ajout de l'œuvre");
      setUploading(false);
    }
  };
  
  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Chargement des œuvres d'art...</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Collection d'œuvres</h1>
        <p className="text-muted-foreground">
          Consultez et gérez les œuvres d'art disponibles pour la classification.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par titre, artiste ou année..."
            className="pl-10 pr-4 py-2 w-full border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            <span>Filtrer</span>
          </Button>
          
          <label className="cursor-pointer">
            <Button className="gap-2" disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Upload en cours...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Ajouter une œuvre</span>
                </>
              )}
            </Button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>
      
      {filteredArtworks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
            <p className="text-muted-foreground text-center">
              {searchTerm 
                ? "Aucune œuvre ne correspond à votre recherche." 
                : "Aucune œuvre n'est disponible dans la collection."}
            </p>
            {searchTerm && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSearchTerm("")}
              >
                Effacer la recherche
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtworks.map(artwork => (
            <Card key={artwork.id} className="artwork-card">
              <div className="aspect-square overflow-hidden bg-secondary/30">
                <img
                  src={`http://localhost:8000/images/${artwork.imagepath}`}
                  alt={artwork.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium text-lg truncate">{artwork.title}</h3>
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>Artiste ID: {artwork.artist}</span>
                  <span>{artwork.year}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <div className="flex justify-between items-center text-sm text-muted-foreground mt-4">
        <span>Affichage de {filteredArtworks.length} sur {artworks.length} œuvres</span>
      </div>
    </div>
  );
} 