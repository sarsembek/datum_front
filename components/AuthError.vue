<template>
    <div
        v-if="shouldShowError"
        class="auth-error">
        <div class="auth-error__container">
            <h2 class="auth-error__title">Authentication Required</h2>
            <p class="auth-error__message">You need to be logged in to access this content.</p>
            <button
                class="auth-error__button"
                @click="redirectToLogin">
                Sign in
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '~/store/auth'

const authStore = useAuthStore()
const apiCheckInProgress = ref(false)

// Only show error if auth error is set AND we're not in middle of an API check
const shouldShowError = computed(() => {
  return authStore.isAuthError && !apiCheckInProgress.value
})

// Check if we have pending requests before showing the error
onMounted(async () => {
  if (authStore.isAuthError) {
    apiCheckInProgress.value = true
    // Try a lightweight API call to verify auth status
    try {
      await useAuthFetch('/api/v1/auth/user/', { method: 'get' })
      // If API call succeeds, clear error state
      authStore.isAuthError = false
    } catch (e) {
      // If API call fails, keep error state
    } finally {
      apiCheckInProgress.value = false
    }
  }
})

// Watch for changes to error state
watch(() => authStore.isAuthError, (newVal) => {
  if (newVal === true) {
    // Verify error with API call when state changes to true
    apiCheckInProgress.value = true
    useAuthFetch('/api/v1/auth/user/', { method: 'get' })
      .then(() => {
        // If API call succeeds, clear error state
        authStore.isAuthError = false
      })
      .catch(() => {
        // If API call fails, keep error state
      })
      .finally(() => {
        apiCheckInProgress.value = false
      })
  }
})

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
    background-color: white; /* White background */
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

    &__title {
        color: black; /* Black text */
        margin-bottom: 1rem;
    }

    &__message {
        color: red; /* Danger-colored text */
        margin-bottom: 1rem;
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
}
</style>
