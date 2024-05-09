import http, {IncomingMessage, Server} from 'http'
import WebSocket from 'ws'
import stream from 'node:stream'
import {verifyAuthorization} from '../util/user-token-verifier'
import {Inject, Service} from 'typedi'
import {UserConnections} from '../model/user-connections'
import AppLogger from '../logger/app-logger'
import {Config} from '../config/config'
import {UserWebSocket} from '../model/user-web-socket'

@Service()
export class WebsocketServer {
  private heartBeatInterval: ReturnType<typeof setInterval> | undefined
  private readonly httpServer: Server
  private readonly wss: WebSocket.Server

  constructor(
    @Inject() private readonly appLogger: AppLogger,
    @Inject() private readonly userConnections: UserConnections
  ) {
    this.httpServer = http.createServer()
    this.wss = new WebSocket.Server({
      noServer: true,
      path: '/ws',
      perMessageDeflate: true,
      verifyClient: ({origin}, callback) => {
        const isAllowed = new RegExp(Config.getWebSocketServerCors()).test(origin)
        if (!isAllowed) {
          appLogger.warn(`Request from origin ${origin} blocked`)
        }
        callback(isAllowed)
      },
    })
  }

  public init() {
    const wss = this.wss
    const userConnections = this.userConnections

    this.httpServer.on('upgrade', (request: IncomingMessage, socket: stream.Duplex, head: Buffer) => {
      try {
        const userToken = verifyAuthorization(request, this.appLogger)
        request.ssoUserId = userToken.sub
      } catch (error) {
        this.appLogger.warn('Unauthorized attempt to connect.', error)

        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
        socket.destroy()

        return
      }

      wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
        const userWs = ws as UserWebSocket

        userWs.ssoUserId = request.ssoUserId
        userConnections.add(userWs)
        wss.emit('connection', userWs, request)
      })
    })

    wss.on('connection', function connection(ws: WebSocket) {
      const userWs = ws as UserWebSocket

      userWs.isAlive = true
      userWs.on('pong', () => (userWs.isAlive = true))
      userWs.on('close', () => userConnections.remove(userWs))
    })

    this.heartBeatInterval = setInterval(function ping() {
      for (const ws of wss.clients) {
        const userWs = ws as UserWebSocket
        if (userWs.isAlive === false) {
          userConnections.remove(userWs)
          userWs.terminate()

          continue
        }

        userWs.isAlive = false
        userWs.ping(null, false, (error) => {
          if (error) {
            userConnections.remove(userWs)
            userWs.terminate()
          }
        })
      }
    }, 3000)

    wss.on('close', () => clearInterval(this.heartBeatInterval))

    this.httpServer.listen(Config.getWebSocketServerPort())
  }

  public close() {
    this.wss.close()
    this.httpServer.close()
    clearInterval(this.heartBeatInterval)
  }
}
