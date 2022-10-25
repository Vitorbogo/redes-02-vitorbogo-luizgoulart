const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')

// pega username e room apartir do cabecalho da URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
})

const socket = io()

// entra na sala
socket.emit('joinRoom', { username, room })

// pega sala e users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room)
  outputUsers(users)
})

// Msg -> svr
socket.on('message', (message) => {
  console.log(message)
  outputMessage(message)

  //scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight
})

//submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const msg = e.target.elements.msg.value

  console.log('Chat message: ', msg)
  socket.emit('chatMessage', msg)

  //limpa input
  e.target.elements.msg.value = ''
  e.target.elements.msg.focus()
})

// output message -> DOM
function outputMessage(message) {
  const div = document.createElement('div')
  div.classList.add('message')
  div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p>
  <p class="text">
    ${message.text}
  </p>`
  document.querySelector('.chat-messages').appendChild(div)
}

// room name -> DOM
function outputRoomName(room) {
  roomName.innerText = room
}

// User -> DOM
function outputUsers(users) {
  userList.innerHTML = `
    ${users.map((user) => `<li>${user.username}</li>`).join('')}
  `
}
