import type { JwtPayload } from './jwt-payload.js'

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}
