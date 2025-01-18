import type { Document, ObjectId } from 'mongoose'

export interface Board {
  title: string
  createdAt: Date
  updatedAt: Date
  userId: ObjectId
}

export interface BoardDocument extends Board, Document {}

export interface BoardRequest {
  title: string
}

export interface BoardData {
  boardId: string
}

export interface BoardUpdate extends BoardData {
  fields: {
    title: string
  }
}
