import jwt from 'jsonwebtoken'
import {Config} from '../config/config'
import Cookies from 'cookies'
import {IncomingMessage, ServerResponse} from 'http'
import {IUserToken} from '../model/user-token'
import AppLogger from '../logger/app-logger'

export function verifyAuthorization(request: IncomingMessage, logger: AppLogger): IUserToken {
  const cookies = new Cookies(request, new ServerResponse(request))
  const jwtRaw = Config.getJwtCookies()
    .map((cookieName) => cookies.get(cookieName))
    .join('.')
  const jwtPartsCount = jwtRaw.replace(/[^.]/gi, '').length
  if (!jwtRaw || jwtPartsCount !== 2) {
    throw new Error('Invalid JWT token')
  }

  logger.debug('Verifying authorization tokens...', {jwt: jwtRaw, pubCert: Config.getJwtPublicKey()})

  return jwt.verify(jwtRaw, Config.getJwtPublicKey(), {
    algorithms: [Config.getJwtAlgorithm()],
    allowInvalidAsymmetricKeyTypes: true,
  }) as IUserToken
}
