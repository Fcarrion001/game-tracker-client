const getFormFields = require('../../lib/get-form-fields')
const api = require('./api')
const ui = require('./ui')

const addHandlers = () => {
  $('#index-games').on('submit', onIndexGames)
  $('#show-game').on('submit', onShowGame)
  $('#index-wanted-games').on('submit', onIndexWantedGames)
  $('#show-wanted-game').on('submit', onShowWantedGame)
  $('.content').on('submit', '#post-wanted-game', onPostWantedGame)
  $('.content').on('submit', '#delete-wanted-game', onDeleteWantedGame)
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

module.exports = {
  addHandlers
}
