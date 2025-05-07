// Méthode à ajouter à votre AuthService existant
import api from './api';

class AuthService {
    // Méthodes existantes...
    register(user) {
        return api.post('/register', user);
    }

    login(user) {
        return api.post('/login', user)
            .then(response => {
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }

                return response.data;
            });
    }

    logout() {
        return api.post('/logout')
            .then(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            });
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('user'));
    }

    isLoggedIn() {
        return !!localStorage.getItem('token');
    }

    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    }

    // Nouvelle méthode à ajouter pour vérifier l'existence d'un email
    checkEmailExists(email) {
        return api.post('/check-email', { email })
            .then(response => response.data)
            .catch(error => {
                console.error('Error checking email:', error);
                throw error;
            });
    }
}

export default new AuthService();