'use strict'

const store = require('./store')
const config = require('./config')
const $ = require('jquery')
const dt = require('datatables.net')
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

const indexApiGames = function () {
  return $.ajax({
    url: config.apiOrigin + '/api-games',
    method: 'GET',
    headers: {
      Authorization: 'Token token=' + store.user.token
    }
  })
}
const showApiGame = function (data) {
  return $.ajax({
    url: config.apiOrigin + '/api-games/' + data,
    method: 'GET',
    headers: {
      Authorization: 'Token token=' + store.user.token
    }
  })
}

module.exports = {
  indexGames,
  showGame,
  postWantedGame,
  deleteWantedGame,
  indexWantedGames,
  showWantedGame,
  indexApiGames,
  showApiGame
}
