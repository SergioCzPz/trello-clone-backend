import type { Request } from 'express'
import type { ParamsDictionary } from 'express-serve-static-core'
import type { UserSaved } from './user.interface'

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- By deafult ResBody is any
export interface ReqWithBody<T> extends Request<ParamsDictionary, any, T> {
  user?: UserSaved
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- By deafult ResBody is any
export interface ReqWithQueryParams<T> extends Request<ParamsDictionary, any, any, T> {
  user?: UserSaved
}

export interface ReqWithUser extends Request {
  user?: UserSaved
}
