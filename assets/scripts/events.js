// const getFormFields = require('../../lib/get-form-fields')
const api = require('./api')
const ui = require('./ui')
const $ = require('jquery')
const config = require('./config')
const store = require('./store')
const addHandlers = () => {
  // $('#index-games').on('submit', onIndexGames)
  // $('#show-game').on('submit', onShowGame)
  // $('#index-wanted-games').on('submit', onIndexWantedGames)
  // $('#show-wanted-game').on('submit', onShowWantedGame)
  $('#post-wanted-game').on('click', onPostWantedGame)
  $('.content').on('click', '#post-wanted-game', onPostWantedGame)
  $('#delete-wanted-game').on('click', onDeleteWantedGame)
  $('.content').on('click', '#delete-wanted-game', onDeleteWantedGame)
  $('#create-game').on('click', onCreateGame)
  $('.content').on('click', '#create-game', onCreateGame)
  $('#table_id').on('click', 'tbody', ui.indexApiGamesSuccess)
  // using show<Game>Success callbacks to trigger handlebars when a row
  // is double clicked
  $('#table_id').on('dblclick', 'tbody', ui.showApiGameSuccess)
  $('#wanted_table_id').on('dblclick', 'tbody', ui.showWantedGameSuccess)
  $('#game_table_id').on('dblclick', 'tbody', ui.showGameSuccess)
  $('.content').on('click', '.back-btn', showTables)
  $(document).ready(indexGames)
  $(document).ready(hideTables)
}

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

const onCreateGame = function (event) {
  event.preventDefault()
  // const data = getFormFields(this)
  const data = {
    game: {
      api_id: store.game.id,
      game_name: store.game.name,
      release_date: store.game.first_release_date,
      summary: store.game.summary,
      storyline: store.game.stroryline,
      cloudinary_id: store.game.cover.cloudinary_id,
      screenshot: 'https:' + store.game.cover.url,
      platform: 'playstation',
      url: store.game.url
    }
  }
  api.createGame(data)
  // .then((data) => {
  //   return data
  // })
  .then((data) => ui.createGameSuccess(data))
  .then((data) => {
    return data
  })
  .then((data) => api.postWantedGame(data))
  .then(ui.postWantedGameSuccess)
  .then(showTables)
  .catch(ui.postWantedGameFailure)
}

// function that will hide and show the tables when a user is signing in or out,
// as well as when they want to trigger a show on an individual game, or go back
// to the tables from a show.
// let tablesHidden = false
const hideTables = function () {
  // if (tablesHidden === false) {
  $('#table_id').hide()
  $('#game_table_id').hide()
  $('#wanted_table_id').hide()
  $('#game_table_id_info').hide()
  $('#table_id_info').hide()
  $('label').hide()
  $('a').hide()
  $('#game_table_id_paginate').hide()
  $('.not-signed-in').hide()
  $('.before-sign-in').show()
  $('.navbar-brand').show()
  $('.auth').hide()
  $('.pwd-ch-cancel').hide()
  $('.content').empty()
}

const showTables = function () {
  $('.content').text('')
  $('#table_id').show()
  $('#game_table_id').show()
  $('#wanted_table_id').show()
  $('#wanted_table_id_info').show()
  $('#game_table_id_info').show()
  $('#table_id_info').show()
  $('label').show()
  $('a').show()
  $('#game_table_id_paginate').show()
  $('.not-signed-in').show()
  $('.after-sign-in').show()
  $('.before-sign-in').hide()
}
// const hideTables = () => {
//   $('#table_id').hide()
//   $('#game_table_id').hide()
//   $('#wanted_table_id').hide()
//   $('#game_table_id_info').hide()
//   $('#table_id_info').hide()
//   $('label').hide()
//   $('a').hide()
//   $('#game_table_id_paginate').hide()
//   $('.not-signed-in').hide()
// }

const onPostWantedGame = function (event) {
  event.preventDefault()
  // const data = getFormFields(this)
  const data = {
    wanted_game: {
      game_id: store.game.id
    }
  }
  api.postWantedGame(data)
  .then((data) => ui.postWantedGameSuccess(data))
  .then(showTables)
  .catch(ui.postWantedGameFailure)
}

const onDeleteWantedGame = function (event) {
  event.preventDefault()

  // const data = getFormFields(this)
  const data = store.game.id

  api.deleteWantedGame(data)
  .then(ui.deleteWantedGameSuccess)
  .then(showTables)
  .catch(ui.deleteWantedGameFailure)
}
// const onIndexGames = function (event) {
//   console.log('it works here')
//   event.preventDefault()
//   api.indexGames()
//     .then(ui.indexGamesSuccess)
//     .catch(ui.indexGamesFailure)
// }

// const onShowGame = function (event) {
//   event.preventDefault()
//   const data = getFormFields(this)
//   api.showGame(data)
//     .then(ui.showGameSuccess)
//     .catch(ui.showGameFailure)
// }

// const onIndexWantedGames = function (event) {
//   console.log('it works here')
//   event.preventDefault()
//   api.indexWantedGames()
//     .then((data) => {
//       console.log('data = ', data)
//       return data
//     })
//     .then((data) => ui.indexWantedGamesSuccess(data))
//     .catch(ui.indexWantedGamesFailure)
// }

// const onShowWantedGame = function (event) {
//   event.preventDefault()
//   const data = getFormFields(this)
//   api.showWantedGame(data)
//     .then(ui.showWantedGameSuccess)
//     .catch(ui.showWantedGameFailure)
// }

// const onIndexApiGames = function (event) {
//   console.log('it is working')
//   event.preventDefault()
//   api.indexApiGames()
//     .then(ui.indexApiGamesSuccess)
//     .catch(ui.indexApiGamesFailure)
// }

// const onShowApiGame = function (event) {
//   event.preventDefault()
//   const data = $(event.target).parent().attr('id')
//   console.log('data is ', data)
//   console.log('event.target', $(event.target))
//   api.showApiGame(data)
//     .then((data) => {
//       console.log('this is data ', data)
//       return data
//     })
//     .then(ui.showApiGameSuccess)
//     .catch(ui.showApiGameFailure)
// }

module.exports = {
  addHandlers
}
