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
        let out = `${info.timestamp} [${info.moduleName || 'app'}] ${info.level}: ${info.message}`
        if (info.metadata.error) {
          out = out + ' ' + info.metadata.error
          if (info.metadata.error.stack) {
            out = out + ' ' + info.metadata.error.stack
          }
          delete info.metadata.error
        }

        if (info.metadata && Object.keys(info.metadata).length > 0) {
          out = out + ' ' + JSON.stringify(info.metadata)
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
