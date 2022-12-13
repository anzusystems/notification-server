Development on AnzuSystems Notification-Server by Petit Press a.s. (www.sme.sk)
=====

Simple guide on how to develop on the project, run tests, etc.

---

# Installation

## 1. Start Core-DAM containers

Start Core-DAM docker containers if not started yet - pubsub and nginx-proxy services are used from that project.

See [the official Core-DAM Development documentation][core-dam-dev-docu] on how to start Core-DAM containers.

## 2. Clone the repository

    git clone https://github.com/anzusystems/notification-server.git

## 3. Start containers

Start project docker containers:

    bin/docker-compose up --build -d

Arguments:

- `--build` - Build all images to run fresh docker containers
- `-d` - Run docker containers in the detached mode as background processes

## 4. (Optional) Run dev watch node server

By default the `docker-compose` command will autostart node server `yarn dev` with logs in `var/log/node-server.log` file.

_Hint: You can disable node server autostart with variable `DOCKER_NODE_AUTOSTART=false` in `.env.docker.local`. You have to restart the docker-compose to apply the change._

### 4.a. (Optional) Stop all running node servers

You must stop the running node server with the command:

    bin/run stop

### 4.b. (Optional) Start dev watch

Run `watch` node server (See below in the command description for more command line options):

    bin/run watch

# Scripts

Scripts available in the project.

## Bash

Script used to run bash in the application docker container.

    bin/bash

Execute `bin/bash -h` for all bash containers and options.

## Build

Script used to run build in the application docker container.

    bin/build

## Docker-compose script wrapper

Wrapper script used to run `docker-compose`:

    bin/docker-compose

Options:

- see [the official docker-compose docu][docker-compose-overview] for all options

Script will:

- setup correct permissions for the user if needed (sync UID and GID in docker container with host user, etc.)
- run `docker-compose` command

## Run - Run node server

Script used to run node server `dev`, `watch`, `prod` and more:

    bin/run watch

Execute `bin/run -h` for all command arguments.

## Security

Script used to run the security check inside the docker container:

    bin/security

## Test

Script used to run tests inside the docker container:

    bin/test

[core-dam-dev-docu]: https://github.com/anzusystems/core-dam/blob/main/README-DEV.md
[docker-compose-overview]: https://docs.docker.com/compose/reference/overview
