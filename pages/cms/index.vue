<template>
    <div class="cms">
        <!-- Instagram Alert Banner that appears at the top of the page -->
        <div
            v-if="fbAuthenticated && !isInstagramAuthenticated"
            class="instagram-alert-banner"
        >
            <div class="instagram-alert-content">
                <svg-icon
                    icon="instagram"
                    width="24"
                    height="24"
                    class="instagram-icon"
                />
                <span>Подключите свой аккаунт Instagram для получения расширенных возможностей</span>
                <button-custom
                    class="instagram-confirm-btn"
                    value="Подключить"
                    @click="getInstagramAuthorizeUrl"
                />
            </div>
        </div>

        <div
            v-if="fbAuthenticated && !isFirstLogin"
            :key="cmsKey"
            class="cms-content-wrapper"
        >
            <page-content-header
                :title="activePage === 'automations' ? 'Автоматизация' : 'Стратегии'"
            >
                <div class="cms-nav">
                    <div
                        class="cms-nav__item"
                        :class="{'cms-nav__item_active': activePage === 'automations'}"
                        @click="activePage = 'automations'"
                    >
                        <svg-icon
                            icon="automations"
                            width="20"
                            height="20"
                        />
                    </div>
                    <div
                        class="cms-nav__item"
                        :class="{'cms-nav__item_active': activePage === 'builder'}"
                        @click="activePage = 'builder'"
                    >
                        <svg-icon
                            icon="builder"
                            width="20"
                            height="20"
                        />
                    </div>
                </div>
                <div class="cms-nav__buttons">
                    <button-custom
                        v-if="activePage === 'automations'"
                        value="+ Новая автоматизация"
                        @click="openCreatePopup('automation'); createType = 'automation'"
                    />
                    <button-custom
                        v-if="activePage === 'automations' && (user?.is_staff || user?.is_superuser)"
                        value="+ Создать шаблон"
                        @click="openCreatePopup('automation', true); createType = 'automation'"
                    />
                </div>
            </page-content-header>
            <page-content>
                <automatization-group v-if="activePage === 'automations'" />
                <builder-group v-if="activePage === 'builder'" />
            </page-content>
        </div>
        <facebook-loader v-else-if="isFbClientAdding" />
        <facebook-pages v-else-if="fbAuthenticated && isFirstLogin" />
        <facebook-auth v-else />
    </div>
</template>

<script setup lang="ts">
import { useFbStore } from '~/store/integrations'
import { useAutomatizationStore } from '~/store/automatization'
import { useUserStore } from '~/store/user'

const fbStore = useFbStore()
const { getFacebookUser, getInstagramAuthorizeUrl, handleAuthRedirect } = fbStore
const { fbAuthenticated, isFirstLogin, isFbClientAdding, isInstagramAuthenticated } = storeToRefs(fbStore)
const user = useUserStore().user || await useUserStore().getUser()

const { openCreatePopup } = useAutomatizationStore()
const { createType } = storeToRefs(useAutomatizationStore())

const activePage = ref<String>('automations')
const cmsKey = ref<number>(0)

await getFacebookUser()

const route = useRoute()

onMounted(() => {
  // Use the new unified auth redirect handler if code is present in URL
  if (route.query.code) {
    handleAuthRedirect()
  }
})
</script>

<style scoped lang="scss">
.cms{
    width: 100%;
    height: 100%;

    // Instagram alert styles
    .instagram-alert-banner {
        width: 100%;
        background: linear-gradient(135deg, #8a3ab9 0%, #e95950 50%, #bc2a8d 100%);
        padding: 10px 0;
        color: white;
        position: sticky;
        top: 0;
        z-index: 100;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        animation: fadeIn 0.5s ease-out;
    }

    .instagram-alert-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 20px;
        gap: 15px;

        span {
            font-weight: 500;
            font-size: 16px;
        }
    }

    .instagram-icon {
        flex-shrink: 0;
    }

    .instagram-confirm-btn {
        background: white !important;
        color: #8a3ab9 !important;
        font-weight: 600 !important;
        border-radius: 6px !important;
        padding: 8px 16px !important;
        transition: transform 0.2s !important;

        &:hover {
            transform: scale(1.05);
        }
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    // Existing styles
    .cms-nav{
        position: absolute;
        left: 0;
        right: 0;
        margin: auto;
        display: flex;
        align-items: center;
        gap: 10px;
        width: fit-content;
        &__item{
            cursor: pointer;
            padding: 10px;
            border-radius: 5px;
            &_active{
                background: linear-gradient(90deg, #322c4b 0%, #363a48 100%);
            }
        }
        &__buttons{
            display: flex;
            align-items: center;
            gap: 10px;
        }
    }
    .cms-content-wrapper{
        height: 100%;
    }
}
</style>
