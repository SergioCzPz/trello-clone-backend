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

export interface TaskUpdate {
  boardId: string
  taskId: string
  fields: { title?: string; description?: string; columnId?: string }
}

export interface TaskDelete extends Omit<TaskUpdate, 'fields'> {}
