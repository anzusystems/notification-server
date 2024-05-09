import {Service} from 'typedi'
import {UserWebSocket} from './user-web-socket'

@Service({global: true})
export class UserConnections {
  private readonly users: Map<string, Set<UserWebSocket>> = new Map<string, Set<UserWebSocket>>()

  add(socket: UserWebSocket): void {
    const userSockets = this.users.get(socket.ssoUserId)
    if (userSockets?.add(socket)) {
      return
    }

    this.users.set(socket.ssoUserId, new Set<UserWebSocket>().add(socket))
  }

  remove(socket: UserWebSocket): void {
    this.users.get(socket.ssoUserId)?.delete(socket)
  }

  getAllForUser(ssoUserId: string): Set<UserWebSocket> {
    return this.users.get(ssoUserId) ?? new Set<UserWebSocket>()
  }
}
