<template>
    <div v-if="showDebug" class="debug-auth-panel">
        <h3>🔍 Auth Debug Panel</h3>
        <div class="debug-row">
            <strong>User:</strong> {{ authStore.user ? authStore.user.email : 'null' }}
        </div>
        <div class="debug-row">
            <strong>isPayed:</strong> {{ authStore.isPayed }}
        </div>
        <div class="debug-row">
            <strong>shouldBlockApp:</strong> {{ authStore.shouldBlockApp }}
        </div>
        <div class="debug-row">
            <strong>isAuthError:</strong> {{ authStore.isAuthError }}
        </div>
        <div class="debug-actions">
            <button @click="testBlock">Test Block (set isPayed false)</button>
            <button @click="testUnblock">Test Unblock (set isPayed true)</button>
            <button @click="refreshAuth">Refresh Auth</button>
        </div>
        <button class="debug-toggle" @click="showDebug = false">Hide Debug</button>
    </div>
    <button v-else class="debug-toggle show" @click="showDebug = true">Show Auth Debug</button>
</template>

<script setup>
import { useAuthStore } from '~/store/auth'

const authStore = useAuthStore()
const showDebug = ref(false)

const testBlock = () => {
    authStore.setUserPaymentStatus(false)
}

const testUnblock = () => {
    authStore.setUserPaymentStatus(true)
}

const refreshAuth = () => {
    // Force a page refresh to trigger middleware
    if (process.client) {
        window.location.reload()
    }
}
</script>

<style scoped>
.debug-auth-panel {
    position: fixed;
    top: 20px;
    right: 20px;
    background: #000;
    color: #fff;
    padding: 1rem;
    border-radius: 8px;
    font-family: monospace;
    font-size: 12px;
    z-index: 99999;
    max-width: 300px;
    border: 2px solid #333;
}

.debug-row {
    margin: 0.5rem 0;
    padding: 0.25rem;
    background: #111;
    border-radius: 4px;
}

.debug-actions {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.debug-actions button {
    padding: 0.5rem;
    font-size: 10px;
    background: #333;
    color: #fff;
    border: 1px solid #555;
    border-radius: 4px;
    cursor: pointer;
}

.debug-actions button:hover {
    background: #555;
}

.debug-toggle {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 99999;
    padding: 0.5rem;
    background: #000;
    color: #fff;
    border: 1px solid #333;
    border-radius: 4px;
    cursor: pointer;
    font-size: 10px;
}

.debug-toggle.show {
    background: #007acc;
}

.debug-toggle:hover {
    background: #333;
}
</style> 