<template>
    <div class="cms">
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

const { getFacebookUser, facebookPooling } = useFbStore()
const { fbAuthenticated, isFirstLogin, isFbClientAdding } = storeToRefs(useFbStore())
const user = useUserStore().user || await useUserStore().getUser()

const { openCreatePopup } = useAutomatizationStore()
const { createType } = storeToRefs(useAutomatizationStore())

const activePage = ref<String>('automations')
const cmsKey = ref<number>(0)

await getFacebookUser()

const route = useRoute()

onMounted(() => {
  if (route.query.code && !fbAuthenticated.value) {
    facebookPooling()
  }
})
</script>

<style scoped lang="scss">
.cms{
    width: 100%;
    height: 100%;
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
