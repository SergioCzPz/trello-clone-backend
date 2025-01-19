import express, { type NextFunction, type Response } from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import mongoose, { type ConnectOptions } from 'mongoose'
import authMiddleware from './middlewares/auth'
import UserModel from './models/user'
import { createServer } from 'http'
import { secret } from './config'
import { Server } from 'socket.io'
import { SocketEventsEnum } from './types/socketEvents.enum'
import * as usersControllers from './controllers/users'
import * as boardsControllers from './controllers/boards'
import * as columnsControllers from './controllers/columns'
import * as tasksControllers from './controllers/tasks'
import type { User, UserCredentials, UserToken } from './types/user.interface'
import type { ReqWithBody, ReqWithUser } from './types/request'
import type { BoardData, BoardRequest, BoardUpdate } from './types/board.interface'
import type { ColumnData, SocketUser, TaskData } from './types/socket.interface'
import type { ColumnDelete, ColumnUpdate } from './types/column.interface'
import type { TaskDelete, TaskUpdate } from './types/task.interface'

const app = express()
// eslint-disable-next-line @typescript-eslint/no-misused-promises -- check if middleware is async
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
})

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

mongoose.set('toJSON', {
  virtuals: true,
  transform: (_, converted) => {
    delete converted._id
  },
})

app.get('/', (req, res) => {
  res.send('API is UP')
})
app.post('/api/users', async (req: ReqWithBody<User>, res: Response, next: NextFunction) => {
  await usersControllers.register(req, res, next)
})
app.post('/api/users/login', async (req: ReqWithBody<UserCredentials>, res: Response, next: NextFunction) => {
  await usersControllers.login(req, res, next)
})
app.get('/api/user', authMiddleware, usersControllers.currentUser)
app.get('/api/boards', authMiddleware, boardsControllers.getBoards)
app.post('/api/boards', authMiddleware, async (req: ReqWithBody<BoardRequest>, res: Response, next: NextFunction) => {
  await boardsControllers.createBoard(req, res, next)
})
app.get('/api/boards/:boardId', authMiddleware, async (req: ReqWithUser, res: Response, next: NextFunction) => {
  await boardsControllers.getBoard(req, res, next)
})
app.get('/api/boards/:boardId/columns', authMiddleware, async (req: ReqWithUser, res: Response, next: NextFunction) => {
  await columnsControllers.getColumns(req, res, next)
})
app.get('/api/boards/:boardId/tasks', authMiddleware, async (req: ReqWithUser, res: Response, next: NextFunction) => {
  await tasksControllers.getTasks(req, res, next)
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises -- Not return a promise
io.use(async (socket: SocketUser, next) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- The token is string
    const token = socket.handshake.auth.token as string

    const [, userToken] = token.split(' ')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- login and register middlewares create UserCredential token
    const data = jwt.verify(userToken, secret) as UserToken

    const user = await UserModel.findById(data.id)

    if (user === null) {
      next(new Error('Authentication error'))
      return
    }
    socket.user = user
    next()
  } catch (error) {
    next(new Error('Authentication error'))
  }
}).on('connection', socket => {
  socket.on(SocketEventsEnum.boardsJoin, async (data: BoardData) => {
    await boardsControllers.joinBoard(io, socket, data)
  })

  socket.on(SocketEventsEnum.boardsLeave, async (data: BoardData) => {
    await boardsControllers.leaveBoard(io, socket, data)
  })

  socket.on(SocketEventsEnum.columnsCreate, async (data: ColumnData) => {
    await columnsControllers.createColumn(io, socket, data)
  })

  socket.on(SocketEventsEnum.tasksCreate, async (data: TaskData) => {
    await tasksControllers.createTask(io, socket, data)
  })

  socket.on(SocketEventsEnum.boardsUpdate, async (data: BoardUpdate) => {
    await boardsControllers.updateBoard(io, socket, data)
  })

  socket.on(SocketEventsEnum.boardsDelete, async (data: BoardData) => {
    await boardsControllers.deleteBoard(io, socket, data)
  })

  socket.on(SocketEventsEnum.columnsDelete, async (data: ColumnDelete) => {
    await columnsControllers.deleteColumn(io, socket, data)
  })

  socket.on(SocketEventsEnum.columnsUpdate, async (data: ColumnUpdate) => {
    await columnsControllers.updateColumn(io, socket, data)
  })

  socket.on(SocketEventsEnum.taskUpdate, async (data: TaskUpdate) => {
    await tasksControllers.updateTask(io, socket, data)
  })

  socket.on(SocketEventsEnum.taskDelete, async (data: TaskDelete) => {
    await tasksControllers.deleteTask(io, socket, data)
  })
})

const port = 4001
const dbConnectOptions: ConnectOptions = {
  user: 'root',
  pass: 'example',
  dbName: 'trello',
}

mongoose
  .connect('mongodb://localhost:27017', dbConnectOptions)
  .then(() => {
    console.log('connected to mongodb')
    httpServer.listen(port, () => {
      console.log(`API is listening on port 4001`)
    })
  })
  .catch((err: unknown) => {
    console.log(err)
  })
