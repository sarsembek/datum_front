/* eslint-disable no-unused-vars */
import CanvasNode from './CanvasNode'
import CanvasNodeLine from './CanvasNodeLine'
import type { TriggerInterface, CanvasWhenStartNodeConfig } from '@/types/automatization'

export enum TriggerTypeEnums {
  UserSendsMessage = 'Пользователь отправил сообщение',
  UserCommented = 'Пользователь оставил комментарий',
  RefUrl = 'Реферальная ссылка'
}

export default class CanvasWhenStartNode extends CanvasNode {
  triggers: TriggerInterface[] | []

  constructor (config: CanvasWhenStartNodeConfig) {
    super(config)
    const lineNodeConfig = config.lineNode
      ? {
          canvas: config.canvas,
          ctx: config.ctx,
          scale: config.scale,
          x: this.x + this.width - (20 * this.scale),
          y: this.y + this.height - (20 * this.scale),
          connectionTo: config.lineNode.connectionTo,
          connectionFrom: {
            id: this.id,
            x: this.x,
            y: this.y
          }
        }
      : {
          canvas: config.canvas,
          ctx: config.ctx,
          scale: config.scale,
          x: this.x + this.width - (20 * this.scale),
          y: this.y + this.height - (20 * this.scale),
          connectionFrom: {
            id: this.id,
            x: this.x,
            y: this.y
          }
        }
    this.canvasLineNode = new CanvasNodeLine(lineNodeConfig)
    this.nodeType = 'canvas_when_start_node'
    this.triggers = config.triggers
    this.draw()
  }

  override draw (): void {
    super.draw('#473F3F', '#322E2E', 'Когда...')

    let triggetPos = 140

    if (!this.triggers || this.triggers.length === 0) {
      this.createPlaceholder('+ Новый триггер')
    } else {
      triggetPos = 50
      for (const trigger of this.triggers) {
        triggetPos = this.drawTrigger(trigger, triggetPos)
      }
      triggetPos += 40
    }

    this.height = triggetPos * this.scale

    this.redrawCanvasLineNode()
    this.ctx.globalAlpha = 1.0
  }

  drawTrigger (trigger: any, triggetPos: number) {
    let lines = 0

    this.ctx.beginPath()

    if (trigger.type === TriggerTypeEnums.UserSendsMessage && trigger.data) {
      let text = ''
      for (const [i, triggerData] of trigger.data.entries()) {
        text += triggerData.condition + ' '
        for (const [keywordIndex, keyword] of triggerData.keywords.entries()) {
          text += keyword
          if (keywordIndex !== triggerData.keywords.length - 1) {
            text += ', '
          }
        }
        if (i !== trigger.data.length - 1) {
          text += ' и '
        }
      }

      lines = this.textWrap(text, 25, triggetPos + 40)
    }

    if (trigger.type === TriggerTypeEnums.UserCommented && trigger.data) {
      let text = `Тип комментария: "${trigger.data.reply_to?.name}"`
      if (trigger.data.reply_to?.type !== 'commentAny') {
        if (trigger.data.keywords.length > 0) {
          text += '. Комментарии: '
        }

        for (const [keywordIndex, keyword] of trigger.data.keywords.entries()) {
          text += keyword
          if (keywordIndex !== trigger.data.keywords.length - 1) {
            text += ', '
          }
        }
      }

      text += `. Кол-во выбранных постов: ${
        trigger.data.selected_posts_ids.length > 0 ? trigger.data.selected_posts_ids.length : 'Все'}`

      lines = this.textWrap(text, 25, triggetPos + 40)
    }

    this.ctx.roundRect(
      this.x + 15 * this.scale,
      this.y + triggetPos * this.scale,
      this.width - 30 * this.scale,
      (30 + (lines * 18)) * this.scale,
      5 * this.scale
    )
    this.ctx.strokeStyle = '#544d4d'
    this.ctx.stroke()

    this.createText(25, triggetPos + 20, 14, trigger.name)

    const endPos = (triggetPos + 40) + (lines * 18)

    return endPos
  }

  override saveNodeInfo (isOneSave: boolean = false): Promise<any> {
    const nextStepId = this.canvasLineNode?.connectionTo?.id || null
    const blockData = {
      triggers: this.triggers,
      lineNode: this.canvasLineNode,
      next_step_id: nextStepId
    }
    return super.saveNodeInfo(isOneSave, blockData)
  }
}
