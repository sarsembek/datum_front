<template>
    <div
        class="sidebar-layout"
        :class="isMiminize ? 'sidebar-layout_minimize' : 'sidebar-layout_maximize'"
    >
        <div class="sidebar-layout__group sidebar-layout__group_border">
            <div class="sidebar-items-row">
                <nuxt-link
                    to="/cms"
                    class="sidebar-item sidebar-item_logo"
                >
                    <svg-icon
                        icon="abstract-logo"
                        width="28"
                        height="28"
                    />
                    <div class="name">
                        ChatBot
                    </div>
                </nuxt-link>
                <div
                    class="sidebar-item sidebar-item_toggle"
                    @click="toggleSidebarSize()"
                >
                    <svg-icon
                        icon="toggle"
                        width="24"
                        height="24"
                    />
                </div>
            </div>
            <!-- <div class="sidebar-item">
                <svg-icon
                    icon="projects"
                    width="24"
                    height="24"
                />
                <div class="name">
                    Projects
                </div>
            </div> -->
        </div>
        <div class="sidebar-layout__group sidebar-layout__group_max-margin">
            <nuxt-link
                to="/subscribers"
                class="sidebar-item"
            >
                <svg-icon
                    icon="contacts"
                    width="24"
                    height="24"
                />
                <div class="name">
                    Клиенты
                </div>
            </nuxt-link>
            <nuxt-link
                to="/cms"
                class="sidebar-item"
                :class="{ 'router-link-active': activePath('/cms') }"
            >
                <svg-icon
                    icon="automation"
                    width="24"
                    height="24"
                />
                <div class="name">
                    Автоматизации
                </div>
            </nuxt-link>
            <!-- <nuxt-link
                to="/chat"
                class="sidebar-item"
            >
                <svg-icon
                    icon="chat"
                    width="24"
                    height="24"
                />
                <div class="name">
                    Чат с клиеннтами
                </div>
            </nuxt-link> -->
            <nuxt-link
                to="/settings"
                class="sidebar-item"
            >
                <svg-icon
                    icon="settings"
                    width="24"
                    height="24"
                />
                <div class="name">
                    Настройки
                </div>
            </nuxt-link>
        </div>
        <div class="sidebar-layout__group sidebar-layout__group_no-margin">
            <!-- <div class="sidebar-item sidebar-item_account">
                <img
                    src="@img/avatar.jpg"
                    alt="avatar"
                >
                <div class="name">
                    Пользователь
                </div>
            </div>
            <div class="sidebar-item">
                <svg-icon
                    icon="payment"
                    width="24"
                    height="24"
                />
                <div class="name">
                    Payment
                </div>
            </div>
            <div class="sidebar-item">
                <svg-icon
                    icon="question"
                    width="24"
                    height="24"
                />
                <div class="name">
                    Help
                </div>
            </div> -->
            <div
                class="sidebar-item"
                @click="authStore.logout(); reloadNuxtApp({ path: '/auth', persistState: true })"
            >
                <svg-icon
                    icon="logout"
                    width="24"
                    height="24"
                />
                <div class="name">
                    Выход
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/store/auth'
const authStore = useAuthStore()

const isMiminize = useCookie('isMiminize').value ? ref<boolean>(true) : ref<boolean>(false)
const route = useRoute()
const activeRoute = ref(route.path)

const toggleSidebarSize = () => {
  isMiminize.value = !isMiminize.value
  if (useCookie('isMiminize').value) {
    useCookie('isMiminize').value = false
  } else {
    useCookie('isMiminize').value = true
  }
}

watch(() => route.path, (route) => {
  activeRoute.value = route
})

const activePath = (path: string) => {
  return activeRoute.value.includes(path)
}

</script>

<style lang="scss">
.sidebar-layout{
    min-width: 50px;
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    height: 100%;
    padding: 20px 12px;
    transition: all 0.3s ease;
    .sidebar-items-row{
        width: 100%;
        gap: 14px;
        display: flex;
        flex-direction: column;
        transition: all 0.3s ease;
        justify-content: space-between;
    }
    &_minimize{
        width: 70px;
    }
    &_maximize{
        width: 279px;
        .sidebar-item{
            &_toggle{
                padding: 0 !important;
                width: fit-content !important;
                svg{
                    transform: rotate(180deg);
                }
            }
        }
        .sidebar-items-row{
            flex-direction: row;
        }
    }
    &__group{
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 25px;
        margin-bottom: 25px;
        width: 100%;
        &_border{
            padding-bottom: 25px;
            border-bottom: 1px solid var(--bg-color);
        }
        &_max-margin{
            margin-bottom: auto;
        }
        &_no-margin{
            margin-bottom: 0;
        }
    }
    .sidebar-item{
        display: flex;
        align-items: center;
        gap: 25px;
        cursor: pointer;
        width: 100%;
        border-radius: 5px;
        padding: 10px;
        text-wrap: nowrap;
        &_account{
            img{
                width: 28px;
                height: 28px;
                border-radius: 100%;
            }
        }
        &:hover:not(.sidebar-item_logo){
            .svg-content path {
                fill: #3DC8F4 !important;
            }
            .name{
                color: var(--text-active-color);
            }
        }
        .name{
            color: var(--text-color);
        }
        &.router-link-active:not(.sidebar-item_logo){
            background: linear-gradient(90deg, #322c4b 0%, #363a48 100%);
            .svg-content path {
                fill: #3DC8F4 !important;
            }
            .name{
                color: var(--text-active-color);
            }
        }
    }
}
</style>
