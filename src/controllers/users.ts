import UserModel from '../models/user'
import type { NextFunction, Response } from 'express'
import type { ReqWithBody } from '../types/request.register'
import type { User, UserNormalized, UserSaved } from '../types/user.interface'

const normalizeUser = (user: UserSaved): UserNormalized => ({
  email: user.email,
  username: user.username,
  id: user._id.toString(),
})

export const register = async (req: ReqWithBody<User>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const newUser = new UserModel({
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
    })
    console.log('newUser', newUser)
    const savedUser = await newUser.save()
    res.send(normalizeUser(savedUser))
    console.log('savedUser', savedUser)
  } catch (error) {
    next(error)
  }
}
