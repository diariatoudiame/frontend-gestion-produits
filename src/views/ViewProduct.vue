<template>
  <div class="app-container">
    <!-- Sidebar (importé du composant) -->
    <sidebar-component :collapsed="sidebarCollapsed" @sidebar-toggle="handleSidebarToggle" />

    <!-- Main Content -->
    <div class="main-content" :class="{ 'main-expanded': sidebarCollapsed }">
      <!-- Navbar -->
      <nav class="navbar">
        <div class="navbar-left">
          <h2>Détail du Produit</h2>
        </div>
        <div class="navbar-right">
          <div class="notification-icon">
            <i class="fas fa-bell"></i>
            <span class="badge">3</span>
          </div>
          <div class="user-profile">
            <img src="https://via.placeholder.com/40" alt="User Profile" />
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
          <div v-if="loading" class="loading-container">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Chargement...</span>
            </div>
            <p>Chargement du produit...</p>
          </div>

          <div v-else-if="error" class="error-container">
            <div class="alert alert-danger" role="alert">
              <i class="fas fa-exclamation-circle me-2"></i>{{ error }}
            </div>
            <button class="btn btn-outline-primary" @click="goToProductList">
              <i class="fas fa-arrow-left me-1"></i> Retour à la liste des produits
            </button>
          </div>

          <div v-else-if="product">
            <div class="product-header">
              <div class="product-logo">
                <i class="fas fa-box-open"></i>
              </div>
              <h1>{{ product.name }}</h1>
              <p class="product-category">{{ product.category || 'Aucune catégorie' }}</p>
            </div>

            <div class="product-body">
              <!-- Image du Produit -->
              <div class="product-image-container">
                <img
                    v-if="product.image"
                    :src="getImageUrl(product.image)"
                    :alt="product.name"
                    class="product-image"
                />
                <div v-else class="product-no-image">
                  <i class="fas fa-image"></i>
                  <p>Aucune image disponible</p>
                </div>
              </div>

              <!-- Informations Détaillées -->
              <div class="product-details">
                <div class="detail-section">
                  <h3>Description</h3>
                  <p class="product-description">{{ product.description || 'Aucune description disponible' }}</p>
                </div>

                <div class="details-row">
                  <div class="detail-item">
                    <div class="detail-icon">
                      <i class="fas fa-euro-sign"></i>
                    </div>
                    <div class="detail-content">
                      <h4>Prix</h4>
                      <p class="detail-value">{{ product.price }} FCFA</p>
                    </div>
                  </div>

                  <div class="detail-item">
                    <div class="detail-icon" :class="stockStatusClass">
                      <i class="fas fa-cubes"></i>
                    </div>
                    <div class="detail-content">
                      <h4>En Stock</h4>
                      <p class="detail-value" :class="stockStatusClass">
                        {{ product.quantity }} unité{{ product.quantity > 1 ? 's' : '' }}
                      </p>
                    </div>
                  </div>

                  <div class="detail-item">
                    <div class="detail-icon">
                      <i class="fas fa-calendar-alt"></i>
                    </div>
                    <div class="detail-content">
                      <h4>Ajouté le</h4>
                      <p class="detail-value">{{ formatDate(product.created_at) }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="product-actions">
                <button class="btn btn-outline-primary" @click="goToProductList">
                  <i class="fas fa-arrow-left me-1"></i> Retour
                </button>
                <button class="btn btn-primary" @click="goToEditProduct">
                  <i class="fas fa-edit me-1"></i> Modifier
                </button>
                <button class="btn btn-danger" @click="confirmDelete">
                  <i class="fas fa-trash-alt me-1"></i> Supprimer
                </button>
              </div>
            </div>
          </div>

          <div v-else class="no-product-container">
            <div class="alert alert-warning" role="alert">
              <i class="fas fa-exclamation-triangle me-2"></i>Produit non trouvé
            </div>
            <button class="btn btn-outline-primary" @click="goToProductList">
              <i class="fas fa-arrow-left me-1"></i> Retour à la liste des produits
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div class="modal" v-if="showDeleteModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmer la suppression</h5>
            <button type="button" class="btn-close" @click="cancelDelete"></button>
          </div>
          <div class="modal-body">
            <p>Êtes-vous sûr de vouloir supprimer le produit <strong>{{ product?.name }}</strong> ?</p>
            <p class="text-danger">Cette action est irréversible.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="cancelDelete">Annuler</button>
            <button
                type="button"
                class="btn btn-danger"
                @click="deleteProduct"
                :disabled="deleteLoading"
            >
              <span v-if="deleteLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {{ deleteLoading ? 'Suppression...' : 'Supprimer' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop" v-if="showDeleteModal" @click="cancelDelete"></div>
  </div>
</template>

<script>
import SidebarComponent from '@/components/SideBar.vue';
import ProductService from '@/services/product.service';
import AuthService from "@/services/auth.service";

export default {
  name: 'ProductDetail',
  components: {
    SidebarComponent
  },
  data() {
    return {
      product: null,
      loading: true,
      error: null,
      sidebarCollapsed: false,
      showDeleteModal: false,
      deleteLoading: false,
      currentUser: null

    };
  },
  computed: {
    productId() {
      return this.$route.params.id;
    },
    stockStatusClass() {
      if (!this.product) return '';
      if (this.product.quantity <= 0) return 'text-danger';
      if (this.product.quantity < 10) return 'text-warning';
      return 'text-success';
    }
  },
  created() {
    this.fetchProductDetails();
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

    async fetchProductDetails() {
      this.loading = true;
      this.error = null;

      try {
        const response = await ProductService.getProduct(this.productId);
        console.log('Réponse API complète:', response);

        if (response && response.data) {
          console.log('Structure des données:', response.data);

          if (response.data.status === 'success' && response.data.product) {
            console.log('Format 1: Données dans response.data.product');
            this.product = response.data.product;
          }
          else if (response.data.name) {
            console.log('Format 2: Données directement dans response.data');
            this.product = response.data;
          }
          // Si les données sont un niveau plus profond (cas particulier)
          else if (response.data.data && (response.data.data.product || response.data.data.name)) {
            console.log('Format 3: Données dans response.data.data');
            this.product = response.data.data.product || response.data.data;
          }
          else {
            console.error('Format de réponse non reconnu:', response.data);
            this.error = 'Le format de la réponse API est incorrect. Veuillez contacter l\'administrateur.';
          }
        } else {
          this.error = 'Réponse invalide du serveur.';
        }

        if (this.product) {
          console.log('Produit chargé avec succès:', this.product);
        } else {
          console.error('Produit non défini après traitement');
          this.error = 'Impossible de charger les données du produit.';
        }
      } catch (err) {
        console.error('Erreur lors du chargement du produit:', err);
        this.error = err.response?.data?.message || 'Une erreur est survenue lors du chargement du produit.';
      } finally {
        this.loading = false;
      }
    },

    getImageUrl(imagePath) {
      if (!imagePath) return 'https://via.placeholder.com/60x60';

      if (imagePath.startsWith('http') || imagePath.startsWith('//')) {
        return imagePath;
      }

      return `${process.env.VUE_APP_BACKEND_URL}/storage/${imagePath}`;
    },



    formatDate(dateString) {
      if (!dateString) return 'Date inconnue';

      try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).format(date);
      } catch (e) {
        console.error('Erreur de formatage de date:', e);
        return 'Date invalide';
      }
    },

    goToProductList() {
      this.$router.push('/');
    },

    goToEditProduct() {
      this.$router.push(`/products/edit/${this.productId}`);
    },

    confirmDelete() {
      this.showDeleteModal = true;
    },

    cancelDelete() {
      this.showDeleteModal = false;
    },

    async deleteProduct() {
      this.deleteLoading = true;

      try {
        await ProductService.deleteProduct(this.productId);
        this.showDeleteModal = false;

        // Rediriger vers la liste avec un message de succès
        this.$router.push({
          path: '/',
          query: {
            deleteSuccess: true,
            productName: this.product.name
          }
        });
      } catch (err) {
        console.error('Erreur lors de la suppression du produit:', err);
        this.error = err.response?.data?.message || 'Une erreur est survenue lors de la suppression du produit.';
        this.showDeleteModal = false;
      } finally {
        this.deleteLoading = false;
      }
    },

    handleSidebarToggle(collapsed) {
      this.sidebarCollapsed = collapsed;
    }
  }
};
</script>



<style scoped>
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

.product-category {
  color: #777;
  background-color: #f5f7fa;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 14px;
  display: inline-block;
  margin-bottom: 20px;
}

.product-body {
  padding: 20px 30px 30px;
}

/* Image Container */
.product-image-container {
  text-align: center;
  margin-bottom: 30px;
}

.product-image {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.product-no-image {
  width: 100%;
  height: 200px;
  background-color: #f5f7fa;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #aaa;
}

.product-no-image i {
  font-size: 48px;
  margin-bottom: 10px;
}

/* Product Details */
.product-details {
  margin-bottom: 30px;
}

.detail-section {
  margin-bottom: 25px;
}

.detail-section h3 {
  font-size: 18px;
  color: #333;
  font-weight: 600;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #eaeaea;
}

.product-description {
  color: #555;
  line-height: 1.6;
}

.details-row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -10px;
}

.detail-item {
  flex: 1;
  min-width: calc(33.333% - 20px);
  margin: 0 10px 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
}

.detail-icon {
  width: 50px;
  height: 50px;
  background-color: #4caf50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 18px;
}

.detail-content h4 {
  font-size: 14px;
  color: #777;
  margin-bottom: 5px;
}

.detail-value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.text-danger {
  color: #dc3545 !important;
}

.text-danger .detail-icon {
  background-color: #dc3545;
}

.text-warning {
  color: #ffc107 !important;
}

.text-warning .detail-icon {
  background-color: #ffc107;
}

.text-success {
  color: #28a745 !important;
}

.text-success .detail-icon {
  background-color: #28a745;
}

/* Product Actions */
.product-actions {
  display: flex;
  justify-content: space-between;
  padding-top: 20px;
  border-top: 1px solid #eaeaea;
}

.btn {
  height: 40px;
  border-radius: 8px;
  font-weight: 500;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  cursor: pointer;
}

.btn-primary {
  background-color: #4caf50;
  border: none;
  color: white;
}

.btn-primary:hover {
  background-color: #3d8b40;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(76, 175, 80, 0.3);
}

.btn-outline-primary {
  background-color: transparent;
  border: 1px solid #4caf50;
  color: #4caf50;
}

.btn-outline-primary:hover {
  background-color: #f0f9f0;
  transform: translateY(-2px);
}

.btn-danger {
  background-color: #dc3545;
  border: none;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(220, 53, 69, 0.3);
}

.btn i {
  margin-right: 5px;
}

/* Loading, Error and No Product */
.loading-container,
.error-container,
.no-product-container {
  padding: 50px 30px;
  text-align: center;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
  color: #4caf50;
  margin-bottom: 20px;
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

.alert-warning {
  border-left: 4px solid #ffc107;
  background-color: #fffbf0;
  color: #856404;
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

.modal-dialog {
  max-width: 500px;
  width: 100%;
  position: relative;
  z-index: 1050;
}

.modal-content {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #eaeaea;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.btn-close {
  background-color: transparent;
  border: none;
  font-size: 24px;
  line-height: 1;
  color: #777;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 20px;
  border-top: 1px solid #eaeaea;
}

.btn-secondary {
  background-color: #6c757d;
  border: none;
  color: white;
  margin-right: 10px;
}

.btn-secondary:hover {
  background-color: #5a6268;
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

  .details-row {
    flex-direction: column;
  }

  .detail-item {
    min-width: auto;
    width: 100%;
    margin-bottom: 15px;
  }

  .product-actions {
    flex-direction: column;
    gap: 10px;
  }

  .btn {
    width: 100%;
  }
}
</style>