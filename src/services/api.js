// api.js - Module pour les appels API
import axios from 'axios';

// Créer une instance axios avec une configuration de base
const api = axios.create({
    baseURL: process.env.VUE_APP_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Intercepteur pour ajouter le token d'authentification aux requêtes
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        // Gestion des erreurs 401 (non autorisé) - redirection vers login
        if (error.response && error.response.status === 401) {
            // Redirection vers la page de login ou déconnexion
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Si vous utilisez vue-router en dehors de ce fichier, vous pourriez
            // émettre un événement que le composant App.vue écouterait
            window.dispatchEvent(new CustomEvent('unauthorized'));

            // Ou si vous avez importé le router ici:
            // router.push('/login');
        }
        return Promise.reject(error);
    }
);

export default api;