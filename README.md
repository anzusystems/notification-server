AnzuSystems Notification Server by Petitpress.sk
=====

Provides WebSocket functionality among Anzusystems' projects.

---

## Introduction

Notification Server is a simple WebSocket server which requires only these technologies:
* [Google Pub/Sub](https://cloud.google.com/pubsub/docs/overview)
* Users externally authenticated with a [JWT](https://jwt.io/) stored in cookies.
  * note: Notification Server only validates token according a public certificated.

Notification Server supports horizontal scaling by creating a Pub/Sub subscription for each running instance.  

## Pushing messages to Notification Server
To send a [PubsubMessage](https://cloud.google.com/pubsub/docs/reference/rest/v1/PubsubMessage) you must define following fields:
 * **attributes.targetSsoUserIds** - array of user ids which should receive a message
 * **attributes.eventName** - string of an event name
 * **data** (optional) - any string (e.g. serialized json) which will be sent to target sso user ids 

## Configuration
Configure these environment variables:
* **SSO_JWT_COOKIES** - array of cookies names where is a JWT stored. It might contain only one cookie name, but for security purpose it's recommended to split the token into two parts: 
  * _header_ and _payload_ into not http-only cookie
  * _signature_ into http- only cookie
* **SSO_JWT_ALGORITHM** - the algorithm used to encrypt a JWT (e.g. ES256)
* **PUBSUB_TOPIC** - string name of the Pub/Sub topic name.
* **APP_INSTANCE_NAME** - string name of the instance. If you run Notification Server on multiple instances (e.g. containers), use the unique name of the container. Pub/Sub will create on a startup subscription for each container to a topic defined in **PUBSUB_TOPIC**.
* **WEBSOCKET_SERVER_CORS** - regex cors url from which is connection made of
* **WEBSOCKET_SERVER_PORT** - server port for WebSocket server
* **LOG_LEVEL** - any value of [Winston's logger levels](https://github.com/winstonjs/winston#logging-levels)
* **GCLOUD_PROJECT** - your project name in Google Pub/Sub, or for a development purpose use "emulator-project"
* **GOOGLE_APPLICATION_CREDENTIALS** - your path to a Google Pub/Sub credentials json, or for a development purpose don't define this env
* **PUBSUB_EMULATOR_HOST** - only for a development purpose, define a host to an emulator host

## Start prod server
Run `prod` node server:

    bin/run prod

For a development run, read [README-DEV.md](./README-DEV.md).
