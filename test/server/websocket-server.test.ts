import { WebSocket } from 'ws'
import { WebsocketServer } from '@/server/websocket-server'
import { UserConnections } from '@/model/user-connections'
import { Config } from '@/config/config'
import AppLogger from '@/logger/app-logger'
import jwt from 'jsonwebtoken'

class WebSocketClient extends WebSocket {
  ssoUserId = ''
  isAlive = false
}

describe('server/websocket-server test', () => {
  let socketServer: WebsocketServer
  let socketClient: WebSocketClient
  let userConnections: UserConnections

  async function createClientSocket(): Promise<string> {
    return new Promise((resolve) => {
      const jwtToken = jwt.sign({ sub: '123' }, Config.getJwtPrivateKey(), {
        algorithm: Config.getJwtAlgorithm(),
      })
      const lastDotPos = jwtToken.toString().lastIndexOf('.')

      socketClient = new WebSocketClient(`ws://localhost:${Config.getWebSocketServerPort()}/ws`, {
        headers: {
          Origin: Config.getWebSocketServerCors(),
          Cookie: `anz_jp=${jwtToken.toString().slice(0, Math.max(0, lastDotPos))}; anz_js=${jwtToken
            .toString()
            .slice(lastDotPos + 1)}`,
        },
        perMessageDeflate: true,
      })

      socketClient.on('open', () => resolve('connection open'))
    })
  }

  beforeAll((done) => {
    userConnections = new UserConnections()
    socketServer = new WebsocketServer(new AppLogger(), userConnections)
    socketServer.init()
    createClientSocket().then(() => done())
  })

  afterAll(async () => {
    if (socketServer) {
      socketServer.close()
    }
    if (socketClient) {
      socketClient.close()
    }
  })

  test('emit message to client', (done) => {
    socketClient.addEventListener('message', (event) => {
      expect(event.data).toBe('hello')
      done()
    })
    const userConnection = userConnections.getAllForUser('123')
    expect(userConnection.size).toEqual(1)
    userConnection.values().next().value.send('hello')
  })
})
