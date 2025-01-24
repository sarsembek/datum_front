<template>
    <div
        class="trigger-item"
        @click="$emit('open')"
    >
        <div class="trigger-item__icon">
            <svg-icon
                :icon="icon"
                width="24"
                height="24"
                fill="#FFF"
            />
        </div>
        <div class="trigger-item__name">
            {{ name }}
        </div>
        <div
            class="trigger-item__remove"
            @click.stop="$emit('delete')"
        >
            <svg-icon
                icon="trash"
                width="18"
                height="18"
                stroke="#FFF"
                fill="#FFF"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
defineEmits(['delete', 'open'])

defineProps({
  icon: { type: String, default: null },
  name: { type: String, default: null }
})
</script>

<style scoped lang="scss">
.trigger-item{
    cursor: pointer;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 4px;
    border: 1px solid var(--additional-box-border);
    background-color: colorOpacity(--additional-box-border, 0.4);
    transition: all 0.5s ease;
    gap: 10px;
    &:not(:last-child) {
        margin-bottom: 15px;
    }
    &__icon{
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        min-height: 32px;
        height: 32px;
        width: 32px;
        border: 1px solid colorOpacity(--border-color-hover, 0.3);
        border-radius: 5px;
        background-color: colorOpacity(--border-color-hover, 0.2);
        box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.2);
    }
    &__name{
        width: 100%;
        font-size: var(--font-size-xs);
    }
    &__remove{
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 32px;
        min-width: 32px;
        width: 32px;
        height: 32px;
        border: 1px solid colorOpacity(--error-color-light, 0.3);
        border-radius: 5px;
        background-color: colorOpacity(--error-color-light, 0.2);
        box-shadow: 1px 1px 1px 1px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease-in;
        &:hover{
            scale: 1.05;
        }
    }
    &:hover{
        background-color: var(--additional-box);
    }
}
</style>
