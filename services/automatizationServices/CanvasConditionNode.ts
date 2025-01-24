import CanvasNode from './CanvasNode'
import CanvasNodeLine from './CanvasNodeLine'
import type { ConditionTagInterface, CanvasConditionNodeConfig } from '@/types/automatization'

export default class CanvasConditionNode extends CanvasNode {
  trueConditions: ConditionTagInterface[] | null
  falseCondition: CanvasNodeLine | null

  constructor (config: CanvasConditionNodeConfig) {
    super(config)
    this.trueConditions = this.initTrueLineNodes(config.trueConditions)
    this.falseCondition = this.initFalseLineNode(config.trueConditions, config.falseCondition)
    this.nodeType = 'canvas_condition_node'
    this.draw()
  }

  private initTrueLineNodes (
    trueConditions: ConditionTagInterface[] | null | undefined
  ): ConditionTagInterface[] | null {
    return trueConditions?.map(condition => ({
      ...condition,
      lineNode: this.createLineNode(condition)
    })) ?? null
  }

  private initFalseLineNode (
    trueConditions: ConditionTagInterface[] | null | undefined, falseCondition: CanvasNodeLine | null
  ): CanvasNodeLine | null {
    if (trueConditions) {
      const lineNode = this.createLineConnector()
      if (falseCondition?.connectionTo) {
        lineNode.connectionTo = falseCondition.connectionTo
      }
      return lineNode
    }
    return null
  }

  override draw (): void {
    super.draw('#07545D', '#00353B', 'Условие', this.checkConnectionOver())
    this.trueConditions ? this.drawFalseCondition() : this.createPlaceholder('Добавьте условие')
    this.redrawCanvasLineNode()
    this.ctx.globalAlpha = 1
  }

  checkConnectionOver () {
    if (!this.trueConditions) {
      this.height = 125 * this.scale
      return false
    }
    return this.drawTrueConditions()
  }

  private drawTrueConditions (): boolean {
    let connectionIsOver = false
    const trueLineNode = this.trueConditions![0].lineNode

    if (trueLineNode) {
      const lineNodePos = 40 + (this.trueConditions![0].tags.length * 25) / 2
      trueLineNode.x = this.x + (this.width - 20 * this.scale)
      trueLineNode.y = this.y + lineNodePos * this.scale
      trueLineNode.scale = this.scale
      if (trueLineNode.isConnectionOver()) {
        connectionIsOver = true
      }
    } else {
      this.trueConditions![0].lineNode = this.createLineNode(this.trueConditions![0])
      connectionIsOver = this.checkConnection(this.trueConditions![0])
    }

    this.createCondition()

    return connectionIsOver
  }

  private drawFalseCondition (): void {
    if (!this.falseCondition) {
      this.falseCondition = this.createLineConnector()
    }
    this.falseCondition!.x = (this.x + this.width) - (20 * this.scale)
    this.falseCondition!.y = (this.y + this.height) - (33 * this.scale)
    this.falseCondition!.scale = this.scale
    this.createText(40, this.createCondition() + 40, 12, 'Если нет верных условий')
    if (this.falseCondition!.isConnectionOver()) {
      this.isHoveredBlock(true)
    }
    this.falseCondition?.draw()
  }

  private createCondition (): number {
    let pos = 55
    for (const trueCondition of this.trueConditions!) {
      for (const tag of trueCondition.tags) {
        this.createText(12, pos, 14, `Тэг - ${tag}`)
        pos += 25
      }
      this.trueConditions![0].lineNode?.draw()
    }
    const trueHeight = 25 * this.trueConditions![0].tags.length
    this.height = (125 + trueHeight) * this.scale
    return pos
  }

  private createLineNode (condition: ConditionTagInterface): CanvasNodeLine | null {
    if (condition && condition.tags) {
      const lineNodePos = 40 + (condition.tags.length * 25) / 2
      const lineNode = this.createLineConnector(null, this.y + lineNodePos)
      if (condition.lineNode?.connectionTo) {
        lineNode.connectionTo = condition.lineNode!.connectionTo
      }
      return lineNode
    }
    return null
  }

  private checkConnection (condition: ConditionTagInterface): boolean {
    return condition.lineNode?.isConnectionOver() ?? false
  }

  override saveNodeInfo (isOneSave: boolean = false): Promise<any> {
    const blockData = {
      trueConditions: this.trueConditions,
      falseCondition: this.falseCondition
    }
    return super.saveNodeInfo(isOneSave, blockData)
  }
}
