<template>
    <div class="settings-details">
        <div class="unit">
            <div class="unit__info">
                <div class="title">
                    Базовая информация
                </div>
                <div class="subtitle">
                    Это основная информация о вас, чтобы вы могли войти в систему,
                    чтобы вас могли найти другие люди или члены вашей команды,
                    а также для того, чтобы получать информацию по почте, например, при смене пароля.
                </div>
            </div>
            <div class="unit__functional">
                <div class="item">
                    <input-custom
                        v-model="profileSettingsForm.first_name"
                        default
                        class="input-board"
                        title="Имя"
                        :i-error="v$.first_name.$error"
                        :i-error-name="v$.first_name.required.$message"
                        @change="v$.first_name.$touch"
                    />
                </div>
                <div class="item">
                    <input-custom
                        v-model="profileSettingsForm.last_name"
                        default
                        class="input-board"
                        title="Фамилия"
                        :i-error="v$.last_name.$error"
                        :i-error-name="v$.last_name.required.$message"
                        @change="v$.last_name.$touch"
                    />
                </div>
                <div class="item">
                    <input-custom
                        v-model="profileSettingsForm.email"
                        default
                        class="input-board"
                        title="E-mail"
                        :i-error="v$.email.$error"
                        :i-error-name="v$.email.email.$message"
                        @change="v$.email.$touch"
                    />
                </div>
                <div class="item">
                    <input-custom
                        v-model="profileSettingsForm.phone"
                        default
                        class="input-board"
                        title="Номер телефона"
                    />
                </div>
            </div>
        </div>
        
        <div class="unit">
            <div class="unit__info">
                <div class="title">
                    Управление токеном
                </div>
                <div class="subtitle">
                    Обновите токен аутентификации, если у вас возникают проблемы с доступом к системе или требуется продлить сессию без повторного входа.
                </div>
            </div>
            <div class="unit__functional">
                <div class="item">
                    <div v-if="tokenInfo" class="token-info">
                        <p><strong>Статус:</strong> {{ tokenInfo.status }}</p>
                        <p v-if="tokenInfo.expiration"><strong>Срок действия до:</strong> {{ tokenInfo.expiration }}</p>
                    </div>
                    
                    <p v-if="tokenMessage" :class="['token-message', tokenMessage.type]">
                        {{ tokenMessage.text }}
                    </p>
                    
                    <button-custom
                        default
                        :value="isRefreshing ? 'Обновление...' : 'Обновить токен'"
                        :disabled="isRefreshing"
                        @click="refreshToken"
                    />
                </div>
            </div>
        </div>
        
        <div class="unit">
            <div class="unit__info">
                <div class="title">
                    Дополнительная информация
                </div>
                <div class="subtitle">
                    Дополнительная информация о вас.
                    Установите фотографию профиля, что бы члены вашей команды могли легче найти вас.
                    Выбор часового пояса позволяет BoardChat показывать данные в удобном вам временном формате.
                </div>
            </div>
            <div class="unit__functional">
                <div class="item">
                    <div class="item__header">
                        Фотография профиля
                    </div>
                    <div class="item__avatar">
                        <div class="icon">
                            <img
                                src="@img/avatar.jpg"
                                alt="avatar"
                            >
                        </div>
                        <div class="actions">
                            <div class="actions__item">
                                Изменить
                            </div>
                            <div class="actions__item actions__item_delete">
                                Удалить
                            </div>
                        </div>
                    </div>
                    <div class="item__timezone">
                        <!-- <div class="title">
                            Часовой пояс
                        </div> -->
                        <!-- <selection-custom
                            class="selection-first"
                            :options="activeDays"
                            placeholder="Длительность"
                        /> -->
                        <input-custom
                            v-model="activeTimeZone"
                            default
                            disabled
                            class="input-board"
                            title="Часовой пояс"
                        />
                    </div>
                </div>
            </div>
        </div>
        <div class="settings-details__buttons">
            <button-custom
                default
                value="Cохранить изменения"
                @click="saveSettings()"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { required, email, helpers } from '@vuelidate/validators'
import { useVuelidate } from '@vuelidate/core'
import { useUserStore } from '~/store/user'
import { useAuthStore } from '~/store/auth'

const user = process.server ? await useUserStore().getUser() : JSON.parse(window.localStorage.getItem('user'))
const { userChangeSettings } = useUserStore()
const authStore = useAuthStore()

// Token refresh functionality
const isRefreshing = ref(false)
const tokenMessage = ref(null)
const tokenInfo = ref(null)

// Check token status on component mount
onMounted(async () => {
  checkTokenStatus()
})

async function checkTokenStatus() {
  const token = authStore.getAccessTokenFromCookie(false)
  if (token) {
    tokenInfo.value = {
      status: 'Активен',
      expiration: 'Информация недоступна'
    }
  } else {
    tokenInfo.value = {
      status: 'Отсутствует или истек',
      expiration: null
    }
  }
}

async function refreshToken() {
  try {
    isRefreshing.value = true
    tokenMessage.value = { type: 'info', text: 'Обновление токена...' }
    
    const result = await authStore.refreshExpiredToken()
    
    if (result) {
      tokenMessage.value = { 
        type: 'success', 
        text: 'Токен успешно обновлен. Время действия токена продлено.' 
      }
      
      // Update token info
      tokenInfo.value = {
        status: 'Активен (обновлен)',
        expiration: 'Обновлено только что'
      }
      
      toast('Токен успешно обновлен!', {
        theme: 'dark',
        type: 'success',
        position: 'bottom-right',
        transition: 'flip'
      })
    } else {
      tokenMessage.value = { 
        type: 'error', 
        text: 'Не удалось обновить токен. Попробуйте еще раз или выполните повторный вход в систему.' 
      }
      
      toast('Ошибка обновления токена', {
        theme: 'dark',
        type: 'error',
        position: 'bottom-right',
        transition: 'flip'
      })
    }
  } catch (error) {
    console.error('Error refreshing token:', error)
    tokenMessage.value = { 
      type: 'error', 
      text: 'Ошибка при обновлении токена. Попробуйте перезагрузить страницу или выполнить повторный вход.' 
    }
    
    toast('Ошибка обновления токена', {
      theme: 'dark',
      type: 'error',
      position: 'bottom-right',
      transition: 'flip'
    })
  } finally {
    isRefreshing.value = false
    
    // Clear success message after 5 seconds
    if (tokenMessage.value?.type === 'success') {
      setTimeout(() => {
        if (tokenMessage.value?.type === 'success') {
          tokenMessage.value = null
        }
      }, 5000)
    }
  }
}

// Existing profile form code
const profileSettingsForm = reactive({
  first_name: user.first_name,
  last_name: user.last_name,
  email: user.email,
  phone: user.phone
})

const rules = computed(() => {
  return {
    first_name: {
      required: helpers.withMessage('Поле обязательно для ввода', required)
    },
    last_name: {
      required: helpers.withMessage('Поле обязательно для ввода', required)
    },
    email: {
      required: helpers.withMessage('Поле обязательно для ввода', required),
      email: helpers.withMessage('Введите корректный Email', email)
    }
  }
})

const v$ = useVuelidate(rules, profileSettingsForm)

const saveSettings = async () => {
  v$.value.$validate()
  if (
    !v$.value.$error &&
    (profileSettingsForm.email !== user.email ||
    profileSettingsForm.first_name !== user.first_name ||
    profileSettingsForm.last_name !== user.last_name ||
    profileSettingsForm.phone !== user.phone)
  ) {
    let email = user.email
    if (profileSettingsForm.email !== user.email) {
      email = profileSettingsForm.email
    }
    const newData = await userChangeSettings({
      email,
      first_name: profileSettingsForm.first_name,
      last_name: profileSettingsForm.last_name,
      phone: profileSettingsForm.phone
    })

    window.localStorage.setItem('user', JSON.stringify(newData))
    toast('Данные успешно изменены!', {
      theme: 'dark',
      type: 'success',
      position: 'bottom-right',
      transition: 'flip',
      dangerouslyHTMLString: true
    })
  }
}

const activeTimeZone = ref(Intl.DateTimeFormat().resolvedOptions().timeZone)

</script>

<style lang="scss">
.settings-details{
    position: relative;
    height: 78vh;
    .unit{
        padding-right: 151px;
        @include settings-unit;
        &__functional{
            .item{
                &__header{
                    margin-bottom: 15px;
                }
                &__avatar{
                    margin-bottom: 20px;
                    display: flex;
                    justify-content: space-between;
                    .icon{
                        font-size: var(--font-size-xxl);
                        width: 80px;
                        height: 80px;
                        border-radius: 100%;
                        img{
                            width: 80px;
                            height: 80px;
                            border-radius: 100%;
                        }
                    }
                    .actions{
                        display: flex;
                        gap: 20px;
                        &__item{
                            cursor: pointer;
                            color: var(--text-color-additional-two);
                            &_delete{
                                color: var(--text-error-color);
                            }
                        }
                    }
                }
                &__timezone{
                    .title{
                        margin-bottom: 15px;
                    }
                }
            }
        }
    }
    &__buttons{
        margin-top: 20px;
        margin-bottom: 10px;
        right: 0;
        display: flex;
        gap: 15px;
        justify-content: right;
        padding-bottom: 20px;
    }
    .input-custom{
        width: 100%;
        input{
            width: 100%;
        }
    }
    
    /* New styles for token section */
    .token-info {
        margin-bottom: 20px;
        padding: 15px;
        background-color: rgba(33, 150, 243, 0.05);
        border-radius: 4px;
        border: 1px solid rgba(33, 150, 243, 0.2);
        
        p {
            margin-bottom: 5px;
            
            &:last-child {
                margin-bottom: 0;
            }
        }
        
        strong {
            color: var(--text-color);
        }
    }

    .token-message {
        padding: 10px;
        border-radius: 4px;
        margin-bottom: 20px;
        font-size: 14px;
        
        &.success {
            background-color: rgba(76, 175, 80, 0.1);
            color: #4CAF50;
            border: 1px solid #4CAF50;
        }
        
        &.error {
            background-color: rgba(244, 67, 54, 0.1);
            color: #F44336;
            border: 1px solid #F44336;
        }
        
        &.info {
            background-color: rgba(33, 150, 243, 0.1);
            color: #2196F3;
            border: 1px solid #2196F3;
        }
    }
}
</style>
