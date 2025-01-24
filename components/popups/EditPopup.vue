<template>
    <div
        class="popup-edit"
    >
        <div class="popup-edit__content">
            <div
                class="close"
                @click="emit('close')"
            >
                <svg-icon
                    icon="close-popup"
                    fill="#A3A3C1"
                />
            </div>
            <h4
                v-if="type === 'automation'"
                class="title"
            >
                Переименовать автоматизацию
            </h4>
            <h4
                v-else-if="type === 'folder'"
                class="title"
            >
                Переименовать папку
            </h4>
            <input-custom
                v-model="changingItem.name"
                class="input-name"
                title="Новое название"
            />
            <div class="functional">
                <button-custom
                    b-form="gray"
                    class="functional__cancel"
                    value="Назад"
                    @click="emit('close')"
                />
                <button-custom
                    class="functional__create"
                    value="Переименовать"
                    @click="emit('change', changingItem)"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['close', 'change'])

const props = defineProps({
  type: { type: String, required: true },
  item: { type: Object, required: true }
})

const changingItem = props.item
</script>

<style lang="scss">

@keyframes open-animation {
    80% {
        opacity: 1;
    }
    100% {
        display: flex;
    }
}
.popup-edit{
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
        margin: 0 16px;
        position: relative;
        height: auto;
        width: 613px;
        padding: 25px 0;
        border-radius: 16px;
        background: var(--additional-box-border);
        z-index: 800;
        .close{
          cursor: pointer;
          position: absolute;
          top: 24px;
          right: 24px;
        }
        .icon{
          margin-bottom: 6px;
        }
        .title{
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 2px solid#201e30;
        }
        .input-name{
          padding: 40px 58px 60px 58px;
          border-bottom: 2px solid#201e30;
          .input-content{
            width: 100%;
          }
          .input{
            width: 100%;
          }
        }
        .functional{
          padding: 0 45px;
          padding-top: 25px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
    }
}

@media (max-width: 720px) {
    .popup-sending{
        &__content{
            .title{
                text-align: center;
                margin-bottom: 20px;
            }
            .description{
                @include text-xs-mixin;
            }
            .button{
                button{
                    @include text-md-mixin;
                }
            }
        }
    }
}
</style>
