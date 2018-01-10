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

const viewAuthForm = function (event) {
  if (event.target.text === 'SignIn') {
    $('#sign-in').show()
    $('#sign-up').hide()
  } else if (event.target.text === 'SignUp') {
    $('#sign-up').show()
    $('#sign-in').hide()
  }
}
const showPasswordChange = function () {
  $('#change-password').show()
  $('.pwd-ch-cancel').show()
}
const cancelPasswordChange = function () {
  $('#pw-ch').val('')
  $('#change-password').hide()
  $('.pwd-ch-cancel').hide()
}

const onSignUp = function (event) {
  event.preventDefault()
  const data = getFormFields(this)

  authApi.signUp(data)
  .done([ui.signUpSuccess,
    function (response) {
      authApi.signIn(data)
    .then(ui.signInSuccess)
    .then((data) => api.indexApiGames(store.user))
    .then((data) => {
      return data
    })
    .then((data) => {
    // convert epoch date format to a user-friendly format
      data.map(function (elem) {
        elem.first_release_date = (new Date(elem.first_release_date).toDateString())
      })
      return data
    })
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
  .then((data) => {
    return data
  })
  .then((data) => ui.signInSuccess(data))
  // GET request to populate apiGames table
  .then((data) => api.indexApiGames(store.user))
  .then((data) => {
    return data
  })
  .then((data) => {
  // convert epoch date format to a user-friendly format
    data.map(function (elem) {
      elem.first_release_date = (new Date(elem.first_release_date).toDateString())
    })
    return data
  })
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
// const indexApiGamesSuccess = (data) => {
//   console.log('do we get here')
//   const games = []
//   for (let i = 0; i < data.length; i++) {
//     games.push(data[i])
//   }
//   games.forEach(function (element) {
//     let epochDate = element.first_release_date
//     const date = new Date(epochDate)
//     epochDate = date.toDateString()
//     return
//   })
//   // console.log('data ', data)
//   // console.log('games', games)
//   const table = $('#table_id').DataTable()
//   table({
//     data: data,
//     rowId: 'id',
//     columns: [
//     {data: 'name'},
//     {data: 'first_release_date'},
//     {data: 'id'}
//     ]
//   })
//   $('#table_id tbody').on('click', 'tr', function () {
//     if ($(this).hasClass('selected')) {
//       $(this).removeClass('selected')
//     } else {
//       table.$('tr.selected').removeClass('selected')
//       $(this).addClass('selected')
//     }
//   })
//   $('#button').click(function() {
//     table.row('.selected').remove().draw()
//   })
//   const showGamesHTML = showGamesTemplate({
//     game: games
//   })
//   $('#table_id').append(showGamesHTML)
//   store.game = games
//   console.log('store.games ', store.games)
// }
module.exports = {
  addHandlers
}
