import {WebSocket} from 'ws'
import {WebsocketServer} from '../../src/server/websocket-server'
import {UserConnections} from '../../src/model/user-connections'
import {Config} from '../../src/config/config'
import AppLogger from '../../src/logger/app-logger'
import jwt from 'jsonwebtoken'

describe('server/websocket-server test', () => {
  let socketServer: WebsocketServer
  let socketClient: WebSocket
  let userConnections: UserConnections

  async function createClientSocket(): Promise<string> {
    return new Promise((resolve) => {
      const jwtToken = jwt.sign({sub: '123'}, Config.getJwtPrivateKey(), {
        algorithm: Config.getJwtAlgorithm(),
      })
      const lastDotPos = jwtToken.toString().lastIndexOf('.')

      socketClient = new WebSocket(`ws://localhost:${Config.getWebSocketServerPort()}/ws`, {
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

  // eslint-disable-next-line jest/no-done-callback
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

  // eslint-disable-next-line jest/no-done-callback
  test('emit message to client', (done) => {
    socketClient.addEventListener('message', (event) => {
      expect(event.data).toBe('hello')
      done()
    })
    const userConnection = userConnections.getAllForUser('123')
    expect(userConnection.size).toBe(1)
    userConnection.values().next().value.send('hello')
  })
})
