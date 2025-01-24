<template>
    <div class="facebook-pages">
        <div
            v-if="title || subtitle"
            class="facebook-pages__text"
        >
            <div class="title">
                {{ title }}
            </div>
            <div class="subtitle">
                {{ subtitle }}
            </div>
        </div>
        <div class="facebook-pages__accounts">
            <div
                v-for="(facebookPage, facebookPageIndex) in facebookPages"
                :key="`facebookPage-${facebookPageIndex}`"
                class="facebook-page-account"
                @click="selectFacebookPage(
                    facebookPage['id'],
                    facebookPage['access_token'],
                    facebookPage['instagram_business_account']['id']
                )"
            >
                <div class="facebook-page-account__icon">
                    {{ nameToUpper(facebookPage['name']) }}
                </div>
                <div class="facebook-page-account__data">
                    <div class="name">
                        {{ facebookPage['name'] }}
                    </div>
                    <div class="id">
                        {{ facebookPage['id'] }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useFbStore } from '~/store/integrations'
const { updateFacebookUser, getFacebookPages } = useFbStore()
const { facebookPages } = storeToRefs(useFbStore())
getFacebookPages()

defineProps({
  title: { type: String, default: 'Выберите страницу' },
  subtitle: {
    type: String,
    default: `Если вы обновите страницу, то будет выбрана первая страница.
    В дальнейшем вы сможете изменить это в настройках`
  }
})

const nameToUpper = (name: string) => {
  const splits = name.split(' ')
  let totalString = ''
  for (let i = 0; i < splits.length; i++) {
    const word = splits[i].substring(0, 1).toUpperCase()
    totalString += word
    if (i === 1) { break }
  }
  return totalString
}

const selectFacebookPage = async (id: any, accessToken: any, instagramId: any) => {
  await updateFacebookUser(null, id, accessToken, instagramId)
  await refreshNuxtData()
}
</script>

<style scoped lang="scss">
.facebook-pages{
    &__text{
        .title{
            margin-bottom: 5px;
            font-size: var(--font-size-lg-extra);
            font-weight: var(--font-weight-semibold);
        }
        .subtitle{
            width: 500px;
            margin-bottom: 20px;
            font-size: var(--font-size);
            font-weight: var(--font-weight-medium);
            color: var(--gray-color-two);
        }
    }
    &__accounts{
        .facebook-page-account{
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 20px;
            background-color: var(--additional-box);
            border: 1px solid var(--additional-box);
            border-radius: 5px;
            width: fit-content;
            transition: all 0.3s ease;
            &:hover{
                border: 1px solid var(--border-color-hover);
            }
            &__icon{
                display: flex;
                align-items: center;
                justify-content: center;
                width: 50px;
                height: 50px;
                border-radius: 100%;
                background-color: var(--bg-color-two);
                font-size: var(--font-size-md);
                font-weight: var(--font-weight-medium);
            }
            &__data{
                .name{
                    margin-bottom: 4px;
                }
                .id{
                    font-size: var(--font-size-xs);
                    font-weight: var(--font-weight-medium);
                    color: var(--gray-color-two);
                }
            }
        }
    }
}
</style>
