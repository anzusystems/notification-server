import {UserConnections} from '../../src/model/user-connections'
import {UserWebSocket} from '../../src/model/user-web-socket'

describe('model/user-connections test', () => {
  const userConnections: UserConnections = new UserConnections()

  test('collection', () => {
    const socket1 = {ssoUserId: '1'} as unknown as UserWebSocket
    const socket2 = {ssoUserId: '1'} as unknown as UserWebSocket
    const socket3 = {ssoUserId: '1'} as unknown as UserWebSocket
    const socket4 = {ssoUserId: '2'} as unknown as UserWebSocket
    const socket5 = {ssoUserId: '3'} as unknown as UserWebSocket
    const socket6 = {ssoUserId: '3'} as unknown as UserWebSocket

    for (const socket of [socket1, socket2, socket3, socket4, socket5, socket6]) {
      userConnections.add(socket)
    }

    expect(userConnections.getAllForUser('1')).toEqual(new Set([socket1, socket2, socket3]))
    expect(userConnections.getAllForUser('2')).toEqual(new Set([socket4]))
    expect(userConnections.getAllForUser('3')).toEqual(new Set([socket5, socket6]))

    userConnections.remove(socket2)
    expect(userConnections.getAllForUser('1')).toEqual(new Set([socket1, socket3]))
  })
})
