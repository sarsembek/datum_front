import type { Drawable, CanvasNodeConfig } from '@/types/automatization'
import CanvasNodeLine from '~/services/automatizationServices/CanvasNodeLine'
import deleteIcon from '~/assets/svg/delete.svg?raw'
import { useAutomatizationStore } from '~/store/automatization'

export default class CanvasNode implements Drawable {
  readonly ctx: CanvasRenderingContext2D
  readonly canvas: HTMLCanvasElement
  protected scale: number
  readonly x: number
  readonly y: number
  protected width: number = 340
  protected height: number = 160
  readonly isDragging: boolean = false
  readonly isConnection: boolean = false
  readonly mouseOver: boolean = false
  protected canvasLineNode: CanvasNodeLine | null = null
  protected canvasLinesNodes: CanvasNodeLine[] = []
  readonly offsetX: number | null = null
  readonly offsetY: number | null = null
  protected readonly id: number
  protected nodeType?: string
  protected type: string
  protected isInactive: boolean
  private deleteIconImage: HTMLImageElement
  private automatizationStore: any
  private isDeleting: boolean
  private isDeletHovered: boolean

  constructor (config: CanvasNodeConfig) {
    this.id = config.id
    this.type = config.type
    this.nodeType = config.nodeType
    this.ctx = config.ctx
    this.canvas = config.canvas
    this.x = config.x
    this.y = config.y
    this.scale = config.scale
    this.width = (config.width ?? 340) * config.scale
    this.height = (config.height ?? 160) * config.scale
    this.canvasLineNode = config.canvasLineNode
    this.isInactive = config.isInactive || false
    this.isDeleting = false
    this.isDeletHovered = false

    this.deleteIconImage = this.drawDeleteIcon()
    this.automatizationStore = useAutomatizationStore()
  }

  draw (
    mainBlockColor: string, AdditionalBlockColor: string,
    title: string | null = null, connectionIsOver: boolean | null = null
  ): void {
    if (this.isInactive) {
      this.ctx.globalAlpha = 0.5
    }
    this.drawMainBlock(mainBlockColor)
    if (title) { this.drawTitle(title) }
    if (connectionIsOver) {
      this.isHoveredBlock(this.mouseOver && !connectionIsOver && !this.isInactive)
    } else {
      this.isHoveredBlock(this.mouseOver && !this.isInactive)
    }
    this.drawAdditionalBlock(AdditionalBlockColor)
  }

  protected drawMainBlock (blockFillStyle: string = '#07545D') {
    this.ctx.beginPath()
    this.ctx.fillStyle = blockFillStyle
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.20)'
    this.ctx.shadowBlur = 4
    this.ctx.roundRect(this.x, this.y, this.width, this.height, 10 * this.scale)
    this.ctx.fill()
  }

  protected drawAdditionalBlock (blockFillStyle: string = '#00353B') {
    this.ctx.beginPath()
    this.ctx.fillStyle = blockFillStyle
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.20)'
    this.ctx.shadowBlur = 4
    this.ctx.roundRect(
      this.x + 5 * this.scale,
      this.y + 35 * this.scale,
      this.width - 10 * this.scale,
      this.height - 40 * this.scale,
      10 * this.scale
    )
    this.ctx.fill()
    this.ctx.shadowColor = 'transparent'
    this.ctx.shadowBlur = 0
  }

  protected createText (
    x: number,
    y: number,
    size: number,
    text: string,
    options: {
      isBold?: boolean
      color?: string
      isCenter?: boolean
    } = {}
  ) {
    const { isBold = false, color = '#FFFFFF', isCenter = false } = options
    this.ctx.fillStyle = color
    this.ctx.font = `${isBold ? 'bold ' : ''}${size * this.scale}px Inter`
    let xTextPos = this.x + (x * this.scale)
    if (isCenter) {
      const textWidth = this.ctx.measureText(text).width
      xTextPos = this.x + (this.width / 2) - (textWidth / 2)
    }
    const yTextPos = this.y + (y * this.scale)
    this.ctx.fillText(text, xTextPos, yTextPos)
  }

  protected textWrap (text: string, xPos: number, yPos: number) {
    const words = text.split(' ')
    const lines: string[] = []
    let line = ''
    const scaledMaxWidth = this.width

    while (words.length > 0) {
      if (this.ctx.measureText(line + words[0]).width < scaledMaxWidth) {
        line += words.shift() + ' '
      } else {
        lines.push(line)
        line = ''
      }
    }
    lines.push(line)

    lines.forEach((line, i) => {
      this.createText(xPos, yPos + i * 12, 12, line)
    })

    return lines.length
  }

  createPlaceholder (text: string = '', color: string = '#009ED0', xPos = 15, yPos = 50) {
    this.ctx.beginPath()
    this.ctx.setLineDash([5])
    this.ctx.roundRect(
      this.x + xPos * this.scale,
      this.y + yPos * this.scale,
      this.width - 30 * this.scale,
      50 * this.scale,
      10 * this.scale
    )
    this.createText(0, yPos + 28, 12, text, {
      isBold: false,
      color,
      isCenter: true
    })
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = 1
    this.ctx.stroke()
    this.ctx.setLineDash([0])

    return 60
  }

  isInside (mouseX: number, mouseY: number, insideOnlyBlock: false): boolean {
    return mouseX >= this.x &&
      mouseX <= this.x + this.width &&
      mouseY >= this.y - (insideOnlyBlock ? 0 : 55 * this.scale) &&
      mouseY <= this.y + this.height
  }

  protected isHoveredBlock (condition: boolean) {
    if (condition) {
      this.ctx.strokeStyle = '#0065FF'
      this.ctx.lineWidth = 1
      this.ctx.stroke()
      if (this.nodeType !== 'canvas_when_start_node') {
        this.drawDeletePopup()
      }
    }
  }

  protected drawDeletePopup () {
    this.canvas.removeEventListener('mouseup', this.onDeletePopupClick.bind(this))
    this.canvas.removeEventListener('mousemove', this.onDeletePopupMove.bind(this))
    const popupWidth = 40 * this.scale
    const popupHeight = 40 * this.scale
    const popupX = this.x
    const popupY = this.y - popupHeight - 10 * this.scale

    this.ctx.beginPath()
    this.ctx.fillStyle = '#747273'
    this.ctx.roundRect(popupX, popupY, popupWidth, popupHeight, 5 * this.scale)
    this.ctx.fill()
    if (this.isDeletHovered) {
      this.ctx.strokeStyle = '#2B7FFF'
      this.ctx.lineWidth = 1 * this.scale
      this.ctx.stroke()
    }

    this.ctx.drawImage(
      this.deleteIconImage,
      popupX + (8 * this.scale),
      popupY + (8 * this.scale),
      24 * this.scale,
      24 * this.scale
    )

    // Проверка, находится ли курсор внутри попапа
    this.canvas.addEventListener('mouseup', this.onDeletePopupClick.bind(this))
    this.canvas.addEventListener('mousemove', this.onDeletePopupMove.bind(this))
  }

  private onDeletePopupMove (event: MouseEvent) {
    const mouseX = event.offsetX
    const mouseY = event.offsetY

    const popupWidth = 40 * this.scale
    const popupHeight = 40 * this.scale
    const popupX = this.x
    const popupY = this.y - popupHeight - 10 * this.scale

    // Проверка, находится ли курсор внутри попапа этого узла
    if (
      this.valueWithinARange(mouseX, popupX, popupX + popupWidth) &&
      this.valueWithinARange(mouseY, popupY, popupY + popupHeight)
    ) {
      this.isDeletHovered = true
    } else {
      this.isDeletHovered = false
    }
  }

  private onDeletePopupClick (event: MouseEvent) {
    const mouseX = event.offsetX
    const mouseY = event.offsetY

    const popupWidth = 40 * this.scale
    const popupHeight = 40 * this.scale
    const popupX = this.x
    const popupY = this.y - popupHeight - 10 * this.scale

    // Проверка, находится ли курсор внутри попапа этого узла
    if (
      this.valueWithinARange(mouseX, popupX, popupX + popupWidth) &&
      this.valueWithinARange(mouseY, popupY, popupY + popupHeight) &&
      !this.isDeleting
    ) {
      this.deleteNode()
    }
  }

  protected drawDeleteIcon () {
    const deleteIconImage = new Image()
    const svgBlob = new Blob([deleteIcon], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(svgBlob)

    deleteIconImage.src = url
    deleteIconImage.onload = () => {
      URL.revokeObjectURL(url)
    }
    return deleteIconImage
  }

  valueWithinARange (x: number, min: number, max: number) {
    return x >= min && x <= max
  }

  redrawCanvasLineNode () {
    if (this.canvasLineNode) {
      this.canvasLineNode!.x = this.x + this.width - (20 * this.scale)
      this.canvasLineNode!.y = this.y + this.height - (20 * this.scale)
      this.canvasLineNode!.scale = this.scale
      this.canvasLineNode!.draw()
    }
  }

  drawTitle (text: string, x: number = 10, y: number = 23, size: number = 14) {
    this.createText(x, y, size, text)
  }

  createLineConnector (x: number | null = null, y: number | null = null): CanvasNodeLine {
    x = x || this.x + this.width - (20 * this.scale)
    y = y || this.y + this.height - (20 * this.scale)
    return new CanvasNodeLine({
      canvas: this.canvas,
      ctx: this.ctx,
      scale: this.scale,
      x,
      y,
      connectionFrom: {
        id: this.id,
        x: this.x,
        y: this.y
      }
    })
  }

  updateScale (newScale: number) {
    const scaleFactor = newScale / this.scale
    this.scale = newScale
    this.width *= scaleFactor
    this.height *= scaleFactor
  }

  async saveNodeInfo (isOneSave = false, blockData: any): Promise<any> {
    const route = useRoute()
    const saveInfo = {
      block_id: this.id,
      coord_x: Math.round(this.x),
      coord_y: Math.round(this.y),
      block_data: JSON.stringify(blockData),
      is_template: route.query && route.query.is_template
    }

    if (isOneSave) {
      await useAuthFetch('/api/v1/cms/block/', {
        method: 'put',
        body: saveInfo,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          accept: 'application/json'
        }
      })
    } else {
      return saveInfo
    }
  }

  async deleteNode () {
    this.isDeleting = true

    try {
      await useAuthFetch('/api/v1/cms/block/', {
        method: 'delete',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          accept: 'application/json'
        },
        body: { block_id: this.id, is_template: false }
      })

      const deleteIndex = this.automatizationStore.objects.findIndex((e: any) => e.id === this.id)
      const deleteObj = this.automatizationStore.objects[deleteIndex]
      this.deleteIncomingBlocks(deleteObj.id)
      this.automatizationStore.objects.splice(deleteIndex, 1)
      this.automatizationStore.draw()
    } catch (error) {
      console.error('Error deleting node:', error)
    } finally {
      this.isDeleting = false // Сброс флага после завершения удаления
    }
  }

  deleteIncomingBlocks (deleteID: number) {
    for (const obj of this.automatizationStore.objects) {
      if (obj?.conditions) {
        const trueLineNode = obj.conditions.trueCondition.lineNode
        if (deleteID === trueLineNode.connectionTo?.id) {
          trueLineNode.connectionTo = null
        }
        const falseLineNode = obj.conditions.falseConditions.lineNode
        if (deleteID === obj.conditions.falseConditions.lineNode.connectionTo?.id) {
          falseLineNode.connectionTo = null
        }
      }
      if (obj?.canvasLineNode) {
        if (deleteID === obj.canvasLineNode.connectionTo?.id) {
          obj.canvasLineNode.connectionTo = null
        }
      }
      if (obj?.trueConditions) {
        const trueLineNode = obj?.trueConditions[0].lineNode
        if (deleteID === trueLineNode.connectionTo?.id) {
          trueLineNode.connectionTo = null
        }
      }
      if (obj?.falseCondition) {
        const falseLineNode = obj?.falseCondition
        if (deleteID === falseLineNode.connectionTo?.id) {
          falseLineNode.connectionTo = null
        }
      }
      if (obj?.randomElements) {
        for (const randomElement of obj?.randomElements) {
          const lineNode = randomElement.lineNode
          if (lineNode.connectionTo?.id === deleteID) {
            lineNode.connectionTo = null
          }
        }
      }
      if (obj?.nodeElements) {
        for (const nodeEl of obj?.nodeElements) {
          if (nodeEl.textElement) {
            const nodeElButtons = nodeEl.textElement.buttons
            for (const nodeElButton of nodeElButtons) {
              const lineNode = nodeElButton.lineNode
              if (lineNode.connectionTo?.id === deleteID) {
                nodeElButton.type = ''
                lineNode.connectionTo = null
              }
            }
          }
        }
      }
    }
  }
}
