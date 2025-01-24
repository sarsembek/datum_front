<template>
    <div class="page-content">
        <slot />
    </div>
</template>

<script setup lang="ts">

</script>

<style scoped lang="scss">
.page-content{
    height: calc(100% - 70px);
    padding: 0 20px 0 20px;
    box-shadow: inset 0 2px 5px -1px rgba(0, 0, 0, 0.25);
    overflow: hidden;
}
</style>
