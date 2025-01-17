import type { Socket } from 'socket.io'
import type { UserDocument } from './user.interface'

export interface SocketUser extends Socket {
  user?: UserDocument
}

export interface ColumnData {
  boardId: string
  title: string
}

export interface TaskData extends ColumnData {
  columnId: string
  description?: string
}
