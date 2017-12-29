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
    } else {
      table.$('tr.selected').removeClass('selected')
      $(this).addClass('selected')
    }
  })
  $('#' + tableId + ' tbody').on('click', 'tr', function () {
    // retrieve data from selected row
    const game = table.row(this).data()
    console.log('this is game ', game)
    $('#game-name').val(game.name)
    $('#release-date').val(game.first_release_date)
    $('#api-id').val(game.id)
    $('#summary').val(game.summary)
    $('#storyline').val(game.storyline)
    $('#url').val(game.url)
    // some data that comes from the 3rd party api is nested differently.
    // this ensures I access the data regardless of which format is used.
    game.cover === undefined ? $('#cloudinary_id').val(game.cloudinary_id) : $('#cloudinary_id').val(game.cover.cloudinary_id)
    game.cover === undefined ? $('#screenshot').val('https:' + game.cover) : $('#screenshot').val('https:' + game.cover.url)
    // store game to allow access outside of this function
    store.game = game

    // $('#delete-button').click(function () {
    //   table.row('.selected').remove().draw()
    // })
  })
}

const viewGameOnly = function () {
  $('#table_id').hide()
  $('#show_table_id').hide()
  $('#wanted_table_id').hide()
  $('#wanted_table_id_info').hide()
  $('#show_table_id_info').hide()
  $('#table_id_info').hide()
  $('label').hide()
  $('a').hide()
  $('#show_table_id_paginate').hide()
  $('.not-signed-in').hide()
}

const toggleTables = function () {
  console.log('tablesHidden = ', tablesHidden)
  if (tablesHidden === false) {
    $('#table_id').hide()
    $('#show_table_id').hide()
    $('#wanted_table_id').hide()
    $('#wanted_table_id_info').hide()
    $('#show_table_id_info').hide()
    $('#table_id_info').hide()
    $('label').hide()
    $('a').hide()
    $('#show_table_id_paginate').hide()
    $('.not-signed-in').hide()

    tablesHidden = true
  } else {
    $('#table_id').show()
    $('#show_table_id').show()
    $('#wanted_table_id').show()
    $('#wanted_table_id_info').show()
    $('#show_table_id_info').show()
    $('#table_id_info').show()
    $('label').show()
    $('a').show()
    $('#show_table_id_paginate').show()
    $('.not-signed-in').show()

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
  // $('label').show()
  // $('#table_id_info').show()
  // $('#show_table_id_info').show()
  // $('#wanted_table_id_info').show()
  // $('a').show()
  // $('#show_table_id').show()
  // $('#table_id').show()
  // $('#wanted_table_id').show()
  // $('#show_table_id_paginate').show()
  // $('wanted_table_id-paginate').show()
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
    columns: [
      { data: 'game.id' },
      { data: 'game.game_name' },
      { data: 'game.release_date' }
    ]
  })
  classActivator('wanted_table_id')
  reloadTable('wanted_table_id')
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
  // $('.content').html('')
  $('.not-signed-in').hide()
  $('#sign-up').show()
  $('#sign-in').show()
  $('.signUp-error').text('')
  $('.signIn-error').text('')
  $('.clear-input').val('')
  toggleTables()
  $('#wanted_table_id').DataTable().clear().draw()
  // $('#table_id').hide()
  // $('#show_table_id').hide()
  // $('#wanted_table_id').hide()
  // $('label').hide()
  // $('#table_id_info').hide()
  // $('#show_table_id_info').hide()
  // $('#wanted_table_id_info').hide()
  // $('a').hide()
}
const createGameSuccess = function (game) {
  console.log('game ', game.game)
  console.log('game.id ', game.game.id)
  reloadTable('show_table_id')
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
  $('#show_table_id').fadeIn()
  classActivator('show_table_id')
  // const games = []
  // for (let i = 0; i < data.length; i++) {
  //   games.push(data[i])
  // }
  // console.log('this is data ', data)
  // $('#show_table_id').DataTable({
  //   ajax: {
  //     url: config.apiOrigin + '/games',
  //     dataSrc: 'games'
  //   },
  //   rowId: 'id',
  //   retrieve: true,
  //   columns: [
  //     { data: 'game_name' },
  //     { data: 'release_date' },
  //     { data: 'id' }
  //   ]
  // })
  // { data: 'popularity' },
  // { data: 'total_rating' },
  // { data: 'summary' },
  // { data: 'storyline' },
  // $('.content').html('')
  // const showGamesHTML = showGamesTemplate({
  //   games: data.games
  // })
  // $('.content').append(showGamesHTML)
  // store.games = data.games
  // console.log('store.game = ', store.games)
}

const indexGamesFailure = (error) => console.log(error)

const showGameSuccess = (data) => {
  $('.content').html('')
  viewGameOnly()

  const showGamesHTML = showGamesTemplate({
    game: store.game
  })
  $('.content').append(showGamesHTML)
  console.log('store.game = ', store.games)
}
const showGameFailure = (error) => console.log(error)

const postWantedGameSuccess = (data) => {
  store.game_id = data.wanted_game.game_id
  console.log(data)
  // reload table
  reloadTable('wanted_table_id')
}

const postWantedGameFailure = (error) => console.log(error)

const deleteWantedGameSuccess = (data) => {
  reloadTable('wanted_table_id')
  $('.content').html('')
}

const deleteWantedGameFailure = (error) => console.log(error)

const indexWantedGamesSuccess = (data) => {
}
const indexWantedGamesFailure = (error) => console.log(error)

const showWantedGameSuccess = (data) => {
  $('.content').html('')
  viewGameOnly()
  const showWantedGameHTML = showWantedGameTemplate({
    wanted_game: store.game
  })
  $('.content').append(showWantedGameHTML)
  console.log('store.game = ', store.game)
}

const showWantedGameFailure = (error) => console.log(error)

const indexApiGamesSuccess = (data) => {
  console.log('data at success ', data)
// fade in the table on success
  $('#table_id').fadeIn()
// push data into an array named games for temporary storage
  // const games = []
  // for (let i = 0; i < data.length; i++) {
  //   games.push(data[i])
  // }
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
  console.log('store.game = ', store.game)
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
  indexWantedGamesSuccess,
  indexWantedGamesFailure,
  showWantedGameSuccess,
  showWantedGameFailure,
  indexApiGamesSuccess,
  indexApiGamesFailure,
  showApiGameSuccess
}
