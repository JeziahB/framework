<template>
  <div class="test">
    <div class="buildup">
      <div class="tekstbuildup">
        <h2>Build Up</h2>
        <p>Build your route and add the products you need to your cart!</p>
        <div id="container">
          <div v-for="(image, index) in grid.images" :key="index" class="square" @click="selectProduct(index)">
            <img v-if="image" :src="image.imageURL" alt="Selected Image">
          </div>

          <div v-if="showModal" class="modal">
            <div class="modal-content">
              <span class="close" @click="closeModal">&times;</span>
              <h2>Select a Product</h2>
              <div class="product-list">
                <div v-for="product in filteredProducts" :key="product.cardId" class="product-item" @click="addProductToGrid(product)">
                  <img :src="product.afbeelding" alt="Product Image">
                  <p>{{ product.titel }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="sum_selected_products">
        <h3 v-if="productSummary.length === 0">No Product selected.</h3>
        <div v-else>
          <h3>You selected the following products:</h3>
          <div class="product-summary">
            <div v-for="product in productSummary" :key="product.cardId" class="product-summary-item">
              <img :src="product.afbeelding" alt="Product Image">
              <p>{{ product.titel }} ({{ product.count }}x)</p>
              <p>Prijs: €{{ (product.prijs * product.count).toFixed(2) }}</p>
            </div>
          </div>
          <h4>Total Price: €{{ totalPrice.toFixed(2) }}</h4>
          <h4>Total Price incl. BTW: €{{ totalPriceIncludingBTW.toFixed(2) }}</h4>
          <button @click="moveSelectedToCart">Add Selected Products to Cart</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useGridStore } from '@/stores/gridStore';
import { useProductenStore } from '@/stores/productStore';
import { computed } from 'vue';

export default {
  data() {
    return {
      selectedIndex: null,
      showModal: false,
    };
  },
  setup() {
    const productenStore = useProductenStore();

    const filteredProducts = computed(() => productenStore.getFilteredProducts);

    return {
      productenStore,
      filteredProducts,
    };
  },
  computed: {
    grid() {
      return useGridStore();
    },
    productSummary() {
      const summary = {};
      this.grid.images.forEach((item) => {
        if (item && item.productId) {
          if (summary[item.productId]) {
            summary[item.productId].count++;
          } else {
            const product = this.productenStore.getProductById(item.productId);
            summary[item.productId] = { ...product, count: 1 };
          }
        }
      });
      return Object.values(summary);
    },
    totalPrice() {
      return this.productSummary.reduce((total, product) => total + product.prijs * product.count, 0);
    },
    totalPriceIncludingBTW() {
      const total = this.totalPrice;
      const btwRate = this.calculateAverageBtwRate(this.productSummary);
      return total * (1 + btwRate);
    }
  },
  methods: {
    calculateAverageBtwRate(products) {
      const totalBtwRate = products.reduce((total, product) => total + product.btwTarief / 100, 0);
      return totalBtwRate / products.length;
    },
    selectProduct(index) {
      this.selectedIndex = index;
      this.showModal = true;
    },
    addProductToGrid(product) {
      this.grid.setImage(this.selectedIndex, product.afbeelding, product.cardId);
      this.showModal = false;
    },
    moveSelectedToCart() {
      const productsToAdd = this.grid.images.filter(item => item && item.productId).map(item => {
        const product = this.productenStore.getProductById(item.productId);
        return { ...product, source: 'BuildUpView' };
      });

      this.productenStore.addMultipleToCart(productsToAdd);
    },
    closeModal() {
      this.showModal = false;
    }
  },
};
</script>

<style lang="scss"  scoped>
$x-axis: 3;
$y-axis: 2;
$x-width: 100px * $x-axis + 50px;
$y-height: 100px * $y-axis + 50px;
.buildup {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 80%;
  margin: auto;

.tekstbuildup {
  margin-top: 5%;
h2 {
  margin: 1rem 0;
  color: rgb(218,253,0);
}
p {
  color: #fff;
  margin-bottom: 2rem;
  font-size: 16px;
}
}
#container {
  width: $x-width;
  height: $y-height;
  display: grid;
  margin: auto;
  grid-template-columns: repeat($x-axis, 1fr);
  grid-template-rows: repeat($y-axis, 1fr);
  gap: calc((1000px / $x-axis) * 0.1);
  padding: 2rem 2rem 1rem 1.2rem;
  background: radial-gradient(circle at 10px 10px, #888 10%, transparent 11%) 0 0 / 15px 15px, blanchedalmond;
}

.square {
  background-color: #ccc;
  border: 1px solid #000;
  aspect-ratio: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: calc((1000px / 12) - (calc((1000px /12) * 0.1) - 1px));
  height: calc((1000px / 12) - (calc((1000px / 12) * 0.1) - 1px));
  box-sizing: border-box;
}

.square img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}
}

.modal {
  display: block;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.6);
  padding-top: 60px;
}

.modal-content {
  background-color: #000;
  margin: 5% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  color: #fff;

h2 {
  color: rgb(218,253,0);
  font-weight: 100;
}
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: rgb(218,253,0);
  text-decoration: none;
  cursor: pointer;
}

.product-list {
  display: flex;
  flex-wrap: wrap;
}

.product-item {
  width: 100px;
  margin: 10px;
  cursor: pointer;
  text-align: center;

p {
  color: #fff;
}

img {
  width: 100%;
}
}

.sum_selected_products {
  margin-top: 2rem;
  color: #fff;

h3 {
  color: rgb(218,253,0);
}

.product-summary {
  display: flex;
  flex-wrap: wrap;

.product-summary-item {
  margin: 10px;
  text-align: center;

p {
  margin: 0.5rem 0;
}

img {
  width: 100px;
}
}
}

button {
  background-color: rgb(218,253,0);
  color: #000;
  padding: 0.5rem 1rem;
  border: none;
  cursor: pointer;

&:hover {
   background-color: darken(rgb(218,253,0), 10%);
 }
}
}

</style>
