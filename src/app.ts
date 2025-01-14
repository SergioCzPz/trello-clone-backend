import express, { type NextFunction, type Response } from 'express'
import cors from 'cors'
import mongoose, { type ConnectOptions } from 'mongoose'
import authMiddleware from './middlewares/auth'
import { createServer } from 'http'
import { Server } from 'socket.io'
import * as usersControllers from './controllers/users'
import * as boardsControllers from './controllers/boards'
import type { User, UserCredentials } from './types/user.interface'
import type { ReqWithBody } from './types/request'
import type { BoardRequest } from './types/board.interface'

const app = express()
// eslint-disable-next-line @typescript-eslint/no-misused-promises -- check if middleware is async
const httpServer = createServer(app)
const io = new Server(httpServer)

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

io.on('connection', () => {
  console.log('connected')
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
