import TaskModel from '../models/task'
import { SocketEventsEnum } from '../types/socketEvents.enum'
import { getErrorMessage } from '../helper/socket.error'
import type { NextFunction, Response } from 'express'
import type { ReqWithUser } from '../types/request'
import type { Server } from 'socket.io'
import type { SocketUser, TaskData } from '../types/socket.interface'
import type { TaskDelete, TaskUpdate } from '../types/task.interface'

const UnauthtorizedCode = 401

export const getTasks = async (req: ReqWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user === undefined) {
      res.sendStatus(UnauthtorizedCode)
      return
    }
    const tasks = await TaskModel.find({ boardId: req.params.boardId })
    res.send(tasks)
  } catch (error) {
    next(error)
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- need to return void
export const createTask = async (io: Server, socket: SocketUser, data: TaskData) => {
  try {
    if (socket.user === undefined) {
      socket.emit(SocketEventsEnum.tasksCreateFailure, 'User is not authorized')
      return
    }

    const newTask = new TaskModel({
      title: data.title,
      boardId: data.boardId,
      userId: socket.user._id,
      columnId: data.columnId,
    })

    const savedTask = await newTask.save()

    io.to(data.boardId).emit(SocketEventsEnum.tasksCreateSuccess, savedTask)
  } catch (error) {
    socket.emit(SocketEventsEnum.tasksCreateFailure, getErrorMessage(error))
  }
}

export const updateTask = async (io: Server, socket: SocketUser, data: TaskUpdate): Promise<void> => {
  try {
    if (socket.user === undefined) {
      socket.emit(SocketEventsEnum.taskUpdateFailure, 'User is not authorize')
      return
    }

    const updatedTask = await TaskModel.findByIdAndUpdate(data.taskId, data.fields, { new: true })
    io.to(data.boardId).emit(SocketEventsEnum.taskUpdateSuccess, updatedTask)
  } catch (error) {
    socket.emit(SocketEventsEnum.taskUpdateFailure, getErrorMessage(error))
  }
}

export const deleteTask = async (io: Server, socket: SocketUser, data: TaskDelete): Promise<void> => {
  try {
    if (socket.user === undefined) {
      socket.emit(SocketEventsEnum.taskDeleteFailure, 'User is not authorize')
      return
    }

    await TaskModel.deleteOne({ _id: data.taskId })
    io.to(data.boardId).emit(SocketEventsEnum.taskDeleteSuccess, data.taskId)
  } catch (error) {
    socket.emit(SocketEventsEnum.taskDeleteFailure, getErrorMessage(error))
  }
}
