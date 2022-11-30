import {Service} from 'typedi'
import {WebSocket} from 'ws'

@Service({global: true})
export class UserConnections {
  private readonly users: Map<string, Set<WebSocket>> = new Map<string, Set<WebSocket>>()

  add(socket: WebSocket): void {
    const userSockets = this.users.get(socket.ssoUserId)
    if (userSockets && userSockets.add(socket)) {
      return
    }

    this.users.set(socket.ssoUserId, new Set<WebSocket>().add(socket))
  }

  remove(socket: WebSocket): void {
    this.users.get(socket.ssoUserId)?.delete(socket)
  }

  getAllForUser(ssoUserId: string): Set<WebSocket> {
    return this.users.get(ssoUserId) ?? new Set<WebSocket>()
  }
}
