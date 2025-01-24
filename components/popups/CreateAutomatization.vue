<template>
    <popup-wrapper
        class="popup-template"
        title="Создать шаблон"
        @close="emit('close')"
        @save="cretateTemplate()"
    >
        <div class="step">
            <div class="step-item">
                <div class="step-item__name">
                    Картинка
                </div>
                <div class="step-item__image">
                    <drop-zone-custom
                        @upload="showMyImage($event, instaActiveIndex, instaActiveType)"
                    />
                    <img
                        id="template-thumbnil"
                        class="thumbnil-image"
                        :class="{'thumbnil-image_active': imageFile }"
                        :src="typeof(imageFile) === 'string' ? imageFile : ''"
                        alt="image"
                    >
                </div>
            </div>
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
            <div class="step-item">
                <div class="step-item__name">
                    Описание
                </div>
                <textarea
                    v-model="description"
                    class="answer-item__textarea"
                    :maxlength="1500"
                    placeholder="Напишите краткое описание шаблона"
                />
            </div>
        </div>
    </popup-wrapper>
</template>

<script setup lang="ts">

</script>

<style scoped lang="scss">

</style>
