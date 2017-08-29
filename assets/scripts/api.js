'use strict'

const store = require('./store')
const config = require('./config')

// ajax request GET to games
const indexGames = function () {
  return $.ajax({
    url: config.apiOrigin + '/games',
    method: 'GET',
    headers: {
      Authorization: 'Token token=' + store.user.token
    }
  })
}

const showGame = function (data) {
  console.log('this is data', data)
  console.log('data.id = ', data.id)
  return $.ajax({
    url: config.apiOrigin + '/games/' + data.game.id,
    method: 'GET'
  })
}

module.exports = {
  indexGames,
  showGame
}
