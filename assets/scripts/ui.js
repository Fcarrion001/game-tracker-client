const store = require('./store')
const showGamesTemplate = require('./templates/games.hbs')
const showWantedGamesTemplate = require('./templates/wanted-games.hbs')
// const showApiGamesTemplate = require('./templates/api-games.hbs')
const $ = require('jquery')
const dt = require('datatables.net')
const config = require('./config')
const inputValue = (target) => $(target).val()
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
    const game = table.row('.selected').data()
    $('#game-name').val(game.name)
    $('#release-date').val(game.first_release_date)
    $('#api-id').val(game.id)
    $('#summary').val(game.summary)
    $('#storyline').val(game.storyline)
    $('#url').val(game.url)
    game.screenshots === undefined ? $('#screenshot').val('https:' + game.screenshot) : $('#screenshot').val('https:' + game.screenshots[0].url)
    // function findGame (apiGame) {
    //   return apiGame.id === game.id
    // }
    // console.log(this.find(findGame))
    // console.log(this.games)
    // console.log(this)
  })

  $('#delete-button').click(function () {
    table.row('.selected').remove().draw()
  })
}

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
  $('label').show()
  $('#table_id_info').show()
  $('#show_table_id_info').show()
  $('a').show()
  $('#show_table_id').show()
  $('#table_id').show()
  $('#show_table_id_paginate').show()
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
  $('#table_id').hide()
  $('#show_table_id').hide()
  $('label').hide()
  $('#table_id_info').hide()
  $('#show_table_id_info').hide()
  $('a').hide()
}
// data is defined here to format the data for the api
const createGameSuccess = function (gameId) {
  console.log('gameId ', gameId)
  // After successful creation of a game, the game
  // must be added to the wanted_games list.
  const data = {
    wanted_game: {
      game_id: gameId
    }
  }
  return data
}
  // store.games = data.games
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
  const showWantedGamesHTML = showWantedGamesTemplate({
    wanted_games: data.wanted_games
  })
  $('.content').append(showWantedGamesHTML)
  store.wanted_games = data.wanted_games
  console.log('store.game = ', store.wanted_games)
}
const indexWantedGamesFailure = (error) => console.log(error)

const showWantedGameSuccess = (data) => console.log(data)

const showWantedGameFailure = (error) => console.log(error)

const indexApiGamesSuccess = (data) => {
  console.log('data at success ', data)
// fade in the table on success
  $('#table_id').fadeIn()
// push data into an array named games for temporary storage
  const games = []
  for (let i = 0; i < data.length; i++) {
    games.push(data[i])
  }
  $('#table_id').DataTable({
    data: data,
    rowId: 'id',
    retrieve: true,
    select: true,
    buttons: [
      'selectedSingle'
    ],
    columns: [
    {data: 'name'},
    {data: 'first_release_date'},
    {data: 'id'}
    ]
  // const showGamesHTML = showGamesTemplate({
  //   game: games
  // })
  // $('#table_id').append(showGamesHTML)
  // store.game = games
  // console.log('store.games ', store.games)
  })
  classActivator('table_id')
}

const indexApiGamesFailure = (data, error) => {
  console.log(error)
  console.log(data)
}
const showApiGameSuccess = (data) => {
  const games = []
  for (let i = 0; i < data.length; i++) {
    games.push(data[i])
  }
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
