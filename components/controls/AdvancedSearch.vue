<template>
    <div
        v-if="haveBackground"
        class="advanced-search__bg"
    />
    <div class="advanced-search">
        <div class="advanced-search__search">
            <svg-icon
                icon="search"
                :width="24"
                :height="24"
            />
            <input-custom
                v-model="proxyValue"
                placeholder="Напишите параметры поиска"
            />
        </div>
        <div class="advanced-search__groups">
            <div
                v-for="(group, groupIndex) in groups"
                :key="`group-${group.name}`"
                class="group-item"
            >
                <div class="group-item__name">
                    {{ group.name }}
                </div>
                <div class="group-item__elements">
                    <div
                        v-for="(element, elementIndex) in group.groupElemets"
                        :key="`group-element-${element.name}`"
                        class="group-element"
                        :class="{
                            'group-element--active': elementIndex + groups.slice(0, groupIndex).reduce(
                                (acc, g) => acc + g.groupElemets.length, 0) === activeIndex }
                        "
                        @click="$emit('onClick', element)"
                    >
                        <div class="group-element__icon">
                            <svg-icon
                                v-if="element.icon"
                                :icon="element.icon"
                                :width="24"
                                :height="24"
                                fill="#FFF"
                            />
                            <p v-else>
                                {{ element.name[0] }}
                            </p>
                        </div>
                        <div class="group-element__content">
                            <div class="element-name">
                                {{ element.name }}
                            </div>
                            <div
                                v-if="element.description"
                                class="element-description"
                            >
                                {{ element.description }}
                            </div>
                        </div>
                        <div
                            v-if="element.badge"
                            class="group-element__badge"
                        >
                            <svg-icon
                                v-if="element.badge?.icon"
                                :icon="element.badge?.icon"
                                class="badge-icon"
                                :width="12"
                                :height="12"
                            />
                            {{ element.badge.name }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="advanced-search__footer">
            <div
                v-for="helpKey in helpKeys"
                :key="`helpKey-${helpKey.type}`"
                class="help-key"
            >
                <div
                    v-if="helpKey.icon1"
                    class="help-key__icon"
                >
                    <svg-icon
                        :icon="helpKey.icon1"
                        :width="16"
                        :height="16"
                        fill="#c9c7d7"
                    />
                </div>
                <div
                    v-if="helpKey.icon2"
                    class="help-key__icon"
                >
                    <svg-icon
                        :icon="helpKey.icon2"
                        :width="16"
                        :height="16"
                    />
                </div>
                <div
                    v-if="helpKey.iconName"
                    class="help-key__icon"
                >
                    {{ helpKey.iconName }}
                </div>
                <div class="help-key__text">
                    {{ helpKey.text }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
type KeyboardShortcut = {
  icon?: string
  key?: string
}

type Badge = {
  name: string
  icon?: string
}

type GroupElemets = {
  name: string
  icon?: string
  description?: string
  popupComponent?: Component
  badge?: Badge
  keyboardShortcut?: KeyboardShortcut[]
}

type Group = {
  name: string,
  groupElemets: GroupElemets[],
}

const emit = defineEmits(['input', 'change', 'update:modelValue', 'onEnter', 'onClick', 'onClose'])

const props = defineProps({
  modelValue: { type: String, default: null },
  groups: { type: Array as PropType<Group[]>, required: true },
  haveBackground: { type: Boolean, default: true }
})

const proxyValue = computed({
  get: () => String(props.modelValue),
  set: (newValue: string) => {
    emit('update:modelValue', String(newValue))
    emit('input', String(newValue))
  }
})

const helpKeys = reactive([
  { type: 'navigation', icon1: 'arrow-top', icon2: 'arrow-down', text: 'для навигации' },
  { type: 'select', icon1: 'select', text: 'для выбора' },
  { type: 'close', iconName: 'esc', text: 'для закрытия' }
])

const activeIndex = ref(-1)

const totalElements = computed(() =>
  props.groups.reduce((acc, group) => acc + group.groupElemets.length, 0)
)

const getElementByIndex = (index: number) => {
  let count = 0
  for (const group of props.groups) {
    if (index < count + group.groupElemets.length) {
      return group.groupElemets[index - count]
    }
    count += group.groupElemets.length
  }
  return null
}

const handleKeydown = (event: KeyboardEvent) => {
  let preventDefault = false

  if (event.key === 'ArrowDown') {
    if (activeIndex.value < totalElements.value - 1) {
      activeIndex.value += 1
    } else {
      activeIndex.value = 0 // Если внизу списка, возвращаемся наверх
    }
    preventDefault = true
  } else if (event.key === 'ArrowUp') {
    if (activeIndex.value > 0) {
      activeIndex.value -= 1
    } else {
      activeIndex.value = totalElements.value - 1 // Если вверху списка, переходим вниз
    }
    preventDefault = true
  } else if (event.key === 'Enter') {
    const activeElement = getElementByIndex(activeIndex.value)
    if (activeElement) {
      emit('onEnter', activeElement)
    }
    preventDefault = true
  } else if (event.key === 'Escape') {
    emit('onClose')
  }

  if (preventDefault) { event.preventDefault() }
  scrollToActiveElement()
}

const scrollToActiveElement = () => {
  // Ищем все group-element элементы
  const groupElements = document.querySelectorAll('.group-element')

  if (activeIndex.value >= 0 && activeIndex.value < groupElements.length) {
    const activeElement = groupElements[activeIndex.value] as HTMLElement
    if (activeElement) {
      activeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      })
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

</script>

<style scoped lang="scss">
.advanced-search{
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  max-width: 600px;
  width: 100%;
  height: 500px;
  z-index: 600;
  background: #1E1E1E;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 2px 4px 4px 2px rgba(0, 0, 0, 0.25);
  &__bg{
    overflow: auto;
    position: fixed;
    background-color: rgba(0, 0, 0, 0.4);
    top: 0;
    left: 0;
    height: 100%;
    width: 100vw;
    z-index: 500;
    align-items: center;
    justify-content: center;
  }
  &__search{
    padding: 0 5px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid colorOpacity(--border-color-hover, 0.1);
    height: 50px;
    ::v-deep .input-custom{
      width: 100%;
      .input-content{
        width: 100%;
      }
      input{
        background: transparent;
        border: none;
      }
    }
  }
  &__groups{
    height: 100%;
    overflow: auto;
    .group-item{
      &:not(:last-child) {
        border-bottom: 1px solid colorOpacity(--border-color-hover, 0.1);
        padding-bottom: 15px;
        margin-bottom: 15px;
      }
      &__name{
        margin-top: 15px;
        margin-bottom: 5px;
        padding-left: 20px;
        font-size: var(--font-size-xs);
        color: var(--gray-color-two);
      }
      &__elements{
        padding: 0 5px;
        .group-element{
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 15px;
          cursor: pointer;
          border-radius: 5px;
          &__icon{
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 34px;
            min-height: 34px;
            height: 34px;
            width: 34px;
            border: 1px solid colorOpacity(--border-color-hover, 0.3);
            border-radius: 5px;
            background-color: colorOpacity(--border-color-hover, 0.2);
            box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.2);
            font-weight: 500;
            font-size: var(--font-size-md);
          }
          &:not(:last-child) {
            margin-bottom: 5px;
          }
          &:hover{
            background: var(--additional-box-blue);
          }
          &--active {
            background: var(--additional-box-blue);
          }
          &__content{
            width: 100%;
            .element-name{
              margin-bottom: 2px;
              font-size: var(--font-size-xs);
            }
            .element-description{
              font-size: var(--font-size-xs);
              color: colorOpacity(--text-color, 0.6);
            }
          }
        }
      }
    }
  }
  &__footer{
    padding: 10px;
    display: flex;
    align-items: center;
    gap: 25px;
    backdrop-filter: blur(4px);
    box-shadow: 0 -2px 10px 0 rgba(16, 18, 19, 0.5);
    background: rgba(#262729, 0.4);
    border-top: 1px solid #3E3E3E;
    .help-key{
      display: flex;
      align-items: center;
      gap: 10px;
      &__icon{
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 28px;
        min-height: 28px;
        height: 28px;
        width: 28px;
        border: 1px solid colorOpacity(--border-color-hover, 0.3);
        border-radius: 5px;
        font-weight: 400;
        font-size: var(--font-size-xs);
        color: #BAC2E0;
      }
      &__text{
        font-size: var(--font-size-xs);
        color: #e5e3eb;
      }
    }
  }
}
</style>
