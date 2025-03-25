import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

export class WebSocketService {
  private socket: WebSocket | null = null
  private url: string

  /**
    * Инициализирует соединение WebSocket.
    * @param url - WebSocket URL.
    */
  constructor (url: string) {
    this.url = url
  }

  /**
    * Устанавливает соединение WebSocket.
    *
    * Если соединение уже существует, в журнал заносится предупреждение.
    */
  connect (): void {
    if (this.socket !== null) {
      this.handleWarning('WebSocket уже подключен.')
      return
    }

    this.socket = new WebSocket(this.url)

    this.socket.onopen = () => {
      this.handleInfo('Открыто соединение WebSocket.')
    }

    this.socket.onclose = (event) => {
      this.handleInfo('Соединение WebSocket закрыто.')
      console.info(event)
      this.socket = null
    }

    this.socket.onerror = (error) => {
      this.handleError('Произошла ошибка WebSocket.', error)
    }
  }

  /**
    * Закрывает соединение WebSocket, если оно существует.
    *
    * Выдает предупреждение, если соединение не найдено.
    */
  disconnect (): void {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    } else {
      this.handleWarning('WebSocket не подключен.')
    }
  }

  /**
    * Отправка данных через соединение WebSocket.
    *
    * Выдает предупреждение, если соединение не открыто.
    * @param data - Json Данные для отправки.
    */
  send (data: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data))
    } else {
      this.handleWarning('WebSocket не подключен или не открыт.')
    }
  }

  /**
    * Проверяет, открыто ли в данный момент соединение WebSocket.
    * @returns True, если соединение открыто, false в противном случае.
    */
  isConnected (): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN
  }

  /**
   * Срабатывает при критических ошибках
   * @param message Кастомное сообщение об ошибке
   * @param error Ошибка
   */
  private handleError (message: string, error?: any): void {
    throw new Error(`${message} ${error ? ': ' + error.message : ''}`)
  }

  /**
   * Предуприждение об ошибках
   * @param message Сообщение об ошибке
   */
  private handleWarning (message: string): void {
    toast(message, {
      theme: 'dark',
      type: 'error',
      position: 'bottom-right',
      transition: 'flip',
      dangerouslyHTMLString: true
    })
  }

  // Информационные сообщения
  /**
   * Уведомление
   * @param message Сообщение об ошибке
   */
  private handleInfo (message: string): void {
    console.info(message)
  }
}
