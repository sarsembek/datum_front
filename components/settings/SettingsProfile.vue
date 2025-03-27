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
const user = process.server ? await useUserStore().getUser() : JSON.parse(window.localStorage.getItem('user'))

const { userChangeSettings } = useUserStore()

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
}

</style>
