const users = []

// entra no chat
function userJoin(id, username, room) {
  const user = { id, username, room }

  users.push(user)

  return user
}

// pega o usuário atual
function getCurrentUser(id) {
  return users.find((user) => user.id === id)
}

// usuário sai do chat
function userLeave(id) {
  const index = users.findIndex((user) => user.id === id)

  if (index !== -1) {
    // array[0] para retornar apenas o usuário desejado
    return users.splice(index, 1)[0]
  }
}

// pega usuarios da sala
function getRoomUsers(room) {
  return users.filter((user) => user.room === room)
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
}
