import bcrypt from 'bcrypt'
import { model, Schema } from 'mongoose'
import validator from 'validator'
import type { UserDocument, UserMethods, UserModel } from '../types/user.interface'

const userSchema = new Schema<UserDocument, UserModel, UserMethods>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      validate: [validator.isEmail, 'invalid email'],
      index: { unique: true },
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
  },
  { timestamps: true },
)

const saltNum = 10
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
  }

  try {
    const salt = await bcrypt.genSalt(saltNum)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    if (error instanceof Error) next(error)
  }
})

userSchema.method('validatePassword', async function (password: string) {
  return await bcrypt.compare(password, this.password)
})

export default model<UserDocument, UserModel>('User', userSchema)

export interface NormalizeUser {
  email: string
  username: string
  id: string
}
