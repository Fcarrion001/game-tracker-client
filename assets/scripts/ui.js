const store = require('./store')
const showGamesTemplate = require('./templates/games.hbs')
const showWantedGamesTemplate = require('./templates/wanted-games.hbs')
const showApiGamesTemplate = require('./templates/api-games.hbs')
const inputValue = (target) => $(target).val()

const signUpSuccess = (data) => {
  store.user = data.user
}

const signUpFailure = () => {
  // on error check to see if the password value and password confirmation value match
  if (inputValue('.signUp-email') === '' || inputValue('.signUp-pw') === '' || inputValue('.signUp-pw-conf') === '') {
    $('.signUp-error').text('Please fill in all fields prior to submission')
  } else if ($('.signUp-pw').val() !== $('.signUp-pw-conf').val()) {
  // if they do not match tell the user what went wrong
    $('.signUp-error').text('Sorry, the passwords you entered do not match. Please try again')
  } else {
    // if they do match the email must be taken
    // tell the user the email is taken already
    $('.signUp-error').text('Sorry, that user already exist')
  }
  // clear the input fields so that the user can start fresh
  $('.clear-input').val('')
  // clear sign-in error message so that only the most recent error is displayed
  $('.signIn-error').text('')
}

const signInSuccess = (data) => {
  store.user = data.user
  $('.not-signed-in').show()
  $('#sign-in').hide()
  $('#sign-up').hide()
  // make sure only the most recent error is being displayed
  $('.signUp-failure').text('')
}

const signInFailure = () => {
  $('.signIn-error').text('Whoops, user does not exist or password is incorrect')
  $('.clear-input').val('')
  $('.signUp-error').text('')
}
const changePasswordSuccess = (data) => {
  $('.ch-pw').val('')
  // get rid of error message if one exists
  $('.ch-pw-error').text('')
}

const changePasswordFailure = (data) => {
  $('.ch-pw-error').text('Incorrect password or old and new passwords match')
  // clear input fields for re-entry
  $('.ch-pw').val('')
}

const signOutSuccess = () => {
  $('.content').html('')
  $('.not-signed-in').hide()
  $('#sign-up').show()
  $('#sign-in').show()
  $('.signUp-error').text('')
  $('.signIn-error').text('')
  $('.clear-input').val('')
}

const indexGamesSuccess = (data) => {
  $('.content').html('')
  const showGamesHTML = showGamesTemplate({ games: data.games })
  $('.content').append(showGamesHTML)
  store.games = data.games
  console.log('store.game = ', store.games)
}

const indexGamesFailure = (error) => console.log(error)

const showGameSuccess = (data) => {
  console.log(data)
}
const showGameFailure = (error) => console.log(error)

const postWantedGameSuccess = (data) => {
  store.game_id = data.wanted_game.game_id
  console.log(data)
}
const postWantedGameFailure = (error) => console.log(error)

const deleteWantedGameSuccess = (data) => console.log(data)

const deleteWantedGameFailure = (error) => console.log(error)

const indexWantedGamesSuccess = (data) => {
  $('.content').html('')
  console.log(data)
  const showWantedGamesHTML = showWantedGamesTemplate({ wanted_games: data.wanted_games })
  $('.content').append(showWantedGamesHTML)
  store.wanted_games = data.wanted_games
  console.log('store.game = ', store.wanted_games)
}
const indexWantedGamesFailure = (error) => console.log(error)

const showWantedGameSuccess = (data) => console.log(data)

const showWantedGameFailure = (error) => console.log(error)

const indexApiGamesSuccess = (data) => {
  const games = []
  for (let i = 0; i < data.length; i++) {
    games.push(data[i])
  }
  console.log('games[0][1]')
  games.forEach(function (element) {
    element.first_release_date
    const date = new Date(element.first_release_date)
    element.first_release_date = date.toDateString()
    return
  })
  const showApiGamesHTML = showApiGamesTemplate({ games: games })
  $('.content').append(showApiGamesHTML)
  store.games = games
  console.log('store.games ', store.games)
}
const indexApiGamesFailure = (error) => console.log(error)

module.exports = {
  signUpSuccess,
  signUpFailure,
  signInSuccess,
  signInFailure,
  changePasswordSuccess,
  changePasswordFailure,
  signOutSuccess,
  indexGamesSuccess,
  indexGamesFailure,
  showGameSuccess,
  showGameFailure,
  postWantedGameSuccess,
  postWantedGameFailure,
  deleteWantedGameSuccess,
  deleteWantedGameFailure,
  indexWantedGamesSuccess,
  indexWantedGamesFailure,
  showWantedGameSuccess,
  showWantedGameFailure,
  indexApiGamesSuccess,
  indexApiGamesFailure
}
