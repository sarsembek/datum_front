<template>
    <div class="auth-page">
        <div class="auth-page__left-content">
            <div class="welcome-message">
                <svg-icon
                    class="welcome-message__icon"
                    icon="chat-auth"
                    width="215"
                    height="215"
                />
                <div class="welcome-message__text">
                    Добро пожаловать в Boardchat!
                </div>
            </div>
        </div>
        <div class="auth-page__right-content">
            <registration-auth
                v-if="queryValue == 'registration'"
            />
            <login-auth
                v-else
            />
        </div>
    </div>
</template>

<script setup>

definePageMeta({ layout: 'auth-layout' })

const route = useRoute()
let queryValue = route.query.type
watch(
  () => route.query.type,
  (newValue) => {
    if (newValue) {
      queryValue = newValue
    } else {
      queryValue = ''
    }
  }
)

</script>
<style lang="scss">
.auth-page{
  position: relative;
  display: flex;
  &__left-content{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 40%;
    height: 100vh;
    background: #1c1e20;
    animation: slide-left 2s ease forwards;
      .welcome-message{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #ebfcff;
        font-size: var(--font-size-lg-extra-two);
        font-weight: var(--font-weight-bold);
        &__icon{
          opacity: 0;
          animation: svg-fade-in 2s ease forwards;
        }
        &__text{
          text-align: center;
          opacity: 0;
          animation: text-fade-in 2s ease forwards 1.5s;
        }
      }
    }
    &__right-content{
        animation: slide-right 2s ease forwards;
        background: #25292c;
        width: 60%;
        display: flex;
        align-items: center;
        padding-left: 52px;
    }
}

@keyframes slide-left {
  0% {
    width: 100%;
  }
  70% {
    width: 100%;
  }
  100% {
    width: 40%;
  }
}

@keyframes slide-right {
  0% {
    padding-left: 0;
    width: 0%;
  }
  70% {
    padding-left: 0;
    width: 0%;
  }
  100% {
    padding-left: 52px;
    width: 60%;
  }
}

@keyframes svg-fade-in {
  0% {
    opacity: 0;
    transform: translateY(-20px) scale(0.8);
  }
  50% {
    transform: translateY(-30px) scale(1.4);
  }
  100% {
    opacity: 1;
    transform: translateY(-50px) scale(1);
  }
}

@keyframes text-fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@media (max-width: 920px) {
  .auth-page{
      padding: 0 calc(50% - 322px);
      &__left-content{
        display: none;
      }
      &__right-content{
        width: 100%;
        display: flex;
        align-items: center;
        padding-left: 10px;
      }
  }
  .login, .registration, .forget-password{
    margin-top: 152px;
  }

}

@media (max-width: 720px) {
  .auth-page{
      padding: 0 16px;
  }
  .login, .registration, .forget-password{
    width: 100%;
    &__info{
        width: 100%;
        .title{
          font-size: 32px;
        }
    }
    &__input{
      width: 100%;
      .input-custom{
          width: 100%;
      }
      }
    &__button{
      width: 100%;
      button{
          width: 100%
      }
    }
  }
}
</style>
