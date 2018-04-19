'use strict'
const getFormFields = require('../../lib/get-form-fields')
const authApi = require('./auth-api')
const api = require('./api')
const ui = require('./ui')
const $ = require('jquery')
const store = require('./store')

const addHandlers = () => {
  $('#sign-up').on('submit', onSignUp)
  $('#sign-in').on('submit', onSignIn)
  $('#change-password').on('submit', onChangePassword)
  $('.navbar').on('click', '#sign-out', onSignOut)
  $('.navbar').on('click', '#sign-in-btn', viewAuthForm)
  $('.navbar').on('click', '#sign-up-btn', viewAuthForm)
  $('.navbar').on('click', '#ch-pwd-btn', showPasswordChange)
  $('.pwd-ch-cancel').on('click', cancelPasswordChange)
}

// function that displays and hides sign-up and sign-in auth forms when a users
// clicks respective buttons in the navbar.
const viewAuthForm = function (event) {
  if (event.target.text === 'SignIn') {
    $('#sign-in').show()
    $('#sign-up').hide()
  } else if (event.target.text === 'SignUp') {
    $('#sign-up').show()
    $('#sign-in').hide()
  }
}
// shows password auth form when change password is clicked
const showPasswordChange = function () {
  $('#change-password').show()
  $('.pwd-ch-cancel').show()
}
// hides password auth form when cancel button is clicked
const cancelPasswordChange = function () {
  $('#pw-ch').val('')
  $('#change-password').hide()
  $('.pwd-ch-cancel').hide()
}
// api provides dates in epoch format. This function will be used as a callback
// before the apiGames table is loaded
const dateFormatChange = function (data) {
  data.map(function (elem) {
    elem.first_release_date = new Date(elem.first_release_date).toDateString()
  })
  return
}

const onSignUp = function (event) {
  event.preventDefault()
  // retieve from data
  const data = getFormFields(this)
  authApi.signUp(data)
    // automatic sign-in upon signing up
    .done([ui.signUpSuccess,
    function (response) {
      authApi.signIn(data)
    .then(ui.signInSuccess)
    // GET request to retrieve data and populate table
    .then(() => api.indexWantedGames(store.user))
    // add classActivator function for row selection
    .then(ui.indexWantedGamesSuccess)
    // retrieve apiGames upon successful sign in
    //request requires user authentication
    .then(() => api.indexApiGames(store.user))
    .then((data) => {
    // convert epoch date format to a user-friendly format
      dateFormatChange(data)
      return data
    })
    // generate table
    .then(ui.indexApiGamesSuccess)
    .catch(ui.indexApiGamesFailure)
    }
  ])
    .catch(ui.signUpFailure)
}

// function for signing in
const onSignIn = function (event) {
  const data = getFormFields(this)
  event.preventDefault()
  authApi.signIn(data)
  .then((data) => ui.signInSuccess(data))
  // GET request to retrieve data and populate table
  .then(() => api.indexWantedGames(store.user))
  // add classActivator function for row selection
  .then(ui.indexWantedGamesSuccess)
  // GET request to retrieve data for table population
  .then(() => api.indexApiGames(store.user))
  .then((data) => {
  // convert epoch date format to a user-friendly format
    dateFormatChange(data)
    return data
  })
  // populate apiGames table and add class activator function
  .then(ui.indexApiGamesSuccess)
  .catch(ui.indexApiGamesFailure)
}

const onChangePassword = function (event) {
  const data = getFormFields(this)
  event.preventDefault()
  authApi.changePassword(data)
    .then(ui.changePasswordSuccess)
    .catch(ui.changePasswordFailure)
}

const onSignOut = function (event) {
  const data = getFormFields(this)
  event.preventDefault()
  authApi.signOut(data)
    .then(ui.signOutSuccess)
}


module.exports = {
  addHandlers
}
