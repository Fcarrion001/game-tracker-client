const getFormFields = require('../../lib/get-form-fields')
const api = require('./api')
const ui = require('./ui')
const $ = require('jquery')
const dt = require('datatables.net')
const store = require('./store')
const config = require('./config')

const addHandlers = () => {
  // $(document).ready(function() {
  //   let t = $('#show_table_id').DataTable()
  // })
  $('#index-games').on('submit', onIndexGames)
  $('#show-game').on('submit', onShowGame)
  $('#index-wanted-games').on('submit', onIndexWantedGames)
  $('#show-wanted-game').on('submit', onShowWantedGame)
  $('.content').on('submit', '#post-wanted-game', onPostWantedGame)
  $('.content').on('submit', '#delete-wanted-game', onDeleteWantedGame)
  $('#table_id').on('click', 'tbody', ui.indexApiGamesSuccess)
  $('#create-game').on('submit', onCreateGame)
  $(document).ready(indexGames)
  $(document).ready(hideTables)
}

const indexGames = function () {
  $('#show_table_id').DataTable({
    ajax: {
      url: config.apiOrigin + '/games',
      dataSrc: 'games'
    },
    rowId: 'id',
    retrieve: true,
    columns: [
      { data: 'game_name' },
      { data: 'release_date' },
      { data: 'id' }
    ]
  })
  ui.indexGamesSuccess()
  // const gamesTable = $('#show_table_id').DataTable()
  //
  // $('#show_table_id tbody').on('click', 'tr', function () {
  //   if ($(this).hasClass('selected')) {
  //     $(this).removeClass('selected')
  //   } else {
  //     gamesTable.$('tr.selected').removeClass('selected')
  //     $(this).addClass('selected')
  //   }
  // })
  // $('#show_table_id tbody').on('click', 'tr', function () {
  //   const game = gamesTable.row(this).data()
  //   $('#game-name').val(game.name)
  //   $('#release-date').val(game.first_release_date)
  //   $('#api-id').val(game.id)
  //   console.log('this is game ', game)
  // })
}

const onCreateGame = function (event) {
  event.preventDefault()
  const data = getFormFields(this)
  const apiId = data.game.api_id
  console.log('this is apiId ', apiId)
  console.log('this is data before its sent to the api ', data)
  api.createGame(data)
  .then((data) => {
    return data
  })
  .then((data) => ui.createGameSuccess(data.game.id))
  .then((data) => {
    console.log('this is data after createGameSuccess ', data)
    return data
  })
  .then((data) => api.postWantedGame(data))
  .then(ui.postWantedGameSuccess)
    // .then((data) => ui.createGameSuccess(data))
    .catch(ui.createGamesFailure)
    .then()
}
const onIndexGames = function (event) {
  console.log('it works here')
  event.preventDefault()
  api.indexGames()
    .then(ui.indexGamesSuccess)
    .catch(ui.indexGamesFailure)
}

const onShowGame = function (event) {
  event.preventDefault()
  const data = getFormFields(this)
  api.showGame(data)
    .then(ui.showGameSuccess)
    .catch(ui.showGameFailure)
}

const onIndexWantedGames = function (event) {
  console.log('it works here')
  event.preventDefault()
  api.indexWantedGames()
    .then((data) => {
      console.log('data = ', data)
      return data
    })
    .then((data) => ui.indexWantedGamesSuccess(data))
    .catch(ui.indexWantedGamesFailure)
}

const onShowWantedGame = function (event) {
  event.preventDefault()
  const data = getFormFields(this)
  api.showWantedGame(data)
    .then(ui.showWantedGameSuccess)
    .catch(ui.showWantedGameFailure)
}

const onPostWantedGame = function (event) {
  console.log('it works here')
  event.preventDefault()
  const data = getFormFields(this)
  api.postWantedGame(data)
    .then((data) => ui.postWantedGameSuccess(data))
    .catch(ui.postWantedGamesFailure)
}

const onDeleteWantedGame = function (event) {
  event.preventDefault()
  const data = getFormFields(this)
  api.deleteWantedGame(data)
    .then(ui.deleteWantedGameSuccess)
    .catch(ui.deleteWantedGameFailure)
}

const onIndexApiGames = function (event) {
  console.log('it is working')
  event.preventDefault()
  api.indexApiGames()
    .then(ui.indexApiGamesSuccess)
    .catch(ui.indexApiGamesFailure)
}

const onShowApiGame = function (event) {
  event.preventDefault()
  const data = $(event.target).parent().attr('id')
  console.log('data is ', data)
  console.log('event.target', $(event.target))
  api.showApiGame(data)
    .then((data) => {
      console.log('this is data ', data)
      return data
    })
    .then(ui.showApiGameSuccess)
    .catch(ui.showApiGameFailure)
}

const hideTables = () => {
  $('#table_id').hide()
  $('#show_table_id').hide()
  $('#show_table_id_info').hide()
  $('#table_id_info').hide()
  $('label').hide()
  $('a').hide()
  $('#show_table_id_paginate').hide()
}
// const keys = [1, 'playstation', 2, 'xbox']
// const convert = function (elem) {
//   for (let i = 0; i < keys.length; i++) {
//     if (elem === keys[i]) {
//       elem = keys[i + 1]
//       return elem
//     }
//   }
// }
// let platform = 1
// convert(platform)
module.exports = {
  addHandlers
}
