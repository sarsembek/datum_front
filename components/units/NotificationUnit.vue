<template>
    <div
        class="notification-widget"
        :style="[
            {'animation-delay': timer + 's'},
            {'bottom': bottomPosition + 'px'}
        ]"
    >
        <div class="notification-widget__timer">
            <div
                class="timer"
                :class="{
                    'timer_successfull': successfull,
                    'timer_warning': warning,
                    'timer_error': error
                }"
                :style="{'animation-duration': timer + 's'}"
            />
        </div>
        <div class="notification-widget__content">
            <div class="title">
                {{ title }}
            </div>
            <div class="description">
                {{ description }}
            </div>
        </div>
        <div
            class="notification-widget__close"
            @click="closeNotification()"
        >
            <svg-icon
                icon="cancel"
                width="24"
                height="24"
                fill="#FFFFFF"
            />
        </div>
    </div>
</template>

<script setup>
defineProps({
  // Default Button Props
  timer: { type: Number, default: 5 },
  title: { type: String, required: true },
  description: { type: String, required: true },
  bottomPosition: { type: Number, default: 20 },
  value: { type: [String, Number], default: null },

  // Types
  error: { type: Boolean, default: false },
  warning: { type: Boolean, default: false },
  successfull: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const counterInterval = setTimeout(() => {
  emit('close')
}, 5000)

const closeNotification = () => {
  clearInterval(counterInterval)
  emit('close')
}

</script>

<style lang="scss" scoped>
@keyframes notification-render {
  0% {
    transform: translateZ(-250px);
  }
  100% {
    transform: translateZ(0);
  }
}

@keyframes notification-progressbar {
  0% {
    height: 100%;
    top: 0;
  }
  100% {
    height: 100%;
    top: 100%;
  }
}

@keyframes close-animation {
    0% {
        transform: translateX(400px);
        opacity: 0;
    }
    100% {
        transform: translateX(0);
        opacity: 1;
    }
}

.notification-widget{
    animation: close-animation 2s ease forwards;
    z-index: 5000;
    padding: 16px 24px 16px 8px;
    position: fixed;
    display: flex;
    right: 20px;
    max-width: 900px;
    width: fit-content;
    height: auto;
    background: linear-gradient(96deg, rgba(240, 68, 56, 0.24) 28.24%, rgba(240, 68, 56, 0.12) 82.74%), #03041C;
    box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.25);
    border-radius: 10px;
    overflow: hidden;
    &__timer{
        position:relative;
        width: 2px;
        background: var(--bg-dark-blue);
        overflow: hidden;
        .timer{
            position: absolute;
            width: 100%;
            border-radius: 10px;
            animation-name: notification-progressbar;
            animation-iteration-count: 1;
            // &_successfull{
            //     background-color: var(--bg-dark-blue);
            // }
            // &_warning{
            //     background-color: var(--bg-dark-blue);
            // }
            &_error{
                background-color: var(--text-error-color);
            }
        }
    }
    &__content{
        width: 100%;
        margin-left: 16px;
        .title{
            font-size: var(--font-size-lg);
            font-weight: var(--font-weight-medium);
            line-height: 140%;
            margin-bottom: 8px;
        }
        .description{
            font-size: var(--font-size-md);
            font-weight: var(--font-weight-medium);
            line-height: 140%;
        }
    }
    &__close{
        cursor: pointer;
    }
}
</style>
