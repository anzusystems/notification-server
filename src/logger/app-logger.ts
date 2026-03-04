import winston, {Logger} from 'winston'
import {Service} from 'typedi'

@Service()
export default class AppLogger {
  private readonly logger: Logger

  constructor(logger?: Logger) {
    if (logger) {
      this.logger = logger

      return
    }

    this.logger = this.createWinstonLogger()
  }

  public debug(message: string, ...meta: unknown[]): void {
    this.logger.debug(message, ...meta)
  }

  public info(message: string, ...meta: unknown[]): void {
    this.logger.info(message, ...meta)
  }

  public warn(message: string, ...meta: unknown[]): void {
    this.logger.warn(message, ...meta)
  }

  public error(message: string, ...meta: unknown[]): void {
    this.logger.error(message, ...meta)
  }

  public createChildLogger(name: string): AppLogger {
    const childLogger: Logger = this.logger.child({moduleName: name})

    return new AppLogger(childLogger)
  }

  private createWinstonLogger(): Logger {
    const environmentLogLevel = process.env.LOG_LEVEL

    const formats = [
      winston.format.timestamp(),
      winston.format.metadata({
        fillExcept: ['message', 'level', 'timestamp', 'label', 'moduleName'],
      }),
    ]

    if (process.env.NODE_ENV === 'dev') {
      formats.push(winston.format.colorize())
    }

    formats.push(
      winston.format.printf((info) => {
        const metadata = info.metadata as Record<string, unknown> | undefined
        let out = `${info.timestamp} [${info.moduleName ?? 'app'}] ${info.level}: ${info.message}`
        if (metadata?.error) {
          const error = metadata.error as Error
          out = out + ' ' + error
          if (error.stack) {
            out = out + ' ' + error.stack
          }
          delete metadata.error
        }

        if (metadata && Object.keys(metadata).length > 0) {
          out = out + ' ' + JSON.stringify(metadata)
        }

        return out
      })
    )

    return winston.createLogger({
      level: environmentLogLevel ?? 'info',
      format: winston.format.combine(...formats),
      transports: new winston.transports.Console({
        stderrLevels: ['error', 'crit', 'alert', 'emerg'],
      }),
    })
  }
}
