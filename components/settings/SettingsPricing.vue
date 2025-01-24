<template>
    <div class="settings-pricing">
        <div class="settings-pricing__tariffs">
            <div class="billing-cards">
                <billing-price-card
                    v-for="billingCard in billingCards"
                    :key="`billingCard-${billingCard.id}`"
                    :tip="billingCard.tip"
                    :price="billingCard.price"
                    :price-crrency="billingCard.priceCrrency"
                    :description="billingCard.description"
                    :billing-items="billingCard.billingItems"
                    :button-text="billingCard.buttonText"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const billingCards = [
  {
    id: 1,
    tip: 'Базовый',
    price: 'Бесплатно',
    priceCrrency: null,
    description: 'Для ознакомления с продуктом',
    billingItems: ['100 взаимодеействий', '1 аккаунт', '1 проект'],
    buttonText: 'Узнать больше'
  },
  {
    id: 2,
    tip: 'PRO',
    price: '10',
    priceCrrency: '$',
    description: 'Для полного погружения',
    billingItems: [
      '1000 взаимодеействий',
      'Доп. взаиодейтсвия - 500 / $4',
      '1 аккаунт',
      'Доп. аккаунты - 1 / $15',
      '1 проект'
    ],
    buttonText: 'Купить'
  }
]
</script>

<style scoped lang="scss">
.settings-pricing{
    &__tariffs{
        .billing-cards{
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
        }
    }
}
</style>
