const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const formatMessage = require('../public/utils/messages')
const userRouter = require('./routes/user.js')();
const orderRouter = require('./routes/order.js')();
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require('../public/utils/users')

const serverPort  = 3000
const webSocketPort = 8080

const app = express()
const server = http.Server(app)
const server2 = http.Server(app)
const io = socketio(server)
const io2 = socketio(server2)

const botName = 'Chat Bot'

//

// get folder
app.use(express.static(path.join(__dirname, '..', 'public')))

// connect client
io.on('connection', (socket) => {
  console.log('user connected with socket id:', socket.id)

  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room)

    socket.join(user.room)

    // welcome user
    socket.emit('message', formatMessage(botName, 'Bem-Vindo!'))

    //broadcast to all clients except the one that is connecting
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, ` ${user.username} entrou na sala.`)
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
        formatMessage(botName, ` ${user.username} saiu da sala.`)
      )
    }
  })
})

// connect client 2
io2.on('connection', (socket) => {
  console.log('user connected with socket id:', socket.id)

  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room)

    socket.join(user.room)

    // welcome user
    socket.emit('message', formatMessage(botName, 'Bem-Vindo!'))

    //broadcast to all clients except the one that is connecting
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, ` ${user.username} entrou na sala.`)
      )

    // send users and room info
    io2.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room),
    })
  })

  // Listen chat message
  socket.on('chatMessage', (msg) => {
    console.log('Chat message: ', msg)

    const user = getCurrentUser(socket.id)
    io2.to(user.room).emit('message', formatMessage(user.username, msg))
  })

  // ON disconnect
  socket.on('disconnect', () => {
    console.log('user disconnected with socket id:', socket.id)

    const user = userLeave(socket.id)

    if (user) {
      io2.to(user.room).emit(
        'message',
        formatMessage(botName, ` ${user.username} saiu da sala.`)
      )
    }
  })
})

//
app.use(userRouter);
app.use(orderRouter);

const fs = require('fs');
/* backslash for windows, in unix it would be forward slash */
const routes_directory = require('path').resolve(__dirname) + '/routes/'; 

fs.readdirSync(routes_directory).forEach(route_file => {
  try {
    app.use('/', require(routes_directory + route_file)());
  } catch (error) {
    console.log(`Encountered Error initializing routes from ${route_file}`);
    console.log(error);
  }
});

//

server.listen(serverPort, () => console.log(`Server is running on port ${serverPort}`))

server2.listen(webSocketPort, () => {
  console.log(`My app listening at http://localhost:${webSocketPort}`);
});