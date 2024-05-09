import dotenv from 'dotenv'
import process from 'process'
import {Algorithm} from 'jsonwebtoken'

export class Config {
  private static jwtPublicKey: string
  private static jwtPrivateKey: string
  private static jwtAlgorithm: Algorithm
  private static jwtCookies: string[]
  private static webSocketServerPort: number
  private static webSocketServerCors: string
  private static envLoaded = false

  public static loadEnv(environmentType = ''): void {
    if (Config.envLoaded) {
      // the env variables from file were already loaded
      return
    }

    let environmentFile = './.env'
    if (environmentType !== '') {
      environmentFile = `${environmentFile}.${environmentType}`
    }
    dotenv.config({path: environmentFile})
    Config.envLoaded = true
  }

  public static getJwtPublicKey(): string {
    if (Config.jwtPublicKey) {
      return Config.jwtPublicKey
    }

    Config.jwtPublicKey = this.base64ToAscii(process.env.SSO_JWT_PUBLIC_KEY!)

    return Config.jwtPublicKey
  }

  public static getJwtPrivateKey(): string {
    if (Config.jwtPrivateKey) {
      return Config.jwtPrivateKey
    }

    Config.jwtPrivateKey = this.base64ToAscii(process.env.SSO_JWT_PRIVATE_KEY!)

    return Config.jwtPrivateKey
  }

  public static getJwtAlgorithm(): Algorithm {
    if (Config.jwtAlgorithm) {
      return Config.jwtAlgorithm
    }

    Config.jwtAlgorithm = process.env.SSO_JWT_ALGORITHM as Algorithm

    return Config.jwtAlgorithm
  }

  public static getJwtCookies(): string[] {
    if (Config.jwtCookies) {
      return Config.jwtCookies
    }

    Config.jwtCookies = process.env.SSO_JWT_COOKIES!.split(',')

    return Config.jwtCookies
  }

  public static getWebSocketServerPort(): number {
    if (Config.webSocketServerPort) {
      return Config.webSocketServerPort
    }

    Config.webSocketServerPort = process.env.WEBSOCKET_SERVER_PORT as unknown as number

    return Config.webSocketServerPort
  }

  public static getWebSocketServerCors(): string {
    if (Config.webSocketServerCors) {
      return Config.webSocketServerCors
    }

    Config.webSocketServerCors = process.env.WEBSOCKET_SERVER_CORS!

    return Config.webSocketServerCors
  }

  public static base64ToAscii(base64String: string): string {
    const buff = Buffer.from(base64String, 'base64')
    return buff.toString('ascii')
  }
}
