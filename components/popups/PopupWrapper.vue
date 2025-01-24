<template>
    <div class="builder-message-popup">
        <div
            class="builder-message-popup__content"
        >
            <div
                class="close"
                @click="emit('close')"
            >
                <svg-icon
                    icon="close-popup"
                    fill="#A3A3C1"
                />
            </div>
            <div
                v-if="errors.length > 0"
                class="errors"
            >
                <div
                    v-for="(error, errorIndex) in errors"
                    :key="`error-${errorIndex}`"
                    class="error-item"
                >
                    <div class="error-item__circle" />
                    <div class="error-item__text">
                        {{ error }}
                    </div>
                </div>
            </div>
            <h4
                v-if="title"
                class="title"
            >
                {{ title }}
            </h4>
            <div class="popup-content">
                <slot />
            </div>
            <div class="builder-message-popup__footer">
                <slot name="footer">
                    <button-custom
                        class="cancel footer-btn"
                        b-form="cancel"
                        value="Закрыть"
                        @click="emit('close')"
                    />
                    <button-custom
                        class="next footer-btn"
                        b-form="blue"
                        value="Сохранить"
                        @click="emit('save')"
                    />
                </slot>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['close', 'save'])

defineProps({
  title: { type: String, default: null },
  errors: { type: Array<String>, default: [] }
})

</script>

<style lang="scss">
@keyframes l20-1{
    0%    {clip-path: polygon(50% 50%,0       0,  50%   0%,  50%    0%, 50%    0%, 50%    0%, 50%    0% )}
    12.5% {clip-path: polygon(50% 50%,0       0,  50%   0%,  100%   0%, 100%   0%, 100%   0%, 100%   0% )}
    25%   {clip-path: polygon(50% 50%,0       0,  50%   0%,  100%   0%, 100% 100%, 100% 100%, 100% 100% )}
    50%   {clip-path: polygon(50% 50%,0       0,  50%   0%,  100%   0%, 100% 100%, 50%  100%, 0%   100% )}
    62.5% {clip-path: polygon(50% 50%,100%    0, 100%   0%,  100%   0%, 100% 100%, 50%  100%, 0%   100% )}
    75%   {clip-path: polygon(50% 50%,100% 100%, 100% 100%,  100% 100%, 100% 100%, 50%  100%, 0%   100% )}
    100%  {clip-path: polygon(50% 50%,50%  100%,  50% 100%,   50% 100%,  50% 100%, 50%  100%, 0%   100% )}
}

@keyframes l20-2{
    0%    {transform:scaleY(1)  rotate(0deg)}
    49.99%{transform:scaleY(1)  rotate(135deg)}
    50%   {transform:scaleY(-1) rotate(0deg)}
    100%  {transform:scaleY(-1) rotate(-135deg)}
}

.builder-message-popup{
    overflow: auto;
    position: fixed;
    background-color: rgba(0, 0, 0, 0.8);
    top: 0;
    left: 0;
    height: 100%;
    width: 100vw;
    z-index: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    &__content{
        display: flex;
        flex-direction: column;
        gap: 15px;
        margin: 0 16px;
        position: relative;
        height: auto;
        width: 800px;
        padding: 40px 20px;
        border-radius: 5px;
        background: var(--additional-box-border);
        z-index: 800;
        max-height: calc(100vh - 100px);
        overflow: auto;
        .close{
          cursor: pointer;
          position: absolute;
          top: 12px;
          right: 12px;
        }
        .errors{
            display: flex;
            flex-direction: column;
            gap: 15px;
            background: #343839;
            padding: 15px;
            border-radius: 5px;
            .error-item{
                display: flex;
                align-items: center;
                gap: 10px;
                &__circle{
                    width: 10px;
                    height: 10px;
                    border-radius: 100%;
                    background: var(--error-color-light);
                }
                &__text{
                    color: var(--error-color-light);
                }
            }
        }
        .title{
          padding-bottom: 20px;
          font-size: var(--font-size-lg-extra);
        }
        .popup-content{
            .step{
                display: flex;
                flex-direction: column;
                gap: 25px;
                .step-item{
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    &__input{
                        .input-content{
                            width: 100%;
                        }
                        &.small-input{
                            .input-content{
                                width: 200px;
                            }
                        }
                    }
                    &__help-text{
                        font-size: var(--font-size-xs);
                        color: var(--gray-color);
                    }
                    &__add{
                        cursor: pointer;
                        color: var(--link);
                    }
                }
            }
        }
        textarea{
            width: 100%;
            height: 140px;
            border: 1px solid #43494b;
            color: var(--text-color);
            resize: none;
            padding-bottom: 2px;
            background: #343839;
            border-radius: 5px;
            padding: 10px;
            align-content: baseline;
            &::placeholder {
                font-size: var(--font-size);
            }
        }
    }
    &__footer{
        margin-top: 20px;
        padding-top: 30px;
        border-top: 1px solid #434343;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .footer-btn{
            width: 120px;
        }
        .pages-circles{
            display: flex;
            align-items: center;
            gap: 8px;
            &__item{
                cursor: pointer;
                width: 10px;
                height: 10px;
                border-radius: 100%;
                background-color: var(--gray-color);
                &.active{
                    background-color: var(--gray-color-two);
                }
            }
        }
    }
}
</style>
