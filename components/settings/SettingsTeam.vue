<template>
    <div class="settings-team">
        <div class="unit">
            <div class="unit__info">
                <div class="title">
                    Члены команды
                </div>
                <div class="subtitle">
                    Пригласите в ваш проект свою команду, чтобы работать быстрее и сотрудничать вместе.
                    Управляйте их правами, чтобы лучше структурировать работу.
                </div>
                <div class="invite">
                    <button-custom
                        disabled
                        value="Пригласить"
                    />
                </div>
            </div>
            <div class="unit__functional">
                <div class="header">
                    <div class="header__item">
                        Имя
                    </div>
                    <div class="header__item">
                        Дата присоединения
                    </div>
                    <div class="header__item">
                        Последняя активность
                    </div>
                    <div class="header__item">
                        Роль
                    </div>
                </div>
                <div class="item item_owner">
                    <div class="item__name">
                        <div class="icon">
                            <img
                                src="@img/avatar.jpg"
                                alt="avatar"
                            >
                        </div>
                        <div class="info">
                            <div class="info__title">
                                {{ user.name }} {{ user.surname }}
                            </div>
                            <div class="info__subtitle">
                                {{ user.email }}
                            </div>
                        </div>
                    </div>
                    <!-- <div class="item__date">
                        {{ new Date(user.created_at).toLocaleDateString() }}
                    </div>
                    <div class="item__date">
                        {{ new Date(user.login_at).toLocaleDateString() }}
                    </div> -->
                    <div class="item__selection">
                        <input-custom
                            v-model="owner"
                            default
                            disabled
                        />
                        <!-- <selection-custom
                            settigns-type
                            placeholder="Роль"
                            :options="[
                                { name: 'Владелец'},
                                { name: 'Редактор' }
                            ]"
                        /> -->
                    </div>
                    <!-- <div class="item__delete">
                        <svg-icon
                            icon="delete"
                            stroke="#858487"
                            width="20"
                            height="20"
                        />
                    </div> -->
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/store/auth'
const { user } = storeToRefs(useAuthStore())
let owner = 'Владелец'
</script>

<style lang="scss">
.settings-team{
    position: relative;
    height: 78vh;
    .select-team{
        margin-top: 15px;
        margin-bottom: 15px;
    }
    .unit{
        padding-right: 0;
        @include settings-unit;
        .invite{
            margin-top: 20px;
            display: flex;
            gap: 15px;
        }
        &__functional{
            padding: 20px 20px;
            width: auto;
            .header{
                margin-bottom: 10px;
                display: grid;
                grid-template-columns: 315px 150px 150px 150px;
                font-size: var(--font-size-xs);
                &__item{
                    color: var(--text-inactive-color);
                }
                &_invites{
                    grid-template-columns: 315px 264px;
                }
            }
            .item{
                display: grid;
                grid-template-columns: 315px 150px 150px 200px 20px;
                align-items: center;
                font-size: var(--font-size-xs);
                &__name{
                    display: flex;
                    align-items: center;
                    .icon{
                        margin-right: 10px;
                        img{
                            border-radius: 100%;
                        }
                    }
                    .info{
                        &__subtitle{
                            color: var(--text-inactive-color);
                        }
                    }
                }
                &__selection{
                    .selection-custom{
                        width: 100%;
                        margin-top: 0;
                        margin-bottom: 0;
                    }
                }
                &__delete{
                    cursor: pointer;
                }
                &__buttons{
                    display: flex;
                    align-items: center;
                    justify-content: right;
                    gap: 15px;
                }
                &_invites{
                    grid-template-columns: 315px 264px 255px;
                }
            }
        }
    }
    .input-content{
        width: 100%;
    }
    .input-custom{
        width: 100%;
        input{
            width: 100%;
        }
    }
}

</style>
