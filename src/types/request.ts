import type { Request } from 'express'
import type { ParamsDictionary } from 'express-serve-static-core'

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- By deafult ResBody is any
export interface ReqWithBody<T> extends Request<ParamsDictionary, any, T> {}
