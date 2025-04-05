import CanvasNodeLine from './CanvasNodeLine'
import CanvasNode from './CanvasNode'
import type {
  CanvasInstagramNodeConfig, InstagramNodeElementInterface, textButtonInterface,
  textElementInterface
} from '@/types/automatization'

import { useAutomatizationStore } from '~/store/automatization'

export default class CanvasInstagramNode extends CanvasNode {
  nodeElements: InstagramNodeElementInterface[]

  constructor (config: CanvasInstagramNodeConfig) {
    super(config)
    this.nodeElements = config.nodeElements
    this.nodeType = 'canvas_instagram_node'
    this.canvasLineNode = this.createLineConnector()
    if (config.lineNode) {
      this.canvasLineNode.connectionTo = config.lineNode.connectionTo
    }
    this.initButtonLines()
    this.draw()
  }

  override draw (): void {
    super.draw('#747272', '#585858', 'Instagram сообщение', this.checkConnectionOver())

    if (this.nodeElements.length === 0) {
      this.addText()
    }
    let newHeight = 45

    // Draw all elements as before
    for (const [index, nodeEl] of this.nodeElements.entries()) {
      if (nodeEl.textElement) {
        newHeight += this.drawTexts(nodeEl.textElement, newHeight)
      }
      if (nodeEl.imageElement) {
        newHeight += this.drowImageEl(nodeEl.imageElement!.src, newHeight)
      }
      if (nodeEl.delayElement) {
        newHeight += this.drowDelayEl(nodeEl.delayElement.delayTime, newHeight)
      }
      this.height = newHeight * this.scale
    }

    this.height += 45 * this.scale

    // Only draw the bottom connector if there are no buttons
    const hasButtons = this.nodeElements.some(ne =>
      ne.textElement?.buttons && ne.textElement.buttons.length > 0
    )

    if (!hasButtons) {
      this.redrawCanvasLineNode()
    }
  }

  checkConnectionOver () {
    const buttonLines = this.getButtonsLinesNodes()
    for (const buttonLine of buttonLines) {
      if (typeof buttonLine.isConnectionOver === 'function' && buttonLine.isConnectionOver()) {
        return true
      }
    }
    return false
  }

  initButtonLines () {
    const buttons = this.nodeElements?.map(ne => ne.textElement?.buttons?.map(te => te) || []).flat() || []
    for (const button of buttons) {
      const oldLine = Object.assign({}, button.lineNode)
      button.lineNode = new CanvasNodeLine({
        canvas: this.canvas,
        ctx: this.ctx,
        scale: this.scale,
        x: oldLine.x,
        y: oldLine.y,
        offsetX: oldLine.offsetX,
        offsetY: oldLine.offsetY,
        connectionTo: oldLine.connectionTo,
        connectionFrom: {
          id: this.id,
          x: this.x,
          y: this.y
        }
      })
      if (!oldLine.connectionTo && button.type === 'instagram') {
        button.type = ''
      }

      if (button.lineNode.connectionTo) {
        const automatizationStore = useAutomatizationStore()
        const connectionObj = automatizationStore.objects.find(obj => obj.id === button.lineNode.connectionTo.id)
        if (connectionObj && connectionObj.nodeType === 'canvas_instagram_node') {
          button.type = 'instagram'
        }
      }

      button.lineNode.draw()
    }
  }

  addImage (src: string) {
    this.nodeElements.push({ imageElement: { src } })
  }

  changeImage (image: string, index: number) {
    this.nodeElements[index].imageElement!.src = image
  }

  removeElement (elementIndex: number) {
    this.nodeElements.splice(elementIndex, 1)
  }

  addText (
    text = '',
    buttons: Array<textButtonInterface> | [] = [],
    isPlaceholder = true
  ) {
    this.nodeElements.push({
      textElement: {
        text,
        buttons,
        isPlaceholder
      }
    })
  }

  addDelay (delayTime: number) {
    this.nodeElements.push({ delayElement: { delayTime } })
  }

  changeDelay (delayTime: number, index: number) {
    this.nodeElements[index].delayElement!.delayTime = delayTime
  }

  private drowDelayEl (delayTime: number, startPos: number) {
    const text = `Подождать ${delayTime} секунд`
    const textWidth = this.ctx.measureText(text).width
    this.ctx.beginPath()
    this.ctx.roundRect(
      this.x + 15 * this.scale,
      this.y + startPos * this.scale,
      this.width - 30 * this.scale,
      50 * this.scale,
      10 * this.scale
    )
    this.ctx.fillStyle = 'rgba(126, 94, 173, 0.3)'
    this.ctx.fill()
    this.createText(
      (this.width - textWidth) / 2,
      (28 + startPos),
      12,
      text,
      {
        isBold: false,
        color: '#cdc5d9',
        isCenter: true
      }
    )
    return 60
  }

  private drowImageEl (src: string, startPos: number) {
    if (src) {
      this.ctx.save()
      const baseImage = new Image()
      baseImage.src = src
      this.roundedImage(
        this.x + 15 * this.scale,
        this.y + startPos * this.scale,
        this.width - 30 * this.scale,
        240 * this.scale,
        10 * this.scale
      )
      this.ctx.clip()

      this.ctx.imageSmoothingEnabled = true
      this.ctx.drawImage(
        baseImage,
        this.x + 15 * this.scale,
        this.y + startPos * this.scale,
        this.width - 30 * this.scale,
        240 * this.scale
      )

      this.ctx.restore()

      return 250
    } else {
      this.createPlaceholder('Картинка', '#009ED0', 15, startPos)
      return 60
    }
  }

  private roundedImage (x: number, y: number, width: number, height: number, radius: number) {
    this.ctx.beginPath()
    this.ctx.moveTo(x + radius, y)
    this.ctx.lineTo(x + width - radius, y)
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    this.ctx.lineTo(x + width, y + height - radius)
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    this.ctx.lineTo(x + radius, y + height)
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    this.ctx.lineTo(x, y + radius)
    this.ctx.quadraticCurveTo(x, y, x + radius, y)
    this.ctx.closePath()
  }

  private drawBtn (yPos: number, button: textButtonInterface) {
    this.ctx.beginPath()
    this.ctx.roundRect(
      this.x + 25 * this.scale,
      this.y + yPos * this.scale,
      this.width - 50 * this.scale,
      30 * this.scale,
      5 * this.scale
    )
    this.ctx.fillStyle = '#78797a'
    this.ctx.fill()

    this.createText(
      35,
      yPos + 19,
      12,
      button.name,
      {
        isBold: false,
        color: '#fff',
        isCenter: false
      }
    )

    button.lineNode.x = this.x + this.width - (40 * this.scale)
    button.lineNode.y = this.y + ((yPos + 15) * this.scale)
    button.lineNode.y = this.y + ((yPos + 15) * this.scale)

    if (!button.lineNode.connectionTo && button.type === 'instagram') {
      button.type = ''
    }

    if (typeof button.lineNode.draw === 'function') {
      button.lineNode.draw()
    }

    if (button.lineNode.connectionTo) {
      const automatizationStore = useAutomatizationStore()
      const connectionObj = automatizationStore.objects.find(obj => obj.id === button.lineNode.connectionTo.id)
      if (connectionObj && connectionObj.nodeType === 'canvas_instagram_node') {
        button.type = 'instagram'
      }
    }

    return 40
  }

  private drawTexts (textEl: textElementInterface, startPos: number) {
    const buttonsHeight = textEl!.buttons ? 40 * textEl!.buttons.length : 0

    if (!textEl!.text && textEl!.buttons.length === 0) {
      this.createPlaceholder('Добавить текст', '#009ED0', 15, startPos)
      return 60
    } else {
      this.ctx.beginPath()
      this.ctx.roundRect(
        this.x + 15 * this.scale,
        this.y + startPos * this.scale,
        this.width - 30 * this.scale,
        (30 + buttonsHeight) * this.scale,
        10 * this.scale
      )
      this.ctx.fillStyle = '#999a9b'
      this.ctx.fill()
      const showText = textEl!.text ? textEl!.text.substring(0, 25) : ''
      this.createText(25, startPos + 18, 12, showText)

      if (textEl.buttons) {
        for (const [buttonIndex, button] of textEl.buttons.entries()) {
          const yPos = ((startPos - 10) + ((buttonIndex + 1) * 40))
          this.drawBtn(yPos, button)
        }
      }
      const rectHeight = 20
      return rectHeight + 20 + buttonsHeight
    }
  }

  private getButtonsLinesNodes () {
    const lineNodes = [
      ...(this.nodeElements?.map(ne => ne.textElement?.buttons?.map(te => te.lineNode) || []).flat() || [])
    ].filter(node => node)
    return lineNodes
  }

  changeText (
    text: string,
    buttons: Array<textButtonInterface> | [] = [],
    isPlaceholder = true,
    index: number
  ) {
    this.nodeElements[index].textElement!.text = text
    this.nodeElements[index].textElement!.isPlaceholder = isPlaceholder
    this.nodeElements[index].textElement!.buttons = buttons

    this.initButtonLines()
  }

  addAudio () {

  }

  override saveNodeInfo (isOneSave: boolean = false): Promise<any> {
    const nextStepId = this.canvasLineNode?.connectionTo?.id || null
    const blockData = {
      lineNode: this.canvasLineNode,
      nodeElements: this.nodeElements,
      next_step_id: nextStepId
    }
    return super.saveNodeInfo(isOneSave, blockData)
  }

  addButtonLine (newNode: any, instaIndex: number, buttonIndex: number) {
    const button = this.nodeElements[instaIndex].textElement?.buttons[buttonIndex]
    button!.type = newNode.type
    button!.lineNode.connectionTo = {
      id: newNode.id,
      x: newNode.x,
      y: newNode.y
    }
    this.saveNodeInfo(true)
  }
}
