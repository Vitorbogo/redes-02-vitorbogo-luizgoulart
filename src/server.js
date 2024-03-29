const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const formatMessage = require('../public/utils/messages')
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require('../public/utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const address = '0.0.0.0' // or 'localhost'

const botName = 'Chat Bot'

app.use(express.static(path.join(__dirname, '..', 'public')))

io.on('connection', (socket) => {
  console.log('user connected with socket id:', socket.id)

  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room)

    socket.join(user.room)

    socket.emit('message', formatMessage(botName, 'Welcome!'))

    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, ` ${user.username} has joined the chat`)
      )

    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room),
    })
  })

  socket.on('chatMessage', (msg) => {
    console.log('Chat message: ', msg)

    const user = getCurrentUser(socket.id)
    io.to(user.room).emit('message', formatMessage(user.username, msg))
  })

  socket.on('disconnect', () => {
    console.log('user disconnected with socket id:', socket.id)

    const user = userLeave(socket.id)

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, ` ${user.username} has left the chat`)
      )
    }
  })
})

const PORT = 3000

server.listen(PORT, address, () =>
  console.log(`Server is running on port ${PORT}`)
)
