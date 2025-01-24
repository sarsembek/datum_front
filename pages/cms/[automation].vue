<template>
    <div
        id="canvas-layout"
        class="canvas-layout"
        @dblclick="showNodesCreater($event)"
    >
        <canvas
            id="AutomatizationCanvas"
            ref="AutomatizationCanvas"
            @mousedown="startDragging"
            @mousemove="drag"
            @mouseup="stopDragging"
            @touchstart="startDragging"
            @touchmove="drag"
            @touchend="stopDragging"
            @wheel="automatizationStore.handleWheel"
        />
        <randomizer-popup v-if="automatizationStore.changeableObject?.nodeType === 'canvas_random_node'" />
        <smart-delay-popup v-if="automatizationStore.changeableObject?.nodeType === 'canvas_delay_node'" />
        <instagram-popup v-if="automatizationStore.changeableObject?.nodeType === 'canvas_instagram_node'" />
        <condition-popup v-if="automatizationStore.changeableObject?.nodeType === 'canvas_condition_node'" />
        <when-start-popup v-if="automatizationStore.changeableObject?.nodeType === 'canvas_when_start_node'" />
        <add-node @create-node="automatizationStore.createNode($event)" />
        <div
            ref="actionsPopup"
            v-click-outside="() => actionPopupOpen = false"
            class="nodes-actions"
            :class="{'nodes-actions_active': actionPopupOpen}"
        >
            <div
                v-for="(nodeType, nodeTypeIndex) in useAutomatizationStore().nodesTypes"
                :key="`nodeType-${nodeTypeIndex}`"
                class="action"
                @click="
                    automatizationStore.createNode(nodeType.type, actionPopupPos.x, actionPopupPos.y);
                    actionPopupOpen = false;"
            >
                {{ nodeType.name }}
            </div>
            <div
                class="action cancel"
                @click="actionPopupOpen = false"
            >
                Закрыть
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import CanvasNodeLine from '~/services/automatizationServices/CanvasNodeLine'
import { useAutomatizationStore } from '~/store/automatization'
const automatizationStore = useAutomatizationStore()

const AutomatizationCanvas = ref<HTMLCanvasElement | null>(null)
const ctx = ref<CanvasRenderingContext2D | null>()
// Создать OffscreenCanvas

const actionsPopup = ref<HTMLElement | null>(null)
const editNodePopup = ref<HTMLElement | null>(null)
const actionPopupPos = ref({ x: 0, y: 0 })
const actionPopupOpen = ref<boolean>(false)
const editNodePopupOpen = ref<boolean>(false)
const editNodeObject = ref<any>(null)
const route = useRoute()
if (route.query && route.query.is_template) {
  useAutomatizationStore().isTemplate = true
} else {
  useAutomatizationStore().isTemplate = false
}

let resizeListener: (() => void) | null = null
let isDragging = false
let isObjectDragging = false

let selectedObjectIndex = -1
const oldObjPos = { x: -1, y: -1 }
let offsetX = 0
let offsetY = 0

const changeObjectIndex = ref<number>(-1)
let activeLine: CanvasNodeLine | null = null
let activeLineObj: any | null = null
let whenStartObj: any | null = null
let hoveredObj: any = null
let saveLineInfos: any = []

const getClientCoordinates = (event: MouseEvent | TouchEvent): { clientX: number, clientY: number } => {
  return event instanceof MouseEvent ? { clientX: event.clientX, clientY: event.clientY } : event.touches[0]
}

const startDragging = (event: MouseEvent | TouchEvent) => {
  const { clientX, clientY } = getClientCoordinates(event)

  isDragging = true
  const canvasRect = automatizationStore.AutomatizationCanvas!.getBoundingClientRect()
  offsetX = clientX - canvasRect.left
  offsetY = clientY - canvasRect.top

  selectedObjectIndex = automatizationStore.objects.findIndex(obj => obj.isInside(offsetX, offsetY, true))
  if (selectedObjectIndex !== -1) {
    isObjectDragging = true
    const selectedObj = automatizationStore.objects[selectedObjectIndex]
    oldObjPos.x = selectedObj.x
    oldObjPos.y = selectedObj.y
  }
}

const getLinesNodes = (obj: any) => {
  const instagramButtonsLines = []
  if (obj.nodeElements) {
    for (const nodeElement of obj.nodeElements) {
      if (nodeElement.textElement) {
        for (const instagramBtn of nodeElement.textElement.buttons) {
          instagramBtn.lineNode.isInstagramBtn = true
          instagramButtonsLines.push(instagramBtn.lineNode)
        }
      }
    }
  }
  const lineNodes = [
    obj.canvasLineNode,
    ...(obj.randomElements?.map((re: { lineNode: any }) => re.lineNode) || []),
    ...(obj.trueConditions?.map((tc: { lineNode: any }) => tc.lineNode) || []),
    ...instagramButtonsLines,
    obj.falseCondition
  ].filter(node => node)
  return lineNodes
}

const handleMouseOver = (obj: any, offsetX: number, offsetY: number) => {
  obj.mouseOver = true
  obj.offsetX = offsetX
  obj.offsetY = offsetY

  const lineNodes = getLinesNodes(obj)
  lineNodes.forEach((lineNode) => {
    lineNode.mouseOver = true
    lineNode.offsetX = offsetX
    lineNode.offsetY = offsetY
    if (lineNode.isConnectionOver()) {
      activeLine = lineNode
      activeLineObj = obj
    }
  })
}

const handleMouseOut = (obj: any) => {
  obj.mouseOver = false
  obj.offsetX = null
  obj.offsetY = null

  const lineNodes = getLinesNodes(obj)
  lineNodes.forEach((lineNode) => {
    lineNode.mouseOver = false
    lineNode.offsetX = null
    lineNode.offsetY = null
  })
}

const updateObjectAndLineNodesPosition = (obj: any, deltaX: number, deltaY: number) => {
  obj.x += deltaX
  obj.y += deltaY

  const lineNodes = getLinesNodes(obj)

  lineNodes.forEach((lineNode) => {
    lineNode.x += deltaX
    lineNode.y += deltaY
    saveLineInfos.push({ obj, lineNode })
  })

  if (obj.trueConditions) {
    const trueLineNode = obj.trueConditions[0].lineNode
    if (trueLineNode) {
      trueLineNode.mouseOver = true
      trueLineNode.offsetX += deltaX
      trueLineNode.offsetY += deltaY
      saveLineInfos.push({ obj, lineNode: trueLineNode })
    }
  }

  redrawIncomingBlocksLine(obj.x, obj.y)
}

const updateDeltaAndOffset = (clientX: number, clientY: number) => {
  const newOffsetX = clientX - automatizationStore.AutomatizationCanvas!.getBoundingClientRect().left
  const newOffsetY = clientY - automatizationStore.AutomatizationCanvas!.getBoundingClientRect().top
  const deltaX = newOffsetX - offsetX
  const deltaY = newOffsetY - offsetY
  offsetX = newOffsetX
  offsetY = newOffsetY
  return { deltaX, deltaY }
}

const checkEditNode = (clientX: number, clientY: number) => {
  if (editNodeObject.value) {
    if (
      clientX < editNodeObject.value.x - 20 ||
      clientX > editNodeObject.value.x + editNodeObject.value.width + 20 ||
      clientY < editNodeObject.value.y - 20 ||
      clientY > editNodeObject.value.y + editNodeObject.value.height + 20
    ) {
      editNodePopupOpen.value = false
      editNodeObject.value = null
    }
  }
}

const drag = (event: MouseEvent | TouchEvent) => {
  const { clientX, clientY } = event instanceof MouseEvent ? event : event.touches[0]
  const { deltaX, deltaY } = updateDeltaAndOffset(clientX, clientY)
  checkEditNode(clientX, clientY)

  if (!isDragging && !isObjectDragging) {
    if (selectedObjectIndex === -1) {
      for (let i = automatizationStore.objects.length - 1; i >= 0; i--) {
        const obj = automatizationStore.objects[i]
        if (obj.isInside(offsetX, offsetY, true)) {
          selectedObjectIndex = i
          break
        }
      }
    } else {
      activeLine = null
      activeLineObj = null
      const obj = automatizationStore.objects[selectedObjectIndex]
      showEditNodePopup(obj)
      editNodeObject.value = obj

      if (obj.isInside(offsetX, offsetY)) {
        handleMouseOver(obj, offsetX, offsetY)
        automatizationStore.AutomatizationCanvas!.style.cursor = 'pointer'
      } else {
        handleMouseOut(obj)
        selectedObjectIndex = -1
        automatizationStore.AutomatizationCanvas!.style.cursor = 'default'
      }
    }
  } else if (isObjectDragging) {
    editNodePopupOpen.value = false
    editNodeObject.value = null
    if (activeLine) {
      activeLine.isDragging = true
      activeLine.offsetX = offsetX
      activeLine.offsetY = offsetY
      activeLine.connectionTo = null
      if (activeLineObj.nodeType !== 'canvas_when_start_node') {
        whenStartObj = automatizationStore.objects.find((e: any) => e.nodeType === 'canvas_when_start_node')
        if (whenStartObj) { whenStartObj.isInactive = true }
      }
      if (activeLineObj.nodeType === 'canvas_instagram_node') {
        if (activeLine?.isInstagramBtn) {
          const nodesObjs = automatizationStore.objects.filter((e: any) => e.nodeType !== 'canvas_instagram_node')
          for (const nodesObj of nodesObjs) {
            nodesObj.isInactive = true
          }
        }
      }
      automatizationStore.objects.forEach((obj) => {
        if (obj.isInside(offsetX, offsetY, true)) {
          obj.mouseOver = true
          hoveredObj = obj
        } else {
          obj.mouseOver = false
          if (obj === hoveredObj) { hoveredObj = null }
        }
      })
    } else {
      const obj = automatizationStore.objects[selectedObjectIndex]
      updateObjectAndLineNodesPosition(obj, deltaX, deltaY)
    }
  } else {
    editNodePopupOpen.value = false
    editNodeObject.value = null
    // Если объект не выбран, перемещаем весь холст
    for (const obj of automatizationStore.objects) {
      obj.x += deltaX
      obj.y += deltaY

      const lineNodes = getLinesNodes(obj)

      lineNodes.forEach((lineNode) => {
        lineNode.x += deltaX
        lineNode.y += deltaY
        saveLineInfos.push({ obj, lineNode })
      })
    }
  }

  updateConnectionLine()
  automatizationStore.draw()
}

const updateConnectionLine = () => {
  for (const saveInfo of saveLineInfos) {
    if (saveInfo.lineNode.connectionTo) {
      const obj = automatizationStore.objects.find((e: any) => e.id === saveInfo.lineNode.connectionTo.id)
      if (obj) {
        saveInfo.lineNode.connectionTo!.x = obj.x
        saveInfo.lineNode.connectionTo!.y = obj.y
      }
    }
  }
  saveLineInfos = []
}

const stopDragging = () => {
  if (selectedObjectIndex !== -1 && !activeLine) {
    automatizationStore.changeableObject = null
    const selectedObject = automatizationStore.objects[selectedObjectIndex]
    if (oldObjPos.x === selectedObject.x && oldObjPos.y === selectedObject.y) {
      changeObjectIndex.value = selectedObjectIndex
      automatizationStore.changeableObject = selectedObject
    }
  } else {
    automatizationStore.changeableObject = null
  }
  isDragging = false
  isObjectDragging = false
  if (automatizationStore.objects[selectedObjectIndex]) {
    const obj = automatizationStore.objects[selectedObjectIndex]
    obj.mouseOver = false
  }
  if (activeLine) {
    automatizationStore.changeableObject = null
    if (hoveredObj && hoveredObj !== automatizationStore.objects[selectedObjectIndex] && !hoveredObj.isInactive) {
      activeLine.connectTrigger(hoveredObj)
      if (activeLine.isInstagramBtn) {
        automatizationStore.objects[selectedObjectIndex].draw()
      }
    }
    activeLine.isDragging = false
    activeLine = null
  }
  selectedObjectIndex = -1
  hoveredObj = null
  if (whenStartObj) { whenStartObj.isInactive = false }

  automatizationStore.objects.map((obj: any) => {
    obj!.isInactive = false; return obj
  })

  automatizationStore.stopScrollingAndDragging()
}

const showNodesCreater = (e: any) => {
  actionPopupOpen.value = true
  if (actionsPopup.value) {
    actionPopupPos.value.x = e.offsetX
    actionPopupPos.value.y = e.offsetY
    actionsPopup.value.style.left = `${e.offsetX}px`
    actionsPopup.value.style.top = `${e.offsetY}px`
  }
}

const showEditNodePopup = (obj: any) => {
  if (obj.nodeType !== 'canvas_when_start_node') {
    editNodePopupOpen.value = true

    if (editNodePopup.value) {
      editNodePopup.value.style.left = `${obj.x + 60}px`
      editNodePopup.value.style.top = `${obj.y - 20}px`
    }
  }
}

onMounted(() => {
  resizeCanvas()
  resizeListener = () => { resizeCanvas() }

  automatizationStore.initAutomatizationPage(
    AutomatizationCanvas.value as HTMLCanvasElement, ctx.value as CanvasRenderingContext2D)

  window.addEventListener('resize', resizeListener)
  automatizationStore.AutomatizationCanvas!.addEventListener('resize', resizeListener)

  resizeCanvas()
})



// onUnmounted(() => {
//
//
//   automatizationStore.$reset()
//
// })

onBeforeRouteLeave(() => {
  if (resizeListener) {
    window.removeEventListener('resize', resizeListener)
  }
  automatizationStore.socket.disconnect()
  automatizationStore.$reset()
})

const resizeCanvas = () => {
  const canvasLayout = document.getElementById('canvas-layout')
  AutomatizationCanvas.value!.width = canvasLayout!.offsetWidth
  AutomatizationCanvas.value!.height = canvasLayout!.offsetHeight
  ctx.value = AutomatizationCanvas.value!.getContext('2d')

  automatizationStore.AutomatizationCanvas = AutomatizationCanvas.value as HTMLCanvasElement
  automatizationStore.ctx = ctx.value as CanvasRenderingContext2D

  automatizationStore.draw()
}

const redrawIncomingBlocksLine = (redrawX: number, redrawY: number) => {
  for (const obj of automatizationStore.objects) {
    const lineNodes = getLinesNodes(obj)
    lineNodes.forEach((lineNode) => {
      lineNode.x += redrawX
      lineNode.y += redrawY
      saveLineInfos.push({ obj, lineNode })
    })
  }
  updateConnectionLine()
}

</script>

<style scoped lang="scss">
.canvas-layout{
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
}

#AutomatizationCanvas{
    width: 100%;
    height: 100%;
}

.nodes-actions{
  position: absolute;
  user-select: none;
  background: var(--additional-box);
  box-shadow: 1px 1px 10px 2px var(--additional-box);
  left: 0;
  top: 0;
  border: 1px solid var(--bg-color);
  border-radius: 10px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  &_active{
    pointer-events: auto;
    opacity: 1;
  }
  .action{
    cursor: pointer;
    padding: 10px 20px;
    &:hover{
      background: rgba(0,0,0,0.1);
      color: var(--link);
    }
  }
  .cancel{
    color: var(--gray-color);
    &:hover{
      background: rgba(0,0,0,0.1);
      color: var(--gray-color);
    }
  }
}
</style>
