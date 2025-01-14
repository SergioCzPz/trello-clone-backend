import type { NextFunction, Response } from 'express'
import BoardModel from '../models/board'
import type { ReqWithBody, ReqWithUser } from '../types/request'
import type { BoardRequest } from '../types/board.interface'

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
