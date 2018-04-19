'use strict'

const store = require('./store')
const config = require('./config')
const ui = require('./ui')
const $ = require('jquery')
const dt = require('datatables.net')

const postGame = function (data) {
  return $.ajax({
    url: config.apiOrigin + '/games',
    method: 'POST',
    headers: {
      Authorization: 'Token token=' + store.user.token
    },
    data
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
    url: config.apiOrigin + '/wanted_games/' + data,
    method: 'DELETE',
    headers: {
      Authorization: 'Token token=' + store.user.token
    }
  })
}

const indexApiGames = function (data) {
  return $.ajax({
    url: config.apiOrigin + '/api-games',
    method: 'GET',
    headers: {
      Authorization: 'Token token=' + data.token
    }
  })
}
// use dataTables to make the GET request and populate the table simultaneously
const indexGames = function () {
  $('#game_table_id').DataTable({
    // use dataTables to make ajax call
    ajax: {
      url: config.apiOrigin + '/games',
      dataSrc: 'games'
    },
    rowId: 'id',
    retrieve: true,
    columns: [
      { data: 'game_name' },
      { data: 'release_date' },
      { data: 'platform' }
    ]
  })
// this callback holds the
  ui.indexGamesSuccess()
}

const indexWantedGames = function (data) {
  // make Get request to populate user's wishlist dataTable
    $('#wanted_table_id').DataTable({
      ajax: {
        url: config.apiOrigin + '/wanted_games',
        dataSrc: 'wanted_games',
        headers: {
          Authorization: 'Token token=' + data.token
        }
      },
      rowId: 'id',
      retrieve: true,
      'columnDefs': [
        {'width': '20%', 'targets': '_all'}
      ],
      columns: [
        { data: 'game.game_name' },
        { data: 'game.release_date' },
        { data: 'game.platform' }
      ]
    })
}
// ajax request GET to games
// const indexGames = function () {
//   return $.ajax({
//     url: config.apiOrigin + '/games',
//     method: 'GET',
//     headers: {
//       Authorization: 'Token token=' + store.user.token
//     }
//   })
// }

// const showGame = function (data) {
//   return $.ajax({
//     url: config.apiOrigin + '/games/' + data.game.id,
//     method: 'GET',
//     headers: {
//       Authorization: 'Token token=' + store.user.token
//     }
//   })
// }

// const indexWantedGames = function () {
//   return $.ajax({
//     url: config.apiOrigin + '/wanted_games',
//     method: 'GET',
//     headers: {
//       Authorization: 'Token token=' + store.user.token
//     }
//   })
// }

// const showWantedGame = function (data) {
//   return $.ajax({
//     url: config.apiOrigin + '/wanted_games/' + data.wanted_game.id,
//     method: 'GET'
//   })
// }

// const showApiGame = function (data) {
//   return $.ajax({
//     url: config.apiOrigin + '/api-games/' + data,
//     method: 'GET',
//     headers: {
//       Authorization: 'Token token=' + store.user.token
//     }
//   })
// }

module.exports = {
  indexGames,
  // showGame,
  indexWantedGames,
  // showWantedGame,
  // showApiGame,
  postGame,
  postWantedGame,
  deleteWantedGame,
  indexApiGames
}
