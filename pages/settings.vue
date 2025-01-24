<template>
    <div class="settings">
        <div class="settings__navigation">
            <settings-header @switch="switchPage($event)" />
        </div>
        <div class="settings__content">
            <settings-profile v-if="activePage === 'profile'" />
            <settings-password v-else-if="activePage === 'password'" />
            <settings-team v-else-if="activePage === 'team'" />
            <!-- <settings-pricing v-else-if="activePage === 'pricing'" /> -->
            <settings-instagram v-else-if="activePage === 'instagram'" />
            <settings-tags v-else-if="activePage === 'tags'" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { useFbStore } from '~/store/integrations'
const config = useRuntimeConfig()

const activePage = ref<string>('profile')
const { addFacebookUser } = useFbStore()
const fbSecret = config.public.FB_SEECRET
const facebookRedirectUri = config.public.FB_URL + '/settings'
const fbClientId = config.public.FB_ID
const projectId = parseInt(useCookie('projectId').value) as number

const switchPage = (e: any) => {
  activePage.value = e
}

const route = useRoute()

onMounted(() => {
  if (route.query.code) {
    facebookPooling()
  }
})

const facebookPooling = async () => {
  // eslint-disable-next-line max-len
  const data: any = await $fetch(`https://graph.facebook.com/v19.0/oauth/access_token?client_id=${fbClientId}&redirect_uri=${facebookRedirectUri}&client_secret=${fbSecret}&code=${route.query.code}`, {
    method: 'GET'
  })
  if (data) {
    const longToken = await createLongLivedToken(data.access_token)
    addFacebookUser(projectId, longToken, route.query.code)
    switchPage('instagram')
  }
}

const createLongLivedToken = async (accessToken: any) => {
  const grantType = 'fb_exchange_token'
  // eslint-disable-next-line max-len
  const params = `grant_type=${grantType}&client_id=${fbClientId}&client_secret=${fbSecret}&fb_exchange_token=${accessToken}`
  const data: any = await $fetch(`https://graph.facebook.com/oauth/access_token?${params}`, {
    method: 'GET'
  })
  return data.access_token
}
</script>

<style lang="scss" scoped>
.settings {
    width: 100%;
    padding: 30px;
    &__navigation{
        margin-bottom: 20px;
    }
}
</style>
