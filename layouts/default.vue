<template>
    <div class="page-layout">
        <div class="page-layout__content">
            <sidebar-layout />
            <div class="page-slot">
                <slot />
            </div>
        </div>
        <AuthError />
    </div>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.page-layout{
    overflow: hidden;
    height: 100vh;
    background-color: var(--bg-color-two);
    &__content{
        height: 100vh;
        display: flex;
    }
    .page-slot{
        margin: 15px 15px 15px 0;
        width: 100%;
        background: var(--bg-color);
        border-radius: 10px;
        overflow: scroll;
        &::-webkit-scrollbar {
            display: none;
        }
    }
}
:slotted(div){
    width: 100%;
    height: 100%;
}
</style>
