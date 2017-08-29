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
  return $.ajax({
    url: config.apiOrigin + '/games/' + data.game.id,
    method: 'GET',
    headers: {
      Authorization: 'Token token=' + store.user.token
    }
  })
}

const postWantedGame = function (data) {
  return $.ajax({
    url: config.apiOrigin + '/wanted_games',
    method: 'POST',
    headers: {
      Authorization: 'Token token=' + store.user.token
    },
    data
  })
}

const deleteWantedGame = function (data) {
  return $.ajax({
    url: config.apiOrigin + '/wanted_games/' + data.wanted_game.id,
    method: 'DELETE',
    headers: {
      Authorization: 'Token token=' + store.user.token
    }
  })
}

const indexWantedGames = function () {
  return $.ajax({
    url: config.apiOrigin + '/wanted_games',
    method: 'GET',
    headers: {
      Authorization: 'Token token=' + store.user.token
    }
  })
}

const showWantedGame = function (data) {
  return $.ajax({
    url: config.apiOrigin + '/wanted_games/' + data.wanted_game.id,
    method: 'GET'
  })
}

module.exports = {
  indexGames,
  showGame,
  postWantedGame,
  deleteWantedGame,
  indexWantedGames,
  showWantedGame
}
