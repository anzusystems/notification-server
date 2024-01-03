import { Message } from '@google-cloud/pubsub'

let publishedMessage: Message

// PubSub mock must be called before importing real PubSub
export const pubSubTopicMock = jest.fn().mockImplementation(() => ({
  get: jest.fn(),
  publishMessage: jest.fn().mockImplementation((message) => {
    publishedMessage = message

    return Promise.resolve('[generated-message-id]')
  }),
  exists: jest.fn().mockImplementation(() => {
    return [true]
  }),
}))

export const pubSubSubscriptionMock = jest.fn().mockImplementation(() => ({
  on: jest.fn().mockImplementation((test: string, function_: (asd: Message) => void) => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    publishedMessage.ack = (): void => {}
    function_(publishedMessage)
  }),
  exists: jest.fn().mockImplementation(() => {
    return [true]
  }),
}))

export function initPubSubMock() {
  jest.mock('@google-cloud/pubsub', () => {
    return {
      __esModule: true,
      PubSub: jest.fn().mockImplementation(() => ({
        topic: pubSubTopicMock,
        subscription: pubSubSubscriptionMock,
      })),
    }
  })
}
