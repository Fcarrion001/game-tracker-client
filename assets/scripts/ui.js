const store = require('./store')
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
  $('.content').text('')
  $('.not-signed-in').hide()
  $('#sign-up').show()
  $('#sign-in').show()
  $('.signUp-error').text('')
  $('.signIn-error').text('')
  $('.clear-input').val('')
}

const indexGamesSuccess = (data) => console.log(data)

const indexGamesFailure = (error) => console.log(error)

const showGameSuccess = (data) => console.log(data)

const showGameFailure = (error) => console.log(error)

const postWantedGameSuccess = (data) => {
  store.game_id = data.wanted_game.game_id
  console.log(data)
}
const postWantedGameFailure = (error) => console.log(error)

const deleteWantedGameSuccess = (data) => console.log(data)

const deleteWantedGameFailure = (error) => console.log(error)

const indexWantedGamesSuccess = (data) => console.log(data)

const indexWantedGamesFailure = (error) => console.log(error)

const showWantedGameSuccess = (data) => console.log(data)

const showWantedGameFailure = (error) => console.log(error)

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
  showWantedGameFailure
}
