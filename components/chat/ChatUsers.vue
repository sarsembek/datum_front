<template>
    <div class="chat-users">
        <div class="chat-users__header"></div>
        <div class="chat-users__content">
            <div
                v-for="client in clients"
                :key="`client-${client.id}`"
                class="user"
                @click="
                    useLiveChatStore().setActiveClient(client);
                    $router.push(`/chat/${client.instagram_id}`)
                "
            >
                <div class="user__avatar">
                    <img
                        alt="photo"
                        loading="lazy"
                        :src="getImageUrl(client.profile_pic)"
                    >
                </div>
                <div class="user__info">
                    <div class="top-info">
                        <div class="top-info__username">
                            {{ client.username ? client.username : 'Неизвестный контакт' }}
                        </div>
                        <div class="top-info__last-date"></div>
                    </div>
                    <div class="text">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Nunc luctus gravida nisl, at posuere dui volutpat sit amet.
                        Pellentesque vestibulum sollicitudin lorem, in eleifend massa maximus vel.
                        Aliquam sollicitudin laoreet dictum. Sed faucibus tellus vitae eleifend aliquam.
                        Nullam nibh velit, accumsan vitae nunc quis, euismod egestas massa.
                        Nunc bibendum arcu augue, eu iaculis justo ultricies sit amet. Vivamus eu blandit enim,
                        ac ultricies lacus. Suspendisse vitae cursus erat, quis viverra tellus. Fusce ut diam
                        vel sem placerat iaculis.
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useLiveChatStore } from '~/store/chat'
const clients = await useLiveChatStore().getClients()

const getImageUrl = (picture: string) => {
  return picture || '/fb-profile.png'
}
</script>

<style scoped lang="scss">
.chat-users{
    position: relative;
    min-width: 440px;
    width: 440px;
    height: 100%;
    overflow: hidden;
    border-right: 1px solid #2d3132;
    z-index: 100;
    &__content{
        .user{
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px 25px;
            &__avatar{
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
            &__info{
                .top-info{
                    margin-bottom: 5px;
                }
                .text{
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    width: 305px;
                    font-size: var(--font-size-xs);
                }
            }
            &:hover{
                background-color: #2b2f30;
            }
        }
    }
}
</style>
