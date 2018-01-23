const store = require('./store')
const showGamesTemplate = require('./templates/games.hbs')
const showWantedGameTemplate = require('./templates/show-wanted-game.hbs')
const showApiGamesTemplate = require('./templates/api-games.hbs')
const $ = require('jquery')
const dt = require('datatables.net')
const config = require('./config')
const inputValue = (target) => $(target).val()
// variable used to toggle visibility of data and input fields on the page when
// user signs in and out.
let tablesHidden = true
// function that takes a table id as a parameter to active the class 'selected'
// on clicked rows
const classActivator = function (tableId) {
  const table = $('#' + tableId).DataTable()

  $('#' + tableId + ' tbody').on('click', 'tr', function () {
    if ($(this).hasClass('selected')) {
      $(this).removeClass('selected')
      // clear message whenever a row is clicked
      $('.message').text('')
    } else {
      table.$('tr.selected').removeClass('selected')
      $(this).addClass('selected')
      $('.message').text('')
    }
  })
  $('#' + tableId + ' tbody').on('click', 'tr', function () {
    // retrieve data from selected row
    const game = table.row(this).data()
    // depending on the table, the data will be nested differently so it is
    // stored here so that the individual success callbacks containing handlebars
    // can access the data without redundant code.
    store.game = game
  })
}

const viewGameOnly = function () {
  $('#table_id').hide()
  $('#game_table_id').hide()
  $('#wanted_table_id').hide()
  $('#wanted_table_id_info').hide()
  $('#game_table_id_info').hide()
  $('#table_id_info').hide()
  $('label').hide()
  $('a').hide()
  $('#game_table_id_paginate').hide()
  $('.not-signed-in').hide()
  $('.navbar-brand').show()
  $('.after-sign-in').show()
}

const toggleTables = function () {
  if (tablesHidden === false) {
    $('#table_id').hide()
    $('#game_table_id').hide()
    $('#wanted_table_id').hide()
    $('#wanted_table_id_info').hide()
    $('#game_table_id_info').hide()
    $('#table_id_info').hide()
    $('label').hide()
    $('a').hide()
    $('#game_table_id_paginate').hide()
    $('.not-signed-in').hide()
    $('.after-sign-in').hide()
    $('.navbar-brand').show()
    $('.before-sign-in').show()
    $('.auth').hide()

    tablesHidden = true
  } else {
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
    $('.navbar-brand').show()

    tablesHidden = false
  }
}
// dynamically add new game to table by clearing the
// table and making a new ajax call.
const reloadTable = (tableId) => {
  const table = $('#' + tableId).DataTable()
  table.clear().ajax.reload()
}

const signUpSuccess = (data) => {
  store.user = data.user
  return data
}

const signUpFailure = () => {
  // on error check to see if the password value and password confirmation value match
  if (inputValue('.signUp-email') === '' || inputValue('.signUp-pw') === '' || inputValue('.signUp-pw-conf') === '') {
    $('.signUp-error').text('Please fill in all fields prior to submission')
  } else if ($('.signUp-pw').val() !== $('.signUp-pw-conf').val()) {
    // if they do not match tell the user what went wrong
    $('.signUp-error').text('Sorry, the passwords you entered do not match. Please try again')
  } else {
    // if they do match, the email must be taken.
    // Tell the user the email is taken already
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
  toggleTables()
// make Get request to populate user's wishlist dataTable
  $('#wanted_table_id').DataTable({
    ajax: {
      url: config.apiOrigin + '/wanted_games',
      dataSrc: 'wanted_games',
      headers: {
        Authorization: 'Token token=' + store.user.token
      }
    },
    rowId: 'id',
    retrieve: true,
    'columnDefs': [
      {'width': '20%', 'targets': '_all'}
    ],
    columns: [
      { data: 'game.game_name' },
      { data: 'game.release_date' },
      { data: 'game.platform' }
    ]
  })
  classActivator('wanted_table_id')
}

const signInFailure = () => {
  $('.signIn-error').text('Whoops, user does not exist or password is incorrect')
  $('.clear-input').val('')
  $('.signUp-error').text('')
}
const changePasswordSuccess = (data) => {
  $('.ch-pw').val('')
  $('.ch-pw-message').text('Password has been changed')
  $('.auth').hide()
  $('.pwd-ch-cancel').hide()
}

const changePasswordFailure = (data) => {
  $('.ch-pw-message').text('Incorrect password or old and new passwords match')
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
  toggleTables()
  // destroy table so that a old users data is protected and a new users data
  // can be retrieved successfully upon signing in.
  const table = $('#wanted_table_id').DataTable()
  table.destroy()
}

const createGameSuccess = function (game) {
  console.log('this is game', game)
  reloadTable('game_table_id')
  // After successful creation of a game, the game
  // must be added to the wanted_games list.
  // data is defined here to format the data for the api
  const data = {
    wanted_game: {
      game_id: game.game.id
    }
  }
  return data
}

const createGameFailure = (error) => {
  console.log(error)
}

const indexGamesSuccess = (data) => {
  // fade in games table on success
  $('#game_table_id').fadeIn()
  classActivator('game_table_id')
}

const indexGamesFailure = (error) => console.log(error)

const showGameSuccess = (data) => {
  $('.content').html('')
  viewGameOnly()

  const showGamesHTML = showGamesTemplate({
    game: store.game
  })
  $('.content').append(showGamesHTML)
}
const showGameFailure = (error) => console.log(error)

const postWantedGameSuccess = (data) => {
  console.log('wanted_game ', data)
  store.game_id = data.wanted_game.game_id
  // reload table
  reloadTable('wanted_table_id')
}

const postWantedGameFailure = (error) => {
  console.log(error)
  if ($('.content').is(':empty')) {
    $('.table-message').text('Game has already been added to wishlist')
  } else {
    $('.hbs-message').text('Game has already been added to wishlist')
  }
}
const deleteWantedGameSuccess = (data) => {
  reloadTable('wanted_table_id')
  $('.content').html('')
}

const deleteWantedGameFailure = (error) => console.log(error)

// const indexWantedGamesSuccess = (data) => {
// }
// const indexWantedGamesFailure = (error) => console.log(error)

const showWantedGameSuccess = (data) => {
  $('.content').html('')
  viewGameOnly()
  const showWantedGameHTML = showWantedGameTemplate({
    wanted_game: store.game
  })
  $('.content').append(showWantedGameHTML)
}

const showWantedGameFailure = (error) => console.log(error)

const indexApiGamesSuccess = (data) => {
// fade in the table on success
  console.log(data)
  $('#table_id').fadeIn()
  $('#table_id').DataTable({
    data: data,
    rowId: 'id',
    retrieve: true,
    select: true,
    columns: [
    {data: 'name'},
    {data: 'first_release_date'},
    {data: 'id'}
    ]
  })
  classActivator('table_id')
}

const indexApiGamesFailure = (data, error) => {
  console.log(error)
  console.log(data)
}

const showApiGameSuccess = (data) => {
  $('.content').html('')
  viewGameOnly()

  const showApiGameHTML = showApiGamesTemplate({
    game: store.game
  })
  $('.content').append(showApiGameHTML)
}

module.exports = {
  createGameSuccess,
  createGameFailure,
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
  // indexWantedGamesSuccess,
  // indexWantedGamesFailure,
  showWantedGameSuccess,
  showWantedGameFailure,
  indexApiGamesSuccess,
  indexApiGamesFailure,
  showApiGameSuccess
}
