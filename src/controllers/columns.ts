import ColumnModel from '../models/column'
import { SocketEventsEnum } from '../types/socketEvents.enum'
import { getErrorMessage } from '../helper/socket.error'
import type { NextFunction, Response } from 'express'
import type { ReqWithUser } from '../types/request'
import type { Server } from 'socket.io'
import type { ColumnData, SocketUser } from '../types/socket.interface'

const UnauthtorizedCode = 401

export const getColumns = async (req: ReqWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user === undefined) {
      res.sendStatus(UnauthtorizedCode)
      return
    }
    const columns = await ColumnModel.find({ boardId: req.params.boardId })
    res.send(columns)
  } catch (error) {
    next(error)
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- need to return void
export const createColumn = async (io: Server, socket: SocketUser, data: ColumnData) => {
  try {
    if (socket.user === undefined) {
      socket.emit(SocketEventsEnum.columnsCreateFailure, 'User is not authorized')
      return
    }

    const newColumn = new ColumnModel({
      title: data.title,
      boardId: data.boardId,
      userId: socket.user._id,
    })

    const savedColumn = await newColumn.save()

    io.to(data.boardId).emit(SocketEventsEnum.columnsCreateSuccess, savedColumn)
    console.log('savedColumn ', savedColumn)
  } catch (error) {
    socket.emit(SocketEventsEnum.columnsCreateFailure, getErrorMessage(error))
  }
}
