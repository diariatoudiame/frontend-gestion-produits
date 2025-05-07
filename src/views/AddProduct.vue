<template>
  <div class="app-container">
    <!-- Sidebar (importé du composant) -->
    <sidebar-component :collapsed="sidebarCollapsed" @sidebar-toggle="handleSidebarToggle" />

    <!-- Main Content -->
    <div class="main-content" :class="{ 'main-expanded': sidebarCollapsed }">
      <!-- Navbar -->
      <nav class="navbar">
        <div class="navbar-left">
          <h2>Ajouter un Produit</h2>
        </div>
        <div class="navbar-right">
          <div class="notification-icon">
            <i class="fas fa-bell"></i>
            <span class="badge">3</span>
          </div>
          <div class="user-profile">
            <img :src="userAvatar" :alt="currentUser?.name || 'Utilisateur'" />
            <div class="user-info" v-if="!sidebarCollapsed">
              <span class="user-name">{{ currentUser?.name || 'Non connecté' }}</span>
              <span class="user-role">{{ currentUser?.role || 'Invité' }}</span>
            </div>
          </div>
        </div>
      </nav>

      <!-- Content Area -->
      <div class="content-area">
        <div class="product-card">
          <div class="product-header">
            <div class="product-logo">
              <i class="fas fa-box-open"></i>
            </div>
            <h1>Ajouter un Produit</h1>
            <p>Complétez le formulaire pour ajouter un nouveau produit</p>
          </div>

          <div class="product-body">
            <div v-if="error" class="alert alert-danger" role="alert">
              <i class="fas fa-exclamation-circle me-2"></i>{{ error }}
            </div>

            <div v-if="success" class="alert alert-success" role="alert">
              <i class="fas fa-check-circle me-2"></i>{{ success }}
            </div>

            <form @submit.prevent="addProduct">
              <!-- Nom du produit -->
              <div class="form-group">
                <label for="name">Nom du produit <span class="required">*</span></label>
                <div class="input-group">
                  <span class="input-icon">
                    <i class="fas fa-tag"></i>
                  </span>
                  <input
                      v-model="product.name"
                      type="text"
                      id="name"
                      class="form-control"
                      placeholder="Nom du produit"
                      required
                  />
                </div>
              </div>

              <!-- Description -->
              <div class="form-group">
                <label for="description">Description</label>
                <div class="input-group">
                  <span class="input-icon textarea-icon">
                    <i class="fas fa-align-left"></i>
                  </span>
                  <textarea
                      v-model="product.description"
                      id="description"
                      class="form-control"
                      placeholder="Description détaillée du produit"
                      rows="3"
                  ></textarea>
                </div>
              </div>

              <div class="row">
                <!-- Prix -->
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="price">Prix (€) <span class="required">*</span></label>
                    <div class="input-group">
                      <span class="input-icon">
                        <i class="fas fa-euro-sign"></i>
                      </span>
                      <input
                          v-model.number="product.price"
                          type="number"
                          step="0.01"
                          min="0"
                          id="price"
                          class="form-control"
                          placeholder="0.00"
                          required
                      />
                    </div>
                  </div>
                </div>

                <!-- Quantité -->
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="quantity">Quantité en stock <span class="required">*</span></label>
                    <div class="input-group">
                      <span class="input-icon">
                        <i class="fas fa-cubes"></i>
                      </span>
                      <input
                          v-model.number="product.quantity"
                          type="number"
                          min="0"
                          id="quantity"
                          class="form-control"
                          placeholder="0"
                          required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Catégorie -->
              <div class="form-group">
                <label for="category">Catégorie</label>
                <div class="input-group">
                  <span class="input-icon">
                    <i class="fas fa-folder"></i>
                  </span>
                  <input
                      v-model="product.category"
                      type="text"
                      id="category"
                      class="form-control"
                      placeholder="Catégorie du produit"
                  />
                </div>
              </div>

              <!-- Image -->
              <div class="form-group">
                <label for="image">Image du produit</label>
                <div class="custom-file-upload">
                  <input
                      type="file"
                      id="image"
                      ref="imageInput"
                      @change="handleImageUpload"
                      accept="image/*"
                      class="form-control"
                  />
                  <label for="image" class="custom-file-label">
                    <i class="fas fa-cloud-upload-alt me-2"></i>
                    {{ imageFileName || 'Choisir une image' }}
                  </label>
                </div>
                <div v-if="imagePreview" class="image-preview mt-2">
                  <img :src="imagePreview" alt="Aperçu de l'image" />
                  <button type="button" class="btn-remove-image" @click="removeImage">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <!-- Bouton -->
              <button
                  type="submit"
                  class="btn btn-primary btn-product"
                  :disabled="loading || !formValid"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ loading ? 'Enregistrement...' : 'Ajouter le produit' }}
              </button>
            </form>

            <div class="product-footer">
              <p>
                <a href="/" @click.prevent="goToProductList" class="back-link">
                  <i class="fas fa-arrow-left me-1"></i> Retour à la liste des produits
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SidebarComponent from '@/components/SideBar.vue';
import ProductService from '@/services/product.service';
import AuthService from '@/services/auth.service';

export default {
  name: 'AddProduct',
  components: {
    SidebarComponent
  },
  data() {
    return {
      product: {
        name: '',
        description: '',
        price: null,
        quantity: null,
        category: '',
        image: null
      },
      loading: false,
      error: null,
      success: null,
      imagePreview: null,
      imageFileName: '',
      sidebarCollapsed: false,
      currentUser: null
    };
  },
  computed: {
    formValid() {
      return this.product.name &&
          this.product.price !== null &&
          this.product.quantity !== null;
    },
    userAvatar() {
      // Si l'utilisateur a une photo de profil, l'utiliser, sinon utiliser une image de placeholder
      return this.currentUser?.avatar || 'https://via.placeholder.com/40';
    }
  },
  created() {
    // Récupérer l'utilisateur connecté lors de la création du composant
    this.fetchCurrentUser();
  },
  methods: {
    fetchCurrentUser() {
      // Récupérer l'utilisateur depuis le AuthService
      this.currentUser = AuthService.getCurrentUser();

      // Si aucun utilisateur n'est connecté et que l'accès à cette page nécessite une authentification,
      // rediriger vers la page de connexion
      if (!this.currentUser && this.$route.meta.requiresAuth) {
        this.$router.push('/login');
      }
    },

    async addProduct() {
      if (!this.formValid) {
        return;
      }

      this.loading = true;
      this.error = null;
      this.success = null;

      try {
        const formData = new FormData();

        // Ajout des champs texte
        formData.append('name', this.product.name);
        formData.append('description', this.product.description || '');
        formData.append('price', this.product.price);
        formData.append('quantity', this.product.quantity);
        if (this.product.category) {
          formData.append('category', this.product.category);
        }

        // Ajout de l'image si elle existe
        if (this.$refs.imageInput.files[0]) {
          formData.append('image', this.$refs.imageInput.files[0]);
        }

        // Ajout de l'ID de l'utilisateur qui crée le produit
        if (this.currentUser && this.currentUser.id) {
          formData.append('created_by', this.currentUser.id);
        }

        // Appel au service pour ajouter le produit
        await ProductService.addProduct(formData);

        // Succès
        this.success = 'Produit ajouté avec succès!';

        // Réinitialiser le formulaire après un court délai
        setTimeout(() => {
          this.$router.push('/');

        }, 2000);
      } catch (err) {
        console.error('Erreur lors de l\'ajout du produit:', err);
        this.error = err.response?.data?.message || 'Une erreur est survenue lors de l\'ajout du produit. Veuillez réessayer.';
      } finally {
        this.loading = false;
      }
    },

    handleImageUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      this.imageFileName = file.name;

      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onload = e => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    removeImage() {
      this.imagePreview = null;
      this.imageFileName = '';
      this.$refs.imageInput.value = '';
    },

    resetForm() {
      this.product = {
        name: '',
        description: '',
        price: null,
        quantity: null,
        category: '',
        image: null
      };
      this.removeImage();
      this.success = null;
    },

    goToProductList() {
      this.$router.push('/');
    },

    handleSidebarToggle(collapsed) {
      this.sidebarCollapsed = collapsed;
    }
  }
};
</script>

<style scoped>
/* Les styles restent inchangés */
/* Variables CSS pour les couleurs */
:root {
  --primary-color: #4caf50;
  --primary-dark: #3d8b40;
  --secondary-color: #f5f7fa;
  --text-primary: #333;
  --text-secondary: #777;
  --border-color: #eaeaea;
  --danger-color: #dc3545;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --white: #ffffff;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.app-container {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Main Content */
.main-content {
  flex-grow: 1;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.main-expanded {
  margin-left: 0;
}

/* Navbar */
.navbar {
  height: 70px;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 25px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.navbar-left h2 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.navbar-right {
  display: flex;
  align-items: center;
}

.notification-icon {
  position: relative;
  margin-right: 20px;
  cursor: pointer;
}

.notification-icon i {
  font-size: 18px;
  color: #666;
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #dc3545;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.user-profile img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  margin-left: 10px;
}

.user-name {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.user-role {
  display: block;
  font-size: 12px;
  color: #777;
}

/* Content Area */
.content-area {
  padding: 25px;
  flex-grow: 1;
  background-color: #f5f7fa;
  display: flex;
  justify-content: center;
}

.product-card {
  width: 100%;
  max-width: 800px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin: 10px 0;
  border: 1px solid #eaeaea;
}

.product-header {
  padding: 30px 30px 0;
  text-align: center;
}

.product-logo {
  width: 70px;
  height: 70px;
  background-color: #4caf50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 26px;
  box-shadow: 0 4px 10px rgba(76, 175, 80, 0.3);
}

.product-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.product-header p {
  color: #777;
  margin-bottom: 20px;
}

.product-body {
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

.required {
  color: #dc3545;
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

.textarea-icon {
  top: 13px;
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

textarea.form-control {
  height: auto;
  padding-top: 12px;
}

.form-control:focus {
  border-color: #4caf50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.15);
}

.row {
  display: flex;
  flex-wrap: wrap;
  margin-right: -10px;
  margin-left: -10px;
}

.col-md-6 {
  flex: 0 0 50%;
  max-width: 50%;
  padding-right: 10px;
  padding-left: 10px;
}

.custom-file-upload {
  position: relative;
  overflow: hidden;
}

.custom-file-upload input[type="file"] {
  position: absolute;
  font-size: 100px;
  top: 0;
  right: 0;
  opacity: 0;
  cursor: pointer;
}

.custom-file-label {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  background-color: #f8f9fa;
  border: 1px dashed #ddd;
  border-radius: 8px;
  cursor: pointer;
  color: #666;
  transition: all 0.3s;
}

.custom-file-label:hover {
  background-color: #e9ecef;
  border-color: #aaa;
}

.image-preview {
  position: relative;
  width: 100px;
  height: 100px;
  margin-top: 10px;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.btn-remove-image {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #dc3545;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.btn-product {
  height: 48px;
  border-radius: 8px;
  background-color: #4caf50;
  border: none;
  font-weight: 500;
  width: 100%;
  font-size: 16px;
  transition: all 0.3s;
}

.btn-product:hover:not(:disabled) {
  background-color: #3d8b40;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(76, 175, 80, 0.3);
}

.btn-product:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.alert {
  border-radius: 8px;
  padding: 12px 15px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
}

.alert-danger {
  border-left: 4px solid #dc3545;
  background-color: #fff5f5;
  color: #dc3545;
}

.alert-success {
  border-left: 4px solid #28a745;
  background-color: #f4fff8;
  color: #28a745;
}

.product-footer {
  text-align: center;
  margin-top: 25px;
  color: #777;
}

.back-link {
  color: #4caf50;
  font-weight: 500;
  text-decoration: none;
}

@media (max-width: 768px) {
  .product-card {
    margin: 10px 0;
    border-radius: 10px;
  }

  .product-header {
    padding: 20px 20px 0;
  }

  .product-body {
    padding: 15px 20px 20px;
  }

  .col-md-6 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}
</style>