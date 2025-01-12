import UserModel from '../models/user'
import jwt from 'jsonwebtoken'
import { Error } from 'mongoose'
import { secret } from '../config'
import type { NextFunction, Response } from 'express'
import type { ReqWithBody, ReqWithUser } from '../types/request'
import type { User, UserCredentials, UserNormalized, UserSaved } from '../types/user.interface'

const UnprocessableContent = 422
const UnauthtorizedCode = 401

const normalizeUser = (user: UserSaved): UserNormalized => {
  const token = jwt.sign({ id: user._id, email: user.email }, secret)
  return {
    email: user.email,
    username: user.username,
    id: user._id.toString(),
    token: `Bearer ${token}`,
  }
}

export const register = async (req: ReqWithBody<User>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const newUser = new UserModel({
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
    })
    const savedUser = await newUser.save()
    res.send(normalizeUser(savedUser))
  } catch (error) {
    if (error instanceof Error.ValidationError) {
      const messages = Object.values(error.errors).map(err => err.message)
      res.status(UnprocessableContent).json(messages)
      return
    }
    next(error)
  }
}

export const login = async (req: ReqWithBody<UserCredentials>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await UserModel.findOne({ email: req.body.email }).select('+password')
    const errors = { emailOrPassword: 'Incorrect email or password' }

    if (user === null) {
      res.status(UnprocessableContent).json(errors)
      return
    }

    const isSamePassword = await user.validatePassword(req.body.password)

    if (!isSamePassword) {
      res.status(UnprocessableContent).json(errors)
      return
    }

    res.send(normalizeUser(user))
  } catch (error) {
    next(error)
  }
}

export const currentUser = (req: ReqWithUser, res: Response): void => {
  if (req.user === undefined) {
    res.sendStatus(UnauthtorizedCode)
    return
  }
  res.send(normalizeUser(req.user))
}
