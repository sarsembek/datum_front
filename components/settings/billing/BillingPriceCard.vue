<template>
    <div class="billing-price-card">
        <div class="billing-price-card_wrapper">
            <div class="billing-price-card__tip">
                {{ tip }}
            </div>
            <div class="billing-price-card__price">
                {{ priceCrrency }} {{ price }}
            </div>
            <div class="billing-price-card__description">
                {{ description }}
            </div>
            <div class="billing-price-card__items">
                <div
                    v-for="(item, itemIndex) in billingItems"
                    :key="`billingItem-${itemIndex}`"
                    class="item"
                >
                    <svg-icon
                        icon="check_circle"
                        class="item__icon"
                        width="20"
                        height="20"
                        fill="#0F87A1"
                    />
                    <p class="item__text">
                        {{ item }}
                    </p>
                </div>
            </div>
        </div>
        <button-custom
            class="billing-price-card__button"
            b-form="blue"
            :value="buttonText"
            @click="$emit('click', $event)"
        />
    </div>
</template>

<script setup lang="ts">

defineEmits(['click'])
defineProps({
  tip: { type: String, required: true },
  price: { type: [String, Number], required: true },
  priceCrrency: { type: String, default: null },
  description: { type: String, required: true },
  billingItems: { type: Array<String>, required: true },
  buttonText: { type: String, default: 'Выбрать план' }
})
</script>

<style scoped lang="scss">
.billing-price-card{
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    border: 1px solid #37383a;
    border-radius: 10px;
    padding: 20px;
    width: 290px;
    height: 420px;
    background: linear-gradient(207deg, #111214 0%, #17181d 100%);
    &__tip{
        margin-bottom: 25px;
        background: #2a2b2d;
        border: 1px solid #37383a;
        border-radius: 30px;
        padding: 5px 10px;
        width: fit-content;
        height: fit-content;
    }
    &__price{
        margin-bottom: 3px;
        font-size: var(--font-size-lg-extra);
        font-weight: 600;
    }
    &__description{
        padding-bottom: 20px;
        margin-bottom: 20px;
        font-size: var(--font-size-xs);
        color: #979EAC;
        border-bottom: 1px solid rgba(55, 56, 58, 0.5);
    }
    &__items{
        display: flex;
        flex-direction: column;
        gap: 15px;
        .item{
            display: flex;
            align-items: center;
            gap: 5px;
            color: #979EAC;
        }
    }
    &__button{
        width: 100%;
    }
}
</style>
