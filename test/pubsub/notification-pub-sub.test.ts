import {UserConnections} from '../../src/model/user-connections'
import {PubSub} from '@google-cloud/pubsub'
import {NotificationPubSub} from '../../src/pubsub/notification-pub-sub'
import AppLogger from '../../src/logger/app-logger'
import {WebSocket} from 'ws'

describe('pubsub/notification-pub-sub test', () => {
  const userConnections = new UserConnections()
  const pubSubClient = new PubSub()
  const notificationPubSub = new NotificationPubSub(userConnections, new AppLogger(), pubSubClient)

  afterAll(async () => {
    if (notificationPubSub) {
      await notificationPubSub.close()
    }
  })

  test('subscribe to pub/sub and send message to client socket', (done) => {
    const socket = {
      ssoUserId: '123',
      send: (data: string) => {
        const message = JSON.parse(data)

        expect(message.eventName).toEqual('hello')
        expect(message.data).toEqual('world')
        done()
      },
    } as unknown as WebSocket
    userConnections.add(socket)

    pubSubClient.topic(process.env.PUBSUB_TOPIC as string).publishMessage({
      attributes: {eventName: 'hello', targetSsoUserIds: JSON.stringify(['123'])},
      data: Buffer.from('world'),
    })
    notificationPubSub.subscribe()
  })
})
