import { Message, PubSub, Subscription, Topic } from '@google-cloud/pubsub'
import AppLogger from '../logger/app-logger'
import { Inject, Service } from 'typedi'
import { UserConnections } from '../model/user-connections'

@Service()
export class NotificationPubSub {
  private readonly topicName = process.env.PUBSUB_TOPIC as string
  private readonly instanceName = process.env.APP_INSTANCE_NAME as string
  private _topic: Topic | undefined
  private _subscription: Subscription | undefined
  private readonly pubSubClient: PubSub

  constructor(
    @Inject() private readonly userConnections: UserConnections,
    @Inject() private readonly logger: AppLogger,
    pubSubClient: PubSub | undefined
  ) {
    this.pubSubClient = pubSubClient ?? new PubSub()
  }

  async subscribe(): Promise<void> {
    const topic = await this.topic()
    const subscription = await this.subscription(topic)

    subscription.on('message', (message: Message): void => {
      this.logger.debug(`Message received with attributes: ${JSON.stringify(message.attributes)}`)

      if (!message?.attributes.eventName) {
        this.logger.error('Unsupported Pub/Sub message. Missing eventName in header.')

        return message.ack()
      }

      let targetSsoUserIds = []
      if (message?.attributes.targetSsoUserIds) {
        targetSsoUserIds = JSON.parse(message.attributes.targetSsoUserIds) ?? []
      }

      if (!Array.isArray(targetSsoUserIds) || targetSsoUserIds.length === 0) {
        this.logger.error('Unsupported Pub/Sub message. Missing targetSsoUserIds in header.')

        return message.ack()
      }

      for (const targetSsoUserId of targetSsoUserIds) {
        for (const userConnection of this.userConnections.getAllForUser(targetSsoUserId.toString())) {
          userConnection.send(
            JSON.stringify({
              eventName: message.attributes.eventName as string,
              data: message.data.toString(),
            })
          )
        }
      }

      message.ack()
    })
  }

  /**
   * Creates a topic or retrieve existing.
   */
  private async topic(): Promise<Topic> {
    if (this._topic) {
      return this._topic
    }

    const existingTopic = this.pubSubClient.topic(this.topicName)
    const [exists] = await existingTopic.exists()
    if (exists) {
      this.logger.debug(`Topic "${this.topicName}" exists.`)

      return existingTopic
    }

    const [topic] = await this.pubSubClient.createTopic(this.topicName)
    this.logger.debug(`Topic "${this.topicName}" has been created successfully.`)

    this._topic = topic

    return topic
  }

  private async subscription(topic: Topic): Promise<Subscription> {
    if (this._subscription) {
      return this._subscription
    }

    const subscriptionName = `${this.topicName}_${this.instanceName}`
    const existingSubscription = this.pubSubClient.subscription(subscriptionName)
    const [exists] = await existingSubscription.exists()
    if (exists) {
      this.logger.debug(`Subscription "${subscriptionName}" exists.`)

      return existingSubscription
    }

    const [subscription] = await this.pubSubClient.createSubscription(topic, subscriptionName, {
      expirationPolicy: { ttl: { seconds: 3600 * 24 } },
      enableMessageOrdering: true,
    })
    this.logger.debug(`Subscription "${subscriptionName}" has been created successfully.`)

    this._subscription = subscription

    return subscription
  }

  public async close() {
    await this._subscription?.close()
  }
}
