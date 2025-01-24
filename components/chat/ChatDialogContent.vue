<template>
    <div class="chat-dialog-content">
        <slot />
    </div>
</template>

<script setup lang="ts">

</script>

<style scoped lang="scss">
.chat-dialog-content{
    width: 100%;
    height: 100%;
    background-color: #343839;
    padding: 0 20px 20px 20px;
    display: flex;
    flex-flow: column-reverse;
    gap: 15px;
}
</style>
