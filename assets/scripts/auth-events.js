'use strict'

const getFormFields = require('../../lib/get-form-fields')
const api = require('./auth-api')
const ui = require('./ui')

const addHandlers = () => {
  $('#sign-up').on('submit', onSignUp)
  $('#sign-in').on('submit', onSignIn)
  $('#change-password').on('submit', onChangePassword)
  $('#sign-out').on('submit', onSignOut)
}

const onSignUp = function (event) {
  event.preventDefault()
  const data = getFormFields(this)

  api.signUp(data)
    .done([ui.signUpSuccess,
      function (response) {
        api.signIn(data)
          .done(ui.signInSuccess)
      }
    ])
    .catch(ui.signUpFailure)
}

// function for signing in
const onSignIn = function (event) {
  const data = getFormFields(this)
  event.preventDefault()
  api.signIn(data)
    .then(ui.signInSuccess)
    .catch(ui.signInFailure)
}

const onChangePassword = function (event) {
  const data = getFormFields(this)
  event.preventDefault()
  api.changePassword(data)
    .then(ui.changePasswordSuccess)
    .catch(ui.changePasswordFailure)
}

const onSignOut = function (event) {
  const data = getFormFields(this)
  event.preventDefault()

  api.signOut(data)
    .then(ui.signOutSuccess)
}

module.exports = {
  addHandlers
}
