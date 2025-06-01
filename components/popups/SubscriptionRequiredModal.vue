<template>
    <div class="subscription-required-modal">
        <div class="subscription-required-modal__backdrop" />
        <div class="subscription-required-modal__content">
            <div class="modal-header">
                <svg-icon
                    icon="subscription"
                    width="48"
                    height="48"
                    class="subscription-icon"
                />
                <h2 class="modal-title">
                    Требуется подписка
                </h2>
            </div>
            
            <div class="modal-body">
                <p class="modal-description">
                    Для использования данного сервиса необходимо приобрести план подписки.
                    Выберите подходящий тариф и получите доступ ко всем возможностям платформы.
                </p>
                
                <div class="features-list">
                    <div class="feature-item">
                        <svg-icon
                            icon="checkmark"
                            width="20"
                            height="20"
                            class="check-icon"
                        />
                        <span>Безлимитные автоматизации</span>
                    </div>
                    <div class="feature-item">
                        <svg-icon
                            icon="checkmark"
                            width="20"
                            height="20"
                            class="check-icon"
                        />
                        <span>Продвинутая аналитика</span>
                    </div>
                    <div class="feature-item">
                        <svg-icon
                            icon="checkmark"
                            width="20"
                            height="20"
                            class="check-icon"
                        />
                        <span>Приоритетная поддержка</span>
                    </div>
                    <div class="feature-item">
                        <svg-icon
                            icon="checkmark"
                            width="20"
                            height="20"
                            class="check-icon"
                        />
                        <span>Интеграция с Instagram</span>
                    </div>
                </div>
            </div>
            
            <div class="modal-footer">
                <button-custom
                    class="buy-plan-btn"
                    value="Выбрать план"
                    @click="goToPricing"
                />
                <div class="support-text">
                    Нужна помощь? <a href="mailto:support@starmake.ai" class="support-link">Свяжитесь с нами</a>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// Props to control modal visibility
defineProps({
    show: {
        type: Boolean,
        default: true
    }
})

const goToPricing = () => {
    // Redirect to pricing page - adjust URL as needed
    window.open('https://starmake.ai/profile/plan', '_blank')
}
</script>

<style scoped lang="scss">
.subscription-required-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;

    &__backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(4px);
    }

    &__content {
        position: relative;
        background: var(--bg-color-two);
        border-radius: 16px;
        padding: 40px 32px;
        max-width: 480px;
        width: 90%;
        margin: 20px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
                   0 10px 10px -5px rgba(0, 0, 0, 0.04);
        border: 1px solid var(--border-color-hover);
        text-align: center;
    }

    .modal-header {
        margin-bottom: 32px;

        .subscription-icon {
            display: block;
            margin: 0 auto 16px;
            color: var(--text-active-color);
        }

        .modal-title {
            font-size: var(--font-size-xl);
            font-weight: var(--font-weight-bold);
            color: var(--text-color);
            margin: 0;
        }
    }

    .modal-body {
        margin-bottom: 32px;

        .modal-description {
            font-size: var(--font-size);
            line-height: 1.6;
            color: var(--gray-color-two);
            margin: 0 0 24px 0;
        }

        .features-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
            text-align: left;

            .feature-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 8px 0;

                .check-icon {
                    color: #10B981;
                    flex-shrink: 0;
                }

                span {
                    font-size: var(--font-size-sm);
                    color: var(--text-color);
                }
            }
        }
    }

    .modal-footer {
        .buy-plan-btn {
            width: 100%;
            margin-bottom: 16px;
            background: linear-gradient(135deg, var(--text-active-color) 0%, #6366f1 100%);
            border: none;
            padding: 16px 24px;
            border-radius: 8px;
            font-weight: var(--font-weight-semibold);
            transition: all 0.2s ease;

            &:hover {
                transform: translateY(-1px);
                box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.2);
            }
        }

        .support-text {
            font-size: var(--font-size-xs);
            color: var(--gray-color);

            .support-link {
                color: var(--text-active-color);
                text-decoration: none;
                
                &:hover {
                    text-decoration: underline;
                }
            }
        }
    }
}

// Animation for modal appearance
@keyframes modalFadeIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

.subscription-required-modal__content {
    animation: modalFadeIn 0.3s ease-out;
}

// Responsive design
@media (max-width: 640px) {
    .subscription-required-modal {
        &__content {
            padding: 32px 24px;
            margin: 16px;
        }
    }

    .modal-header {
        .modal-title {
            font-size: var(--font-size-lg);
        }
    }

    .features-list {
        .feature-item {
            span {
                font-size: var(--font-size-xs);
            }
        }
    }
}
</style>
