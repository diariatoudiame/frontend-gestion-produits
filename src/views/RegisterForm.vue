<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <div class="register-logo">
          <i class="fas fa-box-open"></i>
        </div>
        <h1>Gestion de Produits</h1>
        <p>Créez votre compte pour commencer</p>
      </div>

      <div class="register-body">
        <div v-if="error" class="alert alert-danger" role="alert">
          <i class="fas fa-exclamation-circle me-2"></i>{{ error }}
        </div>

        <form @submit.prevent="register">
          <!-- Nom Complet -->
          <div class="form-group">
            <label for="name">Nom Complet</label>
            <div class="input-group">
              <span class="input-icon">
                <i class="fas fa-user"></i>
              </span>
              <input
                  v-model="user.name"
                  type="text"
                  id="name"
                  class="form-control"
                  placeholder="Votre nom complet"
                  required
              />
            </div>
          </div>

          <!-- Email -->
          <div class="form-group">
            <label for="email">Email</label>
            <div class="input-group">
              <span class="input-icon">
                <i class="fas fa-envelope"></i>
              </span>
              <input
                  v-model="user.email"
                  type="email"
                  id="email"
                  class="form-control"
                  placeholder="Votre adresse email"
                  required
                  autocomplete="email"
              />
            </div>
            <small v-if="emailError" class="form-text text-danger">{{ emailError }}</small>
          </div>

          <!-- Mot de passe -->
          <div class="form-group">
            <label for="password">Mot de passe</label>
            <div class="input-group">
              <span class="input-icon">
                <i class="fas fa-lock"></i>
              </span>
              <input
                  v-model="user.password"
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  class="form-control"
                  placeholder="Créez un mot de passe"
                  required
                  @input="checkPasswordStrength"
              />
              <span class="password-toggle" @click="togglePassword">
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </span>
            </div>

            <div class="password-strength-meter mt-2">
              <div class="strength-bar">
                <div :class="['strength-level', 'level-' + passwordStrength]"></div>
              </div>
              <small :class="'text-' + passwordStrengthColor">{{ passwordStrengthText }}</small>
            </div>
          </div>

          <!-- Confirmation du mot de passe -->
          <div class="form-group">
            <label for="password_confirmation">Confirmer le mot de passe</label>
            <div class="input-group">
              <span class="input-icon">
                <i class="fas fa-lock"></i>
              </span>
              <input
                  v-model="user.password_confirmation"
                  :type="showPassword ? 'text' : 'password'"
                  id="password_confirmation"
                  class="form-control"
                  placeholder="Confirmez votre mot de passe"
                  required
              />
            </div>
            <small v-if="passwordsNotMatching" class="form-text text-danger">
              Les mots de passe ne correspondent pas
            </small>
          </div>

          <!-- Conditions d'utilisation -->
          <div class="form-check terms-check">
            <input type="checkbox" class="form-check-input" id="terms" v-model="acceptTerms" required>
            <label class="form-check-label" for="terms">
              J'accepte les <a href="#" class="terms-link">conditions d'utilisation</a> et la <a href="#" class="terms-link">politique de confidentialité</a>
            </label>
          </div>

          <!-- Bouton -->
          <button
              type="submit"
              class="btn btn-primary btn-register"
              :disabled="loading || !formValid"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            {{ loading ? 'Inscription en cours...' : 'Créer mon compte' }}
          </button>
        </form>

        <div class="register-footer">
          <p>Vous avez déjà un compte ? <a href="#" @click.prevent="goToLogin" class="login-link">Connectez-vous</a></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AuthService from '@/services/auth.service';

export default {
  name: 'RegisterView',
  data() {
    return {
      user: {
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
      },
      acceptTerms: false,
      loading: false,
      error: null,
      emailError: null,
      showPassword: false,
      passwordStrength: 0,
      passwordStrengthText: ''
    };
  },
  computed: {
    passwordsNotMatching() {
      return this.user.password &&
          this.user.password_confirmation &&
          this.user.password !== this.user.password_confirmation;
    },
    formValid() {
      return !this.passwordsNotMatching &&
          this.user.name &&
          this.user.email &&
          this.user.password &&
          this.user.password_confirmation &&
          this.acceptTerms;
    },
    passwordStrengthColor() {
      const colors = ['danger', 'danger', 'warning', 'info', 'success'];
      return colors[this.passwordStrength] || 'danger';
    }
  },
  methods: {
    async register() {
      if (!this.formValid) {
        return;
      }

      this.loading = true;
      this.error = null;
      this.emailError = null;

      try {
        // Vérifier si l'email existe déjà (si vous avez ajouté cette méthode)
        try {
          const emailExists = await this.checkEmailExists(this.user.email);
          if (emailExists) {
            this.emailError = "Cette adresse email est déjà utilisée";
            this.loading = false;
            return;
          }
        } catch (emailError) {
          // Si la vérification échoue, on continue quand même l'inscription
          console.warn('La vérification d\'email a échoué, mais on continue l\'inscription');
        }

        // Construire l'objet utilisateur à envoyer
        const userData = {
          name: this.user.name,
          email: this.user.email,
          password: this.user.password,
          password_confirmation: this.user.password_confirmation, // Important: inclure la confirmation du mot de passe
          role: 'user' // par défaut
        };

        console.log('Données envoyées:', userData); // Pour le débogage

        // Appel au service d'inscription
        await AuthService.register(userData);

        // Succès - Rediriger et afficher un message
        this.$router.push({
          path: '/login',
          query: {registered: 'success'}
        });
      } catch (err) {
        console.error('Erreur d\'inscription:', err);

        // Affichage détaillé des erreurs pour le débogage
        if (err.response) {
          console.log('Réponse d\'erreur:', err.response.data);
        }

        // Gestion améliorée des erreurs de validation
        if (err.response?.status === 422) {
          const validationErrors = err.response.data.errors;

          // Afficher les erreurs de validation spécifiques
          if (validationErrors.email) {
            this.emailError = validationErrors.email[0];
          }

          // Afficher un message d'erreur général
          this.error = err.response.data.message || 'Veuillez corriger les erreurs dans le formulaire.';
        } else {
          this.error = err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.';
        }
      } finally {
        this.loading = false;
      }
    },

    async checkEmailExists(email) {
      // Si vous avez implémenté cette méthode dans votre service
      if (typeof AuthService.checkEmailExists === 'function') {
        try {
          const response = await AuthService.checkEmailExists(email);
          return response.exists;
        } catch (error) {
          console.error('Erreur lors de la vérification de l\'email', error);
          this.error = 'Impossible de vérifier la disponibilité de l\'email. Veuillez réessayer.';
          return false;
        }
      }
      // Si la méthode n'existe pas, on suppose que l'email n'existe pas
      return false;
    },

    togglePassword() {
      this.showPassword = !this.showPassword;
    },

    goToLogin() {
      this.$router.push('/login');
    },

    checkPasswordStrength() {
      const password = this.user.password;

      if (!password) {
        this.passwordStrength = 0;
        this.passwordStrengthText = '';
        return;
      }

      // Critères de force du mot de passe
      const hasLowerCase = /[a-z]/.test(password);
      const hasUpperCase = /[A-Z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      const isLongEnough = password.length >= 8;

      // Calcul du score
      let score = 0;
      if (hasLowerCase) score++;
      if (hasUpperCase) score++;
      if (hasNumbers) score++;
      if (hasSpecialChars) score++;
      if (isLongEnough) score++;

      // Set de 0 à 4 (5 niveaux)
      this.passwordStrength = Math.min(4, score);

      // Texte descriptif
      const strengthTexts = [
        'Très faible',
        'Faible',
        'Moyen',
        'Fort',
        'Très fort'
      ];

      this.passwordStrengthText = strengthTexts[this.passwordStrength];
    }
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #3f51b5 0%, #3f51b5 40%, #5b8def 100%);
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 550px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: 40px 0;
}

.register-header {
  padding: 30px 30px 0;
  text-align: center;
}

.register-logo {
  width: 70px;
  height: 70px;
  background-color: #3f51b5;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 26px;
  box-shadow: 0 4px 10px rgba(63, 81, 181, 0.3);
}

.register-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.register-header p {
  color: #777;
  margin-bottom: 20px;
}

.register-body {
  padding: 20px 30px 30px;
}

.form-group {
  margin-bottom: 22px;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  color: #555;
}

.optional {
  font-weight: normal;
  color: #999;
  font-size: 0.85em;
}

.input-group {
  position: relative;
  display: flex;
}

.input-icon {
  position: absolute;
  left: 15px;
  top: 13px;
  color: #aaa;
}

.form-control {
  height: 48px;
  border-radius: 8px;
  border: 1px solid #ddd;
  padding-left: 45px;
  font-size: 15px;
  transition: all 0.3s;
}

.form-control:focus {
  border-color: #3f51b5;
  box-shadow: 0 0 0 3px rgba(63, 81, 181, 0.15);
}

.password-toggle {
  position: absolute;
  right: 15px;
  top: 13px;
  color: #aaa;
  cursor: pointer;
}

.terms-check {
  margin-bottom: 24px;
}

.terms-link {
  color: #3f51b5;
  text-decoration: none;
}

.btn-register {
  height: 48px;
  border-radius: 8px;
  background-color: #3f51b5;
  border: none;
  font-weight: 500;
  width: 100%;
  font-size: 16px;
  transition: all 0.3s;
}

.btn-register:hover:not(:disabled) {
  background-color: #32408f;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(63, 81, 181, 0.3);
}

.btn-register:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.alert-danger {
  border-radius: 8px;
  border-left: 4px solid #dc3545;
  background-color: #fff5f5;
  color: #dc3545;
  padding: 12px 15px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
}

.register-footer {
  text-align: center;
  margin-top: 25px;
  color: #777;
}

.login-link {
  color: #3f51b5;
  font-weight: 500;
  text-decoration: none;
}

/* Password strength meter */
.password-strength-meter {
  display: flex;
  flex-direction: column;
}

.strength-bar {
  height: 4px;
  background-color: #e9ecef;
  border-radius: 2px;
  margin-bottom: 5px;
}

.strength-level {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.level-0 {
  width: 20%;
  background-color: #dc3545;
}

.level-1 {
  width: 40%;
  background-color: #dc3545;
}

.level-2 {
  width: 60%;
  background-color: #ffc107;
}

.level-3 {
  width: 80%;
  background-color: #17a2b8;
}

.level-4 {
  width: 100%;
  background-color: #28a745;
}

@media (max-width: 768px) {
  .register-card {
    margin: 10px 0;
    border-radius: 10px;
  }

  .register-header {
    padding: 20px 20px 0;
  }

  .register-body {
    padding: 15px 20px 20px;
  }
}
</style>