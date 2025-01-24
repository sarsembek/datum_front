<template>
    <div
        class="registration"
    >
        <div class="registration__info">
            <h2 class="title">
                Регистрация
            </h2>
            <span class="subtitle">
                У меня уже есть аккаунт,
                <nuxt-link to="?type=login">
                    Вход
                </nuxt-link>
            </span>
        </div>
        <div class="registration__input registration__input_fullname">
            <input-custom
                v-model="regitrationForm.name"
                title="Имя*"
                placeholder="Имя"
                :i-error="v$.name.$error"
                :i-error-name="v$.name.required.$message"
                @change="v$.name.$touch"
            />
            <input-custom
                v-model="regitrationForm.surname"
                title="Фамилия*"
                placeholder="Фамилия"
                :i-error="v$.surname.$error"
                :i-error-name="v$.surname.required.$message"
                @change="v$.surname.$touch"
            />
        </div>
        <div class="registration__input">
            <input-custom
                v-model="regitrationForm.email"
                title="Email*"
                placeholder="Email"
                :i-error="v$.email.$error"
                :i-error-name="v$.email.email.$message"
                @change="v$.email.$touch"
            />
        </div>
        <div class="registration__input">
            <input-custom
                v-model="regitrationForm.password"
                password-type
                title="Пароль*"
                placeholder="Пароль"
                :i-error="v$.password.$error"
                :i-error-name="v$.password.minLength.$message"
                @change="v$.password.$touch"
            />
        </div>
        <div class="registration__input">
            <input-custom
                v-model="regitrationForm.phone"
                title="Номер телефона"
                placeholder="Номер телефона"
            />
        </div>
        <div class="registration__button">
            <button-custom
                value="Зарегистрироваться"
                @click="authRegistration()"
            />
        </div>
    </div>
</template>

<script setup>
import { required, email, minLength, helpers } from '@vuelidate/validators'
import { useVuelidate } from '@vuelidate/core'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/store/auth'

const { userRegistration } = useAuthStore()

const { user } = storeToRefs(useAuthStore())

const router = useRouter()

const regitrationForm = reactive({
  name: '',
  surname: '',
  email: '',
  password: '',
  phone: ''
})

const rules = computed(() => {
  return {
    name: {
      required: helpers.withMessage('Поле обязательно для ввода', required)
    },
    surname: {
      required: helpers.withMessage('Поле обязательно для ввода', required)
    },
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

const v$ = useVuelidate(rules, regitrationForm)

const authRegistration = async () => {
  v$.value.$validate()
  if (!v$.value.$error) {
    await userRegistration({
      firstName: regitrationForm.name,
      lastName: regitrationForm.surname,
      email: regitrationForm.email,
      password: regitrationForm.password,
      phone: regitrationForm.phone
    })
    if (user.value) {
      router.push('/cms')
    } else {
      toast('Неверные Данные! \nПроверьте корректность введенных данных', {
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
.registration{
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    gap: 32px;
    &__info{
        .title{
          margin-bottom: 5px;
        }
        .subtitle{
            font-size: var(--font-size-md);
            color: var(--text-gray-dark)
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
      &_fullname{
        display: flex;
        gap: 15px;
      }
    }
    &__button{
      width: 100%;
      button{
        width: 100%;
      }
    }
}

@media (max-width: 1210px) {
    .registration{
        &__input{
          width: 95%;
          .input-custom{
            width: 100%;
          }
        }
    }
}

@media (max-width: 920px) {
}

@media (max-width: 720px) {
    .registration{
        &__input{
            width: 100%;
            .input-custom{
                width: 100%;
            }
        }
        &__button_mobile{
          display: block;
        }
    }
}
</style>
