export default class CanvasText {
  private ctx: CanvasRenderingContext2D
  private scale: number

  constructor (ctx: CanvasRenderingContext2D, scale: number) {
    this.ctx = ctx
    this.scale = scale
  }

  createText (
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
    let xPos = x * this.scale
    if (isCenter) {
      const textWidth = this.ctx.measureText(text).width * this.scale
      xPos = x - (textWidth / 2)
    }
    this.ctx.fillText(text, xPos, y * this.scale)
  }

  textWrap (text: string, x: number, y: number, maxWidth: number) {
    const words = text.split(' ')
    const lines: string[] = []
    let line = ''
    const scaledMaxWidth = maxWidth * this.scale

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
      this.createText(x, y + i * 12, 12, line)
    })

    return lines.length
  }

  createPlaceholder (text: string, color: string, xPos: number, yPos: number, width: number): number {
    const placeholderWidth = width * this.scale

    console.log(this.scale)

    this.ctx.beginPath()
    this.ctx.setLineDash([5])
    this.ctx.roundRect(
      xPos,
      yPos,
      placeholderWidth,
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

    return 60 * this.scale
  }
}
