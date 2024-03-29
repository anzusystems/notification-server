FROM node:20-bookworm-slim

# ----------------------------------------------------------------------------------------------------------------------
# ENVIRONMENT VARIABLES
# ----------------------------------------------------------------------------------------------------------------------
ARG DOCKER_USER
ARG DOCKER_USER_ID
ARG DOCKER_GROUP_ID
# Versions
# Nginx version
ENV NGINX_VERSION=1.24.0 \
    NGINX_NJS_VERSION=0.8.1 \
    NGINX_PKG_RELEASE=1~bookworm \
# Supervisor version
    SUPERVISOR_VERSION=4.2.5 \
    SUPERVISOR_PKG_RELEASE=1 \
# NPM version
    NPM_VERSION=10.2.1 \
# Yarn version
    DOCKER_YARN_VERSION=4.0.1
# Common environment variables
ENV CONTAINER_STOP_LOG_FILE="/var/www/html/var/log/container_stop.log" \
    COREPACK_HOME="/usr/lib/node/corepack" \
    MAIN_TERMINATED_FILE="/var/www/html/var/log/main-terminated" \
    NPM_CONFIG_LOGLEVEL=notice \
    YARN_CACHE_FOLDER="/var/cache/yarn" \
    YARN_ENABLE_TELEMETRY=0 \
    # Unset yarn version - it could break things
    YARN_VERSION=
# Packages
ENV RUN_DEPS="ca-certificates \
              curl \
              g++ \
              gcc \
              gettext-base \
              git \
              gnupg \
              less \
              logrotate \
              lsb-release \
              make \
              openssh-client \
              procps \
              vim \
              wget"

# ----------------------------------------------------------------------------------------------------------------------
# PACKAGES
# ----------------------------------------------------------------------------------------------------------------------
RUN apt-get update && \
    apt-get install -y \
        ${RUN_DEPS} \
        supervisor=${SUPERVISOR_VERSION}-${SUPERVISOR_PKG_RELEASE} && \
# Cleanup
    apt-get clean && \
	rm -rf /var/lib/apt/lists/*

# ----------------------------------------------------------------------------------------------------------------------
# NPM + YARN
# Install static npm and yarn version
# ----------------------------------------------------------------------------------------------------------------------
RUN npm install --location=global npm@${NPM_VERSION} && \
    mkdir -p ${COREPACK_HOME} && \
    corepack prepare yarn@${DOCKER_YARN_VERSION} --activate && \
    corepack enable

# ----------------------------------------------------------------------------------------------------------------------
# NGINX
# ----------------------------------------------------------------------------------------------------------------------
RUN NGINX_KEYRING=/usr/share/keyrings/nginx-archive-keyring.gpg && \
    NGINX_REPO=nginx && \
    echo "deb [signed-by=${NGINX_KEYRING}] http://nginx.org/packages/debian $(lsb_release -cs) ${NGINX_REPO}" > /etc/apt/sources.list.d/${NGINX_REPO}.list && \
    curl -fsSL https://nginx.org/keys/nginx_signing.key | gpg --dearmor > ${NGINX_KEYRING} && \
    apt-get update && \
    apt-get install --no-install-recommends --no-install-suggests -y \
        nginx=${NGINX_VERSION}-${NGINX_PKG_RELEASE} \
        nginx-module-xslt=${NGINX_VERSION}-${NGINX_PKG_RELEASE} \
        nginx-module-geoip=${NGINX_VERSION}-${NGINX_PKG_RELEASE} \
        nginx-module-image-filter=${NGINX_VERSION}-${NGINX_PKG_RELEASE} \
        nginx-module-njs=${NGINX_VERSION}+${NGINX_NJS_VERSION}-${NGINX_PKG_RELEASE} && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# ----------------------------------------------------------------------------------------------------------------------
# USER SETUP
# ----------------------------------------------------------------------------------------------------------------------
RUN ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log && \
    mkdir -p /run/nginx && \
    chown node:node -R \
        /etc/nginx \
        /run/nginx \
        /var/log/nginx && \
    sed -i 's/^#alias l/alias l/g' /home/node/.bashrc && \
    echo "update-notifier=false" > /home/node/.npmrc && \
    mkdir -p \
        ${YARN_CACHE_FOLDER} \
        /var/cache/nginx \
        /usr/local/lib/node_modules \
        /var/run/supervisor \
        /var/www/html/var && \
    chown node:node -R \
        ${COREPACK_HOME} \
        ${YARN_CACHE_FOLDER} \
        /etc/nginx \
        /home/node/.npmrc \
        /run/nginx \
        /usr/local/bin \
        /usr/local/lib/node_modules \
        /var/cache/nginx \
        /var/log/nginx \
        /var/run/supervisor \
        /var/www/html

# ----------------------------------------------------------------------------------------------------------------------
# RUN CONFIGURATION
# ----------------------------------------------------------------------------------------------------------------------
COPY --chown=node:node ./docker/app/local/etc /etc
COPY --chown=node:node ./docker/app/local/usr /usr

# ----------------------------------------------------------------------------------------------------------------------
# PERMISSIONS FIX
# ----------------------------------------------------------------------------------------------------------------------
# Change USER_ID and GROUP_ID for nonroot container user if needed and install mysql-client
RUN fix-user ${DOCKER_USER} node ${DOCKER_USER_ID} ${DOCKER_GROUP_ID}

# ----------------------------------------------------------------------------------------------------------------------
# RUN
# Run setup and entrypoint start
# ----------------------------------------------------------------------------------------------------------------------
WORKDIR /var/www/html
USER node

EXPOSE 3005 8080

# Start
CMD ["start-command"]
