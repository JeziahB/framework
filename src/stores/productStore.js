import { defineStore } from 'pinia';
import productenData from '@/assets/product.json';

export const useProductenStore = defineStore('products', {
    state: () => ({
        producten: [...productenData], // Ensure this is an array
        winkelwagen: [],
        selectedFilters: {
            categorie: null,
            kleur: null,
        },
    }),
    getters: {
        getProductById: (state) => (cardId) => {
            return state.producten.find((product) => product.cardId == cardId) || null;
        },
        getCartTotal: (state) => {
            return state.winkelwagen.reduce((total, product) => total + product.quantity, 0);
        },
        getCartTotalPrice: (state) => {
            return state.winkelwagen.reduce((total, product) => total + product.prijs * product.quantity, 0);
        },
        getFilteredProducts: (state) => {
            let filteredProducts = state.producten;

            // Filter op categorie
            if (state.selectedFilters.categorie) {
                filteredProducts = filteredProducts.filter(
                    (product) => product.categorie === state.selectedFilters.categorie
                );
            }

            // Filter op kleur
            if (state.selectedFilters.kleur) {
                filteredProducts = filteredProducts.filter(
                    (product) => product.kleur === state.selectedFilters.kleur
                );
            }

            return filteredProducts;
        },
    },
    actions: {
        updateStockQuantity(productId, quantity) {
            const product = this.getProductById(productId);

            if (product) {
                product.stock_quantity += quantity;
            }
        },

        toggleFilter(filterType, value = null) {
            this.selectedFilters[filterType] = value;
        },

        decreaseStock(cardId) {
            const product = this.getProductById(cardId);
            if (product && product.stock > 0) {
                product.stock -= 1;
            }
        },

        increaseStock(cardId) {
            const product = this.getProductById(cardId);
            if (product) {
                product.stock += 1;
            }
        },

        addToCart(product) {
            const cartProduct = this.winkelwagen.find((item) => item.cardId === product.cardId && item.source === product.source);

            if (cartProduct) {
                cartProduct.quantity += 1;
            } else {
                this.winkelwagen.push({ ...product, quantity: 1 });
            }

            this.decreaseStock(product.cardId);
        },

        addMultipleToCart(products) {
            products.forEach(product => {
                if (product && product.stock > 0) {
                    const cartItem = this.winkelwagen.find(
                        (item) => item.cardId === product.cardId && item.source === 'BuildUpView'
                    );

                    if (cartItem) {
                        cartItem.quantity += 1;
                    } else {
                        this.winkelwagen.push({ ...product, quantity: 1 });
                    }

                    this.decreaseStock(product.cardId);
                }
            });
        },

        removeFromCart(cardId, source) {
            const index = this.winkelwagen.findIndex(item => item.cardId === cardId && item.source === source);

            if (index !== -1) {
                const product = this.winkelwagen[index];

                if (product.quantity > 1) {
                    product.quantity -= 1;
                } else {
                    this.winkelwagen.splice(index, 1);
                }

                this.increaseStock(cardId);
            }
        },
    }
});
