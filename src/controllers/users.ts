import UserModel from '../models/user'
import jwt from 'jsonwebtoken'
import { Error } from 'mongoose'
import { secret } from '../config'
import type { NextFunction, Response } from 'express'
import type { ReqWithBody } from '../types/request.register'
import type { User, UserNormalized, UserSaved } from '../types/user.interface'

const UnprocessableContent = 422

const normalizeUser = (user: UserSaved): UserNormalized => {
  const token = jwt.sign({ id: user._id, email: user.email }, secret)
  return {
    email: user.email,
    username: user.username,
    id: user._id.toString(),
    token,
  }
}

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
    if (error instanceof Error.ValidationError) {
      const messages = Object.values(error.errors).map(err => err.message)
      res.status(UnprocessableContent).json(messages)
      return
    }
    next(error)
  }
}
