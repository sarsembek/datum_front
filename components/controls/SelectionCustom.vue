<template>
    <div
        v-click-outside="() => menuOpen = false"
        class="selection-custom"
        :class="[setType, {'inactive': inactive}]"
    >
        <div
            v-if="title"
            class="input-label"
        >
            {{ title }}
        </div>
        <div
            class="selection-custom__content"
            @click="openMenu()"
        >
            <div
                v-if="localActiveOptions.length === 0"
                class="placeholder"
            >
                {{ placeholder }}
            </div>
            <div
                v-else
                :key="activeOptionsKey"
                class="active-options"
            >
                <ClientOnly>
                    <TransitionGroup
                        :key="`tr-activeOptions`"
                        :css="false"
                        @enter="activeOptionOnEnter"
                    >
                        <div
                            v-for="(active_option, activeOptionIndex) in localActiveOptions"
                            :id="`active-option-${componentID}-${activeOptionIndex}`"
                            :key="`active-option-${activeOptionIndex}`"
                            class="active-option"
                            :class="[
                                {'multiple': multipleType},
                                {'active-option_solo': !multipleType}
                            ]"
                        >
                            <svg-icon
                                v-if="active_option.icon && showActiveOptionIcon"
                                :icon="active_option.icon"
                                class="active-option__icon"
                                :stroke="bIconColor"
                                :fill="bIconColor"
                                width="18"
                                height="18"
                            />
                            <div class="active-option__name">
                                {{ active_option.name }}
                            </div>
                        </div>
                    </TransitionGroup>
                </ClientOnly>
            </div>
            <svg-icon
                icon="down-arrow"
                class="menu-switcher"
                :class="{'menu-switcher_open': menuOpen}"
                stroke="#A7A7A7"
                fill="#A7A7A7"
                width="24"
                height="24"
            />
        </div>
        <transition>
            <div
                v-if="menuOpen"
                class="selection-custom__menu"
                :class="[{ 'menu-enter': menuOpen, 'menu-leave': !menuOpen }]"
            >
                <ClientOnly>
                    <TransitionGroup
                        v-for="(option, optionIndex) in localOptions"
                        :key="`option-item-${optionIndex}`"
                        :css="false"
                        class="options"
                        tag="div"
                        @enter="activeOptionOnEnter"
                    >
                        <div
                            :id="`menu-option-${componentID}-${optionIndex}`"
                            :key="`option-item-${optionIndex}`"
                            class="option-item"
                            @click="menuOptionOnLeave(optionIndex)"
                        >
                            <checkbox-custom
                                v-if="multipleType"
                                default-type
                                :checked="option.is_active"
                            />
                            <div
                                v-if="option.full_name"
                                class="option-item__name"
                            >
                                {{ option.full_name }}
                            </div>
                            <div
                                v-else
                                class="option-item__name"
                            >
                                {{ option.name }}
                            </div>
                        </div>
                    </TransitionGroup>
                </ClientOnly>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import '@css/controls/selection-custom.scss'
import { gsap } from 'gsap'

interface OptionsInterface {
  name: string;
  icon?: string;
  [key: string]: any;
}

const emit = defineEmits(['remove', 'change'])

const props = defineProps({
  // Default Input Props
  placeholder: { type: String, default: null },
  showActiveOptionIcon: { type: Boolean, default: false },
  options: { type: Array<OptionsInterface>, required: true },
  activeOptions: { type: Array<OptionsInterface>, default: null },
  title: { type: String, default: null },

  // Custom Selection Props
  bName: { type: String, default: null },
  bError: { type: Boolean, default: false },
  bErrorName: { type: String, default: null },
  bIcon: { type: String, default: null },
  bIconColor: { type: String, default: '#FFFFFF' },

  // Custom Selection Types
  defaultType: { type: Boolean, default: false },
  settignsType: { type: Boolean, default: false },
  searchType: { type: Boolean, default: false },
  multipleType: { type: Boolean, default: false },
  inactive: { type: Boolean, default: false }
})

const setType = computed(() => {
  const typSelection = props.defaultType
    ? 'default'
    : props.searchType
      ? 'search'
      : props.multipleType
        ? 'multiple'
        : props.settignsType
          ? 'settings'
          : 'default'
  return 'selection-custom_' + typSelection
})

const localOptions = ref<OptionsInterface[]>(props.options)

const localActiveOptions = ref<OptionsInterface[]>([])
const activeOptionsKey = ref<number>(123)

const componentUID = getCurrentInstance()
const componentID = componentUID ? componentUID.uid : 1

watchEffect(() => {
  if (props.multipleType) {
    localActiveOptions.value = []
    for (const item of props.options) {
      if (item.is_active) { localActiveOptions.value.push(toRaw(item)) }
    }
  } else if (props.activeOptions && props.activeOptions.length > 0 && !props.multipleType) {
    localActiveOptions.value = [props.activeOptions[0]]
  } else if ((props.multipleType && localActiveOptions.value.length !== 0) || !props.multipleType) {
    localActiveOptions.value = []
  }
})

onMounted(() => {
  activeOptionsKey.value += 1
})

const changeActiveOption = (item: OptionsInterface): void => {
  if (!props.multipleType) {
    const oldItem = localActiveOptions.value[0]
    emit('change', { old_item: toRaw(oldItem), new_item: item })
    localActiveOptions.value = [item]
    openMenu()
  } else {
    const localOptionsIndex = localOptions.value.findIndex(option => option.name === item.name)
    if (!localOptions.value[localOptionsIndex].is_active) {
      localActiveOptions.value.push(toRaw(item))
    } else {
      const localActiveOptionsIndex = localActiveOptions.value.findIndex(option => option.name === item.name)
      localActiveOptions.value.splice(localActiveOptionsIndex, 1)
    }
    localOptions.value[localOptionsIndex].is_active = !localOptions.value[localOptionsIndex].is_active
    emit('change', { items: toRaw(localOptions) })
  }
}

// Active Options Animation
const activeOptionOnEnter = (el: any): void => {
  gsap.from(el, {
    opacity: 0,
    width: '1px',
    onComplete: () => removeInlineStyles(el)
  })
  gsap.to(el, {
    opacity: 1,
    duration: 0.5,
    onComplete: () => removeInlineStyles(el)
  })
}

const menuOptionOnLeave = (index: number): void => {
  const menuOption = localOptions.value[index]
  const el = document.querySelector(`#menu-option-${componentID}-${index}`)
  if (props.multipleType) {
    gsap.from(el, {
      opacity: 1,
      onComplete: () => removeInlineStyles(el)
    })
    gsap.to(el, {
      opacity: 0,
      duration: 0,
      xPercent: -100,
      onComplete: () => {
        removeInlineStyles(el)
        changeActiveOption(menuOption)
      }
    })
  } else {
    changeActiveOption(menuOption)
  }
}

const removeInlineStyles = (el: any): void => {
  el.removeAttribute('style')
}

const menuOpen = ref<Boolean>(false)

const openMenu = (): void => {
  if (!props.inactive) {
    menuOpen.value = !menuOpen.value
  }
}
</script>
