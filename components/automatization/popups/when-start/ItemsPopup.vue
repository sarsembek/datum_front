<template>
    <div class="items-popup">
        <div
            v-for="(item, itemIndex) of items"
            :key="`item-${itemIndex}`"
            class="items-popup__item"
            @click="$emit('getItem', item)"
        >
            {{ item }}
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({
  items: { type: Array<String>, required: true }
})

defineEmits(['getItem'])
</script>

<style scoped lang="scss">
.items-popup{
    background-color: var(--bg-color-three);
    border-radius: 5px;
    box-shadow: 0px 0px 8px 0px rgba(43, 41, 41, 0.25);
    z-index: 10;
    position: absolute;
    &__item{
        cursor: pointer;
        padding: 10px 10px;
        &:hover{
            background-color: var(--additional-box-border);
        }
    }
}
</style>
