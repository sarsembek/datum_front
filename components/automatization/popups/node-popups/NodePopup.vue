<template>
    <div
        class="node-popup"
    >
        <div
            ref="nodePopupContent"
            class="node-popup__content"
        >
            <div class="popup-header">
                <div class="popup-header__icon">
                    <svg-icon
                        :icon="icon"
                        width="24"
                        height="24"
                    />
                </div>
                <p class="popup-header__name">
                    {{ name }}
                </p>
            </div>
            <div
                v-if="errors.length >= 1"
                class="popup-errors"
            >
                <div
                    v-for="error in errors"
                    :key="`error-${error}`"
                    class="popup-error"
                >
                    <div class="popup-error__dot" />
                    <div class="popup-error__text">
                        {{ error }}
                    </div>
                </div>
            </div>
            <div class="popup-content">
                <slot />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

const nodePopupContent = ref<HTMLElement | null>(null)

const props = defineProps({
  icon: { type: String, required: true },
  name: { type: String, required: true },
  errors: { type: Array<String>, default: [] }
})

watch(() => props.errors, () => {
  if (props.errors.length > 0 && nodePopupContent.value) {
    nodePopupContent.value.scrollTo({ top: 0, behavior: 'smooth' })
  }
}, { deep: true })
</script>

<style lang="scss">
.node-popup{
    position: absolute;
    width: 360px;
    height: calc(100% - 20px);
    top: 10px;
    left: 10px;
    z-index: 100;
    &__content{
        background-color: var(--bg-color-two);
        border-radius: 8px;
        width: 100%;
        height: 100%;
        padding: 15px;
        overflow: auto;
        .popup-header{
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
            &__icon{
                display: flex;
                align-items: center;
                justify-content: center;
                min-width: 40px;
                min-height: 40px;
                height: 40px;
                width: 40px;
                border: 1px solid colorOpacity(--border-color-hover, 0.3);
                border-radius: 5px;
                background-color: colorOpacity(--border-color-hover, 0.2);
                box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.2);
            }
            &__name{
                font-weight: var(--font-weight-medium);
            }
        }
        .popup-errors{
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 20px;
            .popup-error{
                display: flex;
                align-items: center;
                padding: 5px 10px;
                border: 1px solid colorOpacity(--error-color-light, 0.4);
                border-radius: 5px;
                background: colorOpacity(--error-color-light, 0.2);
                gap: 8px;
                font-size: var(--font-size-xs);
                &__dot{
                    min-width: 7px;
                    min-height: 7px;
                    max-width: 7px;
                    max-height: 7px;
                    background: colorOpacity(--error-color-light, 0.7);
                    border-radius: 100%;
                    box-shadow: 0px 0px 0px 2px colorOpacity(--error-color-light, 0.2);
                }
            }
        }
        .popup-content{
            &__group{
                &:not(:last-child){
                    margin-bottom: 20px;
                    border-bottom: 1px dashed colorOpacity(--border-color-hover, 0.2);
                    padding-bottom: 20px;
                }
                .group-title{
                    margin-bottom: 10px;
                }
                .group-description{
                    margin-bottom: 20px;
                    font-size: var(--font-size-xs);
                    color: colorOpacity(--gray-color-two, 0.7);
                    line-height: 16px;
                }
                .group-error{
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    padding: 5px 10px;
                    border: 1px solid colorOpacity(--error-color-light, 0.4);
                    border-radius: 5px;
                    background: colorOpacity(--error-color-light, 0.2);
                    gap: 8px;
                    font-size: var(--font-size-xs);
                    &__dot{
                        min-width: 7px;
                        min-height: 7px;
                        max-width: 7px;
                        max-height: 7px;
                        background: colorOpacity(--error-color-light, 0.7);
                        border-radius: 100%;
                        box-shadow: 0px 0px 0px 2px colorOpacity(--error-color-light, 0.2);
                    }
                }
                .f-btn{
                    width: 100%;
                    &_fill{
                        grid-column: span 2;
                    }
                }
                &.flex-btns{
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                    .button{
                        font-size: var(--font-size-xs);
                        padding: 0 5px;
                    }
                }
                &.full-btns{
                    .button{
                        font-size: var(--font-size);
                        &:not(:last-child) {
                            margin-bottom: 15px;
                        }
                    }
                }
            }
        }
    }
}
</style>
