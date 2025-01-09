import type { Model, Document, Types } from 'mongoose'

export interface User {
  email: string
  username: string
  password: string
  createdAt: Date
}

export interface UserMethods {
  // eslint-disable-next-line @typescript-eslint/method-signature-style -- Necessary to be an interface
  validatePassword(password: string): boolean
}

export type UserModel = Model<User, object, UserMethods>

export interface UserDocument extends User, Document {}

export type UserSaved = Document<unknown, object, User> &
  Omit<
    User & {
      _id: Types.ObjectId
    } & {
      __v: number
    },
    'validatePassword'
  > &
  UserMethods

export interface UserNormalized {
  email: string
  username: string
  id: string
}
