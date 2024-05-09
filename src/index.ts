import 'reflect-metadata'
import {Config} from './config/config'
import {NotificationPubSub} from './pubsub/notification-pub-sub'
import AppLogger from './logger/app-logger'
import {Container} from 'typedi'
import {WebsocketServer} from './server/websocket-server'

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
