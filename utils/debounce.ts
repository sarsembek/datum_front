/**
 * Дебаунсинг функции
 * @param func - Функция, которую нужно дебаунсить
 * @param wait - Время ожидания в миллисекундах
 * @returns Дебаунсированная версия функции
 */
export default function (func: (...args: any[]) => void, wait: number) {
  let timeout: number | undefined
  return function (...args: any[]) {
    if (timeout) { clearTimeout(timeout) }
    timeout = window.setTimeout(() => func(...args), wait)
  }
}
