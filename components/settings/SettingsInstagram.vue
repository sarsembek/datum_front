<template>
    <div
        v-if="fbAuthenticated"
        class="settings-instagram"
    >
        <div class="page-title">
            Instagram
        </div>
        <div class="page-subtitle">
            В этом разделе происходит базовая настройка автоматизации.
        </div>
        <div
            v-if="fbAuthenticated"
            :key="facebookPagesKey"
            class="unit"
        >
            <div class="unit__info">
                <div class="intagram-accounts">
                    <facebook-pages
                        title="Активная страница"
                        subtitle="Выберите страницу инстраграм с которой будет происходить общение с пользователями"
                    />
                </div>
            </div>
        </div>
        <!-- <div class="unit">
            <div class="unit__info">
                <div class="title">
                    Ответ по умолчанию
                </div>
                <div class="subtitle">
                    Ответ по умолчанию срабатывает, когда ваш контакт вводит какой-либо текст,
                    который бот не может распознать, как если бы вы не задали ни одного ключевого слова.
                    Рекомендуем настроить ответ по умолчанию, чтобы приветствовать новых контактов,
                    предоставлять им дополнительную информацию и давать возможность перевести разговор в нужное русло,
                    если контакт растерялся.
                </div>
                <div class="function">
                    <button-custom
                        default
                        value="Создать ответ"
                    />
                </div>
            </div>
        </div> -->
        <!-- <div class="unit">
            <div class="unit__info">
                <div class="title">
                    Обновить разрешения Instagram
                </div>
                <div class="subtitle">
                    Instagram может неожиданно терять связь с разрешениями вашей страницы.
                    Если вы столкнетесь с затруднениями (например,
                    не отправляется контент или не сохраняются настройки),
                    первым делом попробуйте обновить свои разрешения.
                </div>
                <div class="function">
                    <button-custom
                        default
                        value="Обновить разрешения"
                    />
                </div>
            </div>
        </div> -->
        <div class="unit">
            <div class="unit__info">
                <div class="title">
                    Отключить канал Instagram
                </div>
                <div class="subtitle">
                    Если вы хотите остановить свою автоматизацию,
                    вы можете временно отключить канал Instagram. В дальнейшем его можно будет снова включить.
                </div>
                <div class="function">
                    <button-custom
                        default
                        value="Отключить"
                        @click="disableFacebook()"
                    />
                </div>
            </div>
        </div>
    </div>
    <div
        v-else
        class="settings-instagram__empty"
    >
        <div class="icon">
            <div class="icon__item">
                <svg-icon
                    icon="gear"
                    width="92"
                    height="92"
                    fill="#ffffff"
                />
            </div>
            <div class="icon__item">
                <svg-icon
                    icon="gear"
                    width="92"
                    height="92"
                    fill="#ffffff"
                />
            </div>
        </div>
        <div class="title">
            У вас нет подключенных аккаунтов
        </div>
        <div class="subtitle">
            Для того что вы могли создавать воронки, Вам необходимо авторизоваться в ваш аккаунт Facebook.
        </div>
        <button-custom
            class="facebook-auntification"
            value="Продолжить через Facebook"
            b-icon="facebook"
            b-icon-color=""
            @click="facebookAuth()"
        />
    </div>
</template>

<script setup lang="ts">
import { useFbStore } from '~/store/integrations'
const config = useRuntimeConfig()

const { getFacebookUser, addFacebookUser } = useFbStore()
const { fbAuthenticated, fbId } = storeToRefs(useFbStore())
const facebookRedirectUri = config.public.FB_URL + '/settings'
const fbClientId = config.public.FB_ID
const fbConfigId = config.public.FB_CONFIG
const fbSecret = config.public.FB_SEECRET
const facebookPagesKey = ref<number>(0)

const route = useRoute()

onMounted(() => {
  if (route.query.code && !fbAuthenticated.value) {
    console.log('facebookPooling started')
    facebookPooling()
  }
  console.log('getFacebookUser started')
  getFacebookUser()
})

const disableFacebook = async () => {
  if (fbAuthenticated.value) {
    const token = useCookie('access_token').value
    await useAuthFetch('/api/v1/integrations/', {
      method: 'delete',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: { facebook_integration_id: fbId.value }
    })
    fbAuthenticated.value = false
  }
}

const facebookAuth = () => {
  if (!fbAuthenticated.value) {
    const width = 562
    const height = 670
    const left = (window.innerWidth / 2) - (width / 2)
    const top = (window.innerHeight / 2) - (height / 2)
    const windowFeatures = `resizable, width=${width}, height=${height}, top=${top}, left=${left}`
    const popup = window.open(
        `https://www.facebook.com/v19.0/dialog/oauth?client_id=\
        ${fbClientId}&redirect_uri=${facebookRedirectUri}&response_type=code\
        &auth_type=rerequest&config_id=${fbConfigId}`,
        '_self',
        windowFeatures
    )
    // const popup = window.open(
    //     `https://www.facebook.com/v19.0/dialog/oauth?\
    //     response_type=token&\
    //     display=popup&\
    //     client_id=${fbClientId}&\
    //     redirect_uri=${facebookRedirectUri}&\
    //     auth_type=rerequest&\
    //     config_id=1655306055279858`,
    //     '_self',
    //     windowFeatures
    // )
    popup?.focus()
  }
}

const facebookPooling = async () => {
  // eslint-disable-next-line max-len
  const data: any = await $fetch(`https://graph.facebook.com/v19.0/oauth/access_token?client_id=${fbClientId}&redirect_uri=${facebookRedirectUri}&client_secret=${fbSecret}&code=${route.query.code}`, {
    method: 'GET'
  })
  console.log('code', route.query.code)
  console.log('data short', data)
  console.log('fbClientId', fbClientId)
  console.log('facebookRedirectUri', facebookRedirectUri)
  console.log('fbSecret', fbSecret)
  console.log('fbConfigId', fbConfigId)
  if (data) {
    const longToken = await createLongLivedToken(data.access_token)
    console.log('longToken', longToken)
    addFacebookUser(longToken)
  }
}

const createLongLivedToken = async (accessToken: any) => {
  const grantType = 'fb_exchange_token'
  // eslint-disable-next-line max-len
  const params = `grant_type=${grantType}&client_id=${fbClientId}&client_secret=${fbSecret}&fb_exchange_token=${accessToken}`
  console.log('params', params)
  const data: any = await $fetch(`https://graph.facebook.com/oauth/access_token?${params}`, {
    method: 'GET'
  })
  console.log('data long', data)
  return data.access_token
}

// const selectFacebookPage = async (id: any, accessToken: any, instagramId: any) => {
//   if (parseInt(fbActivePageId.value) !== parseInt(id)) {
//     await updateFacebookUser(null, id, accessToken, instagramId)
//     await refreshNuxtData()
//   }
// }

// const nameToUpper = (name: string) => {
//   const splits = name.split(' ')
//   let totalString = ''
//   for (let i = 0; i < splits.length; i++) {
//     const word = splits[i].substring(0, 1).toUpperCase()
//     totalString += word
//     if (i === 1) { break }
//   }
//   return totalString
// }

</script>

<style lang="scss">
.settings-instagram{
    &__empty{
        width: 100vw;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        gap: 35px;
        .icon{
            position: relative;
            &__item{
                position: absolute;
                &:first-child{
                    bottom: 0;
                    right: 0px;
                    animation: clockwiseRotation 3s linear infinite;
                }
                &:last-child{
                    bottom: 65px;
                    left: -25px;
                    transform: rotate(245deg);
                    animation: anticlockwiseRotation 3s linear infinite;
                }
            }
        }

        @keyframes clockwiseRotation {
            from {
                transform: rotate(0);
            }
            to {
                transform: rotate(360deg);
            }
        }

        @keyframes anticlockwiseRotation {
            from {
                transform: rotate(-245deg);
            }
            to {
                transform: rotate(-605deg);
            }
        }
        .title{
            font-size: var(--font-size-lg-extra);
            font-weight: var(--font-weight-semibold);
        }
        .subtitle{
            font-size: 18px;
        }
        .facebook-auntification{
            background-color: #005dff;
            flex-direction: row-reverse;
            gap: 10px;
            margin-right: 0;
        }
    }
    position: relative;
    height: 78vh;
    .page-title{
        margin-bottom: 15px;
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
    }
    .unit{
        padding-right: 151px;
        @include settings-unit;
        &__info{
            .function{
                margin-top: 15px;
            }
        }
        .intagram-accounts{
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
            margin-top: 15px;
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
                &_active{
                    border: 1px solid var(--link);
                    &:hover{
                        border: 1px solid var(--link) !important;
                    }
                }
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
    &__buttons{
        position: absolute;
        margin-top: 20px;
        right: 0;
        bottom: 0;
        display: flex;
        gap: 15px;
        justify-content: right;
    }
    .input-custom{
        width: 100%;
        input{
            width: 100%;
        }
    }
}

</style>
