import type { Document, ObjectId } from 'mongoose'

export interface Board {
  title: string
  createdAt: Date
  updatedAt: Date
  userId: ObjectId
}

export interface BoardDocument extends Board, Document {}
