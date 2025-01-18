import { format } from 'date-fns'

class Logger {
  private getTimestamp() {
    return format(new Date(), 'yyyy-MM-dd HH:mm:ss')
  }

  info(message: string, data?: any) {
    console.log(`[${this.getTimestamp()}] INFO: ${message}`, data)
  }

  error(message: string, error?: any) {
    console.error(`[${this.getTimestamp()}] ERROR: ${message}`, error)
  }

  warn(message: string, data?: any) {
    console.warn(`[${this.getTimestamp()}] WARN: ${message}`, data)
  }
}

export const logger = new Logger()
