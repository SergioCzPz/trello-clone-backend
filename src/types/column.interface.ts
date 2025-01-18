import type { ObjectId, Document } from 'mongoose'

export interface Column {
  title: string
  createdAt: Date
  updateAt: Date
  userId: ObjectId
  boardId: ObjectId
}

export interface ColumnDocument extends Document, Column {}

export interface ColumnDelete {
  boardId: string
  columnId: string
}

export interface ColumnUpdate extends ColumnDelete {
  fields: {
    title: string
  }
}
