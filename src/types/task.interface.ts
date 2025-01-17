import type { ObjectId, Document } from 'mongoose'

export interface Task {
  title: string
  description?: string
  createdAt: Date
  updateAt: Date
  userId: ObjectId
  boardId: ObjectId
  columnId: ObjectId
}

export interface TaskDocument extends Document, Task {}
