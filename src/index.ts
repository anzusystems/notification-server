import 'reflect-metadata'
import { Container } from 'typedi'
import ws from 'ws'
import AppLogger from '@/logger/app-logger'
import { Config } from '@/config/config'
import { NotificationPubSub } from '@/pubsub/notification-pub-sub'
import { WebsocketServer } from '@/server/websocket-server'

declare module 'ws' {
  export interface WebSocket extends ws {
    isAlive: boolean
    ssoUserId: string
  }
}

declare module 'http' {
  interface IncomingMessage {
    ssoUserId: string
  }
}

// load env vars from file (in production it contains only secrets)
Config.loadEnv()

const appLogger = new AppLogger()
Container.set(AppLogger, appLogger)

const init = async () => {
  // initialize and subscribe to Pub/Sub subscription
  await Container.get(NotificationPubSub).subscribe()
  // initialize WebSocket server
  Container.get(WebsocketServer).init()
}

// eslint-disable-next-line unicorn/prefer-top-level-await
init().catch((error: Error) => console.error(error))
