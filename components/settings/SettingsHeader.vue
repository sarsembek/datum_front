<template>
    <div class="settings-header">
        <div class="settings-header__nav">
            <div
                v-for="(nav, index) in navItem"
                :key="index"
                class="item"
                :class="{'item_active': nav.active}"
                @click="switchPage(nav)"
            >
                <div class="item__name">
                    {{ nav.name }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

interface NavigationItemInterface {
    name: string,
    link: string,
    active?: boolean
}

const navItem = ref<Array<NavigationItemInterface>>([
  { name: 'Общие', link: 'profile', active: true },
  { name: 'Пароль', link: 'password' },
  //   { name: 'Подписка', link: 'pricing' },
  //   { name: 'Команда', link: 'team' },
  { name: 'Instagram', link: 'instagram' }
  //   { name: 'Теги', link: 'tags' }
])

const deactivateAllItems = () => {
  navItem.value.forEach((item) => {
    item.active = false
  })
}
const switchPage = (page: NavigationItemInterface) => {
  deactivateAllItems()
  page.active = true
  emit('switch', page.link)
}

const emit = defineEmits(['switch'])

</script>

<style lang="scss" scoped>
    .settings-header{
        &__nav{
            height: 55px;
            border-bottom: 1px solid rgba(186, 194, 224, 0.20);
            display: flex;
            gap: 20px;
            .item{
                height: 55px;
                cursor: pointer;
                display: flex;
                align-items: flex-start;
                color: var(--text-color-additional);
                padding: 10px 15px;
                &__icon{
                    margin-right: 5px;
                }
                &__name{
                    margin-top: 5px;
                }
                &_active{
                    border-bottom: 1px solid #6B37D2;
                    color: var(--text-color);
                }
                &:hover{
                    &__icon{
                        .settings{
                            --svg-stroke-color: '#FFFFFF';
                        }
                    }
                    border-bottom: 1px solid #6B37D2;
                    color: var(--text-color);
                }
            }
        }
    }
</style>
