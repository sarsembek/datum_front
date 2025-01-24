import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import '@/assets/css/controls/vue-date-picker.scss'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('vue-date-picker', VueDatePicker)
})
