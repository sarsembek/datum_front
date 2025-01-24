<template>
    <div
        class="login"
        @keydown.enter="authLogin()"
    >
        <div class="login__info">
            <h2 class="title">
                Вход в аккаунт
            </h2>
            <span class="subtitle">
                У меня нет аккаунта,
                <nuxt-link to="?type=registration">
                    Регистрация
                </nuxt-link>
            </span>
        </div>
        <div class="login__input">
            <input-custom
                v-model="loginForm.email"
                title="Email"
                placeholder="name@example.com"
                :i-error="v$.email.$error"
                :i-error-name="v$.email.email.$message"
                @change="v$.email.$touch"
            />
        </div>
        <div class="login__input">
            <input-custom
                v-model="loginForm.password"
                password-type
                title="Пароль"
                placeholder="Пароль"
                :i-error="v$.password.$error"
                :i-error-name="v$.password.minLength.$message"
                @change="v$.password.$touch"
            />
        </div>
        <div class="login__options">
            <checkbox-custom
                default-type
                :checked="isRememberMe"
                text="Запомнить меня"
                @click="isRememberSwitch()"
            />
        </div>
        <div class="login__button">
            <button-custom
                value="Войти"
                @click="authLogin()"
            />
        </div>
    </div>
</template>

<script setup>
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { required, email, minLength, helpers } from '@vuelidate/validators'
import { useVuelidate } from '@vuelidate/core'
import { useAuthStore } from '~/store/auth'

const { login } = useAuthStore()

const isRememberMeCookie = useCookie('irmboard')
const isRememberMe = ref(Boolean(isRememberMeCookie.value))

const loginForm = reactive({
  email: '',
  password: ''
})

const rules = computed(() => {
  return {
    email: {
      required: helpers.withMessage('Поле обязательно для ввода', required),
      email: helpers.withMessage('Введите корректный Email', email)
    },
    password: {
      required: helpers.withMessage('Поле обязательно для ввода', required),
      minLength: helpers.withMessage('Пароль не может быть меньше 6 символов', minLength(6))
    }
  }
})

const v$ = useVuelidate(rules, loginForm)
const router = useRouter()

const isRememberSwitch = () => {
  if (isRememberMe.value) {
    isRememberMe.value = !isRememberMe.value
    isRememberMeCookie.value = isRememberMe.value.toString()
  } else {
    isRememberMe.value = !isRememberMe.value
    isRememberMeCookie.value = isRememberMe.value.toString()
  }
}

const authLogin = async () => {
  v$.value.$validate()
  if (!v$.value.$error) {
    const user = await login({ email: loginForm.email, password: loginForm.password }, isRememberMe.value)
    if (user) {
      router.push('/cms')
    } else {
      toast('Неверные Данные! \nПроверьте корректность E-mail и пароля.', {
        theme: 'dark',
        type: 'error',
        position: 'bottom-right',
        transition: 'flip',
        dangerouslyHTMLString: true
      })
    }
  }
}
</script>

<style lang="scss">
.login{
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    gap: 32px;
    &__info{
        .subtitle{
            margin-top: 12px;
            color: var(--text-gray-dark)
        }
    }
    &__options{
        width: 100%;
        display: flex;
        justify-content: space-between;
    }
    &__button{
      width: 100%;
        button{
            width: 100%;
        }
    }
    &__input{
      .input-content{
        width: 100%;
      }
      width: 100%;
        .input-custom{
          width: 100%;
        }
    }
}
</style>
