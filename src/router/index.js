import { createRouter, createWebHistory } from 'vue-router';
import ProductList from '@/views/ProductList.vue';
import ProductForm from '@/views/AddProduct.vue';
import ProductFormEdit from '@/views/EditProduct.vue';
import ProductDetail from '@/views/ViewProduct.vue';
import LoginForm from '@/views/LoginForm.vue';
import RegisterForm from '@/views/RegisterForm.vue';

const routes = [
    { path: '/', name: 'home', component: ProductList },
    { path: '/add', name: 'addProduct', component: ProductForm },
    { path: '/products/:id/edit', name: 'editProduct', component: ProductFormEdit },
    { path: '/products/:id', name: 'ProductDetail', component: ProductDetail },
    { path: '/login', name: 'login', component: LoginForm },
    { path: '/register', name: 'register', component: RegisterForm },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
