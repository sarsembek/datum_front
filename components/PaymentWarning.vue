<template>
  <div
    v-if="authStore.shouldBlockApp"
    class="payment-warning"
  >
    <div class="payment-warning__container">
      <div class="payment-warning__content">
        <h2 class="payment-warning__title">
          Подписка не активна
        </h2>
        <p class="payment-warning__message">
          У вас нет активной подписки. Пожалуйста, оплатите подписку для продолжения использования сервиса.
        </p>
                        <button
                    class="payment-warning__button"
                    @click="handlePaymentClick"
                >
                    Оплатить
                </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/store/auth'

const authStore = useAuthStore()

const handlePaymentClick = () => {
    authStore.redirectToPaymentPage()
}
</script>

<style lang="scss" scoped>
.payment-warning {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
      backdrop-filter: blur(5px);
    pointer-events: all;

    &__container {
    max-width: 500px;
    width: 90%;
    margin: 0 auto;
    position: relative;
    z-index: 10000;
    pointer-events: all;
  }

  &__content {
    background: var(--bg-color);
    border-radius: 16px;
    padding: 3rem;
    text-align: center;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    border: 1px solid var(--border-color, #2d3132);
    pointer-events: all;
  }

  &__title {
    color: var(--text-color);
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    line-height: 1.3;
  }

  &__message {
    color: var(--text-color);
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 2.5rem;
    opacity: 0.8;
  }

  &__button {
    background: linear-gradient(135deg, #3DC8F4 0%, #4830F9 100%);
    color: white;
    border: none;
    border-radius: 12px;
    padding: 1rem 2.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 150px;
    pointer-events: all !important;
    position: relative;
    z-index: 10001;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(61, 200, 244, 0.3);
    }

    &:active {
      transform: translateY(0);
    }
  }
}
</style>

<style lang="scss">
// Global styles to block interactions when payment warning is shown
body:has(.payment-warning) {
  overflow: hidden;
}

// Block all interactions except for the payment warning
.payment-warning ~ * {
  pointer-events: none !important;
  user-select: none !important;
}

// More specific blocking for page layout
.page-layout:has(.payment-warning) {
  .page-layout__content {
    pointer-events: none !important;
    user-select: none !important;
  }
}

// Ensure payment warning components are always clickable
.payment-warning,
.payment-warning *,
.payment-warning__button {
  pointer-events: all !important;
}
</style> 