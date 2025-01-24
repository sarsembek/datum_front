<template>
    <popup-wrapper
        class="popup-template"
        title="Создать шаблон"
        @close="emit('close')"
        @save="cretateTemplate(); emit('close')"
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
import { useAutomatizationStore } from '~/store/automatization'

const emit = defineEmits(['close', 'create'])
const name = ref<string>('')
const description = ref<string>('')
const imageFile = ref<ImageData>(null)
const imageBase64 = ref<String>(null)

const showMyImage = (file: File) => {
  const imageType = /image.*/
  if (file.type.match(imageType)) {
    const img = document.getElementById('template-thumbnil') as any
    if (img) {
      img.file = file
      const reader = new FileReader()
      reader.onload = (function (aImg: any) {
        return function (e) {
          aImg.src = e.target!.result
          imageBase64.value = aImg.src
        }
      })(img)
      imageFile.value = file
      reader.readAsDataURL(file)
      img.style.display = 'block'
    }
  }
}

const cretateTemplate = async () => {
  const data: any = await useAuthFetch('/api/v1/cms/automatization/', {
    method: 'post',
    body: {
      name: name.value,
      description: description.value,
      image: imageBase64.value,
      is_template: 'true'
    },
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  })
  useAutomatizationStore().isTemplate = true
  const router = useRouter()
  router.push(`/cms/${data.id}?is_template=true`)
}
</script>

<style lang="scss">
.popup-template{
    .step{
        .step-item{
            &__image{
                position: relative;
                .dropzone{
                    height: 220px;
                }
                .thumbnil-image{
                    pointer-events: none;
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 220px;
                    display: none;
                    width: 100%;
                    object-fit: cover;
                    border-radius: 5px;
                    &_active{
                        display: block;
                    }
                }
                &:hover{
                    outline: 2px dashed var(--border-hover);
                    border-radius: 5px;
                    .thumbnil-image{
                        filter: brightness(70%);
                    }
                }
            }
        }
    }
}
</style>
