// stores/gridStore.js
import { defineStore } from 'pinia';

export const useGridStore = defineStore('grid', {
    state: () => ({
        images: Array(60).fill(null), // Array to store image URLs, initially empty
    }),
    actions: {
        setImage(index, imageURL, productId) {
            this.images[index] = { imageURL, productId };
        },
        resetImage(index) {
            this.images[index] = null;
        }
    },
});
