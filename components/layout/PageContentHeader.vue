<template>
    <div class="page-content-header">
        <div
            v-if="title"
            class="page-content-header__title"
        >
            {{ title }}
        </div>
        <slot />
    </div>
</template>

<script setup lang="ts">
defineProps({
  title: { type: String, default: null }
})

</script>

<style scoped lang="scss">
.page-content-header{
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    width: 100%;
    height: 70px;
    border-bottom: 1px solid #2d3132;
    z-index: 100;
    &__title{
        width: 200px;
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
    }
}
</style>
