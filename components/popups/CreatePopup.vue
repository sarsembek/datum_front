<template>
    <popup-wrapper
        v-click-outside="() => emit('close')"
        class="popup-create"
        :title="title"
        @close="emit('close')"
        @save="emit('create', { name })"
    >
        <div class="step">
            <div class="step-item">
                <div class="step-item__name">
                    Название
                </div>
                <input-custom
                    v-model="name"
                    class="step-item__input"
                    placeholder="Название шаблона..."
                />
            </div>
            <div
                v-if="type === 'automation' && templateAutomations.length > 0"
                class="step-item"
            >
                <div class="step-item__name">
                    Шаблоны
                </div>
                <div class="templates">
                    <div
                        v-for="templateAutomation in templateAutomations"
                        :key="`templateAutomations-${templateAutomation.id}`"
                        class="template-item"
                    >
                        <img
                            class="template-item__image"
                            :src="`${serverUrl}${templateAutomation.image}`"
                            alt="image"
                        >
                        <div class="template-item__name">
                            {{ templateAutomation.name }}
                        </div>
                        <div class="template-item__description">
                            {{ templateAutomation.description }}
                        </div>
                        <button-custom
                            class="template-item__select"
                            b-form="blue"
                            value="Выбрать"
                            @click="emit('create', {
                                name: templateAutomation.name,
                                template_id: templateAutomation.id
                            })"
                        />
                    </div>
                </div>
            </div>
        </div>
    </popup-wrapper>
</template>

<script setup lang="ts">
const emit = defineEmits(['close', 'create'])
const name = ref<string>('')
const serverUrl = useRuntimeConfig().public.SERVER_URL

const props = defineProps({
  type: { type: String, required: true }
})

const title = computed(() => {
  if (props.type === 'automation') { return 'Создать автоматизацию' }
  if (props.type === 'tag') { return 'Создать Тег' }
  if (props.type === 'folder') { return 'Создать папку' }
})

const getAutomations = async () => {
  const data: any = await useAuthFetch('/api/v1/cms/automatization/?is_template=true', {
    method: 'get',
    headers: { 'Content-Type': 'application/json' }
  })
  return data
}

const templateAutomations = ref([])

onMounted(async () => {
  if (props.type === 'automation') {
    templateAutomations.value = await getAutomations()
  }
})
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
.popup-create{
    .step{
        .step-item{
            .templates{
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
                .template-item{
                    background-color: var(--bg-color-three);
                    padding: 10px;
                    border-radius: 10px;
                    &__image{
                        border-radius: 5px;
                        margin-bottom: 10px;
                        width: 100%;
                        height: auto;
                        aspect-ratio: 4 / 3;
                        object-fit: cover;
                    }
                    &__name{
                        margin-bottom: 10px;
                        font-weight: 600;
                    }
                    &__description{
                        margin-bottom: 10px;
                        height: 150px;
                        overflow: auto;
                        font-size: var(--font-size-xs);
                        &::-webkit-scrollbar {
                            display: none;
                        }
                    }
                    &__select{
                        width: 100%;
                    }
                }
            }
        }
    }
}
</style>
