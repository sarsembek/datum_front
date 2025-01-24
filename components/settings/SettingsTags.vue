<template>
    <div class="settings-tags">
        <div class="settings-tags__header">
            <div class="info">
                Теги
                <div class="info__description">
                    Список всех существующих тегов, при необходимости вы можете изменить название тега или удалить его.
                </div>
            </div>
            <div class="create-tag">
                <button-custom
                    value="Новый тег"
                    @click="openCreatePopup('tag')"
                />
            </div>
        </div>
        <div class="settings-tags__content">
            <div class="table-header">
                <div class="table-header__item">
                    <checkbox-custom
                        default-type
                        :checked="checked"
                        @click="checked = !checked"
                    />
                </div>
                <div class="table-header__item">
                    Название
                </div>
            </div>
            <div class="table-content">
                <div class="table-content__item">
                    <div class="cell">
                        <checkbox-custom
                            default-type
                            :checked="checked"
                            @click="checked = !checked"
                        />
                    </div>
                    <div class="cell cell_input">
                        <input-custom
                            v-model="tagName"
                            default
                            placeholder="Название тега"
                        />
                    </div>
                    <div class="cell cell_delete">
                        <svg-icon
                            icon="delete"
                            stroke="#858487"
                            width="20"
                            height="20"
                        />
                    </div>
                </div>
                <div class="table-content__item">
                    <div class="cell">
                        <checkbox-custom
                            default-type
                            :checked="checked"
                            @click="checked = !checked"
                        />
                    </div>
                    <div class="cell cell_input">
                        <input-custom
                            v-model="tagName"
                            default
                            placeholder="Название тега"
                        />
                    </div>
                    <div class="cell cell_delete">
                        <svg-icon
                            icon="delete"
                            stroke="#858487"
                            width="20"
                            height="20"
                        />
                    </div>
                </div>
            </div>
        </div>
        <create-popup
            :is-open="createSettings.isOpen"
            :type="createSettings.type"
            @close="createSettings.isOpen = false"
        />
    </div>
</template>

<script setup lang="ts">
const checked = ref<boolean>(false)
const tagName = ref<string>('Я - тег')

const createSettings = reactive({
  isOpen: false,
  type: ''
})

const openCreatePopup = (type: string) => {
  createSettings.isOpen = true
  createSettings.type = type
}
</script>

<style lang="scss">
.settings-tags{
    width: 100%;
    margin-top: 30px;
    &__header{
        min-width: 100%;
        margin-bottom: 25px;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        .info{
            &__description{
                margin-top: 15px;
            }
        }
    }
    &__content{
        .table-header{
            display: flex;
            align-items: center;
            gap: 15px;
            &__item{
                padding: 20px 0;
                font-size: var(--font-size-md);
                font-weight: var(--font-weight-semibold);
            }
        }
        .table-content{
            width: 100%;
            &__item{
                border-top: 2px solid rgba(186, 194, 224, 0.06);
                padding: 20px 0;
                display: flex;
                align-items: center;
                justify-content: space-between;
                .cell{
                    &_input{
                        width: 100%;
                        .input-custom{
                            width: 100%;
                            input{
                                width: 100%;
                            }
                        }
                        .input-content{
                            width: 100%;
                        }
                    }
                    &_delete{
                        cursor: pointer;
                        margin-left: 10px;
                    }
                }
            }
        }
    }
}
</style>
