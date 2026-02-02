import winston, { Logger } from 'winston'
import { Service } from 'typedi'

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
    const childLogger: Logger = this.logger.child({ moduleName: name })

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

    interface LogInfo extends winston.Logform.TransformableInfo {
      timestamp?: string
      moduleName?: string
      metadata: {
        error?: {
          stack?: string
        }
        [key: string]: unknown
      }
    }

    formats.push(
      winston.format.printf((info) => {
        const logInfo = info as LogInfo
        let out = `${logInfo.timestamp} [${logInfo.moduleName || 'app'}] ${logInfo.level}: ${logInfo.message}`
        if (logInfo.metadata.error) {
          out = out + ' ' + logInfo.metadata.error
          if (logInfo.metadata.error.stack) {
            out = out + ' ' + logInfo.metadata.error.stack
          }
          delete logInfo.metadata.error
        }

        if (logInfo.metadata && Object.keys(logInfo.metadata).length > 0) {
          out = out + ' ' + JSON.stringify(logInfo.metadata)
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
