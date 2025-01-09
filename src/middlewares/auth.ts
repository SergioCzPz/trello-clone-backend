import jwt from 'jsonwebtoken'
import UserModel from '../models/user'
import { secret } from '../config'
import type { NextFunction, Response } from 'express'
import type { UserToken } from '../types/user.interface'
import type { ReqWithUser } from '../types/request'

const UnauthtorizedCode = 401

export default async function (req: ReqWithUser, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      headers: { authorization },
    } = req

    if (authorization === undefined) {
      res.sendStatus(UnauthtorizedCode)
      return
    }

    const [, token] = authorization.split(' ')

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- login and register middlewares create UserCredential token
    const data = jwt.verify(token, secret) as UserToken
    const user = await UserModel.findById(data.id)

    if (user === null) {
      res.sendStatus(UnauthtorizedCode)
      return
    }

    req.user = user
    next()
  } catch (error) {
    res.sendStatus(UnauthtorizedCode)
  }
}
