import jwt from 'jsonwebtoken'
import {Config} from '../config/config'
import Cookies from 'cookies'
import {IncomingMessage, ServerResponse} from 'http'
import {IUserToken} from '../model/user-token'

export function verifyAuthorization(request: IncomingMessage): IUserToken {
  const cookies = new Cookies(request, new ServerResponse(request))
  const jwtRaw = Config.getJwtCookies()
    .map((cookieName) => cookies.get(cookieName))
    .join('.')
  const jwtPartsCount = jwtRaw.replace(/[^.]/gi, '').length
  if (!jwtRaw || jwtPartsCount !== 2) {
    throw new Error('Invalid JWT token')
  }

  return jwt.verify(jwtRaw, Config.getJwtPublicKey(), {
    algorithms: [Config.getJwtAlgorithm()],
  }) as IUserToken
}
