<template>
    <div>
        <h1>Subscription Test Page</h1>
        <div v-if="pending">
            Checking subscription status...
        </div>
        <div v-else>
            <p>User: {{ data?.user?.email || 'Not found' }}</p>
            <p>Subscription Plan: {{ data?.subscription?.plan || 'null' }}</p>
            <p>Has Valid Subscription: {{ hasValidSubscription ? 'Yes' : 'No' }}</p>
            <button @click="testSubscription">
                Check Subscription
            </button>
            <button @click="showModal">
                Show Modal
            </button>
            <button @click="hideModal">
                Hide Modal
            </button>
        </div>
        
        <!-- Show subscription modal if needed -->
        <SubscriptionRequiredModal
            v-if="authStore.showSubscriptionModal"
            :show="authStore.showSubscriptionModal"
        />
    </div>
</template>

<script setup lang="ts">
interface ApiResponse {
  user?: {
    id: number
    email: string
    first_name: string
    last_name: string
    avatar?: string
    phone?: string
    active_project_id: number
  }
  subscription?: {
    plan: string | null
    expires_at?: string
    status?: string
  }
}

const authStore = useAuthStore()
const config = useRuntimeConfig()

// Test subscription check
const { data, pending, refresh } = await useFetch<ApiResponse>('/auth/profile', {
  baseURL: config.public.apiUrl,
  credentials: 'include'
})

const hasValidSubscription = computed(() => {
  return data.value?.subscription?.plan !== null && data.value?.subscription?.plan !== undefined
})

const testSubscription = async () => {
  await refresh()
  
  // Update store with latest data
  if (data.value) {
    if (data.value.user) {
      authStore.user = data.value.user
    }
    
    const subscription = data.value.subscription || { plan: null }
    authStore.setSubscriptionData(subscription)
  }
}

const showModal = () => {
  authStore.showSubscriptionModal = true
}

const hideModal = () => {
  authStore.hideSubscriptionModal()
}

// Auto-check subscription on page load
watch(data, (newData) => {
  if (newData) {
    testSubscription()
  }
}, { immediate: true })
</script>
