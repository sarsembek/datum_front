<template>
    <div
        v-click-outside="() => emit('close')"
        class="instagram-card-popup"
    >
        <img
            class="instagram-card-popup__photo"
            alt="photo"
            loading="lazy"
            :src="getImageUrl(client.profile_pic)"
        >
        <div class="instagram-card-popup__group user-data">
            <div class="user-data__item user-data__username">
                {{ client.username ? client.username : 'Неизвестный контакт' }}
            </div>
            <div class="user-data__item">
                <svg-icon
                    icon="user"
                    width="20"
                    height="20"
                />
                <p>
                    {{ client.name ? client.name : 'Неизвестный контакт' }}
                </p>
            </div>
            <div class="user-data__item">
                <svg-icon
                    :icon="client.subscription ? 'subscribe' : 'unsigned'"
                    width="20"
                    height="20"
                />
                <p>
                    {{ client.subscription ? 'Подписан' : 'Не подписан' }}
                </p>
            </div>
            <div class="user-data__item">
                <svg-icon
                    icon="gender"
                    width="20"
                    height="20"
                />
                <p>
                    {{ client.gender ? client.gender : 'Неизвестный пол' }}
                </p>
            </div>
            <div class="user-data__item">
                <svg-icon
                    icon="id-card"
                    width="20"
                    height="20"
                />
                <p>
                    {{ client.instagram_id }}
                </p>
            </div>
            <div class="user-data__item">
                <svg-icon
                    icon="instagram"
                    width="20"
                    height="20"
                />
                <a
                    v-if="client.username"
                    target="_blank"
                    :href="`https://www.instagram.com/${client.username}`"
                >
                    {{ client.username }}
                </a>
                <p v-else>
                    Нет данных
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({
  client: { type: Object, required: true }
})

const emit = defineEmits(['close'])

const getImageUrl = (picture: string) => {
  return picture || '/fb-profile.png'
}
</script>

<style scoped lang="scss">
.instagram-card-popup{
    position: relative;
    height: calc(100% - 60px);
    padding: 20px;
    min-width: 360px;
    width: 360px;
    height: 100%;
    z-index: 100;
    border-left: 1px solid #2d3132;
    &__photo{
        margin-bottom: 20px;
        border-radius: 10px;
        width: 100%;
        aspect-ratio: 6 / 5;
    }
    &__group{
        display: flex;
        flex-direction: column;
        gap: 15px;
        .user-data{
            &__username{
                font-size: var(--font-size-lg);
            }
            &__item{
                display: flex;
                align-items: center;
                gap: 10px;
            }
        }
    }
}
</style>
