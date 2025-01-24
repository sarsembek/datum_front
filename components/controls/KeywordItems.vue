<template>
    <div class="keyword-items">
        <div
            v-for="(keyword, keywordIndex) in localKeywords"
            :key="`keyword-${keywordIndex}`"
            class="keyword-item"
        >
            <input
                v-model="localKeywords[keywordIndex]"
                type="text"
                class="keyword-item__keyword"
                :class="{'keyword_placeholder': keyword.length === 0}"
                :style="{'width': setInputWidth(localKeywords[keywordIndex].length) }"
                placeholder="Текст"
                @input="onInput($event)"
            >
            <svg-icon
                v-if="localKeywords.length > 1"
                icon="close-popup"
                class="keyword-item__remove"
                fill="#aaaeb7"
                :width="18"
                :height="18"
                @click="removeKeyword(keywordIndex)"
            />
        </div>
        <div
            class="keyword-item keyword-item__add"
            @click="addKeyword()"
        >
            Добавить слово
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: { type: Array as PropType<string[]>, required: true }
})

const emit = defineEmits(['update:modelValue'])

const localKeywords = computed({
  get: () => [...props.modelValue],
  set: (newKeywords) => {
    emit('update:modelValue', newKeywords)
  }
})

const setInputWidth = (valueLength: number) => {
  return valueLength === 0 ? '81px' : `${40 + (valueLength * 8.5)}px`
}

const onInput = (e: any) => {
  e.target.style.width = setInputWidth(e.target.value.length)
  emit('update:modelValue', localKeywords.value)
}

const removeKeyword = (keywordIndex: number) => {
  if (localKeywords.value.length > 1) {
    const updatedKeywords = [...localKeywords.value]
    updatedKeywords.splice(keywordIndex, 1)
    localKeywords.value = updatedKeywords
  }
}

const addKeyword = () => {
  localKeywords.value = [...localKeywords.value, '']
}
</script>

<style scoped lang="scss">
.keyword-items{
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    .keyword-item{
        position: relative;
        border: 1px solid var(--bg-color);
        width: fit-content;
        border-radius: 5px;
        max-width: max-content;
        &__keyword{
            @include text-mixin;
            font-family: var(--font-family);
            padding: 5px 10px;
            padding-right: 25px;
            background: none;
            border: none;
        }
        &__add{
            cursor: pointer;
            background: var(--link);
            padding: 5px 10px;
        }
        &_placeholder{
            width: 81px;
        }
        &__remove{
            cursor: pointer;
            position: absolute;
            right: 5px;
            top: 0;
            bottom: 0;
            margin: auto;
            z-index: 2;
        }
        &:hover, &:active{
            border: 1px solid var(--border-color-hover);
        }
        &::placeholder{
            color: var(--gray-color);
        }
    }
}
</style>
