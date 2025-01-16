import type { ObjectId } from 'mongoose'

export interface Column {
  title: string
  createdAt: Date
  updateAt: Date
  userId: ObjectId
  boardId: ObjectId
}

export interface ColumnDocument extends Document, Column {}
