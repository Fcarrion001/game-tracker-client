// const getFormFields = require('../../lib/get-form-fields')
const api = require('./api')
const ui = require('./ui')
const $ = require('jquery')
const config = require('./config')
const store = require('./store')
const addHandlers = () => {
  // anything pointing to $('.content') is targeting a button that lives inside
  // a handlebars template.
  $('#post-wanted-game').on('click', onPostWantedGame)
  $('.content').on('click', '#post-wanted-game', onPostWantedGame)
  $('#delete-wanted-game').on('click', onDeleteWantedGame)
  $('.content').on('click', '#delete-wanted-game', onDeleteWantedGame)
  $('#post-game').on('click', onPostGame)
  $('.content').on('click', '#post-game', onPostGame)
  $('#table_id').on('click', 'tbody', ui.indexApiGamesSuccess)
  // using show<Game>Success callbacks to change view to a show on a game
  // when a row is double clicked.
  $('#table_id').on('dblclick', 'tbody', ui.showApiGameSuccess)
  $('#wanted_table_id').on('dblclick', 'tbody', ui.showWantedGameSuccess)
  $('#game_table_id').on('dblclick', 'tbody', ui.showGameSuccess)
  // revert back to the tables view when the back button is clicked.
  $('.content').on('click', '.back-btn', showTables)
  // load games table when document is ready.
  $(document).ready(api.indexGames)
  $(document).ready(hideTables)
}




const onPostGame = function (event) {
  event.preventDefault()
  // format data to be sent to the api
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
  api.postGame(data)
  // reload table and extract id to be used as params for postWantedGame
  .then((data) => ui.postGameSuccess(data))
  .then((game_id) => api.postWantedGame(game_id))
  // reload table
  .then(ui.postWantedGameSuccess)
  // if user added game from the showWantedGame handlebars view, we want to exist
  // the view and go back to the tables view.
  .then(showTables)
  // inform user of problem when an error occurs
  .catch(ui.postWantedGameFailure)
}

// functions that will hide and show the tables.
const hideTables = function () {
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

const onPostWantedGame = function (event) {
  event.preventDefault()
  // retreive game_id
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
