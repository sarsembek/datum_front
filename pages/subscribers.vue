<template>
    <div class="subscribers-page">
        <page-content-header title="Клиенты" />
        <page-content>
            <div
                v-if="clients.length > 0"
                class="subscribers-page__panel panel"
            >
                <div class="panel__content">
                    <table>
                        <thead>
                            <tr>
                                <th width="20">
                                    <checkbox-custom
                                        default-type
                                        :checked="isSelectedAll"
                                        @click="toggleAllClients()"
                                    />
                                </th>
                                <th width="80">
                                    Фото
                                </th>
                                <th width="200">
                                    Имя
                                </th>
                                <th width="100">
                                    Пол
                                </th>
                                <th>
                                    Статус
                                </th>
                                <th>
                                    Подписка
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="(client, clientIndex) in clients"
                                :key="`client-${client.id}`"
                                @click.stop="activeClient = client"
                            >
                                <td @click="selectClient(clientIndex)">
                                    <checkbox-custom
                                        default-type
                                        :checked="client.is_selected"
                                    />
                                </td>
                                <td>
                                    <div class="circle-avatar">
                                        <img
                                            class="circle-avatar__image"
                                            alt="photo"
                                            loading="lazy"
                                            :src="getImageUrl(client.profile_pic)"
                                        >
                                    </div>
                                </td>
                                <td>
                                    <div class="text">
                                        {{ client.username ? client.username : 'Неизвестный контакт' }}
                                    </div>
                                </td>
                                <td>
                                    <div class="text">
                                        {{ client.gender ? client.gender : 'Неизвестный' }}
                                    </div>
                                </td>
                                <td>
                                    <div class="text">
                                        {{ client.subscription ? 'Подписан' : 'Не подписан' }}
                                    </div>
                                </td>
                                <td>
                                    <div class="text">
                                        {{ client.subscription_automatization_date ?
                                            formattedDate(clientIndex) : 'Не подписан' }}
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div
                v-else
                class="subscribers-page__no-clients"
            >
                <div class="title">
                    Добро пожаловать на страницу клиентов
                </div>
                <div class="subtitle">
                    Сюда попадают все пользователи, которые подписались на ваши
                    <nuxt-link to="/cms">
                        автоматизации
                    </nuxt-link>
                </div>
            </div>
            <Transition name="slide-fade">
                <instagram-card-popup
                    v-if="activeClient"
                    :client="activeClient"
                    @close="activeClient = null"
                />
            </Transition>
        </page-content>
    </div>
</template>

<script setup lang="ts">
const isSelectedAll = ref<boolean>(false)
let allClientsSelected = false

const getClients = async () => {
  const data: any = await useAuthFetch('/api/v1/client/', {
    method: 'get'
  })
  return data
}

const clients = await getClients()
const activeClient = ref(null)

const toggleAllClients = () => {
  for (const client of clients) {
    !allClientsSelected ? client.is_selected = true : client.is_selected = false
  }
  allClientsSelected = !allClientsSelected
}

const selectClient = (clientIndex: number) => {
  if (clients[clientIndex].is_selected === undefined) { clients[clientIndex].is_selected = false }
  clients[clientIndex].is_selected = !clients[clientIndex].is_selected
}

const formattedDate = (clientIndex: number) => {
  return new Date(clients[clientIndex].subscription_automatization_date).toLocaleString('ru-RU')
}

const getImageUrl = (picture: string) => {
  return picture || 'fb-profile.png'
}

</script>

<style scoped lang="scss">
.subscribers-page{
    width: 100%;
    height: 100%;
    &__no-clients{
        width: 100%;
        height: 80%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        text-align: center;
        .title{
            margin-bottom: 20px;
            font-size: var(--font-size-lg-extra);
            font-weight: var(--font-weight-semibold);
        }
        .subtitle{
            font-size: 18px;
            width: 400px;
        }
    }
    .panel{
        padding-right: 20px;
        width: 100%;
        // box-shadow: inset 0 2px 5px -1px rgba(0, 0, 0, 0.25);
        &__content{
            border-radius: 8px;
            background-color: var(--bg-color-two);
            border: none;
            box-shadow: 0 1px 2px #232b392d;
            overflow-x: auto;
            display: block;
            width: 100%;
            min-height: .01%;
            height: fit-content;
            margin-top: 20px;
            max-height: 100%;
        }
        table{
            width: 100%;
            max-width: 100%;
            thead{
                tr{
                    th{
                        padding: 10px 16px;
                        text-align: left;
                        font-weight: 600;
                    }
                }
            }
            tbody{
                tr{
                    cursor: pointer;
                    transition: background-color .1s;
                    &:hover{
                        background-color: var(--bg-color-three);
                    }
                    td{
                        padding: calc(1rem * .75);
                        padding-right: 16px;
                        padding-left: 16px;
                        border-color: var(--bg-color);
                        border-top: 1px solid var(--bg-color);
                        line-height: 1.5;
                        text-align: left;

                        .circle-avatar{
                            width: 50px;
                            height: 50px;
                            background-color: transparent;
                            font-size: 25px;
                            min-height: 50px;
                            min-width: 50px;
                            overflow: hidden;
                            font-weight: 600;
                            line-height: 2;
                            color: var(--tint-neutral-7);
                            text-align: center;
                            vertical-align: baseline;
                            border-radius: 50%;
                            img{
                                width: 100%;
                                height: 100%;
                                -o-object-fit: cover;
                                object-fit: cover;
                            }
                        }
                    }
                }
            }
        }
    }
    .page-content{
        display: flex;
        padding-right: 0;
    }
    .instagram-card-popup{
        box-shadow: 0 2px 5px 1px rgba(0, 0, 0, 0.25);
    }
}

.slide-fade-enter-active {
  transition: all 0.4s ease-out;
}

.slide-fade-leave-active {
    transition: all 0.4s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(350px);
  opacity: 0;
}
</style>
