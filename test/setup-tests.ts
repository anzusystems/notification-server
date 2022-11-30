import 'reflect-metadata'
import {initPubSubMock} from './_mock/mq'
import {Config} from '../src/config/config'

Config.loadEnv('test')

// must be called before importing real PubSub
initPubSubMock()
