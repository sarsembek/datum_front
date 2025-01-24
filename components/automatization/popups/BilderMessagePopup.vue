<template>
    <div class="builder-message-popup">
        <div
            class="builder-message-popup__content"
        >
            <div
                class="close"
                @click="emit('close')"
            >
                <svg-icon
                    icon="close-popup"
                    fill="#A3A3C1"
                />
            </div>
            <div
                v-if="errors.length > 0"
                class="errors"
            >
                <div
                    v-for="(error, errorIndex) in errors"
                    :key="`error-${errorIndex}`"
                    class="error-item"
                >
                    <div class="error-item__circle" />
                    <div class="error-item__text">
                        {{ error }}
                    </div>
                </div>
            </div>
            <h4 class="title">
                Создать ответ
            </h4>
            <div class="create-steps">
                <div
                    v-if="activePage === 1"
                    class="step"
                >
                    <div class="step-item">
                        <div class="step-item__name">
                            Название
                        </div>
                        <input-custom
                            v-model="replyName"
                            class="step-item__input"
                            placeholder="Название ответа..."
                        />
                    </div>
                    <div class="step-item">
                        <div class="step-item__name">
                            Отвечать на...
                        </div>
                        <div class="keywords">
                            <div class="keywords__types">
                                <radio-custom
                                    v-model="activeReplyTo"
                                    :options="replyTo"
                                    name="keywords-radio-group"
                                />
                            </div>
                            <div
                                v-if="activeReplyTo == 'commentIs' || activeReplyTo == 'commentContains'"
                                class="keywords__items"
                            >
                                <div
                                    v-for="(keyword, keywordIndex) in keywords"
                                    :key="`keyword-${keywordIndex}`"
                                    class="keyword-item"
                                    :class="{'keyword-item_placeholder': !keyword.name}"
                                    contenteditable
                                    @input="handleKeywordInput($event, keyword)"
                                    @keydown="handleKeywordKeyDown($event)"
                                >
                                    <div
                                        :class="{
                                            'keyword-item__text': keyword.name,
                                            'keyword-item__placeholder': !keyword.name
                                        }"
                                    >
                                        {{ keyword.name ? keyword.name : "Введите текст" }}
                                    </div>
                                    <svg-icon
                                        class="keyword-item__delete"
                                        icon="close-popup"
                                        fill="#A3A3C1"
                                        width="14"
                                        height="14"
                                        @click="deleteKeyword(keywordIndex)"
                                    />
                                </div>
                                <div
                                    class="keyword-item keyword-item_add"
                                    @click="addKeyword()"
                                >
                                    Добавить слово
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    v-if="activePage === 2"
                    class="step"
                >
                    <div class="step-item">
                        <div class="step-item__name">
                            Посты
                        </div>
                        <radio-custom
                            v-model="activePostsSwitcher"
                            :options="postsSwitcher"
                            name="keywords-radio-group"
                        />
                        <div
                            v-if="activePostsSwitcher === 'selectedPosts'"
                            :key="instagramPostsKey"
                            class="posts"
                        >
                            <div
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
                            <div
                                v-if="instagramPosts.length === 0"
                                class="posts__loading"
                            >
                                <div class="loading-circle" />
                            </div>
                        </div>
                    </div>
                    <div class="step-item">
                        <div class="step-item__name">
                            Ответы
                        </div>
                        <div class="step-item__help-text">
                            Если вы добавите несколько ответов, то ответ будет выбран случайно
                        </div>
                        <div class="step-item__answers">
                            <div
                                v-for="(answer, answerIndex) in answers"
                                :key="`answer-${answerIndex}`"
                                class="answer-item"
                            >
                                <textarea
                                    v-model="answer.text"
                                    class="answer-item__textarea"
                                    :maxlength="640"
                                    placeholder="Напишите сообщение..."
                                />
                                <svg-icon
                                    class="answer-item__remove"
                                    icon="close-popup"
                                    fill="#A3A3C1"
                                    @click="addOrRemoveAnswer(answerIndex)"
                                />
                            </div>
                        </div>
                        <div
                            class="step-item__add"
                            @click="addOrRemoveAnswer(-1)"
                        >
                            Добавить ответ
                        </div>
                    </div>
                </div>
            </div>
            <div class="builder-message-popup__footer">
                <button-custom
                    class="cancel footer-btn"
                    b-form="cancel"
                    :value="activePage === 1 ? 'Закрыть': 'Назад'"
                    @click="activePage > 1 ? changePage(false) : $emit('close')"
                />
                <div class="pages-circles">
                    <div
                        class="pages-circles__item"
                        :class="{'active': activePage === 1}"
                    />
                    <div
                        class="pages-circles__item"
                        :class="{'active': activePage === 2}"
                    />
                </div>
                <button-custom
                    class="next footer-btn"
                    b-form="blue"
                    :value="activePage === 1 ? 'Далее': 'Сохранить'"
                    @click="activePage < 2 ? changePage() : saveAutomatizationMessgae()"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useFbStore } from '~/store/integrations'
const { getInstagramPosts, addAutomatizationMessage, changeAutomatizationMessage } = useFbStore()

const emit = defineEmits(['close'])

const props = defineProps({
  automatizationMessage: { type: Object, default: null }
})

const localAutomatizationMessage = ref(props.automatizationMessage)

const createLocalkeywords = () => {
  const keywords = localAutomatizationMessage.value?.keywords || ['']
  return keywords.map(keyword => ({ name: keyword }))
}

const createLocalAnswers = () => {
  const answers = localAutomatizationMessage.value?.answers || ['']
  return answers.map(answer => ({ text: answer }))
}

const createLocalSelectedPosts = () => {
  let selectedPostsIds = []
  if (localAutomatizationMessage.value?.selected_posts_ids) {
    selectedPostsIds = [...localAutomatizationMessage.value?.selected_posts_ids]
  }
  return selectedPostsIds
}

const getActivePostType = async () => {
  const selectedPostType = localAutomatizationMessage.value?.active_posts_type || 'allPosts'
  if (selectedPostType === 'selectedPosts' && instagramPosts.length === 0) {
    const data = await getInstagramPosts()
    instagramPosts = data
    instagramPostsKey.value += 1
  }
  return selectedPostType
}

const replyName = ref<string>(localAutomatizationMessage.value?.name || '')
const keywords = reactive<any>(createLocalkeywords())
const activePage = ref<number>(1)
const checkedInstagramPostsIds = reactive(createLocalSelectedPosts())
let instagramPosts = reactive<any>([])
const instagramPostsKey = ref<number>(0)
const answers = reactive<any>(createLocalAnswers())
const errors = reactive<string[]>([])

const replyTo = [
  { id: 1, type: 'commentAny', name: 'Любой комментарий' },
  { id: 2, type: 'commentIs', name: 'Комментарий' },
  { id: 3, type: 'commentContains', name: 'Комментарий включает в себя' }
]

const activeReplyTo = ref<string>(localAutomatizationMessage.value?.reply_to || 'commentIs')

const postsSwitcher = [
  { id: 1, type: 'allPosts', name: 'Все посты' },
  { id: 2, type: 'selectedPosts', name: 'Выбранные посты' }
]
const activePostsSwitcher = ref<string>(await getActivePostType())

watch(activePostsSwitcher, async () => {
  if (activePostsSwitcher.value === 'selectedPosts' && instagramPosts.length === 0) {
    const data = await getInstagramPosts()
    instagramPosts = reactive(data)
    instagramPostsKey.value += 1
  }
})

const addKeyword = () => {
  keywords.push({ name: '' })
}

const deleteKeyword = (keywordIndex) => {
  if (keywords.length > 1) {
    keywords.splice(keywordIndex, 1)
  }
}

const handleKeywordInput = async (event, keyword) => {
  keyword.name += event.data

  await nextTick()
  const keywordTextElement = event.target.querySelector('.keyword-item__text')
  console.log(keywordTextElement)
  if (keywordTextElement) {
    setCursorToEnd(keywordTextElement)
  }
}

const setCursorToEnd = (element) => {
  element.focus()
  const range = document.createRange()
  const selection = window.getSelection()
  range.selectNodeContents(element)
  range.collapse(false)
  selection.removeAllRanges()
  selection.addRange(range)
}

const handleKeywordKeyDown = (event) => {
  if (event.key === 'Enter') {
    event.preventDefault()
  }
}

const addOrRemoveInstagramPost = (postId: string) => {
  const postIndex = checkedInstagramPostsIds.findIndex(e => e === postId.toString())
  if (postIndex === -1) {
    checkedInstagramPostsIds.push(postId.toString())
  } else {
    checkedInstagramPostsIds.splice(postIndex, 1)
  }
  checkIsSelectedPost(postId)
}

const checkIsSelectedPost = (postId: number) => {
  return checkedInstagramPostsIds.includes(postId)
}

const addOrRemoveAnswer = (answerIndex: number) => {
  if (answerIndex !== -1 && answers.length > 1) {
    answers.splice(answerIndex, 1)
  } else if (answerIndex === -1) {
    answers.push({ text: '' })
  }
}

const saveAutomatizationMessgae = async () => {
  if (validatePage()) {
    const keywordsList = keywords.map(e => e.name).filter(name => name.trim() !== '')
    const answersList = answers.map(e => e.text).filter(name => name.trim() !== '')

    const payload = {
      name: replyName.value,
      keywords: keywordsList,
      reply_to: activeReplyTo.value,
      active_posts_type: activePostsSwitcher.value,
      answers: answersList,
      selected_posts_ids: checkedInstagramPostsIds
    }

    const requestOptions = {
      method: localAutomatizationMessage.value ? 'PUT' : 'POST',
      body: JSON.stringify({ ...payload, automatization_message_id: localAutomatizationMessage.value?.id }),
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    }

    const data: any = await useAuthFetch('/api/v1/integrations/instagram-automatization-message/', requestOptions)

    if (localAutomatizationMessage.value) {
      changeAutomatizationMessage(localAutomatizationMessage.value.id, data)
    } else {
      addAutomatizationMessage(data)
    }

    emit('close')
  }
}

const checkkeywordsError = () => {
  if (keywords.length === 0) { return true }
  for (const keyword of keywords) {
    if (!keyword.name || keyword.name.length < 2) {
      return true
    }
  }
  return false
}

const checkAnswersError = () => {
  if (answers.length === 0) { return true }
  for (const answer of answers) {
    if (answer.text === '') {
      return true
    }
  }
  return false
}

const validateFirstPage = () => {
  let noError = true
  errors.splice(0)
  if (!replyName.value) {
    errors.push('Придумайте название автоматизации')
    noError = false
  }
  if (
    (activeReplyTo.value === 'commentIs' || activeReplyTo.value === 'commentContains') &&
    checkkeywordsError()
  ) {
    if (keywords.length === 0) {
      errors.push('Должно быть хотя бы одно ключевое слово / фраза')
    } else {
      errors.push('Ключевые слова не могут быть пустыми и должны состоять как минимум из 2 символов')
    }
    noError = false
  }
  return noError
}

const validateSecondPage = () => {
  let noError = true
  errors.splice(0)
  if (activePostsSwitcher.value === 'selectedPosts' && checkedInstagramPostsIds.length === 0) {
    errors.push('Выберите хотя бы 1 пост')
    noError = false
  }
  if (checkAnswersError()) {
    if (answers.length === 0) {
      errors.push('Должен быть хотя бы 1 ответ')
    } else {
      errors.push('Текст ответов не может быть пустым')
    }
    noError = false
  }
  return noError
}

const validatePage = () => {
  let noError = true
  if (activePage.value === 1) {
    noError = validateFirstPage()
  }
  if (activePage.value === 2) {
    noError = validateSecondPage()
  }
  return noError
}

const changePage = (isNext = true) => {
  if (isNext && validatePage()) {
    activePage.value += 1
  }
  if (!isNext) {
    activePage.value -= 1
  }
}

</script>

<style lang="scss">
@keyframes l20-1{
    0%    {clip-path: polygon(50% 50%,0       0,  50%   0%,  50%    0%, 50%    0%, 50%    0%, 50%    0% )}
    12.5% {clip-path: polygon(50% 50%,0       0,  50%   0%,  100%   0%, 100%   0%, 100%   0%, 100%   0% )}
    25%   {clip-path: polygon(50% 50%,0       0,  50%   0%,  100%   0%, 100% 100%, 100% 100%, 100% 100% )}
    50%   {clip-path: polygon(50% 50%,0       0,  50%   0%,  100%   0%, 100% 100%, 50%  100%, 0%   100% )}
    62.5% {clip-path: polygon(50% 50%,100%    0, 100%   0%,  100%   0%, 100% 100%, 50%  100%, 0%   100% )}
    75%   {clip-path: polygon(50% 50%,100% 100%, 100% 100%,  100% 100%, 100% 100%, 50%  100%, 0%   100% )}
    100%  {clip-path: polygon(50% 50%,50%  100%,  50% 100%,   50% 100%,  50% 100%, 50%  100%, 0%   100% )}
}

@keyframes l20-2{
    0%    {transform:scaleY(1)  rotate(0deg)}
    49.99%{transform:scaleY(1)  rotate(135deg)}
    50%   {transform:scaleY(-1) rotate(0deg)}
    100%  {transform:scaleY(-1) rotate(-135deg)}
}

.builder-message-popup{
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
        display: flex;
        flex-direction: column;
        gap: 15px;
        margin: 0 16px;
        position: relative;
        height: auto;
        width: 800px;
        padding: 40px 20px;
        border-radius: 5px;
        background: var(--additional-box-border);
        z-index: 800;
        max-height: calc(100vh - 100px);
        overflow: auto;
        .close{
          cursor: pointer;
          position: absolute;
          top: 12px;
          right: 12px;
        }
        .errors{
            display: flex;
            flex-direction: column;
            gap: 15px;
            background: #343839;
            padding: 15px;
            border-radius: 5px;
            .error-item{
                display: flex;
                align-items: center;
                gap: 10px;
                &__circle{
                    width: 10px;
                    height: 10px;
                    border-radius: 100%;
                    background: var(--error-color-light);
                }
                &__text{
                    color: var(--error-color-light);
                }
            }
        }
        .title{
          padding-bottom: 20px;
          font-size: var(--font-size-lg-extra);
        }
        .create-steps{
            .step{
                display: flex;
                flex-direction: column;
                gap: 25px;
                .step-item{
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    &__input{
                        .input-content{
                            width: 100%;
                        }
                        &.small-input{
                            .input-content{
                                width: 200px;
                            }
                        }
                    }
                    &__help-text{
                        font-size: var(--font-size-xs);
                        color: var(--gray-color);
                    }
                    &__add{
                        cursor: pointer;
                        color: var(--link);
                    }
                    &__answers{
                        display: flex;
                        flex-direction: column;
                        gap: 15px;
                        .answer-item{
                            display: flex;
                            gap: 20px;
                            &__textarea{
                                width: 100%;
                                height: 140px;
                                border: 1px solid #43494b;
                                color: var(--text-color);
                                resize: none;
                                padding-bottom: 2px;
                                background: #343839;
                                border-radius: 5px;
                                padding: 10px;
                                align-content: baseline;
                                &::placeholder {
                                    font-size: var(--font-size);
                                }
                            }
                            &__remove{
                                cursor: pointer;
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
                            gap: 10px;
                        }
                        &__items{
                            display: flex;
                            gap: 10px;
                            flex-wrap: wrap;
                            .keyword-item{
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                gap: 10px;
                                padding: 4px 10px;
                                background-color: #2f3334;
                                width: fit-content;
                                min-width: 80px;
                                border-radius: 5px;
                                &__text{
                                    width: 100%;
                                    height: 100%;
                                }
                                &_add{
                                    cursor: pointer;
                                    background: var(--link);
                                }
                                &__placeholder{
                                    color: var(--gray-color);
                                }
                                &__delete{
                                    margin-top: 2px;
                                    cursor: pointer;
                                }
                            }
                        }
                    }
                    .posts{
                        &__items{
                            display: grid;
                            grid-template-columns: repeat(4, 1fr);
                            gap: 15px;
                            max-height: 500px;
                            overflow: auto;
                            &_loaded{
                                background: #343839;
                                padding: 15px;
                                padding-right: 10px;
                                border-radius: 10px;
                            }
                            .post-item{
                                position: relative;
                                border-radius: 5px;
                                overflow: hidden;
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
                        &__loading{
                            width: 100%;
                            height: 100%;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            .loading-circle{
                                width: 50px;
                                aspect-ratio: 1;
                                border-radius: 50%;
                                border: 8px solid #514b82;
                                animation:
                                    l20-1 0.8s infinite linear alternate,
                                    l20-2 1.6s infinite linear;
                            }
                        }
                    }
                }
            }
        }
    }
    &__footer{
        margin-top: 20px;
        padding-top: 30px;
        border-top: 1px solid #434343;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .footer-btn{
            width: 120px;
        }
        .pages-circles{
            display: flex;
            align-items: center;
            gap: 8px;
            &__item{
                cursor: pointer;
                width: 10px;
                height: 10px;
                border-radius: 100%;
                background-color: var(--gray-color);
                &.active{
                    background-color: var(--gray-color-two);
                }
            }
        }
    }
}
</style>
