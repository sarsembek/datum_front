import CanvasNode from './CanvasNode'
import CanvasNodeLine from './CanvasNodeLine'
import type { randomElementInterface, CanvasRandomNodeConfig, IntRange } from '@/types/automatization'

export default class CanvasRandomNode extends CanvasNode {
  randomElements: randomElementInterface[]

  constructor (config: CanvasRandomNodeConfig) {
    super(config)
    if (config.randomElements) {
      this.randomElements = []
      for (const randomElement of config.randomElements) {
        this.randomElements.push({
          name: randomElement.name,
          percent: randomElement.percent,
          lineNode: new CanvasNodeLine({
            canvas: this.canvas,
            ctx: this.ctx,
            scale: this.scale,
            x: randomElement.lineNode ? randomElement.lineNode.x : this.x,
            y: randomElement.lineNode ? randomElement.lineNode.y : this.y,
            offsetX: randomElement.lineNode ? randomElement.lineNode.offsetX : 0,
            offsetY: randomElement.lineNode ? randomElement.lineNode.offsetY : 0,
            connectionTo: randomElement.lineNode ? randomElement.lineNode.connectionTo : {},
            connectionFrom: {
              id: this.id,
              x: this.x,
              y: this.y
            }
          })
        })
      }
    } else {
      this.randomElements = [
        {
          name: 'A',
          percent: 50,
          lineNode: new CanvasNodeLine({
            canvas: this.canvas,
            ctx: this.ctx,
            scale: this.scale,
            x: this.x,
            y: this.y,
            connectionFrom: {
              id: config.id,
              x: config.x,
              y: config.y
            }
          })
        },
        {
          name: 'B',
          percent: 50,
          lineNode: new CanvasNodeLine({
            canvas: this.canvas,
            ctx: this.ctx,
            scale: this.scale,
            x: config.x,
            y: config.y,
            connectionFrom: {
              id: config.id,
              x: config.x,
              y: config.y
            }
          })
        }
      ]
    }
    this.nodeType = 'canvas_random_node'
    this.draw()
  }

  override draw (): void {
    super.draw('#49414B', '#322B34', 'Случайный выбор', this.checkConnectionOver())
    this.createRandomElements()
    this.ctx.globalAlpha = 1.0
  }

  checkConnectionOver () {
    if (this.randomElements) {
      for (const randomElement of this.randomElements) {
        const lineNode = randomElement.lineNode
        if (lineNode.isConnectionOver()) { return true }
      }
    }
  }

  createRandomElements () {
    for (const [index, item] of this.randomElements.entries()) {
      item.lineNode.x = this.x + (this.width - (20 * this.scale))
      item.lineNode.y = this.y + (50 * this.scale) + (35 * index * this.scale)
      item.lineNode.scale = this.scale
      item.lineNode.draw()
      this.createText(12, 55 + (35 * index), 14, item.name)
      this.createText(180, (55 + (35 * index)), 12, `${item.percent}%`)
    }
    if (this.randomElements) {
      this.height = (38 + (35 * this.randomElements.length)) * this.scale
    }
  }

  addRandom (name: string, percent: IntRange<0, 100>) {
    this.randomElements.push({
      name,
      percent,
      lineNode: new CanvasNodeLine({
        canvas: this.canvas,
        ctx: this.ctx,
        scale: this.scale,
        x: this.x,
        y: this.y
      })
    })
    this.createRandomElements()
    this.saveNodeInfo(true)
  }

  removeRandom (index: number) {
    const alphabet = ['A', 'B', 'C', 'D', 'E', 'F']
    this.randomElements.splice(index, 1)
    for (const [index, el] of this.randomElements.entries()) {
      el.name = alphabet[index]
    }
    this.saveNodeInfo(true)
  }

  changeRandomValues (e: any) {
    this.randomElements = e
    this.saveNodeInfo(true)
  }

  override saveNodeInfo (isOneSave: boolean = false): Promise<any> {
    const blockData = { randomElements: this.randomElements }
    return super.saveNodeInfo(isOneSave, blockData)
  }
}
