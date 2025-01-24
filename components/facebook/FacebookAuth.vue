<template>
    <div class="facebook-auth">
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
            Добро пожаловать на страницу автоматизации
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
        <nuxt-link
            to="/privacy"
            class="privacy"
        >
            Политика конфиденциальности
        </nuxt-link>
    </div>
</template>

<script setup lang="ts">
import { useFbStore } from '~/store/integrations'
const { fbAuthenticated } = storeToRefs(useFbStore())

const config = useRuntimeConfig()
const facebookRedirectUri = config.public.FB_URL + '/cms'
const fbClientId = config.public.FB_ID
const fbConfigId = config.public.FB_CONFIG

const facebookAuth = () => {
  if (!fbAuthenticated.value) {
    const width = 562
    const height = 670
    const left = (window.innerWidth / 2) - (width / 2)
    const top = (window.innerHeight / 2) - (height / 2)
    const windowFeatures = `resizable, width=${width}, height=${height}, top=${top}, left=${left}`
    const popup = window.open(
        // eslint-disable-next-line max-len
        `https://www.facebook.com/v19.0/dialog/oauth?client_id=${fbClientId}&redirect_uri=${facebookRedirectUri}&response_type=code&auth_type=rerequest&config_id=${fbConfigId}`,
        '_self',
        windowFeatures
    )
    popup?.focus()
  }
}
</script>

<style scoped lang="scss">
.facebook-auth{
    width: 100%;
    height: 100%;
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
        color: var(--text-color);
    }
    .privacy{
        color: #005dff;
    }
}
</style>
