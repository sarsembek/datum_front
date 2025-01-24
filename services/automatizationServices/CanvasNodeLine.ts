interface connectedTriggerFromInterface {
  id: number
  x: number,
  y: number,
}

export default class CanvasNodeLine {
  [x: string]: any
  readonly ctx: any
  readonly canvas: HTMLCanvasElement
  scale: number
  x: number
  y: number
  isDragging: boolean
  isConnection: boolean
  offsetX: number | null
  offsetY: number | null
  mouseOver: boolean
  size: { min: number; max: number }
  connectionFrom: connectedTriggerFromInterface | null
  connectionTo: connectedTriggerFromInterface | null

  constructor ({
    canvas, ctx, scale, x, y,
    offsetX = null, offsetY = null,
    connectionFrom = null, connectionTo = null
  }: {
    canvas: HTMLCanvasElement, ctx: any, scale: number, x: number, y: number,
    offsetX?: number | null, offsetY?: number | null,
    connectionFrom?: connectedTriggerFromInterface | null,
    connectionTo?: connectedTriggerFromInterface | null
  }) {
    this.ctx = ctx
    this.canvas = canvas
    this.x = x
    this.y = y
    this.scale = scale
    this.isDragging = false
    this.isConnection = false
    this.offsetX = offsetX
    this.offsetY = offsetY
    this.mouseOver = false
    this.size = { min: 7, max: 10 }
    this.connectionFrom = connectionFrom
    this.connectionTo = connectionTo
    this.draw()
  }

  draw () {
    this.createConnectionCircle()
  }

  drowLine (x: number, y: number, isConnected = false) {
    this.ctx.beginPath()
    const startX = this.x
    const startY = this.y
    let endX = x
    let endY = y
    if (isConnected) {
      endX = x + -5
      endY = y + 20
    }
    if (this.isConnection) { endX = x + 5 }
    if (this.isConnection) { endY = y + 2 }

    let controlX = startX + 150
    let controlY = startY - 50
    if (startX - endX < 150) { controlX = startX + 100 }
    if (startY < endY) { controlY = startY + 50 }

    if (startX - endX < 50) { controlX = startX + 50 }
    if (startY < endY) { controlY = startY + 20 }

    let controlEndX = endX - 200
    let controlEndY = endY
    if (startX - endX < 200) { controlEndX = endX - 80 }
    if (startY < endY) { controlEndY = endY + 10 }

    if (startX - endX < 100) { controlEndX = endX - 40 }

    // Рисование кривой Безье
    this.ctx.strokeStyle = '#ffffff'
    this.ctx.moveTo(startX, startY)
    this.ctx.bezierCurveTo(
      controlX,
      controlY,
      controlEndX,
      controlEndY,
      endX,
      endY
    )
    this.ctx.stroke()

    const fixedAngle = 0
    this.drawArrowhead(endX, endY, fixedAngle)
    this.ctx.strokeStyle = '#ffffff'
    this.ctx.stroke()
  }

  private drawArrowhead (x: number, y: number, angle: number) {
    const arrowSize = 10 // Размер стрелки
    this.ctx.save()
    this.ctx.translate(x, y)
    this.ctx.rotate(angle)
    this.ctx.beginPath()
    this.ctx.moveTo(0, 0)
    this.ctx.lineTo(-arrowSize, -arrowSize / 2)
    this.ctx.lineTo(-arrowSize, arrowSize / 2)
    this.ctx.closePath()
    this.ctx.fillStyle = '#ffffff'
    this.ctx.fill()
    this.ctx.restore()
  }

  connectTrigger (trigger: any) {
    this.connectionTo = { id: trigger.id, x: trigger.x, y: trigger.y }
  }

  connectTo () {
    if (this.connectionTo) {
      this.drowLine(this.connectionTo.x, this.connectionTo.y, true)
    }
  }

  isConnectionOver () {
    if (this.offsetX && this.offsetY && !this.isDragging && this.mouseOver &&
        (this.valueWithinARange(this.offsetX, this.x - this.size.max, this.x + this.size.max) &&
        this.valueWithinARange(this.offsetY, this.y - this.size.max, this.y + this.size.max))
    ) {
      return true
    }
    return false
  }

  createConnectionCircle () {
    this.ctx.beginPath()
    this.ctx.strokeStyle = '#8C8FA8'
    this.ctx.lineWidth = 2 * this.scale
    if (this.isConnectionOver()) {
      this.ctx.arc(
        this.x,
        this.y,
        this.size.max * this.scale,
        0,
        2 * Math.PI
      )
    } else {
      this.ctx.arc(
        this.x,
        this.y,
        this.size.min * this.scale,
        0,
        2 * Math.PI
      )
    }
    this.ctx.stroke()
    if (this.offsetX && this.offsetY && this.isDragging) {
      this.drowLine(this.offsetX, this.offsetY)
    }
    this.connectTo()
  }

  valueWithinARange (x: number, min: number, max: number) {
    return x >= min && x <= max
  }

  updatePosition (fromX: number, fromY: number, toX: number, toY: number) {
    if (this.connectionFrom) {
      this.connectionFrom.x = fromX
      this.connectionFrom.y = fromY
    }
    if (this.connectionTo) {
      this.connectionTo.x = toX
      this.connectionTo.y = toY
    }
    this.draw()
  }
}
