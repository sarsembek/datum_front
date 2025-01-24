/* eslint-disable camelcase */
import { defineStore } from 'pinia'

interface UserSettingsInterface {
  email?: string;
  password?: string;
  name?: string;
  surname?: string;
  phone?: string;
  token: string;
}

interface UserChangePasswordInterface {
  old_password: string;
  new_password: string;
}

interface UserInterface {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
  phone: string | null;
  active_project_id: number;
  is_staff?: boolean;
  is_superuser?: boolean
}

export const useUserStore = defineStore('user', {
  state: () => ({
    accessToken: useCookie('boardToken').value || '',
    user: null as UserInterface | null
  }),
  actions: {
    async getUser () {
      if (this.accessToken) {
        const data: any = await useAuthFetch('/api/v1/auth/user/', {
          method: 'get'
        })
        if (data) {
          this.user = data
          return this.user
        }
      }
      return null
    },
    async userChangePassword ({ old_password, new_password }: UserChangePasswordInterface) {
      const data: any = await useAuthFetch('api/v1/auth/password/change/', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ old_password, new_password1: new_password, new_password2: new_password })
      }).then((res) => { return res })
      return data
    },
    async userChangeSettings ({ email = '', first_name = '', last_name = '', phone = '' }: UserSettingsInterface) {
      const data: any = await useAuthFetch('/api/v1/user/', {
        method: 'put',
        body: JSON.stringify({ email, first_name, last_name, phone })
      })
      return data
    }
  },
  persist: true
})
