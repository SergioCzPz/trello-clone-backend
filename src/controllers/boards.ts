import type { NextFunction, Response } from 'express'
import BoardModel from '../models/board'
import type { ReqWithUser } from '../types/request'

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
