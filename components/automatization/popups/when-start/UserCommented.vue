<template>
    <node-popup
        class="when-comment"
        icon="comment"
        name="Пользователь оставил комментарий"
        :errors="errors"
    >
        <div class="popup-content__group">
            <div class="group-title">
                Посты
            </div>
            <div class="group-description">
                Выберите конкретные посты или оставьте все.
            </div>
            <div class="row">
                <radio-custom
                    v-model="activePostsSwitcher"
                    :options="postsSwitcher"
                    name="keywords-radio-group"
                />
            </div>
            <div
                v-if="activePostsSwitcher === 'selectedPosts'"
                class="posts"
            >
                <div
                    v-if="isLoading"
                    class="posts__items posts__items_loading"
                >
                    <div
                        v-for="(_, index) in 6"
                        :key="index"
                        class="post-item"
                        :style="{ animationDelay: `${index * 0.3}s` }"
                    >
                        <div class="post-item__image" />
                    </div>
                </div>
                <div
                    v-else
                    class="posts__items"
                    :class="{'posts__items_loaded' : instagramPosts.length !== 0}"
                >
                    <div
                        v-for="instagramPost in instagramPosts"
                        :key="`instagramPost-${instagramPost.id}`"
                        class="post-item"
                    >
                        <checkbox-custom
                            class="post-item__checkbox"
                            default-type
                            :checked="checkIsSelectedPost(instagramPost.id)"
                            @click="addOrRemoveInstagramPost(instagramPost.id)"
                        />
                        <img
                            class="post-item__image"
                            :src="instagramPost.thumbnail_url || instagramPost.media_url"
                            alt="instagramPost"
                            width="256"
                            height="256"
                        >
                    </div>
                </div>
            </div>
        </div>
        <div class="popup-content__group">
            <div class="group-title">
                Комментарии
            </div>
            <div class="group-description">
                Установите при каких ключевых словах будет запускаться воронка.
            </div>
            <div class="keywords">
                <div class="keywords__types">
                    <radio-custom
                        v-model="activeReplyTo"
                        :options="replyTo"
                        name="keywords-radio-group"
                    />
                </div>
                <keyword-items
                    v-if="activeReplyTo == 'commentIs' || activeReplyTo == 'commentContains'"
                    v-model="keywords"
                />
            </div>
        </div>
        <div
            class="popup-content__group flex-btns"
        >
            <button-custom
                class="f-btn"
                b-form="border"
                value="Вернуться"
                @click="emit('closeAdditionalPopup')"
            />
            <button-custom
                class="f-btn"
                gray
                value="Сохранить"
                @click="saveData()"
            />
        </div>
    </node-popup>
</template>

<script setup lang="ts">
import type { instagramPostsType } from '@/types/instagram'
import { useFbStore } from '~/store/integrations'
const { getInstagramPosts } = useFbStore()

const props = defineProps({
  automatizationMessage: { type: Object, default: null }
})

const emit = defineEmits(['saveData', 'closeAdditionalPopup'])

const localAutomatizationMessage = ref(props.automatizationMessage)
const errors = reactive<string[]>([])
const keywords = ref<string[]>(localAutomatizationMessage.value?.keywords || [''])
const checkedInstagramPostsIds = reactive<number[]>(localAutomatizationMessage.value?.selected_posts_ids || [])
let instagramPosts = reactive<instagramPostsType[]>([])
const replyTo = [
  { id: 1, type: 'commentAny', name: 'Любой комментарий' },
  { id: 2, type: 'commentIs', name: 'Комментарий' },
  { id: 3, type: 'commentContains', name: 'Комментарий включает в себя' }
]
const activeReplyTo = ref<string>(localAutomatizationMessage.value?.reply_to?.type || 'commentIs')
const postsSwitcher = [
  { id: 1, type: 'allPosts', name: 'Все посты' },
  { id: 2, type: 'selectedPosts', name: 'Выбранные посты' }
]
const activePostsSwitcher = ref<string>('allPosts')
const isLoading = ref<boolean>(false)

const loadInstagramPosts = async () => {
  isLoading.value = true
  try {
    const data = await getInstagramPosts()
    instagramPosts = reactive<instagramPostsType[]>(data)
  } catch (error) {
    errors.push('Возникла ошибка при загрзке данных. Попробуйте снова. Автоматически переключено на все посты')
    activePostsSwitcher.value = 'allPosts'
  } finally {
    isLoading.value = false
  }
}

watch(activePostsSwitcher, async () => {
  if (activePostsSwitcher.value === 'selectedPosts' && instagramPosts.length === 0) {
    await loadInstagramPosts()
  }
})

onMounted(() => {
  activePostsSwitcher.value = localAutomatizationMessage.value?.active_posts_type?.type || 'allPosts'
  if (activePostsSwitcher.value === 'selectedPosts') {
    loadInstagramPosts()
  }
})

const addOrRemoveInstagramPost = (postId: number) => {
  const postIndex = checkedInstagramPostsIds.findIndex(e => e === postId)
  if (postIndex === -1) {
    checkedInstagramPostsIds.push(postId)
  } else {
    checkedInstagramPostsIds.splice(postIndex, 1)
  }
  checkIsSelectedPost(postId)
}

const checkIsSelectedPost = (postId: number) => {
  return checkedInstagramPostsIds.includes(postId)
}

const checkkeywordsError = () => {
  if (keywords.value.length === 0) { return true }
  for (const keyword of keywords.value) {
    if (!keyword || keyword.length < 2) {
      return true
    }
  }
  return false
}

const validateCondition = () => {
  errors.splice(0)
  if (activeReplyTo.value !== 'commentAny' && checkkeywordsError()) {
    if (keywords.value.length === 0) {
      errors.push('Должно быть хотя бы одно ключевое слово / фраза')
    } else {
      errors.push('Ключевые слова не могут быть пустыми и должны состоять как минимум из 2 символов')
    }
  }
  if (activePostsSwitcher.value === 'selectedPosts' && checkedInstagramPostsIds.length === 0) {
    errors.push('Выберите хотя бы 1 пост')
  }
  return errors.length === 0
}

const saveData = () => {
  if (validateCondition()) {
    const activeReplyToValue = replyTo.find(e => e.type === activeReplyTo.value)
    const postTypeValue = postsSwitcher.find(e => e.type === activePostsSwitcher.value)
    emit('saveData', {
      reply_to: activeReplyToValue,
      keywords: keywords.value,
      selected_posts_ids: checkedInstagramPostsIds,
      active_posts_type: postTypeValue
    })
  }
}

</script>

<style scoped lang="scss">
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.when-comment{
    padding: 0;
    .row{
        margin-bottom: 15px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 15px;
    }
    .posts{
        &__items{
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            max-height: 500px;
            overflow: auto;
            background: #343839;
            padding: 15px;
            padding-right: 10px;
            border-radius: 10px;
            &_loading{
                .post-item{
                    animation: fadeIn 1.8s infinite;
                }
            }
            .post-item{
                position: relative;
                border-radius: 5px;
                overflow: hidden;
                background: var(--gray-color-two);
                &__checkbox{
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    .custom-checkbox:checked + label svg path{
                        fill: white;
                        stroke: white;
                    }
                    .custom-checkbox:checked + label::before{
                        background: var(--text-active-color);
                    }
                    .custom-checkbox:not(:checked) + label::before{
                        background: var(--gray-color);
                    }
                }
                &__image{
                    width: 100%;
                    height: auto;
                    object-fit: cover;
                    aspect-ratio: 1 / 1;
                }
            }
        }
    }
    .keywords{
        display: flex;
        flex-direction: column;
        gap: 20px;
        &__types{
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
    }
}
</style>
