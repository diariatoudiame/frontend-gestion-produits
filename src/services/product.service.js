import api from './api';

class ProductService {
    // Récupérer tous les produits
    getAllProducts() {
        return api.get('/products');
    }

    // Récupérer un produit par son ID
    getProduct(id) {
        return api.get(`/products/${id}`);
    }

    // Créer un nouveau produit (admin)
    addProduct(formData) {
        return api.post('/products', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    // Mettre à jour un produit existant (admin)
    updateProduct(id, formData) {
        // Pour Laravel, on peut simuler une requête PUT en ajoutant _method=PUT
        formData.append('_method', 'PUT');

        return api.post(`/products/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    // Supprimer un produit (admin)
    deleteProduct(id) {
        return api.delete(`/products/${id}`);
    }

    // Rechercher des produits
    searchProducts(query, category) {
        let url = '/products/search?';

        if (query) {
            url += `query=${encodeURIComponent(query)}&`;
        }

        if (category) {
            url += `category=${encodeURIComponent(category)}`;
        }

        return api.get(url);
    }
}

export default new ProductService();