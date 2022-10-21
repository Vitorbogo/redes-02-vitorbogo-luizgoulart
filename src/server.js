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

const botName = 'Chat Bot'

// get folder
app.use(express.static(path.join(__dirname, '..', 'public')))

// connect client
io.on('connection', (socket) => {
  console.log('user connected with socket id:', socket.id)

  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room)

    socket.join(user.room)

    // welcome user
    socket.emit('message', formatMessage(botName, 'Welcome!'))

    //broadcast to all clients except the one that is connecting
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, ` ${user.username} has joined the chat`)
      )

    // send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room),
    })
  })

  // Listen chat message
  socket.on('chatMessage', (msg) => {
    console.log('Chat message: ', msg)

    const user = getCurrentUser(socket.id)
    io.to(user.room).emit('message', formatMessage(user.username, msg))
  })

  // ON disconnect
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

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
