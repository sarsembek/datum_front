import { defineStore } from 'pinia'
import type { NuxtAppOptions } from '@nuxt/types'
import type { nodeTypesInterface } from '~/types/automatization'
import { WebSocketService } from '~/utils/WebSocketService'
import CanvasConditionNode from '~/services/automatizationServices/CanvasConditionNode'
import CanvasDelayNode from '~/services/automatizationServices/CanvasDelayNode'
import CanvasInstagramNode from '~/services/automatizationServices/CanvasInstagramNode'
import CanvasRandomNode from '~/services/automatizationServices/CanvasRandomNode'
import CanvasWhenStartNode from '~/services/automatizationServices/CanvasWhenStartNode'

export const useAutomatizationStore = defineStore('automatization', {
  state: () => ({
    nuxtApp: null as unknown as NuxtAppOptions,
    cmdId: useRoute().params.automation,
    socketUrl: useRuntimeConfig().public.BASE_SOCKETS_URL as string,
    socket: null as unknown as WebSocketService,
    nodesTypes: [
      { name: '+ Instagram', type: 'instagram' },
      { name: '+ Рандомайзер', type: 'randomizer' },
      { name: '+ Умная задержка', type: 'smart_delay' },
      { name: '+ Условие', type: 'condition' }
    ] as Array<nodeTypesInterface>,
    scale: 1.0 as number,
    isTemplate: false,
    createType: '',
    createSettings: {
      isOpen: false,
      type: '',
      isTemplate: false
    },

    // automatization page
    AutomatizationCanvas: null as unknown as HTMLCanvasElement,
    ctx: null as unknown as CanvasRenderingContext2D,
    objects: [] as any[],
    haveStartBlock: false,
    nodeBlocks: [] as any[],
    saveLineInfos: [] as any[],
    saveObjectsInfos: [] as any[],
    scrollingTimer: null as unknown as NodeJS.Timeout,
    changeableObject: null as any
  }),
  actions: {
    async getScale (): Promise<number | null> {
      const data: any = await useAuthFetch(
        `/api/v1/cms/automatization/?automatization_id=${this.cmdId}&is_template=${this.isTemplate}`, {
          method: 'get',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            accept: 'application/json'
          }
        })
      this.scale = data.scale
      return this.scale
    },
    async changeScale () {
      await useAuthFetch(`/api/v1/cms/automatization/?automatization_id=${this.cmdId}&is_template=${this.isTemplate}`, {
        method: 'put',
        body: { automatization_id: this.cmdId, scale: this.scale, is_template: this.isTemplate },
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          accept: 'application/json'
        }
      })
    },
    handleWheel (event: WheelEvent) {
      event.preventDefault()

      const delta = event.deltaY
      const zoomSpeed = 0.2 // Скорость масштабирования
      const currentScale = this.scale // Сохраняем текущий масштаб перед изменением направления
      const minScale = 0.25 // Минимальный масштаб
      const maxScale = 2.0 // Максимальный масштаб

      this.scale *= delta < 0 ? 1 + zoomSpeed : 1 - zoomSpeed // Рассчитываем новый масштаб
      this.scale = Math.min(Math.max(this.scale, minScale), maxScale) // Ограничиваем масштаб (minScale, maxScale)

      if (this.scale < minScale) { this.scale = minScale }
      if (this.scale > maxScale) { this.scale = maxScale }

      const { clientX, clientY } = event
      const boundingRect = this.AutomatizationCanvas!.getBoundingClientRect()
      const offsetX = clientX - boundingRect.left
      const offsetY = clientY - boundingRect.top

      this.objects.forEach((obj) => {
        obj.x = (obj.x - offsetX) * (this.scale / currentScale) + offsetX
        obj.y = (obj.y - offsetY) * (this.scale / currentScale) + offsetY
        obj.width *= this.scale / currentScale
        obj.height *= this.scale / currentScale
        obj.radius *= this.scale / currentScale
        obj.scale = this.scale

        const lineNodes = this.getLinesNodes(obj)

        lineNodes.forEach((lineNode: { scale: any }) => {
          lineNode.scale = this.scale
          this.saveLineInfos.push({ obj, lineNode })
        })
      })

      this.updateConnectionLine()
      this.stopScrollingAndDragging()
      this.draw()
    },
    stopScrollingAndDragging () {
      clearTimeout(this.scrollingTimer)
      this.scrollingTimer = setTimeout(async () => {
        await this.changeScale()
        for (const obj of this.objects) {
          this.saveObjectsInfos.push(await obj.saveNodeInfo())
        }
        this.saveBlocksInfo()
      }, 300)
    },
    saveBlocksInfo () {
      this.socket.send({ blocks_data: this.saveObjectsInfos, is_template: this.isTemplate })
      this.saveObjectsInfos = []
    },
    draw () {
      this.ctx!.clearRect(0, 0, this.AutomatizationCanvas!.width, this.AutomatizationCanvas!.height)
      for (const obj of this.objects) { obj.draw() }
    },
    getLinesNodes (obj: any) {
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
    },
    updateConnectionLine () {
      for (const saveInfo of this.saveLineInfos) {
        if (saveInfo.lineNode.connectionTo) {
          const obj = this.objects.find((e: any) => e.id === saveInfo.lineNode.connectionTo.id)
          if (obj) {
            saveInfo.lineNode.connectionTo!.x = obj.x
            saveInfo.lineNode.connectionTo!.y = obj.y
          }
        }
      }
      this.saveLineInfos = []
    },
    async getBlocks () {
      this.nodeBlocks = await useAuthFetch(
          `/api/v1/cms/block/?automatization_id=${this.cmdId}&is_template=${this.isTemplate}`, {
            method: 'get',
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              accept: 'application/json'
            }
          })
      return this.nodeBlocks
    },
    async initAutomatizationPage (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
      this.cmdId = useRoute().params.automation
      this.socket = new WebSocketService(`${this.socketUrl}/ws/automatization/${this.cmdId}/`)
      this.socket.connect()
      this.AutomatizationCanvas = canvas
      this.ctx = ctx
      await this.getScale()
      await this.getBlocks()

      await this.initBlocksObject()
    },
    initBlocksObject () {
      let haveStartBlock = false

      const createNodeInstance = (block: any, config: any) => {
        switch (block.block_type) {
          case 'instagram':
            return new CanvasInstagramNode(config)
          case 'randomizer':
            return new CanvasRandomNode(config)
          case 'smart_delay':
            return new CanvasDelayNode(config)
          case 'condition':
            return new CanvasConditionNode(config)
          case 'when_start':
            haveStartBlock = true
            return new CanvasWhenStartNode(config)
          default:
            return null
        }
      }

      for (const block of this.nodeBlocks) {
        const blockData = JSON.parse(block.block_data)
        console.info(blockData)
        const commonConfig = {
          id: block.id,
          type: block.block_type,
          canvas: this.AutomatizationCanvas,
          ctx: this.ctx,
          scale: this.scale,
          x: block.coord_x,
          y: block.coord_y
        }

        let config: any

        switch (block.block_type) {
          case 'instagram':
            config = { ...commonConfig, nodeElements: blockData.nodeElements, lineNode: blockData.lineNode }
            break
          case 'randomizer':
            config = { ...commonConfig, randomElements: blockData.randomElements }
            break
          case 'smart_delay':
            config = {
              ...commonConfig,
              timeValue: blockData.timeValue,
              time: blockData.time,
              isPeriod: blockData.isPeriod,
              period: blockData.period,
              isDate: blockData.isDate,
              dateDelay: blockData.dateDelay,
              activeDays: blockData.activeDays,
              lineNode: blockData.lineNode
            }
            break
          case 'condition':
            config = {
              ...commonConfig, trueConditions: blockData.trueConditions, falseCondition: blockData.falseCondition
            }
            break
          case 'when_start':
            config = { ...commonConfig, triggers: blockData.triggers, lineNode: blockData.lineNode }
            break
        }
        const nodeInstance = createNodeInstance(block, config)
        if (nodeInstance) {
          this.objects.push(nodeInstance)
        }
      }

      if (!haveStartBlock) {
        this.createNode('when_start')
      }
    },
    openCreatePopup (type: string, isTemplate: boolean = false) {
      this.createSettings.isOpen = true
      this.createSettings.type = type
      this.createSettings.isTemplate = isTemplate
    },
    async createNode (type: string, xPos = 0, yPos = 0) {
      if (xPos === 0) { xPos = (this.AutomatizationCanvas.width / 2) - 50 }
      if (yPos === 0) { yPos = (this.AutomatizationCanvas.height / 2) - 50 }
      const blockConfig: Record<string, any> = {
        instagram: {
          NodeClass: CanvasInstagramNode,
          blockData: {
            nodeElements: []
          },
          nodeParams: {
            nodeElements: []
          }
        },
        randomizer: {
          NodeClass: CanvasRandomNode,
          blockData: {
            randomElements: [
              { name: 'A', percent: 50 },
              { name: 'B', percent: 50 }
            ]
          }
        },
        smart_delay: {
          NodeClass: CanvasDelayNode,
          blockData: {
            timeValue: 10,
            time: 'Часов',
            isPeriod: false,
            period: null,
            isDate: false,
            dateDelay: null,
            activeDays: null
          }
        },
        condition: {
          NodeClass: CanvasConditionNode,
          blockData: {
            trueConditions: null,
            falseCondition: null
          }
        },
        when_start: {
          NodeClass: CanvasWhenStartNode,
          blockData: {},
          updatePos: (canvas: HTMLCanvasElement | null) => {
            if (canvas) {
              xPos = canvas.width / 2
              yPos = canvas.height / 2
            }
          },
          nodeParams: {
            triggers: []
          }
        }
      }

      const config = blockConfig[type]

      if (!config) {
        throw new Error(`Unsupported block type: ${type}`)
      }

      if (config.updatePos) {
        config.updatePos(this.AutomatizationCanvas)
      }

      const data: any = await useAuthFetch('/api/v1/cms/block/', {
        method: 'post',
        body: {
          automatization_id: this.cmdId,
          block_type: type,
          coord_x: Math.round(xPos),
          coord_y: Math.round(yPos),
          is_template: this.isTemplate,
          block_data: JSON.stringify(config.blockData)
        },
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      })

      const info = JSON.parse(JSON.stringify(data))

      const node = new config.NodeClass({
        id: info.id,
        type,
        canvas: this.AutomatizationCanvas,
        ctx: this.ctx,
        scale: this.scale,
        x: Math.round(xPos),
        y: Math.round(yPos),
        ...config.nodeParams
      })

      this.objects.push(node)

      return node
    },
    changeCanvasAndCtx (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
      this.AutomatizationCanvas = canvas
      this.ctx = ctx
    }
  }
})
