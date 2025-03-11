/**
 * Service d'API pour interagir avec le backend d'active learning
 */

import axios from 'axios';

// Configuration de base
const API_BASE_URL = 'http://localhost:8000/api';

// Création d'une instance axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types de données
export interface Artwork {
  id: number;
  title: string;
  artist: string;
  year: number;
  imagepath: string;
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correct_answer?: string;
}

export interface Classification {
  artwork_id: number;
  classification: Record<string, string>;
}

export interface ModelStats {
  accuracy: number;
  classified_count: number;
  total_count: number;
  confidence_distribution: Record<string, number>;
  learning_curve: number[];
  class_distribution?: Record<string, number>;
}

// Service API
export const api = {
  // Vérification du statut du backend
  async getStatus() {
    try {
      const response = await apiClient.get('/status');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la vérification du statut de l\'API:', error);
      return { status: 'error', message: 'Impossible de se connecter au backend' };
    }
  },

  // Récupération de toutes les œuvres d'art
  async getArtworks(): Promise<Artwork[]> {
    const response = await apiClient.get('/artworks');
    return response.data;
  },

  // Récupération d'une œuvre d'art par son ID
  async getArtworkById(id: number): Promise<Artwork> {
    const response = await apiClient.get(`/artworks/${id}`);
    return response.data;
  },

  // Récupération de la prochaine œuvre à classifier
  async getNextArtwork(): Promise<Artwork> {
    const response = await apiClient.get('/next-artwork');
    return response.data;
  },

  // Classification d'une œuvre d'art
  async classifyArtwork(classification: Classification): Promise<{ status: string }> {
    const response = await apiClient.post('/artworks/classify', classification);
    return response.data;
  },

  // Récupération des statistiques du modèle
  async getModelStats(): Promise<ModelStats> {
    const response = await apiClient.get('/model/stats');
    return response.data;
  },

  // Récupération des questions
  async getQuestions(): Promise<Question[]> {
    const response = await apiClient.get('/questions');
    return response.data;
  },

  // Création d'une nouvelle question
  async createQuestion(question: Omit<Question, 'id'>): Promise<Question> {
    const response = await apiClient.post('/questions', question);
    return response.data;
  },

  // Mise à jour d'une question existante
  async updateQuestion(id: number, question: Omit<Question, 'id'>): Promise<Question> {
    const response = await apiClient.put(`/questions/${id}`, question);
    return response.data;
  },

  // Suppression d'une question
  async deleteQuestion(id: number): Promise<{ status: string }> {
    const response = await apiClient.delete(`/questions/${id}`);
    return response.data;
  },

  // Téléchargement d'une nouvelle œuvre d'art
  async uploadArtwork(title: string, artist: string, year: number, image: File): Promise<Artwork> {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('year', String(year));
    formData.append('image', image);

    const response = await axios.post(`${API_BASE_URL}/artworks/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
}; 