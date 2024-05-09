import {WebSocket} from 'ws'

export interface UserWebSocket extends WebSocket {
  isAlive: boolean
  ssoUserId: string
}
