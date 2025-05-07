<template>
  <div class="app-container">
    <!-- Sidebar -->
    <SideBar :collapsed="sidebarCollapsed" @toggle="toggleSidebar" />

    <!-- Main Content -->
    <div class="main-content" :class="{ 'main-expanded': sidebarCollapsed }">
      <!-- Navbar -->
      <nav class="navbar">
        <div class="navbar-left">
          <h2>Gestion des Produits</h2>
        </div>
        <div class="navbar-search">
          <div class="search-bar">
            <i class="fas fa-search"></i>
            <input
                type="text"
                placeholder="Rechercher un produit..."
                v-model="searchQuery"
                @input="filterProducts"
            />
          </div>
        </div>
        <div class="navbar-right">
          <div class="notification-icon">
            <i class="fas fa-bell"></i>
            <span class="badge">3</span>
          </div>
          <div class="user-profile">
            <img src="https://via.placeholder.com/40" alt="User Profile" />
            <div class="user-info" v-if="!sidebarCollapsed">
              <span class="user-name">Jean Dupont</span>
              <span class="user-role">Administrateur</span>
            </div>
          </div>
        </div>
      </nav>

      <!-- Content Area -->
      <div class="content-area">
        <div class="products-header">
          <div class="products-title">
            <h3>Liste des Produits</h3>
            <span class="product-count">{{ filteredProducts.length }} produits</span>
          </div>
          <div class="product-actions">
            <div class="filter-dropdown">
<!--              <button class="btn btn-filter">-->
<!--                <i class="fas fa-filter"></i> Filtrer-->
<!--                <i class="fas fa-chevron-down ms-2"></i>-->
<!--              </button>-->
              <div class="filter-menu">
                <!-- Filter content here -->
              </div>
            </div>
            <router-link to="/add" class="btn btn-add">
              <i class="fas fa-plus"></i> Ajouter un produit
            </router-link>
          </div>
        </div>

        <!-- Alert messages -->
        <div v-if="error" class="alert alert-danger" role="alert">
          <i class="fas fa-exclamation-circle me-2"></i>{{ error }}
        </div>

        <div v-if="success" class="alert alert-success" role="alert">
          <i class="fas fa-check-circle me-2"></i>{{ success }}
        </div>

        <!-- Loading indicator -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Chargement des produits...</p>
        </div>

        <!-- Products Table -->
        <div class="products-table-container" v-if="!loading">
          <table class="products-table" v-if="filteredProducts.length > 0">
            <thead>
            <tr>
              <th>
                <div class="checkbox-container">
                  <input
                      type="checkbox"
                      id="select-all"
                      @change="selectAllProducts"
                      :checked="selectAll"
                  />
                  <label for="select-all"></label>
                </div>
              </th>
              <th>Photo</th>
              <th @click="sortBy('name')">
                Nom
                <i class="fas" :class="getSortIconClass('name')"></i>
              </th>
              <th @click="sortBy('price')">
                Prix
                <i class="fas" :class="getSortIconClass('price')"></i>
              </th>
              <th @click="sortBy('quantity')">
                Stock
                <i class="fas" :class="getSortIconClass('quantity')"></i>
              </th>
              <th>Statut</th>
              <th @click="sortBy('created_at')">
                Date d'ajout
                <i class="fas" :class="getSortIconClass('created_at')"></i>
              </th>
              <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="product in displayedProducts" :key="product.id" :class="{ 'selected': selectedProducts.includes(product.id) }">
              <td>
                <div class="checkbox-container">
                  <input
                      type="checkbox"
                      :id="`product-${product.id}`"
                      :checked="selectedProducts.includes(product.id)"
                      @change="toggleProductSelection(product.id)"
                  />
                  <label :for="`product-${product.id}`"></label>
                </div>
              </td>
              <td>
                <div class="product-image">
                  <img :src="getImageUrl(product.image)" :alt="product.name" />
                </div>
              </td>
              <td>
                <div class="product-name">{{ product.name }}</div>
                <div class="product-description">{{ truncateText(product.description, 50) }}</div>
              </td>
              <td class="product-price">{{ product.price }} FCFA</td>
              <td>
                <div class="stock-indicator" :class="getStockClass(product.quantity)">
                  {{ getStockStatus(product.quantity) }}
                </div>
              </td>
              <td>
                <div class="status-badge" :class="product.active ? 'active' : 'inactive'">
                  {{ product.active ? 'Actif' : 'Inactif' }}
                </div>
              </td>
              <td>{{ formatDate(product.created_at) }}</td>
              <td>
                <div class="action-buttons">
                  <button class="btn-action btn-view" @click="viewProduct(product.id)" title="Voir">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="btn-action btn-edit" @click="editProduct(product.id)" title="Modifier">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn-action btn-delete" @click="confirmDelete(product.id)" title="Supprimer">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
            </tbody>
          </table>

          <!-- Empty state -->
          <div class="empty-state" v-else>
            <div class="empty-icon">
              <i class="fas fa-box-open"></i>
            </div>
            <h3>Aucun produit trouvé</h3>
            <p>Il n'y a pas de produits correspondants à votre recherche.</p>
            <button class="btn btn-add" @click="resetSearch">
              <i class="fas fa-redo"></i> Réinitialiser la recherche
            </button>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination-container" v-if="filteredProducts.length > 0">
          <div class="pagination-info">
            Affichage de {{ paginationStart }} à {{ paginationEnd }} sur {{ filteredProducts.length }} produits
          </div>
          <div class="pagination-controls">
            <button
                class="btn-page"
                :disabled="currentPage === 1"
                @click="changePage(currentPage - 1)"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            <div class="page-numbers">
              <button
                  v-for="page in totalPages"
                  :key="page"
                  class="btn-page-number"
                  :class="{ 'active': currentPage === page }"
                  @click="changePage(page)"
              >
                {{ page }}
              </button>
            </div>
            <button
                class="btn-page"
                :disabled="currentPage === totalPages"
                @click="changePage(currentPage + 1)"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal" v-if="showDeleteModal">
      <div class="modal-overlay" @click="cancelDelete"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h4>Confirmer la suppression</h4>
          <button class="btn-close" @click="cancelDelete">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="modal-icon">
            <i class="fas fa-trash"></i>
          </div>
          <p>Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-cancel" @click="cancelDelete">Annuler</button>
          <button class="btn btn-confirm" @click="deleteProduct">
            <i class="fas fa-trash me-2"></i>Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProductService from '@/services/product.service';
import SideBar from '@/components/SideBar.vue';

export default {
  name: 'ProductList',
  components: {
    SideBar
  },
  data() {
    return {
      products: [],
      filteredProducts: [],
      selectedProducts: [],
      loading: false,
      error: null,
      success: null,
      searchQuery: '',
      currentPage: 1,
      itemsPerPage: 10,
      sortField: 'created_at',
      sortDirection: 'desc',
      selectAll: false,
      sidebarCollapsed: false,
      showDeleteModal: false,
      productToDelete: null
    };
  },
  computed: {
    displayedProducts() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredProducts.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    },
    paginationStart() {
      return (this.currentPage - 1) * this.itemsPerPage + 1;
    },
    paginationEnd() {
      const end = this.currentPage * this.itemsPerPage;
      return end > this.filteredProducts.length ? this.filteredProducts.length : end;
    }
  },
  mounted() {
    this.loadProducts();
  },
  methods: {
    async loadProducts() {
      this.loading = true;
      this.error = null;

      try {
        const response = await ProductService.getAllProducts();

        // Vérifier la structure de la réponse selon l'API
        if (response && response.data && response.data.status === 'success') {
          this.products = response.data.products;
          this.filterProducts();
        } else {
          throw new Error('Format de réponse inattendu');
        }
      } catch (err) {
        console.error('Erreur lors du chargement des produits:', err);
        this.error = 'Impossible de charger les produits. Veuillez réessayer.';
      } finally {
        this.loading = false;
      }
    },

    filterProducts() {
      if (!this.searchQuery) {
        this.filteredProducts = [...this.products];
      } else {
        const query = this.searchQuery.toLowerCase();
        this.filteredProducts = this.products.filter(product =>
            product.name.toLowerCase().includes(query) ||
            (product.description && product.description.toLowerCase().includes(query))
        );
      }

      this.sortProducts();
      this.currentPage = 1;
    },

    resetSearch() {
      this.searchQuery = '';
      this.filterProducts();
    },

    sortBy(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDirection = 'asc';
      }

      this.sortProducts();
    },

    sortProducts() {
      this.filteredProducts.sort((a, b) => {
        let comparison = 0;

        if (this.sortField === 'price' || this.sortField === 'quantity') {
          comparison = a[this.sortField] - b[this.sortField];
        } else if (this.sortField === 'created_at') {
          comparison = new Date(a[this.sortField]) - new Date(b[this.sortField]);
        } else {
          comparison = String(a[this.sortField]).localeCompare(String(b[this.sortField]));
        }

        return this.sortDirection === 'asc' ? comparison : -comparison;
      });
    },

    getSortIconClass(field) {
      if (this.sortField !== field) return 'fa-sort';
      return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
    },

    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    formatPrice(price) {
      return Number(price).toFixed(2).replace('.', ',');
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    },

    truncateText(text, maxLength) {
      if (!text) return '';
      return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    },

    getImageUrl(imagePath) {
      if (!imagePath) return 'https://via.placeholder.com/60x60';

      if (imagePath.startsWith('http') || imagePath.startsWith('//')) {
        return imagePath;
      }

      return `${process.env.VUE_APP_BACKEND_URL}/storage/${imagePath}`;
    },

    toggleProductSelection(productId) {
      const index = this.selectedProducts.indexOf(productId);
      if (index === -1) {
        this.selectedProducts.push(productId);
      } else {
        this.selectedProducts.splice(index, 1);
      }

      this.updateSelectAllState();
    },

    selectAllProducts() {
      this.selectAll = !this.selectAll;

      if (this.selectAll) {
        this.selectedProducts = this.displayedProducts.map(p => p.id);
      } else {
        this.selectedProducts = [];
      }
    },

    updateSelectAllState() {
      const displayedIds = this.displayedProducts.map(p => p.id);
      const allSelected = displayedIds.every(id => this.selectedProducts.includes(id));
      this.selectAll = allSelected && displayedIds.length > 0;
    },

    getStockStatus(quantity) {
      if (quantity <= 0) return 'Rupture';
      if (quantity < 10) return 'Faible';
      return 'En stock';
    },

    getStockClass(quantity) {
      if (quantity <= 0) return 'out-of-stock';
      if (quantity < 10) return 'low-stock';
      return 'in-stock';
    },

    viewProduct(productId) {
      this.$router.push(`/products/${productId}`);
    },

    editProduct(productId) {
      this.$router.push(`/products/${productId}/edit`);
    },

    confirmDelete(productId) {
      this.productToDelete = productId;
      this.showDeleteModal = true;
    },

    cancelDelete() {
      this.showDeleteModal = false;
      this.productToDelete = null;
    },

    async deleteProduct() {
      if (!this.productToDelete) return;

      try {
        const response = await ProductService.deleteProduct(this.productToDelete);

        if (response && response.data && response.data.status === 'success') {
          // Retirer le produit de la liste
          const index = this.products.findIndex(p => p.id === this.productToDelete);
          if (index !== -1) {
            this.products.splice(index, 1);
          }

          this.success = 'Produit supprimé avec succès!';
          this.filterProducts();
        }

        // Réinitialiser le modal
        this.showDeleteModal = false;
        this.productToDelete = null;

        // Effacer le message de succès après 3 secondes
        setTimeout(() => {
          this.success = null;
        }, 3000);
      } catch (err) {
        console.error('Erreur lors de la suppression du produit:', err);
        this.error = 'Impossible de supprimer le produit. Veuillez réessayer.';
      }
    },

    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
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

/* Ajout du style pour le loader */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #4caf50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

/* Sidebar styles */
.sidebar {
  width: 250px;
  background-color: #2c3e50;
  color: white;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.sidebar-collapsed {
  width: 70px;
}

.sidebar-header {
  padding: 20px 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-logo {
  width: 40px;
  height: 40px;
  background-color: #4caf50;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.sidebar-header h3 {
  flex-grow: 1;
  margin-left: 10px;
  font-size: 18px;
  font-weight: 600;
}

.toggle-sidebar {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 14px;
  opacity: 0.8;
  transition: opacity 0.3s;
}

.toggle-sidebar:hover {
  opacity: 1;
}

.sidebar-menu {
  padding: 15px 0;
  flex-grow: 1;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s;
  margin-bottom: 5px;
}

.sidebar-collapsed .menu-item {
  padding: 12px 0;
  justify-content: center;
}

.menu-item i {
  font-size: 16px;
  min-width: 30px;
  text-align: center;
}

.menu-item span {
  margin-left: 10px;
}

.menu-item:hover, .menu-item.active {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.menu-item.active {
  border-left: 3px solid #4caf50;
}

.sidebar-footer {
  padding: 15px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
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

.navbar-search {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  max-width: 500px;
  margin: 0 20px;
}

.search-bar {
  width: 100%;
  position: relative;
}

.search-bar input {
  width: 100%;
  height: 40px;
  border-radius: 20px;
  border: 1px solid #eaeaea;
  padding: 0 20px 0 40px;
  font-size: 14px;
  transition: all 0.3s;
}

.search-bar input:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.15);
}

.search-bar i {
  position: absolute;
  left: 15px;
  top: 12px;
  color: #aaa;
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
}

.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.products-title {
  display: flex;
  align-items: baseline;
}

.products-title h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-right: 10px;
}

.product-count {
  font-size: 14px;
  color: #777;
}

.product-actions {
  display: flex;
  align-items: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.btn i {
  margin-right: 8px;
}

.btn-filter {
  background-color: white;
  color: #333;
  border: 1px solid #eaeaea;
  margin-right: 10px;
}

.btn-filter:hover {
  background-color: #f8f8f8;
}

.btn-add {
  background-color: #4caf50;
  color: white;
  text-decoration: none;
}

.btn-add:hover {
  background-color: #3d8b40;
}

.filter-dropdown {
  position: relative;
}

.filter-menu {
  display: none;
  position: absolute;
  top: 50px;
  right: 0;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  z-index: 10;
  padding: 15px;
}

/* Alert messages */
.alert {
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.alert i {
  margin-right: 10px;
  font-size: 18px;
}

.alert-danger {
  background-color: #fee;
  color: #dc3545;
  border: 1px solid #fcc;
}

.alert-success {
  background-color: #e8f5e9;
  color: #28a745;
  border: 1px solid #d0e9c6;
}

/* Products Table */
.products-table-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 20px;
}

.products-table {
  width: 100%;
  border-collapse: collapse;
}

.products-table th,
.products-table td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #eaeaea;
}

.products-table th {
  background-color: #f9fafb;
  color: #666;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.products-table th:hover {
  background-color: #f0f3f6;
}

.products-table th i {
  margin-left: 5px;
  font-size: 12px;
}

.products-table tbody tr {
  transition: all 0.2s;
}

.products-table tbody tr:hover {
  background-color: #f9fafb;
}

.products-table tbody tr.selected {
  background-color: #e8f5e9;
}

/* Checkbox styling */
.checkbox-container {
  position: relative;
  width: 20px;
  height: 20px;
}

.checkbox-container input {
  opacity: 0;
  position: absolute;
  width: 100%;
  height: 100%;
  cursor: pointer;
  z-index: 2;
}

.checkbox-container label {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 4px;
  top: 0;
  left: 0;
  background-color: white;
  transition: all 0.2s;
}

.checkbox-container input:checked + label {
  background-color: #4caf50;
  border-color: #4caf50;
}

.checkbox-container input:checked + label:after {
  content: '';
  position: absolute;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  top: 2px;
  left: 6px;
}

.product-image img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 5px;
}

.product-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
}

.product-description {
  font-size: 13px;
  color: #777;
}

.product-price {
  font-weight: 600;
  color: #333;
}

.stock-indicator {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.in-stock {
  background-color: #e8f5e9;
  color: #28a745;
}

.low-stock {
  background-color: #fff3cd;
  color: #ffc107;
}

.out-of-stock {
  background-color: #f8d7da;
  color: #dc3545;
}

.status-badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background-color: #e8f5e9;
  color: #28a745;
}

.status-badge.inactive {
  background-color: #f5f5f5;
  color: #777;
}

.action-buttons {
  display: flex;
  align-items: center;
}

.btn-action {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  margin-right: 5px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-view {
  background-color: #e3f2fd;
  color: #2196f3;
}

.btn-view:hover {
  background-color: #bbdefb;
}

.btn-edit {
  background-color: #e8f5e9;
  color: #4caf50;
}

.btn-edit:hover {
  background-color: #c8e6c9;
}

.btn-delete {
  background-color: #feebee;
  color: #dc3545;
}

.btn-delete:hover {
  background-color: #f8d7da;
}

/* Empty state */
.empty-state {
  padding: 50px 20px;
  text-align: center;
  background-color: white;
}

.empty-icon {
  font-size: 50px;
  color: #ddd;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #333;
}

.empty-state p {
  color: #777;
  margin-bottom: 20px;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
}

.pagination-info {
  color: #777;
  font-size: 14px;
}

.pagination-controls {
  display: flex;
  align-items: center;
}

.btn-page {
  width: 35px;
  height: 35px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  border: 1px solid #eaeaea;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-page:not(:disabled):hover {
  background-color: #f8f8f8;
}

.page-numbers {
  display: flex;
  margin: 0 10px;
}

.btn-page-number {
  width: 35px;
  height: 35px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  border: 1px solid #eaeaea;
  margin: 0 2px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-page-number:hover {
  background-color: #f8f8f8;
}

.btn-page-number.active {
  background-color: #4caf50;
  color: white;
  border-color: #4caf50;
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  cursor: pointer;
}

.modal-content {
  width: 450px;
  background-color: white;
  border-radius: 8px;
  position: relative;
  z-index: 1001;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eaeaea;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h4 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  font-size: 18px;
  color: #777;
  cursor: pointer;
  transition: color 0.2s;
}

.btn-close:hover {
  color: #333;
}

.modal-body {
  padding: 30px 20px;
  text-align: center;
}

.modal-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #feebee;
  color: #dc3545;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto 20px;
}

.modal-body p {
  color: #555;
  line-height: 1.5;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eaeaea;
  display: flex;
  justify-content: flex-end;
}

.btn-cancel {
  background-color: white;
  color: #333;
  border: 1px solid #eaeaea;
  margin-right: 10px;
}

.btn-cancel:hover {
  background-color: #f8f8f8;
}

.btn-confirm {
  background-color: #dc3545;
  color: white;
}

.btn-confirm:hover {
  background-color: #c82333;
}

/* Responsive */
@media (max-width: 1024px) {
  .navbar-search {
    max-width: 300px;
  }

  .products-table th:nth-child(2),
  .products-table td:nth-child(2) {
    display: none;
  }
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100%;
    transform: translateX(-100%);
  }

  .sidebar-collapsed {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0;
  }

  .navbar {
    padding: 0 15px;
  }

  .navbar-search {
    max-width: 200px;
  }

  .products-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .product-actions {
    margin-top: 15px;
    align-self: stretch;
    justify-content: space-between;
  }

  .products-table th:nth-child(4),
  .products-table td:nth-child(4),
  .products-table th:nth-child(6),
  .products-table td:nth-child(6),
  .products-table th:nth-child(7),
  .products-table td:nth-child(7) {
    display: none;
  }

  .pagination-container {
    flex-direction: column;
    gap: 15px;
  }
}

@media (max-width: 576px) {
  .navbar-search {
    display: none;
  }

  .products-table th:nth-child(5),
  .products-table td:nth-child(5) {
    display: none;
  }

  .modal-content {
    width: 90%;
  }
}

</style>