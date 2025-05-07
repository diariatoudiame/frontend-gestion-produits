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


}

export default new AuthService();