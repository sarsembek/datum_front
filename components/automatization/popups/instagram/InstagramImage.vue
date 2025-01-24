<template>
    <div class="instagram-image">
        <drop-zone-custom
            @upload="showMyImage($event)"
        />
        <img
            :id="`thumbnil-${thumbnilId}`"
            class="thumbnil-image"
            :class="{'thumbnil-image_active': proxyValue }"
            :src="proxyValue"
            alt="image"
        >
        <div
            class="instagram-image__remove"
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
const emit = defineEmits(['update:modelValue', 'delete', 'changeImage'])

const props = defineProps({
  modelValue: { type: String, default: '' },
  thumbnilId: { type: Number, required: true }
})

const proxyValue = computed({
  get: () => props.modelValue,
  set: (newValue: string) => {
    emit('update:modelValue', newValue)
  }
})

const showMyImage = (file: File) => {
  const imageType = /image.*/
  if (file.type.match(imageType)) {
    const img = document.getElementById(`thumbnil-${props.thumbnilId}`) as any
    if (img) {
      img.file = file
      const reader = new FileReader()
      reader.onload = (function (aImg: any) {
        return function (e) {
          aImg.src = e.target!.result
          emit('changeImage', aImg.src)
        }
      })(img)
      reader.readAsDataURL(file)
      img.style.display = 'block'
    }
  }
}
</script>

<style scoped lang="scss">
.instagram-image{
    position: relative;
    .thumbnil-image{
        pointer-events: none;
        position: absolute;
        top: 0;
        left: 0;
        height: 185px;
        display: none;
        width: 100%;
        object-fit: cover;
        border-radius: 5px;
        &_active{
            display: block;
        }
    }
    &__remove{
        position: absolute;
        right: 15px;
        top: 15px;
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
        border-radius: 5px;
        .thumbnil-image{
            filter: brightness(70%);
        }
    }
}
</style>
