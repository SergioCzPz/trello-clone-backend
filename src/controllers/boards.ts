import type { NextFunction, Response, Request } from 'express'
import BoardModel from '../models/board'
import type { ReqWithBody, ReqWithUser } from '../types/request'
import type { BoardData, BoardRequest, BoardUpdate } from '../types/board.interface'
import type { Server } from 'socket.io'
import type { SocketUser } from '../types/socket.interface'
import { SocketEventsEnum } from '../types/socketEvents.enum'
import { getErrorMessage } from '../helper/socket.error'

const UnauthtorizedCode = 401

export const getBoards = async (req: ReqWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user === undefined) {
      res.sendStatus(UnauthtorizedCode)
      return
    }
    const boards = await BoardModel.find({ userId: req.user.id })
    res.send(boards)
  } catch (error) {
    next(error)
  }
}

export const createBoard = async (req: ReqWithBody<BoardRequest>, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user === undefined) {
      res.sendStatus(UnauthtorizedCode)
      return
    }
    const newBoard = new BoardModel({
      title: req.body.title,
      userId: req.user._id,
    })

    const savedBoard = await newBoard.save()

    res.send(savedBoard)
  } catch (error) {
    next(error)
  }
}

export const getBoard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      params: { boardId },
    } = req
    const board = await BoardModel.findOne({ _id: boardId })
    res.send(board)
  } catch (error) {
    next(error)
  }
}

export const joinBoard = async (io: Server, socket: SocketUser, data: BoardData): Promise<void> => {
  await socket.join(data.boardId)
}

export const leaveBoard = async (io: Server, socket: SocketUser, data: BoardData): Promise<void> => {
  await socket.leave(data.boardId)
}

export const updateBoard = async (io: Server, socket: SocketUser, data: BoardUpdate): Promise<void> => {
  try {
    if (socket.user === undefined) {
      socket.emit(SocketEventsEnum.boardsUpdateFailure, 'User is not authorize')
      return
    }

    const updatedBoard = await BoardModel.findByIdAndUpdate(data.boardId, data.fields, { new: true })
    io.to(data.boardId).emit(SocketEventsEnum.boardsUpdateSuccess, updatedBoard)
  } catch (error) {
    socket.emit(SocketEventsEnum.boardsUpdateFailure, getErrorMessage(error))
  }
}

export const deleteBoard = async (io: Server, socket: SocketUser, data: BoardData): Promise<void> => {
  try {
    if (socket.user === undefined) {
      socket.emit(SocketEventsEnum.boardsDeleteFailure, 'User is not authorize')
      return
    }

    await BoardModel.deleteOne({ _id: data.boardId })
    io.to(data.boardId).emit(SocketEventsEnum.boardsDeleteSuccess)
  } catch (error) {
    socket.emit(SocketEventsEnum.boardsDeleteFailure, getErrorMessage(error))
  }
}
