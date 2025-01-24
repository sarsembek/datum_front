<template>
    <div
        class="chat-message-textarea"
        @mouseenter="onTextareaMouseEnter()"
        @mouseleave="onTextareaMouseLeave()"
    >
        <svg-icon
            v-if="isRecordComplete"
            class="chat-btn"
            icon="trash"
            width="28"
            height="28"
            stroke="#FFFFFF"
            @click="removeAudio()"
        />
        <svg-icon
            v-if="!isRecordComplete && !isRecording"
            class="chat-message-textarea__attach chat-btn chat-btn_attach"
            icon="attach"
            width="28"
            height="28"
        />
        <div
            v-show="isRecordComplete"
            class="waveform-container"
        >
            <svg-icon
                v-if="isPlaying"
                class="waveform-container__button"
                icon="pause"
                width="16"
                height="16"
                fill="#FFFFFF"
                @click="pauseAudio()"
            />
            <svg-icon
                v-else
                class="waveform-container__button"
                icon="play"
                width="16"
                height="16"
                fill="#FFFFFF"
                @click="playAudio()"
            />
            <div
                ref="waveform"
                class="waveform"
            />
            <span class="waveform-container__duration">{{ duration }}</span>
        </div>
        <textarea
            v-show="!isRecordComplete && !isRecording"
            v-model="message"
            :maxlength="640"
            class="chat-message-textarea__textarea"
            placeholder="Напишите сообщение..."
            @input="autoTextareaHeight($event)"
            @click="autoTextareaHeight($event)"
        />
        <div
            v-if="isRecording"
            class="recording"
        >
            <div class="recording__circle" />
            <span class="recording__time">{{ duration }}</span>
            <p class="recording__text">
                Отпустите за пределами этого поля, чтобы отменить действие
            </p>
        </div>
        <div class="chat-message-textarea__buttons">
            <div
                v-if="!isRecording && !isRecordComplete"
                class="emoji"
            >
                <svg-icon
                    class="chat-btn chat-btn_emoji"
                    icon="emoji"
                    width="28"
                    height="28"
                    @click="showEmoji = !showEmoji"
                />
                <Transition name="emoji-show">
                    <emoji-picker
                        v-if="showEmoji"
                        v-click-outside="() => showEmoji = false"
                        theme="dark"
                        @select="onSelectEmoji($event)"
                    />
                </Transition>
            </div>
            <div
                v-if="!message && !isRecordComplete"
                class="microphone-wrapper"
            >
                <div
                    v-if="isRecording"
                    class="circle"
                    :class="{ 'circle_red': !isMouseInsideTextarea }"
                />
                <svg-icon
                    class="chat-btn chat-btn_microphone"
                    icon="microphone"
                    width="28"
                    height="28"
                    @mousedown="startRecording"
                />
            </div>
            <svg-icon
                v-else
                class="chat-btn chat-btn_send"
                icon="send_arrow"
                width="28"
                height="28"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'
import WaveSurfer from 'wavesurfer.js'

const message = ref<string>('')
const showEmoji = ref<boolean>(false)

const autoTextareaHeight = (e: any) => {
  if (message.value) {
    e.target.style.height = (e.target.scrollHeight) + 'px'
  } else {
    e.target.style.height = '28px'
  }
}

const onSelectEmoji = (emoji: any) => {
  message.value += emoji.i
}

const isRecording = ref(false)
const isRecordComplete = ref(false)
const isPlaying = ref(false)
const mediaRecorder = ref<MediaRecorder | null>(null)
const audioChunks = ref<Blob[]>([])
const waveform = ref<HTMLDivElement | null>(null)
const duration = ref<string>('0:00')
const isMouseInsideTextarea = ref<boolean>(false)
let wavesurfer: WaveSurfer | null = null
let recordingInterval: number | null = null
let recordingStartTime: number | null = null

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`
}

const removeAudio = () => {
  mediaRecorder.value = null
  isRecording.value = false
  isRecordComplete.value = false
}

const startRecording = async () => {
  duration.value = '0:00'
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder.value = new MediaRecorder(stream)
    mediaRecorder.value.ondataavailable = (e) => {
      audioChunks.value.push(e.data)
    }
    mediaRecorder.value.start()
    isRecording.value = true
    recordingStartTime = Date.now()
    recordingInterval = setInterval(() => {
      if (recordingStartTime) {
        const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000)
        duration.value = formatTime(elapsed)
      }
    }, 1000)
  }
}

const playAudio = () => {
  if (wavesurfer) {
    wavesurfer.play()
    isPlaying.value = true
  }
}

const pauseAudio = () => {
  if (wavesurfer) {
    wavesurfer.pause()
    isPlaying.value = false
  }
}

const stopRecording = () => {
  if (mediaRecorder.value) {
    const recordingTime = (Date.now() - recordingStartTime) / 1000
    mediaRecorder.value.stop()
    if (isMouseInsideTextarea.value && recordingTime > 0.2) {
      mediaRecorder.value.onstop = () => {
        const audioBlob = new Blob(audioChunks.value, { type: 'audio/wav' })
        const audioUrl = URL.createObjectURL(audioBlob)
        if (wavesurfer) {
          wavesurfer.load(audioUrl)
        }
      }
      isRecordComplete.value = true
    } else {
      mediaRecorder.value = null
      isRecordComplete.value = false
    }
    isRecording.value = false
    audioChunks.value = []
    if (recordingInterval) {
      clearInterval(recordingInterval)
    }
  }
}

const onTextareaMouseEnter = () => {
  isMouseInsideTextarea.value = true
}

const onTextareaMouseLeave = () => {
  isMouseInsideTextarea.value = false
}

const onDocumentMouseUp = () => {
  stopRecording()
}

onMounted(() => {
  wavesurfer = WaveSurfer.create({
    container: waveform.value!,
    waveColor: 'white',
    progressColor: '#0084ff',
    height: 20,
    responsive: true,
    cursorColor: 'transparent',
    barRadius: 2,
    barGap: 2,
    barWidth: 2,
    barHeight: 2,
    normalize: true
  })

  if (wavesurfer) {
    wavesurfer.on('ready', () => {
      duration.value = formatTime(wavesurfer.getDuration())
    })

    wavesurfer.on('audioprocess', () => {
      duration.value = formatTime(wavesurfer.getCurrentTime())
    })

    wavesurfer.on('finish', () => {
      isPlaying.value = false
    })

    wavesurfer.on('timeupdate', (currentTime) => {
      duration.value = currentTime
    })

    wavesurfer.on('ready', () => {
      const container = waveform.value!

      container.addEventListener('mousedown', (e) => {
        const boundingRect = container.getBoundingClientRect()
        const progress = (e.clientX - boundingRect.left) / boundingRect.width
        wavesurfer.seekTo(progress)
        wavesurfer.pause()
        isPlaying.value = false
        const onMouseMove = (moveEvent) => {
          const progressMove = (moveEvent.clientX - boundingRect.left) / boundingRect.width
          wavesurfer.seekTo(progressMove)
          isPlaying.value = true
        }
        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove)
          document.removeEventListener('mouseup', onMouseUp)
          wavesurfer.play() // Воспроизведение после перемотки
        }
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
      })
    })
  }

  document.addEventListener('mouseup', onDocumentMouseUp)
})

onUnmounted(() => {
  if (wavesurfer) {
    wavesurfer.destroy()
  }
  document.removeEventListener('mouseup', onDocumentMouseUp)
})
</script>

<style scoped lang="scss">
@keyframes fade-record {
    0% {
        opacity: 0.2;
    }

    100% {
        opacity: 1;
    }
}

.chat-message-textarea {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    width: 100%;
    padding: 14px 20px;
    border-top: 1px solid #2d3132;
    user-select: none;
    &__textarea {
        width: 100%;
        height: 28px;
        background: transparent;
        border: none;
        color: var(--text-color);
        resize: none;
        align-content: center;
        padding-bottom: 2px;
        &::placeholder {
            font-size: var(--font-size);
        }
    }
    &__buttons {
        display: flex;
        align-items: center;
        gap: 10px;
        .emoji {
            position: relative;
            .v3-emoji-picker {
                position: absolute;
                bottom: 30px;
                right: 0;
            }
        }
        .microphone-wrapper{
            position: relative;
            .svg{
                position: inherit;
                z-index: 2;
            }
            .circle {
                left: -6px;
                top: -6px;
                position: absolute;
                width: 40px;
                height: 40px;
                border-radius: 100%;
                background-color: var(--hover-color);
                animation-duration: 1s;
                animation-timing-function: ease-in-out;
                animation-iteration-count: infinite;
                opacity: 0.8;
                transition: all 0.3s ease;
                &_red{
                    background-color: var(--error-color-light);
                }
            }
        }
    }
    .chat-btn {
        cursor: pointer;
    }
    .recording{
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        height: 100%;
        user-select: none;
        &__circle{
            background-color: var(--error-color-light);
            width: 10px;
            height: 10px;
            border-radius: 100%;
            animation-name: fade-record;
            animation-iteration-count: infinite;
            animation-duration: 0.6s;
            -webkit-transition: all 0.9s ease;
                -moz-transition: all 0.9s ease;
                -o-transition: all 0.9s ease;
                    transition: all 0.9s ease;
            animation-direction: alternate;
        }
        &__time{
            width: 60px;
        }
        &__text{
            width: 100%;
            text-align: center;
            color: var(--text-active-color);
        }
    }
}

.emoji-show-enter-active {
    transition: all 0.4s ease-out;
}

.emoji-show-leave-active {
    transition: all 0.4s ease-out;
}

.emoji-show-enter-from,
.emoji-show-leave-to {
    opacity: 0;
}

.waveform-container{
    display: flex;
    align-items: center;
    gap: 10px;
    height: 28px;
    width: 100%;
    background-color: #2b2f30;
    padding: 4px 10px;
    border-radius: 15px;
    &__button{
        cursor: pointer;
    }
    .waveform {
        width: 100%;
        height: 100%;
    }
    &__duration{
        text-align: center;
        min-width: 40px;
    }
}

</style>
