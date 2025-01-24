<template>
    <div class="settings-password">
        <div class="unit">
            <div class="unit__info">
                <div class="title">
                    Пароль
                </div>
                <div class="subtitle">
                    В этом разделе вы можете изменить свой пароль, если это необходимо.
                </div>
            </div>
            <div class="unit__functional">
                <div class="item">
                    <input-custom
                        v-model="passwordSettingsForm.old_password"
                        default
                        class="input-board"
                        placeholder="Введите текущий пароль"
                        title="Текущий пароль"
                        :i-error="v$.old_password.$error"
                        :i-error-name="
                            v$.old_password.$errors[0] ? String(v$.old_password.$errors[0].$message) : ''
                        "
                    />
                </div>
                <div class="item">
                    <input-custom
                        v-model="passwordSettingsForm.new_password"
                        default
                        class="input-board"
                        placeholder="Введите новый пароль"
                        title="Новый пароль"
                        :i-error="v$.new_password.$error"
                        :i-error-name="
                            v$.new_password.$errors[0]? String(v$.new_password.$errors[0].$message) : ''
                        "
                    />
                </div>
                <div class="item">
                    <input-custom
                        v-model="passwordSettingsForm.confirm_new_password"
                        default
                        class="input-board"
                        placeholder="Введите новый пароль еще раз"
                        title="Подтвердите новый пароль"
                        :i-error="v$.confirm_new_password.$error"
                        :i-error-name="
                            v$.confirm_new_password.$errors[0] ?
                                String(v$.confirm_new_password.$errors[0].$message) : ''
                        "
                    />
                </div>
            </div>
        </div>
        <div class="settings-password__buttons">
            <button-custom
                default
                value="Изменить пароль"
                @click="changePassword()"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { required, sameAs, helpers, minLength } from '@vuelidate/validators'
import { useVuelidate } from '@vuelidate/core'
import { useUserStore } from '~/store/user'

const { userChangePassword } = useUserStore()

const passwordSettingsForm = reactive({
  old_password: '',
  new_password: '',
  confirm_new_password: ''
})
const rules = computed(() => {
  return {
    old_password: {
      required: helpers.withMessage('Необходимое поле', required),
      minLength: helpers.withMessage('Пароль должен состоять минимум из 6 символов', minLength(6))
    },
    new_password: {
      required: helpers.withMessage('Необходимое поле', required),
      minLength: helpers.withMessage('Пароль должен состоять минимум из 6 символов', minLength(6))
    },
    confirm_new_password: {
      required: helpers.withMessage('Необходимое поле', required),
      minLength: helpers.withMessage('Пароль должен состоять минимум из 6 символов', minLength(6)),
      sameAs: helpers.withMessage('Пароли должны совпадать', sameAs(passwordSettingsForm.new_password))
    }
  }
})

const v$ = useVuelidate(rules, passwordSettingsForm)

const changePassword = async () => {
  v$.value.$validate()
  if (!v$.value.$error) {
    const data = await userChangePassword({
      old_password: passwordSettingsForm.old_password,
      new_password: passwordSettingsForm.new_password
    })
    if (data.type === 'Error' && data.old_password) {
      toast(data.old_password[0], {
        theme: 'dark',
        type: 'error',
        position: 'bottom-right',
        transition: 'flip',
        dangerouslyHTMLString: true
      })
    } else {
      toast('Пароль успешно изменен', {
        theme: 'dark',
        type: 'success',
        position: 'bottom-right',
        transition: 'flip',
        dangerouslyHTMLString: true
      })
    }
  }
}
</script>

<style lang="scss">
.settings-password{
    position: relative;
    height: 78vh;
    .unit{
        padding-right: 151px;
        @include settings-unit;
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
