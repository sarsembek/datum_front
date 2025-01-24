<!-- eslint-disable vue/no-v-html -->
<template>
    <i
        :fill="fill"
        :stroke="stroke"
        :rect="rect"
        :width="width"
        :height="height"
        class="svg svg-content"
        :style="{
            '--svg-width': `${width}px`,
            '--svg-height': `${height}px`,
            '--svg-fill-color': fill,
            '--svg-stroke-color': stroke,
            '--svg-rect-color': rect,
        }"
        @click="handleClick($event)"
        v-html="svg"
    />
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  fill: {
    type: String,
    default: 'none'
  },
  stroke: {
    type: String,
    default: 'none'
  },
  rect: {
    type: String,
    default: 'none'
  },
  width: {
    type: [Number, String],
    default: 'none'
  },
  height: {
    type: [Number, String],
    default: 'none'
  },
  additionalFolder: {
    type: String,
    default: ''
  }
})

const modules = import.meta.glob('../../assets/svg/**/*.svg', {
  as: 'raw',
  eager: true
})

const svg = computed(() => {
  let additionalFolder = props.additionalFolder
  if (props.additionalFolder) { additionalFolder += '/' }

  return modules[
    '../../assets/svg/' + additionalFolder + props.icon + '.svg'] ?? modules['../../assets/svg/logo.svg']
})

const handleClick = (e: any) => { return e }
provide('click', handleClick)

</script>

<style>
.svg-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.svg-content[width]:not([width="none"]) {
  width: var(--svg-width);
}

.svg-content[height]:not([height="none"]) {
  height: var(--svg-height);
}

.svg-content[width]:not([width="none"]) svg {
width: var(--svg-width);
}

.svg-content[height]:not([height="none"]) svg {
height: var(--svg-height);
}

.svg-content[fill]:not([fill="none"]) path {
fill: var(--svg-fill-color);
}

.svg-content[stroke]:not([stroke="none"]) path {
stroke: var(--svg-stroke-color);
}

.svg-content[rect]:not([rect="none"]) rect {
stroke: var(--svg-rect-color);
}
</style>
