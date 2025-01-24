import CanvasNodeLine from './CanvasNodeLine'

export enum PopupsEnums {
    SmartDelayPopup = 'canvas_delay_node',
    RandomNodePopup = 'canvas_random_node',
    InstagramNodePopup = 'canvas_instagram_node',
    ConditionNodePopup = 'canvas_condition_node',
    WhenStartNodePopup = 'canvas_when_start_node'
}

export interface Drawable {
  draw(mainBlockColor: string, AdditionalBlockColor: string): void;
}

export interface Position {
  x: number;
  y: number;
}

export interface connectBlockInterface {
  x: number,
  y: number,
  id: number,
}

export interface textButtonInterface {
  name: string,
  type: string,
  url: string,
  lineNode: CanvasNodeLine
  [key: string]: any
}

export interface textElementInterface {
  text: string,
  textEndY?: number,
  buttons: Array<textButtonInterface> | [],
  isPlaceholder: boolean
}

export interface actionPopupInterface {
  popup: HTMLElement | null
  pos: Position,
  isOpen: boolean
}

export interface RandomElementInterface {
  name: string;
  percent: number;
  lineNode: CanvasNodeLine;
}

export interface CanvasNodeConfig {
  id: number;
  type: string;
  nodeType?: string;
  canvas: HTMLCanvasElementOrNull | null;
  ctx: CanvasRenderingContext2D;
  scale: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  offsetX?: number | null;
  offsetY?: number | null;
  canvasLineNode?: CanvasNodeLine | null;
  isInactive?: boolean;
}

export interface timePeriodInterface {
  start: string,
  end: string
}

export interface ActiveDayInterface {
  name: string,
  full_name?: string,
  is_active: boolean
}

export interface ConditionTagInterface {
  tags: Array<string>
  lineNode: CanvasNodeLine | null
}

type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>

type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>

interface randomElementInterface {
  name: string,
  percent: IntRange<0, 100>
  lineNode: CanvasNodeLine
}

export enum TriggerTypeEnums {
  UserSendsMessage = 'Пользователь отправил сообщение',
  RefUrl = 'Реферальная ссылка'
}

export enum UserSendsMessageEnums {
  MessageContains = 'сообщение содержит',
  MessageContainsWholeWord = 'сообщение содержит целое слово',
  MessageBeginsWith = 'сообщение начинается с',
  MessageDoesntContains = 'сообщение не содержит'
}

export interface UserSendsMessageTrigger {
  keywords: Array<string>;
  condition: UserSendsMessageEnums;
}

export interface RefUrlTrigger {
  type: TriggerTypeEnums.RefUrl;
  url: string;
}

export type TriggerInterfaceTypes = Array<UserSendsMessageTrigger> | RefUrlTrigger

export interface TriggerInterface {
  id?: number;
  type: string;
  name: string;
  data: TriggerInterfaceTypes
}

export interface CanvasDelayNodeConfig extends CanvasNodeConfig {
  timeValue?: number;
  time?: string;
  isPeriod?: boolean;
  period?: TimePeriodInterface | null;
  isDate?: boolean;
  dateDelay?: Date | null;
  activeDays?: ActiveDayInterface[] | null;
  lineNode?: CanvasNodeLine | null;
}

export interface CanvasConditionNodeConfig extends CanvasNodeConfig {
  trueConditions?: ConditionTagInterface[] | null;
  falseCondition?: CanvasNodeLine | null;
}

export interface InstagramNodeElementInterface {
  textElement?: textElementInterface,
  imageElement?: { src: string },
  delayElement?: { delayTime: number },
}

export interface CanvasInstagramNodeConfig extends CanvasNodeConfig {
  [x: string]: any;
  nodeElements: InstagramNodeElementInterface[] | []
}

export interface CanvasRandomNodeConfig extends CanvasNodeConfig {
  randomElements?: randomElementInterface[] | null
}

export interface CanvasWhenStartNodeConfig extends CanvasNodeConfig {
  triggers: TriggerInterface[] | []
  lineNode?: CanvasNodeLine | null;
}

export interface nodeTypesInterface {
  name: string,
  type: string
}