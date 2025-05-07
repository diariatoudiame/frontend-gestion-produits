
<template>
  <div class="sidebar" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <i class="fas fa-store"></i>
      </div>
      <h3 v-if="!sidebarCollapsed">MonBoutique</h3>
      <button class="toggle-sidebar" @click="toggleSidebar">
        <i class="fas" :class="sidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'"></i>
      </button>
    </div>

    <div class="sidebar-menu">
      <router-link to="/" class="menu-item active">
        <i class="fas fa-box"></i>
        <span v-if="!sidebarCollapsed">Produits</span>
      </router-link>
    </div>

    <div class="sidebar-footer">
      <div class="menu-item">
        <i class="fas fa-sign-out-alt"></i>
        <span v-if="!sidebarCollapsed">Déconnexion</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SidebarComponent',
  props: {
    collapsed: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      sidebarCollapsed: this.collapsed
    };
  },
  methods: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
      this.$emit('sidebar-toggle', this.sidebarCollapsed);
    }
  },
  watch: {
    collapsed(newVal) {
      this.sidebarCollapsed = newVal;
    }
  }
};
</script>

<style scoped>
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
}
</style>