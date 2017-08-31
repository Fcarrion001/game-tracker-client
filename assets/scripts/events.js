const getFormFields = require('../../lib/get-form-fields')
const api = require('./api')
const ui = require('./ui')
const $ = require('jquery')
const dt = require('datatables.net')

const addHandlers = () => {
  $('#index-games').on('submit', onIndexGames)
  $('#show-game').on('submit', onShowGame)
  $('#index-wanted-games').on('submit', onIndexWantedGames)
  $('#show-wanted-game').on('submit', onShowWantedGame)
  $('.content').on('submit', '#post-wanted-game', onPostWantedGame)
  $('.content').on('submit', '#delete-wanted-game', onDeleteWantedGame)
  $('#index-api-games').on('submit', onIndexApiGames)
  $('#table_id').on('click', 'tbody', onShowApiGame)
}

  // $(document).ready(function () {
  //   $('#table_id').DataTable()
  // })
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
  event.preventDefault()
  api.indexApiGames()
    .then(ui.indexApiGamesSuccess)
    .catch(ui.indexApiGamesFailure)
}

const onShowApiGame = function (event) {
  event.preventDefault()
  const data = $(event.target).parent().attr('id')
  console.log('data is ', data)
  console.log('event.target', $(event.target).parent().attr('id'))
  api.showApiGame(data)
    .then((data) => {
      console.log('this is data ', data)
      return data
    })
    .then(ui.showApiGameSuccess)
    .catch(ui.showApiGameFailure)
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
