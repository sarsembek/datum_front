<template>
    <div
        v-if="authStore.isAuthError"
        class="auth-error"
    >
        <div class="auth-error__container">
            <h2>Authentication Required</h2>
            <p>You need to be logged in to access this content.</p>
            <button
                class="auth-error__button"
                @click="redirectToLogin"
            >
                Sign in
            </button>
        </div>
    </div>
</template>

<script setup>
import { useAuthStore } from '~/store/auth'

const authStore = useAuthStore()

function redirectToLogin () {
  window.location.href = 'https://starmake.ai/login'
}
</script>

<style lang="scss" scoped>
.auth-error {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;

  &__container {
    max-width: 400px;
    padding: 2rem;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    text-align: center;
  }

  &__button {
    margin-top: 1rem;
    padding: 0.75rem 2rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    &:hover {
      background-color: darken(#4CAF50, 10%);
    }
  }

  h2 {
    margin-bottom: 1rem;
  }
}
</style>
