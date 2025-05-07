<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="login-logo">
          <i class="fas fa-box-open"></i>
        </div>
        <h1>Gestion de Produits</h1>
        <p>Connectez-vous pour accéder à votre espace</p>
      </div>

      <div class="login-body">
        <div v-if="error" class="alert alert-danger" role="alert">
          <i class="fas fa-exclamation-circle me-2"></i>{{ error }}
        </div>

        <form @submit.prevent="login">
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
          </div>

          <div class="form-group">
            <div class="password-header">
              <label for="password">Mot de passe</label>
              <a href="#" class="forgot-password">Mot de passe oublié?</a>
            </div>
            <div class="input-group">
              <span class="input-icon">
                <i class="fas fa-lock"></i>
              </span>
              <input
                  v-model="user.password"
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  class="form-control"
                  placeholder="Votre mot de passe"
                  required
              />
              <span class="password-toggle" @click="togglePassword">
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </span>
            </div>
          </div>

          <div class="form-check">
            <input type="checkbox" class="form-check-input" id="remember" v-model="rememberMe">
            <label class="form-check-label" for="remember">Se souvenir de moi</label>
          </div>

          <button type="submit" class="btn btn-primary btn-login" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            {{ loading ? 'Connexion en cours...' : 'Se connecter' }}
          </button>
        </form>

        <div class="login-footer">
          <p>Vous n'avez pas de compte ? <a href="/register" class="register-link">Inscrivez-vous</a></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Assurez-vous que le chemin d'importation est correct
import AuthService from '@/services/auth.service';

export default {
  name: 'LoginView',
  data() {
    return {
      user: {
        email: '',
        password: ''
      },
      rememberMe: false,
      loading: false,
      error: null,
      showPassword: false
    };
  },
  methods: {
    async login() {
      this.loading = true;
      this.error = null;

      try {
        // Vérification des champs
        if (!this.user.email || !this.user.password) {
          throw new Error('Veuillez remplir tous les champs');
        }

        const response = await AuthService.login(this.user);

        // Traitement après connexion réussie
        if (this.rememberMe) {
          localStorage.setItem('rememberedEmail', this.user.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        // Redirection basée sur le rôle utilisateur
        if (response.user.role === 'admin') {
          this.$router.push('/');
        } else {
          this.$router.push('/');
        }
      } catch (err) {
        console.error('Erreur de connexion:', err);

        // Message d'erreur plus détaillé si disponible
        if (err.response && err.response.data && err.response.data.message) {
          this.error = err.response.data.message;
        } else {
          this.error = 'Identifiants incorrects ou problème de connexion. Veuillez réessayer.';
        }
      } finally {
        this.loading = false;
      }
    },
    togglePassword() {
      this.showPassword = !this.showPassword;
    }
  },
  mounted() {
    // Récupérer email si "se souvenir de moi" était coché précédemment
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.user.email = rememberedEmail;
      this.rememberMe = true;
    }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #3f51b5 0%, #3f51b5 40%, #5b8def 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 450px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.login-header {
  padding: 30px 30px 0;
  text-align: center;
}

.login-logo {
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

.login-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.login-header p {
  color: #777;
  margin-bottom: 20px;
}

.login-body {
  padding: 20px 30px 30px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  color: #555;
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
  width: 100%;
}

.form-control:focus {
  border-color: #3f51b5;
  box-shadow: 0 0 0 3px rgba(63, 81, 181, 0.15);
}

.password-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.forgot-password {
  font-size: 14px;
  color: #3f51b5;
  text-decoration: none;
}

.password-toggle {
  position: absolute;
  right: 15px;
  top: 13px;
  color: #aaa;
  cursor: pointer;
}

.form-check {
  margin-bottom: 24px;
}

.form-check-label {
  color: #555;
  cursor: pointer;
}

.btn-login {
  height: 48px;
  border-radius: 8px;
  background-color: #3f51b5;
  border: none;
  font-weight: 500;
  width: 100%;
  font-size: 16px;
  transition: all 0.3s;
}

.btn-login:hover:not(:disabled) {
  background-color: #32408f;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(63, 81, 181, 0.3);
}

.btn-login:disabled {
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

.login-footer {
  text-align: center;
  margin-top: 30px;
  color: #777;
}

.register-link {
  color: #3f51b5;
  font-weight: 500;
  text-decoration: none;
}

@media (max-width: 576px) {
  .login-card {
    border-radius: 0;
  }

  .login-header {
    padding: 20px 20px 0;
  }

  .login-body {
    padding: 15px 20px 20px;
  }
}
</style>