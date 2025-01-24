<template>
    <div class="input-custom">
        <div
            v-if="title"
            class="input-label"
        >
            {{ title }}
        </div>
        <div
            class="input-content"
            :class="[{'disabled': disabled, 'range': type==='range'}]"
        >
            <input
                v-model="proxyValue"
                class="input input_default"
                :class="[
                    {'error': iError },
                    {'focused': focused },
                    {'active': proxyValue },
                ]"
                :autocomplete="autocomplete"
                :disabled="disabled"
                :form="form"
                :max="max"
                :maxlength="maxlength"
                :name="name"
                :pattern="pattern"
                :placeholder="placeholder"
                :readonly="readonly"
                :required="required"
                :size="size"
                :step="step"
                :type="localType"

                @input="onInput($event)"
                @change="onChange($event)"
                @focus="focused = true"
                @blur="focused = false"
            >
            <svg-icon
                v-if="passwordType"
                class="password-icon"
                :icon="localType === 'password' ? 'eye-hide' : 'eye-show'"
                stroke="#4830F9"
                width="28"
                height="28"
                @click="localType === 'password' ? localType = 'text' : localType = 'password'"
            />
        </div>
        <div
            v-if="iError"
            class="input-error"
        >
            {{ iErrorName }}
        </div>
    </div>
</template>

<script setup lang="ts">
import '@css/controls/input-custom.scss'

const props = defineProps({
  // Default Input Props
  autocomplete: { type: String, default: null },
  title: { type: String, default: null },
  disabled: { type: Boolean, default: null },
  form: { type: String, default: null },
  max: { type: Number, default: 10000 },
  maxlength: { type: Number, default: null },
  min: { type: Number, default: -10000 },
  minlength: { type: Number, default: null },
  name: { type: String, default: null },
  pattern: { type: String, default: null },
  placeholder: { type: String, default: null },
  readonly: { type: Boolean, default: null },
  required: { type: Boolean, default: null },
  size: { type: Number, default: null },
  step: { type: Number, default: null },
  type: {
    type: String as (() => 'tel' |
      'range' |
      'hidden' |
      'number' |
      'password' |
      'search' |
      'text' |
      undefined),
    default: null
  },
  modelValue: { type: [String, Number], default: null },

  // Custom Input Props
  bName: { type: String, default: null },
  iError: { type: Boolean, default: false },
  iErrorName: { type: String, default: null },
  bIcon: { type: String, default: null },

  // Input Types
  default: { type: Boolean, default: false },
  passwordType: { type: Boolean, default: false }
})

const localType = props.passwordType ? ref('password') : ref(props.type)

const emit = defineEmits(['input', 'focus', 'change', 'update:modelValue'])

const proxyValue = ref<string | number>(props.modelValue)
const focused = ref<Boolean>(false)

const onInput = (event: any): void => {
  let newValue = (event.target as HTMLInputElement).value
  if (props.type === 'number') {
    if (Number(newValue) > props.max) { newValue = String(props.max) }
    if (Number(newValue) < props.min) { newValue = String(props.min) }
  }

  proxyValue.value = newValue
  emit('input', newValue)
  emit('update:modelValue', newValue)
}

const onChange = (event: any): void => {
  const newValue = (event.target as HTMLInputElement).value
  proxyValue.value = newValue
  emit('change', event.target.value)
}

watch(() => props.modelValue, (newValue) => {
  proxyValue.value = newValue
})

onMounted(() => {
  proxyValue.value = props.modelValue
})

</script>
