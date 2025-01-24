import CanvasNode from './CanvasNode'

import type {
  Drawable, timePeriodInterface, ActiveDayInterface,
  CanvasDelayNodeConfig
} from '@/types/automatization'

export default class CanvasDelayNode extends CanvasNode implements Drawable {
  timeValue: number
  time: string
  period: timePeriodInterface | null
  isDate: boolean
  isPeriod: boolean
  dateDelay: Date | null
  activeDays: ActiveDayInterface[] | null

  constructor (config: CanvasDelayNodeConfig) {
    super({
      id: config.id,
      type: config.type,
      canvas: config.canvas,
      ctx: config.ctx,
      scale: config.scale,
      x: config.x,
      y: config.y,
      offsetX: config.offsetX,
      offsetY: config.offsetY,
      width: config.width,
      height: config.height
    })

    this.timeValue = config.timeValue ?? 10
    this.time = config.time ?? 'Часов'
    this.isPeriod = config.isPeriod ?? false
    this.period = config.period ?? null
    this.isDate = config.isDate ?? false
    this.dateDelay = config.dateDelay ?? null
    this.activeDays = config.activeDays ?? null
    this.canvasLineNode = this.createLineConnector()

    if (config.lineNode) {
      this.canvasLineNode.connectionTo = config.lineNode.connectionTo
    }
    this.nodeType = 'canvas_delay_node'
    this.draw()
  }

  override draw (): void {
    super.draw('#473F3F', '#322E2E', 'Умная задержка')
    this.drawDescription()
    this.redrawCanvasLineNode()
    this.ctx.globalAlpha = 1
  }

  private drawDescription () {
    const timeDescription = `Подождать ${this.timeValue} ${this.time}`
    const periodDescription = this.period ? `, а затем продолжить c ${this.period.start} до ${this.period.end}` : ''
    const activeDaysText = this.getActiveDaysText()
    const activeDaysDescription = activeDaysText ? `, ${activeDaysText}` : ''

    const dateDelayFormatted = this.isDate && this.dateDelay
      ? new Date(this.dateDelay).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
        `, ${new Date(this.dateDelay).toDateString()}`
      : ''

    const description = this.isPeriod && this.period && !this.isDate
      ? `${timeDescription}${periodDescription}${activeDaysDescription}`
      : this.isDate && this.dateDelay
        ? `Ждать до ${dateDelayFormatted}, а затем продолжить`
        : `${timeDescription}, а затем продолжить`

    // if (this.isPeriod && this.period && !this.isDate) {
    //   description = `${timeDescription}${periodDescription}${activeDaysDescription}`
    // } else if (this.isDate && this.dateDelay) {
    //   const dateDelay = new Date(this.dateDelay)
    //   const dateFormat = `${dateDelay.getHours()}:${dateDelay.getMinutes()}, ${dateDelay.toDateString()}`
    //   description = `Ждать до ${dateFormat}, а затем продолжить`
    // } else {
    //   description = `${timeDescription}, а затем продолжить`
    // }

    this.textWrap(description, 12, 55)
  }

  private getActiveDaysText (): string {
    return this.activeDays?.filter(day => day.is_active).map(day => day.name).join(' ') || ''
  }

  override saveNodeInfo (isOneSave: boolean = false): Promise<any> {
    const blockData = {
      timeValue: this.timeValue,
      time: this.time,
      isPeriod: this.isPeriod,
      period: this.period,
      isDate: this.isDate,
      dateDelay: this.dateDelay,
      activeDays: this.activeDays,
      lineNode: this.canvasLineNode,
      next_step_id: this.canvasLineNode?.connectionTo?.id ?? null
    }
    return super.saveNodeInfo(isOneSave, blockData)
  }
}
