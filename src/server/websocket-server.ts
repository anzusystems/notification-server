import http, {IncomingMessage, Server} from 'http'
import WebSocket from 'ws'
import stream from 'node:stream'
import {verifyAuthorization} from '../util/user-token-verifier'
import {Inject, Service} from 'typedi'
import {UserConnections} from '../model/user-connections'
import AppLogger from '../logger/app-logger'
import {Config} from '../config/config'

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
        const userToken = verifyAuthorization(request)
        request.ssoUserId = userToken.sub
      } catch {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
        socket.destroy()

        return
      }

      wss.handleUpgrade(request, socket, head, (ws) => {
        ws.ssoUserId = request.ssoUserId
        userConnections.add(ws)
        wss.emit('connection', ws, request)
      })
    })

    wss.on('connection', function connection(ws) {
      ws.isAlive = true
      ws.on('pong', () => (ws.isAlive = true))
      ws.on('close', () => userConnections.remove(ws))
    })

    this.heartBeatInterval = setInterval(function ping() {
      for (const ws of wss.clients) {
        if (ws.isAlive === false) {
          userConnections.remove(ws)
          ws.terminate()

          continue
        }

        ws.isAlive = false
        ws.ping(null, false, (error) => {
          if (error) {
            userConnections.remove(ws)
            ws.terminate()
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
