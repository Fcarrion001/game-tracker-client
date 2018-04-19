webpackJsonp([0],[
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	// user require with a reference to bundle the file and use it in this file
	// var example = require('./example');

	// load manifests
	// scripts

	__webpack_require__(1);

	// styles
	__webpack_require__(38);

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {'use strict';

	var setAPIOrigin = __webpack_require__(3);
	var config = __webpack_require__(6);
	$(function () {
	  setAPIOrigin(location, config);
	});

	// use require with a reference to bundle the file and use it in this file
	// const example = require('./example')

	// use require without a reference to ensure a file is bundled
	__webpack_require__(7);

	var events = __webpack_require__(8);
	var authEvents = __webpack_require__(35);

	$(function () {
	  authEvents.addHandlers();
	  events.addHandlers();
	});
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ }),
/* 2 */,
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var parseNestedQuery = __webpack_require__(4);

	/*
	  possibilites to handle and example URLs:

	  client local, api local
	    http://localhost:7165/
	  client local, api remote
	    http://localhost:7165/?environment=production
	  client remote, api local
	    https://ga-wdi-boston.github.io/browser-template/?environment=development
	    This will require allowing "unsafe scripts" in Chrome
	  client remote, api remote
	    https://ga-wdi-boston.github.io/browser-template/
	*/

	var setAPIOrigin = function setAPIOrigin(location, config) {
	  // strip the leading `'?'`
	  var search = parseNestedQuery(location.search.slice(1));

	  if (search.environment === 'development' || location.hostname === 'localhost' && search.environment !== 'production') {
	    if (!(config.apiOrigin = config.apiOrigins.development)) {
	      var port = +'GA'.split('').reduce(function (p, c) {
	        return p + c.charCodeAt().toString(16);
	      }, '');
	      config.apiOrigin = 'http://localhost:' + port;
	    }
	  } else {
	    config.apiOrigin = config.apiOrigins.production;
	  }
	};

	module.exports = setAPIOrigin;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var addNestedValue = __webpack_require__(5);

	var parseNestedQuery = function parseNestedQuery(queryString) {
	  return queryString.split('&').reduce(function (memo, element) {
	    if (element) {
	      var keyValuePair = element.split('=');
	      memo = addNestedValue(memo, decodeURIComponent(keyValuePair[0]), decodeURIComponent(keyValuePair[1]));
	    }

	    return memo;
	  }, {});
	};

	module.exports = parseNestedQuery;

/***/ }),
/* 5 */
/***/ (function(module, exports) {

	'use strict';

	var addNestedValue = function addNestedValue(pojo, name, value) {
	  var recurse = function recurse(pojo, keys, value) {
	    var key = keys.shift();
	    var next = keys[0];
	    if (next === '') {
	      // key is an array
	      pojo[key] = pojo[key] || [];
	      pojo[key].push(value);
	    } else if (next) {
	      // key is a parent key
	      pojo[key] = pojo[key] || {};
	      recurse(pojo[key], keys, value);
	    } else {
	      // key is the key for value
	      pojo[key] = value;
	    }

	    return pojo;
	  };

	  var keys = name.split('[').map(function (k) {
	    return k.replace(/]$/, '');
	  });
	  return recurse(pojo, keys, value);
	};

	module.exports = addNestedValue;

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	'use strict';

	var config = {
	  apiOrigins: {
	    production: 'https://salty-brook-97934.herokuapp.com',
	    development: 'http://localhost:4741'
	  }
	};

	module.exports = config;

/***/ }),
/* 7 */
/***/ (function(module, exports) {

	'use strict';

	module.exports = true;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	// const getFormFields = require('../../lib/get-form-fields')
	var api = __webpack_require__(9);
	var ui = __webpack_require__(11);
	var $ = __webpack_require__(2);
	var config = __webpack_require__(6);
	var store = __webpack_require__(10);
	var addHandlers = function addHandlers() {
	  // anything pointing to $('.content') is targeting a button that lives inside
	  // a handlebars template.
	  $('#post-wanted-game').on('click', onPostWantedGame);
	  $('.content').on('click', '#post-wanted-game', onPostWantedGame);
	  $('#delete-wanted-game').on('click', onDeleteWantedGame);
	  $('.content').on('click', '#delete-wanted-game', onDeleteWantedGame);
	  $('#post-game').on('click', onPostGame);
	  $('.content').on('click', '#post-game', onPostGame);
	  $('#table_id').on('click', 'tbody', ui.indexApiGamesSuccess);
	  // using show<Game>Success callbacks to change view to a show on a game
	  // when a row is double clicked.
	  $('#table_id').on('dblclick', 'tbody', ui.showApiGameSuccess);
	  $('#wanted_table_id').on('dblclick', 'tbody', ui.showWantedGameSuccess);
	  $('#game_table_id').on('dblclick', 'tbody', ui.showGameSuccess);
	  // revert back to the tables view when the back button is clicked.
	  $('.content').on('click', '.back-btn', showTables);
	  // load games table when document is ready.
	  $(document).ready(api.indexGames);
	  $(document).ready(hideTables);
	};

	var onPostGame = function onPostGame(event) {
	  event.preventDefault();
	  // format data to be sent to the api
	  var data = {
	    game: {
	      api_id: store.game.id,
	      game_name: store.game.name,
	      release_date: store.game.first_release_date,
	      summary: store.game.summary,
	      storyline: store.game.stroryline,
	      cloudinary_id: store.game.cover.cloudinary_id,
	      screenshot: 'https:' + store.game.cover.url,
	      platform: 'playstation',
	      url: store.game.url
	    }
	  };
	  api.postGame(data)
	  // reload table and extract id to be used as params for postWantedGame
	  .then(function (data) {
	    return ui.postGameSuccess(data);
	  }).then(function (game_id) {
	    return api.postWantedGame(game_id);
	  })
	  // reload table
	  .then(ui.postWantedGameSuccess)
	  // if user added game from the showWantedGame handlebars view, we want to exist
	  // the view and go back to the tables view.
	  .then(showTables)
	  // inform user of problem when an error occurs
	  .catch(ui.postWantedGameFailure);
	};

	// functions that will hide and show the tables.
	var hideTables = function hideTables() {
	  $('#table_id').hide();
	  $('#game_table_id').hide();
	  $('#wanted_table_id').hide();
	  $('#game_table_id_info').hide();
	  $('#table_id_info').hide();
	  $('label').hide();
	  $('a').hide();
	  $('#game_table_id_paginate').hide();
	  $('.not-signed-in').hide();
	  $('.before-sign-in').show();
	  $('.navbar-brand').show();
	  $('.auth').hide();
	  $('.pwd-ch-cancel').hide();
	  $('.content').empty();
	};

	var showTables = function showTables() {
	  $('.content').text('');
	  $('#table_id').show();
	  $('#game_table_id').show();
	  $('#wanted_table_id').show();
	  $('#wanted_table_id_info').show();
	  $('#game_table_id_info').show();
	  $('#table_id_info').show();
	  $('label').show();
	  $('a').show();
	  $('#game_table_id_paginate').show();
	  $('.not-signed-in').show();
	  $('.after-sign-in').show();
	  $('.before-sign-in').hide();
	};

	var onPostWantedGame = function onPostWantedGame(event) {
	  event.preventDefault();
	  // retreive game_id
	  var data = {
	    wanted_game: {
	      game_id: store.game.id
	    }
	  };
	  api.postWantedGame(data).then(function (data) {
	    return ui.postWantedGameSuccess(data);
	  }).then(showTables).catch(ui.postWantedGameFailure);
	};

	var onDeleteWantedGame = function onDeleteWantedGame(event) {
	  event.preventDefault();

	  // const data = getFormFields(this)
	  var data = store.game.id;

	  api.deleteWantedGame(data).then(ui.deleteWantedGameSuccess).then(showTables).catch(ui.deleteWantedGameFailure);
	};
	// const onIndexGames = function (event) {
	//   console.log('it works here')
	//   event.preventDefault()
	//   api.indexGames()
	//     .then(ui.indexGamesSuccess)
	//     .catch(ui.indexGamesFailure)
	// }

	// const onShowGame = function (event) {
	//   event.preventDefault()
	//   const data = getFormFields(this)
	//   api.showGame(data)
	//     .then(ui.showGameSuccess)
	//     .catch(ui.showGameFailure)
	// }

	// const onIndexWantedGames = function (event) {
	//   console.log('it works here')
	//   event.preventDefault()
	//   api.indexWantedGames()
	//     .then((data) => {
	//       console.log('data = ', data)
	//       return data
	//     })
	//     .then((data) => ui.indexWantedGamesSuccess(data))
	//     .catch(ui.indexWantedGamesFailure)
	// }

	// const onShowWantedGame = function (event) {
	//   event.preventDefault()
	//   const data = getFormFields(this)
	//   api.showWantedGame(data)
	//     .then(ui.showWantedGameSuccess)
	//     .catch(ui.showWantedGameFailure)
	// }

	// const onIndexApiGames = function (event) {
	//   console.log('it is working')
	//   event.preventDefault()
	//   api.indexApiGames()
	//     .then(ui.indexApiGamesSuccess)
	//     .catch(ui.indexApiGamesFailure)
	// }

	// const onShowApiGame = function (event) {
	//   event.preventDefault()
	//   const data = $(event.target).parent().attr('id')
	//   console.log('data is ', data)
	//   console.log('event.target', $(event.target))
	//   api.showApiGame(data)
	//     .then((data) => {
	//       console.log('this is data ', data)
	//       return data
	//     })
	//     .then(ui.showApiGameSuccess)
	//     .catch(ui.showApiGameFailure)
	// }

	module.exports = {
	  addHandlers: addHandlers
	};

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var store = __webpack_require__(10);
	var config = __webpack_require__(6);
	var ui = __webpack_require__(11);
	var $ = __webpack_require__(2);
	var dt = __webpack_require__(34);

	var postGame = function postGame(data) {
	  return $.ajax({
	    url: config.apiOrigin + '/games',
	    method: 'POST',
	    headers: {
	      Authorization: 'Token token=' + store.user.token
	    },
	    data: data
	  });
	};

	var postWantedGame = function postWantedGame(data) {
	  return $.ajax({
	    url: config.apiOrigin + '/wanted_games',
	    method: 'POST',
	    headers: {
	      Authorization: 'Token token=' + store.user.token
	    },
	    data: data
	  });
	};

	var deleteWantedGame = function deleteWantedGame(data) {
	  return $.ajax({
	    url: config.apiOrigin + '/wanted_games/' + data,
	    method: 'DELETE',
	    headers: {
	      Authorization: 'Token token=' + store.user.token
	    }
	  });
	};

	var indexApiGames = function indexApiGames(data) {
	  return $.ajax({
	    url: config.apiOrigin + '/api-games',
	    method: 'GET',
	    headers: {
	      Authorization: 'Token token=' + data.token
	    }
	  });
	};
	// use dataTables to make the GET request and populate the table simultaneously
	var indexGames = function indexGames() {
	  $('#game_table_id').DataTable({
	    // use dataTables to make ajax call
	    ajax: {
	      url: config.apiOrigin + '/games',
	      dataSrc: 'games'
	    },
	    rowId: 'id',
	    retrieve: true,
	    columns: [{ data: 'game_name' }, { data: 'release_date' }, { data: 'platform' }]
	  });
	  // this callback holds the
	  ui.indexGamesSuccess();
	};

	var indexWantedGames = function indexWantedGames(data) {
	  // make Get request to populate user's wishlist dataTable
	  $('#wanted_table_id').DataTable({
	    ajax: {
	      url: config.apiOrigin + '/wanted_games',
	      dataSrc: 'wanted_games',
	      headers: {
	        Authorization: 'Token token=' + data.token
	      }
	    },
	    rowId: 'id',
	    retrieve: true,
	    'columnDefs': [{ 'width': '20%', 'targets': '_all' }],
	    columns: [{ data: 'game.game_name' }, { data: 'game.release_date' }, { data: 'game.platform' }]
	  });
	};
	// ajax request GET to games
	// const indexGames = function () {
	//   return $.ajax({
	//     url: config.apiOrigin + '/games',
	//     method: 'GET',
	//     headers: {
	//       Authorization: 'Token token=' + store.user.token
	//     }
	//   })
	// }

	// const showGame = function (data) {
	//   return $.ajax({
	//     url: config.apiOrigin + '/games/' + data.game.id,
	//     method: 'GET',
	//     headers: {
	//       Authorization: 'Token token=' + store.user.token
	//     }
	//   })
	// }

	// const indexWantedGames = function () {
	//   return $.ajax({
	//     url: config.apiOrigin + '/wanted_games',
	//     method: 'GET',
	//     headers: {
	//       Authorization: 'Token token=' + store.user.token
	//     }
	//   })
	// }

	// const showWantedGame = function (data) {
	//   return $.ajax({
	//     url: config.apiOrigin + '/wanted_games/' + data.wanted_game.id,
	//     method: 'GET'
	//   })
	// }

	// const showApiGame = function (data) {
	//   return $.ajax({
	//     url: config.apiOrigin + '/api-games/' + data,
	//     method: 'GET',
	//     headers: {
	//       Authorization: 'Token token=' + store.user.token
	//     }
	//   })
	// }

	module.exports = {
	  indexGames: indexGames,
	  // showGame,
	  indexWantedGames: indexWantedGames,
	  // showWantedGame,
	  // showApiGame,
	  postGame: postGame,
	  postWantedGame: postWantedGame,
	  deleteWantedGame: deleteWantedGame,
	  indexApiGames: indexApiGames
	};

/***/ }),
/* 10 */
/***/ (function(module, exports) {

	'use strict';

	var store = {};

	module.exports = store;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var store = __webpack_require__(10);
	var showGamesTemplate = __webpack_require__(12);
	var showWantedGameTemplate = __webpack_require__(32);
	var showApiGamesTemplate = __webpack_require__(33);
	var $ = __webpack_require__(2);
	var dt = __webpack_require__(34);
	var config = __webpack_require__(6);
	var inputValue = function inputValue(target) {
	  return $(target).val();
	};
	// variable used to toggle visibility of data and input fields on the page when
	// user signs in and out.
	var signedOut = true;
	// function that takes a table id as a parameter to active the class 'selected'
	// on clicked rows
	var classActivator = function classActivator(tableId) {
	  var table = $('#' + tableId).DataTable();

	  $('#' + tableId + ' tbody').on('click', 'tr', function () {
	    if ($(this).hasClass('selected')) {
	      $(this).removeClass('selected');
	      // clear message whenever a row is clicked
	      $('.message').text('');
	    } else {
	      table.$('tr.selected').removeClass('selected');
	      $(this).addClass('selected');
	      $('.message').text('');
	    }
	  });
	  $('#' + tableId + ' tbody').on('click', 'tr', function () {
	    // retrieve data from selected row
	    var game = table.row(this).data();
	    // depending on the table, the data will be nested differently so it is
	    // stored here so that the individual success callbacks containing handlebars
	    // can access the data without redundant code.
	    store.game = game;
	  });
	};

	var viewGameOnly = function viewGameOnly() {
	  $('#table_id').hide();
	  $('#game_table_id').hide();
	  $('#wanted_table_id').hide();
	  $('#wanted_table_id_info').hide();
	  $('#game_table_id_info').hide();
	  $('#table_id_info').hide();
	  $('label').hide();
	  $('a').hide();
	  $('#game_table_id_paginate').hide();
	  $('.not-signed-in').hide();
	  $('.after-sign-in').hide();
	  $('.navbar-brand').show();
	  $('.before-sign-in').show();
	  $('.auth').hide();
	};
	// function to toggle tables specifically when user signs in and out.
	var toggleTables = function toggleTables() {
	  if (signedOut === false) {
	    $('#table_id').hide();
	    $('#game_table_id').hide();
	    $('#wanted_table_id').hide();
	    $('#wanted_table_id_info').hide();
	    $('#game_table_id_info').hide();
	    $('#table_id_info').hide();
	    $('label').hide();
	    $('a').hide();
	    $('#game_table_id_paginate').hide();
	    $('.not-signed-in').hide();
	    $('.after-sign-in').hide();
	    $('.navbar-brand').show();
	    $('.before-sign-in').show();
	    $('.auth').hide();

	    signedOut = true;
	  } else {
	    $('#table_id').show();
	    $('#game_table_id').show();
	    $('#wanted_table_id').show();
	    $('#wanted_table_id_info').show();
	    $('#game_table_id_info').show();
	    $('#table_id_info').show();
	    $('label').show();
	    $('a').show();
	    $('#game_table_id_paginate').show();
	    $('.not-signed-in').show();
	    $('.after-sign-in').show();
	    $('.before-sign-in').hide();
	    $('.navbar-brand').show();

	    signedOut = false;
	  }
	};
	// dynamically add new game to table by clearing the
	// table and making a new ajax call.
	var reloadTable = function reloadTable(tableId) {
	  var table = $('#' + tableId).DataTable();
	  table.clear().ajax.reload();
	};
	// pass user data for automatic sign-in
	var signUpSuccess = function signUpSuccess(data) {
	  store.user = data.user;
	  return data;
	};

	var signUpFailure = function signUpFailure() {
	  // on error check to see if the password value and password confirmation
	  // value match
	  if (inputValue('.signUp-email') === '' || inputValue('.signUp-pw') === '' || inputValue('.signUp-pw-conf') === '') {
	    $('.signUp-error').text('Please fill in all fields prior to submission');
	  } else if ($('.signUp-pw').val() !== $('.signUp-pw-conf').val()) {
	    // if they do not match tell the user what went wrong
	    $('.signUp-error').text('Sorry, the passwords you entered do not match.' + 'Please try again');
	  } else {
	    // if they do match, the email must be taken.
	    // Tell the user the email is taken already
	    $('.signUp-error').text('Sorry, that user already exist');
	  }
	  // clear the input fields so that the user can start fresh
	  $('.clear-input').val('');
	  // clear sign-in error message so that only the most recent error is displayed
	  $('.signIn-error').text('');
	};

	var signInSuccess = function signInSuccess(data) {
	  // store data to be used for authentication later
	  store.user = data.user;
	  $('.not-signed-in').show();
	  $('#sign-in').hide();
	  $('#sign-up').hide();
	  // make sure only the most recent error is being displayed
	  $('.signUp-failure').text('');
	  toggleTables();
	  // make Get request to populate user's wishlist dataTable
	  // $('#wanted_table_id').DataTable({
	  //   ajax: {
	  //     url: config.apiOrigin + '/wanted_games',
	  //     dataSrc: 'wanted_games',
	  //     headers: {
	  //       Authorization: 'Token token=' + store.user.token
	  //     }
	  //   },
	  //   rowId: 'id',
	  //   retrieve: true,
	  //   'columnDefs': [
	  //     {'width': '20%', 'targets': '_all'}
	  //   ],
	  //   columns: [
	  //     { data: 'game.game_name' },
	  //     { data: 'game.release_date' },
	  //     { data: 'game.platform' }
	  //   ]
	  // })
	};

	var signInFailure = function signInFailure() {
	  $('.signIn-error').text('Whoops, user does not exist or password is incorrect');
	  $('.clear-input').val('');
	  $('.signUp-error').text('');
	};
	var changePasswordSuccess = function changePasswordSuccess(data) {
	  $('.ch-pw').val('');
	  $('.ch-pw-message').text('Password has been changed');
	  $('.auth').hide();
	  $('.pwd-ch-cancel').hide();
	};

	var changePasswordFailure = function changePasswordFailure(data) {
	  $('.ch-pw-message').text('Incorrect password or old and new passwords match');
	  // clear input fields for re-entry
	  $('.ch-pw').val('');
	};

	var signOutSuccess = function signOutSuccess() {
	  $('.content').html('');
	  $('.not-signed-in').hide();
	  $('#sign-up').show();
	  $('#sign-in').show();
	  $('.signUp-error').text('');
	  $('.signIn-error').text('');
	  $('.clear-input').val('');
	  toggleTables();
	  // destroy table so that a old users data is protected and a new users data
	  // can be retrieved successfully upon signing in.
	  var table = $('#wanted_table_id').DataTable();
	  table.destroy();
	};

	var postGameSuccess = function postGameSuccess(game) {
	  reloadTable('game_table_id');
	  // After successful creation of a game, the game
	  // must be added to the wanted_games list.
	  // data is defined here to format the data for the api
	  var data = {
	    wanted_game: {
	      game_id: game.game.id
	    }
	  };
	  return data;
	};

	var postGameFailure = function postGameFailure(error) {
	  return console.log(error);
	};

	var indexGamesSuccess = function indexGamesSuccess(data) {
	  // fade in games table on success
	  $('#game_table_id').fadeIn();
	  classActivator('game_table_id');
	};

	var indexGamesFailure = function indexGamesFailure(error) {
	  return console.log(error);
	};

	var showGameSuccess = function showGameSuccess(data) {
	  $('.content').html('');
	  viewGameOnly();

	  var showGamesHTML = showGamesTemplate({
	    game: store.game
	  });
	  $('.content').append(showGamesHTML);
	};
	var showGameFailure = function showGameFailure(error) {
	  return console.log(error);
	};

	var postWantedGameSuccess = function postWantedGameSuccess(data) {
	  // store.game_id = data.wanted_game.game_id
	  // reload table
	  reloadTable('wanted_table_id');
	};

	var postWantedGameFailure = function postWantedGameFailure(error) {
	  console.log(error);
	  if ($('.content').is(':empty')) {
	    $('.table-message').text('Game has already been added to wishlist');
	  } else {
	    $('.hbs-message').text('Game has already been added to wishlist');
	  }
	};
	var deleteWantedGameSuccess = function deleteWantedGameSuccess(data) {
	  reloadTable('wanted_table_id');
	  $('.content').html('');
	};

	var deleteWantedGameFailure = function deleteWantedGameFailure(error) {
	  return console.log(error);
	};

	// give wanted table the ability to add class selected to clicked rows
	var indexWantedGamesSuccess = function indexWantedGamesSuccess() {
	  return classActivator('wanted_table_id');
	};

	// const indexWantedGamesFailure = (error) => console.log(error)

	var showWantedGameSuccess = function showWantedGameSuccess(data) {
	  $('.content').html('');
	  viewGameOnly();
	  var showWantedGameHTML = showWantedGameTemplate({
	    wanted_game: store.game
	  });
	  $('.content').append(showWantedGameHTML);
	};

	var showWantedGameFailure = function showWantedGameFailure(error) {
	  return console.log(error);
	};

	var indexApiGamesSuccess = function indexApiGamesSuccess(data) {
	  // fade in the table on success
	  $('#table_id').fadeIn();
	  $('#table_id').DataTable({
	    data: data,
	    rowId: 'id',
	    retrieve: true,
	    select: true,
	    columns: [{ data: 'name' }, { data: 'first_release_date' }, { data: 'id' }]
	  });
	  classActivator('table_id');
	};

	var indexApiGamesFailure = function indexApiGamesFailure(data, error) {
	  console.log(error);
	  console.log(data);
	};

	var showApiGameSuccess = function showApiGameSuccess(data) {
	  $('.content').html('');
	  viewGameOnly();

	  var showApiGameHTML = showApiGamesTemplate({
	    game: store.game
	  });
	  $('.content').append(showApiGameHTML);
	};

	module.exports = {
	  postGameSuccess: postGameSuccess,
	  postGameFailure: postGameFailure,
	  signUpSuccess: signUpSuccess,
	  signUpFailure: signUpFailure,
	  signInSuccess: signInSuccess,
	  signInFailure: signInFailure,
	  changePasswordSuccess: changePasswordSuccess,
	  changePasswordFailure: changePasswordFailure,
	  signOutSuccess: signOutSuccess,
	  indexGamesSuccess: indexGamesSuccess,
	  indexGamesFailure: indexGamesFailure,
	  showGameSuccess: showGameSuccess,
	  showGameFailure: showGameFailure,
	  postWantedGameSuccess: postWantedGameSuccess,
	  postWantedGameFailure: postWantedGameFailure,
	  deleteWantedGameSuccess: deleteWantedGameSuccess,
	  deleteWantedGameFailure: deleteWantedGameFailure,
	  indexWantedGamesSuccess: indexWantedGamesSuccess,
	  // indexWantedGamesFailure,
	  showWantedGameSuccess: showWantedGameSuccess,
	  showWantedGameFailure: showWantedGameFailure,
	  indexApiGamesSuccess: indexApiGamesSuccess,
	  indexApiGamesFailure: indexApiGamesFailure,
	  showApiGameSuccess: showApiGameSuccess
	};

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

	var Handlebars = __webpack_require__(13);
	function __default(obj) { return obj && (obj.__esModule ? obj["default"] : obj); }
	module.exports = (Handlebars["default"] || Handlebars).template({"1":function(container,depth0,helpers,partials,data) {
	    var stack1;

	  return "      <p>"
	    + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? depth0.game : depth0)) != null ? stack1.summary : stack1), depth0))
	    + "</p>\n";
	},"3":function(container,depth0,helpers,partials,data) {
	    return "      <p>No summary provided.</p>\n";
	},"5":function(container,depth0,helpers,partials,data) {
	    var stack1;

	  return "      <p>"
	    + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? depth0.game : depth0)) != null ? stack1.storyline : stack1), depth0))
	    + "</p>\n";
	},"7":function(container,depth0,helpers,partials,data) {
	    return "      <p>No storyline provided.</p>\n";
	},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
	    var stack1, alias1=container.lambda, alias2=container.escapeExpression, alias3=depth0 != null ? depth0 : (container.nullContext || {});

	  return "\n<h3 class=\"game-name\">"
	    + alias2(alias1(((stack1 = (depth0 != null ? depth0.game : depth0)) != null ? stack1.game_name : stack1), depth0))
	    + "</h3>\n<h4>Summary</h4>\n"
	    + ((stack1 = helpers["if"].call(alias3,((stack1 = (depth0 != null ? depth0.game : depth0)) != null ? stack1.summary : stack1),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data})) != null ? stack1 : "")
	    + "<h4>Storyline</h4>\n"
	    + ((stack1 = helpers["if"].call(alias3,((stack1 = (depth0 != null ? depth0.game : depth0)) != null ? stack1.storyline : stack1),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.program(7, data, 0),"data":data})) != null ? stack1 : "")
	    + "<img src=\"https://images.igdb.com/igdb/image/upload/t_cover_big/"
	    + alias2(alias1(((stack1 = (depth0 != null ? depth0.game : depth0)) != null ? stack1.cloudinary_id : stack1), depth0))
	    + ".jpg\"\n alt=\"screen shot\">\n\n<h4 class=\"message hbs-message\"></h4>\n\n<button id=\"post-wanted-game\" type=\"button\" class=\"btn btn-success\"\n name=\"post-wanted-game-btn\">Add to Wishlist</button>\n<button type=\"button\" class=\"back-btn btn btn-secondary\"\n name=\"back-button\">Back</button>\n";
	},"useData":true});

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	// Create a simple path alias to allow browserify to resolve
	// the runtime on a supported path.
	module.exports = __webpack_require__(14)['default'];


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	// istanbul ignore next

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

	var _handlebarsBase = __webpack_require__(15);

	var base = _interopRequireWildcard(_handlebarsBase);

	// Each of these augment the Handlebars object. No need to setup here.
	// (This is done to easily share code between commonjs and browse envs)

	var _handlebarsSafeString = __webpack_require__(29);

	var _handlebarsSafeString2 = _interopRequireDefault(_handlebarsSafeString);

	var _handlebarsException = __webpack_require__(17);

	var _handlebarsException2 = _interopRequireDefault(_handlebarsException);

	var _handlebarsUtils = __webpack_require__(16);

	var Utils = _interopRequireWildcard(_handlebarsUtils);

	var _handlebarsRuntime = __webpack_require__(30);

	var runtime = _interopRequireWildcard(_handlebarsRuntime);

	var _handlebarsNoConflict = __webpack_require__(31);

	var _handlebarsNoConflict2 = _interopRequireDefault(_handlebarsNoConflict);

	// For compatibility and usage outside of module systems, make the Handlebars object a namespace
	function create() {
	  var hb = new base.HandlebarsEnvironment();

	  Utils.extend(hb, base);
	  hb.SafeString = _handlebarsSafeString2['default'];
	  hb.Exception = _handlebarsException2['default'];
	  hb.Utils = Utils;
	  hb.escapeExpression = Utils.escapeExpression;

	  hb.VM = runtime;
	  hb.template = function (spec) {
	    return runtime.template(spec, hb);
	  };

	  return hb;
	}

	var inst = create();
	inst.create = create;

	_handlebarsNoConflict2['default'](inst);

	inst['default'] = inst;

	exports['default'] = inst;
	module.exports = exports['default'];
	//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9oYW5kbGViYXJzLnJ1bnRpbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OEJBQXNCLG1CQUFtQjs7SUFBN0IsSUFBSTs7Ozs7b0NBSU8sMEJBQTBCOzs7O21DQUMzQix3QkFBd0I7Ozs7K0JBQ3ZCLG9CQUFvQjs7SUFBL0IsS0FBSzs7aUNBQ1Esc0JBQXNCOztJQUFuQyxPQUFPOztvQ0FFSSwwQkFBMEI7Ozs7O0FBR2pELFNBQVMsTUFBTSxHQUFHO0FBQ2hCLE1BQUksRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7O0FBRTFDLE9BQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3ZCLElBQUUsQ0FBQyxVQUFVLG9DQUFhLENBQUM7QUFDM0IsSUFBRSxDQUFDLFNBQVMsbUNBQVksQ0FBQztBQUN6QixJQUFFLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUNqQixJQUFFLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLGdCQUFnQixDQUFDOztBQUU3QyxJQUFFLENBQUMsRUFBRSxHQUFHLE9BQU8sQ0FBQztBQUNoQixJQUFFLENBQUMsUUFBUSxHQUFHLFVBQVMsSUFBSSxFQUFFO0FBQzNCLFdBQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7R0FDbkMsQ0FBQzs7QUFFRixTQUFPLEVBQUUsQ0FBQztDQUNYOztBQUVELElBQUksSUFBSSxHQUFHLE1BQU0sRUFBRSxDQUFDO0FBQ3BCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDOztBQUVyQixrQ0FBVyxJQUFJLENBQUMsQ0FBQzs7QUFFakIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQzs7cUJBRVIsSUFBSSIsImZpbGUiOiJoYW5kbGViYXJzLnJ1bnRpbWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBiYXNlIGZyb20gJy4vaGFuZGxlYmFycy9iYXNlJztcblxuLy8gRWFjaCBvZiB0aGVzZSBhdWdtZW50IHRoZSBIYW5kbGViYXJzIG9iamVjdC4gTm8gbmVlZCB0byBzZXR1cCBoZXJlLlxuLy8gKFRoaXMgaXMgZG9uZSB0byBlYXNpbHkgc2hhcmUgY29kZSBiZXR3ZWVuIGNvbW1vbmpzIGFuZCBicm93c2UgZW52cylcbmltcG9ydCBTYWZlU3RyaW5nIGZyb20gJy4vaGFuZGxlYmFycy9zYWZlLXN0cmluZyc7XG5pbXBvcnQgRXhjZXB0aW9uIGZyb20gJy4vaGFuZGxlYmFycy9leGNlcHRpb24nO1xuaW1wb3J0ICogYXMgVXRpbHMgZnJvbSAnLi9oYW5kbGViYXJzL3V0aWxzJztcbmltcG9ydCAqIGFzIHJ1bnRpbWUgZnJvbSAnLi9oYW5kbGViYXJzL3J1bnRpbWUnO1xuXG5pbXBvcnQgbm9Db25mbGljdCBmcm9tICcuL2hhbmRsZWJhcnMvbm8tY29uZmxpY3QnO1xuXG4vLyBGb3IgY29tcGF0aWJpbGl0eSBhbmQgdXNhZ2Ugb3V0c2lkZSBvZiBtb2R1bGUgc3lzdGVtcywgbWFrZSB0aGUgSGFuZGxlYmFycyBvYmplY3QgYSBuYW1lc3BhY2VcbmZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgbGV0IGhiID0gbmV3IGJhc2UuSGFuZGxlYmFyc0Vudmlyb25tZW50KCk7XG5cbiAgVXRpbHMuZXh0ZW5kKGhiLCBiYXNlKTtcbiAgaGIuU2FmZVN0cmluZyA9IFNhZmVTdHJpbmc7XG4gIGhiLkV4Y2VwdGlvbiA9IEV4Y2VwdGlvbjtcbiAgaGIuVXRpbHMgPSBVdGlscztcbiAgaGIuZXNjYXBlRXhwcmVzc2lvbiA9IFV0aWxzLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgaGIuVk0gPSBydW50aW1lO1xuICBoYi50ZW1wbGF0ZSA9IGZ1bmN0aW9uKHNwZWMpIHtcbiAgICByZXR1cm4gcnVudGltZS50ZW1wbGF0ZShzcGVjLCBoYik7XG4gIH07XG5cbiAgcmV0dXJuIGhiO1xufVxuXG5sZXQgaW5zdCA9IGNyZWF0ZSgpO1xuaW5zdC5jcmVhdGUgPSBjcmVhdGU7XG5cbm5vQ29uZmxpY3QoaW5zdCk7XG5cbmluc3RbJ2RlZmF1bHQnXSA9IGluc3Q7XG5cbmV4cG9ydCBkZWZhdWx0IGluc3Q7XG4iXX0=


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports.HandlebarsEnvironment = HandlebarsEnvironment;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _utils = __webpack_require__(16);

	var _exception = __webpack_require__(17);

	var _exception2 = _interopRequireDefault(_exception);

	var _helpers = __webpack_require__(18);

	var _decorators = __webpack_require__(26);

	var _logger = __webpack_require__(28);

	var _logger2 = _interopRequireDefault(_logger);

	var VERSION = '4.0.10';
	exports.VERSION = VERSION;
	var COMPILER_REVISION = 7;

	exports.COMPILER_REVISION = COMPILER_REVISION;
	var REVISION_CHANGES = {
	  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
	  2: '== 1.0.0-rc.3',
	  3: '== 1.0.0-rc.4',
	  4: '== 1.x.x',
	  5: '== 2.0.0-alpha.x',
	  6: '>= 2.0.0-beta.1',
	  7: '>= 4.0.0'
	};

	exports.REVISION_CHANGES = REVISION_CHANGES;
	var objectType = '[object Object]';

	function HandlebarsEnvironment(helpers, partials, decorators) {
	  this.helpers = helpers || {};
	  this.partials = partials || {};
	  this.decorators = decorators || {};

	  _helpers.registerDefaultHelpers(this);
	  _decorators.registerDefaultDecorators(this);
	}

	HandlebarsEnvironment.prototype = {
	  constructor: HandlebarsEnvironment,

	  logger: _logger2['default'],
	  log: _logger2['default'].log,

	  registerHelper: function registerHelper(name, fn) {
	    if (_utils.toString.call(name) === objectType) {
	      if (fn) {
	        throw new _exception2['default']('Arg not supported with multiple helpers');
	      }
	      _utils.extend(this.helpers, name);
	    } else {
	      this.helpers[name] = fn;
	    }
	  },
	  unregisterHelper: function unregisterHelper(name) {
	    delete this.helpers[name];
	  },

	  registerPartial: function registerPartial(name, partial) {
	    if (_utils.toString.call(name) === objectType) {
	      _utils.extend(this.partials, name);
	    } else {
	      if (typeof partial === 'undefined') {
	        throw new _exception2['default']('Attempting to register a partial called "' + name + '" as undefined');
	      }
	      this.partials[name] = partial;
	    }
	  },
	  unregisterPartial: function unregisterPartial(name) {
	    delete this.partials[name];
	  },

	  registerDecorator: function registerDecorator(name, fn) {
	    if (_utils.toString.call(name) === objectType) {
	      if (fn) {
	        throw new _exception2['default']('Arg not supported with multiple decorators');
	      }
	      _utils.extend(this.decorators, name);
	    } else {
	      this.decorators[name] = fn;
	    }
	  },
	  unregisterDecorator: function unregisterDecorator(name) {
	    delete this.decorators[name];
	  }
	};

	var log = _logger2['default'].log;

	exports.log = log;
	exports.createFrame = _utils.createFrame;
	exports.logger = _logger2['default'];
	//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2Jhc2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7cUJBQTRDLFNBQVM7O3lCQUMvQixhQUFhOzs7O3VCQUNFLFdBQVc7OzBCQUNSLGNBQWM7O3NCQUNuQyxVQUFVOzs7O0FBRXRCLElBQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQzs7QUFDekIsSUFBTSxpQkFBaUIsR0FBRyxDQUFDLENBQUM7OztBQUU1QixJQUFNLGdCQUFnQixHQUFHO0FBQzlCLEdBQUMsRUFBRSxhQUFhO0FBQ2hCLEdBQUMsRUFBRSxlQUFlO0FBQ2xCLEdBQUMsRUFBRSxlQUFlO0FBQ2xCLEdBQUMsRUFBRSxVQUFVO0FBQ2IsR0FBQyxFQUFFLGtCQUFrQjtBQUNyQixHQUFDLEVBQUUsaUJBQWlCO0FBQ3BCLEdBQUMsRUFBRSxVQUFVO0NBQ2QsQ0FBQzs7O0FBRUYsSUFBTSxVQUFVLEdBQUcsaUJBQWlCLENBQUM7O0FBRTlCLFNBQVMscUJBQXFCLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUU7QUFDbkUsTUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLElBQUksRUFBRSxDQUFDO0FBQzdCLE1BQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxJQUFJLEVBQUUsQ0FBQztBQUMvQixNQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsSUFBSSxFQUFFLENBQUM7O0FBRW5DLGtDQUF1QixJQUFJLENBQUMsQ0FBQztBQUM3Qix3Q0FBMEIsSUFBSSxDQUFDLENBQUM7Q0FDakM7O0FBRUQscUJBQXFCLENBQUMsU0FBUyxHQUFHO0FBQ2hDLGFBQVcsRUFBRSxxQkFBcUI7O0FBRWxDLFFBQU0scUJBQVE7QUFDZCxLQUFHLEVBQUUsb0JBQU8sR0FBRzs7QUFFZixnQkFBYyxFQUFFLHdCQUFTLElBQUksRUFBRSxFQUFFLEVBQUU7QUFDakMsUUFBSSxnQkFBUyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssVUFBVSxFQUFFO0FBQ3RDLFVBQUksRUFBRSxFQUFFO0FBQUUsY0FBTSwyQkFBYyx5Q0FBeUMsQ0FBQyxDQUFDO09BQUU7QUFDM0Usb0JBQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztLQUM1QixNQUFNO0FBQ0wsVUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7S0FDekI7R0FDRjtBQUNELGtCQUFnQixFQUFFLDBCQUFTLElBQUksRUFBRTtBQUMvQixXQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDM0I7O0FBRUQsaUJBQWUsRUFBRSx5QkFBUyxJQUFJLEVBQUUsT0FBTyxFQUFFO0FBQ3ZDLFFBQUksZ0JBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLFVBQVUsRUFBRTtBQUN0QyxvQkFBTyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQzdCLE1BQU07QUFDTCxVQUFJLE9BQU8sT0FBTyxLQUFLLFdBQVcsRUFBRTtBQUNsQyxjQUFNLHlFQUEwRCxJQUFJLG9CQUFpQixDQUFDO09BQ3ZGO0FBQ0QsVUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUM7S0FDL0I7R0FDRjtBQUNELG1CQUFpQixFQUFFLDJCQUFTLElBQUksRUFBRTtBQUNoQyxXQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDNUI7O0FBRUQsbUJBQWlCLEVBQUUsMkJBQVMsSUFBSSxFQUFFLEVBQUUsRUFBRTtBQUNwQyxRQUFJLGdCQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxVQUFVLEVBQUU7QUFDdEMsVUFBSSxFQUFFLEVBQUU7QUFBRSxjQUFNLDJCQUFjLDRDQUE0QyxDQUFDLENBQUM7T0FBRTtBQUM5RSxvQkFBTyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQy9CLE1BQU07QUFDTCxVQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztLQUM1QjtHQUNGO0FBQ0QscUJBQW1CLEVBQUUsNkJBQVMsSUFBSSxFQUFFO0FBQ2xDLFdBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUM5QjtDQUNGLENBQUM7O0FBRUssSUFBSSxHQUFHLEdBQUcsb0JBQU8sR0FBRyxDQUFDOzs7UUFFcEIsV0FBVztRQUFFLE1BQU0iLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y3JlYXRlRnJhbWUsIGV4dGVuZCwgdG9TdHJpbmd9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IEV4Y2VwdGlvbiBmcm9tICcuL2V4Y2VwdGlvbic7XG5pbXBvcnQge3JlZ2lzdGVyRGVmYXVsdEhlbHBlcnN9IGZyb20gJy4vaGVscGVycyc7XG5pbXBvcnQge3JlZ2lzdGVyRGVmYXVsdERlY29yYXRvcnN9IGZyb20gJy4vZGVjb3JhdG9ycyc7XG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4vbG9nZ2VyJztcblxuZXhwb3J0IGNvbnN0IFZFUlNJT04gPSAnNC4wLjEwJztcbmV4cG9ydCBjb25zdCBDT01QSUxFUl9SRVZJU0lPTiA9IDc7XG5cbmV4cG9ydCBjb25zdCBSRVZJU0lPTl9DSEFOR0VTID0ge1xuICAxOiAnPD0gMS4wLnJjLjInLCAvLyAxLjAucmMuMiBpcyBhY3R1YWxseSByZXYyIGJ1dCBkb2Vzbid0IHJlcG9ydCBpdFxuICAyOiAnPT0gMS4wLjAtcmMuMycsXG4gIDM6ICc9PSAxLjAuMC1yYy40JyxcbiAgNDogJz09IDEueC54JyxcbiAgNTogJz09IDIuMC4wLWFscGhhLngnLFxuICA2OiAnPj0gMi4wLjAtYmV0YS4xJyxcbiAgNzogJz49IDQuMC4wJ1xufTtcblxuY29uc3Qgb2JqZWN0VHlwZSA9ICdbb2JqZWN0IE9iamVjdF0nO1xuXG5leHBvcnQgZnVuY3Rpb24gSGFuZGxlYmFyc0Vudmlyb25tZW50KGhlbHBlcnMsIHBhcnRpYWxzLCBkZWNvcmF0b3JzKSB7XG4gIHRoaXMuaGVscGVycyA9IGhlbHBlcnMgfHwge307XG4gIHRoaXMucGFydGlhbHMgPSBwYXJ0aWFscyB8fCB7fTtcbiAgdGhpcy5kZWNvcmF0b3JzID0gZGVjb3JhdG9ycyB8fCB7fTtcblxuICByZWdpc3RlckRlZmF1bHRIZWxwZXJzKHRoaXMpO1xuICByZWdpc3RlckRlZmF1bHREZWNvcmF0b3JzKHRoaXMpO1xufVxuXG5IYW5kbGViYXJzRW52aXJvbm1lbnQucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogSGFuZGxlYmFyc0Vudmlyb25tZW50LFxuXG4gIGxvZ2dlcjogbG9nZ2VyLFxuICBsb2c6IGxvZ2dlci5sb2csXG5cbiAgcmVnaXN0ZXJIZWxwZXI6IGZ1bmN0aW9uKG5hbWUsIGZuKSB7XG4gICAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICAgIGlmIChmbikgeyB0aHJvdyBuZXcgRXhjZXB0aW9uKCdBcmcgbm90IHN1cHBvcnRlZCB3aXRoIG11bHRpcGxlIGhlbHBlcnMnKTsgfVxuICAgICAgZXh0ZW5kKHRoaXMuaGVscGVycywgbmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaGVscGVyc1tuYW1lXSA9IGZuO1xuICAgIH1cbiAgfSxcbiAgdW5yZWdpc3RlckhlbHBlcjogZnVuY3Rpb24obmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLmhlbHBlcnNbbmFtZV07XG4gIH0sXG5cbiAgcmVnaXN0ZXJQYXJ0aWFsOiBmdW5jdGlvbihuYW1lLCBwYXJ0aWFsKSB7XG4gICAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICAgIGV4dGVuZCh0aGlzLnBhcnRpYWxzLCBuYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHR5cGVvZiBwYXJ0aWFsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKGBBdHRlbXB0aW5nIHRvIHJlZ2lzdGVyIGEgcGFydGlhbCBjYWxsZWQgXCIke25hbWV9XCIgYXMgdW5kZWZpbmVkYCk7XG4gICAgICB9XG4gICAgICB0aGlzLnBhcnRpYWxzW25hbWVdID0gcGFydGlhbDtcbiAgICB9XG4gIH0sXG4gIHVucmVnaXN0ZXJQYXJ0aWFsOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgZGVsZXRlIHRoaXMucGFydGlhbHNbbmFtZV07XG4gIH0sXG5cbiAgcmVnaXN0ZXJEZWNvcmF0b3I6IGZ1bmN0aW9uKG5hbWUsIGZuKSB7XG4gICAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICAgIGlmIChmbikgeyB0aHJvdyBuZXcgRXhjZXB0aW9uKCdBcmcgbm90IHN1cHBvcnRlZCB3aXRoIG11bHRpcGxlIGRlY29yYXRvcnMnKTsgfVxuICAgICAgZXh0ZW5kKHRoaXMuZGVjb3JhdG9ycywgbmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZGVjb3JhdG9yc1tuYW1lXSA9IGZuO1xuICAgIH1cbiAgfSxcbiAgdW5yZWdpc3RlckRlY29yYXRvcjogZnVuY3Rpb24obmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLmRlY29yYXRvcnNbbmFtZV07XG4gIH1cbn07XG5cbmV4cG9ydCBsZXQgbG9nID0gbG9nZ2VyLmxvZztcblxuZXhwb3J0IHtjcmVhdGVGcmFtZSwgbG9nZ2VyfTtcbiJdfQ==


/***/ }),
/* 16 */
/***/ (function(module, exports) {

	'use strict';

	exports.__esModule = true;
	exports.extend = extend;
	exports.indexOf = indexOf;
	exports.escapeExpression = escapeExpression;
	exports.isEmpty = isEmpty;
	exports.createFrame = createFrame;
	exports.blockParams = blockParams;
	exports.appendContextPath = appendContextPath;
	var escape = {
	  '&': '&amp;',
	  '<': '&lt;',
	  '>': '&gt;',
	  '"': '&quot;',
	  "'": '&#x27;',
	  '`': '&#x60;',
	  '=': '&#x3D;'
	};

	var badChars = /[&<>"'`=]/g,
	    possible = /[&<>"'`=]/;

	function escapeChar(chr) {
	  return escape[chr];
	}

	function extend(obj /* , ...source */) {
	  for (var i = 1; i < arguments.length; i++) {
	    for (var key in arguments[i]) {
	      if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
	        obj[key] = arguments[i][key];
	      }
	    }
	  }

	  return obj;
	}

	var toString = Object.prototype.toString;

	exports.toString = toString;
	// Sourced from lodash
	// https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
	/* eslint-disable func-style */
	var isFunction = function isFunction(value) {
	  return typeof value === 'function';
	};
	// fallback for older versions of Chrome and Safari
	/* istanbul ignore next */
	if (isFunction(/x/)) {
	  exports.isFunction = isFunction = function (value) {
	    return typeof value === 'function' && toString.call(value) === '[object Function]';
	  };
	}
	exports.isFunction = isFunction;

	/* eslint-enable func-style */

	/* istanbul ignore next */
	var isArray = Array.isArray || function (value) {
	  return value && typeof value === 'object' ? toString.call(value) === '[object Array]' : false;
	};

	exports.isArray = isArray;
	// Older IE versions do not directly support indexOf so we must implement our own, sadly.

	function indexOf(array, value) {
	  for (var i = 0, len = array.length; i < len; i++) {
	    if (array[i] === value) {
	      return i;
	    }
	  }
	  return -1;
	}

	function escapeExpression(string) {
	  if (typeof string !== 'string') {
	    // don't escape SafeStrings, since they're already safe
	    if (string && string.toHTML) {
	      return string.toHTML();
	    } else if (string == null) {
	      return '';
	    } else if (!string) {
	      return string + '';
	    }

	    // Force a string conversion as this will be done by the append regardless and
	    // the regex test will do this transparently behind the scenes, causing issues if
	    // an object's to string has escaped characters in it.
	    string = '' + string;
	  }

	  if (!possible.test(string)) {
	    return string;
	  }
	  return string.replace(badChars, escapeChar);
	}

	function isEmpty(value) {
	  if (!value && value !== 0) {
	    return true;
	  } else if (isArray(value) && value.length === 0) {
	    return true;
	  } else {
	    return false;
	  }
	}

	function createFrame(object) {
	  var frame = extend({}, object);
	  frame._parent = object;
	  return frame;
	}

	function blockParams(params, ids) {
	  params.path = ids;
	  return params;
	}

	function appendContextPath(contextPath, id) {
	  return (contextPath ? contextPath + '.' : '') + id;
	}
	//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFNLE1BQU0sR0FBRztBQUNiLEtBQUcsRUFBRSxPQUFPO0FBQ1osS0FBRyxFQUFFLE1BQU07QUFDWCxLQUFHLEVBQUUsTUFBTTtBQUNYLEtBQUcsRUFBRSxRQUFRO0FBQ2IsS0FBRyxFQUFFLFFBQVE7QUFDYixLQUFHLEVBQUUsUUFBUTtBQUNiLEtBQUcsRUFBRSxRQUFRO0NBQ2QsQ0FBQzs7QUFFRixJQUFNLFFBQVEsR0FBRyxZQUFZO0lBQ3ZCLFFBQVEsR0FBRyxXQUFXLENBQUM7O0FBRTdCLFNBQVMsVUFBVSxDQUFDLEdBQUcsRUFBRTtBQUN2QixTQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNwQjs7QUFFTSxTQUFTLE1BQU0sQ0FBQyxHQUFHLG9CQUFtQjtBQUMzQyxPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN6QyxTQUFLLElBQUksR0FBRyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUM1QixVQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUU7QUFDM0QsV0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztPQUM5QjtLQUNGO0dBQ0Y7O0FBRUQsU0FBTyxHQUFHLENBQUM7Q0FDWjs7QUFFTSxJQUFJLFFBQVEsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQzs7Ozs7O0FBS2hELElBQUksVUFBVSxHQUFHLG9CQUFTLEtBQUssRUFBRTtBQUMvQixTQUFPLE9BQU8sS0FBSyxLQUFLLFVBQVUsQ0FBQztDQUNwQyxDQUFDOzs7QUFHRixJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUNuQixVQUlNLFVBQVUsR0FKaEIsVUFBVSxHQUFHLFVBQVMsS0FBSyxFQUFFO0FBQzNCLFdBQU8sT0FBTyxLQUFLLEtBQUssVUFBVSxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssbUJBQW1CLENBQUM7R0FDcEYsQ0FBQztDQUNIO1FBQ08sVUFBVSxHQUFWLFVBQVU7Ozs7O0FBSVgsSUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sSUFBSSxVQUFTLEtBQUssRUFBRTtBQUN0RCxTQUFPLEFBQUMsS0FBSyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsR0FBSSxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLGdCQUFnQixHQUFHLEtBQUssQ0FBQztDQUNqRyxDQUFDOzs7OztBQUdLLFNBQVMsT0FBTyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUU7QUFDcEMsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNoRCxRQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLEVBQUU7QUFDdEIsYUFBTyxDQUFDLENBQUM7S0FDVjtHQUNGO0FBQ0QsU0FBTyxDQUFDLENBQUMsQ0FBQztDQUNYOztBQUdNLFNBQVMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFO0FBQ3ZDLE1BQUksT0FBTyxNQUFNLEtBQUssUUFBUSxFQUFFOztBQUU5QixRQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFO0FBQzNCLGFBQU8sTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ3hCLE1BQU0sSUFBSSxNQUFNLElBQUksSUFBSSxFQUFFO0FBQ3pCLGFBQU8sRUFBRSxDQUFDO0tBQ1gsTUFBTSxJQUFJLENBQUMsTUFBTSxFQUFFO0FBQ2xCLGFBQU8sTUFBTSxHQUFHLEVBQUUsQ0FBQztLQUNwQjs7Ozs7QUFLRCxVQUFNLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQztHQUN0Qjs7QUFFRCxNQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUFFLFdBQU8sTUFBTSxDQUFDO0dBQUU7QUFDOUMsU0FBTyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztDQUM3Qzs7QUFFTSxTQUFTLE9BQU8sQ0FBQyxLQUFLLEVBQUU7QUFDN0IsTUFBSSxDQUFDLEtBQUssSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO0FBQ3pCLFdBQU8sSUFBSSxDQUFDO0dBQ2IsTUFBTSxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUMvQyxXQUFPLElBQUksQ0FBQztHQUNiLE1BQU07QUFDTCxXQUFPLEtBQUssQ0FBQztHQUNkO0NBQ0Y7O0FBRU0sU0FBUyxXQUFXLENBQUMsTUFBTSxFQUFFO0FBQ2xDLE1BQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDL0IsT0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7QUFDdkIsU0FBTyxLQUFLLENBQUM7Q0FDZDs7QUFFTSxTQUFTLFdBQVcsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFO0FBQ3ZDLFFBQU0sQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO0FBQ2xCLFNBQU8sTUFBTSxDQUFDO0NBQ2Y7O0FBRU0sU0FBUyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsRUFBRSxFQUFFO0FBQ2pELFNBQU8sQ0FBQyxXQUFXLEdBQUcsV0FBVyxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUEsR0FBSSxFQUFFLENBQUM7Q0FDcEQiLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBlc2NhcGUgPSB7XG4gICcmJzogJyZhbXA7JyxcbiAgJzwnOiAnJmx0OycsXG4gICc+JzogJyZndDsnLFxuICAnXCInOiAnJnF1b3Q7JyxcbiAgXCInXCI6ICcmI3gyNzsnLFxuICAnYCc6ICcmI3g2MDsnLFxuICAnPSc6ICcmI3gzRDsnXG59O1xuXG5jb25zdCBiYWRDaGFycyA9IC9bJjw+XCInYD1dL2csXG4gICAgICBwb3NzaWJsZSA9IC9bJjw+XCInYD1dLztcblxuZnVuY3Rpb24gZXNjYXBlQ2hhcihjaHIpIHtcbiAgcmV0dXJuIGVzY2FwZVtjaHJdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXh0ZW5kKG9iai8qICwgLi4uc291cmNlICovKSB7XG4gIGZvciAobGV0IGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgZm9yIChsZXQga2V5IGluIGFyZ3VtZW50c1tpXSkge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChhcmd1bWVudHNbaV0sIGtleSkpIHtcbiAgICAgICAgb2JqW2tleV0gPSBhcmd1bWVudHNbaV1ba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG5leHBvcnQgbGV0IHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLy8gU291cmNlZCBmcm9tIGxvZGFzaFxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2Jlc3RpZWpzL2xvZGFzaC9ibG9iL21hc3Rlci9MSUNFTlNFLnR4dFxuLyogZXNsaW50LWRpc2FibGUgZnVuYy1zdHlsZSAqL1xubGV0IGlzRnVuY3Rpb24gPSBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nO1xufTtcbi8vIGZhbGxiYWNrIGZvciBvbGRlciB2ZXJzaW9ucyBvZiBDaHJvbWUgYW5kIFNhZmFyaVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmlmIChpc0Z1bmN0aW9uKC94LykpIHtcbiAgaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbiAgfTtcbn1cbmV4cG9ydCB7aXNGdW5jdGlvbn07XG4vKiBlc2xpbnQtZW5hYmxlIGZ1bmMtc3R5bGUgKi9cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmV4cG9ydCBjb25zdCBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpID8gdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IEFycmF5XScgOiBmYWxzZTtcbn07XG5cbi8vIE9sZGVyIElFIHZlcnNpb25zIGRvIG5vdCBkaXJlY3RseSBzdXBwb3J0IGluZGV4T2Ygc28gd2UgbXVzdCBpbXBsZW1lbnQgb3VyIG93biwgc2FkbHkuXG5leHBvcnQgZnVuY3Rpb24gaW5kZXhPZihhcnJheSwgdmFsdWUpIHtcbiAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IGFycmF5Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKGFycmF5W2ldID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICB9XG4gIHJldHVybiAtMTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZXNjYXBlRXhwcmVzc2lvbihzdHJpbmcpIHtcbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgLy8gZG9uJ3QgZXNjYXBlIFNhZmVTdHJpbmdzLCBzaW5jZSB0aGV5J3JlIGFscmVhZHkgc2FmZVxuICAgIGlmIChzdHJpbmcgJiYgc3RyaW5nLnRvSFRNTCkge1xuICAgICAgcmV0dXJuIHN0cmluZy50b0hUTUwoKTtcbiAgICB9IGVsc2UgaWYgKHN0cmluZyA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfSBlbHNlIGlmICghc3RyaW5nKSB7XG4gICAgICByZXR1cm4gc3RyaW5nICsgJyc7XG4gICAgfVxuXG4gICAgLy8gRm9yY2UgYSBzdHJpbmcgY29udmVyc2lvbiBhcyB0aGlzIHdpbGwgYmUgZG9uZSBieSB0aGUgYXBwZW5kIHJlZ2FyZGxlc3MgYW5kXG4gICAgLy8gdGhlIHJlZ2V4IHRlc3Qgd2lsbCBkbyB0aGlzIHRyYW5zcGFyZW50bHkgYmVoaW5kIHRoZSBzY2VuZXMsIGNhdXNpbmcgaXNzdWVzIGlmXG4gICAgLy8gYW4gb2JqZWN0J3MgdG8gc3RyaW5nIGhhcyBlc2NhcGVkIGNoYXJhY3RlcnMgaW4gaXQuXG4gICAgc3RyaW5nID0gJycgKyBzdHJpbmc7XG4gIH1cblxuICBpZiAoIXBvc3NpYmxlLnRlc3Qoc3RyaW5nKSkgeyByZXR1cm4gc3RyaW5nOyB9XG4gIHJldHVybiBzdHJpbmcucmVwbGFjZShiYWRDaGFycywgZXNjYXBlQ2hhcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0VtcHR5KHZhbHVlKSB7XG4gIGlmICghdmFsdWUgJiYgdmFsdWUgIT09IDApIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIGlmIChpc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUZyYW1lKG9iamVjdCkge1xuICBsZXQgZnJhbWUgPSBleHRlbmQoe30sIG9iamVjdCk7XG4gIGZyYW1lLl9wYXJlbnQgPSBvYmplY3Q7XG4gIHJldHVybiBmcmFtZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJsb2NrUGFyYW1zKHBhcmFtcywgaWRzKSB7XG4gIHBhcmFtcy5wYXRoID0gaWRzO1xuICByZXR1cm4gcGFyYW1zO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBwZW5kQ29udGV4dFBhdGgoY29udGV4dFBhdGgsIGlkKSB7XG4gIHJldHVybiAoY29udGV4dFBhdGggPyBjb250ZXh0UGF0aCArICcuJyA6ICcnKSArIGlkO1xufVxuIl19


/***/ }),
/* 17 */
/***/ (function(module, exports) {

	'use strict';

	exports.__esModule = true;

	var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

	function Exception(message, node) {
	  var loc = node && node.loc,
	      line = undefined,
	      column = undefined;
	  if (loc) {
	    line = loc.start.line;
	    column = loc.start.column;

	    message += ' - ' + line + ':' + column;
	  }

	  var tmp = Error.prototype.constructor.call(this, message);

	  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
	  for (var idx = 0; idx < errorProps.length; idx++) {
	    this[errorProps[idx]] = tmp[errorProps[idx]];
	  }

	  /* istanbul ignore else */
	  if (Error.captureStackTrace) {
	    Error.captureStackTrace(this, Exception);
	  }

	  try {
	    if (loc) {
	      this.lineNumber = line;

	      // Work around issue under safari where we can't directly set the column value
	      /* istanbul ignore next */
	      if (Object.defineProperty) {
	        Object.defineProperty(this, 'column', {
	          value: column,
	          enumerable: true
	        });
	      } else {
	        this.column = column;
	      }
	    }
	  } catch (nop) {
	    /* Ignore if the browser is very particular */
	  }
	}

	Exception.prototype = new Error();

	exports['default'] = Exception;
	module.exports = exports['default'];
	//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2V4Y2VwdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQ0EsSUFBTSxVQUFVLEdBQUcsQ0FBQyxhQUFhLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQzs7QUFFbkcsU0FBUyxTQUFTLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRTtBQUNoQyxNQUFJLEdBQUcsR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUc7TUFDdEIsSUFBSSxZQUFBO01BQ0osTUFBTSxZQUFBLENBQUM7QUFDWCxNQUFJLEdBQUcsRUFBRTtBQUNQLFFBQUksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztBQUN0QixVQUFNLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7O0FBRTFCLFdBQU8sSUFBSSxLQUFLLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUM7R0FDeEM7O0FBRUQsTUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQzs7O0FBRzFELE9BQUssSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFO0FBQ2hELFFBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7R0FDOUM7OztBQUdELE1BQUksS0FBSyxDQUFDLGlCQUFpQixFQUFFO0FBQzNCLFNBQUssQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7R0FDMUM7O0FBRUQsTUFBSTtBQUNGLFFBQUksR0FBRyxFQUFFO0FBQ1AsVUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7Ozs7QUFJdkIsVUFBSSxNQUFNLENBQUMsY0FBYyxFQUFFO0FBQ3pCLGNBQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRTtBQUNwQyxlQUFLLEVBQUUsTUFBTTtBQUNiLG9CQUFVLEVBQUUsSUFBSTtTQUNqQixDQUFDLENBQUM7T0FDSixNQUFNO0FBQ0wsWUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7T0FDdEI7S0FDRjtHQUNGLENBQUMsT0FBTyxHQUFHLEVBQUU7O0dBRWI7Q0FDRjs7QUFFRCxTQUFTLENBQUMsU0FBUyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7O3FCQUVuQixTQUFTIiwiZmlsZSI6ImV4Y2VwdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuY29uc3QgZXJyb3JQcm9wcyA9IFsnZGVzY3JpcHRpb24nLCAnZmlsZU5hbWUnLCAnbGluZU51bWJlcicsICdtZXNzYWdlJywgJ25hbWUnLCAnbnVtYmVyJywgJ3N0YWNrJ107XG5cbmZ1bmN0aW9uIEV4Y2VwdGlvbihtZXNzYWdlLCBub2RlKSB7XG4gIGxldCBsb2MgPSBub2RlICYmIG5vZGUubG9jLFxuICAgICAgbGluZSxcbiAgICAgIGNvbHVtbjtcbiAgaWYgKGxvYykge1xuICAgIGxpbmUgPSBsb2Muc3RhcnQubGluZTtcbiAgICBjb2x1bW4gPSBsb2Muc3RhcnQuY29sdW1uO1xuXG4gICAgbWVzc2FnZSArPSAnIC0gJyArIGxpbmUgKyAnOicgKyBjb2x1bW47XG4gIH1cblxuICBsZXQgdG1wID0gRXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yLmNhbGwodGhpcywgbWVzc2FnZSk7XG5cbiAgLy8gVW5mb3J0dW5hdGVseSBlcnJvcnMgYXJlIG5vdCBlbnVtZXJhYmxlIGluIENocm9tZSAoYXQgbGVhc3QpLCBzbyBgZm9yIHByb3AgaW4gdG1wYCBkb2Vzbid0IHdvcmsuXG4gIGZvciAobGV0IGlkeCA9IDA7IGlkeCA8IGVycm9yUHJvcHMubGVuZ3RoOyBpZHgrKykge1xuICAgIHRoaXNbZXJyb3JQcm9wc1tpZHhdXSA9IHRtcFtlcnJvclByb3BzW2lkeF1dO1xuICB9XG5cbiAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgaWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKSB7XG4gICAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgRXhjZXB0aW9uKTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgaWYgKGxvYykge1xuICAgICAgdGhpcy5saW5lTnVtYmVyID0gbGluZTtcblxuICAgICAgLy8gV29yayBhcm91bmQgaXNzdWUgdW5kZXIgc2FmYXJpIHdoZXJlIHdlIGNhbid0IGRpcmVjdGx5IHNldCB0aGUgY29sdW1uIHZhbHVlXG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgaWYgKE9iamVjdC5kZWZpbmVQcm9wZXJ0eSkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2NvbHVtbicsIHtcbiAgICAgICAgICB2YWx1ZTogY29sdW1uLFxuICAgICAgICAgIGVudW1lcmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNvbHVtbiA9IGNvbHVtbjtcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKG5vcCkge1xuICAgIC8qIElnbm9yZSBpZiB0aGUgYnJvd3NlciBpcyB2ZXJ5IHBhcnRpY3VsYXIgKi9cbiAgfVxufVxuXG5FeGNlcHRpb24ucHJvdG90eXBlID0gbmV3IEVycm9yKCk7XG5cbmV4cG9ydCBkZWZhdWx0IEV4Y2VwdGlvbjtcbiJdfQ==


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports.registerDefaultHelpers = registerDefaultHelpers;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _helpersBlockHelperMissing = __webpack_require__(19);

	var _helpersBlockHelperMissing2 = _interopRequireDefault(_helpersBlockHelperMissing);

	var _helpersEach = __webpack_require__(20);

	var _helpersEach2 = _interopRequireDefault(_helpersEach);

	var _helpersHelperMissing = __webpack_require__(21);

	var _helpersHelperMissing2 = _interopRequireDefault(_helpersHelperMissing);

	var _helpersIf = __webpack_require__(22);

	var _helpersIf2 = _interopRequireDefault(_helpersIf);

	var _helpersLog = __webpack_require__(23);

	var _helpersLog2 = _interopRequireDefault(_helpersLog);

	var _helpersLookup = __webpack_require__(24);

	var _helpersLookup2 = _interopRequireDefault(_helpersLookup);

	var _helpersWith = __webpack_require__(25);

	var _helpersWith2 = _interopRequireDefault(_helpersWith);

	function registerDefaultHelpers(instance) {
	  _helpersBlockHelperMissing2['default'](instance);
	  _helpersEach2['default'](instance);
	  _helpersHelperMissing2['default'](instance);
	  _helpersIf2['default'](instance);
	  _helpersLog2['default'](instance);
	  _helpersLookup2['default'](instance);
	  _helpersWith2['default'](instance);
	}
	//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2hlbHBlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7eUNBQXVDLGdDQUFnQzs7OzsyQkFDOUMsZ0JBQWdCOzs7O29DQUNQLDBCQUEwQjs7Ozt5QkFDckMsY0FBYzs7OzswQkFDYixlQUFlOzs7OzZCQUNaLGtCQUFrQjs7OzsyQkFDcEIsZ0JBQWdCOzs7O0FBRWxDLFNBQVMsc0JBQXNCLENBQUMsUUFBUSxFQUFFO0FBQy9DLHlDQUEyQixRQUFRLENBQUMsQ0FBQztBQUNyQywyQkFBYSxRQUFRLENBQUMsQ0FBQztBQUN2QixvQ0FBc0IsUUFBUSxDQUFDLENBQUM7QUFDaEMseUJBQVcsUUFBUSxDQUFDLENBQUM7QUFDckIsMEJBQVksUUFBUSxDQUFDLENBQUM7QUFDdEIsNkJBQWUsUUFBUSxDQUFDLENBQUM7QUFDekIsMkJBQWEsUUFBUSxDQUFDLENBQUM7Q0FDeEIiLCJmaWxlIjoiaGVscGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCByZWdpc3RlckJsb2NrSGVscGVyTWlzc2luZyBmcm9tICcuL2hlbHBlcnMvYmxvY2staGVscGVyLW1pc3NpbmcnO1xuaW1wb3J0IHJlZ2lzdGVyRWFjaCBmcm9tICcuL2hlbHBlcnMvZWFjaCc7XG5pbXBvcnQgcmVnaXN0ZXJIZWxwZXJNaXNzaW5nIGZyb20gJy4vaGVscGVycy9oZWxwZXItbWlzc2luZyc7XG5pbXBvcnQgcmVnaXN0ZXJJZiBmcm9tICcuL2hlbHBlcnMvaWYnO1xuaW1wb3J0IHJlZ2lzdGVyTG9nIGZyb20gJy4vaGVscGVycy9sb2cnO1xuaW1wb3J0IHJlZ2lzdGVyTG9va3VwIGZyb20gJy4vaGVscGVycy9sb29rdXAnO1xuaW1wb3J0IHJlZ2lzdGVyV2l0aCBmcm9tICcuL2hlbHBlcnMvd2l0aCc7XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckRlZmF1bHRIZWxwZXJzKGluc3RhbmNlKSB7XG4gIHJlZ2lzdGVyQmxvY2tIZWxwZXJNaXNzaW5nKGluc3RhbmNlKTtcbiAgcmVnaXN0ZXJFYWNoKGluc3RhbmNlKTtcbiAgcmVnaXN0ZXJIZWxwZXJNaXNzaW5nKGluc3RhbmNlKTtcbiAgcmVnaXN0ZXJJZihpbnN0YW5jZSk7XG4gIHJlZ2lzdGVyTG9nKGluc3RhbmNlKTtcbiAgcmVnaXN0ZXJMb29rdXAoaW5zdGFuY2UpO1xuICByZWdpc3RlcldpdGgoaW5zdGFuY2UpO1xufVxuIl19


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _utils = __webpack_require__(16);

	exports['default'] = function (instance) {
	  instance.registerHelper('blockHelperMissing', function (context, options) {
	    var inverse = options.inverse,
	        fn = options.fn;

	    if (context === true) {
	      return fn(this);
	    } else if (context === false || context == null) {
	      return inverse(this);
	    } else if (_utils.isArray(context)) {
	      if (context.length > 0) {
	        if (options.ids) {
	          options.ids = [options.name];
	        }

	        return instance.helpers.each(context, options);
	      } else {
	        return inverse(this);
	      }
	    } else {
	      if (options.data && options.ids) {
	        var data = _utils.createFrame(options.data);
	        data.contextPath = _utils.appendContextPath(options.data.contextPath, options.name);
	        options = { data: data };
	      }

	      return fn(context, options);
	    }
	  });
	};

	module.exports = exports['default'];
	//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2hlbHBlcnMvYmxvY2staGVscGVyLW1pc3NpbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztxQkFBc0QsVUFBVTs7cUJBRWpELFVBQVMsUUFBUSxFQUFFO0FBQ2hDLFVBQVEsQ0FBQyxjQUFjLENBQUMsb0JBQW9CLEVBQUUsVUFBUyxPQUFPLEVBQUUsT0FBTyxFQUFFO0FBQ3ZFLFFBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPO1FBQ3pCLEVBQUUsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDOztBQUVwQixRQUFJLE9BQU8sS0FBSyxJQUFJLEVBQUU7QUFDcEIsYUFBTyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDakIsTUFBTSxJQUFJLE9BQU8sS0FBSyxLQUFLLElBQUksT0FBTyxJQUFJLElBQUksRUFBRTtBQUMvQyxhQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUN0QixNQUFNLElBQUksZUFBUSxPQUFPLENBQUMsRUFBRTtBQUMzQixVQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQ3RCLFlBQUksT0FBTyxDQUFDLEdBQUcsRUFBRTtBQUNmLGlCQUFPLENBQUMsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzlCOztBQUVELGVBQU8sUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO09BQ2hELE1BQU07QUFDTCxlQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUN0QjtLQUNGLE1BQU07QUFDTCxVQUFJLE9BQU8sQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLEdBQUcsRUFBRTtBQUMvQixZQUFJLElBQUksR0FBRyxtQkFBWSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDckMsWUFBSSxDQUFDLFdBQVcsR0FBRyx5QkFBa0IsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzdFLGVBQU8sR0FBRyxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUMsQ0FBQztPQUN4Qjs7QUFFRCxhQUFPLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDN0I7R0FDRixDQUFDLENBQUM7Q0FDSiIsImZpbGUiOiJibG9jay1oZWxwZXItbWlzc2luZy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7YXBwZW5kQ29udGV4dFBhdGgsIGNyZWF0ZUZyYW1lLCBpc0FycmF5fSBmcm9tICcuLi91dGlscyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGluc3RhbmNlKSB7XG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdibG9ja0hlbHBlck1pc3NpbmcnLCBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgbGV0IGludmVyc2UgPSBvcHRpb25zLmludmVyc2UsXG4gICAgICAgIGZuID0gb3B0aW9ucy5mbjtcblxuICAgIGlmIChjb250ZXh0ID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gZm4odGhpcyk7XG4gICAgfSBlbHNlIGlmIChjb250ZXh0ID09PSBmYWxzZSB8fCBjb250ZXh0ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheShjb250ZXh0KSkge1xuICAgICAgaWYgKGNvbnRleHQubGVuZ3RoID4gMCkge1xuICAgICAgICBpZiAob3B0aW9ucy5pZHMpIHtcbiAgICAgICAgICBvcHRpb25zLmlkcyA9IFtvcHRpb25zLm5hbWVdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGluc3RhbmNlLmhlbHBlcnMuZWFjaChjb250ZXh0LCBvcHRpb25zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAob3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuaWRzKSB7XG4gICAgICAgIGxldCBkYXRhID0gY3JlYXRlRnJhbWUob3B0aW9ucy5kYXRhKTtcbiAgICAgICAgZGF0YS5jb250ZXh0UGF0aCA9IGFwcGVuZENvbnRleHRQYXRoKG9wdGlvbnMuZGF0YS5jb250ZXh0UGF0aCwgb3B0aW9ucy5uYW1lKTtcbiAgICAgICAgb3B0aW9ucyA9IHtkYXRhOiBkYXRhfTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZuKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH1cbiAgfSk7XG59XG4iXX0=


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _utils = __webpack_require__(16);

	var _exception = __webpack_require__(17);

	var _exception2 = _interopRequireDefault(_exception);

	exports['default'] = function (instance) {
	  instance.registerHelper('each', function (context, options) {
	    if (!options) {
	      throw new _exception2['default']('Must pass iterator to #each');
	    }

	    var fn = options.fn,
	        inverse = options.inverse,
	        i = 0,
	        ret = '',
	        data = undefined,
	        contextPath = undefined;

	    if (options.data && options.ids) {
	      contextPath = _utils.appendContextPath(options.data.contextPath, options.ids[0]) + '.';
	    }

	    if (_utils.isFunction(context)) {
	      context = context.call(this);
	    }

	    if (options.data) {
	      data = _utils.createFrame(options.data);
	    }

	    function execIteration(field, index, last) {
	      if (data) {
	        data.key = field;
	        data.index = index;
	        data.first = index === 0;
	        data.last = !!last;

	        if (contextPath) {
	          data.contextPath = contextPath + field;
	        }
	      }

	      ret = ret + fn(context[field], {
	        data: data,
	        blockParams: _utils.blockParams([context[field], field], [contextPath + field, null])
	      });
	    }

	    if (context && typeof context === 'object') {
	      if (_utils.isArray(context)) {
	        for (var j = context.length; i < j; i++) {
	          if (i in context) {
	            execIteration(i, i, i === context.length - 1);
	          }
	        }
	      } else {
	        var priorKey = undefined;

	        for (var key in context) {
	          if (context.hasOwnProperty(key)) {
	            // We're running the iterations one step out of sync so we can detect
	            // the last iteration without have to scan the object twice and create
	            // an itermediate keys array.
	            if (priorKey !== undefined) {
	              execIteration(priorKey, i - 1);
	            }
	            priorKey = key;
	            i++;
	          }
	        }
	        if (priorKey !== undefined) {
	          execIteration(priorKey, i - 1, true);
	        }
	      }
	    }

	    if (i === 0) {
	      ret = inverse(this);
	    }

	    return ret;
	  });
	};

	module.exports = exports['default'];
	//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2hlbHBlcnMvZWFjaC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O3FCQUErRSxVQUFVOzt5QkFDbkUsY0FBYzs7OztxQkFFckIsVUFBUyxRQUFRLEVBQUU7QUFDaEMsVUFBUSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsVUFBUyxPQUFPLEVBQUUsT0FBTyxFQUFFO0FBQ3pELFFBQUksQ0FBQyxPQUFPLEVBQUU7QUFDWixZQUFNLDJCQUFjLDZCQUE2QixDQUFDLENBQUM7S0FDcEQ7O0FBRUQsUUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLEVBQUU7UUFDZixPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU87UUFDekIsQ0FBQyxHQUFHLENBQUM7UUFDTCxHQUFHLEdBQUcsRUFBRTtRQUNSLElBQUksWUFBQTtRQUNKLFdBQVcsWUFBQSxDQUFDOztBQUVoQixRQUFJLE9BQU8sQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLEdBQUcsRUFBRTtBQUMvQixpQkFBVyxHQUFHLHlCQUFrQixPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0tBQ2pGOztBQUVELFFBQUksa0JBQVcsT0FBTyxDQUFDLEVBQUU7QUFBRSxhQUFPLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUFFOztBQUUxRCxRQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUU7QUFDaEIsVUFBSSxHQUFHLG1CQUFZLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNsQzs7QUFFRCxhQUFTLGFBQWEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtBQUN6QyxVQUFJLElBQUksRUFBRTtBQUNSLFlBQUksQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDO0FBQ2pCLFlBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ25CLFlBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxLQUFLLENBQUMsQ0FBQztBQUN6QixZQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7O0FBRW5CLFlBQUksV0FBVyxFQUFFO0FBQ2YsY0FBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLEdBQUcsS0FBSyxDQUFDO1NBQ3hDO09BQ0Y7O0FBRUQsU0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQzdCLFlBQUksRUFBRSxJQUFJO0FBQ1YsbUJBQVcsRUFBRSxtQkFBWSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLFdBQVcsR0FBRyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7T0FDL0UsQ0FBQyxDQUFDO0tBQ0o7O0FBRUQsUUFBSSxPQUFPLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFO0FBQzFDLFVBQUksZUFBUSxPQUFPLENBQUMsRUFBRTtBQUNwQixhQUFLLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN2QyxjQUFJLENBQUMsSUFBSSxPQUFPLEVBQUU7QUFDaEIseUJBQWEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1dBQy9DO1NBQ0Y7T0FDRixNQUFNO0FBQ0wsWUFBSSxRQUFRLFlBQUEsQ0FBQzs7QUFFYixhQUFLLElBQUksR0FBRyxJQUFJLE9BQU8sRUFBRTtBQUN2QixjQUFJLE9BQU8sQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUU7Ozs7QUFJL0IsZ0JBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTtBQUMxQiwyQkFBYSxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDaEM7QUFDRCxvQkFBUSxHQUFHLEdBQUcsQ0FBQztBQUNmLGFBQUMsRUFBRSxDQUFDO1dBQ0w7U0FDRjtBQUNELFlBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTtBQUMxQix1QkFBYSxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3RDO09BQ0Y7S0FDRjs7QUFFRCxRQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDWCxTQUFHLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ3JCOztBQUVELFdBQU8sR0FBRyxDQUFDO0dBQ1osQ0FBQyxDQUFDO0NBQ0oiLCJmaWxlIjoiZWFjaC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7YXBwZW5kQ29udGV4dFBhdGgsIGJsb2NrUGFyYW1zLCBjcmVhdGVGcmFtZSwgaXNBcnJheSwgaXNGdW5jdGlvbn0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IEV4Y2VwdGlvbiBmcm9tICcuLi9leGNlcHRpb24nO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihpbnN0YW5jZSkge1xuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignZWFjaCcsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICBpZiAoIW9wdGlvbnMpIHtcbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oJ011c3QgcGFzcyBpdGVyYXRvciB0byAjZWFjaCcpO1xuICAgIH1cblxuICAgIGxldCBmbiA9IG9wdGlvbnMuZm4sXG4gICAgICAgIGludmVyc2UgPSBvcHRpb25zLmludmVyc2UsXG4gICAgICAgIGkgPSAwLFxuICAgICAgICByZXQgPSAnJyxcbiAgICAgICAgZGF0YSxcbiAgICAgICAgY29udGV4dFBhdGg7XG5cbiAgICBpZiAob3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuaWRzKSB7XG4gICAgICBjb250ZXh0UGF0aCA9IGFwcGVuZENvbnRleHRQYXRoKG9wdGlvbnMuZGF0YS5jb250ZXh0UGF0aCwgb3B0aW9ucy5pZHNbMF0pICsgJy4nO1xuICAgIH1cblxuICAgIGlmIChpc0Z1bmN0aW9uKGNvbnRleHQpKSB7IGNvbnRleHQgPSBjb250ZXh0LmNhbGwodGhpcyk7IH1cblxuICAgIGlmIChvcHRpb25zLmRhdGEpIHtcbiAgICAgIGRhdGEgPSBjcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV4ZWNJdGVyYXRpb24oZmllbGQsIGluZGV4LCBsYXN0KSB7XG4gICAgICBpZiAoZGF0YSkge1xuICAgICAgICBkYXRhLmtleSA9IGZpZWxkO1xuICAgICAgICBkYXRhLmluZGV4ID0gaW5kZXg7XG4gICAgICAgIGRhdGEuZmlyc3QgPSBpbmRleCA9PT0gMDtcbiAgICAgICAgZGF0YS5sYXN0ID0gISFsYXN0O1xuXG4gICAgICAgIGlmIChjb250ZXh0UGF0aCkge1xuICAgICAgICAgIGRhdGEuY29udGV4dFBhdGggPSBjb250ZXh0UGF0aCArIGZpZWxkO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldCA9IHJldCArIGZuKGNvbnRleHRbZmllbGRdLCB7XG4gICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgIGJsb2NrUGFyYW1zOiBibG9ja1BhcmFtcyhbY29udGV4dFtmaWVsZF0sIGZpZWxkXSwgW2NvbnRleHRQYXRoICsgZmllbGQsIG51bGxdKVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKGNvbnRleHQgJiYgdHlwZW9mIGNvbnRleHQgPT09ICdvYmplY3QnKSB7XG4gICAgICBpZiAoaXNBcnJheShjb250ZXh0KSkge1xuICAgICAgICBmb3IgKGxldCBqID0gY29udGV4dC5sZW5ndGg7IGkgPCBqOyBpKyspIHtcbiAgICAgICAgICBpZiAoaSBpbiBjb250ZXh0KSB7XG4gICAgICAgICAgICBleGVjSXRlcmF0aW9uKGksIGksIGkgPT09IGNvbnRleHQubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgcHJpb3JLZXk7XG5cbiAgICAgICAgZm9yIChsZXQga2V5IGluIGNvbnRleHQpIHtcbiAgICAgICAgICBpZiAoY29udGV4dC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAvLyBXZSdyZSBydW5uaW5nIHRoZSBpdGVyYXRpb25zIG9uZSBzdGVwIG91dCBvZiBzeW5jIHNvIHdlIGNhbiBkZXRlY3RcbiAgICAgICAgICAgIC8vIHRoZSBsYXN0IGl0ZXJhdGlvbiB3aXRob3V0IGhhdmUgdG8gc2NhbiB0aGUgb2JqZWN0IHR3aWNlIGFuZCBjcmVhdGVcbiAgICAgICAgICAgIC8vIGFuIGl0ZXJtZWRpYXRlIGtleXMgYXJyYXkuXG4gICAgICAgICAgICBpZiAocHJpb3JLZXkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICBleGVjSXRlcmF0aW9uKHByaW9yS2V5LCBpIC0gMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwcmlvcktleSA9IGtleTtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByaW9yS2V5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBleGVjSXRlcmF0aW9uKHByaW9yS2V5LCBpIC0gMSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgcmV0ID0gaW52ZXJzZSh0aGlzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmV0O1xuICB9KTtcbn1cbiJdfQ==


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _exception = __webpack_require__(17);

	var _exception2 = _interopRequireDefault(_exception);

	exports['default'] = function (instance) {
	  instance.registerHelper('helperMissing', function () /* [args, ]options */{
	    if (arguments.length === 1) {
	      // A missing field in a {{foo}} construct.
	      return undefined;
	    } else {
	      // Someone is actually trying to call something, blow up.
	      throw new _exception2['default']('Missing helper: "' + arguments[arguments.length - 1].name + '"');
	    }
	  });
	};

	module.exports = exports['default'];
	//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2hlbHBlcnMvaGVscGVyLW1pc3NpbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozt5QkFBc0IsY0FBYzs7OztxQkFFckIsVUFBUyxRQUFRLEVBQUU7QUFDaEMsVUFBUSxDQUFDLGNBQWMsQ0FBQyxlQUFlLEVBQUUsaUNBQWdDO0FBQ3ZFLFFBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7O0FBRTFCLGFBQU8sU0FBUyxDQUFDO0tBQ2xCLE1BQU07O0FBRUwsWUFBTSwyQkFBYyxtQkFBbUIsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7S0FDdkY7R0FDRixDQUFDLENBQUM7Q0FDSiIsImZpbGUiOiJoZWxwZXItbWlzc2luZy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBFeGNlcHRpb24gZnJvbSAnLi4vZXhjZXB0aW9uJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oaW5zdGFuY2UpIHtcbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2hlbHBlck1pc3NpbmcnLCBmdW5jdGlvbigvKiBbYXJncywgXW9wdGlvbnMgKi8pIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgLy8gQSBtaXNzaW5nIGZpZWxkIGluIGEge3tmb299fSBjb25zdHJ1Y3QuXG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBTb21lb25lIGlzIGFjdHVhbGx5IHRyeWluZyB0byBjYWxsIHNvbWV0aGluZywgYmxvdyB1cC5cbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oJ01pc3NpbmcgaGVscGVyOiBcIicgKyBhcmd1bWVudHNbYXJndW1lbnRzLmxlbmd0aCAtIDFdLm5hbWUgKyAnXCInKTtcbiAgICB9XG4gIH0pO1xufVxuIl19


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _utils = __webpack_require__(16);

	exports['default'] = function (instance) {
	  instance.registerHelper('if', function (conditional, options) {
	    if (_utils.isFunction(conditional)) {
	      conditional = conditional.call(this);
	    }

	    // Default behavior is to render the positive path if the value is truthy and not empty.
	    // The `includeZero` option may be set to treat the condtional as purely not empty based on the
	    // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
	    if (!options.hash.includeZero && !conditional || _utils.isEmpty(conditional)) {
	      return options.inverse(this);
	    } else {
	      return options.fn(this);
	    }
	  });

	  instance.registerHelper('unless', function (conditional, options) {
	    return instance.helpers['if'].call(this, conditional, { fn: options.inverse, inverse: options.fn, hash: options.hash });
	  });
	};

	module.exports = exports['default'];
	//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2hlbHBlcnMvaWYuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztxQkFBa0MsVUFBVTs7cUJBRTdCLFVBQVMsUUFBUSxFQUFFO0FBQ2hDLFVBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFVBQVMsV0FBVyxFQUFFLE9BQU8sRUFBRTtBQUMzRCxRQUFJLGtCQUFXLFdBQVcsQ0FBQyxFQUFFO0FBQUUsaUJBQVcsR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQUU7Ozs7O0FBS3RFLFFBQUksQUFBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsV0FBVyxJQUFLLGVBQVEsV0FBVyxDQUFDLEVBQUU7QUFDdkUsYUFBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQzlCLE1BQU07QUFDTCxhQUFPLE9BQU8sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDekI7R0FDRixDQUFDLENBQUM7O0FBRUgsVUFBUSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsVUFBUyxXQUFXLEVBQUUsT0FBTyxFQUFFO0FBQy9ELFdBQU8sUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxFQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQztHQUN2SCxDQUFDLENBQUM7Q0FDSiIsImZpbGUiOiJpZi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aXNFbXB0eSwgaXNGdW5jdGlvbn0gZnJvbSAnLi4vdXRpbHMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihpbnN0YW5jZSkge1xuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignaWYnLCBmdW5jdGlvbihjb25kaXRpb25hbCwgb3B0aW9ucykge1xuICAgIGlmIChpc0Z1bmN0aW9uKGNvbmRpdGlvbmFsKSkgeyBjb25kaXRpb25hbCA9IGNvbmRpdGlvbmFsLmNhbGwodGhpcyk7IH1cblxuICAgIC8vIERlZmF1bHQgYmVoYXZpb3IgaXMgdG8gcmVuZGVyIHRoZSBwb3NpdGl2ZSBwYXRoIGlmIHRoZSB2YWx1ZSBpcyB0cnV0aHkgYW5kIG5vdCBlbXB0eS5cbiAgICAvLyBUaGUgYGluY2x1ZGVaZXJvYCBvcHRpb24gbWF5IGJlIHNldCB0byB0cmVhdCB0aGUgY29uZHRpb25hbCBhcyBwdXJlbHkgbm90IGVtcHR5IGJhc2VkIG9uIHRoZVxuICAgIC8vIGJlaGF2aW9yIG9mIGlzRW1wdHkuIEVmZmVjdGl2ZWx5IHRoaXMgZGV0ZXJtaW5lcyBpZiAwIGlzIGhhbmRsZWQgYnkgdGhlIHBvc2l0aXZlIHBhdGggb3IgbmVnYXRpdmUuXG4gICAgaWYgKCghb3B0aW9ucy5oYXNoLmluY2x1ZGVaZXJvICYmICFjb25kaXRpb25hbCkgfHwgaXNFbXB0eShjb25kaXRpb25hbCkpIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgIH1cbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ3VubGVzcycsIGZ1bmN0aW9uKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIGluc3RhbmNlLmhlbHBlcnNbJ2lmJ10uY2FsbCh0aGlzLCBjb25kaXRpb25hbCwge2ZuOiBvcHRpb25zLmludmVyc2UsIGludmVyc2U6IG9wdGlvbnMuZm4sIGhhc2g6IG9wdGlvbnMuaGFzaH0pO1xuICB9KTtcbn1cbiJdfQ==


/***/ }),
/* 23 */
/***/ (function(module, exports) {

	'use strict';

	exports.__esModule = true;

	exports['default'] = function (instance) {
	  instance.registerHelper('log', function () /* message, options */{
	    var args = [undefined],
	        options = arguments[arguments.length - 1];
	    for (var i = 0; i < arguments.length - 1; i++) {
	      args.push(arguments[i]);
	    }

	    var level = 1;
	    if (options.hash.level != null) {
	      level = options.hash.level;
	    } else if (options.data && options.data.level != null) {
	      level = options.data.level;
	    }
	    args[0] = level;

	    instance.log.apply(instance, args);
	  });
	};

	module.exports = exports['default'];
	//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2hlbHBlcnMvbG9nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7cUJBQWUsVUFBUyxRQUFRLEVBQUU7QUFDaEMsVUFBUSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsa0NBQWlDO0FBQzlELFFBQUksSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDO1FBQ2xCLE9BQU8sR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM5QyxTQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDN0MsVUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUN6Qjs7QUFFRCxRQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDZCxRQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksRUFBRTtBQUM5QixXQUFLLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7S0FDNUIsTUFBTSxJQUFJLE9BQU8sQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxFQUFFO0FBQ3JELFdBQUssR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztLQUM1QjtBQUNELFFBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7O0FBRWhCLFlBQVEsQ0FBQyxHQUFHLE1BQUEsQ0FBWixRQUFRLEVBQVMsSUFBSSxDQUFDLENBQUM7R0FDeEIsQ0FBQyxDQUFDO0NBQ0oiLCJmaWxlIjoibG9nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oaW5zdGFuY2UpIHtcbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2xvZycsIGZ1bmN0aW9uKC8qIG1lc3NhZ2UsIG9wdGlvbnMgKi8pIHtcbiAgICBsZXQgYXJncyA9IFt1bmRlZmluZWRdLFxuICAgICAgICBvcHRpb25zID0gYXJndW1lbnRzW2FyZ3VtZW50cy5sZW5ndGggLSAxXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgIGFyZ3MucHVzaChhcmd1bWVudHNbaV0pO1xuICAgIH1cblxuICAgIGxldCBsZXZlbCA9IDE7XG4gICAgaWYgKG9wdGlvbnMuaGFzaC5sZXZlbCAhPSBudWxsKSB7XG4gICAgICBsZXZlbCA9IG9wdGlvbnMuaGFzaC5sZXZlbDtcbiAgICB9IGVsc2UgaWYgKG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmRhdGEubGV2ZWwgIT0gbnVsbCkge1xuICAgICAgbGV2ZWwgPSBvcHRpb25zLmRhdGEubGV2ZWw7XG4gICAgfVxuICAgIGFyZ3NbMF0gPSBsZXZlbDtcblxuICAgIGluc3RhbmNlLmxvZyguLi4gYXJncyk7XG4gIH0pO1xufVxuIl19


/***/ }),
/* 24 */
/***/ (function(module, exports) {

	'use strict';

	exports.__esModule = true;

	exports['default'] = function (instance) {
	  instance.registerHelper('lookup', function (obj, field) {
	    return obj && obj[field];
	  });
	};

	module.exports = exports['default'];
	//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2hlbHBlcnMvbG9va3VwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7cUJBQWUsVUFBUyxRQUFRLEVBQUU7QUFDaEMsVUFBUSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsVUFBUyxHQUFHLEVBQUUsS0FBSyxFQUFFO0FBQ3JELFdBQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUMxQixDQUFDLENBQUM7Q0FDSiIsImZpbGUiOiJsb29rdXAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihpbnN0YW5jZSkge1xuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignbG9va3VwJywgZnVuY3Rpb24ob2JqLCBmaWVsZCkge1xuICAgIHJldHVybiBvYmogJiYgb2JqW2ZpZWxkXTtcbiAgfSk7XG59XG4iXX0=


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _utils = __webpack_require__(16);

	exports['default'] = function (instance) {
	  instance.registerHelper('with', function (context, options) {
	    if (_utils.isFunction(context)) {
	      context = context.call(this);
	    }

	    var fn = options.fn;

	    if (!_utils.isEmpty(context)) {
	      var data = options.data;
	      if (options.data && options.ids) {
	        data = _utils.createFrame(options.data);
	        data.contextPath = _utils.appendContextPath(options.data.contextPath, options.ids[0]);
	      }

	      return fn(context, {
	        data: data,
	        blockParams: _utils.blockParams([context], [data && data.contextPath])
	      });
	    } else {
	      return options.inverse(this);
	    }
	  });
	};

	module.exports = exports['default'];
	//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2hlbHBlcnMvd2l0aC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O3FCQUErRSxVQUFVOztxQkFFMUUsVUFBUyxRQUFRLEVBQUU7QUFDaEMsVUFBUSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsVUFBUyxPQUFPLEVBQUUsT0FBTyxFQUFFO0FBQ3pELFFBQUksa0JBQVcsT0FBTyxDQUFDLEVBQUU7QUFBRSxhQUFPLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUFFOztBQUUxRCxRQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDOztBQUVwQixRQUFJLENBQUMsZUFBUSxPQUFPLENBQUMsRUFBRTtBQUNyQixVQUFJLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO0FBQ3hCLFVBQUksT0FBTyxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsR0FBRyxFQUFFO0FBQy9CLFlBQUksR0FBRyxtQkFBWSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDakMsWUFBSSxDQUFDLFdBQVcsR0FBRyx5QkFBa0IsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO09BQ2hGOztBQUVELGFBQU8sRUFBRSxDQUFDLE9BQU8sRUFBRTtBQUNqQixZQUFJLEVBQUUsSUFBSTtBQUNWLG1CQUFXLEVBQUUsbUJBQVksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7T0FDaEUsQ0FBQyxDQUFDO0tBQ0osTUFBTTtBQUNMLGFBQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUM5QjtHQUNGLENBQUMsQ0FBQztDQUNKIiwiZmlsZSI6IndpdGguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2FwcGVuZENvbnRleHRQYXRoLCBibG9ja1BhcmFtcywgY3JlYXRlRnJhbWUsIGlzRW1wdHksIGlzRnVuY3Rpb259IGZyb20gJy4uL3V0aWxzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oaW5zdGFuY2UpIHtcbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ3dpdGgnLCBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24oY29udGV4dCkpIHsgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTsgfVxuXG4gICAgbGV0IGZuID0gb3B0aW9ucy5mbjtcblxuICAgIGlmICghaXNFbXB0eShjb250ZXh0KSkge1xuICAgICAgbGV0IGRhdGEgPSBvcHRpb25zLmRhdGE7XG4gICAgICBpZiAob3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuaWRzKSB7XG4gICAgICAgIGRhdGEgPSBjcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpO1xuICAgICAgICBkYXRhLmNvbnRleHRQYXRoID0gYXBwZW5kQ29udGV4dFBhdGgob3B0aW9ucy5kYXRhLmNvbnRleHRQYXRoLCBvcHRpb25zLmlkc1swXSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmbihjb250ZXh0LCB7XG4gICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgIGJsb2NrUGFyYW1zOiBibG9ja1BhcmFtcyhbY29udGV4dF0sIFtkYXRhICYmIGRhdGEuY29udGV4dFBhdGhdKVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgfVxuICB9KTtcbn1cbiJdfQ==


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports.registerDefaultDecorators = registerDefaultDecorators;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _decoratorsInline = __webpack_require__(27);

	var _decoratorsInline2 = _interopRequireDefault(_decoratorsInline);

	function registerDefaultDecorators(instance) {
	  _decoratorsInline2['default'](instance);
	}
	//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2RlY29yYXRvcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Z0NBQTJCLHFCQUFxQjs7OztBQUV6QyxTQUFTLHlCQUF5QixDQUFDLFFBQVEsRUFBRTtBQUNsRCxnQ0FBZSxRQUFRLENBQUMsQ0FBQztDQUMxQiIsImZpbGUiOiJkZWNvcmF0b3JzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHJlZ2lzdGVySW5saW5lIGZyb20gJy4vZGVjb3JhdG9ycy9pbmxpbmUnO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJEZWZhdWx0RGVjb3JhdG9ycyhpbnN0YW5jZSkge1xuICByZWdpc3RlcklubGluZShpbnN0YW5jZSk7XG59XG5cbiJdfQ==


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _utils = __webpack_require__(16);

	exports['default'] = function (instance) {
	  instance.registerDecorator('inline', function (fn, props, container, options) {
	    var ret = fn;
	    if (!props.partials) {
	      props.partials = {};
	      ret = function (context, options) {
	        // Create a new partials stack frame prior to exec.
	        var original = container.partials;
	        container.partials = _utils.extend({}, original, props.partials);
	        var ret = fn(context, options);
	        container.partials = original;
	        return ret;
	      };
	    }

	    props.partials[options.args[0]] = options.fn;

	    return ret;
	  });
	};

	module.exports = exports['default'];
	//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2RlY29yYXRvcnMvaW5saW5lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7cUJBQXFCLFVBQVU7O3FCQUVoQixVQUFTLFFBQVEsRUFBRTtBQUNoQyxVQUFRLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLFVBQVMsRUFBRSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFO0FBQzNFLFFBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUNiLFFBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO0FBQ25CLFdBQUssQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLFNBQUcsR0FBRyxVQUFTLE9BQU8sRUFBRSxPQUFPLEVBQUU7O0FBRS9CLFlBQUksUUFBUSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUM7QUFDbEMsaUJBQVMsQ0FBQyxRQUFRLEdBQUcsY0FBTyxFQUFFLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMxRCxZQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQy9CLGlCQUFTLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztBQUM5QixlQUFPLEdBQUcsQ0FBQztPQUNaLENBQUM7S0FDSDs7QUFFRCxTQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDOztBQUU3QyxXQUFPLEdBQUcsQ0FBQztHQUNaLENBQUMsQ0FBQztDQUNKIiwiZmlsZSI6ImlubGluZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7ZXh0ZW5kfSBmcm9tICcuLi91dGlscyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGluc3RhbmNlKSB7XG4gIGluc3RhbmNlLnJlZ2lzdGVyRGVjb3JhdG9yKCdpbmxpbmUnLCBmdW5jdGlvbihmbiwgcHJvcHMsIGNvbnRhaW5lciwgb3B0aW9ucykge1xuICAgIGxldCByZXQgPSBmbjtcbiAgICBpZiAoIXByb3BzLnBhcnRpYWxzKSB7XG4gICAgICBwcm9wcy5wYXJ0aWFscyA9IHt9O1xuICAgICAgcmV0ID0gZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICAgICAgICAvLyBDcmVhdGUgYSBuZXcgcGFydGlhbHMgc3RhY2sgZnJhbWUgcHJpb3IgdG8gZXhlYy5cbiAgICAgICAgbGV0IG9yaWdpbmFsID0gY29udGFpbmVyLnBhcnRpYWxzO1xuICAgICAgICBjb250YWluZXIucGFydGlhbHMgPSBleHRlbmQoe30sIG9yaWdpbmFsLCBwcm9wcy5wYXJ0aWFscyk7XG4gICAgICAgIGxldCByZXQgPSBmbihjb250ZXh0LCBvcHRpb25zKTtcbiAgICAgICAgY29udGFpbmVyLnBhcnRpYWxzID0gb3JpZ2luYWw7XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9O1xuICAgIH1cblxuICAgIHByb3BzLnBhcnRpYWxzW29wdGlvbnMuYXJnc1swXV0gPSBvcHRpb25zLmZuO1xuXG4gICAgcmV0dXJuIHJldDtcbiAgfSk7XG59XG4iXX0=


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _utils = __webpack_require__(16);

	var logger = {
	  methodMap: ['debug', 'info', 'warn', 'error'],
	  level: 'info',

	  // Maps a given level value to the `methodMap` indexes above.
	  lookupLevel: function lookupLevel(level) {
	    if (typeof level === 'string') {
	      var levelMap = _utils.indexOf(logger.methodMap, level.toLowerCase());
	      if (levelMap >= 0) {
	        level = levelMap;
	      } else {
	        level = parseInt(level, 10);
	      }
	    }

	    return level;
	  },

	  // Can be overridden in the host environment
	  log: function log(level) {
	    level = logger.lookupLevel(level);

	    if (typeof console !== 'undefined' && logger.lookupLevel(logger.level) <= level) {
	      var method = logger.methodMap[level];
	      if (!console[method]) {
	        // eslint-disable-line no-console
	        method = 'log';
	      }

	      for (var _len = arguments.length, message = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	        message[_key - 1] = arguments[_key];
	      }

	      console[method].apply(console, message); // eslint-disable-line no-console
	    }
	  }
	};

	exports['default'] = logger;
	module.exports = exports['default'];
	//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2xvZ2dlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O3FCQUFzQixTQUFTOztBQUUvQixJQUFJLE1BQU0sR0FBRztBQUNYLFdBQVMsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQztBQUM3QyxPQUFLLEVBQUUsTUFBTTs7O0FBR2IsYUFBVyxFQUFFLHFCQUFTLEtBQUssRUFBRTtBQUMzQixRQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtBQUM3QixVQUFJLFFBQVEsR0FBRyxlQUFRLE1BQU0sQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7QUFDOUQsVUFBSSxRQUFRLElBQUksQ0FBQyxFQUFFO0FBQ2pCLGFBQUssR0FBRyxRQUFRLENBQUM7T0FDbEIsTUFBTTtBQUNMLGFBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO09BQzdCO0tBQ0Y7O0FBRUQsV0FBTyxLQUFLLENBQUM7R0FDZDs7O0FBR0QsS0FBRyxFQUFFLGFBQVMsS0FBSyxFQUFjO0FBQy9CLFNBQUssR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUVsQyxRQUFJLE9BQU8sT0FBTyxLQUFLLFdBQVcsSUFBSSxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLEVBQUU7QUFDL0UsVUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNyQyxVQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFOztBQUNwQixjQUFNLEdBQUcsS0FBSyxDQUFDO09BQ2hCOzt3Q0FQbUIsT0FBTztBQUFQLGVBQU87OztBQVEzQixhQUFPLENBQUMsTUFBTSxPQUFDLENBQWYsT0FBTyxFQUFZLE9BQU8sQ0FBQyxDQUFDO0tBQzdCO0dBQ0Y7Q0FDRixDQUFDOztxQkFFYSxNQUFNIiwiZmlsZSI6ImxvZ2dlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aW5kZXhPZn0gZnJvbSAnLi91dGlscyc7XG5cbmxldCBsb2dnZXIgPSB7XG4gIG1ldGhvZE1hcDogWydkZWJ1ZycsICdpbmZvJywgJ3dhcm4nLCAnZXJyb3InXSxcbiAgbGV2ZWw6ICdpbmZvJyxcblxuICAvLyBNYXBzIGEgZ2l2ZW4gbGV2ZWwgdmFsdWUgdG8gdGhlIGBtZXRob2RNYXBgIGluZGV4ZXMgYWJvdmUuXG4gIGxvb2t1cExldmVsOiBmdW5jdGlvbihsZXZlbCkge1xuICAgIGlmICh0eXBlb2YgbGV2ZWwgPT09ICdzdHJpbmcnKSB7XG4gICAgICBsZXQgbGV2ZWxNYXAgPSBpbmRleE9mKGxvZ2dlci5tZXRob2RNYXAsIGxldmVsLnRvTG93ZXJDYXNlKCkpO1xuICAgICAgaWYgKGxldmVsTWFwID49IDApIHtcbiAgICAgICAgbGV2ZWwgPSBsZXZlbE1hcDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldmVsID0gcGFyc2VJbnQobGV2ZWwsIDEwKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbGV2ZWw7XG4gIH0sXG5cbiAgLy8gQ2FuIGJlIG92ZXJyaWRkZW4gaW4gdGhlIGhvc3QgZW52aXJvbm1lbnRcbiAgbG9nOiBmdW5jdGlvbihsZXZlbCwgLi4ubWVzc2FnZSkge1xuICAgIGxldmVsID0gbG9nZ2VyLmxvb2t1cExldmVsKGxldmVsKTtcblxuICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbG9nZ2VyLmxvb2t1cExldmVsKGxvZ2dlci5sZXZlbCkgPD0gbGV2ZWwpIHtcbiAgICAgIGxldCBtZXRob2QgPSBsb2dnZXIubWV0aG9kTWFwW2xldmVsXTtcbiAgICAgIGlmICghY29uc29sZVttZXRob2RdKSB7ICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgICAgIG1ldGhvZCA9ICdsb2cnO1xuICAgICAgfVxuICAgICAgY29uc29sZVttZXRob2RdKC4uLm1lc3NhZ2UpOyAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGxvZ2dlcjtcbiJdfQ==


/***/ }),
/* 29 */
/***/ (function(module, exports) {

	// Build out our basic SafeString type
	'use strict';

	exports.__esModule = true;
	function SafeString(string) {
	  this.string = string;
	}

	SafeString.prototype.toString = SafeString.prototype.toHTML = function () {
	  return '' + this.string;
	};

	exports['default'] = SafeString;
	module.exports = exports['default'];
	//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL3NhZmUtc3RyaW5nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFDQSxTQUFTLFVBQVUsQ0FBQyxNQUFNLEVBQUU7QUFDMUIsTUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7Q0FDdEI7O0FBRUQsVUFBVSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsWUFBVztBQUN2RSxTQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0NBQ3pCLENBQUM7O3FCQUVhLFVBQVUiLCJmaWxlIjoic2FmZS1zdHJpbmcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBCdWlsZCBvdXQgb3VyIGJhc2ljIFNhZmVTdHJpbmcgdHlwZVxuZnVuY3Rpb24gU2FmZVN0cmluZyhzdHJpbmcpIHtcbiAgdGhpcy5zdHJpbmcgPSBzdHJpbmc7XG59XG5cblNhZmVTdHJpbmcucHJvdG90eXBlLnRvU3RyaW5nID0gU2FmZVN0cmluZy5wcm90b3R5cGUudG9IVE1MID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiAnJyArIHRoaXMuc3RyaW5nO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgU2FmZVN0cmluZztcbiJdfQ==


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports.checkRevision = checkRevision;
	exports.template = template;
	exports.wrapProgram = wrapProgram;
	exports.resolvePartial = resolvePartial;
	exports.invokePartial = invokePartial;
	exports.noop = noop;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	// istanbul ignore next

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

	var _utils = __webpack_require__(16);

	var Utils = _interopRequireWildcard(_utils);

	var _exception = __webpack_require__(17);

	var _exception2 = _interopRequireDefault(_exception);

	var _base = __webpack_require__(15);

	function checkRevision(compilerInfo) {
	  var compilerRevision = compilerInfo && compilerInfo[0] || 1,
	      currentRevision = _base.COMPILER_REVISION;

	  if (compilerRevision !== currentRevision) {
	    if (compilerRevision < currentRevision) {
	      var runtimeVersions = _base.REVISION_CHANGES[currentRevision],
	          compilerVersions = _base.REVISION_CHANGES[compilerRevision];
	      throw new _exception2['default']('Template was precompiled with an older version of Handlebars than the current runtime. ' + 'Please update your precompiler to a newer version (' + runtimeVersions + ') or downgrade your runtime to an older version (' + compilerVersions + ').');
	    } else {
	      // Use the embedded version info since the runtime doesn't know about this revision yet
	      throw new _exception2['default']('Template was precompiled with a newer version of Handlebars than the current runtime. ' + 'Please update your runtime to a newer version (' + compilerInfo[1] + ').');
	    }
	  }
	}

	function template(templateSpec, env) {
	  /* istanbul ignore next */
	  if (!env) {
	    throw new _exception2['default']('No environment passed to template');
	  }
	  if (!templateSpec || !templateSpec.main) {
	    throw new _exception2['default']('Unknown template object: ' + typeof templateSpec);
	  }

	  templateSpec.main.decorator = templateSpec.main_d;

	  // Note: Using env.VM references rather than local var references throughout this section to allow
	  // for external users to override these as psuedo-supported APIs.
	  env.VM.checkRevision(templateSpec.compiler);

	  function invokePartialWrapper(partial, context, options) {
	    if (options.hash) {
	      context = Utils.extend({}, context, options.hash);
	      if (options.ids) {
	        options.ids[0] = true;
	      }
	    }

	    partial = env.VM.resolvePartial.call(this, partial, context, options);
	    var result = env.VM.invokePartial.call(this, partial, context, options);

	    if (result == null && env.compile) {
	      options.partials[options.name] = env.compile(partial, templateSpec.compilerOptions, env);
	      result = options.partials[options.name](context, options);
	    }
	    if (result != null) {
	      if (options.indent) {
	        var lines = result.split('\n');
	        for (var i = 0, l = lines.length; i < l; i++) {
	          if (!lines[i] && i + 1 === l) {
	            break;
	          }

	          lines[i] = options.indent + lines[i];
	        }
	        result = lines.join('\n');
	      }
	      return result;
	    } else {
	      throw new _exception2['default']('The partial ' + options.name + ' could not be compiled when running in runtime-only mode');
	    }
	  }

	  // Just add water
	  var container = {
	    strict: function strict(obj, name) {
	      if (!(name in obj)) {
	        throw new _exception2['default']('"' + name + '" not defined in ' + obj);
	      }
	      return obj[name];
	    },
	    lookup: function lookup(depths, name) {
	      var len = depths.length;
	      for (var i = 0; i < len; i++) {
	        if (depths[i] && depths[i][name] != null) {
	          return depths[i][name];
	        }
	      }
	    },
	    lambda: function lambda(current, context) {
	      return typeof current === 'function' ? current.call(context) : current;
	    },

	    escapeExpression: Utils.escapeExpression,
	    invokePartial: invokePartialWrapper,

	    fn: function fn(i) {
	      var ret = templateSpec[i];
	      ret.decorator = templateSpec[i + '_d'];
	      return ret;
	    },

	    programs: [],
	    program: function program(i, data, declaredBlockParams, blockParams, depths) {
	      var programWrapper = this.programs[i],
	          fn = this.fn(i);
	      if (data || depths || blockParams || declaredBlockParams) {
	        programWrapper = wrapProgram(this, i, fn, data, declaredBlockParams, blockParams, depths);
	      } else if (!programWrapper) {
	        programWrapper = this.programs[i] = wrapProgram(this, i, fn);
	      }
	      return programWrapper;
	    },

	    data: function data(value, depth) {
	      while (value && depth--) {
	        value = value._parent;
	      }
	      return value;
	    },
	    merge: function merge(param, common) {
	      var obj = param || common;

	      if (param && common && param !== common) {
	        obj = Utils.extend({}, common, param);
	      }

	      return obj;
	    },
	    // An empty object to use as replacement for null-contexts
	    nullContext: Object.seal({}),

	    noop: env.VM.noop,
	    compilerInfo: templateSpec.compiler
	  };

	  function ret(context) {
	    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	    var data = options.data;

	    ret._setup(options);
	    if (!options.partial && templateSpec.useData) {
	      data = initData(context, data);
	    }
	    var depths = undefined,
	        blockParams = templateSpec.useBlockParams ? [] : undefined;
	    if (templateSpec.useDepths) {
	      if (options.depths) {
	        depths = context != options.depths[0] ? [context].concat(options.depths) : options.depths;
	      } else {
	        depths = [context];
	      }
	    }

	    function main(context /*, options*/) {
	      return '' + templateSpec.main(container, context, container.helpers, container.partials, data, blockParams, depths);
	    }
	    main = executeDecorators(templateSpec.main, main, container, options.depths || [], data, blockParams);
	    return main(context, options);
	  }
	  ret.isTop = true;

	  ret._setup = function (options) {
	    if (!options.partial) {
	      container.helpers = container.merge(options.helpers, env.helpers);

	      if (templateSpec.usePartial) {
	        container.partials = container.merge(options.partials, env.partials);
	      }
	      if (templateSpec.usePartial || templateSpec.useDecorators) {
	        container.decorators = container.merge(options.decorators, env.decorators);
	      }
	    } else {
	      container.helpers = options.helpers;
	      container.partials = options.partials;
	      container.decorators = options.decorators;
	    }
	  };

	  ret._child = function (i, data, blockParams, depths) {
	    if (templateSpec.useBlockParams && !blockParams) {
	      throw new _exception2['default']('must pass block params');
	    }
	    if (templateSpec.useDepths && !depths) {
	      throw new _exception2['default']('must pass parent depths');
	    }

	    return wrapProgram(container, i, templateSpec[i], data, 0, blockParams, depths);
	  };
	  return ret;
	}

	function wrapProgram(container, i, fn, data, declaredBlockParams, blockParams, depths) {
	  function prog(context) {
	    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	    var currentDepths = depths;
	    if (depths && context != depths[0] && !(context === container.nullContext && depths[0] === null)) {
	      currentDepths = [context].concat(depths);
	    }

	    return fn(container, context, container.helpers, container.partials, options.data || data, blockParams && [options.blockParams].concat(blockParams), currentDepths);
	  }

	  prog = executeDecorators(fn, prog, container, depths, data, blockParams);

	  prog.program = i;
	  prog.depth = depths ? depths.length : 0;
	  prog.blockParams = declaredBlockParams || 0;
	  return prog;
	}

	function resolvePartial(partial, context, options) {
	  if (!partial) {
	    if (options.name === '@partial-block') {
	      partial = options.data['partial-block'];
	    } else {
	      partial = options.partials[options.name];
	    }
	  } else if (!partial.call && !options.name) {
	    // This is a dynamic partial that returned a string
	    options.name = partial;
	    partial = options.partials[partial];
	  }
	  return partial;
	}

	function invokePartial(partial, context, options) {
	  // Use the current closure context to save the partial-block if this partial
	  var currentPartialBlock = options.data && options.data['partial-block'];
	  options.partial = true;
	  if (options.ids) {
	    options.data.contextPath = options.ids[0] || options.data.contextPath;
	  }

	  var partialBlock = undefined;
	  if (options.fn && options.fn !== noop) {
	    (function () {
	      options.data = _base.createFrame(options.data);
	      // Wrapper function to get access to currentPartialBlock from the closure
	      var fn = options.fn;
	      partialBlock = options.data['partial-block'] = function partialBlockWrapper(context) {
	        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	        // Restore the partial-block from the closure for the execution of the block
	        // i.e. the part inside the block of the partial call.
	        options.data = _base.createFrame(options.data);
	        options.data['partial-block'] = currentPartialBlock;
	        return fn(context, options);
	      };
	      if (fn.partials) {
	        options.partials = Utils.extend({}, options.partials, fn.partials);
	      }
	    })();
	  }

	  if (partial === undefined && partialBlock) {
	    partial = partialBlock;
	  }

	  if (partial === undefined) {
	    throw new _exception2['default']('The partial ' + options.name + ' could not be found');
	  } else if (partial instanceof Function) {
	    return partial(context, options);
	  }
	}

	function noop() {
	  return '';
	}

	function initData(context, data) {
	  if (!data || !('root' in data)) {
	    data = data ? _base.createFrame(data) : {};
	    data.root = context;
	  }
	  return data;
	}

	function executeDecorators(fn, prog, container, depths, data, blockParams) {
	  if (fn.decorator) {
	    var props = {};
	    prog = fn.decorator(prog, props, container, depths && depths[0], data, blockParams, depths);
	    Utils.extend(prog, props);
	  }
	  return prog;
	}
	//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL3J1bnRpbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7cUJBQXVCLFNBQVM7O0lBQXBCLEtBQUs7O3lCQUNLLGFBQWE7Ozs7b0JBQzhCLFFBQVE7O0FBRWxFLFNBQVMsYUFBYSxDQUFDLFlBQVksRUFBRTtBQUMxQyxNQUFNLGdCQUFnQixHQUFHLFlBQVksSUFBSSxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztNQUN2RCxlQUFlLDBCQUFvQixDQUFDOztBQUUxQyxNQUFJLGdCQUFnQixLQUFLLGVBQWUsRUFBRTtBQUN4QyxRQUFJLGdCQUFnQixHQUFHLGVBQWUsRUFBRTtBQUN0QyxVQUFNLGVBQWUsR0FBRyx1QkFBaUIsZUFBZSxDQUFDO1VBQ25ELGdCQUFnQixHQUFHLHVCQUFpQixnQkFBZ0IsQ0FBQyxDQUFDO0FBQzVELFlBQU0sMkJBQWMseUZBQXlGLEdBQ3ZHLHFEQUFxRCxHQUFHLGVBQWUsR0FBRyxtREFBbUQsR0FBRyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsQ0FBQztLQUNoSyxNQUFNOztBQUVMLFlBQU0sMkJBQWMsd0ZBQXdGLEdBQ3RHLGlEQUFpRCxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztLQUNuRjtHQUNGO0NBQ0Y7O0FBRU0sU0FBUyxRQUFRLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRTs7QUFFMUMsTUFBSSxDQUFDLEdBQUcsRUFBRTtBQUNSLFVBQU0sMkJBQWMsbUNBQW1DLENBQUMsQ0FBQztHQUMxRDtBQUNELE1BQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFO0FBQ3ZDLFVBQU0sMkJBQWMsMkJBQTJCLEdBQUcsT0FBTyxZQUFZLENBQUMsQ0FBQztHQUN4RTs7QUFFRCxjQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDOzs7O0FBSWxELEtBQUcsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFNUMsV0FBUyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRTtBQUN2RCxRQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUU7QUFDaEIsYUFBTyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbEQsVUFBSSxPQUFPLENBQUMsR0FBRyxFQUFFO0FBQ2YsZUFBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7T0FDdkI7S0FDRjs7QUFFRCxXQUFPLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3RFLFFBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQzs7QUFFeEUsUUFBSSxNQUFNLElBQUksSUFBSSxJQUFJLEdBQUcsQ0FBQyxPQUFPLEVBQUU7QUFDakMsYUFBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLGVBQWUsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUN6RixZQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQzNEO0FBQ0QsUUFBSSxNQUFNLElBQUksSUFBSSxFQUFFO0FBQ2xCLFVBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTtBQUNsQixZQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQy9CLGFBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDNUMsY0FBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUM1QixrQkFBTTtXQUNQOztBQUVELGVBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN0QztBQUNELGNBQU0sR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO09BQzNCO0FBQ0QsYUFBTyxNQUFNLENBQUM7S0FDZixNQUFNO0FBQ0wsWUFBTSwyQkFBYyxjQUFjLEdBQUcsT0FBTyxDQUFDLElBQUksR0FBRywwREFBMEQsQ0FBQyxDQUFDO0tBQ2pIO0dBQ0Y7OztBQUdELE1BQUksU0FBUyxHQUFHO0FBQ2QsVUFBTSxFQUFFLGdCQUFTLEdBQUcsRUFBRSxJQUFJLEVBQUU7QUFDMUIsVUFBSSxFQUFFLElBQUksSUFBSSxHQUFHLENBQUEsQUFBQyxFQUFFO0FBQ2xCLGNBQU0sMkJBQWMsR0FBRyxHQUFHLElBQUksR0FBRyxtQkFBbUIsR0FBRyxHQUFHLENBQUMsQ0FBQztPQUM3RDtBQUNELGFBQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ2xCO0FBQ0QsVUFBTSxFQUFFLGdCQUFTLE1BQU0sRUFBRSxJQUFJLEVBQUU7QUFDN0IsVUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUMxQixXQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzVCLFlBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLEVBQUU7QUFDeEMsaUJBQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hCO09BQ0Y7S0FDRjtBQUNELFVBQU0sRUFBRSxnQkFBUyxPQUFPLEVBQUUsT0FBTyxFQUFFO0FBQ2pDLGFBQU8sT0FBTyxPQUFPLEtBQUssVUFBVSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsT0FBTyxDQUFDO0tBQ3hFOztBQUVELG9CQUFnQixFQUFFLEtBQUssQ0FBQyxnQkFBZ0I7QUFDeEMsaUJBQWEsRUFBRSxvQkFBb0I7O0FBRW5DLE1BQUUsRUFBRSxZQUFTLENBQUMsRUFBRTtBQUNkLFVBQUksR0FBRyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxQixTQUFHLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDdkMsYUFBTyxHQUFHLENBQUM7S0FDWjs7QUFFRCxZQUFRLEVBQUUsRUFBRTtBQUNaLFdBQU8sRUFBRSxpQkFBUyxDQUFDLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUU7QUFDbkUsVUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7VUFDakMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEIsVUFBSSxJQUFJLElBQUksTUFBTSxJQUFJLFdBQVcsSUFBSSxtQkFBbUIsRUFBRTtBQUN4RCxzQkFBYyxHQUFHLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO09BQzNGLE1BQU0sSUFBSSxDQUFDLGNBQWMsRUFBRTtBQUMxQixzQkFBYyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7T0FDOUQ7QUFDRCxhQUFPLGNBQWMsQ0FBQztLQUN2Qjs7QUFFRCxRQUFJLEVBQUUsY0FBUyxLQUFLLEVBQUUsS0FBSyxFQUFFO0FBQzNCLGFBQU8sS0FBSyxJQUFJLEtBQUssRUFBRSxFQUFFO0FBQ3ZCLGFBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO09BQ3ZCO0FBQ0QsYUFBTyxLQUFLLENBQUM7S0FDZDtBQUNELFNBQUssRUFBRSxlQUFTLEtBQUssRUFBRSxNQUFNLEVBQUU7QUFDN0IsVUFBSSxHQUFHLEdBQUcsS0FBSyxJQUFJLE1BQU0sQ0FBQzs7QUFFMUIsVUFBSSxLQUFLLElBQUksTUFBTSxJQUFLLEtBQUssS0FBSyxNQUFNLEFBQUMsRUFBRTtBQUN6QyxXQUFHLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO09BQ3ZDOztBQUVELGFBQU8sR0FBRyxDQUFDO0tBQ1o7O0FBRUQsZUFBVyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDOztBQUU1QixRQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJO0FBQ2pCLGdCQUFZLEVBQUUsWUFBWSxDQUFDLFFBQVE7R0FDcEMsQ0FBQzs7QUFFRixXQUFTLEdBQUcsQ0FBQyxPQUFPLEVBQWdCO1FBQWQsT0FBTyx5REFBRyxFQUFFOztBQUNoQyxRQUFJLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDOztBQUV4QixPQUFHLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3BCLFFBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxJQUFJLFlBQVksQ0FBQyxPQUFPLEVBQUU7QUFDNUMsVUFBSSxHQUFHLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDaEM7QUFDRCxRQUFJLE1BQU0sWUFBQTtRQUNOLFdBQVcsR0FBRyxZQUFZLENBQUMsY0FBYyxHQUFHLEVBQUUsR0FBRyxTQUFTLENBQUM7QUFDL0QsUUFBSSxZQUFZLENBQUMsU0FBUyxFQUFFO0FBQzFCLFVBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTtBQUNsQixjQUFNLEdBQUcsT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7T0FDM0YsTUFBTTtBQUNMLGNBQU0sR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO09BQ3BCO0tBQ0Y7O0FBRUQsYUFBUyxJQUFJLENBQUMsT0FBTyxnQkFBZTtBQUNsQyxhQUFPLEVBQUUsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDckg7QUFDRCxRQUFJLEdBQUcsaUJBQWlCLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxNQUFNLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztBQUN0RyxXQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7R0FDL0I7QUFDRCxLQUFHLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQzs7QUFFakIsS0FBRyxDQUFDLE1BQU0sR0FBRyxVQUFTLE9BQU8sRUFBRTtBQUM3QixRQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtBQUNwQixlQUFTLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBRWxFLFVBQUksWUFBWSxDQUFDLFVBQVUsRUFBRTtBQUMzQixpQkFBUyxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO09BQ3RFO0FBQ0QsVUFBSSxZQUFZLENBQUMsVUFBVSxJQUFJLFlBQVksQ0FBQyxhQUFhLEVBQUU7QUFDekQsaUJBQVMsQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztPQUM1RTtLQUNGLE1BQU07QUFDTCxlQUFTLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUM7QUFDcEMsZUFBUyxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO0FBQ3RDLGVBQVMsQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQztLQUMzQztHQUNGLENBQUM7O0FBRUYsS0FBRyxDQUFDLE1BQU0sR0FBRyxVQUFTLENBQUMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRTtBQUNsRCxRQUFJLFlBQVksQ0FBQyxjQUFjLElBQUksQ0FBQyxXQUFXLEVBQUU7QUFDL0MsWUFBTSwyQkFBYyx3QkFBd0IsQ0FBQyxDQUFDO0tBQy9DO0FBQ0QsUUFBSSxZQUFZLENBQUMsU0FBUyxJQUFJLENBQUMsTUFBTSxFQUFFO0FBQ3JDLFlBQU0sMkJBQWMseUJBQXlCLENBQUMsQ0FBQztLQUNoRDs7QUFFRCxXQUFPLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztHQUNqRixDQUFDO0FBQ0YsU0FBTyxHQUFHLENBQUM7Q0FDWjs7QUFFTSxTQUFTLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRTtBQUM1RixXQUFTLElBQUksQ0FBQyxPQUFPLEVBQWdCO1FBQWQsT0FBTyx5REFBRyxFQUFFOztBQUNqQyxRQUFJLGFBQWEsR0FBRyxNQUFNLENBQUM7QUFDM0IsUUFBSSxNQUFNLElBQUksT0FBTyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLE9BQU8sS0FBSyxTQUFTLENBQUMsV0FBVyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUEsQUFBQyxFQUFFO0FBQ2hHLG1CQUFhLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDMUM7O0FBRUQsV0FBTyxFQUFFLENBQUMsU0FBUyxFQUNmLE9BQU8sRUFDUCxTQUFTLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxRQUFRLEVBQ3JDLE9BQU8sQ0FBQyxJQUFJLElBQUksSUFBSSxFQUNwQixXQUFXLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUN4RCxhQUFhLENBQUMsQ0FBQztHQUNwQjs7QUFFRCxNQUFJLEdBQUcsaUJBQWlCLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQzs7QUFFekUsTUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFDakIsTUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDeEMsTUFBSSxDQUFDLFdBQVcsR0FBRyxtQkFBbUIsSUFBSSxDQUFDLENBQUM7QUFDNUMsU0FBTyxJQUFJLENBQUM7Q0FDYjs7QUFFTSxTQUFTLGNBQWMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRTtBQUN4RCxNQUFJLENBQUMsT0FBTyxFQUFFO0FBQ1osUUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLGdCQUFnQixFQUFFO0FBQ3JDLGFBQU8sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0tBQ3pDLE1BQU07QUFDTCxhQUFPLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDMUM7R0FDRixNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRTs7QUFFekMsV0FBTyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUM7QUFDdkIsV0FBTyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7R0FDckM7QUFDRCxTQUFPLE9BQU8sQ0FBQztDQUNoQjs7QUFFTSxTQUFTLGFBQWEsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRTs7QUFFdkQsTUFBTSxtQkFBbUIsR0FBRyxPQUFPLENBQUMsSUFBSSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDMUUsU0FBTyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFDdkIsTUFBSSxPQUFPLENBQUMsR0FBRyxFQUFFO0FBQ2YsV0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztHQUN2RTs7QUFFRCxNQUFJLFlBQVksWUFBQSxDQUFDO0FBQ2pCLE1BQUksT0FBTyxDQUFDLEVBQUUsSUFBSSxPQUFPLENBQUMsRUFBRSxLQUFLLElBQUksRUFBRTs7QUFDckMsYUFBTyxDQUFDLElBQUksR0FBRyxrQkFBWSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXpDLFVBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUM7QUFDcEIsa0JBQVksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLFNBQVMsbUJBQW1CLENBQUMsT0FBTyxFQUFnQjtZQUFkLE9BQU8seURBQUcsRUFBRTs7OztBQUkvRixlQUFPLENBQUMsSUFBSSxHQUFHLGtCQUFZLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QyxlQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLG1CQUFtQixDQUFDO0FBQ3BELGVBQU8sRUFBRSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztPQUM3QixDQUFDO0FBQ0YsVUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0FBQ2YsZUFBTyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQztPQUNwRTs7R0FDRjs7QUFFRCxNQUFJLE9BQU8sS0FBSyxTQUFTLElBQUksWUFBWSxFQUFFO0FBQ3pDLFdBQU8sR0FBRyxZQUFZLENBQUM7R0FDeEI7O0FBRUQsTUFBSSxPQUFPLEtBQUssU0FBUyxFQUFFO0FBQ3pCLFVBQU0sMkJBQWMsY0FBYyxHQUFHLE9BQU8sQ0FBQyxJQUFJLEdBQUcscUJBQXFCLENBQUMsQ0FBQztHQUM1RSxNQUFNLElBQUksT0FBTyxZQUFZLFFBQVEsRUFBRTtBQUN0QyxXQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7R0FDbEM7Q0FDRjs7QUFFTSxTQUFTLElBQUksR0FBRztBQUFFLFNBQU8sRUFBRSxDQUFDO0NBQUU7O0FBRXJDLFNBQVMsUUFBUSxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUU7QUFDL0IsTUFBSSxDQUFDLElBQUksSUFBSSxFQUFFLE1BQU0sSUFBSSxJQUFJLENBQUEsQUFBQyxFQUFFO0FBQzlCLFFBQUksR0FBRyxJQUFJLEdBQUcsa0JBQVksSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3JDLFFBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDO0dBQ3JCO0FBQ0QsU0FBTyxJQUFJLENBQUM7Q0FDYjs7QUFFRCxTQUFTLGlCQUFpQixDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFO0FBQ3pFLE1BQUksRUFBRSxDQUFDLFNBQVMsRUFBRTtBQUNoQixRQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDZixRQUFJLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxNQUFNLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDNUYsU0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7R0FDM0I7QUFDRCxTQUFPLElBQUksQ0FBQztDQUNiIiwiZmlsZSI6InJ1bnRpbWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBVdGlscyBmcm9tICcuL3V0aWxzJztcbmltcG9ydCBFeGNlcHRpb24gZnJvbSAnLi9leGNlcHRpb24nO1xuaW1wb3J0IHsgQ09NUElMRVJfUkVWSVNJT04sIFJFVklTSU9OX0NIQU5HRVMsIGNyZWF0ZUZyYW1lIH0gZnJvbSAnLi9iYXNlJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrUmV2aXNpb24oY29tcGlsZXJJbmZvKSB7XG4gIGNvbnN0IGNvbXBpbGVyUmV2aXNpb24gPSBjb21waWxlckluZm8gJiYgY29tcGlsZXJJbmZvWzBdIHx8IDEsXG4gICAgICAgIGN1cnJlbnRSZXZpc2lvbiA9IENPTVBJTEVSX1JFVklTSU9OO1xuXG4gIGlmIChjb21waWxlclJldmlzaW9uICE9PSBjdXJyZW50UmV2aXNpb24pIHtcbiAgICBpZiAoY29tcGlsZXJSZXZpc2lvbiA8IGN1cnJlbnRSZXZpc2lvbikge1xuICAgICAgY29uc3QgcnVudGltZVZlcnNpb25zID0gUkVWSVNJT05fQ0hBTkdFU1tjdXJyZW50UmV2aXNpb25dLFxuICAgICAgICAgICAgY29tcGlsZXJWZXJzaW9ucyA9IFJFVklTSU9OX0NIQU5HRVNbY29tcGlsZXJSZXZpc2lvbl07XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKCdUZW1wbGF0ZSB3YXMgcHJlY29tcGlsZWQgd2l0aCBhbiBvbGRlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiAnICtcbiAgICAgICAgICAgICdQbGVhc2UgdXBkYXRlIHlvdXIgcHJlY29tcGlsZXIgdG8gYSBuZXdlciB2ZXJzaW9uICgnICsgcnVudGltZVZlcnNpb25zICsgJykgb3IgZG93bmdyYWRlIHlvdXIgcnVudGltZSB0byBhbiBvbGRlciB2ZXJzaW9uICgnICsgY29tcGlsZXJWZXJzaW9ucyArICcpLicpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBVc2UgdGhlIGVtYmVkZGVkIHZlcnNpb24gaW5mbyBzaW5jZSB0aGUgcnVudGltZSBkb2Vzbid0IGtub3cgYWJvdXQgdGhpcyByZXZpc2lvbiB5ZXRcbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oJ1RlbXBsYXRlIHdhcyBwcmVjb21waWxlZCB3aXRoIGEgbmV3ZXIgdmVyc2lvbiBvZiBIYW5kbGViYXJzIHRoYW4gdGhlIGN1cnJlbnQgcnVudGltZS4gJyArXG4gICAgICAgICAgICAnUGxlYXNlIHVwZGF0ZSB5b3VyIHJ1bnRpbWUgdG8gYSBuZXdlciB2ZXJzaW9uICgnICsgY29tcGlsZXJJbmZvWzFdICsgJykuJyk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0ZW1wbGF0ZSh0ZW1wbGF0ZVNwZWMsIGVudikge1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICBpZiAoIWVudikge1xuICAgIHRocm93IG5ldyBFeGNlcHRpb24oJ05vIGVudmlyb25tZW50IHBhc3NlZCB0byB0ZW1wbGF0ZScpO1xuICB9XG4gIGlmICghdGVtcGxhdGVTcGVjIHx8ICF0ZW1wbGF0ZVNwZWMubWFpbikge1xuICAgIHRocm93IG5ldyBFeGNlcHRpb24oJ1Vua25vd24gdGVtcGxhdGUgb2JqZWN0OiAnICsgdHlwZW9mIHRlbXBsYXRlU3BlYyk7XG4gIH1cblxuICB0ZW1wbGF0ZVNwZWMubWFpbi5kZWNvcmF0b3IgPSB0ZW1wbGF0ZVNwZWMubWFpbl9kO1xuXG4gIC8vIE5vdGU6IFVzaW5nIGVudi5WTSByZWZlcmVuY2VzIHJhdGhlciB0aGFuIGxvY2FsIHZhciByZWZlcmVuY2VzIHRocm91Z2hvdXQgdGhpcyBzZWN0aW9uIHRvIGFsbG93XG4gIC8vIGZvciBleHRlcm5hbCB1c2VycyB0byBvdmVycmlkZSB0aGVzZSBhcyBwc3VlZG8tc3VwcG9ydGVkIEFQSXMuXG4gIGVudi5WTS5jaGVja1JldmlzaW9uKHRlbXBsYXRlU3BlYy5jb21waWxlcik7XG5cbiAgZnVuY3Rpb24gaW52b2tlUGFydGlhbFdyYXBwZXIocGFydGlhbCwgY29udGV4dCwgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zLmhhc2gpIHtcbiAgICAgIGNvbnRleHQgPSBVdGlscy5leHRlbmQoe30sIGNvbnRleHQsIG9wdGlvbnMuaGFzaCk7XG4gICAgICBpZiAob3B0aW9ucy5pZHMpIHtcbiAgICAgICAgb3B0aW9ucy5pZHNbMF0gPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHBhcnRpYWwgPSBlbnYuVk0ucmVzb2x2ZVBhcnRpYWwuY2FsbCh0aGlzLCBwYXJ0aWFsLCBjb250ZXh0LCBvcHRpb25zKTtcbiAgICBsZXQgcmVzdWx0ID0gZW52LlZNLmludm9rZVBhcnRpYWwuY2FsbCh0aGlzLCBwYXJ0aWFsLCBjb250ZXh0LCBvcHRpb25zKTtcblxuICAgIGlmIChyZXN1bHQgPT0gbnVsbCAmJiBlbnYuY29tcGlsZSkge1xuICAgICAgb3B0aW9ucy5wYXJ0aWFsc1tvcHRpb25zLm5hbWVdID0gZW52LmNvbXBpbGUocGFydGlhbCwgdGVtcGxhdGVTcGVjLmNvbXBpbGVyT3B0aW9ucywgZW52KTtcbiAgICAgIHJlc3VsdCA9IG9wdGlvbnMucGFydGlhbHNbb3B0aW9ucy5uYW1lXShjb250ZXh0LCBvcHRpb25zKTtcbiAgICB9XG4gICAgaWYgKHJlc3VsdCAhPSBudWxsKSB7XG4gICAgICBpZiAob3B0aW9ucy5pbmRlbnQpIHtcbiAgICAgICAgbGV0IGxpbmVzID0gcmVzdWx0LnNwbGl0KCdcXG4nKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSBsaW5lcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICBpZiAoIWxpbmVzW2ldICYmIGkgKyAxID09PSBsKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsaW5lc1tpXSA9IG9wdGlvbnMuaW5kZW50ICsgbGluZXNbaV07XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ID0gbGluZXMuam9pbignXFxuJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKCdUaGUgcGFydGlhbCAnICsgb3B0aW9ucy5uYW1lICsgJyBjb3VsZCBub3QgYmUgY29tcGlsZWQgd2hlbiBydW5uaW5nIGluIHJ1bnRpbWUtb25seSBtb2RlJyk7XG4gICAgfVxuICB9XG5cbiAgLy8gSnVzdCBhZGQgd2F0ZXJcbiAgbGV0IGNvbnRhaW5lciA9IHtcbiAgICBzdHJpY3Q6IGZ1bmN0aW9uKG9iaiwgbmFtZSkge1xuICAgICAgaWYgKCEobmFtZSBpbiBvYmopKSB7XG4gICAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oJ1wiJyArIG5hbWUgKyAnXCIgbm90IGRlZmluZWQgaW4gJyArIG9iaik7XG4gICAgICB9XG4gICAgICByZXR1cm4gb2JqW25hbWVdO1xuICAgIH0sXG4gICAgbG9va3VwOiBmdW5jdGlvbihkZXB0aHMsIG5hbWUpIHtcbiAgICAgIGNvbnN0IGxlbiA9IGRlcHRocy5sZW5ndGg7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGlmIChkZXB0aHNbaV0gJiYgZGVwdGhzW2ldW25hbWVdICE9IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gZGVwdGhzW2ldW25hbWVdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBsYW1iZGE6IGZ1bmN0aW9uKGN1cnJlbnQsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgY3VycmVudCA9PT0gJ2Z1bmN0aW9uJyA/IGN1cnJlbnQuY2FsbChjb250ZXh0KSA6IGN1cnJlbnQ7XG4gICAgfSxcblxuICAgIGVzY2FwZUV4cHJlc3Npb246IFV0aWxzLmVzY2FwZUV4cHJlc3Npb24sXG4gICAgaW52b2tlUGFydGlhbDogaW52b2tlUGFydGlhbFdyYXBwZXIsXG5cbiAgICBmbjogZnVuY3Rpb24oaSkge1xuICAgICAgbGV0IHJldCA9IHRlbXBsYXRlU3BlY1tpXTtcbiAgICAgIHJldC5kZWNvcmF0b3IgPSB0ZW1wbGF0ZVNwZWNbaSArICdfZCddO1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9LFxuXG4gICAgcHJvZ3JhbXM6IFtdLFxuICAgIHByb2dyYW06IGZ1bmN0aW9uKGksIGRhdGEsIGRlY2xhcmVkQmxvY2tQYXJhbXMsIGJsb2NrUGFyYW1zLCBkZXB0aHMpIHtcbiAgICAgIGxldCBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV0sXG4gICAgICAgICAgZm4gPSB0aGlzLmZuKGkpO1xuICAgICAgaWYgKGRhdGEgfHwgZGVwdGhzIHx8IGJsb2NrUGFyYW1zIHx8IGRlY2xhcmVkQmxvY2tQYXJhbXMpIHtcbiAgICAgICAgcHJvZ3JhbVdyYXBwZXIgPSB3cmFwUHJvZ3JhbSh0aGlzLCBpLCBmbiwgZGF0YSwgZGVjbGFyZWRCbG9ja1BhcmFtcywgYmxvY2tQYXJhbXMsIGRlcHRocyk7XG4gICAgICB9IGVsc2UgaWYgKCFwcm9ncmFtV3JhcHBlcikge1xuICAgICAgICBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV0gPSB3cmFwUHJvZ3JhbSh0aGlzLCBpLCBmbik7XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvZ3JhbVdyYXBwZXI7XG4gICAgfSxcblxuICAgIGRhdGE6IGZ1bmN0aW9uKHZhbHVlLCBkZXB0aCkge1xuICAgICAgd2hpbGUgKHZhbHVlICYmIGRlcHRoLS0pIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5fcGFyZW50O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG4gICAgbWVyZ2U6IGZ1bmN0aW9uKHBhcmFtLCBjb21tb24pIHtcbiAgICAgIGxldCBvYmogPSBwYXJhbSB8fCBjb21tb247XG5cbiAgICAgIGlmIChwYXJhbSAmJiBjb21tb24gJiYgKHBhcmFtICE9PSBjb21tb24pKSB7XG4gICAgICAgIG9iaiA9IFV0aWxzLmV4dGVuZCh7fSwgY29tbW9uLCBwYXJhbSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvYmo7XG4gICAgfSxcbiAgICAvLyBBbiBlbXB0eSBvYmplY3QgdG8gdXNlIGFzIHJlcGxhY2VtZW50IGZvciBudWxsLWNvbnRleHRzXG4gICAgbnVsbENvbnRleHQ6IE9iamVjdC5zZWFsKHt9KSxcblxuICAgIG5vb3A6IGVudi5WTS5ub29wLFxuICAgIGNvbXBpbGVySW5mbzogdGVtcGxhdGVTcGVjLmNvbXBpbGVyXG4gIH07XG5cbiAgZnVuY3Rpb24gcmV0KGNvbnRleHQsIG9wdGlvbnMgPSB7fSkge1xuICAgIGxldCBkYXRhID0gb3B0aW9ucy5kYXRhO1xuXG4gICAgcmV0Ll9zZXR1cChvcHRpb25zKTtcbiAgICBpZiAoIW9wdGlvbnMucGFydGlhbCAmJiB0ZW1wbGF0ZVNwZWMudXNlRGF0YSkge1xuICAgICAgZGF0YSA9IGluaXREYXRhKGNvbnRleHQsIGRhdGEpO1xuICAgIH1cbiAgICBsZXQgZGVwdGhzLFxuICAgICAgICBibG9ja1BhcmFtcyA9IHRlbXBsYXRlU3BlYy51c2VCbG9ja1BhcmFtcyA/IFtdIDogdW5kZWZpbmVkO1xuICAgIGlmICh0ZW1wbGF0ZVNwZWMudXNlRGVwdGhzKSB7XG4gICAgICBpZiAob3B0aW9ucy5kZXB0aHMpIHtcbiAgICAgICAgZGVwdGhzID0gY29udGV4dCAhPSBvcHRpb25zLmRlcHRoc1swXSA/IFtjb250ZXh0XS5jb25jYXQob3B0aW9ucy5kZXB0aHMpIDogb3B0aW9ucy5kZXB0aHM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZXB0aHMgPSBbY29udGV4dF07XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWFpbihjb250ZXh0LyosIG9wdGlvbnMqLykge1xuICAgICAgcmV0dXJuICcnICsgdGVtcGxhdGVTcGVjLm1haW4oY29udGFpbmVyLCBjb250ZXh0LCBjb250YWluZXIuaGVscGVycywgY29udGFpbmVyLnBhcnRpYWxzLCBkYXRhLCBibG9ja1BhcmFtcywgZGVwdGhzKTtcbiAgICB9XG4gICAgbWFpbiA9IGV4ZWN1dGVEZWNvcmF0b3JzKHRlbXBsYXRlU3BlYy5tYWluLCBtYWluLCBjb250YWluZXIsIG9wdGlvbnMuZGVwdGhzIHx8IFtdLCBkYXRhLCBibG9ja1BhcmFtcyk7XG4gICAgcmV0dXJuIG1haW4oY29udGV4dCwgb3B0aW9ucyk7XG4gIH1cbiAgcmV0LmlzVG9wID0gdHJ1ZTtcblxuICByZXQuX3NldHVwID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucy5wYXJ0aWFsKSB7XG4gICAgICBjb250YWluZXIuaGVscGVycyA9IGNvbnRhaW5lci5tZXJnZShvcHRpb25zLmhlbHBlcnMsIGVudi5oZWxwZXJzKTtcblxuICAgICAgaWYgKHRlbXBsYXRlU3BlYy51c2VQYXJ0aWFsKSB7XG4gICAgICAgIGNvbnRhaW5lci5wYXJ0aWFscyA9IGNvbnRhaW5lci5tZXJnZShvcHRpb25zLnBhcnRpYWxzLCBlbnYucGFydGlhbHMpO1xuICAgICAgfVxuICAgICAgaWYgKHRlbXBsYXRlU3BlYy51c2VQYXJ0aWFsIHx8IHRlbXBsYXRlU3BlYy51c2VEZWNvcmF0b3JzKSB7XG4gICAgICAgIGNvbnRhaW5lci5kZWNvcmF0b3JzID0gY29udGFpbmVyLm1lcmdlKG9wdGlvbnMuZGVjb3JhdG9ycywgZW52LmRlY29yYXRvcnMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb250YWluZXIuaGVscGVycyA9IG9wdGlvbnMuaGVscGVycztcbiAgICAgIGNvbnRhaW5lci5wYXJ0aWFscyA9IG9wdGlvbnMucGFydGlhbHM7XG4gICAgICBjb250YWluZXIuZGVjb3JhdG9ycyA9IG9wdGlvbnMuZGVjb3JhdG9ycztcbiAgICB9XG4gIH07XG5cbiAgcmV0Ll9jaGlsZCA9IGZ1bmN0aW9uKGksIGRhdGEsIGJsb2NrUGFyYW1zLCBkZXB0aHMpIHtcbiAgICBpZiAodGVtcGxhdGVTcGVjLnVzZUJsb2NrUGFyYW1zICYmICFibG9ja1BhcmFtcykge1xuICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbignbXVzdCBwYXNzIGJsb2NrIHBhcmFtcycpO1xuICAgIH1cbiAgICBpZiAodGVtcGxhdGVTcGVjLnVzZURlcHRocyAmJiAhZGVwdGhzKSB7XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKCdtdXN0IHBhc3MgcGFyZW50IGRlcHRocycpO1xuICAgIH1cblxuICAgIHJldHVybiB3cmFwUHJvZ3JhbShjb250YWluZXIsIGksIHRlbXBsYXRlU3BlY1tpXSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyk7XG4gIH07XG4gIHJldHVybiByZXQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3cmFwUHJvZ3JhbShjb250YWluZXIsIGksIGZuLCBkYXRhLCBkZWNsYXJlZEJsb2NrUGFyYW1zLCBibG9ja1BhcmFtcywgZGVwdGhzKSB7XG4gIGZ1bmN0aW9uIHByb2coY29udGV4dCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IGN1cnJlbnREZXB0aHMgPSBkZXB0aHM7XG4gICAgaWYgKGRlcHRocyAmJiBjb250ZXh0ICE9IGRlcHRoc1swXSAmJiAhKGNvbnRleHQgPT09IGNvbnRhaW5lci5udWxsQ29udGV4dCAmJiBkZXB0aHNbMF0gPT09IG51bGwpKSB7XG4gICAgICBjdXJyZW50RGVwdGhzID0gW2NvbnRleHRdLmNvbmNhdChkZXB0aHMpO1xuICAgIH1cblxuICAgIHJldHVybiBmbihjb250YWluZXIsXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIGNvbnRhaW5lci5oZWxwZXJzLCBjb250YWluZXIucGFydGlhbHMsXG4gICAgICAgIG9wdGlvbnMuZGF0YSB8fCBkYXRhLFxuICAgICAgICBibG9ja1BhcmFtcyAmJiBbb3B0aW9ucy5ibG9ja1BhcmFtc10uY29uY2F0KGJsb2NrUGFyYW1zKSxcbiAgICAgICAgY3VycmVudERlcHRocyk7XG4gIH1cblxuICBwcm9nID0gZXhlY3V0ZURlY29yYXRvcnMoZm4sIHByb2csIGNvbnRhaW5lciwgZGVwdGhzLCBkYXRhLCBibG9ja1BhcmFtcyk7XG5cbiAgcHJvZy5wcm9ncmFtID0gaTtcbiAgcHJvZy5kZXB0aCA9IGRlcHRocyA/IGRlcHRocy5sZW5ndGggOiAwO1xuICBwcm9nLmJsb2NrUGFyYW1zID0gZGVjbGFyZWRCbG9ja1BhcmFtcyB8fCAwO1xuICByZXR1cm4gcHJvZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVQYXJ0aWFsKHBhcnRpYWwsIGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgaWYgKCFwYXJ0aWFsKSB7XG4gICAgaWYgKG9wdGlvbnMubmFtZSA9PT0gJ0BwYXJ0aWFsLWJsb2NrJykge1xuICAgICAgcGFydGlhbCA9IG9wdGlvbnMuZGF0YVsncGFydGlhbC1ibG9jayddO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJ0aWFsID0gb3B0aW9ucy5wYXJ0aWFsc1tvcHRpb25zLm5hbWVdO1xuICAgIH1cbiAgfSBlbHNlIGlmICghcGFydGlhbC5jYWxsICYmICFvcHRpb25zLm5hbWUpIHtcbiAgICAvLyBUaGlzIGlzIGEgZHluYW1pYyBwYXJ0aWFsIHRoYXQgcmV0dXJuZWQgYSBzdHJpbmdcbiAgICBvcHRpb25zLm5hbWUgPSBwYXJ0aWFsO1xuICAgIHBhcnRpYWwgPSBvcHRpb25zLnBhcnRpYWxzW3BhcnRpYWxdO1xuICB9XG4gIHJldHVybiBwYXJ0aWFsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW52b2tlUGFydGlhbChwYXJ0aWFsLCBjb250ZXh0LCBvcHRpb25zKSB7XG4gIC8vIFVzZSB0aGUgY3VycmVudCBjbG9zdXJlIGNvbnRleHQgdG8gc2F2ZSB0aGUgcGFydGlhbC1ibG9jayBpZiB0aGlzIHBhcnRpYWxcbiAgY29uc3QgY3VycmVudFBhcnRpYWxCbG9jayA9IG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmRhdGFbJ3BhcnRpYWwtYmxvY2snXTtcbiAgb3B0aW9ucy5wYXJ0aWFsID0gdHJ1ZTtcbiAgaWYgKG9wdGlvbnMuaWRzKSB7XG4gICAgb3B0aW9ucy5kYXRhLmNvbnRleHRQYXRoID0gb3B0aW9ucy5pZHNbMF0gfHwgb3B0aW9ucy5kYXRhLmNvbnRleHRQYXRoO1xuICB9XG5cbiAgbGV0IHBhcnRpYWxCbG9jaztcbiAgaWYgKG9wdGlvbnMuZm4gJiYgb3B0aW9ucy5mbiAhPT0gbm9vcCkge1xuICAgIG9wdGlvbnMuZGF0YSA9IGNyZWF0ZUZyYW1lKG9wdGlvbnMuZGF0YSk7XG4gICAgLy8gV3JhcHBlciBmdW5jdGlvbiB0byBnZXQgYWNjZXNzIHRvIGN1cnJlbnRQYXJ0aWFsQmxvY2sgZnJvbSB0aGUgY2xvc3VyZVxuICAgIGxldCBmbiA9IG9wdGlvbnMuZm47XG4gICAgcGFydGlhbEJsb2NrID0gb3B0aW9ucy5kYXRhWydwYXJ0aWFsLWJsb2NrJ10gPSBmdW5jdGlvbiBwYXJ0aWFsQmxvY2tXcmFwcGVyKGNvbnRleHQsIG9wdGlvbnMgPSB7fSkge1xuXG4gICAgICAvLyBSZXN0b3JlIHRoZSBwYXJ0aWFsLWJsb2NrIGZyb20gdGhlIGNsb3N1cmUgZm9yIHRoZSBleGVjdXRpb24gb2YgdGhlIGJsb2NrXG4gICAgICAvLyBpLmUuIHRoZSBwYXJ0IGluc2lkZSB0aGUgYmxvY2sgb2YgdGhlIHBhcnRpYWwgY2FsbC5cbiAgICAgIG9wdGlvbnMuZGF0YSA9IGNyZWF0ZUZyYW1lKG9wdGlvbnMuZGF0YSk7XG4gICAgICBvcHRpb25zLmRhdGFbJ3BhcnRpYWwtYmxvY2snXSA9IGN1cnJlbnRQYXJ0aWFsQmxvY2s7XG4gICAgICByZXR1cm4gZm4oY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfTtcbiAgICBpZiAoZm4ucGFydGlhbHMpIHtcbiAgICAgIG9wdGlvbnMucGFydGlhbHMgPSBVdGlscy5leHRlbmQoe30sIG9wdGlvbnMucGFydGlhbHMsIGZuLnBhcnRpYWxzKTtcbiAgICB9XG4gIH1cblxuICBpZiAocGFydGlhbCA9PT0gdW5kZWZpbmVkICYmIHBhcnRpYWxCbG9jaykge1xuICAgIHBhcnRpYWwgPSBwYXJ0aWFsQmxvY2s7XG4gIH1cblxuICBpZiAocGFydGlhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IEV4Y2VwdGlvbignVGhlIHBhcnRpYWwgJyArIG9wdGlvbnMubmFtZSArICcgY291bGQgbm90IGJlIGZvdW5kJyk7XG4gIH0gZWxzZSBpZiAocGFydGlhbCBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgcmV0dXJuIHBhcnRpYWwoY29udGV4dCwgb3B0aW9ucyk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vb3AoKSB7IHJldHVybiAnJzsgfVxuXG5mdW5jdGlvbiBpbml0RGF0YShjb250ZXh0LCBkYXRhKSB7XG4gIGlmICghZGF0YSB8fCAhKCdyb290JyBpbiBkYXRhKSkge1xuICAgIGRhdGEgPSBkYXRhID8gY3JlYXRlRnJhbWUoZGF0YSkgOiB7fTtcbiAgICBkYXRhLnJvb3QgPSBjb250ZXh0O1xuICB9XG4gIHJldHVybiBkYXRhO1xufVxuXG5mdW5jdGlvbiBleGVjdXRlRGVjb3JhdG9ycyhmbiwgcHJvZywgY29udGFpbmVyLCBkZXB0aHMsIGRhdGEsIGJsb2NrUGFyYW1zKSB7XG4gIGlmIChmbi5kZWNvcmF0b3IpIHtcbiAgICBsZXQgcHJvcHMgPSB7fTtcbiAgICBwcm9nID0gZm4uZGVjb3JhdG9yKHByb2csIHByb3BzLCBjb250YWluZXIsIGRlcHRocyAmJiBkZXB0aHNbMF0sIGRhdGEsIGJsb2NrUGFyYW1zLCBkZXB0aHMpO1xuICAgIFV0aWxzLmV4dGVuZChwcm9nLCBwcm9wcyk7XG4gIH1cbiAgcmV0dXJuIHByb2c7XG59XG4iXX0=


/***/ }),
/* 31 */
/***/ (function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/* global window */
	'use strict';

	exports.__esModule = true;

	exports['default'] = function (Handlebars) {
	  /* istanbul ignore next */
	  var root = typeof global !== 'undefined' ? global : window,
	      $Handlebars = root.Handlebars;
	  /* istanbul ignore next */
	  Handlebars.noConflict = function () {
	    if (root.Handlebars === Handlebars) {
	      root.Handlebars = $Handlebars;
	    }
	    return Handlebars;
	  };
	};

	module.exports = exports['default'];
	//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL25vLWNvbmZsaWN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O3FCQUNlLFVBQVMsVUFBVSxFQUFFOztBQUVsQyxNQUFJLElBQUksR0FBRyxPQUFPLE1BQU0sS0FBSyxXQUFXLEdBQUcsTUFBTSxHQUFHLE1BQU07TUFDdEQsV0FBVyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7O0FBRWxDLFlBQVUsQ0FBQyxVQUFVLEdBQUcsWUFBVztBQUNqQyxRQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssVUFBVSxFQUFFO0FBQ2xDLFVBQUksQ0FBQyxVQUFVLEdBQUcsV0FBVyxDQUFDO0tBQy9CO0FBQ0QsV0FBTyxVQUFVLENBQUM7R0FDbkIsQ0FBQztDQUNIIiwiZmlsZSI6Im5vLWNvbmZsaWN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZ2xvYmFsIHdpbmRvdyAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oSGFuZGxlYmFycykge1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICBsZXQgcm9vdCA9IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDogd2luZG93LFxuICAgICAgJEhhbmRsZWJhcnMgPSByb290LkhhbmRsZWJhcnM7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIEhhbmRsZWJhcnMubm9Db25mbGljdCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChyb290LkhhbmRsZWJhcnMgPT09IEhhbmRsZWJhcnMpIHtcbiAgICAgIHJvb3QuSGFuZGxlYmFycyA9ICRIYW5kbGViYXJzO1xuICAgIH1cbiAgICByZXR1cm4gSGFuZGxlYmFycztcbiAgfTtcbn1cbiJdfQ==

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

	var Handlebars = __webpack_require__(13);
	function __default(obj) { return obj && (obj.__esModule ? obj["default"] : obj); }
	module.exports = (Handlebars["default"] || Handlebars).template({"1":function(container,depth0,helpers,partials,data) {
	    var stack1;

	  return "      <p>"
	    + container.escapeExpression(container.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.wanted_game : depth0)) != null ? stack1.game : stack1)) != null ? stack1.summary : stack1), depth0))
	    + "</p>\n";
	},"3":function(container,depth0,helpers,partials,data) {
	    return "      <p>No summary provided.</p>\n";
	},"5":function(container,depth0,helpers,partials,data) {
	    var stack1;

	  return "      <p>"
	    + container.escapeExpression(container.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.wanted_game : depth0)) != null ? stack1.game : stack1)) != null ? stack1.storyline : stack1), depth0))
	    + "</p>\n";
	},"7":function(container,depth0,helpers,partials,data) {
	    return "      <p>No storyline provided.</p>\n";
	},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
	    var stack1, alias1=container.lambda, alias2=container.escapeExpression, alias3=depth0 != null ? depth0 : (container.nullContext || {});

	  return "\n<h3 class=\"game-name\">"
	    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.wanted_game : depth0)) != null ? stack1.game : stack1)) != null ? stack1.game_name : stack1), depth0))
	    + "</h3>\n<h4>Summary</h4>\n"
	    + ((stack1 = helpers["if"].call(alias3,((stack1 = ((stack1 = (depth0 != null ? depth0.wanted_game : depth0)) != null ? stack1.game : stack1)) != null ? stack1.summary : stack1),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data})) != null ? stack1 : "")
	    + "<h4>Storyline</h4>\n"
	    + ((stack1 = helpers["if"].call(alias3,((stack1 = ((stack1 = (depth0 != null ? depth0.wanted_game : depth0)) != null ? stack1.game : stack1)) != null ? stack1.storyline : stack1),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.program(7, data, 0),"data":data})) != null ? stack1 : "")
	    + "<img src=\"https://images.igdb.com/igdb/image/upload/t_cover_big/"
	    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.wanted_game : depth0)) != null ? stack1.game : stack1)) != null ? stack1.cloudinary_id : stack1), depth0))
	    + ".jpg\"\n alt=\"screen shot\">\n\n<h4 class=\"message\"></h4>\n\n<button id=\"delete-wanted-game\" type=\"button\" class=\"crud-btn btn btn-danger\"\n name=\"delete-wanted-game-btn\">Delete</button>\n<button type=\"submit\" class=\"back-btn btn btn-secondary\"\n name=\"back-button\">Back</button>\n";
	},"useData":true});

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

	var Handlebars = __webpack_require__(13);
	function __default(obj) { return obj && (obj.__esModule ? obj["default"] : obj); }
	module.exports = (Handlebars["default"] || Handlebars).template({"1":function(container,depth0,helpers,partials,data) {
	    var stack1;

	  return "      <p>"
	    + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? depth0.game : depth0)) != null ? stack1.summary : stack1), depth0))
	    + "</p>\n";
	},"3":function(container,depth0,helpers,partials,data) {
	    return "      <p>No summary provided.</p>\n";
	},"5":function(container,depth0,helpers,partials,data) {
	    var stack1;

	  return "      <p>"
	    + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? depth0.game : depth0)) != null ? stack1.storyline : stack1), depth0))
	    + "</p>\n";
	},"7":function(container,depth0,helpers,partials,data) {
	    return "      <p>No storyline provided.</p>\n";
	},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
	    var stack1, alias1=container.lambda, alias2=container.escapeExpression, alias3=depth0 != null ? depth0 : (container.nullContext || {});

	  return "<h3 class=\"game-name\">"
	    + alias2(alias1(((stack1 = (depth0 != null ? depth0.game : depth0)) != null ? stack1.name : stack1), depth0))
	    + "</h3>\n<h4>Summary</h4>\n"
	    + ((stack1 = helpers["if"].call(alias3,((stack1 = (depth0 != null ? depth0.game : depth0)) != null ? stack1.summary : stack1),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data})) != null ? stack1 : "")
	    + "<h4>Storyline</h4>\n"
	    + ((stack1 = helpers["if"].call(alias3,((stack1 = (depth0 != null ? depth0.game : depth0)) != null ? stack1.storyline : stack1),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.program(7, data, 0),"data":data})) != null ? stack1 : "")
	    + "<img src=\"https://images.igdb.com/igdb/image/upload/t_cover_big/"
	    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.game : depth0)) != null ? stack1.cover : stack1)) != null ? stack1.cloudinary_id : stack1), depth0))
	    + ".jpg\"\n alt=\"screen shot\">\n\n<h4 class=\"message hbs-message\"></h4>\n\n<button id=\"post-game\" type=\"submit\" class=\"btn btn-success\"\n name=\"post-game-btn\">Add to Wishlist</button>\n<button type=\"submit\" class=\"back-btn btn btn-secondary\"\n name=\"back-button\">Back</button>\n";
	},"useData":true});

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*! DataTables 1.10.15
	 * ©2008-2017 SpryMedia Ltd - datatables.net/license
	 */

	/**
	 * @summary     DataTables
	 * @description Paginate, search and order HTML tables
	 * @version     1.10.15
	 * @file        jquery.dataTables.js
	 * @author      SpryMedia Ltd
	 * @contact     www.datatables.net
	 * @copyright   Copyright 2008-2017 SpryMedia Ltd.
	 *
	 * This source file is free software, available under the following license:
	 *   MIT license - http://datatables.net/license
	 *
	 * This source file is distributed in the hope that it will be useful, but
	 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
	 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
	 *
	 * For details please refer to: http://www.datatables.net
	 */

	/*jslint evil: true, undef: true, browser: true */
	/*globals $,require,jQuery,define,_selector_run,_selector_opts,_selector_first,_selector_row_indexes,_ext,_Api,_api_register,_api_registerPlural,_re_new_lines,_re_html,_re_formatted_numeric,_re_escape_regex,_empty,_intVal,_numToDecimal,_isNumber,_isHtml,_htmlNumeric,_pluck,_pluck_order,_range,_stripHtml,_unique,_fnBuildAjax,_fnAjaxUpdate,_fnAjaxParameters,_fnAjaxUpdateDraw,_fnAjaxDataSrc,_fnAddColumn,_fnColumnOptions,_fnAdjustColumnSizing,_fnVisibleToColumnIndex,_fnColumnIndexToVisible,_fnVisbleColumns,_fnGetColumns,_fnColumnTypes,_fnApplyColumnDefs,_fnHungarianMap,_fnCamelToHungarian,_fnLanguageCompat,_fnBrowserDetect,_fnAddData,_fnAddTr,_fnNodeToDataIndex,_fnNodeToColumnIndex,_fnGetCellData,_fnSetCellData,_fnSplitObjNotation,_fnGetObjectDataFn,_fnSetObjectDataFn,_fnGetDataMaster,_fnClearTable,_fnDeleteIndex,_fnInvalidate,_fnGetRowElements,_fnCreateTr,_fnBuildHead,_fnDrawHead,_fnDraw,_fnReDraw,_fnAddOptionsHtml,_fnDetectHeader,_fnGetUniqueThs,_fnFeatureHtmlFilter,_fnFilterComplete,_fnFilterCustom,_fnFilterColumn,_fnFilter,_fnFilterCreateSearch,_fnEscapeRegex,_fnFilterData,_fnFeatureHtmlInfo,_fnUpdateInfo,_fnInfoMacros,_fnInitialise,_fnInitComplete,_fnLengthChange,_fnFeatureHtmlLength,_fnFeatureHtmlPaginate,_fnPageChange,_fnFeatureHtmlProcessing,_fnProcessingDisplay,_fnFeatureHtmlTable,_fnScrollDraw,_fnApplyToChildren,_fnCalculateColumnWidths,_fnThrottle,_fnConvertToWidth,_fnGetWidestNode,_fnGetMaxLenString,_fnStringToCss,_fnSortFlatten,_fnSort,_fnSortAria,_fnSortListener,_fnSortAttachListener,_fnSortingClasses,_fnSortData,_fnSaveState,_fnLoadState,_fnSettingsFromNode,_fnLog,_fnMap,_fnBindAction,_fnCallbackReg,_fnCallbackFire,_fnLengthOverflow,_fnRenderer,_fnDataSource,_fnRowAttributes*/

	(function( factory ) {
		"use strict";

		if ( true ) {
			// AMD
			!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2)], __WEBPACK_AMD_DEFINE_RESULT__ = function ( $ ) {
				return factory( $, window, document );
			}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		}
		else if ( typeof exports === 'object' ) {
			// CommonJS
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = typeof window !== 'undefined' ? // jQuery's factory checks for a global window
						require('jquery') :
						require('jquery')( root );
				}

				return factory( $, root, root.document );
			};
		}
		else {
			// Browser
			factory( jQuery, window, document );
		}
	}
	(function( $, window, document, undefined ) {
		"use strict";

		/**
		 * DataTables is a plug-in for the jQuery Javascript library. It is a highly
		 * flexible tool, based upon the foundations of progressive enhancement,
		 * which will add advanced interaction controls to any HTML table. For a
		 * full list of features please refer to
		 * [DataTables.net](href="http://datatables.net).
		 *
		 * Note that the `DataTable` object is not a global variable but is aliased
		 * to `jQuery.fn.DataTable` and `jQuery.fn.dataTable` through which it may
		 * be  accessed.
		 *
		 *  @class
		 *  @param {object} [init={}] Configuration object for DataTables. Options
		 *    are defined by {@link DataTable.defaults}
		 *  @requires jQuery 1.7+
		 *
		 *  @example
		 *    // Basic initialisation
		 *    $(document).ready( function {
		 *      $('#example').dataTable();
		 *    } );
		 *
		 *  @example
		 *    // Initialisation with configuration options - in this case, disable
		 *    // pagination and sorting.
		 *    $(document).ready( function {
		 *      $('#example').dataTable( {
		 *        "paginate": false,
		 *        "sort": false
		 *      } );
		 *    } );
		 */
		var DataTable = function ( options )
		{
			/**
			 * Perform a jQuery selector action on the table's TR elements (from the tbody) and
			 * return the resulting jQuery object.
			 *  @param {string|node|jQuery} sSelector jQuery selector or node collection to act on
			 *  @param {object} [oOpts] Optional parameters for modifying the rows to be included
			 *  @param {string} [oOpts.filter=none] Select TR elements that meet the current filter
			 *    criterion ("applied") or all TR elements (i.e. no filter).
			 *  @param {string} [oOpts.order=current] Order of the TR elements in the processed array.
			 *    Can be either 'current', whereby the current sorting of the table is used, or
			 *    'original' whereby the original order the data was read into the table is used.
			 *  @param {string} [oOpts.page=all] Limit the selection to the currently displayed page
			 *    ("current") or not ("all"). If 'current' is given, then order is assumed to be
			 *    'current' and filter is 'applied', regardless of what they might be given as.
			 *  @returns {object} jQuery object, filtered by the given selector.
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable = $('#example').dataTable();
			 *
			 *      // Highlight every second row
			 *      oTable.$('tr:odd').css('backgroundColor', 'blue');
			 *    } );
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable = $('#example').dataTable();
			 *
			 *      // Filter to rows with 'Webkit' in them, add a background colour and then
			 *      // remove the filter, thus highlighting the 'Webkit' rows only.
			 *      oTable.fnFilter('Webkit');
			 *      oTable.$('tr', {"search": "applied"}).css('backgroundColor', 'blue');
			 *      oTable.fnFilter('');
			 *    } );
			 */
			this.$ = function ( sSelector, oOpts )
			{
				return this.api(true).$( sSelector, oOpts );
			};
			
			
			/**
			 * Almost identical to $ in operation, but in this case returns the data for the matched
			 * rows - as such, the jQuery selector used should match TR row nodes or TD/TH cell nodes
			 * rather than any descendants, so the data can be obtained for the row/cell. If matching
			 * rows are found, the data returned is the original data array/object that was used to
			 * create the row (or a generated array if from a DOM source).
			 *
			 * This method is often useful in-combination with $ where both functions are given the
			 * same parameters and the array indexes will match identically.
			 *  @param {string|node|jQuery} sSelector jQuery selector or node collection to act on
			 *  @param {object} [oOpts] Optional parameters for modifying the rows to be included
			 *  @param {string} [oOpts.filter=none] Select elements that meet the current filter
			 *    criterion ("applied") or all elements (i.e. no filter).
			 *  @param {string} [oOpts.order=current] Order of the data in the processed array.
			 *    Can be either 'current', whereby the current sorting of the table is used, or
			 *    'original' whereby the original order the data was read into the table is used.
			 *  @param {string} [oOpts.page=all] Limit the selection to the currently displayed page
			 *    ("current") or not ("all"). If 'current' is given, then order is assumed to be
			 *    'current' and filter is 'applied', regardless of what they might be given as.
			 *  @returns {array} Data for the matched elements. If any elements, as a result of the
			 *    selector, were not TR, TD or TH elements in the DataTable, they will have a null
			 *    entry in the array.
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable = $('#example').dataTable();
			 *
			 *      // Get the data from the first row in the table
			 *      var data = oTable._('tr:first');
			 *
			 *      // Do something useful with the data
			 *      alert( "First cell is: "+data[0] );
			 *    } );
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable = $('#example').dataTable();
			 *
			 *      // Filter to 'Webkit' and get all data for
			 *      oTable.fnFilter('Webkit');
			 *      var data = oTable._('tr', {"search": "applied"});
			 *
			 *      // Do something with the data
			 *      alert( data.length+" rows matched the search" );
			 *    } );
			 */
			this._ = function ( sSelector, oOpts )
			{
				return this.api(true).rows( sSelector, oOpts ).data();
			};
			
			
			/**
			 * Create a DataTables Api instance, with the currently selected tables for
			 * the Api's context.
			 * @param {boolean} [traditional=false] Set the API instance's context to be
			 *   only the table referred to by the `DataTable.ext.iApiIndex` option, as was
			 *   used in the API presented by DataTables 1.9- (i.e. the traditional mode),
			 *   or if all tables captured in the jQuery object should be used.
			 * @return {DataTables.Api}
			 */
			this.api = function ( traditional )
			{
				return traditional ?
					new _Api(
						_fnSettingsFromNode( this[ _ext.iApiIndex ] )
					) :
					new _Api( this );
			};
			
			
			/**
			 * Add a single new row or multiple rows of data to the table. Please note
			 * that this is suitable for client-side processing only - if you are using
			 * server-side processing (i.e. "bServerSide": true), then to add data, you
			 * must add it to the data source, i.e. the server-side, through an Ajax call.
			 *  @param {array|object} data The data to be added to the table. This can be:
			 *    <ul>
			 *      <li>1D array of data - add a single row with the data provided</li>
			 *      <li>2D array of arrays - add multiple rows in a single call</li>
			 *      <li>object - data object when using <i>mData</i></li>
			 *      <li>array of objects - multiple data objects when using <i>mData</i></li>
			 *    </ul>
			 *  @param {bool} [redraw=true] redraw the table or not
			 *  @returns {array} An array of integers, representing the list of indexes in
			 *    <i>aoData</i> ({@link DataTable.models.oSettings}) that have been added to
			 *    the table.
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    // Global var for counter
			 *    var giCount = 2;
			 *
			 *    $(document).ready(function() {
			 *      $('#example').dataTable();
			 *    } );
			 *
			 *    function fnClickAddRow() {
			 *      $('#example').dataTable().fnAddData( [
			 *        giCount+".1",
			 *        giCount+".2",
			 *        giCount+".3",
			 *        giCount+".4" ]
			 *      );
			 *
			 *      giCount++;
			 *    }
			 */
			this.fnAddData = function( data, redraw )
			{
				var api = this.api( true );
			
				/* Check if we want to add multiple rows or not */
				var rows = $.isArray(data) && ( $.isArray(data[0]) || $.isPlainObject(data[0]) ) ?
					api.rows.add( data ) :
					api.row.add( data );
			
				if ( redraw === undefined || redraw ) {
					api.draw();
				}
			
				return rows.flatten().toArray();
			};
			
			
			/**
			 * This function will make DataTables recalculate the column sizes, based on the data
			 * contained in the table and the sizes applied to the columns (in the DOM, CSS or
			 * through the sWidth parameter). This can be useful when the width of the table's
			 * parent element changes (for example a window resize).
			 *  @param {boolean} [bRedraw=true] Redraw the table or not, you will typically want to
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable = $('#example').dataTable( {
			 *        "sScrollY": "200px",
			 *        "bPaginate": false
			 *      } );
			 *
			 *      $(window).on('resize', function () {
			 *        oTable.fnAdjustColumnSizing();
			 *      } );
			 *    } );
			 */
			this.fnAdjustColumnSizing = function ( bRedraw )
			{
				var api = this.api( true ).columns.adjust();
				var settings = api.settings()[0];
				var scroll = settings.oScroll;
			
				if ( bRedraw === undefined || bRedraw ) {
					api.draw( false );
				}
				else if ( scroll.sX !== "" || scroll.sY !== "" ) {
					/* If not redrawing, but scrolling, we want to apply the new column sizes anyway */
					_fnScrollDraw( settings );
				}
			};
			
			
			/**
			 * Quickly and simply clear a table
			 *  @param {bool} [bRedraw=true] redraw the table or not
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable = $('#example').dataTable();
			 *
			 *      // Immediately 'nuke' the current rows (perhaps waiting for an Ajax callback...)
			 *      oTable.fnClearTable();
			 *    } );
			 */
			this.fnClearTable = function( bRedraw )
			{
				var api = this.api( true ).clear();
			
				if ( bRedraw === undefined || bRedraw ) {
					api.draw();
				}
			};
			
			
			/**
			 * The exact opposite of 'opening' a row, this function will close any rows which
			 * are currently 'open'.
			 *  @param {node} nTr the table row to 'close'
			 *  @returns {int} 0 on success, or 1 if failed (can't find the row)
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable;
			 *
			 *      // 'open' an information row when a row is clicked on
			 *      $('#example tbody tr').click( function () {
			 *        if ( oTable.fnIsOpen(this) ) {
			 *          oTable.fnClose( this );
			 *        } else {
			 *          oTable.fnOpen( this, "Temporary row opened", "info_row" );
			 *        }
			 *      } );
			 *
			 *      oTable = $('#example').dataTable();
			 *    } );
			 */
			this.fnClose = function( nTr )
			{
				this.api( true ).row( nTr ).child.hide();
			};
			
			
			/**
			 * Remove a row for the table
			 *  @param {mixed} target The index of the row from aoData to be deleted, or
			 *    the TR element you want to delete
			 *  @param {function|null} [callBack] Callback function
			 *  @param {bool} [redraw=true] Redraw the table or not
			 *  @returns {array} The row that was deleted
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable = $('#example').dataTable();
			 *
			 *      // Immediately remove the first row
			 *      oTable.fnDeleteRow( 0 );
			 *    } );
			 */
			this.fnDeleteRow = function( target, callback, redraw )
			{
				var api = this.api( true );
				var rows = api.rows( target );
				var settings = rows.settings()[0];
				var data = settings.aoData[ rows[0][0] ];
			
				rows.remove();
			
				if ( callback ) {
					callback.call( this, settings, data );
				}
			
				if ( redraw === undefined || redraw ) {
					api.draw();
				}
			
				return data;
			};
			
			
			/**
			 * Restore the table to it's original state in the DOM by removing all of DataTables
			 * enhancements, alterations to the DOM structure of the table and event listeners.
			 *  @param {boolean} [remove=false] Completely remove the table from the DOM
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      // This example is fairly pointless in reality, but shows how fnDestroy can be used
			 *      var oTable = $('#example').dataTable();
			 *      oTable.fnDestroy();
			 *    } );
			 */
			this.fnDestroy = function ( remove )
			{
				this.api( true ).destroy( remove );
			};
			
			
			/**
			 * Redraw the table
			 *  @param {bool} [complete=true] Re-filter and resort (if enabled) the table before the draw.
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable = $('#example').dataTable();
			 *
			 *      // Re-draw the table - you wouldn't want to do it here, but it's an example :-)
			 *      oTable.fnDraw();
			 *    } );
			 */
			this.fnDraw = function( complete )
			{
				// Note that this isn't an exact match to the old call to _fnDraw - it takes
				// into account the new data, but can hold position.
				this.api( true ).draw( complete );
			};
			
			
			/**
			 * Filter the input based on data
			 *  @param {string} sInput String to filter the table on
			 *  @param {int|null} [iColumn] Column to limit filtering to
			 *  @param {bool} [bRegex=false] Treat as regular expression or not
			 *  @param {bool} [bSmart=true] Perform smart filtering or not
			 *  @param {bool} [bShowGlobal=true] Show the input global filter in it's input box(es)
			 *  @param {bool} [bCaseInsensitive=true] Do case-insensitive matching (true) or not (false)
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable = $('#example').dataTable();
			 *
			 *      // Sometime later - filter...
			 *      oTable.fnFilter( 'test string' );
			 *    } );
			 */
			this.fnFilter = function( sInput, iColumn, bRegex, bSmart, bShowGlobal, bCaseInsensitive )
			{
				var api = this.api( true );
			
				if ( iColumn === null || iColumn === undefined ) {
					api.search( sInput, bRegex, bSmart, bCaseInsensitive );
				}
				else {
					api.column( iColumn ).search( sInput, bRegex, bSmart, bCaseInsensitive );
				}
			
				api.draw();
			};
			
			
			/**
			 * Get the data for the whole table, an individual row or an individual cell based on the
			 * provided parameters.
			 *  @param {int|node} [src] A TR row node, TD/TH cell node or an integer. If given as
			 *    a TR node then the data source for the whole row will be returned. If given as a
			 *    TD/TH cell node then iCol will be automatically calculated and the data for the
			 *    cell returned. If given as an integer, then this is treated as the aoData internal
			 *    data index for the row (see fnGetPosition) and the data for that row used.
			 *  @param {int} [col] Optional column index that you want the data of.
			 *  @returns {array|object|string} If mRow is undefined, then the data for all rows is
			 *    returned. If mRow is defined, just data for that row, and is iCol is
			 *    defined, only data for the designated cell is returned.
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    // Row data
			 *    $(document).ready(function() {
			 *      oTable = $('#example').dataTable();
			 *
			 *      oTable.$('tr').click( function () {
			 *        var data = oTable.fnGetData( this );
			 *        // ... do something with the array / object of data for the row
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Individual cell data
			 *    $(document).ready(function() {
			 *      oTable = $('#example').dataTable();
			 *
			 *      oTable.$('td').click( function () {
			 *        var sData = oTable.fnGetData( this );
			 *        alert( 'The cell clicked on had the value of '+sData );
			 *      } );
			 *    } );
			 */
			this.fnGetData = function( src, col )
			{
				var api = this.api( true );
			
				if ( src !== undefined ) {
					var type = src.nodeName ? src.nodeName.toLowerCase() : '';
			
					return col !== undefined || type == 'td' || type == 'th' ?
						api.cell( src, col ).data() :
						api.row( src ).data() || null;
				}
			
				return api.data().toArray();
			};
			
			
			/**
			 * Get an array of the TR nodes that are used in the table's body. Note that you will
			 * typically want to use the '$' API method in preference to this as it is more
			 * flexible.
			 *  @param {int} [iRow] Optional row index for the TR element you want
			 *  @returns {array|node} If iRow is undefined, returns an array of all TR elements
			 *    in the table's body, or iRow is defined, just the TR element requested.
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable = $('#example').dataTable();
			 *
			 *      // Get the nodes from the table
			 *      var nNodes = oTable.fnGetNodes( );
			 *    } );
			 */
			this.fnGetNodes = function( iRow )
			{
				var api = this.api( true );
			
				return iRow !== undefined ?
					api.row( iRow ).node() :
					api.rows().nodes().flatten().toArray();
			};
			
			
			/**
			 * Get the array indexes of a particular cell from it's DOM element
			 * and column index including hidden columns
			 *  @param {node} node this can either be a TR, TD or TH in the table's body
			 *  @returns {int} If nNode is given as a TR, then a single index is returned, or
			 *    if given as a cell, an array of [row index, column index (visible),
			 *    column index (all)] is given.
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      $('#example tbody td').click( function () {
			 *        // Get the position of the current data from the node
			 *        var aPos = oTable.fnGetPosition( this );
			 *
			 *        // Get the data array for this row
			 *        var aData = oTable.fnGetData( aPos[0] );
			 *
			 *        // Update the data array and return the value
			 *        aData[ aPos[1] ] = 'clicked';
			 *        this.innerHTML = 'clicked';
			 *      } );
			 *
			 *      // Init DataTables
			 *      oTable = $('#example').dataTable();
			 *    } );
			 */
			this.fnGetPosition = function( node )
			{
				var api = this.api( true );
				var nodeName = node.nodeName.toUpperCase();
			
				if ( nodeName == 'TR' ) {
					return api.row( node ).index();
				}
				else if ( nodeName == 'TD' || nodeName == 'TH' ) {
					var cell = api.cell( node ).index();
			
					return [
						cell.row,
						cell.columnVisible,
						cell.column
					];
				}
				return null;
			};
			
			
			/**
			 * Check to see if a row is 'open' or not.
			 *  @param {node} nTr the table row to check
			 *  @returns {boolean} true if the row is currently open, false otherwise
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable;
			 *
			 *      // 'open' an information row when a row is clicked on
			 *      $('#example tbody tr').click( function () {
			 *        if ( oTable.fnIsOpen(this) ) {
			 *          oTable.fnClose( this );
			 *        } else {
			 *          oTable.fnOpen( this, "Temporary row opened", "info_row" );
			 *        }
			 *      } );
			 *
			 *      oTable = $('#example').dataTable();
			 *    } );
			 */
			this.fnIsOpen = function( nTr )
			{
				return this.api( true ).row( nTr ).child.isShown();
			};
			
			
			/**
			 * This function will place a new row directly after a row which is currently
			 * on display on the page, with the HTML contents that is passed into the
			 * function. This can be used, for example, to ask for confirmation that a
			 * particular record should be deleted.
			 *  @param {node} nTr The table row to 'open'
			 *  @param {string|node|jQuery} mHtml The HTML to put into the row
			 *  @param {string} sClass Class to give the new TD cell
			 *  @returns {node} The row opened. Note that if the table row passed in as the
			 *    first parameter, is not found in the table, this method will silently
			 *    return.
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable;
			 *
			 *      // 'open' an information row when a row is clicked on
			 *      $('#example tbody tr').click( function () {
			 *        if ( oTable.fnIsOpen(this) ) {
			 *          oTable.fnClose( this );
			 *        } else {
			 *          oTable.fnOpen( this, "Temporary row opened", "info_row" );
			 *        }
			 *      } );
			 *
			 *      oTable = $('#example').dataTable();
			 *    } );
			 */
			this.fnOpen = function( nTr, mHtml, sClass )
			{
				return this.api( true )
					.row( nTr )
					.child( mHtml, sClass )
					.show()
					.child()[0];
			};
			
			
			/**
			 * Change the pagination - provides the internal logic for pagination in a simple API
			 * function. With this function you can have a DataTables table go to the next,
			 * previous, first or last pages.
			 *  @param {string|int} mAction Paging action to take: "first", "previous", "next" or "last"
			 *    or page number to jump to (integer), note that page 0 is the first page.
			 *  @param {bool} [bRedraw=true] Redraw the table or not
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable = $('#example').dataTable();
			 *      oTable.fnPageChange( 'next' );
			 *    } );
			 */
			this.fnPageChange = function ( mAction, bRedraw )
			{
				var api = this.api( true ).page( mAction );
			
				if ( bRedraw === undefined || bRedraw ) {
					api.draw(false);
				}
			};
			
			
			/**
			 * Show a particular column
			 *  @param {int} iCol The column whose display should be changed
			 *  @param {bool} bShow Show (true) or hide (false) the column
			 *  @param {bool} [bRedraw=true] Redraw the table or not
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable = $('#example').dataTable();
			 *
			 *      // Hide the second column after initialisation
			 *      oTable.fnSetColumnVis( 1, false );
			 *    } );
			 */
			this.fnSetColumnVis = function ( iCol, bShow, bRedraw )
			{
				var api = this.api( true ).column( iCol ).visible( bShow );
			
				if ( bRedraw === undefined || bRedraw ) {
					api.columns.adjust().draw();
				}
			};
			
			
			/**
			 * Get the settings for a particular table for external manipulation
			 *  @returns {object} DataTables settings object. See
			 *    {@link DataTable.models.oSettings}
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable = $('#example').dataTable();
			 *      var oSettings = oTable.fnSettings();
			 *
			 *      // Show an example parameter from the settings
			 *      alert( oSettings._iDisplayStart );
			 *    } );
			 */
			this.fnSettings = function()
			{
				return _fnSettingsFromNode( this[_ext.iApiIndex] );
			};
			
			
			/**
			 * Sort the table by a particular column
			 *  @param {int} iCol the data index to sort on. Note that this will not match the
			 *    'display index' if you have hidden data entries
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable = $('#example').dataTable();
			 *
			 *      // Sort immediately with columns 0 and 1
			 *      oTable.fnSort( [ [0,'asc'], [1,'asc'] ] );
			 *    } );
			 */
			this.fnSort = function( aaSort )
			{
				this.api( true ).order( aaSort ).draw();
			};
			
			
			/**
			 * Attach a sort listener to an element for a given column
			 *  @param {node} nNode the element to attach the sort listener to
			 *  @param {int} iColumn the column that a click on this node will sort on
			 *  @param {function} [fnCallback] callback function when sort is run
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable = $('#example').dataTable();
			 *
			 *      // Sort on column 1, when 'sorter' is clicked on
			 *      oTable.fnSortListener( document.getElementById('sorter'), 1 );
			 *    } );
			 */
			this.fnSortListener = function( nNode, iColumn, fnCallback )
			{
				this.api( true ).order.listener( nNode, iColumn, fnCallback );
			};
			
			
			/**
			 * Update a table cell or row - this method will accept either a single value to
			 * update the cell with, an array of values with one element for each column or
			 * an object in the same format as the original data source. The function is
			 * self-referencing in order to make the multi column updates easier.
			 *  @param {object|array|string} mData Data to update the cell/row with
			 *  @param {node|int} mRow TR element you want to update or the aoData index
			 *  @param {int} [iColumn] The column to update, give as null or undefined to
			 *    update a whole row.
			 *  @param {bool} [bRedraw=true] Redraw the table or not
			 *  @param {bool} [bAction=true] Perform pre-draw actions or not
			 *  @returns {int} 0 on success, 1 on error
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable = $('#example').dataTable();
			 *      oTable.fnUpdate( 'Example update', 0, 0 ); // Single cell
			 *      oTable.fnUpdate( ['a', 'b', 'c', 'd', 'e'], $('tbody tr')[0] ); // Row
			 *    } );
			 */
			this.fnUpdate = function( mData, mRow, iColumn, bRedraw, bAction )
			{
				var api = this.api( true );
			
				if ( iColumn === undefined || iColumn === null ) {
					api.row( mRow ).data( mData );
				}
				else {
					api.cell( mRow, iColumn ).data( mData );
				}
			
				if ( bAction === undefined || bAction ) {
					api.columns.adjust();
				}
			
				if ( bRedraw === undefined || bRedraw ) {
					api.draw();
				}
				return 0;
			};
			
			
			/**
			 * Provide a common method for plug-ins to check the version of DataTables being used, in order
			 * to ensure compatibility.
			 *  @param {string} sVersion Version string to check for, in the format "X.Y.Z". Note that the
			 *    formats "X" and "X.Y" are also acceptable.
			 *  @returns {boolean} true if this version of DataTables is greater or equal to the required
			 *    version, or false if this version of DataTales is not suitable
			 *  @method
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable = $('#example').dataTable();
			 *      alert( oTable.fnVersionCheck( '1.9.0' ) );
			 *    } );
			 */
			this.fnVersionCheck = _ext.fnVersionCheck;
			

			var _that = this;
			var emptyInit = options === undefined;
			var len = this.length;

			if ( emptyInit ) {
				options = {};
			}

			this.oApi = this.internal = _ext.internal;

			// Extend with old style plug-in API methods
			for ( var fn in DataTable.ext.internal ) {
				if ( fn ) {
					this[fn] = _fnExternApiFunc(fn);
				}
			}

			this.each(function() {
				// For each initialisation we want to give it a clean initialisation
				// object that can be bashed around
				var o = {};
				var oInit = len > 1 ? // optimisation for single table case
					_fnExtend( o, options, true ) :
					options;

				/*global oInit,_that,emptyInit*/
				var i=0, iLen, j, jLen, k, kLen;
				var sId = this.getAttribute( 'id' );
				var bInitHandedOff = false;
				var defaults = DataTable.defaults;
				var $this = $(this);
				
				
				/* Sanity check */
				if ( this.nodeName.toLowerCase() != 'table' )
				{
					_fnLog( null, 0, 'Non-table node initialisation ('+this.nodeName+')', 2 );
					return;
				}
				
				/* Backwards compatibility for the defaults */
				_fnCompatOpts( defaults );
				_fnCompatCols( defaults.column );
				
				/* Convert the camel-case defaults to Hungarian */
				_fnCamelToHungarian( defaults, defaults, true );
				_fnCamelToHungarian( defaults.column, defaults.column, true );
				
				/* Setting up the initialisation object */
				_fnCamelToHungarian( defaults, $.extend( oInit, $this.data() ) );
				
				
				
				/* Check to see if we are re-initialising a table */
				var allSettings = DataTable.settings;
				for ( i=0, iLen=allSettings.length ; i<iLen ; i++ )
				{
					var s = allSettings[i];
				
					/* Base check on table node */
					if ( s.nTable == this || s.nTHead.parentNode == this || (s.nTFoot && s.nTFoot.parentNode == this) )
					{
						var bRetrieve = oInit.bRetrieve !== undefined ? oInit.bRetrieve : defaults.bRetrieve;
						var bDestroy = oInit.bDestroy !== undefined ? oInit.bDestroy : defaults.bDestroy;
				
						if ( emptyInit || bRetrieve )
						{
							return s.oInstance;
						}
						else if ( bDestroy )
						{
							s.oInstance.fnDestroy();
							break;
						}
						else
						{
							_fnLog( s, 0, 'Cannot reinitialise DataTable', 3 );
							return;
						}
					}
				
					/* If the element we are initialising has the same ID as a table which was previously
					 * initialised, but the table nodes don't match (from before) then we destroy the old
					 * instance by simply deleting it. This is under the assumption that the table has been
					 * destroyed by other methods. Anyone using non-id selectors will need to do this manually
					 */
					if ( s.sTableId == this.id )
					{
						allSettings.splice( i, 1 );
						break;
					}
				}
				
				/* Ensure the table has an ID - required for accessibility */
				if ( sId === null || sId === "" )
				{
					sId = "DataTables_Table_"+(DataTable.ext._unique++);
					this.id = sId;
				}
				
				/* Create the settings object for this table and set some of the default parameters */
				var oSettings = $.extend( true, {}, DataTable.models.oSettings, {
					"sDestroyWidth": $this[0].style.width,
					"sInstance":     sId,
					"sTableId":      sId
				} );
				oSettings.nTable = this;
				oSettings.oApi   = _that.internal;
				oSettings.oInit  = oInit;
				
				allSettings.push( oSettings );
				
				// Need to add the instance after the instance after the settings object has been added
				// to the settings array, so we can self reference the table instance if more than one
				oSettings.oInstance = (_that.length===1) ? _that : $this.dataTable();
				
				// Backwards compatibility, before we apply all the defaults
				_fnCompatOpts( oInit );
				
				if ( oInit.oLanguage )
				{
					_fnLanguageCompat( oInit.oLanguage );
				}
				
				// If the length menu is given, but the init display length is not, use the length menu
				if ( oInit.aLengthMenu && ! oInit.iDisplayLength )
				{
					oInit.iDisplayLength = $.isArray( oInit.aLengthMenu[0] ) ?
						oInit.aLengthMenu[0][0] : oInit.aLengthMenu[0];
				}
				
				// Apply the defaults and init options to make a single init object will all
				// options defined from defaults and instance options.
				oInit = _fnExtend( $.extend( true, {}, defaults ), oInit );
				
				
				// Map the initialisation options onto the settings object
				_fnMap( oSettings.oFeatures, oInit, [
					"bPaginate",
					"bLengthChange",
					"bFilter",
					"bSort",
					"bSortMulti",
					"bInfo",
					"bProcessing",
					"bAutoWidth",
					"bSortClasses",
					"bServerSide",
					"bDeferRender"
				] );
				_fnMap( oSettings, oInit, [
					"asStripeClasses",
					"ajax",
					"fnServerData",
					"fnFormatNumber",
					"sServerMethod",
					"aaSorting",
					"aaSortingFixed",
					"aLengthMenu",
					"sPaginationType",
					"sAjaxSource",
					"sAjaxDataProp",
					"iStateDuration",
					"sDom",
					"bSortCellsTop",
					"iTabIndex",
					"fnStateLoadCallback",
					"fnStateSaveCallback",
					"renderer",
					"searchDelay",
					"rowId",
					[ "iCookieDuration", "iStateDuration" ], // backwards compat
					[ "oSearch", "oPreviousSearch" ],
					[ "aoSearchCols", "aoPreSearchCols" ],
					[ "iDisplayLength", "_iDisplayLength" ],
					[ "bJQueryUI", "bJUI" ]
				] );
				_fnMap( oSettings.oScroll, oInit, [
					[ "sScrollX", "sX" ],
					[ "sScrollXInner", "sXInner" ],
					[ "sScrollY", "sY" ],
					[ "bScrollCollapse", "bCollapse" ]
				] );
				_fnMap( oSettings.oLanguage, oInit, "fnInfoCallback" );
				
				/* Callback functions which are array driven */
				_fnCallbackReg( oSettings, 'aoDrawCallback',       oInit.fnDrawCallback,      'user' );
				_fnCallbackReg( oSettings, 'aoServerParams',       oInit.fnServerParams,      'user' );
				_fnCallbackReg( oSettings, 'aoStateSaveParams',    oInit.fnStateSaveParams,   'user' );
				_fnCallbackReg( oSettings, 'aoStateLoadParams',    oInit.fnStateLoadParams,   'user' );
				_fnCallbackReg( oSettings, 'aoStateLoaded',        oInit.fnStateLoaded,       'user' );
				_fnCallbackReg( oSettings, 'aoRowCallback',        oInit.fnRowCallback,       'user' );
				_fnCallbackReg( oSettings, 'aoRowCreatedCallback', oInit.fnCreatedRow,        'user' );
				_fnCallbackReg( oSettings, 'aoHeaderCallback',     oInit.fnHeaderCallback,    'user' );
				_fnCallbackReg( oSettings, 'aoFooterCallback',     oInit.fnFooterCallback,    'user' );
				_fnCallbackReg( oSettings, 'aoInitComplete',       oInit.fnInitComplete,      'user' );
				_fnCallbackReg( oSettings, 'aoPreDrawCallback',    oInit.fnPreDrawCallback,   'user' );
				
				oSettings.rowIdFn = _fnGetObjectDataFn( oInit.rowId );
				
				/* Browser support detection */
				_fnBrowserDetect( oSettings );
				
				var oClasses = oSettings.oClasses;
				
				// @todo Remove in 1.11
				if ( oInit.bJQueryUI )
				{
					/* Use the JUI classes object for display. You could clone the oStdClasses object if
					 * you want to have multiple tables with multiple independent classes
					 */
					$.extend( oClasses, DataTable.ext.oJUIClasses, oInit.oClasses );
				
					if ( oInit.sDom === defaults.sDom && defaults.sDom === "lfrtip" )
					{
						/* Set the DOM to use a layout suitable for jQuery UI's theming */
						oSettings.sDom = '<"H"lfr>t<"F"ip>';
					}
				
					if ( ! oSettings.renderer ) {
						oSettings.renderer = 'jqueryui';
					}
					else if ( $.isPlainObject( oSettings.renderer ) && ! oSettings.renderer.header ) {
						oSettings.renderer.header = 'jqueryui';
					}
				}
				else
				{
					$.extend( oClasses, DataTable.ext.classes, oInit.oClasses );
				}
				$this.addClass( oClasses.sTable );
				
				
				if ( oSettings.iInitDisplayStart === undefined )
				{
					/* Display start point, taking into account the save saving */
					oSettings.iInitDisplayStart = oInit.iDisplayStart;
					oSettings._iDisplayStart = oInit.iDisplayStart;
				}
				
				if ( oInit.iDeferLoading !== null )
				{
					oSettings.bDeferLoading = true;
					var tmp = $.isArray( oInit.iDeferLoading );
					oSettings._iRecordsDisplay = tmp ? oInit.iDeferLoading[0] : oInit.iDeferLoading;
					oSettings._iRecordsTotal = tmp ? oInit.iDeferLoading[1] : oInit.iDeferLoading;
				}
				
				/* Language definitions */
				var oLanguage = oSettings.oLanguage;
				$.extend( true, oLanguage, oInit.oLanguage );
				
				if ( oLanguage.sUrl )
				{
					/* Get the language definitions from a file - because this Ajax call makes the language
					 * get async to the remainder of this function we use bInitHandedOff to indicate that
					 * _fnInitialise will be fired by the returned Ajax handler, rather than the constructor
					 */
					$.ajax( {
						dataType: 'json',
						url: oLanguage.sUrl,
						success: function ( json ) {
							_fnLanguageCompat( json );
							_fnCamelToHungarian( defaults.oLanguage, json );
							$.extend( true, oLanguage, json );
							_fnInitialise( oSettings );
						},
						error: function () {
							// Error occurred loading language file, continue on as best we can
							_fnInitialise( oSettings );
						}
					} );
					bInitHandedOff = true;
				}
				
				/*
				 * Stripes
				 */
				if ( oInit.asStripeClasses === null )
				{
					oSettings.asStripeClasses =[
						oClasses.sStripeOdd,
						oClasses.sStripeEven
					];
				}
				
				/* Remove row stripe classes if they are already on the table row */
				var stripeClasses = oSettings.asStripeClasses;
				var rowOne = $this.children('tbody').find('tr').eq(0);
				if ( $.inArray( true, $.map( stripeClasses, function(el, i) {
					return rowOne.hasClass(el);
				} ) ) !== -1 ) {
					$('tbody tr', this).removeClass( stripeClasses.join(' ') );
					oSettings.asDestroyStripes = stripeClasses.slice();
				}
				
				/*
				 * Columns
				 * See if we should load columns automatically or use defined ones
				 */
				var anThs = [];
				var aoColumnsInit;
				var nThead = this.getElementsByTagName('thead');
				if ( nThead.length !== 0 )
				{
					_fnDetectHeader( oSettings.aoHeader, nThead[0] );
					anThs = _fnGetUniqueThs( oSettings );
				}
				
				/* If not given a column array, generate one with nulls */
				if ( oInit.aoColumns === null )
				{
					aoColumnsInit = [];
					for ( i=0, iLen=anThs.length ; i<iLen ; i++ )
					{
						aoColumnsInit.push( null );
					}
				}
				else
				{
					aoColumnsInit = oInit.aoColumns;
				}
				
				/* Add the columns */
				for ( i=0, iLen=aoColumnsInit.length ; i<iLen ; i++ )
				{
					_fnAddColumn( oSettings, anThs ? anThs[i] : null );
				}
				
				/* Apply the column definitions */
				_fnApplyColumnDefs( oSettings, oInit.aoColumnDefs, aoColumnsInit, function (iCol, oDef) {
					_fnColumnOptions( oSettings, iCol, oDef );
				} );
				
				/* HTML5 attribute detection - build an mData object automatically if the
				 * attributes are found
				 */
				if ( rowOne.length ) {
					var a = function ( cell, name ) {
						return cell.getAttribute( 'data-'+name ) !== null ? name : null;
					};
				
					$( rowOne[0] ).children('th, td').each( function (i, cell) {
						var col = oSettings.aoColumns[i];
				
						if ( col.mData === i ) {
							var sort = a( cell, 'sort' ) || a( cell, 'order' );
							var filter = a( cell, 'filter' ) || a( cell, 'search' );
				
							if ( sort !== null || filter !== null ) {
								col.mData = {
									_:      i+'.display',
									sort:   sort !== null   ? i+'.@data-'+sort   : undefined,
									type:   sort !== null   ? i+'.@data-'+sort   : undefined,
									filter: filter !== null ? i+'.@data-'+filter : undefined
								};
				
								_fnColumnOptions( oSettings, i );
							}
						}
					} );
				}
				
				var features = oSettings.oFeatures;
				var loadedInit = function () {
					/*
					 * Sorting
					 * @todo For modularisation (1.11) this needs to do into a sort start up handler
					 */
				
					// If aaSorting is not defined, then we use the first indicator in asSorting
					// in case that has been altered, so the default sort reflects that option
					if ( oInit.aaSorting === undefined ) {
						var sorting = oSettings.aaSorting;
						for ( i=0, iLen=sorting.length ; i<iLen ; i++ ) {
							sorting[i][1] = oSettings.aoColumns[ i ].asSorting[0];
						}
					}
				
					/* Do a first pass on the sorting classes (allows any size changes to be taken into
					 * account, and also will apply sorting disabled classes if disabled
					 */
					_fnSortingClasses( oSettings );
				
					if ( features.bSort ) {
						_fnCallbackReg( oSettings, 'aoDrawCallback', function () {
							if ( oSettings.bSorted ) {
								var aSort = _fnSortFlatten( oSettings );
								var sortedColumns = {};
				
								$.each( aSort, function (i, val) {
									sortedColumns[ val.src ] = val.dir;
								} );
				
								_fnCallbackFire( oSettings, null, 'order', [oSettings, aSort, sortedColumns] );
								_fnSortAria( oSettings );
							}
						} );
					}
				
					_fnCallbackReg( oSettings, 'aoDrawCallback', function () {
						if ( oSettings.bSorted || _fnDataSource( oSettings ) === 'ssp' || features.bDeferRender ) {
							_fnSortingClasses( oSettings );
						}
					}, 'sc' );
				
				
					/*
					 * Final init
					 * Cache the header, body and footer as required, creating them if needed
					 */
				
					// Work around for Webkit bug 83867 - store the caption-side before removing from doc
					var captions = $this.children('caption').each( function () {
						this._captionSide = $(this).css('caption-side');
					} );
				
					var thead = $this.children('thead');
					if ( thead.length === 0 ) {
						thead = $('<thead/>').appendTo($this);
					}
					oSettings.nTHead = thead[0];
				
					var tbody = $this.children('tbody');
					if ( tbody.length === 0 ) {
						tbody = $('<tbody/>').appendTo($this);
					}
					oSettings.nTBody = tbody[0];
				
					var tfoot = $this.children('tfoot');
					if ( tfoot.length === 0 && captions.length > 0 && (oSettings.oScroll.sX !== "" || oSettings.oScroll.sY !== "") ) {
						// If we are a scrolling table, and no footer has been given, then we need to create
						// a tfoot element for the caption element to be appended to
						tfoot = $('<tfoot/>').appendTo($this);
					}
				
					if ( tfoot.length === 0 || tfoot.children().length === 0 ) {
						$this.addClass( oClasses.sNoFooter );
					}
					else if ( tfoot.length > 0 ) {
						oSettings.nTFoot = tfoot[0];
						_fnDetectHeader( oSettings.aoFooter, oSettings.nTFoot );
					}
				
					/* Check if there is data passing into the constructor */
					if ( oInit.aaData ) {
						for ( i=0 ; i<oInit.aaData.length ; i++ ) {
							_fnAddData( oSettings, oInit.aaData[ i ] );
						}
					}
					else if ( oSettings.bDeferLoading || _fnDataSource( oSettings ) == 'dom' ) {
						/* Grab the data from the page - only do this when deferred loading or no Ajax
						 * source since there is no point in reading the DOM data if we are then going
						 * to replace it with Ajax data
						 */
						_fnAddTr( oSettings, $(oSettings.nTBody).children('tr') );
					}
				
					/* Copy the data index array */
					oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
				
					/* Initialisation complete - table can be drawn */
					oSettings.bInitialised = true;
				
					/* Check if we need to initialise the table (it might not have been handed off to the
					 * language processor)
					 */
					if ( bInitHandedOff === false ) {
						_fnInitialise( oSettings );
					}
				};
				
				/* Must be done after everything which can be overridden by the state saving! */
				if ( oInit.bStateSave )
				{
					features.bStateSave = true;
					_fnCallbackReg( oSettings, 'aoDrawCallback', _fnSaveState, 'state_save' );
					_fnLoadState( oSettings, oInit, loadedInit );
				}
				else {
					loadedInit();
				}
				
			} );
			_that = null;
			return this;
		};

		
		/*
		 * It is useful to have variables which are scoped locally so only the
		 * DataTables functions can access them and they don't leak into global space.
		 * At the same time these functions are often useful over multiple files in the
		 * core and API, so we list, or at least document, all variables which are used
		 * by DataTables as private variables here. This also ensures that there is no
		 * clashing of variable names and that they can easily referenced for reuse.
		 */
		
		
		// Defined else where
		//  _selector_run
		//  _selector_opts
		//  _selector_first
		//  _selector_row_indexes
		
		var _ext; // DataTable.ext
		var _Api; // DataTable.Api
		var _api_register; // DataTable.Api.register
		var _api_registerPlural; // DataTable.Api.registerPlural
		
		var _re_dic = {};
		var _re_new_lines = /[\r\n]/g;
		var _re_html = /<.*?>/g;
		
		// This is not strict ISO8601 - Date.parse() is quite lax, although
		// implementations differ between browsers.
		var _re_date = /^\d{2,4}[\.\/\-]\d{1,2}[\.\/\-]\d{1,2}([T ]{1}\d{1,2}[:\.]\d{2}([\.:]\d{2})?)?$/;
		
		// Escape regular expression special characters
		var _re_escape_regex = new RegExp( '(\\' + [ '/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\', '$', '^', '-' ].join('|\\') + ')', 'g' );
		
		// http://en.wikipedia.org/wiki/Foreign_exchange_market
		// - \u20BD - Russian ruble.
		// - \u20a9 - South Korean Won
		// - \u20BA - Turkish Lira
		// - \u20B9 - Indian Rupee
		// - R - Brazil (R$) and South Africa
		// - fr - Swiss Franc
		// - kr - Swedish krona, Norwegian krone and Danish krone
		// - \u2009 is thin space and \u202F is narrow no-break space, both used in many
		//   standards as thousands separators.
		var _re_formatted_numeric = /[',$£€¥%\u2009\u202F\u20BD\u20a9\u20BArfk]/gi;
		
		
		var _empty = function ( d ) {
			return !d || d === true || d === '-' ? true : false;
		};
		
		
		var _intVal = function ( s ) {
			var integer = parseInt( s, 10 );
			return !isNaN(integer) && isFinite(s) ? integer : null;
		};
		
		// Convert from a formatted number with characters other than `.` as the
		// decimal place, to a Javascript number
		var _numToDecimal = function ( num, decimalPoint ) {
			// Cache created regular expressions for speed as this function is called often
			if ( ! _re_dic[ decimalPoint ] ) {
				_re_dic[ decimalPoint ] = new RegExp( _fnEscapeRegex( decimalPoint ), 'g' );
			}
			return typeof num === 'string' && decimalPoint !== '.' ?
				num.replace( /\./g, '' ).replace( _re_dic[ decimalPoint ], '.' ) :
				num;
		};
		
		
		var _isNumber = function ( d, decimalPoint, formatted ) {
			var strType = typeof d === 'string';
		
			// If empty return immediately so there must be a number if it is a
			// formatted string (this stops the string "k", or "kr", etc being detected
			// as a formatted number for currency
			if ( _empty( d ) ) {
				return true;
			}
		
			if ( decimalPoint && strType ) {
				d = _numToDecimal( d, decimalPoint );
			}
		
			if ( formatted && strType ) {
				d = d.replace( _re_formatted_numeric, '' );
			}
		
			return !isNaN( parseFloat(d) ) && isFinite( d );
		};
		
		
		// A string without HTML in it can be considered to be HTML still
		var _isHtml = function ( d ) {
			return _empty( d ) || typeof d === 'string';
		};
		
		
		var _htmlNumeric = function ( d, decimalPoint, formatted ) {
			if ( _empty( d ) ) {
				return true;
			}
		
			var html = _isHtml( d );
			return ! html ?
				null :
				_isNumber( _stripHtml( d ), decimalPoint, formatted ) ?
					true :
					null;
		};
		
		
		var _pluck = function ( a, prop, prop2 ) {
			var out = [];
			var i=0, ien=a.length;
		
			// Could have the test in the loop for slightly smaller code, but speed
			// is essential here
			if ( prop2 !== undefined ) {
				for ( ; i<ien ; i++ ) {
					if ( a[i] && a[i][ prop ] ) {
						out.push( a[i][ prop ][ prop2 ] );
					}
				}
			}
			else {
				for ( ; i<ien ; i++ ) {
					if ( a[i] ) {
						out.push( a[i][ prop ] );
					}
				}
			}
		
			return out;
		};
		
		
		// Basically the same as _pluck, but rather than looping over `a` we use `order`
		// as the indexes to pick from `a`
		var _pluck_order = function ( a, order, prop, prop2 )
		{
			var out = [];
			var i=0, ien=order.length;
		
			// Could have the test in the loop for slightly smaller code, but speed
			// is essential here
			if ( prop2 !== undefined ) {
				for ( ; i<ien ; i++ ) {
					if ( a[ order[i] ][ prop ] ) {
						out.push( a[ order[i] ][ prop ][ prop2 ] );
					}
				}
			}
			else {
				for ( ; i<ien ; i++ ) {
					out.push( a[ order[i] ][ prop ] );
				}
			}
		
			return out;
		};
		
		
		var _range = function ( len, start )
		{
			var out = [];
			var end;
		
			if ( start === undefined ) {
				start = 0;
				end = len;
			}
			else {
				end = start;
				start = len;
			}
		
			for ( var i=start ; i<end ; i++ ) {
				out.push( i );
			}
		
			return out;
		};
		
		
		var _removeEmpty = function ( a )
		{
			var out = [];
		
			for ( var i=0, ien=a.length ; i<ien ; i++ ) {
				if ( a[i] ) { // careful - will remove all falsy values!
					out.push( a[i] );
				}
			}
		
			return out;
		};
		
		
		var _stripHtml = function ( d ) {
			return d.replace( _re_html, '' );
		};
		
		
		/**
		 * Determine if all values in the array are unique. This means we can short
		 * cut the _unique method at the cost of a single loop. A sorted array is used
		 * to easily check the values.
		 *
		 * @param  {array} src Source array
		 * @return {boolean} true if all unique, false otherwise
		 * @ignore
		 */
		var _areAllUnique = function ( src ) {
			if ( src.length < 2 ) {
				return true;
			}
		
			var sorted = src.slice().sort();
			var last = sorted[0];
		
			for ( var i=1, ien=sorted.length ; i<ien ; i++ ) {
				if ( sorted[i] === last ) {
					return false;
				}
		
				last = sorted[i];
			}
		
			return true;
		};
		
		
		/**
		 * Find the unique elements in a source array.
		 *
		 * @param  {array} src Source array
		 * @return {array} Array of unique items
		 * @ignore
		 */
		var _unique = function ( src )
		{
			if ( _areAllUnique( src ) ) {
				return src.slice();
			}
		
			// A faster unique method is to use object keys to identify used values,
			// but this doesn't work with arrays or objects, which we must also
			// consider. See jsperf.com/compare-array-unique-versions/4 for more
			// information.
			var
				out = [],
				val,
				i, ien=src.length,
				j, k=0;
		
			again: for ( i=0 ; i<ien ; i++ ) {
				val = src[i];
		
				for ( j=0 ; j<k ; j++ ) {
					if ( out[j] === val ) {
						continue again;
					}
				}
		
				out.push( val );
				k++;
			}
		
			return out;
		};
		
		
		/**
		 * DataTables utility methods
		 * 
		 * This namespace provides helper methods that DataTables uses internally to
		 * create a DataTable, but which are not exclusively used only for DataTables.
		 * These methods can be used by extension authors to save the duplication of
		 * code.
		 *
		 *  @namespace
		 */
		DataTable.util = {
			/**
			 * Throttle the calls to a function. Arguments and context are maintained
			 * for the throttled function.
			 *
			 * @param {function} fn Function to be called
			 * @param {integer} freq Call frequency in mS
			 * @return {function} Wrapped function
			 */
			throttle: function ( fn, freq ) {
				var
					frequency = freq !== undefined ? freq : 200,
					last,
					timer;
		
				return function () {
					var
						that = this,
						now  = +new Date(),
						args = arguments;
		
					if ( last && now < last + frequency ) {
						clearTimeout( timer );
		
						timer = setTimeout( function () {
							last = undefined;
							fn.apply( that, args );
						}, frequency );
					}
					else {
						last = now;
						fn.apply( that, args );
					}
				};
			},
		
		
			/**
			 * Escape a string such that it can be used in a regular expression
			 *
			 *  @param {string} val string to escape
			 *  @returns {string} escaped string
			 */
			escapeRegex: function ( val ) {
				return val.replace( _re_escape_regex, '\\$1' );
			}
		};
		
		
		
		/**
		 * Create a mapping object that allows camel case parameters to be looked up
		 * for their Hungarian counterparts. The mapping is stored in a private
		 * parameter called `_hungarianMap` which can be accessed on the source object.
		 *  @param {object} o
		 *  @memberof DataTable#oApi
		 */
		function _fnHungarianMap ( o )
		{
			var
				hungarian = 'a aa ai ao as b fn i m o s ',
				match,
				newKey,
				map = {};
		
			$.each( o, function (key, val) {
				match = key.match(/^([^A-Z]+?)([A-Z])/);
		
				if ( match && hungarian.indexOf(match[1]+' ') !== -1 )
				{
					newKey = key.replace( match[0], match[2].toLowerCase() );
					map[ newKey ] = key;
		
					if ( match[1] === 'o' )
					{
						_fnHungarianMap( o[key] );
					}
				}
			} );
		
			o._hungarianMap = map;
		}
		
		
		/**
		 * Convert from camel case parameters to Hungarian, based on a Hungarian map
		 * created by _fnHungarianMap.
		 *  @param {object} src The model object which holds all parameters that can be
		 *    mapped.
		 *  @param {object} user The object to convert from camel case to Hungarian.
		 *  @param {boolean} force When set to `true`, properties which already have a
		 *    Hungarian value in the `user` object will be overwritten. Otherwise they
		 *    won't be.
		 *  @memberof DataTable#oApi
		 */
		function _fnCamelToHungarian ( src, user, force )
		{
			if ( ! src._hungarianMap ) {
				_fnHungarianMap( src );
			}
		
			var hungarianKey;
		
			$.each( user, function (key, val) {
				hungarianKey = src._hungarianMap[ key ];
		
				if ( hungarianKey !== undefined && (force || user[hungarianKey] === undefined) )
				{
					// For objects, we need to buzz down into the object to copy parameters
					if ( hungarianKey.charAt(0) === 'o' )
					{
						// Copy the camelCase options over to the hungarian
						if ( ! user[ hungarianKey ] ) {
							user[ hungarianKey ] = {};
						}
						$.extend( true, user[hungarianKey], user[key] );
		
						_fnCamelToHungarian( src[hungarianKey], user[hungarianKey], force );
					}
					else {
						user[hungarianKey] = user[ key ];
					}
				}
			} );
		}
		
		
		/**
		 * Language compatibility - when certain options are given, and others aren't, we
		 * need to duplicate the values over, in order to provide backwards compatibility
		 * with older language files.
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnLanguageCompat( lang )
		{
			var defaults = DataTable.defaults.oLanguage;
			var zeroRecords = lang.sZeroRecords;
		
			/* Backwards compatibility - if there is no sEmptyTable given, then use the same as
			 * sZeroRecords - assuming that is given.
			 */
			if ( ! lang.sEmptyTable && zeroRecords &&
				defaults.sEmptyTable === "No data available in table" )
			{
				_fnMap( lang, lang, 'sZeroRecords', 'sEmptyTable' );
			}
		
			/* Likewise with loading records */
			if ( ! lang.sLoadingRecords && zeroRecords &&
				defaults.sLoadingRecords === "Loading..." )
			{
				_fnMap( lang, lang, 'sZeroRecords', 'sLoadingRecords' );
			}
		
			// Old parameter name of the thousands separator mapped onto the new
			if ( lang.sInfoThousands ) {
				lang.sThousands = lang.sInfoThousands;
			}
		
			var decimal = lang.sDecimal;
			if ( decimal ) {
				_addNumericSort( decimal );
			}
		}
		
		
		/**
		 * Map one parameter onto another
		 *  @param {object} o Object to map
		 *  @param {*} knew The new parameter name
		 *  @param {*} old The old parameter name
		 */
		var _fnCompatMap = function ( o, knew, old ) {
			if ( o[ knew ] !== undefined ) {
				o[ old ] = o[ knew ];
			}
		};
		
		
		/**
		 * Provide backwards compatibility for the main DT options. Note that the new
		 * options are mapped onto the old parameters, so this is an external interface
		 * change only.
		 *  @param {object} init Object to map
		 */
		function _fnCompatOpts ( init )
		{
			_fnCompatMap( init, 'ordering',      'bSort' );
			_fnCompatMap( init, 'orderMulti',    'bSortMulti' );
			_fnCompatMap( init, 'orderClasses',  'bSortClasses' );
			_fnCompatMap( init, 'orderCellsTop', 'bSortCellsTop' );
			_fnCompatMap( init, 'order',         'aaSorting' );
			_fnCompatMap( init, 'orderFixed',    'aaSortingFixed' );
			_fnCompatMap( init, 'paging',        'bPaginate' );
			_fnCompatMap( init, 'pagingType',    'sPaginationType' );
			_fnCompatMap( init, 'pageLength',    'iDisplayLength' );
			_fnCompatMap( init, 'searching',     'bFilter' );
		
			// Boolean initialisation of x-scrolling
			if ( typeof init.sScrollX === 'boolean' ) {
				init.sScrollX = init.sScrollX ? '100%' : '';
			}
			if ( typeof init.scrollX === 'boolean' ) {
				init.scrollX = init.scrollX ? '100%' : '';
			}
		
			// Column search objects are in an array, so it needs to be converted
			// element by element
			var searchCols = init.aoSearchCols;
		
			if ( searchCols ) {
				for ( var i=0, ien=searchCols.length ; i<ien ; i++ ) {
					if ( searchCols[i] ) {
						_fnCamelToHungarian( DataTable.models.oSearch, searchCols[i] );
					}
				}
			}
		}
		
		
		/**
		 * Provide backwards compatibility for column options. Note that the new options
		 * are mapped onto the old parameters, so this is an external interface change
		 * only.
		 *  @param {object} init Object to map
		 */
		function _fnCompatCols ( init )
		{
			_fnCompatMap( init, 'orderable',     'bSortable' );
			_fnCompatMap( init, 'orderData',     'aDataSort' );
			_fnCompatMap( init, 'orderSequence', 'asSorting' );
			_fnCompatMap( init, 'orderDataType', 'sortDataType' );
		
			// orderData can be given as an integer
			var dataSort = init.aDataSort;
			if ( typeof dataSort === 'number' && ! $.isArray( dataSort ) ) {
				init.aDataSort = [ dataSort ];
			}
		}
		
		
		/**
		 * Browser feature detection for capabilities, quirks
		 *  @param {object} settings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnBrowserDetect( settings )
		{
			// We don't need to do this every time DataTables is constructed, the values
			// calculated are specific to the browser and OS configuration which we
			// don't expect to change between initialisations
			if ( ! DataTable.__browser ) {
				var browser = {};
				DataTable.__browser = browser;
		
				// Scrolling feature / quirks detection
				var n = $('<div/>')
					.css( {
						position: 'fixed',
						top: 0,
						left: $(window).scrollLeft()*-1, // allow for scrolling
						height: 1,
						width: 1,
						overflow: 'hidden'
					} )
					.append(
						$('<div/>')
							.css( {
								position: 'absolute',
								top: 1,
								left: 1,
								width: 100,
								overflow: 'scroll'
							} )
							.append(
								$('<div/>')
									.css( {
										width: '100%',
										height: 10
									} )
							)
					)
					.appendTo( 'body' );
		
				var outer = n.children();
				var inner = outer.children();
		
				// Numbers below, in order, are:
				// inner.offsetWidth, inner.clientWidth, outer.offsetWidth, outer.clientWidth
				//
				// IE6 XP:                           100 100 100  83
				// IE7 Vista:                        100 100 100  83
				// IE 8+ Windows:                     83  83 100  83
				// Evergreen Windows:                 83  83 100  83
				// Evergreen Mac with scrollbars:     85  85 100  85
				// Evergreen Mac without scrollbars: 100 100 100 100
		
				// Get scrollbar width
				browser.barWidth = outer[0].offsetWidth - outer[0].clientWidth;
		
				// IE6/7 will oversize a width 100% element inside a scrolling element, to
				// include the width of the scrollbar, while other browsers ensure the inner
				// element is contained without forcing scrolling
				browser.bScrollOversize = inner[0].offsetWidth === 100 && outer[0].clientWidth !== 100;
		
				// In rtl text layout, some browsers (most, but not all) will place the
				// scrollbar on the left, rather than the right.
				browser.bScrollbarLeft = Math.round( inner.offset().left ) !== 1;
		
				// IE8- don't provide height and width for getBoundingClientRect
				browser.bBounding = n[0].getBoundingClientRect().width ? true : false;
		
				n.remove();
			}
		
			$.extend( settings.oBrowser, DataTable.__browser );
			settings.oScroll.iBarWidth = DataTable.__browser.barWidth;
		}
		
		
		/**
		 * Array.prototype reduce[Right] method, used for browsers which don't support
		 * JS 1.6. Done this way to reduce code size, since we iterate either way
		 *  @param {object} settings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnReduce ( that, fn, init, start, end, inc )
		{
			var
				i = start,
				value,
				isSet = false;
		
			if ( init !== undefined ) {
				value = init;
				isSet = true;
			}
		
			while ( i !== end ) {
				if ( ! that.hasOwnProperty(i) ) {
					continue;
				}
		
				value = isSet ?
					fn( value, that[i], i, that ) :
					that[i];
		
				isSet = true;
				i += inc;
			}
		
			return value;
		}
		
		/**
		 * Add a column to the list used for the table with default values
		 *  @param {object} oSettings dataTables settings object
		 *  @param {node} nTh The th element for this column
		 *  @memberof DataTable#oApi
		 */
		function _fnAddColumn( oSettings, nTh )
		{
			// Add column to aoColumns array
			var oDefaults = DataTable.defaults.column;
			var iCol = oSettings.aoColumns.length;
			var oCol = $.extend( {}, DataTable.models.oColumn, oDefaults, {
				"nTh": nTh ? nTh : document.createElement('th'),
				"sTitle":    oDefaults.sTitle    ? oDefaults.sTitle    : nTh ? nTh.innerHTML : '',
				"aDataSort": oDefaults.aDataSort ? oDefaults.aDataSort : [iCol],
				"mData": oDefaults.mData ? oDefaults.mData : iCol,
				idx: iCol
			} );
			oSettings.aoColumns.push( oCol );
		
			// Add search object for column specific search. Note that the `searchCols[ iCol ]`
			// passed into extend can be undefined. This allows the user to give a default
			// with only some of the parameters defined, and also not give a default
			var searchCols = oSettings.aoPreSearchCols;
			searchCols[ iCol ] = $.extend( {}, DataTable.models.oSearch, searchCols[ iCol ] );
		
			// Use the default column options function to initialise classes etc
			_fnColumnOptions( oSettings, iCol, $(nTh).data() );
		}
		
		
		/**
		 * Apply options for a column
		 *  @param {object} oSettings dataTables settings object
		 *  @param {int} iCol column index to consider
		 *  @param {object} oOptions object with sType, bVisible and bSearchable etc
		 *  @memberof DataTable#oApi
		 */
		function _fnColumnOptions( oSettings, iCol, oOptions )
		{
			var oCol = oSettings.aoColumns[ iCol ];
			var oClasses = oSettings.oClasses;
			var th = $(oCol.nTh);
		
			// Try to get width information from the DOM. We can't get it from CSS
			// as we'd need to parse the CSS stylesheet. `width` option can override
			if ( ! oCol.sWidthOrig ) {
				// Width attribute
				oCol.sWidthOrig = th.attr('width') || null;
		
				// Style attribute
				var t = (th.attr('style') || '').match(/width:\s*(\d+[pxem%]+)/);
				if ( t ) {
					oCol.sWidthOrig = t[1];
				}
			}
		
			/* User specified column options */
			if ( oOptions !== undefined && oOptions !== null )
			{
				// Backwards compatibility
				_fnCompatCols( oOptions );
		
				// Map camel case parameters to their Hungarian counterparts
				_fnCamelToHungarian( DataTable.defaults.column, oOptions );
		
				/* Backwards compatibility for mDataProp */
				if ( oOptions.mDataProp !== undefined && !oOptions.mData )
				{
					oOptions.mData = oOptions.mDataProp;
				}
		
				if ( oOptions.sType )
				{
					oCol._sManualType = oOptions.sType;
				}
		
				// `class` is a reserved word in Javascript, so we need to provide
				// the ability to use a valid name for the camel case input
				if ( oOptions.className && ! oOptions.sClass )
				{
					oOptions.sClass = oOptions.className;
				}
		
				$.extend( oCol, oOptions );
				_fnMap( oCol, oOptions, "sWidth", "sWidthOrig" );
		
				/* iDataSort to be applied (backwards compatibility), but aDataSort will take
				 * priority if defined
				 */
				if ( oOptions.iDataSort !== undefined )
				{
					oCol.aDataSort = [ oOptions.iDataSort ];
				}
				_fnMap( oCol, oOptions, "aDataSort" );
			}
		
			/* Cache the data get and set functions for speed */
			var mDataSrc = oCol.mData;
			var mData = _fnGetObjectDataFn( mDataSrc );
			var mRender = oCol.mRender ? _fnGetObjectDataFn( oCol.mRender ) : null;
		
			var attrTest = function( src ) {
				return typeof src === 'string' && src.indexOf('@') !== -1;
			};
			oCol._bAttrSrc = $.isPlainObject( mDataSrc ) && (
				attrTest(mDataSrc.sort) || attrTest(mDataSrc.type) || attrTest(mDataSrc.filter)
			);
			oCol._setter = null;
		
			oCol.fnGetData = function (rowData, type, meta) {
				var innerData = mData( rowData, type, undefined, meta );
		
				return mRender && type ?
					mRender( innerData, type, rowData, meta ) :
					innerData;
			};
			oCol.fnSetData = function ( rowData, val, meta ) {
				return _fnSetObjectDataFn( mDataSrc )( rowData, val, meta );
			};
		
			// Indicate if DataTables should read DOM data as an object or array
			// Used in _fnGetRowElements
			if ( typeof mDataSrc !== 'number' ) {
				oSettings._rowReadObject = true;
			}
		
			/* Feature sorting overrides column specific when off */
			if ( !oSettings.oFeatures.bSort )
			{
				oCol.bSortable = false;
				th.addClass( oClasses.sSortableNone ); // Have to add class here as order event isn't called
			}
		
			/* Check that the class assignment is correct for sorting */
			var bAsc = $.inArray('asc', oCol.asSorting) !== -1;
			var bDesc = $.inArray('desc', oCol.asSorting) !== -1;
			if ( !oCol.bSortable || (!bAsc && !bDesc) )
			{
				oCol.sSortingClass = oClasses.sSortableNone;
				oCol.sSortingClassJUI = "";
			}
			else if ( bAsc && !bDesc )
			{
				oCol.sSortingClass = oClasses.sSortableAsc;
				oCol.sSortingClassJUI = oClasses.sSortJUIAscAllowed;
			}
			else if ( !bAsc && bDesc )
			{
				oCol.sSortingClass = oClasses.sSortableDesc;
				oCol.sSortingClassJUI = oClasses.sSortJUIDescAllowed;
			}
			else
			{
				oCol.sSortingClass = oClasses.sSortable;
				oCol.sSortingClassJUI = oClasses.sSortJUI;
			}
		}
		
		
		/**
		 * Adjust the table column widths for new data. Note: you would probably want to
		 * do a redraw after calling this function!
		 *  @param {object} settings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnAdjustColumnSizing ( settings )
		{
			/* Not interested in doing column width calculation if auto-width is disabled */
			if ( settings.oFeatures.bAutoWidth !== false )
			{
				var columns = settings.aoColumns;
		
				_fnCalculateColumnWidths( settings );
				for ( var i=0 , iLen=columns.length ; i<iLen ; i++ )
				{
					columns[i].nTh.style.width = columns[i].sWidth;
				}
			}
		
			var scroll = settings.oScroll;
			if ( scroll.sY !== '' || scroll.sX !== '')
			{
				_fnScrollDraw( settings );
			}
		
			_fnCallbackFire( settings, null, 'column-sizing', [settings] );
		}
		
		
		/**
		 * Covert the index of a visible column to the index in the data array (take account
		 * of hidden columns)
		 *  @param {object} oSettings dataTables settings object
		 *  @param {int} iMatch Visible column index to lookup
		 *  @returns {int} i the data index
		 *  @memberof DataTable#oApi
		 */
		function _fnVisibleToColumnIndex( oSettings, iMatch )
		{
			var aiVis = _fnGetColumns( oSettings, 'bVisible' );
		
			return typeof aiVis[iMatch] === 'number' ?
				aiVis[iMatch] :
				null;
		}
		
		
		/**
		 * Covert the index of an index in the data array and convert it to the visible
		 *   column index (take account of hidden columns)
		 *  @param {int} iMatch Column index to lookup
		 *  @param {object} oSettings dataTables settings object
		 *  @returns {int} i the data index
		 *  @memberof DataTable#oApi
		 */
		function _fnColumnIndexToVisible( oSettings, iMatch )
		{
			var aiVis = _fnGetColumns( oSettings, 'bVisible' );
			var iPos = $.inArray( iMatch, aiVis );
		
			return iPos !== -1 ? iPos : null;
		}
		
		
		/**
		 * Get the number of visible columns
		 *  @param {object} oSettings dataTables settings object
		 *  @returns {int} i the number of visible columns
		 *  @memberof DataTable#oApi
		 */
		function _fnVisbleColumns( oSettings )
		{
			var vis = 0;
		
			// No reduce in IE8, use a loop for now
			$.each( oSettings.aoColumns, function ( i, col ) {
				if ( col.bVisible && $(col.nTh).css('display') !== 'none' ) {
					vis++;
				}
			} );
		
			return vis;
		}
		
		
		/**
		 * Get an array of column indexes that match a given property
		 *  @param {object} oSettings dataTables settings object
		 *  @param {string} sParam Parameter in aoColumns to look for - typically
		 *    bVisible or bSearchable
		 *  @returns {array} Array of indexes with matched properties
		 *  @memberof DataTable#oApi
		 */
		function _fnGetColumns( oSettings, sParam )
		{
			var a = [];
		
			$.map( oSettings.aoColumns, function(val, i) {
				if ( val[sParam] ) {
					a.push( i );
				}
			} );
		
			return a;
		}
		
		
		/**
		 * Calculate the 'type' of a column
		 *  @param {object} settings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnColumnTypes ( settings )
		{
			var columns = settings.aoColumns;
			var data = settings.aoData;
			var types = DataTable.ext.type.detect;
			var i, ien, j, jen, k, ken;
			var col, cell, detectedType, cache;
		
			// For each column, spin over the 
			for ( i=0, ien=columns.length ; i<ien ; i++ ) {
				col = columns[i];
				cache = [];
		
				if ( ! col.sType && col._sManualType ) {
					col.sType = col._sManualType;
				}
				else if ( ! col.sType ) {
					for ( j=0, jen=types.length ; j<jen ; j++ ) {
						for ( k=0, ken=data.length ; k<ken ; k++ ) {
							// Use a cache array so we only need to get the type data
							// from the formatter once (when using multiple detectors)
							if ( cache[k] === undefined ) {
								cache[k] = _fnGetCellData( settings, k, i, 'type' );
							}
		
							detectedType = types[j]( cache[k], settings );
		
							// If null, then this type can't apply to this column, so
							// rather than testing all cells, break out. There is an
							// exception for the last type which is `html`. We need to
							// scan all rows since it is possible to mix string and HTML
							// types
							if ( ! detectedType && j !== types.length-1 ) {
								break;
							}
		
							// Only a single match is needed for html type since it is
							// bottom of the pile and very similar to string
							if ( detectedType === 'html' ) {
								break;
							}
						}
		
						// Type is valid for all data points in the column - use this
						// type
						if ( detectedType ) {
							col.sType = detectedType;
							break;
						}
					}
		
					// Fall back - if no type was detected, always use string
					if ( ! col.sType ) {
						col.sType = 'string';
					}
				}
			}
		}
		
		
		/**
		 * Take the column definitions and static columns arrays and calculate how
		 * they relate to column indexes. The callback function will then apply the
		 * definition found for a column to a suitable configuration object.
		 *  @param {object} oSettings dataTables settings object
		 *  @param {array} aoColDefs The aoColumnDefs array that is to be applied
		 *  @param {array} aoCols The aoColumns array that defines columns individually
		 *  @param {function} fn Callback function - takes two parameters, the calculated
		 *    column index and the definition for that column.
		 *  @memberof DataTable#oApi
		 */
		function _fnApplyColumnDefs( oSettings, aoColDefs, aoCols, fn )
		{
			var i, iLen, j, jLen, k, kLen, def;
			var columns = oSettings.aoColumns;
		
			// Column definitions with aTargets
			if ( aoColDefs )
			{
				/* Loop over the definitions array - loop in reverse so first instance has priority */
				for ( i=aoColDefs.length-1 ; i>=0 ; i-- )
				{
					def = aoColDefs[i];
		
					/* Each definition can target multiple columns, as it is an array */
					var aTargets = def.targets !== undefined ?
						def.targets :
						def.aTargets;
		
					if ( ! $.isArray( aTargets ) )
					{
						aTargets = [ aTargets ];
					}
		
					for ( j=0, jLen=aTargets.length ; j<jLen ; j++ )
					{
						if ( typeof aTargets[j] === 'number' && aTargets[j] >= 0 )
						{
							/* Add columns that we don't yet know about */
							while( columns.length <= aTargets[j] )
							{
								_fnAddColumn( oSettings );
							}
		
							/* Integer, basic index */
							fn( aTargets[j], def );
						}
						else if ( typeof aTargets[j] === 'number' && aTargets[j] < 0 )
						{
							/* Negative integer, right to left column counting */
							fn( columns.length+aTargets[j], def );
						}
						else if ( typeof aTargets[j] === 'string' )
						{
							/* Class name matching on TH element */
							for ( k=0, kLen=columns.length ; k<kLen ; k++ )
							{
								if ( aTargets[j] == "_all" ||
								     $(columns[k].nTh).hasClass( aTargets[j] ) )
								{
									fn( k, def );
								}
							}
						}
					}
				}
			}
		
			// Statically defined columns array
			if ( aoCols )
			{
				for ( i=0, iLen=aoCols.length ; i<iLen ; i++ )
				{
					fn( i, aoCols[i] );
				}
			}
		}
		
		/**
		 * Add a data array to the table, creating DOM node etc. This is the parallel to
		 * _fnGatherData, but for adding rows from a Javascript source, rather than a
		 * DOM source.
		 *  @param {object} oSettings dataTables settings object
		 *  @param {array} aData data array to be added
		 *  @param {node} [nTr] TR element to add to the table - optional. If not given,
		 *    DataTables will create a row automatically
		 *  @param {array} [anTds] Array of TD|TH elements for the row - must be given
		 *    if nTr is.
		 *  @returns {int} >=0 if successful (index of new aoData entry), -1 if failed
		 *  @memberof DataTable#oApi
		 */
		function _fnAddData ( oSettings, aDataIn, nTr, anTds )
		{
			/* Create the object for storing information about this new row */
			var iRow = oSettings.aoData.length;
			var oData = $.extend( true, {}, DataTable.models.oRow, {
				src: nTr ? 'dom' : 'data',
				idx: iRow
			} );
		
			oData._aData = aDataIn;
			oSettings.aoData.push( oData );
		
			/* Create the cells */
			var nTd, sThisType;
			var columns = oSettings.aoColumns;
		
			// Invalidate the column types as the new data needs to be revalidated
			for ( var i=0, iLen=columns.length ; i<iLen ; i++ )
			{
				columns[i].sType = null;
			}
		
			/* Add to the display array */
			oSettings.aiDisplayMaster.push( iRow );
		
			var id = oSettings.rowIdFn( aDataIn );
			if ( id !== undefined ) {
				oSettings.aIds[ id ] = oData;
			}
		
			/* Create the DOM information, or register it if already present */
			if ( nTr || ! oSettings.oFeatures.bDeferRender )
			{
				_fnCreateTr( oSettings, iRow, nTr, anTds );
			}
		
			return iRow;
		}
		
		
		/**
		 * Add one or more TR elements to the table. Generally we'd expect to
		 * use this for reading data from a DOM sourced table, but it could be
		 * used for an TR element. Note that if a TR is given, it is used (i.e.
		 * it is not cloned).
		 *  @param {object} settings dataTables settings object
		 *  @param {array|node|jQuery} trs The TR element(s) to add to the table
		 *  @returns {array} Array of indexes for the added rows
		 *  @memberof DataTable#oApi
		 */
		function _fnAddTr( settings, trs )
		{
			var row;
		
			// Allow an individual node to be passed in
			if ( ! (trs instanceof $) ) {
				trs = $(trs);
			}
		
			return trs.map( function (i, el) {
				row = _fnGetRowElements( settings, el );
				return _fnAddData( settings, row.data, el, row.cells );
			} );
		}
		
		
		/**
		 * Take a TR element and convert it to an index in aoData
		 *  @param {object} oSettings dataTables settings object
		 *  @param {node} n the TR element to find
		 *  @returns {int} index if the node is found, null if not
		 *  @memberof DataTable#oApi
		 */
		function _fnNodeToDataIndex( oSettings, n )
		{
			return (n._DT_RowIndex!==undefined) ? n._DT_RowIndex : null;
		}
		
		
		/**
		 * Take a TD element and convert it into a column data index (not the visible index)
		 *  @param {object} oSettings dataTables settings object
		 *  @param {int} iRow The row number the TD/TH can be found in
		 *  @param {node} n The TD/TH element to find
		 *  @returns {int} index if the node is found, -1 if not
		 *  @memberof DataTable#oApi
		 */
		function _fnNodeToColumnIndex( oSettings, iRow, n )
		{
			return $.inArray( n, oSettings.aoData[ iRow ].anCells );
		}
		
		
		/**
		 * Get the data for a given cell from the internal cache, taking into account data mapping
		 *  @param {object} settings dataTables settings object
		 *  @param {int} rowIdx aoData row id
		 *  @param {int} colIdx Column index
		 *  @param {string} type data get type ('display', 'type' 'filter' 'sort')
		 *  @returns {*} Cell data
		 *  @memberof DataTable#oApi
		 */
		function _fnGetCellData( settings, rowIdx, colIdx, type )
		{
			var draw           = settings.iDraw;
			var col            = settings.aoColumns[colIdx];
			var rowData        = settings.aoData[rowIdx]._aData;
			var defaultContent = col.sDefaultContent;
			var cellData       = col.fnGetData( rowData, type, {
				settings: settings,
				row:      rowIdx,
				col:      colIdx
			} );
		
			if ( cellData === undefined ) {
				if ( settings.iDrawError != draw && defaultContent === null ) {
					_fnLog( settings, 0, "Requested unknown parameter "+
						(typeof col.mData=='function' ? '{function}' : "'"+col.mData+"'")+
						" for row "+rowIdx+", column "+colIdx, 4 );
					settings.iDrawError = draw;
				}
				return defaultContent;
			}
		
			// When the data source is null and a specific data type is requested (i.e.
			// not the original data), we can use default column data
			if ( (cellData === rowData || cellData === null) && defaultContent !== null && type !== undefined ) {
				cellData = defaultContent;
			}
			else if ( typeof cellData === 'function' ) {
				// If the data source is a function, then we run it and use the return,
				// executing in the scope of the data object (for instances)
				return cellData.call( rowData );
			}
		
			if ( cellData === null && type == 'display' ) {
				return '';
			}
			return cellData;
		}
		
		
		/**
		 * Set the value for a specific cell, into the internal data cache
		 *  @param {object} settings dataTables settings object
		 *  @param {int} rowIdx aoData row id
		 *  @param {int} colIdx Column index
		 *  @param {*} val Value to set
		 *  @memberof DataTable#oApi
		 */
		function _fnSetCellData( settings, rowIdx, colIdx, val )
		{
			var col     = settings.aoColumns[colIdx];
			var rowData = settings.aoData[rowIdx]._aData;
		
			col.fnSetData( rowData, val, {
				settings: settings,
				row:      rowIdx,
				col:      colIdx
			}  );
		}
		
		
		// Private variable that is used to match action syntax in the data property object
		var __reArray = /\[.*?\]$/;
		var __reFn = /\(\)$/;
		
		/**
		 * Split string on periods, taking into account escaped periods
		 * @param  {string} str String to split
		 * @return {array} Split string
		 */
		function _fnSplitObjNotation( str )
		{
			return $.map( str.match(/(\\.|[^\.])+/g) || [''], function ( s ) {
				return s.replace(/\\\./g, '.');
			} );
		}
		
		
		/**
		 * Return a function that can be used to get data from a source object, taking
		 * into account the ability to use nested objects as a source
		 *  @param {string|int|function} mSource The data source for the object
		 *  @returns {function} Data get function
		 *  @memberof DataTable#oApi
		 */
		function _fnGetObjectDataFn( mSource )
		{
			if ( $.isPlainObject( mSource ) )
			{
				/* Build an object of get functions, and wrap them in a single call */
				var o = {};
				$.each( mSource, function (key, val) {
					if ( val ) {
						o[key] = _fnGetObjectDataFn( val );
					}
				} );
		
				return function (data, type, row, meta) {
					var t = o[type] || o._;
					return t !== undefined ?
						t(data, type, row, meta) :
						data;
				};
			}
			else if ( mSource === null )
			{
				/* Give an empty string for rendering / sorting etc */
				return function (data) { // type, row and meta also passed, but not used
					return data;
				};
			}
			else if ( typeof mSource === 'function' )
			{
				return function (data, type, row, meta) {
					return mSource( data, type, row, meta );
				};
			}
			else if ( typeof mSource === 'string' && (mSource.indexOf('.') !== -1 ||
				      mSource.indexOf('[') !== -1 || mSource.indexOf('(') !== -1) )
			{
				/* If there is a . in the source string then the data source is in a
				 * nested object so we loop over the data for each level to get the next
				 * level down. On each loop we test for undefined, and if found immediately
				 * return. This allows entire objects to be missing and sDefaultContent to
				 * be used if defined, rather than throwing an error
				 */
				var fetchData = function (data, type, src) {
					var arrayNotation, funcNotation, out, innerSrc;
		
					if ( src !== "" )
					{
						var a = _fnSplitObjNotation( src );
		
						for ( var i=0, iLen=a.length ; i<iLen ; i++ )
						{
							// Check if we are dealing with special notation
							arrayNotation = a[i].match(__reArray);
							funcNotation = a[i].match(__reFn);
		
							if ( arrayNotation )
							{
								// Array notation
								a[i] = a[i].replace(__reArray, '');
		
								// Condition allows simply [] to be passed in
								if ( a[i] !== "" ) {
									data = data[ a[i] ];
								}
								out = [];
		
								// Get the remainder of the nested object to get
								a.splice( 0, i+1 );
								innerSrc = a.join('.');
		
								// Traverse each entry in the array getting the properties requested
								if ( $.isArray( data ) ) {
									for ( var j=0, jLen=data.length ; j<jLen ; j++ ) {
										out.push( fetchData( data[j], type, innerSrc ) );
									}
								}
		
								// If a string is given in between the array notation indicators, that
								// is used to join the strings together, otherwise an array is returned
								var join = arrayNotation[0].substring(1, arrayNotation[0].length-1);
								data = (join==="") ? out : out.join(join);
		
								// The inner call to fetchData has already traversed through the remainder
								// of the source requested, so we exit from the loop
								break;
							}
							else if ( funcNotation )
							{
								// Function call
								a[i] = a[i].replace(__reFn, '');
								data = data[ a[i] ]();
								continue;
							}
		
							if ( data === null || data[ a[i] ] === undefined )
							{
								return undefined;
							}
							data = data[ a[i] ];
						}
					}
		
					return data;
				};
		
				return function (data, type) { // row and meta also passed, but not used
					return fetchData( data, type, mSource );
				};
			}
			else
			{
				/* Array or flat object mapping */
				return function (data, type) { // row and meta also passed, but not used
					return data[mSource];
				};
			}
		}
		
		
		/**
		 * Return a function that can be used to set data from a source object, taking
		 * into account the ability to use nested objects as a source
		 *  @param {string|int|function} mSource The data source for the object
		 *  @returns {function} Data set function
		 *  @memberof DataTable#oApi
		 */
		function _fnSetObjectDataFn( mSource )
		{
			if ( $.isPlainObject( mSource ) )
			{
				/* Unlike get, only the underscore (global) option is used for for
				 * setting data since we don't know the type here. This is why an object
				 * option is not documented for `mData` (which is read/write), but it is
				 * for `mRender` which is read only.
				 */
				return _fnSetObjectDataFn( mSource._ );
			}
			else if ( mSource === null )
			{
				/* Nothing to do when the data source is null */
				return function () {};
			}
			else if ( typeof mSource === 'function' )
			{
				return function (data, val, meta) {
					mSource( data, 'set', val, meta );
				};
			}
			else if ( typeof mSource === 'string' && (mSource.indexOf('.') !== -1 ||
				      mSource.indexOf('[') !== -1 || mSource.indexOf('(') !== -1) )
			{
				/* Like the get, we need to get data from a nested object */
				var setData = function (data, val, src) {
					var a = _fnSplitObjNotation( src ), b;
					var aLast = a[a.length-1];
					var arrayNotation, funcNotation, o, innerSrc;
		
					for ( var i=0, iLen=a.length-1 ; i<iLen ; i++ )
					{
						// Check if we are dealing with an array notation request
						arrayNotation = a[i].match(__reArray);
						funcNotation = a[i].match(__reFn);
		
						if ( arrayNotation )
						{
							a[i] = a[i].replace(__reArray, '');
							data[ a[i] ] = [];
		
							// Get the remainder of the nested object to set so we can recurse
							b = a.slice();
							b.splice( 0, i+1 );
							innerSrc = b.join('.');
		
							// Traverse each entry in the array setting the properties requested
							if ( $.isArray( val ) )
							{
								for ( var j=0, jLen=val.length ; j<jLen ; j++ )
								{
									o = {};
									setData( o, val[j], innerSrc );
									data[ a[i] ].push( o );
								}
							}
							else
							{
								// We've been asked to save data to an array, but it
								// isn't array data to be saved. Best that can be done
								// is to just save the value.
								data[ a[i] ] = val;
							}
		
							// The inner call to setData has already traversed through the remainder
							// of the source and has set the data, thus we can exit here
							return;
						}
						else if ( funcNotation )
						{
							// Function call
							a[i] = a[i].replace(__reFn, '');
							data = data[ a[i] ]( val );
						}
		
						// If the nested object doesn't currently exist - since we are
						// trying to set the value - create it
						if ( data[ a[i] ] === null || data[ a[i] ] === undefined )
						{
							data[ a[i] ] = {};
						}
						data = data[ a[i] ];
					}
		
					// Last item in the input - i.e, the actual set
					if ( aLast.match(__reFn ) )
					{
						// Function call
						data = data[ aLast.replace(__reFn, '') ]( val );
					}
					else
					{
						// If array notation is used, we just want to strip it and use the property name
						// and assign the value. If it isn't used, then we get the result we want anyway
						data[ aLast.replace(__reArray, '') ] = val;
					}
				};
		
				return function (data, val) { // meta is also passed in, but not used
					return setData( data, val, mSource );
				};
			}
			else
			{
				/* Array or flat object mapping */
				return function (data, val) { // meta is also passed in, but not used
					data[mSource] = val;
				};
			}
		}
		
		
		/**
		 * Return an array with the full table data
		 *  @param {object} oSettings dataTables settings object
		 *  @returns array {array} aData Master data array
		 *  @memberof DataTable#oApi
		 */
		function _fnGetDataMaster ( settings )
		{
			return _pluck( settings.aoData, '_aData' );
		}
		
		
		/**
		 * Nuke the table
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnClearTable( settings )
		{
			settings.aoData.length = 0;
			settings.aiDisplayMaster.length = 0;
			settings.aiDisplay.length = 0;
			settings.aIds = {};
		}
		
		
		 /**
		 * Take an array of integers (index array) and remove a target integer (value - not
		 * the key!)
		 *  @param {array} a Index array to target
		 *  @param {int} iTarget value to find
		 *  @memberof DataTable#oApi
		 */
		function _fnDeleteIndex( a, iTarget, splice )
		{
			var iTargetIndex = -1;
		
			for ( var i=0, iLen=a.length ; i<iLen ; i++ )
			{
				if ( a[i] == iTarget )
				{
					iTargetIndex = i;
				}
				else if ( a[i] > iTarget )
				{
					a[i]--;
				}
			}
		
			if ( iTargetIndex != -1 && splice === undefined )
			{
				a.splice( iTargetIndex, 1 );
			}
		}
		
		
		/**
		 * Mark cached data as invalid such that a re-read of the data will occur when
		 * the cached data is next requested. Also update from the data source object.
		 *
		 * @param {object} settings DataTables settings object
		 * @param {int}    rowIdx   Row index to invalidate
		 * @param {string} [src]    Source to invalidate from: undefined, 'auto', 'dom'
		 *     or 'data'
		 * @param {int}    [colIdx] Column index to invalidate. If undefined the whole
		 *     row will be invalidated
		 * @memberof DataTable#oApi
		 *
		 * @todo For the modularisation of v1.11 this will need to become a callback, so
		 *   the sort and filter methods can subscribe to it. That will required
		 *   initialisation options for sorting, which is why it is not already baked in
		 */
		function _fnInvalidate( settings, rowIdx, src, colIdx )
		{
			var row = settings.aoData[ rowIdx ];
			var i, ien;
			var cellWrite = function ( cell, col ) {
				// This is very frustrating, but in IE if you just write directly
				// to innerHTML, and elements that are overwritten are GC'ed,
				// even if there is a reference to them elsewhere
				while ( cell.childNodes.length ) {
					cell.removeChild( cell.firstChild );
				}
		
				cell.innerHTML = _fnGetCellData( settings, rowIdx, col, 'display' );
			};
		
			// Are we reading last data from DOM or the data object?
			if ( src === 'dom' || ((! src || src === 'auto') && row.src === 'dom') ) {
				// Read the data from the DOM
				row._aData = _fnGetRowElements(
						settings, row, colIdx, colIdx === undefined ? undefined : row._aData
					)
					.data;
			}
			else {
				// Reading from data object, update the DOM
				var cells = row.anCells;
		
				if ( cells ) {
					if ( colIdx !== undefined ) {
						cellWrite( cells[colIdx], colIdx );
					}
					else {
						for ( i=0, ien=cells.length ; i<ien ; i++ ) {
							cellWrite( cells[i], i );
						}
					}
				}
			}
		
			// For both row and cell invalidation, the cached data for sorting and
			// filtering is nulled out
			row._aSortData = null;
			row._aFilterData = null;
		
			// Invalidate the type for a specific column (if given) or all columns since
			// the data might have changed
			var cols = settings.aoColumns;
			if ( colIdx !== undefined ) {
				cols[ colIdx ].sType = null;
			}
			else {
				for ( i=0, ien=cols.length ; i<ien ; i++ ) {
					cols[i].sType = null;
				}
		
				// Update DataTables special `DT_*` attributes for the row
				_fnRowAttributes( settings, row );
			}
		}
		
		
		/**
		 * Build a data source object from an HTML row, reading the contents of the
		 * cells that are in the row.
		 *
		 * @param {object} settings DataTables settings object
		 * @param {node|object} TR element from which to read data or existing row
		 *   object from which to re-read the data from the cells
		 * @param {int} [colIdx] Optional column index
		 * @param {array|object} [d] Data source object. If `colIdx` is given then this
		 *   parameter should also be given and will be used to write the data into.
		 *   Only the column in question will be written
		 * @returns {object} Object with two parameters: `data` the data read, in
		 *   document order, and `cells` and array of nodes (they can be useful to the
		 *   caller, so rather than needing a second traversal to get them, just return
		 *   them from here).
		 * @memberof DataTable#oApi
		 */
		function _fnGetRowElements( settings, row, colIdx, d )
		{
			var
				tds = [],
				td = row.firstChild,
				name, col, o, i=0, contents,
				columns = settings.aoColumns,
				objectRead = settings._rowReadObject;
		
			// Allow the data object to be passed in, or construct
			d = d !== undefined ?
				d :
				objectRead ?
					{} :
					[];
		
			var attr = function ( str, td  ) {
				if ( typeof str === 'string' ) {
					var idx = str.indexOf('@');
		
					if ( idx !== -1 ) {
						var attr = str.substring( idx+1 );
						var setter = _fnSetObjectDataFn( str );
						setter( d, td.getAttribute( attr ) );
					}
				}
			};
		
			// Read data from a cell and store into the data object
			var cellProcess = function ( cell ) {
				if ( colIdx === undefined || colIdx === i ) {
					col = columns[i];
					contents = $.trim(cell.innerHTML);
		
					if ( col && col._bAttrSrc ) {
						var setter = _fnSetObjectDataFn( col.mData._ );
						setter( d, contents );
		
						attr( col.mData.sort, cell );
						attr( col.mData.type, cell );
						attr( col.mData.filter, cell );
					}
					else {
						// Depending on the `data` option for the columns the data can
						// be read to either an object or an array.
						if ( objectRead ) {
							if ( ! col._setter ) {
								// Cache the setter function
								col._setter = _fnSetObjectDataFn( col.mData );
							}
							col._setter( d, contents );
						}
						else {
							d[i] = contents;
						}
					}
				}
		
				i++;
			};
		
			if ( td ) {
				// `tr` element was passed in
				while ( td ) {
					name = td.nodeName.toUpperCase();
		
					if ( name == "TD" || name == "TH" ) {
						cellProcess( td );
						tds.push( td );
					}
		
					td = td.nextSibling;
				}
			}
			else {
				// Existing row object passed in
				tds = row.anCells;
		
				for ( var j=0, jen=tds.length ; j<jen ; j++ ) {
					cellProcess( tds[j] );
				}
			}
		
			// Read the ID from the DOM if present
			var rowNode = row.firstChild ? row : row.nTr;
		
			if ( rowNode ) {
				var id = rowNode.getAttribute( 'id' );
		
				if ( id ) {
					_fnSetObjectDataFn( settings.rowId )( d, id );
				}
			}
		
			return {
				data: d,
				cells: tds
			};
		}
		/**
		 * Create a new TR element (and it's TD children) for a row
		 *  @param {object} oSettings dataTables settings object
		 *  @param {int} iRow Row to consider
		 *  @param {node} [nTrIn] TR element to add to the table - optional. If not given,
		 *    DataTables will create a row automatically
		 *  @param {array} [anTds] Array of TD|TH elements for the row - must be given
		 *    if nTr is.
		 *  @memberof DataTable#oApi
		 */
		function _fnCreateTr ( oSettings, iRow, nTrIn, anTds )
		{
			var
				row = oSettings.aoData[iRow],
				rowData = row._aData,
				cells = [],
				nTr, nTd, oCol,
				i, iLen;
		
			if ( row.nTr === null )
			{
				nTr = nTrIn || document.createElement('tr');
		
				row.nTr = nTr;
				row.anCells = cells;
		
				/* Use a private property on the node to allow reserve mapping from the node
				 * to the aoData array for fast look up
				 */
				nTr._DT_RowIndex = iRow;
		
				/* Special parameters can be given by the data source to be used on the row */
				_fnRowAttributes( oSettings, row );
		
				/* Process each column */
				for ( i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
				{
					oCol = oSettings.aoColumns[i];
		
					nTd = nTrIn ? anTds[i] : document.createElement( oCol.sCellType );
					nTd._DT_CellIndex = {
						row: iRow,
						column: i
					};
					
					cells.push( nTd );
		
					// Need to create the HTML if new, or if a rendering function is defined
					if ( (!nTrIn || oCol.mRender || oCol.mData !== i) &&
						 (!$.isPlainObject(oCol.mData) || oCol.mData._ !== i+'.display')
					) {
						nTd.innerHTML = _fnGetCellData( oSettings, iRow, i, 'display' );
					}
		
					/* Add user defined class */
					if ( oCol.sClass )
					{
						nTd.className += ' '+oCol.sClass;
					}
		
					// Visibility - add or remove as required
					if ( oCol.bVisible && ! nTrIn )
					{
						nTr.appendChild( nTd );
					}
					else if ( ! oCol.bVisible && nTrIn )
					{
						nTd.parentNode.removeChild( nTd );
					}
		
					if ( oCol.fnCreatedCell )
					{
						oCol.fnCreatedCell.call( oSettings.oInstance,
							nTd, _fnGetCellData( oSettings, iRow, i ), rowData, iRow, i
						);
					}
				}
		
				_fnCallbackFire( oSettings, 'aoRowCreatedCallback', null, [nTr, rowData, iRow] );
			}
		
			// Remove once webkit bug 131819 and Chromium bug 365619 have been resolved
			// and deployed
			row.nTr.setAttribute( 'role', 'row' );
		}
		
		
		/**
		 * Add attributes to a row based on the special `DT_*` parameters in a data
		 * source object.
		 *  @param {object} settings DataTables settings object
		 *  @param {object} DataTables row object for the row to be modified
		 *  @memberof DataTable#oApi
		 */
		function _fnRowAttributes( settings, row )
		{
			var tr = row.nTr;
			var data = row._aData;
		
			if ( tr ) {
				var id = settings.rowIdFn( data );
		
				if ( id ) {
					tr.id = id;
				}
		
				if ( data.DT_RowClass ) {
					// Remove any classes added by DT_RowClass before
					var a = data.DT_RowClass.split(' ');
					row.__rowc = row.__rowc ?
						_unique( row.__rowc.concat( a ) ) :
						a;
		
					$(tr)
						.removeClass( row.__rowc.join(' ') )
						.addClass( data.DT_RowClass );
				}
		
				if ( data.DT_RowAttr ) {
					$(tr).attr( data.DT_RowAttr );
				}
		
				if ( data.DT_RowData ) {
					$(tr).data( data.DT_RowData );
				}
			}
		}
		
		
		/**
		 * Create the HTML header for the table
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnBuildHead( oSettings )
		{
			var i, ien, cell, row, column;
			var thead = oSettings.nTHead;
			var tfoot = oSettings.nTFoot;
			var createHeader = $('th, td', thead).length === 0;
			var classes = oSettings.oClasses;
			var columns = oSettings.aoColumns;
		
			if ( createHeader ) {
				row = $('<tr/>').appendTo( thead );
			}
		
			for ( i=0, ien=columns.length ; i<ien ; i++ ) {
				column = columns[i];
				cell = $( column.nTh ).addClass( column.sClass );
		
				if ( createHeader ) {
					cell.appendTo( row );
				}
		
				// 1.11 move into sorting
				if ( oSettings.oFeatures.bSort ) {
					cell.addClass( column.sSortingClass );
		
					if ( column.bSortable !== false ) {
						cell
							.attr( 'tabindex', oSettings.iTabIndex )
							.attr( 'aria-controls', oSettings.sTableId );
		
						_fnSortAttachListener( oSettings, column.nTh, i );
					}
				}
		
				if ( column.sTitle != cell[0].innerHTML ) {
					cell.html( column.sTitle );
				}
		
				_fnRenderer( oSettings, 'header' )(
					oSettings, cell, column, classes
				);
			}
		
			if ( createHeader ) {
				_fnDetectHeader( oSettings.aoHeader, thead );
			}
			
			/* ARIA role for the rows */
		 	$(thead).find('>tr').attr('role', 'row');
		
			/* Deal with the footer - add classes if required */
			$(thead).find('>tr>th, >tr>td').addClass( classes.sHeaderTH );
			$(tfoot).find('>tr>th, >tr>td').addClass( classes.sFooterTH );
		
			// Cache the footer cells. Note that we only take the cells from the first
			// row in the footer. If there is more than one row the user wants to
			// interact with, they need to use the table().foot() method. Note also this
			// allows cells to be used for multiple columns using colspan
			if ( tfoot !== null ) {
				var cells = oSettings.aoFooter[0];
		
				for ( i=0, ien=cells.length ; i<ien ; i++ ) {
					column = columns[i];
					column.nTf = cells[i].cell;
		
					if ( column.sClass ) {
						$(column.nTf).addClass( column.sClass );
					}
				}
			}
		}
		
		
		/**
		 * Draw the header (or footer) element based on the column visibility states. The
		 * methodology here is to use the layout array from _fnDetectHeader, modified for
		 * the instantaneous column visibility, to construct the new layout. The grid is
		 * traversed over cell at a time in a rows x columns grid fashion, although each
		 * cell insert can cover multiple elements in the grid - which is tracks using the
		 * aApplied array. Cell inserts in the grid will only occur where there isn't
		 * already a cell in that position.
		 *  @param {object} oSettings dataTables settings object
		 *  @param array {objects} aoSource Layout array from _fnDetectHeader
		 *  @param {boolean} [bIncludeHidden=false] If true then include the hidden columns in the calc,
		 *  @memberof DataTable#oApi
		 */
		function _fnDrawHead( oSettings, aoSource, bIncludeHidden )
		{
			var i, iLen, j, jLen, k, kLen, n, nLocalTr;
			var aoLocal = [];
			var aApplied = [];
			var iColumns = oSettings.aoColumns.length;
			var iRowspan, iColspan;
		
			if ( ! aoSource )
			{
				return;
			}
		
			if (  bIncludeHidden === undefined )
			{
				bIncludeHidden = false;
			}
		
			/* Make a copy of the master layout array, but without the visible columns in it */
			for ( i=0, iLen=aoSource.length ; i<iLen ; i++ )
			{
				aoLocal[i] = aoSource[i].slice();
				aoLocal[i].nTr = aoSource[i].nTr;
		
				/* Remove any columns which are currently hidden */
				for ( j=iColumns-1 ; j>=0 ; j-- )
				{
					if ( !oSettings.aoColumns[j].bVisible && !bIncludeHidden )
					{
						aoLocal[i].splice( j, 1 );
					}
				}
		
				/* Prep the applied array - it needs an element for each row */
				aApplied.push( [] );
			}
		
			for ( i=0, iLen=aoLocal.length ; i<iLen ; i++ )
			{
				nLocalTr = aoLocal[i].nTr;
		
				/* All cells are going to be replaced, so empty out the row */
				if ( nLocalTr )
				{
					while( (n = nLocalTr.firstChild) )
					{
						nLocalTr.removeChild( n );
					}
				}
		
				for ( j=0, jLen=aoLocal[i].length ; j<jLen ; j++ )
				{
					iRowspan = 1;
					iColspan = 1;
		
					/* Check to see if there is already a cell (row/colspan) covering our target
					 * insert point. If there is, then there is nothing to do.
					 */
					if ( aApplied[i][j] === undefined )
					{
						nLocalTr.appendChild( aoLocal[i][j].cell );
						aApplied[i][j] = 1;
		
						/* Expand the cell to cover as many rows as needed */
						while ( aoLocal[i+iRowspan] !== undefined &&
						        aoLocal[i][j].cell == aoLocal[i+iRowspan][j].cell )
						{
							aApplied[i+iRowspan][j] = 1;
							iRowspan++;
						}
		
						/* Expand the cell to cover as many columns as needed */
						while ( aoLocal[i][j+iColspan] !== undefined &&
						        aoLocal[i][j].cell == aoLocal[i][j+iColspan].cell )
						{
							/* Must update the applied array over the rows for the columns */
							for ( k=0 ; k<iRowspan ; k++ )
							{
								aApplied[i+k][j+iColspan] = 1;
							}
							iColspan++;
						}
		
						/* Do the actual expansion in the DOM */
						$(aoLocal[i][j].cell)
							.attr('rowspan', iRowspan)
							.attr('colspan', iColspan);
					}
				}
			}
		}
		
		
		/**
		 * Insert the required TR nodes into the table for display
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnDraw( oSettings )
		{
			/* Provide a pre-callback function which can be used to cancel the draw is false is returned */
			var aPreDraw = _fnCallbackFire( oSettings, 'aoPreDrawCallback', 'preDraw', [oSettings] );
			if ( $.inArray( false, aPreDraw ) !== -1 )
			{
				_fnProcessingDisplay( oSettings, false );
				return;
			}
		
			var i, iLen, n;
			var anRows = [];
			var iRowCount = 0;
			var asStripeClasses = oSettings.asStripeClasses;
			var iStripes = asStripeClasses.length;
			var iOpenRows = oSettings.aoOpenRows.length;
			var oLang = oSettings.oLanguage;
			var iInitDisplayStart = oSettings.iInitDisplayStart;
			var bServerSide = _fnDataSource( oSettings ) == 'ssp';
			var aiDisplay = oSettings.aiDisplay;
		
			oSettings.bDrawing = true;
		
			/* Check and see if we have an initial draw position from state saving */
			if ( iInitDisplayStart !== undefined && iInitDisplayStart !== -1 )
			{
				oSettings._iDisplayStart = bServerSide ?
					iInitDisplayStart :
					iInitDisplayStart >= oSettings.fnRecordsDisplay() ?
						0 :
						iInitDisplayStart;
		
				oSettings.iInitDisplayStart = -1;
			}
		
			var iDisplayStart = oSettings._iDisplayStart;
			var iDisplayEnd = oSettings.fnDisplayEnd();
		
			/* Server-side processing draw intercept */
			if ( oSettings.bDeferLoading )
			{
				oSettings.bDeferLoading = false;
				oSettings.iDraw++;
				_fnProcessingDisplay( oSettings, false );
			}
			else if ( !bServerSide )
			{
				oSettings.iDraw++;
			}
			else if ( !oSettings.bDestroying && !_fnAjaxUpdate( oSettings ) )
			{
				return;
			}
		
			if ( aiDisplay.length !== 0 )
			{
				var iStart = bServerSide ? 0 : iDisplayStart;
				var iEnd = bServerSide ? oSettings.aoData.length : iDisplayEnd;
		
				for ( var j=iStart ; j<iEnd ; j++ )
				{
					var iDataIndex = aiDisplay[j];
					var aoData = oSettings.aoData[ iDataIndex ];
					if ( aoData.nTr === null )
					{
						_fnCreateTr( oSettings, iDataIndex );
					}
		
					var nRow = aoData.nTr;
		
					/* Remove the old striping classes and then add the new one */
					if ( iStripes !== 0 )
					{
						var sStripe = asStripeClasses[ iRowCount % iStripes ];
						if ( aoData._sRowStripe != sStripe )
						{
							$(nRow).removeClass( aoData._sRowStripe ).addClass( sStripe );
							aoData._sRowStripe = sStripe;
						}
					}
		
					// Row callback functions - might want to manipulate the row
					// iRowCount and j are not currently documented. Are they at all
					// useful?
					_fnCallbackFire( oSettings, 'aoRowCallback', null,
						[nRow, aoData._aData, iRowCount, j] );
		
					anRows.push( nRow );
					iRowCount++;
				}
			}
			else
			{
				/* Table is empty - create a row with an empty message in it */
				var sZero = oLang.sZeroRecords;
				if ( oSettings.iDraw == 1 &&  _fnDataSource( oSettings ) == 'ajax' )
				{
					sZero = oLang.sLoadingRecords;
				}
				else if ( oLang.sEmptyTable && oSettings.fnRecordsTotal() === 0 )
				{
					sZero = oLang.sEmptyTable;
				}
		
				anRows[ 0 ] = $( '<tr/>', { 'class': iStripes ? asStripeClasses[0] : '' } )
					.append( $('<td />', {
						'valign':  'top',
						'colSpan': _fnVisbleColumns( oSettings ),
						'class':   oSettings.oClasses.sRowEmpty
					} ).html( sZero ) )[0];
			}
		
			/* Header and footer callbacks */
			_fnCallbackFire( oSettings, 'aoHeaderCallback', 'header', [ $(oSettings.nTHead).children('tr')[0],
				_fnGetDataMaster( oSettings ), iDisplayStart, iDisplayEnd, aiDisplay ] );
		
			_fnCallbackFire( oSettings, 'aoFooterCallback', 'footer', [ $(oSettings.nTFoot).children('tr')[0],
				_fnGetDataMaster( oSettings ), iDisplayStart, iDisplayEnd, aiDisplay ] );
		
			var body = $(oSettings.nTBody);
		
			body.children().detach();
			body.append( $(anRows) );
		
			/* Call all required callback functions for the end of a draw */
			_fnCallbackFire( oSettings, 'aoDrawCallback', 'draw', [oSettings] );
		
			/* Draw is complete, sorting and filtering must be as well */
			oSettings.bSorted = false;
			oSettings.bFiltered = false;
			oSettings.bDrawing = false;
		}
		
		
		/**
		 * Redraw the table - taking account of the various features which are enabled
		 *  @param {object} oSettings dataTables settings object
		 *  @param {boolean} [holdPosition] Keep the current paging position. By default
		 *    the paging is reset to the first page
		 *  @memberof DataTable#oApi
		 */
		function _fnReDraw( settings, holdPosition )
		{
			var
				features = settings.oFeatures,
				sort     = features.bSort,
				filter   = features.bFilter;
		
			if ( sort ) {
				_fnSort( settings );
			}
		
			if ( filter ) {
				_fnFilterComplete( settings, settings.oPreviousSearch );
			}
			else {
				// No filtering, so we want to just use the display master
				settings.aiDisplay = settings.aiDisplayMaster.slice();
			}
		
			if ( holdPosition !== true ) {
				settings._iDisplayStart = 0;
			}
		
			// Let any modules know about the draw hold position state (used by
			// scrolling internally)
			settings._drawHold = holdPosition;
		
			_fnDraw( settings );
		
			settings._drawHold = false;
		}
		
		
		/**
		 * Add the options to the page HTML for the table
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnAddOptionsHtml ( oSettings )
		{
			var classes = oSettings.oClasses;
			var table = $(oSettings.nTable);
			var holding = $('<div/>').insertBefore( table ); // Holding element for speed
			var features = oSettings.oFeatures;
		
			// All DataTables are wrapped in a div
			var insert = $('<div/>', {
				id:      oSettings.sTableId+'_wrapper',
				'class': classes.sWrapper + (oSettings.nTFoot ? '' : ' '+classes.sNoFooter)
			} );
		
			oSettings.nHolding = holding[0];
			oSettings.nTableWrapper = insert[0];
			oSettings.nTableReinsertBefore = oSettings.nTable.nextSibling;
		
			/* Loop over the user set positioning and place the elements as needed */
			var aDom = oSettings.sDom.split('');
			var featureNode, cOption, nNewNode, cNext, sAttr, j;
			for ( var i=0 ; i<aDom.length ; i++ )
			{
				featureNode = null;
				cOption = aDom[i];
		
				if ( cOption == '<' )
				{
					/* New container div */
					nNewNode = $('<div/>')[0];
		
					/* Check to see if we should append an id and/or a class name to the container */
					cNext = aDom[i+1];
					if ( cNext == "'" || cNext == '"' )
					{
						sAttr = "";
						j = 2;
						while ( aDom[i+j] != cNext )
						{
							sAttr += aDom[i+j];
							j++;
						}
		
						/* Replace jQuery UI constants @todo depreciated */
						if ( sAttr == "H" )
						{
							sAttr = classes.sJUIHeader;
						}
						else if ( sAttr == "F" )
						{
							sAttr = classes.sJUIFooter;
						}
		
						/* The attribute can be in the format of "#id.class", "#id" or "class" This logic
						 * breaks the string into parts and applies them as needed
						 */
						if ( sAttr.indexOf('.') != -1 )
						{
							var aSplit = sAttr.split('.');
							nNewNode.id = aSplit[0].substr(1, aSplit[0].length-1);
							nNewNode.className = aSplit[1];
						}
						else if ( sAttr.charAt(0) == "#" )
						{
							nNewNode.id = sAttr.substr(1, sAttr.length-1);
						}
						else
						{
							nNewNode.className = sAttr;
						}
		
						i += j; /* Move along the position array */
					}
		
					insert.append( nNewNode );
					insert = $(nNewNode);
				}
				else if ( cOption == '>' )
				{
					/* End container div */
					insert = insert.parent();
				}
				// @todo Move options into their own plugins?
				else if ( cOption == 'l' && features.bPaginate && features.bLengthChange )
				{
					/* Length */
					featureNode = _fnFeatureHtmlLength( oSettings );
				}
				else if ( cOption == 'f' && features.bFilter )
				{
					/* Filter */
					featureNode = _fnFeatureHtmlFilter( oSettings );
				}
				else if ( cOption == 'r' && features.bProcessing )
				{
					/* pRocessing */
					featureNode = _fnFeatureHtmlProcessing( oSettings );
				}
				else if ( cOption == 't' )
				{
					/* Table */
					featureNode = _fnFeatureHtmlTable( oSettings );
				}
				else if ( cOption ==  'i' && features.bInfo )
				{
					/* Info */
					featureNode = _fnFeatureHtmlInfo( oSettings );
				}
				else if ( cOption == 'p' && features.bPaginate )
				{
					/* Pagination */
					featureNode = _fnFeatureHtmlPaginate( oSettings );
				}
				else if ( DataTable.ext.feature.length !== 0 )
				{
					/* Plug-in features */
					var aoFeatures = DataTable.ext.feature;
					for ( var k=0, kLen=aoFeatures.length ; k<kLen ; k++ )
					{
						if ( cOption == aoFeatures[k].cFeature )
						{
							featureNode = aoFeatures[k].fnInit( oSettings );
							break;
						}
					}
				}
		
				/* Add to the 2D features array */
				if ( featureNode )
				{
					var aanFeatures = oSettings.aanFeatures;
		
					if ( ! aanFeatures[cOption] )
					{
						aanFeatures[cOption] = [];
					}
		
					aanFeatures[cOption].push( featureNode );
					insert.append( featureNode );
				}
			}
		
			/* Built our DOM structure - replace the holding div with what we want */
			holding.replaceWith( insert );
			oSettings.nHolding = null;
		}
		
		
		/**
		 * Use the DOM source to create up an array of header cells. The idea here is to
		 * create a layout grid (array) of rows x columns, which contains a reference
		 * to the cell that that point in the grid (regardless of col/rowspan), such that
		 * any column / row could be removed and the new grid constructed
		 *  @param array {object} aLayout Array to store the calculated layout in
		 *  @param {node} nThead The header/footer element for the table
		 *  @memberof DataTable#oApi
		 */
		function _fnDetectHeader ( aLayout, nThead )
		{
			var nTrs = $(nThead).children('tr');
			var nTr, nCell;
			var i, k, l, iLen, jLen, iColShifted, iColumn, iColspan, iRowspan;
			var bUnique;
			var fnShiftCol = function ( a, i, j ) {
				var k = a[i];
		                while ( k[j] ) {
					j++;
				}
				return j;
			};
		
			aLayout.splice( 0, aLayout.length );
		
			/* We know how many rows there are in the layout - so prep it */
			for ( i=0, iLen=nTrs.length ; i<iLen ; i++ )
			{
				aLayout.push( [] );
			}
		
			/* Calculate a layout array */
			for ( i=0, iLen=nTrs.length ; i<iLen ; i++ )
			{
				nTr = nTrs[i];
				iColumn = 0;
		
				/* For every cell in the row... */
				nCell = nTr.firstChild;
				while ( nCell ) {
					if ( nCell.nodeName.toUpperCase() == "TD" ||
					     nCell.nodeName.toUpperCase() == "TH" )
					{
						/* Get the col and rowspan attributes from the DOM and sanitise them */
						iColspan = nCell.getAttribute('colspan') * 1;
						iRowspan = nCell.getAttribute('rowspan') * 1;
						iColspan = (!iColspan || iColspan===0 || iColspan===1) ? 1 : iColspan;
						iRowspan = (!iRowspan || iRowspan===0 || iRowspan===1) ? 1 : iRowspan;
		
						/* There might be colspan cells already in this row, so shift our target
						 * accordingly
						 */
						iColShifted = fnShiftCol( aLayout, i, iColumn );
		
						/* Cache calculation for unique columns */
						bUnique = iColspan === 1 ? true : false;
		
						/* If there is col / rowspan, copy the information into the layout grid */
						for ( l=0 ; l<iColspan ; l++ )
						{
							for ( k=0 ; k<iRowspan ; k++ )
							{
								aLayout[i+k][iColShifted+l] = {
									"cell": nCell,
									"unique": bUnique
								};
								aLayout[i+k].nTr = nTr;
							}
						}
					}
					nCell = nCell.nextSibling;
				}
			}
		}
		
		
		/**
		 * Get an array of unique th elements, one for each column
		 *  @param {object} oSettings dataTables settings object
		 *  @param {node} nHeader automatically detect the layout from this node - optional
		 *  @param {array} aLayout thead/tfoot layout from _fnDetectHeader - optional
		 *  @returns array {node} aReturn list of unique th's
		 *  @memberof DataTable#oApi
		 */
		function _fnGetUniqueThs ( oSettings, nHeader, aLayout )
		{
			var aReturn = [];
			if ( !aLayout )
			{
				aLayout = oSettings.aoHeader;
				if ( nHeader )
				{
					aLayout = [];
					_fnDetectHeader( aLayout, nHeader );
				}
			}
		
			for ( var i=0, iLen=aLayout.length ; i<iLen ; i++ )
			{
				for ( var j=0, jLen=aLayout[i].length ; j<jLen ; j++ )
				{
					if ( aLayout[i][j].unique &&
						 (!aReturn[j] || !oSettings.bSortCellsTop) )
					{
						aReturn[j] = aLayout[i][j].cell;
					}
				}
			}
		
			return aReturn;
		}
		
		/**
		 * Create an Ajax call based on the table's settings, taking into account that
		 * parameters can have multiple forms, and backwards compatibility.
		 *
		 * @param {object} oSettings dataTables settings object
		 * @param {array} data Data to send to the server, required by
		 *     DataTables - may be augmented by developer callbacks
		 * @param {function} fn Callback function to run when data is obtained
		 */
		function _fnBuildAjax( oSettings, data, fn )
		{
			// Compatibility with 1.9-, allow fnServerData and event to manipulate
			_fnCallbackFire( oSettings, 'aoServerParams', 'serverParams', [data] );
		
			// Convert to object based for 1.10+ if using the old array scheme which can
			// come from server-side processing or serverParams
			if ( data && $.isArray(data) ) {
				var tmp = {};
				var rbracket = /(.*?)\[\]$/;
		
				$.each( data, function (key, val) {
					var match = val.name.match(rbracket);
		
					if ( match ) {
						// Support for arrays
						var name = match[0];
		
						if ( ! tmp[ name ] ) {
							tmp[ name ] = [];
						}
						tmp[ name ].push( val.value );
					}
					else {
						tmp[val.name] = val.value;
					}
				} );
				data = tmp;
			}
		
			var ajaxData;
			var ajax = oSettings.ajax;
			var instance = oSettings.oInstance;
			var callback = function ( json ) {
				_fnCallbackFire( oSettings, null, 'xhr', [oSettings, json, oSettings.jqXHR] );
				fn( json );
			};
		
			if ( $.isPlainObject( ajax ) && ajax.data )
			{
				ajaxData = ajax.data;
		
				var newData = $.isFunction( ajaxData ) ?
					ajaxData( data, oSettings ) :  // fn can manipulate data or return
					ajaxData;                      // an object object or array to merge
		
				// If the function returned something, use that alone
				data = $.isFunction( ajaxData ) && newData ?
					newData :
					$.extend( true, data, newData );
		
				// Remove the data property as we've resolved it already and don't want
				// jQuery to do it again (it is restored at the end of the function)
				delete ajax.data;
			}
		
			var baseAjax = {
				"data": data,
				"success": function (json) {
					var error = json.error || json.sError;
					if ( error ) {
						_fnLog( oSettings, 0, error );
					}
		
					oSettings.json = json;
					callback( json );
				},
				"dataType": "json",
				"cache": false,
				"type": oSettings.sServerMethod,
				"error": function (xhr, error, thrown) {
					var ret = _fnCallbackFire( oSettings, null, 'xhr', [oSettings, null, oSettings.jqXHR] );
		
					if ( $.inArray( true, ret ) === -1 ) {
						if ( error == "parsererror" ) {
							_fnLog( oSettings, 0, 'Invalid JSON response', 1 );
						}
						else if ( xhr.readyState === 4 ) {
							_fnLog( oSettings, 0, 'Ajax error', 7 );
						}
					}
		
					_fnProcessingDisplay( oSettings, false );
				}
			};
		
			// Store the data submitted for the API
			oSettings.oAjaxData = data;
		
			// Allow plug-ins and external processes to modify the data
			_fnCallbackFire( oSettings, null, 'preXhr', [oSettings, data] );
		
			if ( oSettings.fnServerData )
			{
				// DataTables 1.9- compatibility
				oSettings.fnServerData.call( instance,
					oSettings.sAjaxSource,
					$.map( data, function (val, key) { // Need to convert back to 1.9 trad format
						return { name: key, value: val };
					} ),
					callback,
					oSettings
				);
			}
			else if ( oSettings.sAjaxSource || typeof ajax === 'string' )
			{
				// DataTables 1.9- compatibility
				oSettings.jqXHR = $.ajax( $.extend( baseAjax, {
					url: ajax || oSettings.sAjaxSource
				} ) );
			}
			else if ( $.isFunction( ajax ) )
			{
				// Is a function - let the caller define what needs to be done
				oSettings.jqXHR = ajax.call( instance, data, callback, oSettings );
			}
			else
			{
				// Object to extend the base settings
				oSettings.jqXHR = $.ajax( $.extend( baseAjax, ajax ) );
		
				// Restore for next time around
				ajax.data = ajaxData;
			}
		}
		
		
		/**
		 * Update the table using an Ajax call
		 *  @param {object} settings dataTables settings object
		 *  @returns {boolean} Block the table drawing or not
		 *  @memberof DataTable#oApi
		 */
		function _fnAjaxUpdate( settings )
		{
			if ( settings.bAjaxDataGet ) {
				settings.iDraw++;
				_fnProcessingDisplay( settings, true );
		
				_fnBuildAjax(
					settings,
					_fnAjaxParameters( settings ),
					function(json) {
						_fnAjaxUpdateDraw( settings, json );
					}
				);
		
				return false;
			}
			return true;
		}
		
		
		/**
		 * Build up the parameters in an object needed for a server-side processing
		 * request. Note that this is basically done twice, is different ways - a modern
		 * method which is used by default in DataTables 1.10 which uses objects and
		 * arrays, or the 1.9- method with is name / value pairs. 1.9 method is used if
		 * the sAjaxSource option is used in the initialisation, or the legacyAjax
		 * option is set.
		 *  @param {object} oSettings dataTables settings object
		 *  @returns {bool} block the table drawing or not
		 *  @memberof DataTable#oApi
		 */
		function _fnAjaxParameters( settings )
		{
			var
				columns = settings.aoColumns,
				columnCount = columns.length,
				features = settings.oFeatures,
				preSearch = settings.oPreviousSearch,
				preColSearch = settings.aoPreSearchCols,
				i, data = [], dataProp, column, columnSearch,
				sort = _fnSortFlatten( settings ),
				displayStart = settings._iDisplayStart,
				displayLength = features.bPaginate !== false ?
					settings._iDisplayLength :
					-1;
		
			var param = function ( name, value ) {
				data.push( { 'name': name, 'value': value } );
			};
		
			// DataTables 1.9- compatible method
			param( 'sEcho',          settings.iDraw );
			param( 'iColumns',       columnCount );
			param( 'sColumns',       _pluck( columns, 'sName' ).join(',') );
			param( 'iDisplayStart',  displayStart );
			param( 'iDisplayLength', displayLength );
		
			// DataTables 1.10+ method
			var d = {
				draw:    settings.iDraw,
				columns: [],
				order:   [],
				start:   displayStart,
				length:  displayLength,
				search:  {
					value: preSearch.sSearch,
					regex: preSearch.bRegex
				}
			};
		
			for ( i=0 ; i<columnCount ; i++ ) {
				column = columns[i];
				columnSearch = preColSearch[i];
				dataProp = typeof column.mData=="function" ? 'function' : column.mData ;
		
				d.columns.push( {
					data:       dataProp,
					name:       column.sName,
					searchable: column.bSearchable,
					orderable:  column.bSortable,
					search:     {
						value: columnSearch.sSearch,
						regex: columnSearch.bRegex
					}
				} );
		
				param( "mDataProp_"+i, dataProp );
		
				if ( features.bFilter ) {
					param( 'sSearch_'+i,     columnSearch.sSearch );
					param( 'bRegex_'+i,      columnSearch.bRegex );
					param( 'bSearchable_'+i, column.bSearchable );
				}
		
				if ( features.bSort ) {
					param( 'bSortable_'+i, column.bSortable );
				}
			}
		
			if ( features.bFilter ) {
				param( 'sSearch', preSearch.sSearch );
				param( 'bRegex', preSearch.bRegex );
			}
		
			if ( features.bSort ) {
				$.each( sort, function ( i, val ) {
					d.order.push( { column: val.col, dir: val.dir } );
		
					param( 'iSortCol_'+i, val.col );
					param( 'sSortDir_'+i, val.dir );
				} );
		
				param( 'iSortingCols', sort.length );
			}
		
			// If the legacy.ajax parameter is null, then we automatically decide which
			// form to use, based on sAjaxSource
			var legacy = DataTable.ext.legacy.ajax;
			if ( legacy === null ) {
				return settings.sAjaxSource ? data : d;
			}
		
			// Otherwise, if legacy has been specified then we use that to decide on the
			// form
			return legacy ? data : d;
		}
		
		
		/**
		 * Data the data from the server (nuking the old) and redraw the table
		 *  @param {object} oSettings dataTables settings object
		 *  @param {object} json json data return from the server.
		 *  @param {string} json.sEcho Tracking flag for DataTables to match requests
		 *  @param {int} json.iTotalRecords Number of records in the data set, not accounting for filtering
		 *  @param {int} json.iTotalDisplayRecords Number of records in the data set, accounting for filtering
		 *  @param {array} json.aaData The data to display on this page
		 *  @param {string} [json.sColumns] Column ordering (sName, comma separated)
		 *  @memberof DataTable#oApi
		 */
		function _fnAjaxUpdateDraw ( settings, json )
		{
			// v1.10 uses camelCase variables, while 1.9 uses Hungarian notation.
			// Support both
			var compat = function ( old, modern ) {
				return json[old] !== undefined ? json[old] : json[modern];
			};
		
			var data = _fnAjaxDataSrc( settings, json );
			var draw            = compat( 'sEcho',                'draw' );
			var recordsTotal    = compat( 'iTotalRecords',        'recordsTotal' );
			var recordsFiltered = compat( 'iTotalDisplayRecords', 'recordsFiltered' );
		
			if ( draw ) {
				// Protect against out of sequence returns
				if ( draw*1 < settings.iDraw ) {
					return;
				}
				settings.iDraw = draw * 1;
			}
		
			_fnClearTable( settings );
			settings._iRecordsTotal   = parseInt(recordsTotal, 10);
			settings._iRecordsDisplay = parseInt(recordsFiltered, 10);
		
			for ( var i=0, ien=data.length ; i<ien ; i++ ) {
				_fnAddData( settings, data[i] );
			}
			settings.aiDisplay = settings.aiDisplayMaster.slice();
		
			settings.bAjaxDataGet = false;
			_fnDraw( settings );
		
			if ( ! settings._bInitComplete ) {
				_fnInitComplete( settings, json );
			}
		
			settings.bAjaxDataGet = true;
			_fnProcessingDisplay( settings, false );
		}
		
		
		/**
		 * Get the data from the JSON data source to use for drawing a table. Using
		 * `_fnGetObjectDataFn` allows the data to be sourced from a property of the
		 * source object, or from a processing function.
		 *  @param {object} oSettings dataTables settings object
		 *  @param  {object} json Data source object / array from the server
		 *  @return {array} Array of data to use
		 */
		function _fnAjaxDataSrc ( oSettings, json )
		{
			var dataSrc = $.isPlainObject( oSettings.ajax ) && oSettings.ajax.dataSrc !== undefined ?
				oSettings.ajax.dataSrc :
				oSettings.sAjaxDataProp; // Compatibility with 1.9-.
		
			// Compatibility with 1.9-. In order to read from aaData, check if the
			// default has been changed, if not, check for aaData
			if ( dataSrc === 'data' ) {
				return json.aaData || json[dataSrc];
			}
		
			return dataSrc !== "" ?
				_fnGetObjectDataFn( dataSrc )( json ) :
				json;
		}
		
		/**
		 * Generate the node required for filtering text
		 *  @returns {node} Filter control element
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnFeatureHtmlFilter ( settings )
		{
			var classes = settings.oClasses;
			var tableId = settings.sTableId;
			var language = settings.oLanguage;
			var previousSearch = settings.oPreviousSearch;
			var features = settings.aanFeatures;
			var input = '<input type="search" class="'+classes.sFilterInput+'"/>';
		
			var str = language.sSearch;
			str = str.match(/_INPUT_/) ?
				str.replace('_INPUT_', input) :
				str+input;
		
			var filter = $('<div/>', {
					'id': ! features.f ? tableId+'_filter' : null,
					'class': classes.sFilter
				} )
				.append( $('<label/>' ).append( str ) );
		
			var searchFn = function() {
				/* Update all other filter input elements for the new display */
				var n = features.f;
				var val = !this.value ? "" : this.value; // mental IE8 fix :-(
		
				/* Now do the filter */
				if ( val != previousSearch.sSearch ) {
					_fnFilterComplete( settings, {
						"sSearch": val,
						"bRegex": previousSearch.bRegex,
						"bSmart": previousSearch.bSmart ,
						"bCaseInsensitive": previousSearch.bCaseInsensitive
					} );
		
					// Need to redraw, without resorting
					settings._iDisplayStart = 0;
					_fnDraw( settings );
				}
			};
		
			var searchDelay = settings.searchDelay !== null ?
				settings.searchDelay :
				_fnDataSource( settings ) === 'ssp' ?
					400 :
					0;
		
			var jqFilter = $('input', filter)
				.val( previousSearch.sSearch )
				.attr( 'placeholder', language.sSearchPlaceholder )
				.on(
					'keyup.DT search.DT input.DT paste.DT cut.DT',
					searchDelay ?
						_fnThrottle( searchFn, searchDelay ) :
						searchFn
				)
				.on( 'keypress.DT', function(e) {
					/* Prevent form submission */
					if ( e.keyCode == 13 ) {
						return false;
					}
				} )
				.attr('aria-controls', tableId);
		
			// Update the input elements whenever the table is filtered
			$(settings.nTable).on( 'search.dt.DT', function ( ev, s ) {
				if ( settings === s ) {
					// IE9 throws an 'unknown error' if document.activeElement is used
					// inside an iframe or frame...
					try {
						if ( jqFilter[0] !== document.activeElement ) {
							jqFilter.val( previousSearch.sSearch );
						}
					}
					catch ( e ) {}
				}
			} );
		
			return filter[0];
		}
		
		
		/**
		 * Filter the table using both the global filter and column based filtering
		 *  @param {object} oSettings dataTables settings object
		 *  @param {object} oSearch search information
		 *  @param {int} [iForce] force a research of the master array (1) or not (undefined or 0)
		 *  @memberof DataTable#oApi
		 */
		function _fnFilterComplete ( oSettings, oInput, iForce )
		{
			var oPrevSearch = oSettings.oPreviousSearch;
			var aoPrevSearch = oSettings.aoPreSearchCols;
			var fnSaveFilter = function ( oFilter ) {
				/* Save the filtering values */
				oPrevSearch.sSearch = oFilter.sSearch;
				oPrevSearch.bRegex = oFilter.bRegex;
				oPrevSearch.bSmart = oFilter.bSmart;
				oPrevSearch.bCaseInsensitive = oFilter.bCaseInsensitive;
			};
			var fnRegex = function ( o ) {
				// Backwards compatibility with the bEscapeRegex option
				return o.bEscapeRegex !== undefined ? !o.bEscapeRegex : o.bRegex;
			};
		
			// Resolve any column types that are unknown due to addition or invalidation
			// @todo As per sort - can this be moved into an event handler?
			_fnColumnTypes( oSettings );
		
			/* In server-side processing all filtering is done by the server, so no point hanging around here */
			if ( _fnDataSource( oSettings ) != 'ssp' )
			{
				/* Global filter */
				_fnFilter( oSettings, oInput.sSearch, iForce, fnRegex(oInput), oInput.bSmart, oInput.bCaseInsensitive );
				fnSaveFilter( oInput );
		
				/* Now do the individual column filter */
				for ( var i=0 ; i<aoPrevSearch.length ; i++ )
				{
					_fnFilterColumn( oSettings, aoPrevSearch[i].sSearch, i, fnRegex(aoPrevSearch[i]),
						aoPrevSearch[i].bSmart, aoPrevSearch[i].bCaseInsensitive );
				}
		
				/* Custom filtering */
				_fnFilterCustom( oSettings );
			}
			else
			{
				fnSaveFilter( oInput );
			}
		
			/* Tell the draw function we have been filtering */
			oSettings.bFiltered = true;
			_fnCallbackFire( oSettings, null, 'search', [oSettings] );
		}
		
		
		/**
		 * Apply custom filtering functions
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnFilterCustom( settings )
		{
			var filters = DataTable.ext.search;
			var displayRows = settings.aiDisplay;
			var row, rowIdx;
		
			for ( var i=0, ien=filters.length ; i<ien ; i++ ) {
				var rows = [];
		
				// Loop over each row and see if it should be included
				for ( var j=0, jen=displayRows.length ; j<jen ; j++ ) {
					rowIdx = displayRows[ j ];
					row = settings.aoData[ rowIdx ];
		
					if ( filters[i]( settings, row._aFilterData, rowIdx, row._aData, j ) ) {
						rows.push( rowIdx );
					}
				}
		
				// So the array reference doesn't break set the results into the
				// existing array
				displayRows.length = 0;
				$.merge( displayRows, rows );
			}
		}
		
		
		/**
		 * Filter the table on a per-column basis
		 *  @param {object} oSettings dataTables settings object
		 *  @param {string} sInput string to filter on
		 *  @param {int} iColumn column to filter
		 *  @param {bool} bRegex treat search string as a regular expression or not
		 *  @param {bool} bSmart use smart filtering or not
		 *  @param {bool} bCaseInsensitive Do case insenstive matching or not
		 *  @memberof DataTable#oApi
		 */
		function _fnFilterColumn ( settings, searchStr, colIdx, regex, smart, caseInsensitive )
		{
			if ( searchStr === '' ) {
				return;
			}
		
			var data;
			var out = [];
			var display = settings.aiDisplay;
			var rpSearch = _fnFilterCreateSearch( searchStr, regex, smart, caseInsensitive );
		
			for ( var i=0 ; i<display.length ; i++ ) {
				data = settings.aoData[ display[i] ]._aFilterData[ colIdx ];
		
				if ( rpSearch.test( data ) ) {
					out.push( display[i] );
				}
			}
		
			settings.aiDisplay = out;
		}
		
		
		/**
		 * Filter the data table based on user input and draw the table
		 *  @param {object} settings dataTables settings object
		 *  @param {string} input string to filter on
		 *  @param {int} force optional - force a research of the master array (1) or not (undefined or 0)
		 *  @param {bool} regex treat as a regular expression or not
		 *  @param {bool} smart perform smart filtering or not
		 *  @param {bool} caseInsensitive Do case insenstive matching or not
		 *  @memberof DataTable#oApi
		 */
		function _fnFilter( settings, input, force, regex, smart, caseInsensitive )
		{
			var rpSearch = _fnFilterCreateSearch( input, regex, smart, caseInsensitive );
			var prevSearch = settings.oPreviousSearch.sSearch;
			var displayMaster = settings.aiDisplayMaster;
			var display, invalidated, i;
			var filtered = [];
		
			// Need to take account of custom filtering functions - always filter
			if ( DataTable.ext.search.length !== 0 ) {
				force = true;
			}
		
			// Check if any of the rows were invalidated
			invalidated = _fnFilterData( settings );
		
			// If the input is blank - we just want the full data set
			if ( input.length <= 0 ) {
				settings.aiDisplay = displayMaster.slice();
			}
			else {
				// New search - start from the master array
				if ( invalidated ||
					 force ||
					 prevSearch.length > input.length ||
					 input.indexOf(prevSearch) !== 0 ||
					 settings.bSorted // On resort, the display master needs to be
					                  // re-filtered since indexes will have changed
				) {
					settings.aiDisplay = displayMaster.slice();
				}
		
				// Search the display array
				display = settings.aiDisplay;
		
				for ( i=0 ; i<display.length ; i++ ) {
					if ( rpSearch.test( settings.aoData[ display[i] ]._sFilterRow ) ) {
						filtered.push( display[i] );
					}
				}
		
				settings.aiDisplay = filtered;
			}
		}
		
		
		/**
		 * Build a regular expression object suitable for searching a table
		 *  @param {string} sSearch string to search for
		 *  @param {bool} bRegex treat as a regular expression or not
		 *  @param {bool} bSmart perform smart filtering or not
		 *  @param {bool} bCaseInsensitive Do case insensitive matching or not
		 *  @returns {RegExp} constructed object
		 *  @memberof DataTable#oApi
		 */
		function _fnFilterCreateSearch( search, regex, smart, caseInsensitive )
		{
			search = regex ?
				search :
				_fnEscapeRegex( search );
			
			if ( smart ) {
				/* For smart filtering we want to allow the search to work regardless of
				 * word order. We also want double quoted text to be preserved, so word
				 * order is important - a la google. So this is what we want to
				 * generate:
				 * 
				 * ^(?=.*?\bone\b)(?=.*?\btwo three\b)(?=.*?\bfour\b).*$
				 */
				var a = $.map( search.match( /"[^"]+"|[^ ]+/g ) || [''], function ( word ) {
					if ( word.charAt(0) === '"' ) {
						var m = word.match( /^"(.*)"$/ );
						word = m ? m[1] : word;
					}
		
					return word.replace('"', '');
				} );
		
				search = '^(?=.*?'+a.join( ')(?=.*?' )+').*$';
			}
		
			return new RegExp( search, caseInsensitive ? 'i' : '' );
		}
		
		
		/**
		 * Escape a string such that it can be used in a regular expression
		 *  @param {string} sVal string to escape
		 *  @returns {string} escaped string
		 *  @memberof DataTable#oApi
		 */
		var _fnEscapeRegex = DataTable.util.escapeRegex;
		
		var __filter_div = $('<div>')[0];
		var __filter_div_textContent = __filter_div.textContent !== undefined;
		
		// Update the filtering data for each row if needed (by invalidation or first run)
		function _fnFilterData ( settings )
		{
			var columns = settings.aoColumns;
			var column;
			var i, j, ien, jen, filterData, cellData, row;
			var fomatters = DataTable.ext.type.search;
			var wasInvalidated = false;
		
			for ( i=0, ien=settings.aoData.length ; i<ien ; i++ ) {
				row = settings.aoData[i];
		
				if ( ! row._aFilterData ) {
					filterData = [];
		
					for ( j=0, jen=columns.length ; j<jen ; j++ ) {
						column = columns[j];
		
						if ( column.bSearchable ) {
							cellData = _fnGetCellData( settings, i, j, 'filter' );
		
							if ( fomatters[ column.sType ] ) {
								cellData = fomatters[ column.sType ]( cellData );
							}
		
							// Search in DataTables 1.10 is string based. In 1.11 this
							// should be altered to also allow strict type checking.
							if ( cellData === null ) {
								cellData = '';
							}
		
							if ( typeof cellData !== 'string' && cellData.toString ) {
								cellData = cellData.toString();
							}
						}
						else {
							cellData = '';
						}
		
						// If it looks like there is an HTML entity in the string,
						// attempt to decode it so sorting works as expected. Note that
						// we could use a single line of jQuery to do this, but the DOM
						// method used here is much faster http://jsperf.com/html-decode
						if ( cellData.indexOf && cellData.indexOf('&') !== -1 ) {
							__filter_div.innerHTML = cellData;
							cellData = __filter_div_textContent ?
								__filter_div.textContent :
								__filter_div.innerText;
						}
		
						if ( cellData.replace ) {
							cellData = cellData.replace(/[\r\n]/g, '');
						}
		
						filterData.push( cellData );
					}
		
					row._aFilterData = filterData;
					row._sFilterRow = filterData.join('  ');
					wasInvalidated = true;
				}
			}
		
			return wasInvalidated;
		}
		
		
		/**
		 * Convert from the internal Hungarian notation to camelCase for external
		 * interaction
		 *  @param {object} obj Object to convert
		 *  @returns {object} Inverted object
		 *  @memberof DataTable#oApi
		 */
		function _fnSearchToCamel ( obj )
		{
			return {
				search:          obj.sSearch,
				smart:           obj.bSmart,
				regex:           obj.bRegex,
				caseInsensitive: obj.bCaseInsensitive
			};
		}
		
		
		
		/**
		 * Convert from camelCase notation to the internal Hungarian. We could use the
		 * Hungarian convert function here, but this is cleaner
		 *  @param {object} obj Object to convert
		 *  @returns {object} Inverted object
		 *  @memberof DataTable#oApi
		 */
		function _fnSearchToHung ( obj )
		{
			return {
				sSearch:          obj.search,
				bSmart:           obj.smart,
				bRegex:           obj.regex,
				bCaseInsensitive: obj.caseInsensitive
			};
		}
		
		/**
		 * Generate the node required for the info display
		 *  @param {object} oSettings dataTables settings object
		 *  @returns {node} Information element
		 *  @memberof DataTable#oApi
		 */
		function _fnFeatureHtmlInfo ( settings )
		{
			var
				tid = settings.sTableId,
				nodes = settings.aanFeatures.i,
				n = $('<div/>', {
					'class': settings.oClasses.sInfo,
					'id': ! nodes ? tid+'_info' : null
				} );
		
			if ( ! nodes ) {
				// Update display on each draw
				settings.aoDrawCallback.push( {
					"fn": _fnUpdateInfo,
					"sName": "information"
				} );
		
				n
					.attr( 'role', 'status' )
					.attr( 'aria-live', 'polite' );
		
				// Table is described by our info div
				$(settings.nTable).attr( 'aria-describedby', tid+'_info' );
			}
		
			return n[0];
		}
		
		
		/**
		 * Update the information elements in the display
		 *  @param {object} settings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnUpdateInfo ( settings )
		{
			/* Show information about the table */
			var nodes = settings.aanFeatures.i;
			if ( nodes.length === 0 ) {
				return;
			}
		
			var
				lang  = settings.oLanguage,
				start = settings._iDisplayStart+1,
				end   = settings.fnDisplayEnd(),
				max   = settings.fnRecordsTotal(),
				total = settings.fnRecordsDisplay(),
				out   = total ?
					lang.sInfo :
					lang.sInfoEmpty;
		
			if ( total !== max ) {
				/* Record set after filtering */
				out += ' ' + lang.sInfoFiltered;
			}
		
			// Convert the macros
			out += lang.sInfoPostFix;
			out = _fnInfoMacros( settings, out );
		
			var callback = lang.fnInfoCallback;
			if ( callback !== null ) {
				out = callback.call( settings.oInstance,
					settings, start, end, max, total, out
				);
			}
		
			$(nodes).html( out );
		}
		
		
		function _fnInfoMacros ( settings, str )
		{
			// When infinite scrolling, we are always starting at 1. _iDisplayStart is used only
			// internally
			var
				formatter  = settings.fnFormatNumber,
				start      = settings._iDisplayStart+1,
				len        = settings._iDisplayLength,
				vis        = settings.fnRecordsDisplay(),
				all        = len === -1;
		
			return str.
				replace(/_START_/g, formatter.call( settings, start ) ).
				replace(/_END_/g,   formatter.call( settings, settings.fnDisplayEnd() ) ).
				replace(/_MAX_/g,   formatter.call( settings, settings.fnRecordsTotal() ) ).
				replace(/_TOTAL_/g, formatter.call( settings, vis ) ).
				replace(/_PAGE_/g,  formatter.call( settings, all ? 1 : Math.ceil( start / len ) ) ).
				replace(/_PAGES_/g, formatter.call( settings, all ? 1 : Math.ceil( vis / len ) ) );
		}
		
		
		
		/**
		 * Draw the table for the first time, adding all required features
		 *  @param {object} settings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnInitialise ( settings )
		{
			var i, iLen, iAjaxStart=settings.iInitDisplayStart;
			var columns = settings.aoColumns, column;
			var features = settings.oFeatures;
			var deferLoading = settings.bDeferLoading; // value modified by the draw
		
			/* Ensure that the table data is fully initialised */
			if ( ! settings.bInitialised ) {
				setTimeout( function(){ _fnInitialise( settings ); }, 200 );
				return;
			}
		
			/* Show the display HTML options */
			_fnAddOptionsHtml( settings );
		
			/* Build and draw the header / footer for the table */
			_fnBuildHead( settings );
			_fnDrawHead( settings, settings.aoHeader );
			_fnDrawHead( settings, settings.aoFooter );
		
			/* Okay to show that something is going on now */
			_fnProcessingDisplay( settings, true );
		
			/* Calculate sizes for columns */
			if ( features.bAutoWidth ) {
				_fnCalculateColumnWidths( settings );
			}
		
			for ( i=0, iLen=columns.length ; i<iLen ; i++ ) {
				column = columns[i];
		
				if ( column.sWidth ) {
					column.nTh.style.width = _fnStringToCss( column.sWidth );
				}
			}
		
			_fnCallbackFire( settings, null, 'preInit', [settings] );
		
			// If there is default sorting required - let's do it. The sort function
			// will do the drawing for us. Otherwise we draw the table regardless of the
			// Ajax source - this allows the table to look initialised for Ajax sourcing
			// data (show 'loading' message possibly)
			_fnReDraw( settings );
		
			// Server-side processing init complete is done by _fnAjaxUpdateDraw
			var dataSrc = _fnDataSource( settings );
			if ( dataSrc != 'ssp' || deferLoading ) {
				// if there is an ajax source load the data
				if ( dataSrc == 'ajax' ) {
					_fnBuildAjax( settings, [], function(json) {
						var aData = _fnAjaxDataSrc( settings, json );
		
						// Got the data - add it to the table
						for ( i=0 ; i<aData.length ; i++ ) {
							_fnAddData( settings, aData[i] );
						}
		
						// Reset the init display for cookie saving. We've already done
						// a filter, and therefore cleared it before. So we need to make
						// it appear 'fresh'
						settings.iInitDisplayStart = iAjaxStart;
		
						_fnReDraw( settings );
		
						_fnProcessingDisplay( settings, false );
						_fnInitComplete( settings, json );
					}, settings );
				}
				else {
					_fnProcessingDisplay( settings, false );
					_fnInitComplete( settings );
				}
			}
		}
		
		
		/**
		 * Draw the table for the first time, adding all required features
		 *  @param {object} oSettings dataTables settings object
		 *  @param {object} [json] JSON from the server that completed the table, if using Ajax source
		 *    with client-side processing (optional)
		 *  @memberof DataTable#oApi
		 */
		function _fnInitComplete ( settings, json )
		{
			settings._bInitComplete = true;
		
			// When data was added after the initialisation (data or Ajax) we need to
			// calculate the column sizing
			if ( json || settings.oInit.aaData ) {
				_fnAdjustColumnSizing( settings );
			}
		
			_fnCallbackFire( settings, null, 'plugin-init', [settings, json] );
			_fnCallbackFire( settings, 'aoInitComplete', 'init', [settings, json] );
		}
		
		
		function _fnLengthChange ( settings, val )
		{
			var len = parseInt( val, 10 );
			settings._iDisplayLength = len;
		
			_fnLengthOverflow( settings );
		
			// Fire length change event
			_fnCallbackFire( settings, null, 'length', [settings, len] );
		}
		
		
		/**
		 * Generate the node required for user display length changing
		 *  @param {object} settings dataTables settings object
		 *  @returns {node} Display length feature node
		 *  @memberof DataTable#oApi
		 */
		function _fnFeatureHtmlLength ( settings )
		{
			var
				classes  = settings.oClasses,
				tableId  = settings.sTableId,
				menu     = settings.aLengthMenu,
				d2       = $.isArray( menu[0] ),
				lengths  = d2 ? menu[0] : menu,
				language = d2 ? menu[1] : menu;
		
			var select = $('<select/>', {
				'name':          tableId+'_length',
				'aria-controls': tableId,
				'class':         classes.sLengthSelect
			} );
		
			for ( var i=0, ien=lengths.length ; i<ien ; i++ ) {
				select[0][ i ] = new Option( language[i], lengths[i] );
			}
		
			var div = $('<div><label/></div>').addClass( classes.sLength );
			if ( ! settings.aanFeatures.l ) {
				div[0].id = tableId+'_length';
			}
		
			div.children().append(
				settings.oLanguage.sLengthMenu.replace( '_MENU_', select[0].outerHTML )
			);
		
			// Can't use `select` variable as user might provide their own and the
			// reference is broken by the use of outerHTML
			$('select', div)
				.val( settings._iDisplayLength )
				.on( 'change.DT', function(e) {
					_fnLengthChange( settings, $(this).val() );
					_fnDraw( settings );
				} );
		
			// Update node value whenever anything changes the table's length
			$(settings.nTable).on( 'length.dt.DT', function (e, s, len) {
				if ( settings === s ) {
					$('select', div).val( len );
				}
			} );
		
			return div[0];
		}
		
		
		
		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Note that most of the paging logic is done in
		 * DataTable.ext.pager
		 */
		
		/**
		 * Generate the node required for default pagination
		 *  @param {object} oSettings dataTables settings object
		 *  @returns {node} Pagination feature node
		 *  @memberof DataTable#oApi
		 */
		function _fnFeatureHtmlPaginate ( settings )
		{
			var
				type   = settings.sPaginationType,
				plugin = DataTable.ext.pager[ type ],
				modern = typeof plugin === 'function',
				redraw = function( settings ) {
					_fnDraw( settings );
				},
				node = $('<div/>').addClass( settings.oClasses.sPaging + type )[0],
				features = settings.aanFeatures;
		
			if ( ! modern ) {
				plugin.fnInit( settings, node, redraw );
			}
		
			/* Add a draw callback for the pagination on first instance, to update the paging display */
			if ( ! features.p )
			{
				node.id = settings.sTableId+'_paginate';
		
				settings.aoDrawCallback.push( {
					"fn": function( settings ) {
						if ( modern ) {
							var
								start      = settings._iDisplayStart,
								len        = settings._iDisplayLength,
								visRecords = settings.fnRecordsDisplay(),
								all        = len === -1,
								page = all ? 0 : Math.ceil( start / len ),
								pages = all ? 1 : Math.ceil( visRecords / len ),
								buttons = plugin(page, pages),
								i, ien;
		
							for ( i=0, ien=features.p.length ; i<ien ; i++ ) {
								_fnRenderer( settings, 'pageButton' )(
									settings, features.p[i], i, buttons, page, pages
								);
							}
						}
						else {
							plugin.fnUpdate( settings, redraw );
						}
					},
					"sName": "pagination"
				} );
			}
		
			return node;
		}
		
		
		/**
		 * Alter the display settings to change the page
		 *  @param {object} settings DataTables settings object
		 *  @param {string|int} action Paging action to take: "first", "previous",
		 *    "next" or "last" or page number to jump to (integer)
		 *  @param [bool] redraw Automatically draw the update or not
		 *  @returns {bool} true page has changed, false - no change
		 *  @memberof DataTable#oApi
		 */
		function _fnPageChange ( settings, action, redraw )
		{
			var
				start     = settings._iDisplayStart,
				len       = settings._iDisplayLength,
				records   = settings.fnRecordsDisplay();
		
			if ( records === 0 || len === -1 )
			{
				start = 0;
			}
			else if ( typeof action === "number" )
			{
				start = action * len;
		
				if ( start > records )
				{
					start = 0;
				}
			}
			else if ( action == "first" )
			{
				start = 0;
			}
			else if ( action == "previous" )
			{
				start = len >= 0 ?
					start - len :
					0;
		
				if ( start < 0 )
				{
				  start = 0;
				}
			}
			else if ( action == "next" )
			{
				if ( start + len < records )
				{
					start += len;
				}
			}
			else if ( action == "last" )
			{
				start = Math.floor( (records-1) / len) * len;
			}
			else
			{
				_fnLog( settings, 0, "Unknown paging action: "+action, 5 );
			}
		
			var changed = settings._iDisplayStart !== start;
			settings._iDisplayStart = start;
		
			if ( changed ) {
				_fnCallbackFire( settings, null, 'page', [settings] );
		
				if ( redraw ) {
					_fnDraw( settings );
				}
			}
		
			return changed;
		}
		
		
		
		/**
		 * Generate the node required for the processing node
		 *  @param {object} settings dataTables settings object
		 *  @returns {node} Processing element
		 *  @memberof DataTable#oApi
		 */
		function _fnFeatureHtmlProcessing ( settings )
		{
			return $('<div/>', {
					'id': ! settings.aanFeatures.r ? settings.sTableId+'_processing' : null,
					'class': settings.oClasses.sProcessing
				} )
				.html( settings.oLanguage.sProcessing )
				.insertBefore( settings.nTable )[0];
		}
		
		
		/**
		 * Display or hide the processing indicator
		 *  @param {object} settings dataTables settings object
		 *  @param {bool} show Show the processing indicator (true) or not (false)
		 *  @memberof DataTable#oApi
		 */
		function _fnProcessingDisplay ( settings, show )
		{
			if ( settings.oFeatures.bProcessing ) {
				$(settings.aanFeatures.r).css( 'display', show ? 'block' : 'none' );
			}
		
			_fnCallbackFire( settings, null, 'processing', [settings, show] );
		}
		
		/**
		 * Add any control elements for the table - specifically scrolling
		 *  @param {object} settings dataTables settings object
		 *  @returns {node} Node to add to the DOM
		 *  @memberof DataTable#oApi
		 */
		function _fnFeatureHtmlTable ( settings )
		{
			var table = $(settings.nTable);
		
			// Add the ARIA grid role to the table
			table.attr( 'role', 'grid' );
		
			// Scrolling from here on in
			var scroll = settings.oScroll;
		
			if ( scroll.sX === '' && scroll.sY === '' ) {
				return settings.nTable;
			}
		
			var scrollX = scroll.sX;
			var scrollY = scroll.sY;
			var classes = settings.oClasses;
			var caption = table.children('caption');
			var captionSide = caption.length ? caption[0]._captionSide : null;
			var headerClone = $( table[0].cloneNode(false) );
			var footerClone = $( table[0].cloneNode(false) );
			var footer = table.children('tfoot');
			var _div = '<div/>';
			var size = function ( s ) {
				return !s ? null : _fnStringToCss( s );
			};
		
			if ( ! footer.length ) {
				footer = null;
			}
		
			/*
			 * The HTML structure that we want to generate in this function is:
			 *  div - scroller
			 *    div - scroll head
			 *      div - scroll head inner
			 *        table - scroll head table
			 *          thead - thead
			 *    div - scroll body
			 *      table - table (master table)
			 *        thead - thead clone for sizing
			 *        tbody - tbody
			 *    div - scroll foot
			 *      div - scroll foot inner
			 *        table - scroll foot table
			 *          tfoot - tfoot
			 */
			var scroller = $( _div, { 'class': classes.sScrollWrapper } )
				.append(
					$(_div, { 'class': classes.sScrollHead } )
						.css( {
							overflow: 'hidden',
							position: 'relative',
							border: 0,
							width: scrollX ? size(scrollX) : '100%'
						} )
						.append(
							$(_div, { 'class': classes.sScrollHeadInner } )
								.css( {
									'box-sizing': 'content-box',
									width: scroll.sXInner || '100%'
								} )
								.append(
									headerClone
										.removeAttr('id')
										.css( 'margin-left', 0 )
										.append( captionSide === 'top' ? caption : null )
										.append(
											table.children('thead')
										)
								)
						)
				)
				.append(
					$(_div, { 'class': classes.sScrollBody } )
						.css( {
							position: 'relative',
							overflow: 'auto',
							width: size( scrollX )
						} )
						.append( table )
				);
		
			if ( footer ) {
				scroller.append(
					$(_div, { 'class': classes.sScrollFoot } )
						.css( {
							overflow: 'hidden',
							border: 0,
							width: scrollX ? size(scrollX) : '100%'
						} )
						.append(
							$(_div, { 'class': classes.sScrollFootInner } )
								.append(
									footerClone
										.removeAttr('id')
										.css( 'margin-left', 0 )
										.append( captionSide === 'bottom' ? caption : null )
										.append(
											table.children('tfoot')
										)
								)
						)
				);
			}
		
			var children = scroller.children();
			var scrollHead = children[0];
			var scrollBody = children[1];
			var scrollFoot = footer ? children[2] : null;
		
			// When the body is scrolled, then we also want to scroll the headers
			if ( scrollX ) {
				$(scrollBody).on( 'scroll.DT', function (e) {
					var scrollLeft = this.scrollLeft;
		
					scrollHead.scrollLeft = scrollLeft;
		
					if ( footer ) {
						scrollFoot.scrollLeft = scrollLeft;
					}
				} );
			}
		
			$(scrollBody).css(
				scrollY && scroll.bCollapse ? 'max-height' : 'height', 
				scrollY
			);
		
			settings.nScrollHead = scrollHead;
			settings.nScrollBody = scrollBody;
			settings.nScrollFoot = scrollFoot;
		
			// On redraw - align columns
			settings.aoDrawCallback.push( {
				"fn": _fnScrollDraw,
				"sName": "scrolling"
			} );
		
			return scroller[0];
		}
		
		
		
		/**
		 * Update the header, footer and body tables for resizing - i.e. column
		 * alignment.
		 *
		 * Welcome to the most horrible function DataTables. The process that this
		 * function follows is basically:
		 *   1. Re-create the table inside the scrolling div
		 *   2. Take live measurements from the DOM
		 *   3. Apply the measurements to align the columns
		 *   4. Clean up
		 *
		 *  @param {object} settings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnScrollDraw ( settings )
		{
			// Given that this is such a monster function, a lot of variables are use
			// to try and keep the minimised size as small as possible
			var
				scroll         = settings.oScroll,
				scrollX        = scroll.sX,
				scrollXInner   = scroll.sXInner,
				scrollY        = scroll.sY,
				barWidth       = scroll.iBarWidth,
				divHeader      = $(settings.nScrollHead),
				divHeaderStyle = divHeader[0].style,
				divHeaderInner = divHeader.children('div'),
				divHeaderInnerStyle = divHeaderInner[0].style,
				divHeaderTable = divHeaderInner.children('table'),
				divBodyEl      = settings.nScrollBody,
				divBody        = $(divBodyEl),
				divBodyStyle   = divBodyEl.style,
				divFooter      = $(settings.nScrollFoot),
				divFooterInner = divFooter.children('div'),
				divFooterTable = divFooterInner.children('table'),
				header         = $(settings.nTHead),
				table          = $(settings.nTable),
				tableEl        = table[0],
				tableStyle     = tableEl.style,
				footer         = settings.nTFoot ? $(settings.nTFoot) : null,
				browser        = settings.oBrowser,
				ie67           = browser.bScrollOversize,
				dtHeaderCells  = _pluck( settings.aoColumns, 'nTh' ),
				headerTrgEls, footerTrgEls,
				headerSrcEls, footerSrcEls,
				headerCopy, footerCopy,
				headerWidths=[], footerWidths=[],
				headerContent=[], footerContent=[],
				idx, correction, sanityWidth,
				zeroOut = function(nSizer) {
					var style = nSizer.style;
					style.paddingTop = "0";
					style.paddingBottom = "0";
					style.borderTopWidth = "0";
					style.borderBottomWidth = "0";
					style.height = 0;
				};
		
			// If the scrollbar visibility has changed from the last draw, we need to
			// adjust the column sizes as the table width will have changed to account
			// for the scrollbar
			var scrollBarVis = divBodyEl.scrollHeight > divBodyEl.clientHeight;
			
			if ( settings.scrollBarVis !== scrollBarVis && settings.scrollBarVis !== undefined ) {
				settings.scrollBarVis = scrollBarVis;
				_fnAdjustColumnSizing( settings );
				return; // adjust column sizing will call this function again
			}
			else {
				settings.scrollBarVis = scrollBarVis;
			}
		
			/*
			 * 1. Re-create the table inside the scrolling div
			 */
		
			// Remove the old minimised thead and tfoot elements in the inner table
			table.children('thead, tfoot').remove();
		
			if ( footer ) {
				footerCopy = footer.clone().prependTo( table );
				footerTrgEls = footer.find('tr'); // the original tfoot is in its own table and must be sized
				footerSrcEls = footerCopy.find('tr');
			}
		
			// Clone the current header and footer elements and then place it into the inner table
			headerCopy = header.clone().prependTo( table );
			headerTrgEls = header.find('tr'); // original header is in its own table
			headerSrcEls = headerCopy.find('tr');
			headerCopy.find('th, td').removeAttr('tabindex');
		
		
			/*
			 * 2. Take live measurements from the DOM - do not alter the DOM itself!
			 */
		
			// Remove old sizing and apply the calculated column widths
			// Get the unique column headers in the newly created (cloned) header. We want to apply the
			// calculated sizes to this header
			if ( ! scrollX )
			{
				divBodyStyle.width = '100%';
				divHeader[0].style.width = '100%';
			}
		
			$.each( _fnGetUniqueThs( settings, headerCopy ), function ( i, el ) {
				idx = _fnVisibleToColumnIndex( settings, i );
				el.style.width = settings.aoColumns[idx].sWidth;
			} );
		
			if ( footer ) {
				_fnApplyToChildren( function(n) {
					n.style.width = "";
				}, footerSrcEls );
			}
		
			// Size the table as a whole
			sanityWidth = table.outerWidth();
			if ( scrollX === "" ) {
				// No x scrolling
				tableStyle.width = "100%";
		
				// IE7 will make the width of the table when 100% include the scrollbar
				// - which is shouldn't. When there is a scrollbar we need to take this
				// into account.
				if ( ie67 && (table.find('tbody').height() > divBodyEl.offsetHeight ||
					divBody.css('overflow-y') == "scroll")
				) {
					tableStyle.width = _fnStringToCss( table.outerWidth() - barWidth);
				}
		
				// Recalculate the sanity width
				sanityWidth = table.outerWidth();
			}
			else if ( scrollXInner !== "" ) {
				// legacy x scroll inner has been given - use it
				tableStyle.width = _fnStringToCss(scrollXInner);
		
				// Recalculate the sanity width
				sanityWidth = table.outerWidth();
			}
		
			// Hidden header should have zero height, so remove padding and borders. Then
			// set the width based on the real headers
		
			// Apply all styles in one pass
			_fnApplyToChildren( zeroOut, headerSrcEls );
		
			// Read all widths in next pass
			_fnApplyToChildren( function(nSizer) {
				headerContent.push( nSizer.innerHTML );
				headerWidths.push( _fnStringToCss( $(nSizer).css('width') ) );
			}, headerSrcEls );
		
			// Apply all widths in final pass
			_fnApplyToChildren( function(nToSize, i) {
				// Only apply widths to the DataTables detected header cells - this
				// prevents complex headers from having contradictory sizes applied
				if ( $.inArray( nToSize, dtHeaderCells ) !== -1 ) {
					nToSize.style.width = headerWidths[i];
				}
			}, headerTrgEls );
		
			$(headerSrcEls).height(0);
		
			/* Same again with the footer if we have one */
			if ( footer )
			{
				_fnApplyToChildren( zeroOut, footerSrcEls );
		
				_fnApplyToChildren( function(nSizer) {
					footerContent.push( nSizer.innerHTML );
					footerWidths.push( _fnStringToCss( $(nSizer).css('width') ) );
				}, footerSrcEls );
		
				_fnApplyToChildren( function(nToSize, i) {
					nToSize.style.width = footerWidths[i];
				}, footerTrgEls );
		
				$(footerSrcEls).height(0);
			}
		
		
			/*
			 * 3. Apply the measurements
			 */
		
			// "Hide" the header and footer that we used for the sizing. We need to keep
			// the content of the cell so that the width applied to the header and body
			// both match, but we want to hide it completely. We want to also fix their
			// width to what they currently are
			_fnApplyToChildren( function(nSizer, i) {
				nSizer.innerHTML = '<div class="dataTables_sizing" style="height:0;overflow:hidden;">'+headerContent[i]+'</div>';
				nSizer.style.width = headerWidths[i];
			}, headerSrcEls );
		
			if ( footer )
			{
				_fnApplyToChildren( function(nSizer, i) {
					nSizer.innerHTML = '<div class="dataTables_sizing" style="height:0;overflow:hidden;">'+footerContent[i]+'</div>';
					nSizer.style.width = footerWidths[i];
				}, footerSrcEls );
			}
		
			// Sanity check that the table is of a sensible width. If not then we are going to get
			// misalignment - try to prevent this by not allowing the table to shrink below its min width
			if ( table.outerWidth() < sanityWidth )
			{
				// The min width depends upon if we have a vertical scrollbar visible or not */
				correction = ((divBodyEl.scrollHeight > divBodyEl.offsetHeight ||
					divBody.css('overflow-y') == "scroll")) ?
						sanityWidth+barWidth :
						sanityWidth;
		
				// IE6/7 are a law unto themselves...
				if ( ie67 && (divBodyEl.scrollHeight >
					divBodyEl.offsetHeight || divBody.css('overflow-y') == "scroll")
				) {
					tableStyle.width = _fnStringToCss( correction-barWidth );
				}
		
				// And give the user a warning that we've stopped the table getting too small
				if ( scrollX === "" || scrollXInner !== "" ) {
					_fnLog( settings, 1, 'Possible column misalignment', 6 );
				}
			}
			else
			{
				correction = '100%';
			}
		
			// Apply to the container elements
			divBodyStyle.width = _fnStringToCss( correction );
			divHeaderStyle.width = _fnStringToCss( correction );
		
			if ( footer ) {
				settings.nScrollFoot.style.width = _fnStringToCss( correction );
			}
		
		
			/*
			 * 4. Clean up
			 */
			if ( ! scrollY ) {
				/* IE7< puts a vertical scrollbar in place (when it shouldn't be) due to subtracting
				 * the scrollbar height from the visible display, rather than adding it on. We need to
				 * set the height in order to sort this. Don't want to do it in any other browsers.
				 */
				if ( ie67 ) {
					divBodyStyle.height = _fnStringToCss( tableEl.offsetHeight+barWidth );
				}
			}
		
			/* Finally set the width's of the header and footer tables */
			var iOuterWidth = table.outerWidth();
			divHeaderTable[0].style.width = _fnStringToCss( iOuterWidth );
			divHeaderInnerStyle.width = _fnStringToCss( iOuterWidth );
		
			// Figure out if there are scrollbar present - if so then we need a the header and footer to
			// provide a bit more space to allow "overflow" scrolling (i.e. past the scrollbar)
			var bScrolling = table.height() > divBodyEl.clientHeight || divBody.css('overflow-y') == "scroll";
			var padding = 'padding' + (browser.bScrollbarLeft ? 'Left' : 'Right' );
			divHeaderInnerStyle[ padding ] = bScrolling ? barWidth+"px" : "0px";
		
			if ( footer ) {
				divFooterTable[0].style.width = _fnStringToCss( iOuterWidth );
				divFooterInner[0].style.width = _fnStringToCss( iOuterWidth );
				divFooterInner[0].style[padding] = bScrolling ? barWidth+"px" : "0px";
			}
		
			// Correct DOM ordering for colgroup - comes before the thead
			table.children('colgroup').insertBefore( table.children('thead') );
		
			/* Adjust the position of the header in case we loose the y-scrollbar */
			divBody.scroll();
		
			// If sorting or filtering has occurred, jump the scrolling back to the top
			// only if we aren't holding the position
			if ( (settings.bSorted || settings.bFiltered) && ! settings._drawHold ) {
				divBodyEl.scrollTop = 0;
			}
		}
		
		
		
		/**
		 * Apply a given function to the display child nodes of an element array (typically
		 * TD children of TR rows
		 *  @param {function} fn Method to apply to the objects
		 *  @param array {nodes} an1 List of elements to look through for display children
		 *  @param array {nodes} an2 Another list (identical structure to the first) - optional
		 *  @memberof DataTable#oApi
		 */
		function _fnApplyToChildren( fn, an1, an2 )
		{
			var index=0, i=0, iLen=an1.length;
			var nNode1, nNode2;
		
			while ( i < iLen ) {
				nNode1 = an1[i].firstChild;
				nNode2 = an2 ? an2[i].firstChild : null;
		
				while ( nNode1 ) {
					if ( nNode1.nodeType === 1 ) {
						if ( an2 ) {
							fn( nNode1, nNode2, index );
						}
						else {
							fn( nNode1, index );
						}
		
						index++;
					}
		
					nNode1 = nNode1.nextSibling;
					nNode2 = an2 ? nNode2.nextSibling : null;
				}
		
				i++;
			}
		}
		
		
		
		var __re_html_remove = /<.*?>/g;
		
		
		/**
		 * Calculate the width of columns for the table
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnCalculateColumnWidths ( oSettings )
		{
			var
				table = oSettings.nTable,
				columns = oSettings.aoColumns,
				scroll = oSettings.oScroll,
				scrollY = scroll.sY,
				scrollX = scroll.sX,
				scrollXInner = scroll.sXInner,
				columnCount = columns.length,
				visibleColumns = _fnGetColumns( oSettings, 'bVisible' ),
				headerCells = $('th', oSettings.nTHead),
				tableWidthAttr = table.getAttribute('width'), // from DOM element
				tableContainer = table.parentNode,
				userInputs = false,
				i, column, columnIdx, width, outerWidth,
				browser = oSettings.oBrowser,
				ie67 = browser.bScrollOversize;
		
			var styleWidth = table.style.width;
			if ( styleWidth && styleWidth.indexOf('%') !== -1 ) {
				tableWidthAttr = styleWidth;
			}
		
			/* Convert any user input sizes into pixel sizes */
			for ( i=0 ; i<visibleColumns.length ; i++ ) {
				column = columns[ visibleColumns[i] ];
		
				if ( column.sWidth !== null ) {
					column.sWidth = _fnConvertToWidth( column.sWidthOrig, tableContainer );
		
					userInputs = true;
				}
			}
		
			/* If the number of columns in the DOM equals the number that we have to
			 * process in DataTables, then we can use the offsets that are created by
			 * the web- browser. No custom sizes can be set in order for this to happen,
			 * nor scrolling used
			 */
			if ( ie67 || ! userInputs && ! scrollX && ! scrollY &&
			     columnCount == _fnVisbleColumns( oSettings ) &&
			     columnCount == headerCells.length
			) {
				for ( i=0 ; i<columnCount ; i++ ) {
					var colIdx = _fnVisibleToColumnIndex( oSettings, i );
		
					if ( colIdx !== null ) {
						columns[ colIdx ].sWidth = _fnStringToCss( headerCells.eq(i).width() );
					}
				}
			}
			else
			{
				// Otherwise construct a single row, worst case, table with the widest
				// node in the data, assign any user defined widths, then insert it into
				// the DOM and allow the browser to do all the hard work of calculating
				// table widths
				var tmpTable = $(table).clone() // don't use cloneNode - IE8 will remove events on the main table
					.css( 'visibility', 'hidden' )
					.removeAttr( 'id' );
		
				// Clean up the table body
				tmpTable.find('tbody tr').remove();
				var tr = $('<tr/>').appendTo( tmpTable.find('tbody') );
		
				// Clone the table header and footer - we can't use the header / footer
				// from the cloned table, since if scrolling is active, the table's
				// real header and footer are contained in different table tags
				tmpTable.find('thead, tfoot').remove();
				tmpTable
					.append( $(oSettings.nTHead).clone() )
					.append( $(oSettings.nTFoot).clone() );
		
				// Remove any assigned widths from the footer (from scrolling)
				tmpTable.find('tfoot th, tfoot td').css('width', '');
		
				// Apply custom sizing to the cloned header
				headerCells = _fnGetUniqueThs( oSettings, tmpTable.find('thead')[0] );
		
				for ( i=0 ; i<visibleColumns.length ; i++ ) {
					column = columns[ visibleColumns[i] ];
		
					headerCells[i].style.width = column.sWidthOrig !== null && column.sWidthOrig !== '' ?
						_fnStringToCss( column.sWidthOrig ) :
						'';
		
					// For scrollX we need to force the column width otherwise the
					// browser will collapse it. If this width is smaller than the
					// width the column requires, then it will have no effect
					if ( column.sWidthOrig && scrollX ) {
						$( headerCells[i] ).append( $('<div/>').css( {
							width: column.sWidthOrig,
							margin: 0,
							padding: 0,
							border: 0,
							height: 1
						} ) );
					}
				}
		
				// Find the widest cell for each column and put it into the table
				if ( oSettings.aoData.length ) {
					for ( i=0 ; i<visibleColumns.length ; i++ ) {
						columnIdx = visibleColumns[i];
						column = columns[ columnIdx ];
		
						$( _fnGetWidestNode( oSettings, columnIdx ) )
							.clone( false )
							.append( column.sContentPadding )
							.appendTo( tr );
					}
				}
		
				// Tidy the temporary table - remove name attributes so there aren't
				// duplicated in the dom (radio elements for example)
				$('[name]', tmpTable).removeAttr('name');
		
				// Table has been built, attach to the document so we can work with it.
				// A holding element is used, positioned at the top of the container
				// with minimal height, so it has no effect on if the container scrolls
				// or not. Otherwise it might trigger scrolling when it actually isn't
				// needed
				var holder = $('<div/>').css( scrollX || scrollY ?
						{
							position: 'absolute',
							top: 0,
							left: 0,
							height: 1,
							right: 0,
							overflow: 'hidden'
						} :
						{}
					)
					.append( tmpTable )
					.appendTo( tableContainer );
		
				// When scrolling (X or Y) we want to set the width of the table as 
				// appropriate. However, when not scrolling leave the table width as it
				// is. This results in slightly different, but I think correct behaviour
				if ( scrollX && scrollXInner ) {
					tmpTable.width( scrollXInner );
				}
				else if ( scrollX ) {
					tmpTable.css( 'width', 'auto' );
					tmpTable.removeAttr('width');
		
					// If there is no width attribute or style, then allow the table to
					// collapse
					if ( tmpTable.width() < tableContainer.clientWidth && tableWidthAttr ) {
						tmpTable.width( tableContainer.clientWidth );
					}
				}
				else if ( scrollY ) {
					tmpTable.width( tableContainer.clientWidth );
				}
				else if ( tableWidthAttr ) {
					tmpTable.width( tableWidthAttr );
				}
		
				// Get the width of each column in the constructed table - we need to
				// know the inner width (so it can be assigned to the other table's
				// cells) and the outer width so we can calculate the full width of the
				// table. This is safe since DataTables requires a unique cell for each
				// column, but if ever a header can span multiple columns, this will
				// need to be modified.
				var total = 0;
				for ( i=0 ; i<visibleColumns.length ; i++ ) {
					var cell = $(headerCells[i]);
					var border = cell.outerWidth() - cell.width();
		
					// Use getBounding... where possible (not IE8-) because it can give
					// sub-pixel accuracy, which we then want to round up!
					var bounding = browser.bBounding ?
						Math.ceil( headerCells[i].getBoundingClientRect().width ) :
						cell.outerWidth();
		
					// Total is tracked to remove any sub-pixel errors as the outerWidth
					// of the table might not equal the total given here (IE!).
					total += bounding;
		
					// Width for each column to use
					columns[ visibleColumns[i] ].sWidth = _fnStringToCss( bounding - border );
				}
		
				table.style.width = _fnStringToCss( total );
		
				// Finished with the table - ditch it
				holder.remove();
			}
		
			// If there is a width attr, we want to attach an event listener which
			// allows the table sizing to automatically adjust when the window is
			// resized. Use the width attr rather than CSS, since we can't know if the
			// CSS is a relative value or absolute - DOM read is always px.
			if ( tableWidthAttr ) {
				table.style.width = _fnStringToCss( tableWidthAttr );
			}
		
			if ( (tableWidthAttr || scrollX) && ! oSettings._reszEvt ) {
				var bindResize = function () {
					$(window).on('resize.DT-'+oSettings.sInstance, _fnThrottle( function () {
						_fnAdjustColumnSizing( oSettings );
					} ) );
				};
		
				// IE6/7 will crash if we bind a resize event handler on page load.
				// To be removed in 1.11 which drops IE6/7 support
				if ( ie67 ) {
					setTimeout( bindResize, 1000 );
				}
				else {
					bindResize();
				}
		
				oSettings._reszEvt = true;
			}
		}
		
		
		/**
		 * Throttle the calls to a function. Arguments and context are maintained for
		 * the throttled function
		 *  @param {function} fn Function to be called
		 *  @param {int} [freq=200] call frequency in mS
		 *  @returns {function} wrapped function
		 *  @memberof DataTable#oApi
		 */
		var _fnThrottle = DataTable.util.throttle;
		
		
		/**
		 * Convert a CSS unit width to pixels (e.g. 2em)
		 *  @param {string} width width to be converted
		 *  @param {node} parent parent to get the with for (required for relative widths) - optional
		 *  @returns {int} width in pixels
		 *  @memberof DataTable#oApi
		 */
		function _fnConvertToWidth ( width, parent )
		{
			if ( ! width ) {
				return 0;
			}
		
			var n = $('<div/>')
				.css( 'width', _fnStringToCss( width ) )
				.appendTo( parent || document.body );
		
			var val = n[0].offsetWidth;
			n.remove();
		
			return val;
		}
		
		
		/**
		 * Get the widest node
		 *  @param {object} settings dataTables settings object
		 *  @param {int} colIdx column of interest
		 *  @returns {node} widest table node
		 *  @memberof DataTable#oApi
		 */
		function _fnGetWidestNode( settings, colIdx )
		{
			var idx = _fnGetMaxLenString( settings, colIdx );
			if ( idx < 0 ) {
				return null;
			}
		
			var data = settings.aoData[ idx ];
			return ! data.nTr ? // Might not have been created when deferred rendering
				$('<td/>').html( _fnGetCellData( settings, idx, colIdx, 'display' ) )[0] :
				data.anCells[ colIdx ];
		}
		
		
		/**
		 * Get the maximum strlen for each data column
		 *  @param {object} settings dataTables settings object
		 *  @param {int} colIdx column of interest
		 *  @returns {string} max string length for each column
		 *  @memberof DataTable#oApi
		 */
		function _fnGetMaxLenString( settings, colIdx )
		{
			var s, max=-1, maxIdx = -1;
		
			for ( var i=0, ien=settings.aoData.length ; i<ien ; i++ ) {
				s = _fnGetCellData( settings, i, colIdx, 'display' )+'';
				s = s.replace( __re_html_remove, '' );
				s = s.replace( /&nbsp;/g, ' ' );
		
				if ( s.length > max ) {
					max = s.length;
					maxIdx = i;
				}
			}
		
			return maxIdx;
		}
		
		
		/**
		 * Append a CSS unit (only if required) to a string
		 *  @param {string} value to css-ify
		 *  @returns {string} value with css unit
		 *  @memberof DataTable#oApi
		 */
		function _fnStringToCss( s )
		{
			if ( s === null ) {
				return '0px';
			}
		
			if ( typeof s == 'number' ) {
				return s < 0 ?
					'0px' :
					s+'px';
			}
		
			// Check it has a unit character already
			return s.match(/\d$/) ?
				s+'px' :
				s;
		}
		
		
		
		function _fnSortFlatten ( settings )
		{
			var
				i, iLen, k, kLen,
				aSort = [],
				aiOrig = [],
				aoColumns = settings.aoColumns,
				aDataSort, iCol, sType, srcCol,
				fixed = settings.aaSortingFixed,
				fixedObj = $.isPlainObject( fixed ),
				nestedSort = [],
				add = function ( a ) {
					if ( a.length && ! $.isArray( a[0] ) ) {
						// 1D array
						nestedSort.push( a );
					}
					else {
						// 2D array
						$.merge( nestedSort, a );
					}
				};
		
			// Build the sort array, with pre-fix and post-fix options if they have been
			// specified
			if ( $.isArray( fixed ) ) {
				add( fixed );
			}
		
			if ( fixedObj && fixed.pre ) {
				add( fixed.pre );
			}
		
			add( settings.aaSorting );
		
			if (fixedObj && fixed.post ) {
				add( fixed.post );
			}
		
			for ( i=0 ; i<nestedSort.length ; i++ )
			{
				srcCol = nestedSort[i][0];
				aDataSort = aoColumns[ srcCol ].aDataSort;
		
				for ( k=0, kLen=aDataSort.length ; k<kLen ; k++ )
				{
					iCol = aDataSort[k];
					sType = aoColumns[ iCol ].sType || 'string';
		
					if ( nestedSort[i]._idx === undefined ) {
						nestedSort[i]._idx = $.inArray( nestedSort[i][1], aoColumns[iCol].asSorting );
					}
		
					aSort.push( {
						src:       srcCol,
						col:       iCol,
						dir:       nestedSort[i][1],
						index:     nestedSort[i]._idx,
						type:      sType,
						formatter: DataTable.ext.type.order[ sType+"-pre" ]
					} );
				}
			}
		
			return aSort;
		}
		
		/**
		 * Change the order of the table
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 *  @todo This really needs split up!
		 */
		function _fnSort ( oSettings )
		{
			var
				i, ien, iLen, j, jLen, k, kLen,
				sDataType, nTh,
				aiOrig = [],
				oExtSort = DataTable.ext.type.order,
				aoData = oSettings.aoData,
				aoColumns = oSettings.aoColumns,
				aDataSort, data, iCol, sType, oSort,
				formatters = 0,
				sortCol,
				displayMaster = oSettings.aiDisplayMaster,
				aSort;
		
			// Resolve any column types that are unknown due to addition or invalidation
			// @todo Can this be moved into a 'data-ready' handler which is called when
			//   data is going to be used in the table?
			_fnColumnTypes( oSettings );
		
			aSort = _fnSortFlatten( oSettings );
		
			for ( i=0, ien=aSort.length ; i<ien ; i++ ) {
				sortCol = aSort[i];
		
				// Track if we can use the fast sort algorithm
				if ( sortCol.formatter ) {
					formatters++;
				}
		
				// Load the data needed for the sort, for each cell
				_fnSortData( oSettings, sortCol.col );
			}
		
			/* No sorting required if server-side or no sorting array */
			if ( _fnDataSource( oSettings ) != 'ssp' && aSort.length !== 0 )
			{
				// Create a value - key array of the current row positions such that we can use their
				// current position during the sort, if values match, in order to perform stable sorting
				for ( i=0, iLen=displayMaster.length ; i<iLen ; i++ ) {
					aiOrig[ displayMaster[i] ] = i;
				}
		
				/* Do the sort - here we want multi-column sorting based on a given data source (column)
				 * and sorting function (from oSort) in a certain direction. It's reasonably complex to
				 * follow on it's own, but this is what we want (example two column sorting):
				 *  fnLocalSorting = function(a,b){
				 *    var iTest;
				 *    iTest = oSort['string-asc']('data11', 'data12');
				 *      if (iTest !== 0)
				 *        return iTest;
				 *    iTest = oSort['numeric-desc']('data21', 'data22');
				 *    if (iTest !== 0)
				 *      return iTest;
				 *    return oSort['numeric-asc']( aiOrig[a], aiOrig[b] );
				 *  }
				 * Basically we have a test for each sorting column, if the data in that column is equal,
				 * test the next column. If all columns match, then we use a numeric sort on the row
				 * positions in the original data array to provide a stable sort.
				 *
				 * Note - I know it seems excessive to have two sorting methods, but the first is around
				 * 15% faster, so the second is only maintained for backwards compatibility with sorting
				 * methods which do not have a pre-sort formatting function.
				 */
				if ( formatters === aSort.length ) {
					// All sort types have formatting functions
					displayMaster.sort( function ( a, b ) {
						var
							x, y, k, test, sort,
							len=aSort.length,
							dataA = aoData[a]._aSortData,
							dataB = aoData[b]._aSortData;
		
						for ( k=0 ; k<len ; k++ ) {
							sort = aSort[k];
		
							x = dataA[ sort.col ];
							y = dataB[ sort.col ];
		
							test = x<y ? -1 : x>y ? 1 : 0;
							if ( test !== 0 ) {
								return sort.dir === 'asc' ? test : -test;
							}
						}
		
						x = aiOrig[a];
						y = aiOrig[b];
						return x<y ? -1 : x>y ? 1 : 0;
					} );
				}
				else {
					// Depreciated - remove in 1.11 (providing a plug-in option)
					// Not all sort types have formatting methods, so we have to call their sorting
					// methods.
					displayMaster.sort( function ( a, b ) {
						var
							x, y, k, l, test, sort, fn,
							len=aSort.length,
							dataA = aoData[a]._aSortData,
							dataB = aoData[b]._aSortData;
		
						for ( k=0 ; k<len ; k++ ) {
							sort = aSort[k];
		
							x = dataA[ sort.col ];
							y = dataB[ sort.col ];
		
							fn = oExtSort[ sort.type+"-"+sort.dir ] || oExtSort[ "string-"+sort.dir ];
							test = fn( x, y );
							if ( test !== 0 ) {
								return test;
							}
						}
		
						x = aiOrig[a];
						y = aiOrig[b];
						return x<y ? -1 : x>y ? 1 : 0;
					} );
				}
			}
		
			/* Tell the draw function that we have sorted the data */
			oSettings.bSorted = true;
		}
		
		
		function _fnSortAria ( settings )
		{
			var label;
			var nextSort;
			var columns = settings.aoColumns;
			var aSort = _fnSortFlatten( settings );
			var oAria = settings.oLanguage.oAria;
		
			// ARIA attributes - need to loop all columns, to update all (removing old
			// attributes as needed)
			for ( var i=0, iLen=columns.length ; i<iLen ; i++ )
			{
				var col = columns[i];
				var asSorting = col.asSorting;
				var sTitle = col.sTitle.replace( /<.*?>/g, "" );
				var th = col.nTh;
		
				// IE7 is throwing an error when setting these properties with jQuery's
				// attr() and removeAttr() methods...
				th.removeAttribute('aria-sort');
		
				/* In ARIA only the first sorting column can be marked as sorting - no multi-sort option */
				if ( col.bSortable ) {
					if ( aSort.length > 0 && aSort[0].col == i ) {
						th.setAttribute('aria-sort', aSort[0].dir=="asc" ? "ascending" : "descending" );
						nextSort = asSorting[ aSort[0].index+1 ] || asSorting[0];
					}
					else {
						nextSort = asSorting[0];
					}
		
					label = sTitle + ( nextSort === "asc" ?
						oAria.sSortAscending :
						oAria.sSortDescending
					);
				}
				else {
					label = sTitle;
				}
		
				th.setAttribute('aria-label', label);
			}
		}
		
		
		/**
		 * Function to run on user sort request
		 *  @param {object} settings dataTables settings object
		 *  @param {node} attachTo node to attach the handler to
		 *  @param {int} colIdx column sorting index
		 *  @param {boolean} [append=false] Append the requested sort to the existing
		 *    sort if true (i.e. multi-column sort)
		 *  @param {function} [callback] callback function
		 *  @memberof DataTable#oApi
		 */
		function _fnSortListener ( settings, colIdx, append, callback )
		{
			var col = settings.aoColumns[ colIdx ];
			var sorting = settings.aaSorting;
			var asSorting = col.asSorting;
			var nextSortIdx;
			var next = function ( a, overflow ) {
				var idx = a._idx;
				if ( idx === undefined ) {
					idx = $.inArray( a[1], asSorting );
				}
		
				return idx+1 < asSorting.length ?
					idx+1 :
					overflow ?
						null :
						0;
			};
		
			// Convert to 2D array if needed
			if ( typeof sorting[0] === 'number' ) {
				sorting = settings.aaSorting = [ sorting ];
			}
		
			// If appending the sort then we are multi-column sorting
			if ( append && settings.oFeatures.bSortMulti ) {
				// Are we already doing some kind of sort on this column?
				var sortIdx = $.inArray( colIdx, _pluck(sorting, '0') );
		
				if ( sortIdx !== -1 ) {
					// Yes, modify the sort
					nextSortIdx = next( sorting[sortIdx], true );
		
					if ( nextSortIdx === null && sorting.length === 1 ) {
						nextSortIdx = 0; // can't remove sorting completely
					}
		
					if ( nextSortIdx === null ) {
						sorting.splice( sortIdx, 1 );
					}
					else {
						sorting[sortIdx][1] = asSorting[ nextSortIdx ];
						sorting[sortIdx]._idx = nextSortIdx;
					}
				}
				else {
					// No sort on this column yet
					sorting.push( [ colIdx, asSorting[0], 0 ] );
					sorting[sorting.length-1]._idx = 0;
				}
			}
			else if ( sorting.length && sorting[0][0] == colIdx ) {
				// Single column - already sorting on this column, modify the sort
				nextSortIdx = next( sorting[0] );
		
				sorting.length = 1;
				sorting[0][1] = asSorting[ nextSortIdx ];
				sorting[0]._idx = nextSortIdx;
			}
			else {
				// Single column - sort only on this column
				sorting.length = 0;
				sorting.push( [ colIdx, asSorting[0] ] );
				sorting[0]._idx = 0;
			}
		
			// Run the sort by calling a full redraw
			_fnReDraw( settings );
		
			// callback used for async user interaction
			if ( typeof callback == 'function' ) {
				callback( settings );
			}
		}
		
		
		/**
		 * Attach a sort handler (click) to a node
		 *  @param {object} settings dataTables settings object
		 *  @param {node} attachTo node to attach the handler to
		 *  @param {int} colIdx column sorting index
		 *  @param {function} [callback] callback function
		 *  @memberof DataTable#oApi
		 */
		function _fnSortAttachListener ( settings, attachTo, colIdx, callback )
		{
			var col = settings.aoColumns[ colIdx ];
		
			_fnBindAction( attachTo, {}, function (e) {
				/* If the column is not sortable - don't to anything */
				if ( col.bSortable === false ) {
					return;
				}
		
				// If processing is enabled use a timeout to allow the processing
				// display to be shown - otherwise to it synchronously
				if ( settings.oFeatures.bProcessing ) {
					_fnProcessingDisplay( settings, true );
		
					setTimeout( function() {
						_fnSortListener( settings, colIdx, e.shiftKey, callback );
		
						// In server-side processing, the draw callback will remove the
						// processing display
						if ( _fnDataSource( settings ) !== 'ssp' ) {
							_fnProcessingDisplay( settings, false );
						}
					}, 0 );
				}
				else {
					_fnSortListener( settings, colIdx, e.shiftKey, callback );
				}
			} );
		}
		
		
		/**
		 * Set the sorting classes on table's body, Note: it is safe to call this function
		 * when bSort and bSortClasses are false
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnSortingClasses( settings )
		{
			var oldSort = settings.aLastSort;
			var sortClass = settings.oClasses.sSortColumn;
			var sort = _fnSortFlatten( settings );
			var features = settings.oFeatures;
			var i, ien, colIdx;
		
			if ( features.bSort && features.bSortClasses ) {
				// Remove old sorting classes
				for ( i=0, ien=oldSort.length ; i<ien ; i++ ) {
					colIdx = oldSort[i].src;
		
					// Remove column sorting
					$( _pluck( settings.aoData, 'anCells', colIdx ) )
						.removeClass( sortClass + (i<2 ? i+1 : 3) );
				}
		
				// Add new column sorting
				for ( i=0, ien=sort.length ; i<ien ; i++ ) {
					colIdx = sort[i].src;
		
					$( _pluck( settings.aoData, 'anCells', colIdx ) )
						.addClass( sortClass + (i<2 ? i+1 : 3) );
				}
			}
		
			settings.aLastSort = sort;
		}
		
		
		// Get the data to sort a column, be it from cache, fresh (populating the
		// cache), or from a sort formatter
		function _fnSortData( settings, idx )
		{
			// Custom sorting function - provided by the sort data type
			var column = settings.aoColumns[ idx ];
			var customSort = DataTable.ext.order[ column.sSortDataType ];
			var customData;
		
			if ( customSort ) {
				customData = customSort.call( settings.oInstance, settings, idx,
					_fnColumnIndexToVisible( settings, idx )
				);
			}
		
			// Use / populate cache
			var row, cellData;
			var formatter = DataTable.ext.type.order[ column.sType+"-pre" ];
		
			for ( var i=0, ien=settings.aoData.length ; i<ien ; i++ ) {
				row = settings.aoData[i];
		
				if ( ! row._aSortData ) {
					row._aSortData = [];
				}
		
				if ( ! row._aSortData[idx] || customSort ) {
					cellData = customSort ?
						customData[i] : // If there was a custom sort function, use data from there
						_fnGetCellData( settings, i, idx, 'sort' );
		
					row._aSortData[ idx ] = formatter ?
						formatter( cellData ) :
						cellData;
				}
			}
		}
		
		
		
		/**
		 * Save the state of a table
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnSaveState ( settings )
		{
			if ( !settings.oFeatures.bStateSave || settings.bDestroying )
			{
				return;
			}
		
			/* Store the interesting variables */
			var state = {
				time:    +new Date(),
				start:   settings._iDisplayStart,
				length:  settings._iDisplayLength,
				order:   $.extend( true, [], settings.aaSorting ),
				search:  _fnSearchToCamel( settings.oPreviousSearch ),
				columns: $.map( settings.aoColumns, function ( col, i ) {
					return {
						visible: col.bVisible,
						search: _fnSearchToCamel( settings.aoPreSearchCols[i] )
					};
				} )
			};
		
			_fnCallbackFire( settings, "aoStateSaveParams", 'stateSaveParams', [settings, state] );
		
			settings.oSavedState = state;
			settings.fnStateSaveCallback.call( settings.oInstance, settings, state );
		}
		
		
		/**
		 * Attempt to load a saved table state
		 *  @param {object} oSettings dataTables settings object
		 *  @param {object} oInit DataTables init object so we can override settings
		 *  @param {function} callback Callback to execute when the state has been loaded
		 *  @memberof DataTable#oApi
		 */
		function _fnLoadState ( settings, oInit, callback )
		{
			var i, ien;
			var columns = settings.aoColumns;
			var loaded = function ( s ) {
				if ( ! s || ! s.time ) {
					callback();
					return;
				}
		
				// Allow custom and plug-in manipulation functions to alter the saved data set and
				// cancelling of loading by returning false
				var abStateLoad = _fnCallbackFire( settings, 'aoStateLoadParams', 'stateLoadParams', [settings, s] );
				if ( $.inArray( false, abStateLoad ) !== -1 ) {
					callback();
					return;
				}
		
				// Reject old data
				var duration = settings.iStateDuration;
				if ( duration > 0 && s.time < +new Date() - (duration*1000) ) {
					callback();
					return;
				}
		
				// Number of columns have changed - all bets are off, no restore of settings
				if ( s.columns && columns.length !== s.columns.length ) {
					callback();
					return;
				}
		
				// Store the saved state so it might be accessed at any time
				settings.oLoadedState = $.extend( true, {}, s );
		
				// Restore key features - todo - for 1.11 this needs to be done by
				// subscribed events
				if ( s.start !== undefined ) {
					settings._iDisplayStart    = s.start;
					settings.iInitDisplayStart = s.start;
				}
				if ( s.length !== undefined ) {
					settings._iDisplayLength   = s.length;
				}
		
				// Order
				if ( s.order !== undefined ) {
					settings.aaSorting = [];
					$.each( s.order, function ( i, col ) {
						settings.aaSorting.push( col[0] >= columns.length ?
							[ 0, col[1] ] :
							col
						);
					} );
				}
		
				// Search
				if ( s.search !== undefined ) {
					$.extend( settings.oPreviousSearch, _fnSearchToHung( s.search ) );
				}
		
				// Columns
				//
				if ( s.columns ) {
					for ( i=0, ien=s.columns.length ; i<ien ; i++ ) {
						var col = s.columns[i];
		
						// Visibility
						if ( col.visible !== undefined ) {
							columns[i].bVisible = col.visible;
						}
		
						// Search
						if ( col.search !== undefined ) {
							$.extend( settings.aoPreSearchCols[i], _fnSearchToHung( col.search ) );
						}
					}
				}
		
				_fnCallbackFire( settings, 'aoStateLoaded', 'stateLoaded', [settings, s] );
				callback();
			}
		
			if ( ! settings.oFeatures.bStateSave ) {
				callback();
				return;
			}
		
			var state = settings.fnStateLoadCallback.call( settings.oInstance, settings, loaded );
		
			if ( state !== undefined ) {
				loaded( state );
			}
			// otherwise, wait for the loaded callback to be executed
		}
		
		
		/**
		 * Return the settings object for a particular table
		 *  @param {node} table table we are using as a dataTable
		 *  @returns {object} Settings object - or null if not found
		 *  @memberof DataTable#oApi
		 */
		function _fnSettingsFromNode ( table )
		{
			var settings = DataTable.settings;
			var idx = $.inArray( table, _pluck( settings, 'nTable' ) );
		
			return idx !== -1 ?
				settings[ idx ] :
				null;
		}
		
		
		/**
		 * Log an error message
		 *  @param {object} settings dataTables settings object
		 *  @param {int} level log error messages, or display them to the user
		 *  @param {string} msg error message
		 *  @param {int} tn Technical note id to get more information about the error.
		 *  @memberof DataTable#oApi
		 */
		function _fnLog( settings, level, msg, tn )
		{
			msg = 'DataTables warning: '+
				(settings ? 'table id='+settings.sTableId+' - ' : '')+msg;
		
			if ( tn ) {
				msg += '. For more information about this error, please see '+
				'http://datatables.net/tn/'+tn;
			}
		
			if ( ! level  ) {
				// Backwards compatibility pre 1.10
				var ext = DataTable.ext;
				var type = ext.sErrMode || ext.errMode;
		
				if ( settings ) {
					_fnCallbackFire( settings, null, 'error', [ settings, tn, msg ] );
				}
		
				if ( type == 'alert' ) {
					alert( msg );
				}
				else if ( type == 'throw' ) {
					throw new Error(msg);
				}
				else if ( typeof type == 'function' ) {
					type( settings, tn, msg );
				}
			}
			else if ( window.console && console.log ) {
				console.log( msg );
			}
		}
		
		
		/**
		 * See if a property is defined on one object, if so assign it to the other object
		 *  @param {object} ret target object
		 *  @param {object} src source object
		 *  @param {string} name property
		 *  @param {string} [mappedName] name to map too - optional, name used if not given
		 *  @memberof DataTable#oApi
		 */
		function _fnMap( ret, src, name, mappedName )
		{
			if ( $.isArray( name ) ) {
				$.each( name, function (i, val) {
					if ( $.isArray( val ) ) {
						_fnMap( ret, src, val[0], val[1] );
					}
					else {
						_fnMap( ret, src, val );
					}
				} );
		
				return;
			}
		
			if ( mappedName === undefined ) {
				mappedName = name;
			}
		
			if ( src[name] !== undefined ) {
				ret[mappedName] = src[name];
			}
		}
		
		
		/**
		 * Extend objects - very similar to jQuery.extend, but deep copy objects, and
		 * shallow copy arrays. The reason we need to do this, is that we don't want to
		 * deep copy array init values (such as aaSorting) since the dev wouldn't be
		 * able to override them, but we do want to deep copy arrays.
		 *  @param {object} out Object to extend
		 *  @param {object} extender Object from which the properties will be applied to
		 *      out
		 *  @param {boolean} breakRefs If true, then arrays will be sliced to take an
		 *      independent copy with the exception of the `data` or `aaData` parameters
		 *      if they are present. This is so you can pass in a collection to
		 *      DataTables and have that used as your data source without breaking the
		 *      references
		 *  @returns {object} out Reference, just for convenience - out === the return.
		 *  @memberof DataTable#oApi
		 *  @todo This doesn't take account of arrays inside the deep copied objects.
		 */
		function _fnExtend( out, extender, breakRefs )
		{
			var val;
		
			for ( var prop in extender ) {
				if ( extender.hasOwnProperty(prop) ) {
					val = extender[prop];
		
					if ( $.isPlainObject( val ) ) {
						if ( ! $.isPlainObject( out[prop] ) ) {
							out[prop] = {};
						}
						$.extend( true, out[prop], val );
					}
					else if ( breakRefs && prop !== 'data' && prop !== 'aaData' && $.isArray(val) ) {
						out[prop] = val.slice();
					}
					else {
						out[prop] = val;
					}
				}
			}
		
			return out;
		}
		
		
		/**
		 * Bind an event handers to allow a click or return key to activate the callback.
		 * This is good for accessibility since a return on the keyboard will have the
		 * same effect as a click, if the element has focus.
		 *  @param {element} n Element to bind the action to
		 *  @param {object} oData Data object to pass to the triggered function
		 *  @param {function} fn Callback function for when the event is triggered
		 *  @memberof DataTable#oApi
		 */
		function _fnBindAction( n, oData, fn )
		{
			$(n)
				.on( 'click.DT', oData, function (e) {
						n.blur(); // Remove focus outline for mouse users
						fn(e);
					} )
				.on( 'keypress.DT', oData, function (e){
						if ( e.which === 13 ) {
							e.preventDefault();
							fn(e);
						}
					} )
				.on( 'selectstart.DT', function () {
						/* Take the brutal approach to cancelling text selection */
						return false;
					} );
		}
		
		
		/**
		 * Register a callback function. Easily allows a callback function to be added to
		 * an array store of callback functions that can then all be called together.
		 *  @param {object} oSettings dataTables settings object
		 *  @param {string} sStore Name of the array storage for the callbacks in oSettings
		 *  @param {function} fn Function to be called back
		 *  @param {string} sName Identifying name for the callback (i.e. a label)
		 *  @memberof DataTable#oApi
		 */
		function _fnCallbackReg( oSettings, sStore, fn, sName )
		{
			if ( fn )
			{
				oSettings[sStore].push( {
					"fn": fn,
					"sName": sName
				} );
			}
		}
		
		
		/**
		 * Fire callback functions and trigger events. Note that the loop over the
		 * callback array store is done backwards! Further note that you do not want to
		 * fire off triggers in time sensitive applications (for example cell creation)
		 * as its slow.
		 *  @param {object} settings dataTables settings object
		 *  @param {string} callbackArr Name of the array storage for the callbacks in
		 *      oSettings
		 *  @param {string} eventName Name of the jQuery custom event to trigger. If
		 *      null no trigger is fired
		 *  @param {array} args Array of arguments to pass to the callback function /
		 *      trigger
		 *  @memberof DataTable#oApi
		 */
		function _fnCallbackFire( settings, callbackArr, eventName, args )
		{
			var ret = [];
		
			if ( callbackArr ) {
				ret = $.map( settings[callbackArr].slice().reverse(), function (val, i) {
					return val.fn.apply( settings.oInstance, args );
				} );
			}
		
			if ( eventName !== null ) {
				var e = $.Event( eventName+'.dt' );
		
				$(settings.nTable).trigger( e, args );
		
				ret.push( e.result );
			}
		
			return ret;
		}
		
		
		function _fnLengthOverflow ( settings )
		{
			var
				start = settings._iDisplayStart,
				end = settings.fnDisplayEnd(),
				len = settings._iDisplayLength;
		
			/* If we have space to show extra rows (backing up from the end point - then do so */
			if ( start >= end )
			{
				start = end - len;
			}
		
			// Keep the start record on the current page
			start -= (start % len);
		
			if ( len === -1 || start < 0 )
			{
				start = 0;
			}
		
			settings._iDisplayStart = start;
		}
		
		
		function _fnRenderer( settings, type )
		{
			var renderer = settings.renderer;
			var host = DataTable.ext.renderer[type];
		
			if ( $.isPlainObject( renderer ) && renderer[type] ) {
				// Specific renderer for this type. If available use it, otherwise use
				// the default.
				return host[renderer[type]] || host._;
			}
			else if ( typeof renderer === 'string' ) {
				// Common renderer - if there is one available for this type use it,
				// otherwise use the default
				return host[renderer] || host._;
			}
		
			// Use the default
			return host._;
		}
		
		
		/**
		 * Detect the data source being used for the table. Used to simplify the code
		 * a little (ajax) and to make it compress a little smaller.
		 *
		 *  @param {object} settings dataTables settings object
		 *  @returns {string} Data source
		 *  @memberof DataTable#oApi
		 */
		function _fnDataSource ( settings )
		{
			if ( settings.oFeatures.bServerSide ) {
				return 'ssp';
			}
			else if ( settings.ajax || settings.sAjaxSource ) {
				return 'ajax';
			}
			return 'dom';
		}
		

		
		
		/**
		 * Computed structure of the DataTables API, defined by the options passed to
		 * `DataTable.Api.register()` when building the API.
		 *
		 * The structure is built in order to speed creation and extension of the Api
		 * objects since the extensions are effectively pre-parsed.
		 *
		 * The array is an array of objects with the following structure, where this
		 * base array represents the Api prototype base:
		 *
		 *     [
		 *       {
		 *         name:      'data'                -- string   - Property name
		 *         val:       function () {},       -- function - Api method (or undefined if just an object
		 *         methodExt: [ ... ],              -- array    - Array of Api object definitions to extend the method result
		 *         propExt:   [ ... ]               -- array    - Array of Api object definitions to extend the property
		 *       },
		 *       {
		 *         name:     'row'
		 *         val:       {},
		 *         methodExt: [ ... ],
		 *         propExt:   [
		 *           {
		 *             name:      'data'
		 *             val:       function () {},
		 *             methodExt: [ ... ],
		 *             propExt:   [ ... ]
		 *           },
		 *           ...
		 *         ]
		 *       }
		 *     ]
		 *
		 * @type {Array}
		 * @ignore
		 */
		var __apiStruct = [];
		
		
		/**
		 * `Array.prototype` reference.
		 *
		 * @type object
		 * @ignore
		 */
		var __arrayProto = Array.prototype;
		
		
		/**
		 * Abstraction for `context` parameter of the `Api` constructor to allow it to
		 * take several different forms for ease of use.
		 *
		 * Each of the input parameter types will be converted to a DataTables settings
		 * object where possible.
		 *
		 * @param  {string|node|jQuery|object} mixed DataTable identifier. Can be one
		 *   of:
		 *
		 *   * `string` - jQuery selector. Any DataTables' matching the given selector
		 *     with be found and used.
		 *   * `node` - `TABLE` node which has already been formed into a DataTable.
		 *   * `jQuery` - A jQuery object of `TABLE` nodes.
		 *   * `object` - DataTables settings object
		 *   * `DataTables.Api` - API instance
		 * @return {array|null} Matching DataTables settings objects. `null` or
		 *   `undefined` is returned if no matching DataTable is found.
		 * @ignore
		 */
		var _toSettings = function ( mixed )
		{
			var idx, jq;
			var settings = DataTable.settings;
			var tables = $.map( settings, function (el, i) {
				return el.nTable;
			} );
		
			if ( ! mixed ) {
				return [];
			}
			else if ( mixed.nTable && mixed.oApi ) {
				// DataTables settings object
				return [ mixed ];
			}
			else if ( mixed.nodeName && mixed.nodeName.toLowerCase() === 'table' ) {
				// Table node
				idx = $.inArray( mixed, tables );
				return idx !== -1 ? [ settings[idx] ] : null;
			}
			else if ( mixed && typeof mixed.settings === 'function' ) {
				return mixed.settings().toArray();
			}
			else if ( typeof mixed === 'string' ) {
				// jQuery selector
				jq = $(mixed);
			}
			else if ( mixed instanceof $ ) {
				// jQuery object (also DataTables instance)
				jq = mixed;
			}
		
			if ( jq ) {
				return jq.map( function(i) {
					idx = $.inArray( this, tables );
					return idx !== -1 ? settings[idx] : null;
				} ).toArray();
			}
		};
		
		
		/**
		 * DataTables API class - used to control and interface with  one or more
		 * DataTables enhanced tables.
		 *
		 * The API class is heavily based on jQuery, presenting a chainable interface
		 * that you can use to interact with tables. Each instance of the API class has
		 * a "context" - i.e. the tables that it will operate on. This could be a single
		 * table, all tables on a page or a sub-set thereof.
		 *
		 * Additionally the API is designed to allow you to easily work with the data in
		 * the tables, retrieving and manipulating it as required. This is done by
		 * presenting the API class as an array like interface. The contents of the
		 * array depend upon the actions requested by each method (for example
		 * `rows().nodes()` will return an array of nodes, while `rows().data()` will
		 * return an array of objects or arrays depending upon your table's
		 * configuration). The API object has a number of array like methods (`push`,
		 * `pop`, `reverse` etc) as well as additional helper methods (`each`, `pluck`,
		 * `unique` etc) to assist your working with the data held in a table.
		 *
		 * Most methods (those which return an Api instance) are chainable, which means
		 * the return from a method call also has all of the methods available that the
		 * top level object had. For example, these two calls are equivalent:
		 *
		 *     // Not chained
		 *     api.row.add( {...} );
		 *     api.draw();
		 *
		 *     // Chained
		 *     api.row.add( {...} ).draw();
		 *
		 * @class DataTable.Api
		 * @param {array|object|string|jQuery} context DataTable identifier. This is
		 *   used to define which DataTables enhanced tables this API will operate on.
		 *   Can be one of:
		 *
		 *   * `string` - jQuery selector. Any DataTables' matching the given selector
		 *     with be found and used.
		 *   * `node` - `TABLE` node which has already been formed into a DataTable.
		 *   * `jQuery` - A jQuery object of `TABLE` nodes.
		 *   * `object` - DataTables settings object
		 * @param {array} [data] Data to initialise the Api instance with.
		 *
		 * @example
		 *   // Direct initialisation during DataTables construction
		 *   var api = $('#example').DataTable();
		 *
		 * @example
		 *   // Initialisation using a DataTables jQuery object
		 *   var api = $('#example').dataTable().api();
		 *
		 * @example
		 *   // Initialisation as a constructor
		 *   var api = new $.fn.DataTable.Api( 'table.dataTable' );
		 */
		_Api = function ( context, data )
		{
			if ( ! (this instanceof _Api) ) {
				return new _Api( context, data );
			}
		
			var settings = [];
			var ctxSettings = function ( o ) {
				var a = _toSettings( o );
				if ( a ) {
					settings = settings.concat( a );
				}
			};
		
			if ( $.isArray( context ) ) {
				for ( var i=0, ien=context.length ; i<ien ; i++ ) {
					ctxSettings( context[i] );
				}
			}
			else {
				ctxSettings( context );
			}
		
			// Remove duplicates
			this.context = _unique( settings );
		
			// Initial data
			if ( data ) {
				$.merge( this, data );
			}
		
			// selector
			this.selector = {
				rows: null,
				cols: null,
				opts: null
			};
		
			_Api.extend( this, this, __apiStruct );
		};
		
		DataTable.Api = _Api;
		
		// Don't destroy the existing prototype, just extend it. Required for jQuery 2's
		// isPlainObject.
		$.extend( _Api.prototype, {
			any: function ()
			{
				return this.count() !== 0;
			},
		
		
			concat:  __arrayProto.concat,
		
		
			context: [], // array of table settings objects
		
		
			count: function ()
			{
				return this.flatten().length;
			},
		
		
			each: function ( fn )
			{
				for ( var i=0, ien=this.length ; i<ien; i++ ) {
					fn.call( this, this[i], i, this );
				}
		
				return this;
			},
		
		
			eq: function ( idx )
			{
				var ctx = this.context;
		
				return ctx.length > idx ?
					new _Api( ctx[idx], this[idx] ) :
					null;
			},
		
		
			filter: function ( fn )
			{
				var a = [];
		
				if ( __arrayProto.filter ) {
					a = __arrayProto.filter.call( this, fn, this );
				}
				else {
					// Compatibility for browsers without EMCA-252-5 (JS 1.6)
					for ( var i=0, ien=this.length ; i<ien ; i++ ) {
						if ( fn.call( this, this[i], i, this ) ) {
							a.push( this[i] );
						}
					}
				}
		
				return new _Api( this.context, a );
			},
		
		
			flatten: function ()
			{
				var a = [];
				return new _Api( this.context, a.concat.apply( a, this.toArray() ) );
			},
		
		
			join:    __arrayProto.join,
		
		
			indexOf: __arrayProto.indexOf || function (obj, start)
			{
				for ( var i=(start || 0), ien=this.length ; i<ien ; i++ ) {
					if ( this[i] === obj ) {
						return i;
					}
				}
				return -1;
			},
		
			iterator: function ( flatten, type, fn, alwaysNew ) {
				var
					a = [], ret,
					i, ien, j, jen,
					context = this.context,
					rows, items, item,
					selector = this.selector;
		
				// Argument shifting
				if ( typeof flatten === 'string' ) {
					alwaysNew = fn;
					fn = type;
					type = flatten;
					flatten = false;
				}
		
				for ( i=0, ien=context.length ; i<ien ; i++ ) {
					var apiInst = new _Api( context[i] );
		
					if ( type === 'table' ) {
						ret = fn.call( apiInst, context[i], i );
		
						if ( ret !== undefined ) {
							a.push( ret );
						}
					}
					else if ( type === 'columns' || type === 'rows' ) {
						// this has same length as context - one entry for each table
						ret = fn.call( apiInst, context[i], this[i], i );
		
						if ( ret !== undefined ) {
							a.push( ret );
						}
					}
					else if ( type === 'column' || type === 'column-rows' || type === 'row' || type === 'cell' ) {
						// columns and rows share the same structure.
						// 'this' is an array of column indexes for each context
						items = this[i];
		
						if ( type === 'column-rows' ) {
							rows = _selector_row_indexes( context[i], selector.opts );
						}
		
						for ( j=0, jen=items.length ; j<jen ; j++ ) {
							item = items[j];
		
							if ( type === 'cell' ) {
								ret = fn.call( apiInst, context[i], item.row, item.column, i, j );
							}
							else {
								ret = fn.call( apiInst, context[i], item, i, j, rows );
							}
		
							if ( ret !== undefined ) {
								a.push( ret );
							}
						}
					}
				}
		
				if ( a.length || alwaysNew ) {
					var api = new _Api( context, flatten ? a.concat.apply( [], a ) : a );
					var apiSelector = api.selector;
					apiSelector.rows = selector.rows;
					apiSelector.cols = selector.cols;
					apiSelector.opts = selector.opts;
					return api;
				}
				return this;
			},
		
		
			lastIndexOf: __arrayProto.lastIndexOf || function (obj, start)
			{
				// Bit cheeky...
				return this.indexOf.apply( this.toArray.reverse(), arguments );
			},
		
		
			length:  0,
		
		
			map: function ( fn )
			{
				var a = [];
		
				if ( __arrayProto.map ) {
					a = __arrayProto.map.call( this, fn, this );
				}
				else {
					// Compatibility for browsers without EMCA-252-5 (JS 1.6)
					for ( var i=0, ien=this.length ; i<ien ; i++ ) {
						a.push( fn.call( this, this[i], i ) );
					}
				}
		
				return new _Api( this.context, a );
			},
		
		
			pluck: function ( prop )
			{
				return this.map( function ( el ) {
					return el[ prop ];
				} );
			},
		
			pop:     __arrayProto.pop,
		
		
			push:    __arrayProto.push,
		
		
			// Does not return an API instance
			reduce: __arrayProto.reduce || function ( fn, init )
			{
				return _fnReduce( this, fn, init, 0, this.length, 1 );
			},
		
		
			reduceRight: __arrayProto.reduceRight || function ( fn, init )
			{
				return _fnReduce( this, fn, init, this.length-1, -1, -1 );
			},
		
		
			reverse: __arrayProto.reverse,
		
		
			// Object with rows, columns and opts
			selector: null,
		
		
			shift:   __arrayProto.shift,
		
		
			slice: function () {
				return new _Api( this.context, this );
			},
		
		
			sort:    __arrayProto.sort, // ? name - order?
		
		
			splice:  __arrayProto.splice,
		
		
			toArray: function ()
			{
				return __arrayProto.slice.call( this );
			},
		
		
			to$: function ()
			{
				return $( this );
			},
		
		
			toJQuery: function ()
			{
				return $( this );
			},
		
		
			unique: function ()
			{
				return new _Api( this.context, _unique(this) );
			},
		
		
			unshift: __arrayProto.unshift
		} );
		
		
		_Api.extend = function ( scope, obj, ext )
		{
			// Only extend API instances and static properties of the API
			if ( ! ext.length || ! obj || ( ! (obj instanceof _Api) && ! obj.__dt_wrapper ) ) {
				return;
			}
		
			var
				i, ien,
				j, jen,
				struct, inner,
				methodScoping = function ( scope, fn, struc ) {
					return function () {
						var ret = fn.apply( scope, arguments );
		
						// Method extension
						_Api.extend( ret, ret, struc.methodExt );
						return ret;
					};
				};
		
			for ( i=0, ien=ext.length ; i<ien ; i++ ) {
				struct = ext[i];
		
				// Value
				obj[ struct.name ] = typeof struct.val === 'function' ?
					methodScoping( scope, struct.val, struct ) :
					$.isPlainObject( struct.val ) ?
						{} :
						struct.val;
		
				obj[ struct.name ].__dt_wrapper = true;
		
				// Property extension
				_Api.extend( scope, obj[ struct.name ], struct.propExt );
			}
		};
		
		
		// @todo - Is there need for an augment function?
		// _Api.augment = function ( inst, name )
		// {
		// 	// Find src object in the structure from the name
		// 	var parts = name.split('.');
		
		// 	_Api.extend( inst, obj );
		// };
		
		
		//     [
		//       {
		//         name:      'data'                -- string   - Property name
		//         val:       function () {},       -- function - Api method (or undefined if just an object
		//         methodExt: [ ... ],              -- array    - Array of Api object definitions to extend the method result
		//         propExt:   [ ... ]               -- array    - Array of Api object definitions to extend the property
		//       },
		//       {
		//         name:     'row'
		//         val:       {},
		//         methodExt: [ ... ],
		//         propExt:   [
		//           {
		//             name:      'data'
		//             val:       function () {},
		//             methodExt: [ ... ],
		//             propExt:   [ ... ]
		//           },
		//           ...
		//         ]
		//       }
		//     ]
		
		_Api.register = _api_register = function ( name, val )
		{
			if ( $.isArray( name ) ) {
				for ( var j=0, jen=name.length ; j<jen ; j++ ) {
					_Api.register( name[j], val );
				}
				return;
			}
		
			var
				i, ien,
				heir = name.split('.'),
				struct = __apiStruct,
				key, method;
		
			var find = function ( src, name ) {
				for ( var i=0, ien=src.length ; i<ien ; i++ ) {
					if ( src[i].name === name ) {
						return src[i];
					}
				}
				return null;
			};
		
			for ( i=0, ien=heir.length ; i<ien ; i++ ) {
				method = heir[i].indexOf('()') !== -1;
				key = method ?
					heir[i].replace('()', '') :
					heir[i];
		
				var src = find( struct, key );
				if ( ! src ) {
					src = {
						name:      key,
						val:       {},
						methodExt: [],
						propExt:   []
					};
					struct.push( src );
				}
		
				if ( i === ien-1 ) {
					src.val = val;
				}
				else {
					struct = method ?
						src.methodExt :
						src.propExt;
				}
			}
		};
		
		
		_Api.registerPlural = _api_registerPlural = function ( pluralName, singularName, val ) {
			_Api.register( pluralName, val );
		
			_Api.register( singularName, function () {
				var ret = val.apply( this, arguments );
		
				if ( ret === this ) {
					// Returned item is the API instance that was passed in, return it
					return this;
				}
				else if ( ret instanceof _Api ) {
					// New API instance returned, want the value from the first item
					// in the returned array for the singular result.
					return ret.length ?
						$.isArray( ret[0] ) ?
							new _Api( ret.context, ret[0] ) : // Array results are 'enhanced'
							ret[0] :
						undefined;
				}
		
				// Non-API return - just fire it back
				return ret;
			} );
		};
		
		
		/**
		 * Selector for HTML tables. Apply the given selector to the give array of
		 * DataTables settings objects.
		 *
		 * @param {string|integer} [selector] jQuery selector string or integer
		 * @param  {array} Array of DataTables settings objects to be filtered
		 * @return {array}
		 * @ignore
		 */
		var __table_selector = function ( selector, a )
		{
			// Integer is used to pick out a table by index
			if ( typeof selector === 'number' ) {
				return [ a[ selector ] ];
			}
		
			// Perform a jQuery selector on the table nodes
			var nodes = $.map( a, function (el, i) {
				return el.nTable;
			} );
		
			return $(nodes)
				.filter( selector )
				.map( function (i) {
					// Need to translate back from the table node to the settings
					var idx = $.inArray( this, nodes );
					return a[ idx ];
				} )
				.toArray();
		};
		
		
		
		/**
		 * Context selector for the API's context (i.e. the tables the API instance
		 * refers to.
		 *
		 * @name    DataTable.Api#tables
		 * @param {string|integer} [selector] Selector to pick which tables the iterator
		 *   should operate on. If not given, all tables in the current context are
		 *   used. This can be given as a jQuery selector (for example `':gt(0)'`) to
		 *   select multiple tables or as an integer to select a single table.
		 * @returns {DataTable.Api} Returns a new API instance if a selector is given.
		 */
		_api_register( 'tables()', function ( selector ) {
			// A new instance is created if there was a selector specified
			return selector ?
				new _Api( __table_selector( selector, this.context ) ) :
				this;
		} );
		
		
		_api_register( 'table()', function ( selector ) {
			var tables = this.tables( selector );
			var ctx = tables.context;
		
			// Truncate to the first matched table
			return ctx.length ?
				new _Api( ctx[0] ) :
				tables;
		} );
		
		
		_api_registerPlural( 'tables().nodes()', 'table().node()' , function () {
			return this.iterator( 'table', function ( ctx ) {
				return ctx.nTable;
			}, 1 );
		} );
		
		
		_api_registerPlural( 'tables().body()', 'table().body()' , function () {
			return this.iterator( 'table', function ( ctx ) {
				return ctx.nTBody;
			}, 1 );
		} );
		
		
		_api_registerPlural( 'tables().header()', 'table().header()' , function () {
			return this.iterator( 'table', function ( ctx ) {
				return ctx.nTHead;
			}, 1 );
		} );
		
		
		_api_registerPlural( 'tables().footer()', 'table().footer()' , function () {
			return this.iterator( 'table', function ( ctx ) {
				return ctx.nTFoot;
			}, 1 );
		} );
		
		
		_api_registerPlural( 'tables().containers()', 'table().container()' , function () {
			return this.iterator( 'table', function ( ctx ) {
				return ctx.nTableWrapper;
			}, 1 );
		} );
		
		
		
		/**
		 * Redraw the tables in the current context.
		 */
		_api_register( 'draw()', function ( paging ) {
			return this.iterator( 'table', function ( settings ) {
				if ( paging === 'page' ) {
					_fnDraw( settings );
				}
				else {
					if ( typeof paging === 'string' ) {
						paging = paging === 'full-hold' ?
							false :
							true;
					}
		
					_fnReDraw( settings, paging===false );
				}
			} );
		} );
		
		
		
		/**
		 * Get the current page index.
		 *
		 * @return {integer} Current page index (zero based)
		 *//**
		 * Set the current page.
		 *
		 * Note that if you attempt to show a page which does not exist, DataTables will
		 * not throw an error, but rather reset the paging.
		 *
		 * @param {integer|string} action The paging action to take. This can be one of:
		 *  * `integer` - The page index to jump to
		 *  * `string` - An action to take:
		 *    * `first` - Jump to first page.
		 *    * `next` - Jump to the next page
		 *    * `previous` - Jump to previous page
		 *    * `last` - Jump to the last page.
		 * @returns {DataTables.Api} this
		 */
		_api_register( 'page()', function ( action ) {
			if ( action === undefined ) {
				return this.page.info().page; // not an expensive call
			}
		
			// else, have an action to take on all tables
			return this.iterator( 'table', function ( settings ) {
				_fnPageChange( settings, action );
			} );
		} );
		
		
		/**
		 * Paging information for the first table in the current context.
		 *
		 * If you require paging information for another table, use the `table()` method
		 * with a suitable selector.
		 *
		 * @return {object} Object with the following properties set:
		 *  * `page` - Current page index (zero based - i.e. the first page is `0`)
		 *  * `pages` - Total number of pages
		 *  * `start` - Display index for the first record shown on the current page
		 *  * `end` - Display index for the last record shown on the current page
		 *  * `length` - Display length (number of records). Note that generally `start
		 *    + length = end`, but this is not always true, for example if there are
		 *    only 2 records to show on the final page, with a length of 10.
		 *  * `recordsTotal` - Full data set length
		 *  * `recordsDisplay` - Data set length once the current filtering criterion
		 *    are applied.
		 */
		_api_register( 'page.info()', function ( action ) {
			if ( this.context.length === 0 ) {
				return undefined;
			}
		
			var
				settings   = this.context[0],
				start      = settings._iDisplayStart,
				len        = settings.oFeatures.bPaginate ? settings._iDisplayLength : -1,
				visRecords = settings.fnRecordsDisplay(),
				all        = len === -1;
		
			return {
				"page":           all ? 0 : Math.floor( start / len ),
				"pages":          all ? 1 : Math.ceil( visRecords / len ),
				"start":          start,
				"end":            settings.fnDisplayEnd(),
				"length":         len,
				"recordsTotal":   settings.fnRecordsTotal(),
				"recordsDisplay": visRecords,
				"serverSide":     _fnDataSource( settings ) === 'ssp'
			};
		} );
		
		
		/**
		 * Get the current page length.
		 *
		 * @return {integer} Current page length. Note `-1` indicates that all records
		 *   are to be shown.
		 *//**
		 * Set the current page length.
		 *
		 * @param {integer} Page length to set. Use `-1` to show all records.
		 * @returns {DataTables.Api} this
		 */
		_api_register( 'page.len()', function ( len ) {
			// Note that we can't call this function 'length()' because `length`
			// is a Javascript property of functions which defines how many arguments
			// the function expects.
			if ( len === undefined ) {
				return this.context.length !== 0 ?
					this.context[0]._iDisplayLength :
					undefined;
			}
		
			// else, set the page length
			return this.iterator( 'table', function ( settings ) {
				_fnLengthChange( settings, len );
			} );
		} );
		
		
		
		var __reload = function ( settings, holdPosition, callback ) {
			// Use the draw event to trigger a callback
			if ( callback ) {
				var api = new _Api( settings );
		
				api.one( 'draw', function () {
					callback( api.ajax.json() );
				} );
			}
		
			if ( _fnDataSource( settings ) == 'ssp' ) {
				_fnReDraw( settings, holdPosition );
			}
			else {
				_fnProcessingDisplay( settings, true );
		
				// Cancel an existing request
				var xhr = settings.jqXHR;
				if ( xhr && xhr.readyState !== 4 ) {
					xhr.abort();
				}
		
				// Trigger xhr
				_fnBuildAjax( settings, [], function( json ) {
					_fnClearTable( settings );
		
					var data = _fnAjaxDataSrc( settings, json );
					for ( var i=0, ien=data.length ; i<ien ; i++ ) {
						_fnAddData( settings, data[i] );
					}
		
					_fnReDraw( settings, holdPosition );
					_fnProcessingDisplay( settings, false );
				} );
			}
		};
		
		
		/**
		 * Get the JSON response from the last Ajax request that DataTables made to the
		 * server. Note that this returns the JSON from the first table in the current
		 * context.
		 *
		 * @return {object} JSON received from the server.
		 */
		_api_register( 'ajax.json()', function () {
			var ctx = this.context;
		
			if ( ctx.length > 0 ) {
				return ctx[0].json;
			}
		
			// else return undefined;
		} );
		
		
		/**
		 * Get the data submitted in the last Ajax request
		 */
		_api_register( 'ajax.params()', function () {
			var ctx = this.context;
		
			if ( ctx.length > 0 ) {
				return ctx[0].oAjaxData;
			}
		
			// else return undefined;
		} );
		
		
		/**
		 * Reload tables from the Ajax data source. Note that this function will
		 * automatically re-draw the table when the remote data has been loaded.
		 *
		 * @param {boolean} [reset=true] Reset (default) or hold the current paging
		 *   position. A full re-sort and re-filter is performed when this method is
		 *   called, which is why the pagination reset is the default action.
		 * @returns {DataTables.Api} this
		 */
		_api_register( 'ajax.reload()', function ( callback, resetPaging ) {
			return this.iterator( 'table', function (settings) {
				__reload( settings, resetPaging===false, callback );
			} );
		} );
		
		
		/**
		 * Get the current Ajax URL. Note that this returns the URL from the first
		 * table in the current context.
		 *
		 * @return {string} Current Ajax source URL
		 *//**
		 * Set the Ajax URL. Note that this will set the URL for all tables in the
		 * current context.
		 *
		 * @param {string} url URL to set.
		 * @returns {DataTables.Api} this
		 */
		_api_register( 'ajax.url()', function ( url ) {
			var ctx = this.context;
		
			if ( url === undefined ) {
				// get
				if ( ctx.length === 0 ) {
					return undefined;
				}
				ctx = ctx[0];
		
				return ctx.ajax ?
					$.isPlainObject( ctx.ajax ) ?
						ctx.ajax.url :
						ctx.ajax :
					ctx.sAjaxSource;
			}
		
			// set
			return this.iterator( 'table', function ( settings ) {
				if ( $.isPlainObject( settings.ajax ) ) {
					settings.ajax.url = url;
				}
				else {
					settings.ajax = url;
				}
				// No need to consider sAjaxSource here since DataTables gives priority
				// to `ajax` over `sAjaxSource`. So setting `ajax` here, renders any
				// value of `sAjaxSource` redundant.
			} );
		} );
		
		
		/**
		 * Load data from the newly set Ajax URL. Note that this method is only
		 * available when `ajax.url()` is used to set a URL. Additionally, this method
		 * has the same effect as calling `ajax.reload()` but is provided for
		 * convenience when setting a new URL. Like `ajax.reload()` it will
		 * automatically redraw the table once the remote data has been loaded.
		 *
		 * @returns {DataTables.Api} this
		 */
		_api_register( 'ajax.url().load()', function ( callback, resetPaging ) {
			// Same as a reload, but makes sense to present it for easy access after a
			// url change
			return this.iterator( 'table', function ( ctx ) {
				__reload( ctx, resetPaging===false, callback );
			} );
		} );
		
		
		
		
		var _selector_run = function ( type, selector, selectFn, settings, opts )
		{
			var
				out = [], res,
				a, i, ien, j, jen,
				selectorType = typeof selector;
		
			// Can't just check for isArray here, as an API or jQuery instance might be
			// given with their array like look
			if ( ! selector || selectorType === 'string' || selectorType === 'function' || selector.length === undefined ) {
				selector = [ selector ];
			}
		
			for ( i=0, ien=selector.length ; i<ien ; i++ ) {
				// Only split on simple strings - complex expressions will be jQuery selectors
				a = selector[i] && selector[i].split && ! selector[i].match(/[\[\(:]/) ?
					selector[i].split(',') :
					[ selector[i] ];
		
				for ( j=0, jen=a.length ; j<jen ; j++ ) {
					res = selectFn( typeof a[j] === 'string' ? $.trim(a[j]) : a[j] );
		
					if ( res && res.length ) {
						out = out.concat( res );
					}
				}
			}
		
			// selector extensions
			var ext = _ext.selector[ type ];
			if ( ext.length ) {
				for ( i=0, ien=ext.length ; i<ien ; i++ ) {
					out = ext[i]( settings, opts, out );
				}
			}
		
			return _unique( out );
		};
		
		
		var _selector_opts = function ( opts )
		{
			if ( ! opts ) {
				opts = {};
			}
		
			// Backwards compatibility for 1.9- which used the terminology filter rather
			// than search
			if ( opts.filter && opts.search === undefined ) {
				opts.search = opts.filter;
			}
		
			return $.extend( {
				search: 'none',
				order: 'current',
				page: 'all'
			}, opts );
		};
		
		
		var _selector_first = function ( inst )
		{
			// Reduce the API instance to the first item found
			for ( var i=0, ien=inst.length ; i<ien ; i++ ) {
				if ( inst[i].length > 0 ) {
					// Assign the first element to the first item in the instance
					// and truncate the instance and context
					inst[0] = inst[i];
					inst[0].length = 1;
					inst.length = 1;
					inst.context = [ inst.context[i] ];
		
					return inst;
				}
			}
		
			// Not found - return an empty instance
			inst.length = 0;
			return inst;
		};
		
		
		var _selector_row_indexes = function ( settings, opts )
		{
			var
				i, ien, tmp, a=[],
				displayFiltered = settings.aiDisplay,
				displayMaster = settings.aiDisplayMaster;
		
			var
				search = opts.search,  // none, applied, removed
				order  = opts.order,   // applied, current, index (original - compatibility with 1.9)
				page   = opts.page;    // all, current
		
			if ( _fnDataSource( settings ) == 'ssp' ) {
				// In server-side processing mode, most options are irrelevant since
				// rows not shown don't exist and the index order is the applied order
				// Removed is a special case - for consistency just return an empty
				// array
				return search === 'removed' ?
					[] :
					_range( 0, displayMaster.length );
			}
			else if ( page == 'current' ) {
				// Current page implies that order=current and fitler=applied, since it is
				// fairly senseless otherwise, regardless of what order and search actually
				// are
				for ( i=settings._iDisplayStart, ien=settings.fnDisplayEnd() ; i<ien ; i++ ) {
					a.push( displayFiltered[i] );
				}
			}
			else if ( order == 'current' || order == 'applied' ) {
				a = search == 'none' ?
					displayMaster.slice() :                      // no search
					search == 'applied' ?
						displayFiltered.slice() :                // applied search
						$.map( displayMaster, function (el, i) { // removed search
							return $.inArray( el, displayFiltered ) === -1 ? el : null;
						} );
			}
			else if ( order == 'index' || order == 'original' ) {
				for ( i=0, ien=settings.aoData.length ; i<ien ; i++ ) {
					if ( search == 'none' ) {
						a.push( i );
					}
					else { // applied | removed
						tmp = $.inArray( i, displayFiltered );
		
						if ((tmp === -1 && search == 'removed') ||
							(tmp >= 0   && search == 'applied') )
						{
							a.push( i );
						}
					}
				}
			}
		
			return a;
		};
		
		
		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Rows
		 *
		 * {}          - no selector - use all available rows
		 * {integer}   - row aoData index
		 * {node}      - TR node
		 * {string}    - jQuery selector to apply to the TR elements
		 * {array}     - jQuery array of nodes, or simply an array of TR nodes
		 *
		 */
		
		
		var __row_selector = function ( settings, selector, opts )
		{
			var rows;
			var run = function ( sel ) {
				var selInt = _intVal( sel );
				var i, ien;
		
				// Short cut - selector is a number and no options provided (default is
				// all records, so no need to check if the index is in there, since it
				// must be - dev error if the index doesn't exist).
				if ( selInt !== null && ! opts ) {
					return [ selInt ];
				}
		
				if ( ! rows ) {
					rows = _selector_row_indexes( settings, opts );
				}
		
				if ( selInt !== null && $.inArray( selInt, rows ) !== -1 ) {
					// Selector - integer
					return [ selInt ];
				}
				else if ( sel === null || sel === undefined || sel === '' ) {
					// Selector - none
					return rows;
				}
		
				// Selector - function
				if ( typeof sel === 'function' ) {
					return $.map( rows, function (idx) {
						var row = settings.aoData[ idx ];
						return sel( idx, row._aData, row.nTr ) ? idx : null;
					} );
				}
		
				// Get nodes in the order from the `rows` array with null values removed
				var nodes = _removeEmpty(
					_pluck_order( settings.aoData, rows, 'nTr' )
				);
		
				// Selector - node
				if ( sel.nodeName ) {
					if ( sel._DT_RowIndex !== undefined ) {
						return [ sel._DT_RowIndex ]; // Property added by DT for fast lookup
					}
					else if ( sel._DT_CellIndex ) {
						return [ sel._DT_CellIndex.row ];
					}
					else {
						var host = $(sel).closest('*[data-dt-row]');
						return host.length ?
							[ host.data('dt-row') ] :
							[];
					}
				}
		
				// ID selector. Want to always be able to select rows by id, regardless
				// of if the tr element has been created or not, so can't rely upon
				// jQuery here - hence a custom implementation. This does not match
				// Sizzle's fast selector or HTML4 - in HTML5 the ID can be anything,
				// but to select it using a CSS selector engine (like Sizzle or
				// querySelect) it would need to need to be escaped for some characters.
				// DataTables simplifies this for row selectors since you can select
				// only a row. A # indicates an id any anything that follows is the id -
				// unescaped.
				if ( typeof sel === 'string' && sel.charAt(0) === '#' ) {
					// get row index from id
					var rowObj = settings.aIds[ sel.replace( /^#/, '' ) ];
					if ( rowObj !== undefined ) {
						return [ rowObj.idx ];
					}
		
					// need to fall through to jQuery in case there is DOM id that
					// matches
				}
		
				// Selector - jQuery selector string, array of nodes or jQuery object/
				// As jQuery's .filter() allows jQuery objects to be passed in filter,
				// it also allows arrays, so this will cope with all three options
				return $(nodes)
					.filter( sel )
					.map( function () {
						return this._DT_RowIndex;
					} )
					.toArray();
			};
		
			return _selector_run( 'row', selector, run, settings, opts );
		};
		
		
		_api_register( 'rows()', function ( selector, opts ) {
			// argument shifting
			if ( selector === undefined ) {
				selector = '';
			}
			else if ( $.isPlainObject( selector ) ) {
				opts = selector;
				selector = '';
			}
		
			opts = _selector_opts( opts );
		
			var inst = this.iterator( 'table', function ( settings ) {
				return __row_selector( settings, selector, opts );
			}, 1 );
		
			// Want argument shifting here and in __row_selector?
			inst.selector.rows = selector;
			inst.selector.opts = opts;
		
			return inst;
		} );
		
		_api_register( 'rows().nodes()', function () {
			return this.iterator( 'row', function ( settings, row ) {
				return settings.aoData[ row ].nTr || undefined;
			}, 1 );
		} );
		
		_api_register( 'rows().data()', function () {
			return this.iterator( true, 'rows', function ( settings, rows ) {
				return _pluck_order( settings.aoData, rows, '_aData' );
			}, 1 );
		} );
		
		_api_registerPlural( 'rows().cache()', 'row().cache()', function ( type ) {
			return this.iterator( 'row', function ( settings, row ) {
				var r = settings.aoData[ row ];
				return type === 'search' ? r._aFilterData : r._aSortData;
			}, 1 );
		} );
		
		_api_registerPlural( 'rows().invalidate()', 'row().invalidate()', function ( src ) {
			return this.iterator( 'row', function ( settings, row ) {
				_fnInvalidate( settings, row, src );
			} );
		} );
		
		_api_registerPlural( 'rows().indexes()', 'row().index()', function () {
			return this.iterator( 'row', function ( settings, row ) {
				return row;
			}, 1 );
		} );
		
		_api_registerPlural( 'rows().ids()', 'row().id()', function ( hash ) {
			var a = [];
			var context = this.context;
		
			// `iterator` will drop undefined values, but in this case we want them
			for ( var i=0, ien=context.length ; i<ien ; i++ ) {
				for ( var j=0, jen=this[i].length ; j<jen ; j++ ) {
					var id = context[i].rowIdFn( context[i].aoData[ this[i][j] ]._aData );
					a.push( (hash === true ? '#' : '' )+ id );
				}
			}
		
			return new _Api( context, a );
		} );
		
		_api_registerPlural( 'rows().remove()', 'row().remove()', function () {
			var that = this;
		
			this.iterator( 'row', function ( settings, row, thatIdx ) {
				var data = settings.aoData;
				var rowData = data[ row ];
				var i, ien, j, jen;
				var loopRow, loopCells;
		
				data.splice( row, 1 );
		
				// Update the cached indexes
				for ( i=0, ien=data.length ; i<ien ; i++ ) {
					loopRow = data[i];
					loopCells = loopRow.anCells;
		
					// Rows
					if ( loopRow.nTr !== null ) {
						loopRow.nTr._DT_RowIndex = i;
					}
		
					// Cells
					if ( loopCells !== null ) {
						for ( j=0, jen=loopCells.length ; j<jen ; j++ ) {
							loopCells[j]._DT_CellIndex.row = i;
						}
					}
				}
		
				// Delete from the display arrays
				_fnDeleteIndex( settings.aiDisplayMaster, row );
				_fnDeleteIndex( settings.aiDisplay, row );
				_fnDeleteIndex( that[ thatIdx ], row, false ); // maintain local indexes
		
				// Check for an 'overflow' they case for displaying the table
				_fnLengthOverflow( settings );
		
				// Remove the row's ID reference if there is one
				var id = settings.rowIdFn( rowData._aData );
				if ( id !== undefined ) {
					delete settings.aIds[ id ];
				}
			} );
		
			this.iterator( 'table', function ( settings ) {
				for ( var i=0, ien=settings.aoData.length ; i<ien ; i++ ) {
					settings.aoData[i].idx = i;
				}
			} );
		
			return this;
		} );
		
		
		_api_register( 'rows.add()', function ( rows ) {
			var newRows = this.iterator( 'table', function ( settings ) {
					var row, i, ien;
					var out = [];
		
					for ( i=0, ien=rows.length ; i<ien ; i++ ) {
						row = rows[i];
		
						if ( row.nodeName && row.nodeName.toUpperCase() === 'TR' ) {
							out.push( _fnAddTr( settings, row )[0] );
						}
						else {
							out.push( _fnAddData( settings, row ) );
						}
					}
		
					return out;
				}, 1 );
		
			// Return an Api.rows() extended instance, so rows().nodes() etc can be used
			var modRows = this.rows( -1 );
			modRows.pop();
			$.merge( modRows, newRows );
		
			return modRows;
		} );
		
		
		
		
		
		/**
		 *
		 */
		_api_register( 'row()', function ( selector, opts ) {
			return _selector_first( this.rows( selector, opts ) );
		} );
		
		
		_api_register( 'row().data()', function ( data ) {
			var ctx = this.context;
		
			if ( data === undefined ) {
				// Get
				return ctx.length && this.length ?
					ctx[0].aoData[ this[0] ]._aData :
					undefined;
			}
		
			// Set
			ctx[0].aoData[ this[0] ]._aData = data;
		
			// Automatically invalidate
			_fnInvalidate( ctx[0], this[0], 'data' );
		
			return this;
		} );
		
		
		_api_register( 'row().node()', function () {
			var ctx = this.context;
		
			return ctx.length && this.length ?
				ctx[0].aoData[ this[0] ].nTr || null :
				null;
		} );
		
		
		_api_register( 'row.add()', function ( row ) {
			// Allow a jQuery object to be passed in - only a single row is added from
			// it though - the first element in the set
			if ( row instanceof $ && row.length ) {
				row = row[0];
			}
		
			var rows = this.iterator( 'table', function ( settings ) {
				if ( row.nodeName && row.nodeName.toUpperCase() === 'TR' ) {
					return _fnAddTr( settings, row )[0];
				}
				return _fnAddData( settings, row );
			} );
		
			// Return an Api.rows() extended instance, with the newly added row selected
			return this.row( rows[0] );
		} );
		
		
		
		var __details_add = function ( ctx, row, data, klass )
		{
			// Convert to array of TR elements
			var rows = [];
			var addRow = function ( r, k ) {
				// Recursion to allow for arrays of jQuery objects
				if ( $.isArray( r ) || r instanceof $ ) {
					for ( var i=0, ien=r.length ; i<ien ; i++ ) {
						addRow( r[i], k );
					}
					return;
				}
		
				// If we get a TR element, then just add it directly - up to the dev
				// to add the correct number of columns etc
				if ( r.nodeName && r.nodeName.toLowerCase() === 'tr' ) {
					rows.push( r );
				}
				else {
					// Otherwise create a row with a wrapper
					var created = $('<tr><td/></tr>').addClass( k );
					$('td', created)
						.addClass( k )
						.html( r )
						[0].colSpan = _fnVisbleColumns( ctx );
		
					rows.push( created[0] );
				}
			};
		
			addRow( data, klass );
		
			if ( row._details ) {
				row._details.detach();
			}
		
			row._details = $(rows);
		
			// If the children were already shown, that state should be retained
			if ( row._detailsShow ) {
				row._details.insertAfter( row.nTr );
			}
		};
		
		
		var __details_remove = function ( api, idx )
		{
			var ctx = api.context;
		
			if ( ctx.length ) {
				var row = ctx[0].aoData[ idx !== undefined ? idx : api[0] ];
		
				if ( row && row._details ) {
					row._details.remove();
		
					row._detailsShow = undefined;
					row._details = undefined;
				}
			}
		};
		
		
		var __details_display = function ( api, show ) {
			var ctx = api.context;
		
			if ( ctx.length && api.length ) {
				var row = ctx[0].aoData[ api[0] ];
		
				if ( row._details ) {
					row._detailsShow = show;
		
					if ( show ) {
						row._details.insertAfter( row.nTr );
					}
					else {
						row._details.detach();
					}
		
					__details_events( ctx[0] );
				}
			}
		};
		
		
		var __details_events = function ( settings )
		{
			var api = new _Api( settings );
			var namespace = '.dt.DT_details';
			var drawEvent = 'draw'+namespace;
			var colvisEvent = 'column-visibility'+namespace;
			var destroyEvent = 'destroy'+namespace;
			var data = settings.aoData;
		
			api.off( drawEvent +' '+ colvisEvent +' '+ destroyEvent );
		
			if ( _pluck( data, '_details' ).length > 0 ) {
				// On each draw, insert the required elements into the document
				api.on( drawEvent, function ( e, ctx ) {
					if ( settings !== ctx ) {
						return;
					}
		
					api.rows( {page:'current'} ).eq(0).each( function (idx) {
						// Internal data grab
						var row = data[ idx ];
		
						if ( row._detailsShow ) {
							row._details.insertAfter( row.nTr );
						}
					} );
				} );
		
				// Column visibility change - update the colspan
				api.on( colvisEvent, function ( e, ctx, idx, vis ) {
					if ( settings !== ctx ) {
						return;
					}
		
					// Update the colspan for the details rows (note, only if it already has
					// a colspan)
					var row, visible = _fnVisbleColumns( ctx );
		
					for ( var i=0, ien=data.length ; i<ien ; i++ ) {
						row = data[i];
		
						if ( row._details ) {
							row._details.children('td[colspan]').attr('colspan', visible );
						}
					}
				} );
		
				// Table destroyed - nuke any child rows
				api.on( destroyEvent, function ( e, ctx ) {
					if ( settings !== ctx ) {
						return;
					}
		
					for ( var i=0, ien=data.length ; i<ien ; i++ ) {
						if ( data[i]._details ) {
							__details_remove( api, i );
						}
					}
				} );
			}
		};
		
		// Strings for the method names to help minification
		var _emp = '';
		var _child_obj = _emp+'row().child';
		var _child_mth = _child_obj+'()';
		
		// data can be:
		//  tr
		//  string
		//  jQuery or array of any of the above
		_api_register( _child_mth, function ( data, klass ) {
			var ctx = this.context;
		
			if ( data === undefined ) {
				// get
				return ctx.length && this.length ?
					ctx[0].aoData[ this[0] ]._details :
					undefined;
			}
			else if ( data === true ) {
				// show
				this.child.show();
			}
			else if ( data === false ) {
				// remove
				__details_remove( this );
			}
			else if ( ctx.length && this.length ) {
				// set
				__details_add( ctx[0], ctx[0].aoData[ this[0] ], data, klass );
			}
		
			return this;
		} );
		
		
		_api_register( [
			_child_obj+'.show()',
			_child_mth+'.show()' // only when `child()` was called with parameters (without
		], function ( show ) {   // it returns an object and this method is not executed)
			__details_display( this, true );
			return this;
		} );
		
		
		_api_register( [
			_child_obj+'.hide()',
			_child_mth+'.hide()' // only when `child()` was called with parameters (without
		], function () {         // it returns an object and this method is not executed)
			__details_display( this, false );
			return this;
		} );
		
		
		_api_register( [
			_child_obj+'.remove()',
			_child_mth+'.remove()' // only when `child()` was called with parameters (without
		], function () {           // it returns an object and this method is not executed)
			__details_remove( this );
			return this;
		} );
		
		
		_api_register( _child_obj+'.isShown()', function () {
			var ctx = this.context;
		
			if ( ctx.length && this.length ) {
				// _detailsShown as false or undefined will fall through to return false
				return ctx[0].aoData[ this[0] ]._detailsShow || false;
			}
			return false;
		} );
		
		
		
		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Columns
		 *
		 * {integer}           - column index (>=0 count from left, <0 count from right)
		 * "{integer}:visIdx"  - visible column index (i.e. translate to column index)  (>=0 count from left, <0 count from right)
		 * "{integer}:visible" - alias for {integer}:visIdx  (>=0 count from left, <0 count from right)
		 * "{string}:name"     - column name
		 * "{string}"          - jQuery selector on column header nodes
		 *
		 */
		
		// can be an array of these items, comma separated list, or an array of comma
		// separated lists
		
		var __re_column_selector = /^([^:]+):(name|visIdx|visible)$/;
		
		
		// r1 and r2 are redundant - but it means that the parameters match for the
		// iterator callback in columns().data()
		var __columnData = function ( settings, column, r1, r2, rows ) {
			var a = [];
			for ( var row=0, ien=rows.length ; row<ien ; row++ ) {
				a.push( _fnGetCellData( settings, rows[row], column ) );
			}
			return a;
		};
		
		
		var __column_selector = function ( settings, selector, opts )
		{
			var
				columns = settings.aoColumns,
				names = _pluck( columns, 'sName' ),
				nodes = _pluck( columns, 'nTh' );
		
			var run = function ( s ) {
				var selInt = _intVal( s );
		
				// Selector - all
				if ( s === '' ) {
					return _range( columns.length );
				}
		
				// Selector - index
				if ( selInt !== null ) {
					return [ selInt >= 0 ?
						selInt : // Count from left
						columns.length + selInt // Count from right (+ because its a negative value)
					];
				}
		
				// Selector = function
				if ( typeof s === 'function' ) {
					var rows = _selector_row_indexes( settings, opts );
		
					return $.map( columns, function (col, idx) {
						return s(
								idx,
								__columnData( settings, idx, 0, 0, rows ),
								nodes[ idx ]
							) ? idx : null;
					} );
				}
		
				// jQuery or string selector
				var match = typeof s === 'string' ?
					s.match( __re_column_selector ) :
					'';
		
				if ( match ) {
					switch( match[2] ) {
						case 'visIdx':
						case 'visible':
							var idx = parseInt( match[1], 10 );
							// Visible index given, convert to column index
							if ( idx < 0 ) {
								// Counting from the right
								var visColumns = $.map( columns, function (col,i) {
									return col.bVisible ? i : null;
								} );
								return [ visColumns[ visColumns.length + idx ] ];
							}
							// Counting from the left
							return [ _fnVisibleToColumnIndex( settings, idx ) ];
		
						case 'name':
							// match by name. `names` is column index complete and in order
							return $.map( names, function (name, i) {
								return name === match[1] ? i : null;
							} );
		
						default:
							return [];
					}
				}
		
				// Cell in the table body
				if ( s.nodeName && s._DT_CellIndex ) {
					return [ s._DT_CellIndex.column ];
				}
		
				// jQuery selector on the TH elements for the columns
				var jqResult = $( nodes )
					.filter( s )
					.map( function () {
						return $.inArray( this, nodes ); // `nodes` is column index complete and in order
					} )
					.toArray();
		
				if ( jqResult.length || ! s.nodeName ) {
					return jqResult;
				}
		
				// Otherwise a node which might have a `dt-column` data attribute, or be
				// a child or such an element
				var host = $(s).closest('*[data-dt-column]');
				return host.length ?
					[ host.data('dt-column') ] :
					[];
			};
		
			return _selector_run( 'column', selector, run, settings, opts );
		};
		
		
		var __setColumnVis = function ( settings, column, vis ) {
			var
				cols = settings.aoColumns,
				col  = cols[ column ],
				data = settings.aoData,
				row, cells, i, ien, tr;
		
			// Get
			if ( vis === undefined ) {
				return col.bVisible;
			}
		
			// Set
			// No change
			if ( col.bVisible === vis ) {
				return;
			}
		
			if ( vis ) {
				// Insert column
				// Need to decide if we should use appendChild or insertBefore
				var insertBefore = $.inArray( true, _pluck(cols, 'bVisible'), column+1 );
		
				for ( i=0, ien=data.length ; i<ien ; i++ ) {
					tr = data[i].nTr;
					cells = data[i].anCells;
		
					if ( tr ) {
						// insertBefore can act like appendChild if 2nd arg is null
						tr.insertBefore( cells[ column ], cells[ insertBefore ] || null );
					}
				}
			}
			else {
				// Remove column
				$( _pluck( settings.aoData, 'anCells', column ) ).detach();
			}
		
			// Common actions
			col.bVisible = vis;
			_fnDrawHead( settings, settings.aoHeader );
			_fnDrawHead( settings, settings.aoFooter );
		
			_fnSaveState( settings );
		};
		
		
		_api_register( 'columns()', function ( selector, opts ) {
			// argument shifting
			if ( selector === undefined ) {
				selector = '';
			}
			else if ( $.isPlainObject( selector ) ) {
				opts = selector;
				selector = '';
			}
		
			opts = _selector_opts( opts );
		
			var inst = this.iterator( 'table', function ( settings ) {
				return __column_selector( settings, selector, opts );
			}, 1 );
		
			// Want argument shifting here and in _row_selector?
			inst.selector.cols = selector;
			inst.selector.opts = opts;
		
			return inst;
		} );
		
		_api_registerPlural( 'columns().header()', 'column().header()', function ( selector, opts ) {
			return this.iterator( 'column', function ( settings, column ) {
				return settings.aoColumns[column].nTh;
			}, 1 );
		} );
		
		_api_registerPlural( 'columns().footer()', 'column().footer()', function ( selector, opts ) {
			return this.iterator( 'column', function ( settings, column ) {
				return settings.aoColumns[column].nTf;
			}, 1 );
		} );
		
		_api_registerPlural( 'columns().data()', 'column().data()', function () {
			return this.iterator( 'column-rows', __columnData, 1 );
		} );
		
		_api_registerPlural( 'columns().dataSrc()', 'column().dataSrc()', function () {
			return this.iterator( 'column', function ( settings, column ) {
				return settings.aoColumns[column].mData;
			}, 1 );
		} );
		
		_api_registerPlural( 'columns().cache()', 'column().cache()', function ( type ) {
			return this.iterator( 'column-rows', function ( settings, column, i, j, rows ) {
				return _pluck_order( settings.aoData, rows,
					type === 'search' ? '_aFilterData' : '_aSortData', column
				);
			}, 1 );
		} );
		
		_api_registerPlural( 'columns().nodes()', 'column().nodes()', function () {
			return this.iterator( 'column-rows', function ( settings, column, i, j, rows ) {
				return _pluck_order( settings.aoData, rows, 'anCells', column ) ;
			}, 1 );
		} );
		
		_api_registerPlural( 'columns().visible()', 'column().visible()', function ( vis, calc ) {
			var ret = this.iterator( 'column', function ( settings, column ) {
				if ( vis === undefined ) {
					return settings.aoColumns[ column ].bVisible;
				} // else
				__setColumnVis( settings, column, vis );
			} );
		
			// Group the column visibility changes
			if ( vis !== undefined ) {
				// Second loop once the first is done for events
				this.iterator( 'column', function ( settings, column ) {
					_fnCallbackFire( settings, null, 'column-visibility', [settings, column, vis, calc] );
				} );
		
				if ( calc === undefined || calc ) {
					this.columns.adjust();
				}
			}
		
			return ret;
		} );
		
		_api_registerPlural( 'columns().indexes()', 'column().index()', function ( type ) {
			return this.iterator( 'column', function ( settings, column ) {
				return type === 'visible' ?
					_fnColumnIndexToVisible( settings, column ) :
					column;
			}, 1 );
		} );
		
		_api_register( 'columns.adjust()', function () {
			return this.iterator( 'table', function ( settings ) {
				_fnAdjustColumnSizing( settings );
			}, 1 );
		} );
		
		_api_register( 'column.index()', function ( type, idx ) {
			if ( this.context.length !== 0 ) {
				var ctx = this.context[0];
		
				if ( type === 'fromVisible' || type === 'toData' ) {
					return _fnVisibleToColumnIndex( ctx, idx );
				}
				else if ( type === 'fromData' || type === 'toVisible' ) {
					return _fnColumnIndexToVisible( ctx, idx );
				}
			}
		} );
		
		_api_register( 'column()', function ( selector, opts ) {
			return _selector_first( this.columns( selector, opts ) );
		} );
		
		
		
		var __cell_selector = function ( settings, selector, opts )
		{
			var data = settings.aoData;
			var rows = _selector_row_indexes( settings, opts );
			var cells = _removeEmpty( _pluck_order( data, rows, 'anCells' ) );
			var allCells = $( [].concat.apply([], cells) );
			var row;
			var columns = settings.aoColumns.length;
			var a, i, ien, j, o, host;
		
			var run = function ( s ) {
				var fnSelector = typeof s === 'function';
		
				if ( s === null || s === undefined || fnSelector ) {
					// All cells and function selectors
					a = [];
		
					for ( i=0, ien=rows.length ; i<ien ; i++ ) {
						row = rows[i];
		
						for ( j=0 ; j<columns ; j++ ) {
							o = {
								row: row,
								column: j
							};
		
							if ( fnSelector ) {
								// Selector - function
								host = data[ row ];
		
								if ( s( o, _fnGetCellData(settings, row, j), host.anCells ? host.anCells[j] : null ) ) {
									a.push( o );
								}
							}
							else {
								// Selector - all
								a.push( o );
							}
						}
					}
		
					return a;
				}
				
				// Selector - index
				if ( $.isPlainObject( s ) ) {
					return [s];
				}
		
				// Selector - jQuery filtered cells
				var jqResult = allCells
					.filter( s )
					.map( function (i, el) {
						return { // use a new object, in case someone changes the values
							row:    el._DT_CellIndex.row,
							column: el._DT_CellIndex.column
		 				};
					} )
					.toArray();
		
				if ( jqResult.length || ! s.nodeName ) {
					return jqResult;
				}
		
				// Otherwise the selector is a node, and there is one last option - the
				// element might be a child of an element which has dt-row and dt-column
				// data attributes
				host = $(s).closest('*[data-dt-row]');
				return host.length ?
					[ {
						row: host.data('dt-row'),
						column: host.data('dt-column')
					} ] :
					[];
			};
		
			return _selector_run( 'cell', selector, run, settings, opts );
		};
		
		
		
		
		_api_register( 'cells()', function ( rowSelector, columnSelector, opts ) {
			// Argument shifting
			if ( $.isPlainObject( rowSelector ) ) {
				// Indexes
				if ( rowSelector.row === undefined ) {
					// Selector options in first parameter
					opts = rowSelector;
					rowSelector = null;
				}
				else {
					// Cell index objects in first parameter
					opts = columnSelector;
					columnSelector = null;
				}
			}
			if ( $.isPlainObject( columnSelector ) ) {
				opts = columnSelector;
				columnSelector = null;
			}
		
			// Cell selector
			if ( columnSelector === null || columnSelector === undefined ) {
				return this.iterator( 'table', function ( settings ) {
					return __cell_selector( settings, rowSelector, _selector_opts( opts ) );
				} );
			}
		
			// Row + column selector
			var columns = this.columns( columnSelector, opts );
			var rows = this.rows( rowSelector, opts );
			var a, i, ien, j, jen;
		
			var cells = this.iterator( 'table', function ( settings, idx ) {
				a = [];
		
				for ( i=0, ien=rows[idx].length ; i<ien ; i++ ) {
					for ( j=0, jen=columns[idx].length ; j<jen ; j++ ) {
						a.push( {
							row:    rows[idx][i],
							column: columns[idx][j]
						} );
					}
				}
		
				return a;
			}, 1 );
		
			$.extend( cells.selector, {
				cols: columnSelector,
				rows: rowSelector,
				opts: opts
			} );
		
			return cells;
		} );
		
		
		_api_registerPlural( 'cells().nodes()', 'cell().node()', function () {
			return this.iterator( 'cell', function ( settings, row, column ) {
				var data = settings.aoData[ row ];
		
				return data && data.anCells ?
					data.anCells[ column ] :
					undefined;
			}, 1 );
		} );
		
		
		_api_register( 'cells().data()', function () {
			return this.iterator( 'cell', function ( settings, row, column ) {
				return _fnGetCellData( settings, row, column );
			}, 1 );
		} );
		
		
		_api_registerPlural( 'cells().cache()', 'cell().cache()', function ( type ) {
			type = type === 'search' ? '_aFilterData' : '_aSortData';
		
			return this.iterator( 'cell', function ( settings, row, column ) {
				return settings.aoData[ row ][ type ][ column ];
			}, 1 );
		} );
		
		
		_api_registerPlural( 'cells().render()', 'cell().render()', function ( type ) {
			return this.iterator( 'cell', function ( settings, row, column ) {
				return _fnGetCellData( settings, row, column, type );
			}, 1 );
		} );
		
		
		_api_registerPlural( 'cells().indexes()', 'cell().index()', function () {
			return this.iterator( 'cell', function ( settings, row, column ) {
				return {
					row: row,
					column: column,
					columnVisible: _fnColumnIndexToVisible( settings, column )
				};
			}, 1 );
		} );
		
		
		_api_registerPlural( 'cells().invalidate()', 'cell().invalidate()', function ( src ) {
			return this.iterator( 'cell', function ( settings, row, column ) {
				_fnInvalidate( settings, row, src, column );
			} );
		} );
		
		
		
		_api_register( 'cell()', function ( rowSelector, columnSelector, opts ) {
			return _selector_first( this.cells( rowSelector, columnSelector, opts ) );
		} );
		
		
		_api_register( 'cell().data()', function ( data ) {
			var ctx = this.context;
			var cell = this[0];
		
			if ( data === undefined ) {
				// Get
				return ctx.length && cell.length ?
					_fnGetCellData( ctx[0], cell[0].row, cell[0].column ) :
					undefined;
			}
		
			// Set
			_fnSetCellData( ctx[0], cell[0].row, cell[0].column, data );
			_fnInvalidate( ctx[0], cell[0].row, 'data', cell[0].column );
		
			return this;
		} );
		
		
		
		/**
		 * Get current ordering (sorting) that has been applied to the table.
		 *
		 * @returns {array} 2D array containing the sorting information for the first
		 *   table in the current context. Each element in the parent array represents
		 *   a column being sorted upon (i.e. multi-sorting with two columns would have
		 *   2 inner arrays). The inner arrays may have 2 or 3 elements. The first is
		 *   the column index that the sorting condition applies to, the second is the
		 *   direction of the sort (`desc` or `asc`) and, optionally, the third is the
		 *   index of the sorting order from the `column.sorting` initialisation array.
		 *//**
		 * Set the ordering for the table.
		 *
		 * @param {integer} order Column index to sort upon.
		 * @param {string} direction Direction of the sort to be applied (`asc` or `desc`)
		 * @returns {DataTables.Api} this
		 *//**
		 * Set the ordering for the table.
		 *
		 * @param {array} order 1D array of sorting information to be applied.
		 * @param {array} [...] Optional additional sorting conditions
		 * @returns {DataTables.Api} this
		 *//**
		 * Set the ordering for the table.
		 *
		 * @param {array} order 2D array of sorting information to be applied.
		 * @returns {DataTables.Api} this
		 */
		_api_register( 'order()', function ( order, dir ) {
			var ctx = this.context;
		
			if ( order === undefined ) {
				// get
				return ctx.length !== 0 ?
					ctx[0].aaSorting :
					undefined;
			}
		
			// set
			if ( typeof order === 'number' ) {
				// Simple column / direction passed in
				order = [ [ order, dir ] ];
			}
			else if ( order.length && ! $.isArray( order[0] ) ) {
				// Arguments passed in (list of 1D arrays)
				order = Array.prototype.slice.call( arguments );
			}
			// otherwise a 2D array was passed in
		
			return this.iterator( 'table', function ( settings ) {
				settings.aaSorting = order.slice();
			} );
		} );
		
		
		/**
		 * Attach a sort listener to an element for a given column
		 *
		 * @param {node|jQuery|string} node Identifier for the element(s) to attach the
		 *   listener to. This can take the form of a single DOM node, a jQuery
		 *   collection of nodes or a jQuery selector which will identify the node(s).
		 * @param {integer} column the column that a click on this node will sort on
		 * @param {function} [callback] callback function when sort is run
		 * @returns {DataTables.Api} this
		 */
		_api_register( 'order.listener()', function ( node, column, callback ) {
			return this.iterator( 'table', function ( settings ) {
				_fnSortAttachListener( settings, node, column, callback );
			} );
		} );
		
		
		_api_register( 'order.fixed()', function ( set ) {
			if ( ! set ) {
				var ctx = this.context;
				var fixed = ctx.length ?
					ctx[0].aaSortingFixed :
					undefined;
		
				return $.isArray( fixed ) ?
					{ pre: fixed } :
					fixed;
			}
		
			return this.iterator( 'table', function ( settings ) {
				settings.aaSortingFixed = $.extend( true, {}, set );
			} );
		} );
		
		
		// Order by the selected column(s)
		_api_register( [
			'columns().order()',
			'column().order()'
		], function ( dir ) {
			var that = this;
		
			return this.iterator( 'table', function ( settings, i ) {
				var sort = [];
		
				$.each( that[i], function (j, col) {
					sort.push( [ col, dir ] );
				} );
		
				settings.aaSorting = sort;
			} );
		} );
		
		
		
		_api_register( 'search()', function ( input, regex, smart, caseInsen ) {
			var ctx = this.context;
		
			if ( input === undefined ) {
				// get
				return ctx.length !== 0 ?
					ctx[0].oPreviousSearch.sSearch :
					undefined;
			}
		
			// set
			return this.iterator( 'table', function ( settings ) {
				if ( ! settings.oFeatures.bFilter ) {
					return;
				}
		
				_fnFilterComplete( settings, $.extend( {}, settings.oPreviousSearch, {
					"sSearch": input+"",
					"bRegex":  regex === null ? false : regex,
					"bSmart":  smart === null ? true  : smart,
					"bCaseInsensitive": caseInsen === null ? true : caseInsen
				} ), 1 );
			} );
		} );
		
		
		_api_registerPlural(
			'columns().search()',
			'column().search()',
			function ( input, regex, smart, caseInsen ) {
				return this.iterator( 'column', function ( settings, column ) {
					var preSearch = settings.aoPreSearchCols;
		
					if ( input === undefined ) {
						// get
						return preSearch[ column ].sSearch;
					}
		
					// set
					if ( ! settings.oFeatures.bFilter ) {
						return;
					}
		
					$.extend( preSearch[ column ], {
						"sSearch": input+"",
						"bRegex":  regex === null ? false : regex,
						"bSmart":  smart === null ? true  : smart,
						"bCaseInsensitive": caseInsen === null ? true : caseInsen
					} );
		
					_fnFilterComplete( settings, settings.oPreviousSearch, 1 );
				} );
			}
		);
		
		/*
		 * State API methods
		 */
		
		_api_register( 'state()', function () {
			return this.context.length ?
				this.context[0].oSavedState :
				null;
		} );
		
		
		_api_register( 'state.clear()', function () {
			return this.iterator( 'table', function ( settings ) {
				// Save an empty object
				settings.fnStateSaveCallback.call( settings.oInstance, settings, {} );
			} );
		} );
		
		
		_api_register( 'state.loaded()', function () {
			return this.context.length ?
				this.context[0].oLoadedState :
				null;
		} );
		
		
		_api_register( 'state.save()', function () {
			return this.iterator( 'table', function ( settings ) {
				_fnSaveState( settings );
			} );
		} );
		
		
		
		/**
		 * Provide a common method for plug-ins to check the version of DataTables being
		 * used, in order to ensure compatibility.
		 *
		 *  @param {string} version Version string to check for, in the format "X.Y.Z".
		 *    Note that the formats "X" and "X.Y" are also acceptable.
		 *  @returns {boolean} true if this version of DataTables is greater or equal to
		 *    the required version, or false if this version of DataTales is not
		 *    suitable
		 *  @static
		 *  @dtopt API-Static
		 *
		 *  @example
		 *    alert( $.fn.dataTable.versionCheck( '1.9.0' ) );
		 */
		DataTable.versionCheck = DataTable.fnVersionCheck = function( version )
		{
			var aThis = DataTable.version.split('.');
			var aThat = version.split('.');
			var iThis, iThat;
		
			for ( var i=0, iLen=aThat.length ; i<iLen ; i++ ) {
				iThis = parseInt( aThis[i], 10 ) || 0;
				iThat = parseInt( aThat[i], 10 ) || 0;
		
				// Parts are the same, keep comparing
				if (iThis === iThat) {
					continue;
				}
		
				// Parts are different, return immediately
				return iThis > iThat;
			}
		
			return true;
		};
		
		
		/**
		 * Check if a `<table>` node is a DataTable table already or not.
		 *
		 *  @param {node|jquery|string} table Table node, jQuery object or jQuery
		 *      selector for the table to test. Note that if more than more than one
		 *      table is passed on, only the first will be checked
		 *  @returns {boolean} true the table given is a DataTable, or false otherwise
		 *  @static
		 *  @dtopt API-Static
		 *
		 *  @example
		 *    if ( ! $.fn.DataTable.isDataTable( '#example' ) ) {
		 *      $('#example').dataTable();
		 *    }
		 */
		DataTable.isDataTable = DataTable.fnIsDataTable = function ( table )
		{
			var t = $(table).get(0);
			var is = false;
		
			if ( table instanceof DataTable.Api ) {
				return true;
			}
		
			$.each( DataTable.settings, function (i, o) {
				var head = o.nScrollHead ? $('table', o.nScrollHead)[0] : null;
				var foot = o.nScrollFoot ? $('table', o.nScrollFoot)[0] : null;
		
				if ( o.nTable === t || head === t || foot === t ) {
					is = true;
				}
			} );
		
			return is;
		};
		
		
		/**
		 * Get all DataTable tables that have been initialised - optionally you can
		 * select to get only currently visible tables.
		 *
		 *  @param {boolean} [visible=false] Flag to indicate if you want all (default)
		 *    or visible tables only.
		 *  @returns {array} Array of `table` nodes (not DataTable instances) which are
		 *    DataTables
		 *  @static
		 *  @dtopt API-Static
		 *
		 *  @example
		 *    $.each( $.fn.dataTable.tables(true), function () {
		 *      $(table).DataTable().columns.adjust();
		 *    } );
		 */
		DataTable.tables = DataTable.fnTables = function ( visible )
		{
			var api = false;
		
			if ( $.isPlainObject( visible ) ) {
				api = visible.api;
				visible = visible.visible;
			}
		
			var a = $.map( DataTable.settings, function (o) {
				if ( !visible || (visible && $(o.nTable).is(':visible')) ) {
					return o.nTable;
				}
			} );
		
			return api ?
				new _Api( a ) :
				a;
		};
		
		
		/**
		 * Convert from camel case parameters to Hungarian notation. This is made public
		 * for the extensions to provide the same ability as DataTables core to accept
		 * either the 1.9 style Hungarian notation, or the 1.10+ style camelCase
		 * parameters.
		 *
		 *  @param {object} src The model object which holds all parameters that can be
		 *    mapped.
		 *  @param {object} user The object to convert from camel case to Hungarian.
		 *  @param {boolean} force When set to `true`, properties which already have a
		 *    Hungarian value in the `user` object will be overwritten. Otherwise they
		 *    won't be.
		 */
		DataTable.camelToHungarian = _fnCamelToHungarian;
		
		
		
		/**
		 *
		 */
		_api_register( '$()', function ( selector, opts ) {
			var
				rows   = this.rows( opts ).nodes(), // Get all rows
				jqRows = $(rows);
		
			return $( [].concat(
				jqRows.filter( selector ).toArray(),
				jqRows.find( selector ).toArray()
			) );
		} );
		
		
		// jQuery functions to operate on the tables
		$.each( [ 'on', 'one', 'off' ], function (i, key) {
			_api_register( key+'()', function ( /* event, handler */ ) {
				var args = Array.prototype.slice.call(arguments);
		
				// Add the `dt` namespace automatically if it isn't already present
				args[0] = $.map( args[0].split( /\s/ ), function ( e ) {
					return ! e.match(/\.dt\b/) ?
						e+'.dt' :
						e;
					} ).join( ' ' );
		
				var inst = $( this.tables().nodes() );
				inst[key].apply( inst, args );
				return this;
			} );
		} );
		
		
		_api_register( 'clear()', function () {
			return this.iterator( 'table', function ( settings ) {
				_fnClearTable( settings );
			} );
		} );
		
		
		_api_register( 'settings()', function () {
			return new _Api( this.context, this.context );
		} );
		
		
		_api_register( 'init()', function () {
			var ctx = this.context;
			return ctx.length ? ctx[0].oInit : null;
		} );
		
		
		_api_register( 'data()', function () {
			return this.iterator( 'table', function ( settings ) {
				return _pluck( settings.aoData, '_aData' );
			} ).flatten();
		} );
		
		
		_api_register( 'destroy()', function ( remove ) {
			remove = remove || false;
		
			return this.iterator( 'table', function ( settings ) {
				var orig      = settings.nTableWrapper.parentNode;
				var classes   = settings.oClasses;
				var table     = settings.nTable;
				var tbody     = settings.nTBody;
				var thead     = settings.nTHead;
				var tfoot     = settings.nTFoot;
				var jqTable   = $(table);
				var jqTbody   = $(tbody);
				var jqWrapper = $(settings.nTableWrapper);
				var rows      = $.map( settings.aoData, function (r) { return r.nTr; } );
				var i, ien;
		
				// Flag to note that the table is currently being destroyed - no action
				// should be taken
				settings.bDestroying = true;
		
				// Fire off the destroy callbacks for plug-ins etc
				_fnCallbackFire( settings, "aoDestroyCallback", "destroy", [settings] );
		
				// If not being removed from the document, make all columns visible
				if ( ! remove ) {
					new _Api( settings ).columns().visible( true );
				}
		
				// Blitz all `DT` namespaced events (these are internal events, the
				// lowercase, `dt` events are user subscribed and they are responsible
				// for removing them
				jqWrapper.off('.DT').find(':not(tbody *)').off('.DT');
				$(window).off('.DT-'+settings.sInstance);
		
				// When scrolling we had to break the table up - restore it
				if ( table != thead.parentNode ) {
					jqTable.children('thead').detach();
					jqTable.append( thead );
				}
		
				if ( tfoot && table != tfoot.parentNode ) {
					jqTable.children('tfoot').detach();
					jqTable.append( tfoot );
				}
		
				settings.aaSorting = [];
				settings.aaSortingFixed = [];
				_fnSortingClasses( settings );
		
				$( rows ).removeClass( settings.asStripeClasses.join(' ') );
		
				$('th, td', thead).removeClass( classes.sSortable+' '+
					classes.sSortableAsc+' '+classes.sSortableDesc+' '+classes.sSortableNone
				);
		
				if ( settings.bJUI ) {
					$('th span.'+classes.sSortIcon+ ', td span.'+classes.sSortIcon, thead).detach();
					$('th, td', thead).each( function () {
						var wrapper = $('div.'+classes.sSortJUIWrapper, this);
						$(this).append( wrapper.contents() );
						wrapper.detach();
					} );
				}
		
				// Add the TR elements back into the table in their original order
				jqTbody.children().detach();
				jqTbody.append( rows );
		
				// Remove the DataTables generated nodes, events and classes
				var removedMethod = remove ? 'remove' : 'detach';
				jqTable[ removedMethod ]();
				jqWrapper[ removedMethod ]();
		
				// If we need to reattach the table to the document
				if ( ! remove && orig ) {
					// insertBefore acts like appendChild if !arg[1]
					orig.insertBefore( table, settings.nTableReinsertBefore );
		
					// Restore the width of the original table - was read from the style property,
					// so we can restore directly to that
					jqTable
						.css( 'width', settings.sDestroyWidth )
						.removeClass( classes.sTable );
		
					// If the were originally stripe classes - then we add them back here.
					// Note this is not fool proof (for example if not all rows had stripe
					// classes - but it's a good effort without getting carried away
					ien = settings.asDestroyStripes.length;
		
					if ( ien ) {
						jqTbody.children().each( function (i) {
							$(this).addClass( settings.asDestroyStripes[i % ien] );
						} );
					}
				}
		
				/* Remove the settings object from the settings array */
				var idx = $.inArray( settings, DataTable.settings );
				if ( idx !== -1 ) {
					DataTable.settings.splice( idx, 1 );
				}
			} );
		} );
		
		
		// Add the `every()` method for rows, columns and cells in a compact form
		$.each( [ 'column', 'row', 'cell' ], function ( i, type ) {
			_api_register( type+'s().every()', function ( fn ) {
				var opts = this.selector.opts;
				var api = this;
		
				return this.iterator( type, function ( settings, arg1, arg2, arg3, arg4 ) {
					// Rows and columns:
					//  arg1 - index
					//  arg2 - table counter
					//  arg3 - loop counter
					//  arg4 - undefined
					// Cells:
					//  arg1 - row index
					//  arg2 - column index
					//  arg3 - table counter
					//  arg4 - loop counter
					fn.call(
						api[ type ](
							arg1,
							type==='cell' ? arg2 : opts,
							type==='cell' ? opts : undefined
						),
						arg1, arg2, arg3, arg4
					);
				} );
			} );
		} );
		
		
		// i18n method for extensions to be able to use the language object from the
		// DataTable
		_api_register( 'i18n()', function ( token, def, plural ) {
			var ctx = this.context[0];
			var resolved = _fnGetObjectDataFn( token )( ctx.oLanguage );
		
			if ( resolved === undefined ) {
				resolved = def;
			}
		
			if ( plural !== undefined && $.isPlainObject( resolved ) ) {
				resolved = resolved[ plural ] !== undefined ?
					resolved[ plural ] :
					resolved._;
			}
		
			return resolved.replace( '%d', plural ); // nb: plural might be undefined,
		} );
		/**
		 * Version string for plug-ins to check compatibility. Allowed format is
		 * `a.b.c-d` where: a:int, b:int, c:int, d:string(dev|beta|alpha). `d` is used
		 * only for non-release builds. See http://semver.org/ for more information.
		 *  @member
		 *  @type string
		 *  @default Version number
		 */
		DataTable.version = "1.10.15";

		/**
		 * Private data store, containing all of the settings objects that are
		 * created for the tables on a given page.
		 *
		 * Note that the `DataTable.settings` object is aliased to
		 * `jQuery.fn.dataTableExt` through which it may be accessed and
		 * manipulated, or `jQuery.fn.dataTable.settings`.
		 *  @member
		 *  @type array
		 *  @default []
		 *  @private
		 */
		DataTable.settings = [];

		/**
		 * Object models container, for the various models that DataTables has
		 * available to it. These models define the objects that are used to hold
		 * the active state and configuration of the table.
		 *  @namespace
		 */
		DataTable.models = {};
		
		
		
		/**
		 * Template object for the way in which DataTables holds information about
		 * search information for the global filter and individual column filters.
		 *  @namespace
		 */
		DataTable.models.oSearch = {
			/**
			 * Flag to indicate if the filtering should be case insensitive or not
			 *  @type boolean
			 *  @default true
			 */
			"bCaseInsensitive": true,
		
			/**
			 * Applied search term
			 *  @type string
			 *  @default <i>Empty string</i>
			 */
			"sSearch": "",
		
			/**
			 * Flag to indicate if the search term should be interpreted as a
			 * regular expression (true) or not (false) and therefore and special
			 * regex characters escaped.
			 *  @type boolean
			 *  @default false
			 */
			"bRegex": false,
		
			/**
			 * Flag to indicate if DataTables is to use its smart filtering or not.
			 *  @type boolean
			 *  @default true
			 */
			"bSmart": true
		};
		
		
		
		
		/**
		 * Template object for the way in which DataTables holds information about
		 * each individual row. This is the object format used for the settings
		 * aoData array.
		 *  @namespace
		 */
		DataTable.models.oRow = {
			/**
			 * TR element for the row
			 *  @type node
			 *  @default null
			 */
			"nTr": null,
		
			/**
			 * Array of TD elements for each row. This is null until the row has been
			 * created.
			 *  @type array nodes
			 *  @default []
			 */
			"anCells": null,
		
			/**
			 * Data object from the original data source for the row. This is either
			 * an array if using the traditional form of DataTables, or an object if
			 * using mData options. The exact type will depend on the passed in
			 * data from the data source, or will be an array if using DOM a data
			 * source.
			 *  @type array|object
			 *  @default []
			 */
			"_aData": [],
		
			/**
			 * Sorting data cache - this array is ostensibly the same length as the
			 * number of columns (although each index is generated only as it is
			 * needed), and holds the data that is used for sorting each column in the
			 * row. We do this cache generation at the start of the sort in order that
			 * the formatting of the sort data need be done only once for each cell
			 * per sort. This array should not be read from or written to by anything
			 * other than the master sorting methods.
			 *  @type array
			 *  @default null
			 *  @private
			 */
			"_aSortData": null,
		
			/**
			 * Per cell filtering data cache. As per the sort data cache, used to
			 * increase the performance of the filtering in DataTables
			 *  @type array
			 *  @default null
			 *  @private
			 */
			"_aFilterData": null,
		
			/**
			 * Filtering data cache. This is the same as the cell filtering cache, but
			 * in this case a string rather than an array. This is easily computed with
			 * a join on `_aFilterData`, but is provided as a cache so the join isn't
			 * needed on every search (memory traded for performance)
			 *  @type array
			 *  @default null
			 *  @private
			 */
			"_sFilterRow": null,
		
			/**
			 * Cache of the class name that DataTables has applied to the row, so we
			 * can quickly look at this variable rather than needing to do a DOM check
			 * on className for the nTr property.
			 *  @type string
			 *  @default <i>Empty string</i>
			 *  @private
			 */
			"_sRowStripe": "",
		
			/**
			 * Denote if the original data source was from the DOM, or the data source
			 * object. This is used for invalidating data, so DataTables can
			 * automatically read data from the original source, unless uninstructed
			 * otherwise.
			 *  @type string
			 *  @default null
			 *  @private
			 */
			"src": null,
		
			/**
			 * Index in the aoData array. This saves an indexOf lookup when we have the
			 * object, but want to know the index
			 *  @type integer
			 *  @default -1
			 *  @private
			 */
			"idx": -1
		};
		
		
		/**
		 * Template object for the column information object in DataTables. This object
		 * is held in the settings aoColumns array and contains all the information that
		 * DataTables needs about each individual column.
		 *
		 * Note that this object is related to {@link DataTable.defaults.column}
		 * but this one is the internal data store for DataTables's cache of columns.
		 * It should NOT be manipulated outside of DataTables. Any configuration should
		 * be done through the initialisation options.
		 *  @namespace
		 */
		DataTable.models.oColumn = {
			/**
			 * Column index. This could be worked out on-the-fly with $.inArray, but it
			 * is faster to just hold it as a variable
			 *  @type integer
			 *  @default null
			 */
			"idx": null,
		
			/**
			 * A list of the columns that sorting should occur on when this column
			 * is sorted. That this property is an array allows multi-column sorting
			 * to be defined for a column (for example first name / last name columns
			 * would benefit from this). The values are integers pointing to the
			 * columns to be sorted on (typically it will be a single integer pointing
			 * at itself, but that doesn't need to be the case).
			 *  @type array
			 */
			"aDataSort": null,
		
			/**
			 * Define the sorting directions that are applied to the column, in sequence
			 * as the column is repeatedly sorted upon - i.e. the first value is used
			 * as the sorting direction when the column if first sorted (clicked on).
			 * Sort it again (click again) and it will move on to the next index.
			 * Repeat until loop.
			 *  @type array
			 */
			"asSorting": null,
		
			/**
			 * Flag to indicate if the column is searchable, and thus should be included
			 * in the filtering or not.
			 *  @type boolean
			 */
			"bSearchable": null,
		
			/**
			 * Flag to indicate if the column is sortable or not.
			 *  @type boolean
			 */
			"bSortable": null,
		
			/**
			 * Flag to indicate if the column is currently visible in the table or not
			 *  @type boolean
			 */
			"bVisible": null,
		
			/**
			 * Store for manual type assignment using the `column.type` option. This
			 * is held in store so we can manipulate the column's `sType` property.
			 *  @type string
			 *  @default null
			 *  @private
			 */
			"_sManualType": null,
		
			/**
			 * Flag to indicate if HTML5 data attributes should be used as the data
			 * source for filtering or sorting. True is either are.
			 *  @type boolean
			 *  @default false
			 *  @private
			 */
			"_bAttrSrc": false,
		
			/**
			 * Developer definable function that is called whenever a cell is created (Ajax source,
			 * etc) or processed for input (DOM source). This can be used as a compliment to mRender
			 * allowing you to modify the DOM element (add background colour for example) when the
			 * element is available.
			 *  @type function
			 *  @param {element} nTd The TD node that has been created
			 *  @param {*} sData The Data for the cell
			 *  @param {array|object} oData The data for the whole row
			 *  @param {int} iRow The row index for the aoData data store
			 *  @default null
			 */
			"fnCreatedCell": null,
		
			/**
			 * Function to get data from a cell in a column. You should <b>never</b>
			 * access data directly through _aData internally in DataTables - always use
			 * the method attached to this property. It allows mData to function as
			 * required. This function is automatically assigned by the column
			 * initialisation method
			 *  @type function
			 *  @param {array|object} oData The data array/object for the array
			 *    (i.e. aoData[]._aData)
			 *  @param {string} sSpecific The specific data type you want to get -
			 *    'display', 'type' 'filter' 'sort'
			 *  @returns {*} The data for the cell from the given row's data
			 *  @default null
			 */
			"fnGetData": null,
		
			/**
			 * Function to set data for a cell in the column. You should <b>never</b>
			 * set the data directly to _aData internally in DataTables - always use
			 * this method. It allows mData to function as required. This function
			 * is automatically assigned by the column initialisation method
			 *  @type function
			 *  @param {array|object} oData The data array/object for the array
			 *    (i.e. aoData[]._aData)
			 *  @param {*} sValue Value to set
			 *  @default null
			 */
			"fnSetData": null,
		
			/**
			 * Property to read the value for the cells in the column from the data
			 * source array / object. If null, then the default content is used, if a
			 * function is given then the return from the function is used.
			 *  @type function|int|string|null
			 *  @default null
			 */
			"mData": null,
		
			/**
			 * Partner property to mData which is used (only when defined) to get
			 * the data - i.e. it is basically the same as mData, but without the
			 * 'set' option, and also the data fed to it is the result from mData.
			 * This is the rendering method to match the data method of mData.
			 *  @type function|int|string|null
			 *  @default null
			 */
			"mRender": null,
		
			/**
			 * Unique header TH/TD element for this column - this is what the sorting
			 * listener is attached to (if sorting is enabled.)
			 *  @type node
			 *  @default null
			 */
			"nTh": null,
		
			/**
			 * Unique footer TH/TD element for this column (if there is one). Not used
			 * in DataTables as such, but can be used for plug-ins to reference the
			 * footer for each column.
			 *  @type node
			 *  @default null
			 */
			"nTf": null,
		
			/**
			 * The class to apply to all TD elements in the table's TBODY for the column
			 *  @type string
			 *  @default null
			 */
			"sClass": null,
		
			/**
			 * When DataTables calculates the column widths to assign to each column,
			 * it finds the longest string in each column and then constructs a
			 * temporary table and reads the widths from that. The problem with this
			 * is that "mmm" is much wider then "iiii", but the latter is a longer
			 * string - thus the calculation can go wrong (doing it properly and putting
			 * it into an DOM object and measuring that is horribly(!) slow). Thus as
			 * a "work around" we provide this option. It will append its value to the
			 * text that is found to be the longest string for the column - i.e. padding.
			 *  @type string
			 */
			"sContentPadding": null,
		
			/**
			 * Allows a default value to be given for a column's data, and will be used
			 * whenever a null data source is encountered (this can be because mData
			 * is set to null, or because the data source itself is null).
			 *  @type string
			 *  @default null
			 */
			"sDefaultContent": null,
		
			/**
			 * Name for the column, allowing reference to the column by name as well as
			 * by index (needs a lookup to work by name).
			 *  @type string
			 */
			"sName": null,
		
			/**
			 * Custom sorting data type - defines which of the available plug-ins in
			 * afnSortData the custom sorting will use - if any is defined.
			 *  @type string
			 *  @default std
			 */
			"sSortDataType": 'std',
		
			/**
			 * Class to be applied to the header element when sorting on this column
			 *  @type string
			 *  @default null
			 */
			"sSortingClass": null,
		
			/**
			 * Class to be applied to the header element when sorting on this column -
			 * when jQuery UI theming is used.
			 *  @type string
			 *  @default null
			 */
			"sSortingClassJUI": null,
		
			/**
			 * Title of the column - what is seen in the TH element (nTh).
			 *  @type string
			 */
			"sTitle": null,
		
			/**
			 * Column sorting and filtering type
			 *  @type string
			 *  @default null
			 */
			"sType": null,
		
			/**
			 * Width of the column
			 *  @type string
			 *  @default null
			 */
			"sWidth": null,
		
			/**
			 * Width of the column when it was first "encountered"
			 *  @type string
			 *  @default null
			 */
			"sWidthOrig": null
		};
		
		
		/*
		 * Developer note: The properties of the object below are given in Hungarian
		 * notation, that was used as the interface for DataTables prior to v1.10, however
		 * from v1.10 onwards the primary interface is camel case. In order to avoid
		 * breaking backwards compatibility utterly with this change, the Hungarian
		 * version is still, internally the primary interface, but is is not documented
		 * - hence the @name tags in each doc comment. This allows a Javascript function
		 * to create a map from Hungarian notation to camel case (going the other direction
		 * would require each property to be listed, which would at around 3K to the size
		 * of DataTables, while this method is about a 0.5K hit.
		 *
		 * Ultimately this does pave the way for Hungarian notation to be dropped
		 * completely, but that is a massive amount of work and will break current
		 * installs (therefore is on-hold until v2).
		 */
		
		/**
		 * Initialisation options that can be given to DataTables at initialisation
		 * time.
		 *  @namespace
		 */
		DataTable.defaults = {
			/**
			 * An array of data to use for the table, passed in at initialisation which
			 * will be used in preference to any data which is already in the DOM. This is
			 * particularly useful for constructing tables purely in Javascript, for
			 * example with a custom Ajax call.
			 *  @type array
			 *  @default null
			 *
			 *  @dtopt Option
			 *  @name DataTable.defaults.data
			 *
			 *  @example
			 *    // Using a 2D array data source
			 *    $(document).ready( function () {
			 *      $('#example').dataTable( {
			 *        "data": [
			 *          ['Trident', 'Internet Explorer 4.0', 'Win 95+', 4, 'X'],
			 *          ['Trident', 'Internet Explorer 5.0', 'Win 95+', 5, 'C'],
			 *        ],
			 *        "columns": [
			 *          { "title": "Engine" },
			 *          { "title": "Browser" },
			 *          { "title": "Platform" },
			 *          { "title": "Version" },
			 *          { "title": "Grade" }
			 *        ]
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Using an array of objects as a data source (`data`)
			 *    $(document).ready( function () {
			 *      $('#example').dataTable( {
			 *        "data": [
			 *          {
			 *            "engine":   "Trident",
			 *            "browser":  "Internet Explorer 4.0",
			 *            "platform": "Win 95+",
			 *            "version":  4,
			 *            "grade":    "X"
			 *          },
			 *          {
			 *            "engine":   "Trident",
			 *            "browser":  "Internet Explorer 5.0",
			 *            "platform": "Win 95+",
			 *            "version":  5,
			 *            "grade":    "C"
			 *          }
			 *        ],
			 *        "columns": [
			 *          { "title": "Engine",   "data": "engine" },
			 *          { "title": "Browser",  "data": "browser" },
			 *          { "title": "Platform", "data": "platform" },
			 *          { "title": "Version",  "data": "version" },
			 *          { "title": "Grade",    "data": "grade" }
			 *        ]
			 *      } );
			 *    } );
			 */
			"aaData": null,
		
		
			/**
			 * If ordering is enabled, then DataTables will perform a first pass sort on
			 * initialisation. You can define which column(s) the sort is performed
			 * upon, and the sorting direction, with this variable. The `sorting` array
			 * should contain an array for each column to be sorted initially containing
			 * the column's index and a direction string ('asc' or 'desc').
			 *  @type array
			 *  @default [[0,'asc']]
			 *
			 *  @dtopt Option
			 *  @name DataTable.defaults.order
			 *
			 *  @example
			 *    // Sort by 3rd column first, and then 4th column
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "order": [[2,'asc'], [3,'desc']]
			 *      } );
			 *    } );
			 *
			 *    // No initial sorting
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "order": []
			 *      } );
			 *    } );
			 */
			"aaSorting": [[0,'asc']],
		
		
			/**
			 * This parameter is basically identical to the `sorting` parameter, but
			 * cannot be overridden by user interaction with the table. What this means
			 * is that you could have a column (visible or hidden) which the sorting
			 * will always be forced on first - any sorting after that (from the user)
			 * will then be performed as required. This can be useful for grouping rows
			 * together.
			 *  @type array
			 *  @default null
			 *
			 *  @dtopt Option
			 *  @name DataTable.defaults.orderFixed
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "orderFixed": [[0,'asc']]
			 *      } );
			 *    } )
			 */
			"aaSortingFixed": [],
		
		
			/**
			 * DataTables can be instructed to load data to display in the table from a
			 * Ajax source. This option defines how that Ajax call is made and where to.
			 *
			 * The `ajax` property has three different modes of operation, depending on
			 * how it is defined. These are:
			 *
			 * * `string` - Set the URL from where the data should be loaded from.
			 * * `object` - Define properties for `jQuery.ajax`.
			 * * `function` - Custom data get function
			 *
			 * `string`
			 * --------
			 *
			 * As a string, the `ajax` property simply defines the URL from which
			 * DataTables will load data.
			 *
			 * `object`
			 * --------
			 *
			 * As an object, the parameters in the object are passed to
			 * [jQuery.ajax](http://api.jquery.com/jQuery.ajax/) allowing fine control
			 * of the Ajax request. DataTables has a number of default parameters which
			 * you can override using this option. Please refer to the jQuery
			 * documentation for a full description of the options available, although
			 * the following parameters provide additional options in DataTables or
			 * require special consideration:
			 *
			 * * `data` - As with jQuery, `data` can be provided as an object, but it
			 *   can also be used as a function to manipulate the data DataTables sends
			 *   to the server. The function takes a single parameter, an object of
			 *   parameters with the values that DataTables has readied for sending. An
			 *   object may be returned which will be merged into the DataTables
			 *   defaults, or you can add the items to the object that was passed in and
			 *   not return anything from the function. This supersedes `fnServerParams`
			 *   from DataTables 1.9-.
			 *
			 * * `dataSrc` - By default DataTables will look for the property `data` (or
			 *   `aaData` for compatibility with DataTables 1.9-) when obtaining data
			 *   from an Ajax source or for server-side processing - this parameter
			 *   allows that property to be changed. You can use Javascript dotted
			 *   object notation to get a data source for multiple levels of nesting, or
			 *   it my be used as a function. As a function it takes a single parameter,
			 *   the JSON returned from the server, which can be manipulated as
			 *   required, with the returned value being that used by DataTables as the
			 *   data source for the table. This supersedes `sAjaxDataProp` from
			 *   DataTables 1.9-.
			 *
			 * * `success` - Should not be overridden it is used internally in
			 *   DataTables. To manipulate / transform the data returned by the server
			 *   use `ajax.dataSrc`, or use `ajax` as a function (see below).
			 *
			 * `function`
			 * ----------
			 *
			 * As a function, making the Ajax call is left up to yourself allowing
			 * complete control of the Ajax request. Indeed, if desired, a method other
			 * than Ajax could be used to obtain the required data, such as Web storage
			 * or an AIR database.
			 *
			 * The function is given four parameters and no return is required. The
			 * parameters are:
			 *
			 * 1. _object_ - Data to send to the server
			 * 2. _function_ - Callback function that must be executed when the required
			 *    data has been obtained. That data should be passed into the callback
			 *    as the only parameter
			 * 3. _object_ - DataTables settings object for the table
			 *
			 * Note that this supersedes `fnServerData` from DataTables 1.9-.
			 *
			 *  @type string|object|function
			 *  @default null
			 *
			 *  @dtopt Option
			 *  @name DataTable.defaults.ajax
			 *  @since 1.10.0
			 *
			 * @example
			 *   // Get JSON data from a file via Ajax.
			 *   // Note DataTables expects data in the form `{ data: [ ...data... ] }` by default).
			 *   $('#example').dataTable( {
			 *     "ajax": "data.json"
			 *   } );
			 *
			 * @example
			 *   // Get JSON data from a file via Ajax, using `dataSrc` to change
			 *   // `data` to `tableData` (i.e. `{ tableData: [ ...data... ] }`)
			 *   $('#example').dataTable( {
			 *     "ajax": {
			 *       "url": "data.json",
			 *       "dataSrc": "tableData"
			 *     }
			 *   } );
			 *
			 * @example
			 *   // Get JSON data from a file via Ajax, using `dataSrc` to read data
			 *   // from a plain array rather than an array in an object
			 *   $('#example').dataTable( {
			 *     "ajax": {
			 *       "url": "data.json",
			 *       "dataSrc": ""
			 *     }
			 *   } );
			 *
			 * @example
			 *   // Manipulate the data returned from the server - add a link to data
			 *   // (note this can, should, be done using `render` for the column - this
			 *   // is just a simple example of how the data can be manipulated).
			 *   $('#example').dataTable( {
			 *     "ajax": {
			 *       "url": "data.json",
			 *       "dataSrc": function ( json ) {
			 *         for ( var i=0, ien=json.length ; i<ien ; i++ ) {
			 *           json[i][0] = '<a href="/message/'+json[i][0]+'>View message</a>';
			 *         }
			 *         return json;
			 *       }
			 *     }
			 *   } );
			 *
			 * @example
			 *   // Add data to the request
			 *   $('#example').dataTable( {
			 *     "ajax": {
			 *       "url": "data.json",
			 *       "data": function ( d ) {
			 *         return {
			 *           "extra_search": $('#extra').val()
			 *         };
			 *       }
			 *     }
			 *   } );
			 *
			 * @example
			 *   // Send request as POST
			 *   $('#example').dataTable( {
			 *     "ajax": {
			 *       "url": "data.json",
			 *       "type": "POST"
			 *     }
			 *   } );
			 *
			 * @example
			 *   // Get the data from localStorage (could interface with a form for
			 *   // adding, editing and removing rows).
			 *   $('#example').dataTable( {
			 *     "ajax": function (data, callback, settings) {
			 *       callback(
			 *         JSON.parse( localStorage.getItem('dataTablesData') )
			 *       );
			 *     }
			 *   } );
			 */
			"ajax": null,
		
		
			/**
			 * This parameter allows you to readily specify the entries in the length drop
			 * down menu that DataTables shows when pagination is enabled. It can be
			 * either a 1D array of options which will be used for both the displayed
			 * option and the value, or a 2D array which will use the array in the first
			 * position as the value, and the array in the second position as the
			 * displayed options (useful for language strings such as 'All').
			 *
			 * Note that the `pageLength` property will be automatically set to the
			 * first value given in this array, unless `pageLength` is also provided.
			 *  @type array
			 *  @default [ 10, 25, 50, 100 ]
			 *
			 *  @dtopt Option
			 *  @name DataTable.defaults.lengthMenu
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]]
			 *      } );
			 *    } );
			 */
			"aLengthMenu": [ 10, 25, 50, 100 ],
		
		
			/**
			 * The `columns` option in the initialisation parameter allows you to define
			 * details about the way individual columns behave. For a full list of
			 * column options that can be set, please see
			 * {@link DataTable.defaults.column}. Note that if you use `columns` to
			 * define your columns, you must have an entry in the array for every single
			 * column that you have in your table (these can be null if you don't which
			 * to specify any options).
			 *  @member
			 *
			 *  @name DataTable.defaults.column
			 */
			"aoColumns": null,
		
			/**
			 * Very similar to `columns`, `columnDefs` allows you to target a specific
			 * column, multiple columns, or all columns, using the `targets` property of
			 * each object in the array. This allows great flexibility when creating
			 * tables, as the `columnDefs` arrays can be of any length, targeting the
			 * columns you specifically want. `columnDefs` may use any of the column
			 * options available: {@link DataTable.defaults.column}, but it _must_
			 * have `targets` defined in each object in the array. Values in the `targets`
			 * array may be:
			 *   <ul>
			 *     <li>a string - class name will be matched on the TH for the column</li>
			 *     <li>0 or a positive integer - column index counting from the left</li>
			 *     <li>a negative integer - column index counting from the right</li>
			 *     <li>the string "_all" - all columns (i.e. assign a default)</li>
			 *   </ul>
			 *  @member
			 *
			 *  @name DataTable.defaults.columnDefs
			 */
			"aoColumnDefs": null,
		
		
			/**
			 * Basically the same as `search`, this parameter defines the individual column
			 * filtering state at initialisation time. The array must be of the same size
			 * as the number of columns, and each element be an object with the parameters
			 * `search` and `escapeRegex` (the latter is optional). 'null' is also
			 * accepted and the default will be used.
			 *  @type array
			 *  @default []
			 *
			 *  @dtopt Option
			 *  @name DataTable.defaults.searchCols
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "searchCols": [
			 *          null,
			 *          { "search": "My filter" },
			 *          null,
			 *          { "search": "^[0-9]", "escapeRegex": false }
			 *        ]
			 *      } );
			 *    } )
			 */
			"aoSearchCols": [],
		
		
			/**
			 * An array of CSS classes that should be applied to displayed rows. This
			 * array may be of any length, and DataTables will apply each class
			 * sequentially, looping when required.
			 *  @type array
			 *  @default null <i>Will take the values determined by the `oClasses.stripe*`
			 *    options</i>
			 *
			 *  @dtopt Option
			 *  @name DataTable.defaults.stripeClasses
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "stripeClasses": [ 'strip1', 'strip2', 'strip3' ]
			 *      } );
			 *    } )
			 */
			"asStripeClasses": null,
		
		
			/**
			 * Enable or disable automatic column width calculation. This can be disabled
			 * as an optimisation (it takes some time to calculate the widths) if the
			 * tables widths are passed in using `columns`.
			 *  @type boolean
			 *  @default true
			 *
			 *  @dtopt Features
			 *  @name DataTable.defaults.autoWidth
			 *
			 *  @example
			 *    $(document).ready( function () {
			 *      $('#example').dataTable( {
			 *        "autoWidth": false
			 *      } );
			 *    } );
			 */
			"bAutoWidth": true,
		
		
			/**
			 * Deferred rendering can provide DataTables with a huge speed boost when you
			 * are using an Ajax or JS data source for the table. This option, when set to
			 * true, will cause DataTables to defer the creation of the table elements for
			 * each row until they are needed for a draw - saving a significant amount of
			 * time.
			 *  @type boolean
			 *  @default false
			 *
			 *  @dtopt Features
			 *  @name DataTable.defaults.deferRender
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "ajax": "sources/arrays.txt",
			 *        "deferRender": true
			 *      } );
			 *    } );
			 */
			"bDeferRender": false,
		
		
			/**
			 * Replace a DataTable which matches the given selector and replace it with
			 * one which has the properties of the new initialisation object passed. If no
			 * table matches the selector, then the new DataTable will be constructed as
			 * per normal.
			 *  @type boolean
			 *  @default false
			 *
			 *  @dtopt Options
			 *  @name DataTable.defaults.destroy
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "srollY": "200px",
			 *        "paginate": false
			 *      } );
			 *
			 *      // Some time later....
			 *      $('#example').dataTable( {
			 *        "filter": false,
			 *        "destroy": true
			 *      } );
			 *    } );
			 */
			"bDestroy": false,
		
		
			/**
			 * Enable or disable filtering of data. Filtering in DataTables is "smart" in
			 * that it allows the end user to input multiple words (space separated) and
			 * will match a row containing those words, even if not in the order that was
			 * specified (this allow matching across multiple columns). Note that if you
			 * wish to use filtering in DataTables this must remain 'true' - to remove the
			 * default filtering input box and retain filtering abilities, please use
			 * {@link DataTable.defaults.dom}.
			 *  @type boolean
			 *  @default true
			 *
			 *  @dtopt Features
			 *  @name DataTable.defaults.searching
			 *
			 *  @example
			 *    $(document).ready( function () {
			 *      $('#example').dataTable( {
			 *        "searching": false
			 *      } );
			 *    } );
			 */
			"bFilter": true,
		
		
			/**
			 * Enable or disable the table information display. This shows information
			 * about the data that is currently visible on the page, including information
			 * about filtered data if that action is being performed.
			 *  @type boolean
			 *  @default true
			 *
			 *  @dtopt Features
			 *  @name DataTable.defaults.info
			 *
			 *  @example
			 *    $(document).ready( function () {
			 *      $('#example').dataTable( {
			 *        "info": false
			 *      } );
			 *    } );
			 */
			"bInfo": true,
		
		
			/**
			 * Enable jQuery UI ThemeRoller support (required as ThemeRoller requires some
			 * slightly different and additional mark-up from what DataTables has
			 * traditionally used).
			 *  @type boolean
			 *  @default false
			 *
			 *  @dtopt Features
			 *  @name DataTable.defaults.jQueryUI
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "jQueryUI": true
			 *      } );
			 *    } );
			 */
			"bJQueryUI": false,
		
		
			/**
			 * Allows the end user to select the size of a formatted page from a select
			 * menu (sizes are 10, 25, 50 and 100). Requires pagination (`paginate`).
			 *  @type boolean
			 *  @default true
			 *
			 *  @dtopt Features
			 *  @name DataTable.defaults.lengthChange
			 *
			 *  @example
			 *    $(document).ready( function () {
			 *      $('#example').dataTable( {
			 *        "lengthChange": false
			 *      } );
			 *    } );
			 */
			"bLengthChange": true,
		
		
			/**
			 * Enable or disable pagination.
			 *  @type boolean
			 *  @default true
			 *
			 *  @dtopt Features
			 *  @name DataTable.defaults.paging
			 *
			 *  @example
			 *    $(document).ready( function () {
			 *      $('#example').dataTable( {
			 *        "paging": false
			 *      } );
			 *    } );
			 */
			"bPaginate": true,
		
		
			/**
			 * Enable or disable the display of a 'processing' indicator when the table is
			 * being processed (e.g. a sort). This is particularly useful for tables with
			 * large amounts of data where it can take a noticeable amount of time to sort
			 * the entries.
			 *  @type boolean
			 *  @default false
			 *
			 *  @dtopt Features
			 *  @name DataTable.defaults.processing
			 *
			 *  @example
			 *    $(document).ready( function () {
			 *      $('#example').dataTable( {
			 *        "processing": true
			 *      } );
			 *    } );
			 */
			"bProcessing": false,
		
		
			/**
			 * Retrieve the DataTables object for the given selector. Note that if the
			 * table has already been initialised, this parameter will cause DataTables
			 * to simply return the object that has already been set up - it will not take
			 * account of any changes you might have made to the initialisation object
			 * passed to DataTables (setting this parameter to true is an acknowledgement
			 * that you understand this). `destroy` can be used to reinitialise a table if
			 * you need.
			 *  @type boolean
			 *  @default false
			 *
			 *  @dtopt Options
			 *  @name DataTable.defaults.retrieve
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      initTable();
			 *      tableActions();
			 *    } );
			 *
			 *    function initTable ()
			 *    {
			 *      return $('#example').dataTable( {
			 *        "scrollY": "200px",
			 *        "paginate": false,
			 *        "retrieve": true
			 *      } );
			 *    }
			 *
			 *    function tableActions ()
			 *    {
			 *      var table = initTable();
			 *      // perform API operations with oTable
			 *    }
			 */
			"bRetrieve": false,
		
		
			/**
			 * When vertical (y) scrolling is enabled, DataTables will force the height of
			 * the table's viewport to the given height at all times (useful for layout).
			 * However, this can look odd when filtering data down to a small data set,
			 * and the footer is left "floating" further down. This parameter (when
			 * enabled) will cause DataTables to collapse the table's viewport down when
			 * the result set will fit within the given Y height.
			 *  @type boolean
			 *  @default false
			 *
			 *  @dtopt Options
			 *  @name DataTable.defaults.scrollCollapse
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "scrollY": "200",
			 *        "scrollCollapse": true
			 *      } );
			 *    } );
			 */
			"bScrollCollapse": false,
		
		
			/**
			 * Configure DataTables to use server-side processing. Note that the
			 * `ajax` parameter must also be given in order to give DataTables a
			 * source to obtain the required data for each draw.
			 *  @type boolean
			 *  @default false
			 *
			 *  @dtopt Features
			 *  @dtopt Server-side
			 *  @name DataTable.defaults.serverSide
			 *
			 *  @example
			 *    $(document).ready( function () {
			 *      $('#example').dataTable( {
			 *        "serverSide": true,
			 *        "ajax": "xhr.php"
			 *      } );
			 *    } );
			 */
			"bServerSide": false,
		
		
			/**
			 * Enable or disable sorting of columns. Sorting of individual columns can be
			 * disabled by the `sortable` option for each column.
			 *  @type boolean
			 *  @default true
			 *
			 *  @dtopt Features
			 *  @name DataTable.defaults.ordering
			 *
			 *  @example
			 *    $(document).ready( function () {
			 *      $('#example').dataTable( {
			 *        "ordering": false
			 *      } );
			 *    } );
			 */
			"bSort": true,
		
		
			/**
			 * Enable or display DataTables' ability to sort multiple columns at the
			 * same time (activated by shift-click by the user).
			 *  @type boolean
			 *  @default true
			 *
			 *  @dtopt Options
			 *  @name DataTable.defaults.orderMulti
			 *
			 *  @example
			 *    // Disable multiple column sorting ability
			 *    $(document).ready( function () {
			 *      $('#example').dataTable( {
			 *        "orderMulti": false
			 *      } );
			 *    } );
			 */
			"bSortMulti": true,
		
		
			/**
			 * Allows control over whether DataTables should use the top (true) unique
			 * cell that is found for a single column, or the bottom (false - default).
			 * This is useful when using complex headers.
			 *  @type boolean
			 *  @default false
			 *
			 *  @dtopt Options
			 *  @name DataTable.defaults.orderCellsTop
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "orderCellsTop": true
			 *      } );
			 *    } );
			 */
			"bSortCellsTop": false,
		
		
			/**
			 * Enable or disable the addition of the classes `sorting\_1`, `sorting\_2` and
			 * `sorting\_3` to the columns which are currently being sorted on. This is
			 * presented as a feature switch as it can increase processing time (while
			 * classes are removed and added) so for large data sets you might want to
			 * turn this off.
			 *  @type boolean
			 *  @default true
			 *
			 *  @dtopt Features
			 *  @name DataTable.defaults.orderClasses
			 *
			 *  @example
			 *    $(document).ready( function () {
			 *      $('#example').dataTable( {
			 *        "orderClasses": false
			 *      } );
			 *    } );
			 */
			"bSortClasses": true,
		
		
			/**
			 * Enable or disable state saving. When enabled HTML5 `localStorage` will be
			 * used to save table display information such as pagination information,
			 * display length, filtering and sorting. As such when the end user reloads
			 * the page the display display will match what thy had previously set up.
			 *
			 * Due to the use of `localStorage` the default state saving is not supported
			 * in IE6 or 7. If state saving is required in those browsers, use
			 * `stateSaveCallback` to provide a storage solution such as cookies.
			 *  @type boolean
			 *  @default false
			 *
			 *  @dtopt Features
			 *  @name DataTable.defaults.stateSave
			 *
			 *  @example
			 *    $(document).ready( function () {
			 *      $('#example').dataTable( {
			 *        "stateSave": true
			 *      } );
			 *    } );
			 */
			"bStateSave": false,
		
		
			/**
			 * This function is called when a TR element is created (and all TD child
			 * elements have been inserted), or registered if using a DOM source, allowing
			 * manipulation of the TR element (adding classes etc).
			 *  @type function
			 *  @param {node} row "TR" element for the current row
			 *  @param {array} data Raw data array for this row
			 *  @param {int} dataIndex The index of this row in the internal aoData array
			 *
			 *  @dtopt Callbacks
			 *  @name DataTable.defaults.createdRow
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "createdRow": function( row, data, dataIndex ) {
			 *          // Bold the grade for all 'A' grade browsers
			 *          if ( data[4] == "A" )
			 *          {
			 *            $('td:eq(4)', row).html( '<b>A</b>' );
			 *          }
			 *        }
			 *      } );
			 *    } );
			 */
			"fnCreatedRow": null,
		
		
			/**
			 * This function is called on every 'draw' event, and allows you to
			 * dynamically modify any aspect you want about the created DOM.
			 *  @type function
			 *  @param {object} settings DataTables settings object
			 *
			 *  @dtopt Callbacks
			 *  @name DataTable.defaults.drawCallback
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "drawCallback": function( settings ) {
			 *          alert( 'DataTables has redrawn the table' );
			 *        }
			 *      } );
			 *    } );
			 */
			"fnDrawCallback": null,
		
		
			/**
			 * Identical to fnHeaderCallback() but for the table footer this function
			 * allows you to modify the table footer on every 'draw' event.
			 *  @type function
			 *  @param {node} foot "TR" element for the footer
			 *  @param {array} data Full table data (as derived from the original HTML)
			 *  @param {int} start Index for the current display starting point in the
			 *    display array
			 *  @param {int} end Index for the current display ending point in the
			 *    display array
			 *  @param {array int} display Index array to translate the visual position
			 *    to the full data array
			 *
			 *  @dtopt Callbacks
			 *  @name DataTable.defaults.footerCallback
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "footerCallback": function( tfoot, data, start, end, display ) {
			 *          tfoot.getElementsByTagName('th')[0].innerHTML = "Starting index is "+start;
			 *        }
			 *      } );
			 *    } )
			 */
			"fnFooterCallback": null,
		
		
			/**
			 * When rendering large numbers in the information element for the table
			 * (i.e. "Showing 1 to 10 of 57 entries") DataTables will render large numbers
			 * to have a comma separator for the 'thousands' units (e.g. 1 million is
			 * rendered as "1,000,000") to help readability for the end user. This
			 * function will override the default method DataTables uses.
			 *  @type function
			 *  @member
			 *  @param {int} toFormat number to be formatted
			 *  @returns {string} formatted string for DataTables to show the number
			 *
			 *  @dtopt Callbacks
			 *  @name DataTable.defaults.formatNumber
			 *
			 *  @example
			 *    // Format a number using a single quote for the separator (note that
			 *    // this can also be done with the language.thousands option)
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "formatNumber": function ( toFormat ) {
			 *          return toFormat.toString().replace(
			 *            /\B(?=(\d{3})+(?!\d))/g, "'"
			 *          );
			 *        };
			 *      } );
			 *    } );
			 */
			"fnFormatNumber": function ( toFormat ) {
				return toFormat.toString().replace(
					/\B(?=(\d{3})+(?!\d))/g,
					this.oLanguage.sThousands
				);
			},
		
		
			/**
			 * This function is called on every 'draw' event, and allows you to
			 * dynamically modify the header row. This can be used to calculate and
			 * display useful information about the table.
			 *  @type function
			 *  @param {node} head "TR" element for the header
			 *  @param {array} data Full table data (as derived from the original HTML)
			 *  @param {int} start Index for the current display starting point in the
			 *    display array
			 *  @param {int} end Index for the current display ending point in the
			 *    display array
			 *  @param {array int} display Index array to translate the visual position
			 *    to the full data array
			 *
			 *  @dtopt Callbacks
			 *  @name DataTable.defaults.headerCallback
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "fheaderCallback": function( head, data, start, end, display ) {
			 *          head.getElementsByTagName('th')[0].innerHTML = "Displaying "+(end-start)+" records";
			 *        }
			 *      } );
			 *    } )
			 */
			"fnHeaderCallback": null,
		
		
			/**
			 * The information element can be used to convey information about the current
			 * state of the table. Although the internationalisation options presented by
			 * DataTables are quite capable of dealing with most customisations, there may
			 * be times where you wish to customise the string further. This callback
			 * allows you to do exactly that.
			 *  @type function
			 *  @param {object} oSettings DataTables settings object
			 *  @param {int} start Starting position in data for the draw
			 *  @param {int} end End position in data for the draw
			 *  @param {int} max Total number of rows in the table (regardless of
			 *    filtering)
			 *  @param {int} total Total number of rows in the data set, after filtering
			 *  @param {string} pre The string that DataTables has formatted using it's
			 *    own rules
			 *  @returns {string} The string to be displayed in the information element.
			 *
			 *  @dtopt Callbacks
			 *  @name DataTable.defaults.infoCallback
			 *
			 *  @example
			 *    $('#example').dataTable( {
			 *      "infoCallback": function( settings, start, end, max, total, pre ) {
			 *        return start +" to "+ end;
			 *      }
			 *    } );
			 */
			"fnInfoCallback": null,
		
		
			/**
			 * Called when the table has been initialised. Normally DataTables will
			 * initialise sequentially and there will be no need for this function,
			 * however, this does not hold true when using external language information
			 * since that is obtained using an async XHR call.
			 *  @type function
			 *  @param {object} settings DataTables settings object
			 *  @param {object} json The JSON object request from the server - only
			 *    present if client-side Ajax sourced data is used
			 *
			 *  @dtopt Callbacks
			 *  @name DataTable.defaults.initComplete
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "initComplete": function(settings, json) {
			 *          alert( 'DataTables has finished its initialisation.' );
			 *        }
			 *      } );
			 *    } )
			 */
			"fnInitComplete": null,
		
		
			/**
			 * Called at the very start of each table draw and can be used to cancel the
			 * draw by returning false, any other return (including undefined) results in
			 * the full draw occurring).
			 *  @type function
			 *  @param {object} settings DataTables settings object
			 *  @returns {boolean} False will cancel the draw, anything else (including no
			 *    return) will allow it to complete.
			 *
			 *  @dtopt Callbacks
			 *  @name DataTable.defaults.preDrawCallback
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "preDrawCallback": function( settings ) {
			 *          if ( $('#test').val() == 1 ) {
			 *            return false;
			 *          }
			 *        }
			 *      } );
			 *    } );
			 */
			"fnPreDrawCallback": null,
		
		
			/**
			 * This function allows you to 'post process' each row after it have been
			 * generated for each table draw, but before it is rendered on screen. This
			 * function might be used for setting the row class name etc.
			 *  @type function
			 *  @param {node} row "TR" element for the current row
			 *  @param {array} data Raw data array for this row
			 *  @param {int} displayIndex The display index for the current table draw
			 *  @param {int} displayIndexFull The index of the data in the full list of
			 *    rows (after filtering)
			 *
			 *  @dtopt Callbacks
			 *  @name DataTable.defaults.rowCallback
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "rowCallback": function( row, data, displayIndex, displayIndexFull ) {
			 *          // Bold the grade for all 'A' grade browsers
			 *          if ( data[4] == "A" ) {
			 *            $('td:eq(4)', row).html( '<b>A</b>' );
			 *          }
			 *        }
			 *      } );
			 *    } );
			 */
			"fnRowCallback": null,
		
		
			/**
			 * __Deprecated__ The functionality provided by this parameter has now been
			 * superseded by that provided through `ajax`, which should be used instead.
			 *
			 * This parameter allows you to override the default function which obtains
			 * the data from the server so something more suitable for your application.
			 * For example you could use POST data, or pull information from a Gears or
			 * AIR database.
			 *  @type function
			 *  @member
			 *  @param {string} source HTTP source to obtain the data from (`ajax`)
			 *  @param {array} data A key/value pair object containing the data to send
			 *    to the server
			 *  @param {function} callback to be called on completion of the data get
			 *    process that will draw the data on the page.
			 *  @param {object} settings DataTables settings object
			 *
			 *  @dtopt Callbacks
			 *  @dtopt Server-side
			 *  @name DataTable.defaults.serverData
			 *
			 *  @deprecated 1.10. Please use `ajax` for this functionality now.
			 */
			"fnServerData": null,
		
		
			/**
			 * __Deprecated__ The functionality provided by this parameter has now been
			 * superseded by that provided through `ajax`, which should be used instead.
			 *
			 *  It is often useful to send extra data to the server when making an Ajax
			 * request - for example custom filtering information, and this callback
			 * function makes it trivial to send extra information to the server. The
			 * passed in parameter is the data set that has been constructed by
			 * DataTables, and you can add to this or modify it as you require.
			 *  @type function
			 *  @param {array} data Data array (array of objects which are name/value
			 *    pairs) that has been constructed by DataTables and will be sent to the
			 *    server. In the case of Ajax sourced data with server-side processing
			 *    this will be an empty array, for server-side processing there will be a
			 *    significant number of parameters!
			 *  @returns {undefined} Ensure that you modify the data array passed in,
			 *    as this is passed by reference.
			 *
			 *  @dtopt Callbacks
			 *  @dtopt Server-side
			 *  @name DataTable.defaults.serverParams
			 *
			 *  @deprecated 1.10. Please use `ajax` for this functionality now.
			 */
			"fnServerParams": null,
		
		
			/**
			 * Load the table state. With this function you can define from where, and how, the
			 * state of a table is loaded. By default DataTables will load from `localStorage`
			 * but you might wish to use a server-side database or cookies.
			 *  @type function
			 *  @member
			 *  @param {object} settings DataTables settings object
			 *  @param {object} callback Callback that can be executed when done. It
			 *    should be passed the loaded state object.
			 *  @return {object} The DataTables state object to be loaded
			 *
			 *  @dtopt Callbacks
			 *  @name DataTable.defaults.stateLoadCallback
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "stateSave": true,
			 *        "stateLoadCallback": function (settings, callback) {
			 *          $.ajax( {
			 *            "url": "/state_load",
			 *            "dataType": "json",
			 *            "success": function (json) {
			 *              callback( json );
			 *            }
			 *          } );
			 *        }
			 *      } );
			 *    } );
			 */
			"fnStateLoadCallback": function ( settings ) {
				try {
					return JSON.parse(
						(settings.iStateDuration === -1 ? sessionStorage : localStorage).getItem(
							'DataTables_'+settings.sInstance+'_'+location.pathname
						)
					);
				} catch (e) {}
			},
		
		
			/**
			 * Callback which allows modification of the saved state prior to loading that state.
			 * This callback is called when the table is loading state from the stored data, but
			 * prior to the settings object being modified by the saved state. Note that for
			 * plug-in authors, you should use the `stateLoadParams` event to load parameters for
			 * a plug-in.
			 *  @type function
			 *  @param {object} settings DataTables settings object
			 *  @param {object} data The state object that is to be loaded
			 *
			 *  @dtopt Callbacks
			 *  @name DataTable.defaults.stateLoadParams
			 *
			 *  @example
			 *    // Remove a saved filter, so filtering is never loaded
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "stateSave": true,
			 *        "stateLoadParams": function (settings, data) {
			 *          data.oSearch.sSearch = "";
			 *        }
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Disallow state loading by returning false
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "stateSave": true,
			 *        "stateLoadParams": function (settings, data) {
			 *          return false;
			 *        }
			 *      } );
			 *    } );
			 */
			"fnStateLoadParams": null,
		
		
			/**
			 * Callback that is called when the state has been loaded from the state saving method
			 * and the DataTables settings object has been modified as a result of the loaded state.
			 *  @type function
			 *  @param {object} settings DataTables settings object
			 *  @param {object} data The state object that was loaded
			 *
			 *  @dtopt Callbacks
			 *  @name DataTable.defaults.stateLoaded
			 *
			 *  @example
			 *    // Show an alert with the filtering value that was saved
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "stateSave": true,
			 *        "stateLoaded": function (settings, data) {
			 *          alert( 'Saved filter was: '+data.oSearch.sSearch );
			 *        }
			 *      } );
			 *    } );
			 */
			"fnStateLoaded": null,
		
		
			/**
			 * Save the table state. This function allows you to define where and how the state
			 * information for the table is stored By default DataTables will use `localStorage`
			 * but you might wish to use a server-side database or cookies.
			 *  @type function
			 *  @member
			 *  @param {object} settings DataTables settings object
			 *  @param {object} data The state object to be saved
			 *
			 *  @dtopt Callbacks
			 *  @name DataTable.defaults.stateSaveCallback
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "stateSave": true,
			 *        "stateSaveCallback": function (settings, data) {
			 *          // Send an Ajax request to the server with the state object
			 *          $.ajax( {
			 *            "url": "/state_save",
			 *            "data": data,
			 *            "dataType": "json",
			 *            "method": "POST"
			 *            "success": function () {}
			 *          } );
			 *        }
			 *      } );
			 *    } );
			 */
			"fnStateSaveCallback": function ( settings, data ) {
				try {
					(settings.iStateDuration === -1 ? sessionStorage : localStorage).setItem(
						'DataTables_'+settings.sInstance+'_'+location.pathname,
						JSON.stringify( data )
					);
				} catch (e) {}
			},
		
		
			/**
			 * Callback which allows modification of the state to be saved. Called when the table
			 * has changed state a new state save is required. This method allows modification of
			 * the state saving object prior to actually doing the save, including addition or
			 * other state properties or modification. Note that for plug-in authors, you should
			 * use the `stateSaveParams` event to save parameters for a plug-in.
			 *  @type function
			 *  @param {object} settings DataTables settings object
			 *  @param {object} data The state object to be saved
			 *
			 *  @dtopt Callbacks
			 *  @name DataTable.defaults.stateSaveParams
			 *
			 *  @example
			 *    // Remove a saved filter, so filtering is never saved
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "stateSave": true,
			 *        "stateSaveParams": function (settings, data) {
			 *          data.oSearch.sSearch = "";
			 *        }
			 *      } );
			 *    } );
			 */
			"fnStateSaveParams": null,
		
		
			/**
			 * Duration for which the saved state information is considered valid. After this period
			 * has elapsed the state will be returned to the default.
			 * Value is given in seconds.
			 *  @type int
			 *  @default 7200 <i>(2 hours)</i>
			 *
			 *  @dtopt Options
			 *  @name DataTable.defaults.stateDuration
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "stateDuration": 60*60*24; // 1 day
			 *      } );
			 *    } )
			 */
			"iStateDuration": 7200,
		
		
			/**
			 * When enabled DataTables will not make a request to the server for the first
			 * page draw - rather it will use the data already on the page (no sorting etc
			 * will be applied to it), thus saving on an XHR at load time. `deferLoading`
			 * is used to indicate that deferred loading is required, but it is also used
			 * to tell DataTables how many records there are in the full table (allowing
			 * the information element and pagination to be displayed correctly). In the case
			 * where a filtering is applied to the table on initial load, this can be
			 * indicated by giving the parameter as an array, where the first element is
			 * the number of records available after filtering and the second element is the
			 * number of records without filtering (allowing the table information element
			 * to be shown correctly).
			 *  @type int | array
			 *  @default null
			 *
			 *  @dtopt Options
			 *  @name DataTable.defaults.deferLoading
			 *
			 *  @example
			 *    // 57 records available in the table, no filtering applied
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "serverSide": true,
			 *        "ajax": "scripts/server_processing.php",
			 *        "deferLoading": 57
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // 57 records after filtering, 100 without filtering (an initial filter applied)
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "serverSide": true,
			 *        "ajax": "scripts/server_processing.php",
			 *        "deferLoading": [ 57, 100 ],
			 *        "search": {
			 *          "search": "my_filter"
			 *        }
			 *      } );
			 *    } );
			 */
			"iDeferLoading": null,
		
		
			/**
			 * Number of rows to display on a single page when using pagination. If
			 * feature enabled (`lengthChange`) then the end user will be able to override
			 * this to a custom setting using a pop-up menu.
			 *  @type int
			 *  @default 10
			 *
			 *  @dtopt Options
			 *  @name DataTable.defaults.pageLength
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "pageLength": 50
			 *      } );
			 *    } )
			 */
			"iDisplayLength": 10,
		
		
			/**
			 * Define the starting point for data display when using DataTables with
			 * pagination. Note that this parameter is the number of records, rather than
			 * the page number, so if you have 10 records per page and want to start on
			 * the third page, it should be "20".
			 *  @type int
			 *  @default 0
			 *
			 *  @dtopt Options
			 *  @name DataTable.defaults.displayStart
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "displayStart": 20
			 *      } );
			 *    } )
			 */
			"iDisplayStart": 0,
		
		
			/**
			 * By default DataTables allows keyboard navigation of the table (sorting, paging,
			 * and filtering) by adding a `tabindex` attribute to the required elements. This
			 * allows you to tab through the controls and press the enter key to activate them.
			 * The tabindex is default 0, meaning that the tab follows the flow of the document.
			 * You can overrule this using this parameter if you wish. Use a value of -1 to
			 * disable built-in keyboard navigation.
			 *  @type int
			 *  @default 0
			 *
			 *  @dtopt Options
			 *  @name DataTable.defaults.tabIndex
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "tabIndex": 1
			 *      } );
			 *    } );
			 */
			"iTabIndex": 0,
		
		
			/**
			 * Classes that DataTables assigns to the various components and features
			 * that it adds to the HTML table. This allows classes to be configured
			 * during initialisation in addition to through the static
			 * {@link DataTable.ext.oStdClasses} object).
			 *  @namespace
			 *  @name DataTable.defaults.classes
			 */
			"oClasses": {},
		
		
			/**
			 * All strings that DataTables uses in the user interface that it creates
			 * are defined in this object, allowing you to modified them individually or
			 * completely replace them all as required.
			 *  @namespace
			 *  @name DataTable.defaults.language
			 */
			"oLanguage": {
				/**
				 * Strings that are used for WAI-ARIA labels and controls only (these are not
				 * actually visible on the page, but will be read by screenreaders, and thus
				 * must be internationalised as well).
				 *  @namespace
				 *  @name DataTable.defaults.language.aria
				 */
				"oAria": {
					/**
					 * ARIA label that is added to the table headers when the column may be
					 * sorted ascending by activing the column (click or return when focused).
					 * Note that the column header is prefixed to this string.
					 *  @type string
					 *  @default : activate to sort column ascending
					 *
					 *  @dtopt Language
					 *  @name DataTable.defaults.language.aria.sortAscending
					 *
					 *  @example
					 *    $(document).ready( function() {
					 *      $('#example').dataTable( {
					 *        "language": {
					 *          "aria": {
					 *            "sortAscending": " - click/return to sort ascending"
					 *          }
					 *        }
					 *      } );
					 *    } );
					 */
					"sSortAscending": ": activate to sort column ascending",
		
					/**
					 * ARIA label that is added to the table headers when the column may be
					 * sorted descending by activing the column (click or return when focused).
					 * Note that the column header is prefixed to this string.
					 *  @type string
					 *  @default : activate to sort column ascending
					 *
					 *  @dtopt Language
					 *  @name DataTable.defaults.language.aria.sortDescending
					 *
					 *  @example
					 *    $(document).ready( function() {
					 *      $('#example').dataTable( {
					 *        "language": {
					 *          "aria": {
					 *            "sortDescending": " - click/return to sort descending"
					 *          }
					 *        }
					 *      } );
					 *    } );
					 */
					"sSortDescending": ": activate to sort column descending"
				},
		
				/**
				 * Pagination string used by DataTables for the built-in pagination
				 * control types.
				 *  @namespace
				 *  @name DataTable.defaults.language.paginate
				 */
				"oPaginate": {
					/**
					 * Text to use when using the 'full_numbers' type of pagination for the
					 * button to take the user to the first page.
					 *  @type string
					 *  @default First
					 *
					 *  @dtopt Language
					 *  @name DataTable.defaults.language.paginate.first
					 *
					 *  @example
					 *    $(document).ready( function() {
					 *      $('#example').dataTable( {
					 *        "language": {
					 *          "paginate": {
					 *            "first": "First page"
					 *          }
					 *        }
					 *      } );
					 *    } );
					 */
					"sFirst": "First",
		
		
					/**
					 * Text to use when using the 'full_numbers' type of pagination for the
					 * button to take the user to the last page.
					 *  @type string
					 *  @default Last
					 *
					 *  @dtopt Language
					 *  @name DataTable.defaults.language.paginate.last
					 *
					 *  @example
					 *    $(document).ready( function() {
					 *      $('#example').dataTable( {
					 *        "language": {
					 *          "paginate": {
					 *            "last": "Last page"
					 *          }
					 *        }
					 *      } );
					 *    } );
					 */
					"sLast": "Last",
		
		
					/**
					 * Text to use for the 'next' pagination button (to take the user to the
					 * next page).
					 *  @type string
					 *  @default Next
					 *
					 *  @dtopt Language
					 *  @name DataTable.defaults.language.paginate.next
					 *
					 *  @example
					 *    $(document).ready( function() {
					 *      $('#example').dataTable( {
					 *        "language": {
					 *          "paginate": {
					 *            "next": "Next page"
					 *          }
					 *        }
					 *      } );
					 *    } );
					 */
					"sNext": "Next",
		
		
					/**
					 * Text to use for the 'previous' pagination button (to take the user to
					 * the previous page).
					 *  @type string
					 *  @default Previous
					 *
					 *  @dtopt Language
					 *  @name DataTable.defaults.language.paginate.previous
					 *
					 *  @example
					 *    $(document).ready( function() {
					 *      $('#example').dataTable( {
					 *        "language": {
					 *          "paginate": {
					 *            "previous": "Previous page"
					 *          }
					 *        }
					 *      } );
					 *    } );
					 */
					"sPrevious": "Previous"
				},
		
				/**
				 * This string is shown in preference to `zeroRecords` when the table is
				 * empty of data (regardless of filtering). Note that this is an optional
				 * parameter - if it is not given, the value of `zeroRecords` will be used
				 * instead (either the default or given value).
				 *  @type string
				 *  @default No data available in table
				 *
				 *  @dtopt Language
				 *  @name DataTable.defaults.language.emptyTable
				 *
				 *  @example
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "emptyTable": "No data available in table"
				 *        }
				 *      } );
				 *    } );
				 */
				"sEmptyTable": "No data available in table",
		
		
				/**
				 * This string gives information to the end user about the information
				 * that is current on display on the page. The following tokens can be
				 * used in the string and will be dynamically replaced as the table
				 * display updates. This tokens can be placed anywhere in the string, or
				 * removed as needed by the language requires:
				 *
				 * * `\_START\_` - Display index of the first record on the current page
				 * * `\_END\_` - Display index of the last record on the current page
				 * * `\_TOTAL\_` - Number of records in the table after filtering
				 * * `\_MAX\_` - Number of records in the table without filtering
				 * * `\_PAGE\_` - Current page number
				 * * `\_PAGES\_` - Total number of pages of data in the table
				 *
				 *  @type string
				 *  @default Showing _START_ to _END_ of _TOTAL_ entries
				 *
				 *  @dtopt Language
				 *  @name DataTable.defaults.language.info
				 *
				 *  @example
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "info": "Showing page _PAGE_ of _PAGES_"
				 *        }
				 *      } );
				 *    } );
				 */
				"sInfo": "Showing _START_ to _END_ of _TOTAL_ entries",
		
		
				/**
				 * Display information string for when the table is empty. Typically the
				 * format of this string should match `info`.
				 *  @type string
				 *  @default Showing 0 to 0 of 0 entries
				 *
				 *  @dtopt Language
				 *  @name DataTable.defaults.language.infoEmpty
				 *
				 *  @example
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "infoEmpty": "No entries to show"
				 *        }
				 *      } );
				 *    } );
				 */
				"sInfoEmpty": "Showing 0 to 0 of 0 entries",
		
		
				/**
				 * When a user filters the information in a table, this string is appended
				 * to the information (`info`) to give an idea of how strong the filtering
				 * is. The variable _MAX_ is dynamically updated.
				 *  @type string
				 *  @default (filtered from _MAX_ total entries)
				 *
				 *  @dtopt Language
				 *  @name DataTable.defaults.language.infoFiltered
				 *
				 *  @example
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "infoFiltered": " - filtering from _MAX_ records"
				 *        }
				 *      } );
				 *    } );
				 */
				"sInfoFiltered": "(filtered from _MAX_ total entries)",
		
		
				/**
				 * If can be useful to append extra information to the info string at times,
				 * and this variable does exactly that. This information will be appended to
				 * the `info` (`infoEmpty` and `infoFiltered` in whatever combination they are
				 * being used) at all times.
				 *  @type string
				 *  @default <i>Empty string</i>
				 *
				 *  @dtopt Language
				 *  @name DataTable.defaults.language.infoPostFix
				 *
				 *  @example
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "infoPostFix": "All records shown are derived from real information."
				 *        }
				 *      } );
				 *    } );
				 */
				"sInfoPostFix": "",
		
		
				/**
				 * This decimal place operator is a little different from the other
				 * language options since DataTables doesn't output floating point
				 * numbers, so it won't ever use this for display of a number. Rather,
				 * what this parameter does is modify the sort methods of the table so
				 * that numbers which are in a format which has a character other than
				 * a period (`.`) as a decimal place will be sorted numerically.
				 *
				 * Note that numbers with different decimal places cannot be shown in
				 * the same table and still be sortable, the table must be consistent.
				 * However, multiple different tables on the page can use different
				 * decimal place characters.
				 *  @type string
				 *  @default 
				 *
				 *  @dtopt Language
				 *  @name DataTable.defaults.language.decimal
				 *
				 *  @example
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "decimal": ","
				 *          "thousands": "."
				 *        }
				 *      } );
				 *    } );
				 */
				"sDecimal": "",
		
		
				/**
				 * DataTables has a build in number formatter (`formatNumber`) which is
				 * used to format large numbers that are used in the table information.
				 * By default a comma is used, but this can be trivially changed to any
				 * character you wish with this parameter.
				 *  @type string
				 *  @default ,
				 *
				 *  @dtopt Language
				 *  @name DataTable.defaults.language.thousands
				 *
				 *  @example
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "thousands": "'"
				 *        }
				 *      } );
				 *    } );
				 */
				"sThousands": ",",
		
		
				/**
				 * Detail the action that will be taken when the drop down menu for the
				 * pagination length option is changed. The '_MENU_' variable is replaced
				 * with a default select list of 10, 25, 50 and 100, and can be replaced
				 * with a custom select box if required.
				 *  @type string
				 *  @default Show _MENU_ entries
				 *
				 *  @dtopt Language
				 *  @name DataTable.defaults.language.lengthMenu
				 *
				 *  @example
				 *    // Language change only
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "lengthMenu": "Display _MENU_ records"
				 *        }
				 *      } );
				 *    } );
				 *
				 *  @example
				 *    // Language and options change
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "lengthMenu": 'Display <select>'+
				 *            '<option value="10">10</option>'+
				 *            '<option value="20">20</option>'+
				 *            '<option value="30">30</option>'+
				 *            '<option value="40">40</option>'+
				 *            '<option value="50">50</option>'+
				 *            '<option value="-1">All</option>'+
				 *            '</select> records'
				 *        }
				 *      } );
				 *    } );
				 */
				"sLengthMenu": "Show _MENU_ entries",
		
		
				/**
				 * When using Ajax sourced data and during the first draw when DataTables is
				 * gathering the data, this message is shown in an empty row in the table to
				 * indicate to the end user the the data is being loaded. Note that this
				 * parameter is not used when loading data by server-side processing, just
				 * Ajax sourced data with client-side processing.
				 *  @type string
				 *  @default Loading...
				 *
				 *  @dtopt Language
				 *  @name DataTable.defaults.language.loadingRecords
				 *
				 *  @example
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "loadingRecords": "Please wait - loading..."
				 *        }
				 *      } );
				 *    } );
				 */
				"sLoadingRecords": "Loading...",
		
		
				/**
				 * Text which is displayed when the table is processing a user action
				 * (usually a sort command or similar).
				 *  @type string
				 *  @default Processing...
				 *
				 *  @dtopt Language
				 *  @name DataTable.defaults.language.processing
				 *
				 *  @example
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "processing": "DataTables is currently busy"
				 *        }
				 *      } );
				 *    } );
				 */
				"sProcessing": "Processing...",
		
		
				/**
				 * Details the actions that will be taken when the user types into the
				 * filtering input text box. The variable "_INPUT_", if used in the string,
				 * is replaced with the HTML text box for the filtering input allowing
				 * control over where it appears in the string. If "_INPUT_" is not given
				 * then the input box is appended to the string automatically.
				 *  @type string
				 *  @default Search:
				 *
				 *  @dtopt Language
				 *  @name DataTable.defaults.language.search
				 *
				 *  @example
				 *    // Input text box will be appended at the end automatically
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "search": "Filter records:"
				 *        }
				 *      } );
				 *    } );
				 *
				 *  @example
				 *    // Specify where the filter should appear
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "search": "Apply filter _INPUT_ to table"
				 *        }
				 *      } );
				 *    } );
				 */
				"sSearch": "Search:",
		
		
				/**
				 * Assign a `placeholder` attribute to the search `input` element
				 *  @type string
				 *  @default 
				 *
				 *  @dtopt Language
				 *  @name DataTable.defaults.language.searchPlaceholder
				 */
				"sSearchPlaceholder": "",
		
		
				/**
				 * All of the language information can be stored in a file on the
				 * server-side, which DataTables will look up if this parameter is passed.
				 * It must store the URL of the language file, which is in a JSON format,
				 * and the object has the same properties as the oLanguage object in the
				 * initialiser object (i.e. the above parameters). Please refer to one of
				 * the example language files to see how this works in action.
				 *  @type string
				 *  @default <i>Empty string - i.e. disabled</i>
				 *
				 *  @dtopt Language
				 *  @name DataTable.defaults.language.url
				 *
				 *  @example
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "url": "http://www.sprymedia.co.uk/dataTables/lang.txt"
				 *        }
				 *      } );
				 *    } );
				 */
				"sUrl": "",
		
		
				/**
				 * Text shown inside the table records when the is no information to be
				 * displayed after filtering. `emptyTable` is shown when there is simply no
				 * information in the table at all (regardless of filtering).
				 *  @type string
				 *  @default No matching records found
				 *
				 *  @dtopt Language
				 *  @name DataTable.defaults.language.zeroRecords
				 *
				 *  @example
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "zeroRecords": "No records to display"
				 *        }
				 *      } );
				 *    } );
				 */
				"sZeroRecords": "No matching records found"
			},
		
		
			/**
			 * This parameter allows you to have define the global filtering state at
			 * initialisation time. As an object the `search` parameter must be
			 * defined, but all other parameters are optional. When `regex` is true,
			 * the search string will be treated as a regular expression, when false
			 * (default) it will be treated as a straight string. When `smart`
			 * DataTables will use it's smart filtering methods (to word match at
			 * any point in the data), when false this will not be done.
			 *  @namespace
			 *  @extends DataTable.models.oSearch
			 *
			 *  @dtopt Options
			 *  @name DataTable.defaults.search
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "search": {"search": "Initial search"}
			 *      } );
			 *    } )
			 */
			"oSearch": $.extend( {}, DataTable.models.oSearch ),
		
		
			/**
			 * __Deprecated__ The functionality provided by this parameter has now been
			 * superseded by that provided through `ajax`, which should be used instead.
			 *
			 * By default DataTables will look for the property `data` (or `aaData` for
			 * compatibility with DataTables 1.9-) when obtaining data from an Ajax
			 * source or for server-side processing - this parameter allows that
			 * property to be changed. You can use Javascript dotted object notation to
			 * get a data source for multiple levels of nesting.
			 *  @type string
			 *  @default data
			 *
			 *  @dtopt Options
			 *  @dtopt Server-side
			 *  @name DataTable.defaults.ajaxDataProp
			 *
			 *  @deprecated 1.10. Please use `ajax` for this functionality now.
			 */
			"sAjaxDataProp": "data",
		
		
			/**
			 * __Deprecated__ The functionality provided by this parameter has now been
			 * superseded by that provided through `ajax`, which should be used instead.
			 *
			 * You can instruct DataTables to load data from an external
			 * source using this parameter (use aData if you want to pass data in you
			 * already have). Simply provide a url a JSON object can be obtained from.
			 *  @type string
			 *  @default null
			 *
			 *  @dtopt Options
			 *  @dtopt Server-side
			 *  @name DataTable.defaults.ajaxSource
			 *
			 *  @deprecated 1.10. Please use `ajax` for this functionality now.
			 */
			"sAjaxSource": null,
		
		
			/**
			 * This initialisation variable allows you to specify exactly where in the
			 * DOM you want DataTables to inject the various controls it adds to the page
			 * (for example you might want the pagination controls at the top of the
			 * table). DIV elements (with or without a custom class) can also be added to
			 * aid styling. The follow syntax is used:
			 *   <ul>
			 *     <li>The following options are allowed:
			 *       <ul>
			 *         <li>'l' - Length changing</li>
			 *         <li>'f' - Filtering input</li>
			 *         <li>'t' - The table!</li>
			 *         <li>'i' - Information</li>
			 *         <li>'p' - Pagination</li>
			 *         <li>'r' - pRocessing</li>
			 *       </ul>
			 *     </li>
			 *     <li>The following constants are allowed:
			 *       <ul>
			 *         <li>'H' - jQueryUI theme "header" classes ('fg-toolbar ui-widget-header ui-corner-tl ui-corner-tr ui-helper-clearfix')</li>
			 *         <li>'F' - jQueryUI theme "footer" classes ('fg-toolbar ui-widget-header ui-corner-bl ui-corner-br ui-helper-clearfix')</li>
			 *       </ul>
			 *     </li>
			 *     <li>The following syntax is expected:
			 *       <ul>
			 *         <li>'&lt;' and '&gt;' - div elements</li>
			 *         <li>'&lt;"class" and '&gt;' - div with a class</li>
			 *         <li>'&lt;"#id" and '&gt;' - div with an ID</li>
			 *       </ul>
			 *     </li>
			 *     <li>Examples:
			 *       <ul>
			 *         <li>'&lt;"wrapper"flipt&gt;'</li>
			 *         <li>'&lt;lf&lt;t&gt;ip&gt;'</li>
			 *       </ul>
			 *     </li>
			 *   </ul>
			 *  @type string
			 *  @default lfrtip <i>(when `jQueryUI` is false)</i> <b>or</b>
			 *    <"H"lfr>t<"F"ip> <i>(when `jQueryUI` is true)</i>
			 *
			 *  @dtopt Options
			 *  @name DataTable.defaults.dom
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "dom": '&lt;"top"i&gt;rt&lt;"bottom"flp&gt;&lt;"clear"&gt;'
			 *      } );
			 *    } );
			 */
			"sDom": "lfrtip",
		
		
			/**
			 * Search delay option. This will throttle full table searches that use the
			 * DataTables provided search input element (it does not effect calls to
			 * `dt-api search()`, providing a delay before the search is made.
			 *  @type integer
			 *  @default 0
			 *
			 *  @dtopt Options
			 *  @name DataTable.defaults.searchDelay
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "searchDelay": 200
			 *      } );
			 *    } )
			 */
			"searchDelay": null,
		
		
			/**
			 * DataTables features six different built-in options for the buttons to
			 * display for pagination control:
			 *
			 * * `numbers` - Page number buttons only
			 * * `simple` - 'Previous' and 'Next' buttons only
			 * * 'simple_numbers` - 'Previous' and 'Next' buttons, plus page numbers
			 * * `full` - 'First', 'Previous', 'Next' and 'Last' buttons
			 * * `full_numbers` - 'First', 'Previous', 'Next' and 'Last' buttons, plus page numbers
			 * * `first_last_numbers` - 'First' and 'Last' buttons, plus page numbers
			 *  
			 * Further methods can be added using {@link DataTable.ext.oPagination}.
			 *  @type string
			 *  @default simple_numbers
			 *
			 *  @dtopt Options
			 *  @name DataTable.defaults.pagingType
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "pagingType": "full_numbers"
			 *      } );
			 *    } )
			 */
			"sPaginationType": "simple_numbers",
		
		
			/**
			 * Enable horizontal scrolling. When a table is too wide to fit into a
			 * certain layout, or you have a large number of columns in the table, you
			 * can enable x-scrolling to show the table in a viewport, which can be
			 * scrolled. This property can be `true` which will allow the table to
			 * scroll horizontally when needed, or any CSS unit, or a number (in which
			 * case it will be treated as a pixel measurement). Setting as simply `true`
			 * is recommended.
			 *  @type boolean|string
			 *  @default <i>blank string - i.e. disabled</i>
			 *
			 *  @dtopt Features
			 *  @name DataTable.defaults.scrollX
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "scrollX": true,
			 *        "scrollCollapse": true
			 *      } );
			 *    } );
			 */
			"sScrollX": "",
		
		
			/**
			 * This property can be used to force a DataTable to use more width than it
			 * might otherwise do when x-scrolling is enabled. For example if you have a
			 * table which requires to be well spaced, this parameter is useful for
			 * "over-sizing" the table, and thus forcing scrolling. This property can by
			 * any CSS unit, or a number (in which case it will be treated as a pixel
			 * measurement).
			 *  @type string
			 *  @default <i>blank string - i.e. disabled</i>
			 *
			 *  @dtopt Options
			 *  @name DataTable.defaults.scrollXInner
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "scrollX": "100%",
			 *        "scrollXInner": "110%"
			 *      } );
			 *    } );
			 */
			"sScrollXInner": "",
		
		
			/**
			 * Enable vertical scrolling. Vertical scrolling will constrain the DataTable
			 * to the given height, and enable scrolling for any data which overflows the
			 * current viewport. This can be used as an alternative to paging to display
			 * a lot of data in a small area (although paging and scrolling can both be
			 * enabled at the same time). This property can be any CSS unit, or a number
			 * (in which case it will be treated as a pixel measurement).
			 *  @type string
			 *  @default <i>blank string - i.e. disabled</i>
			 *
			 *  @dtopt Features
			 *  @name DataTable.defaults.scrollY
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "scrollY": "200px",
			 *        "paginate": false
			 *      } );
			 *    } );
			 */
			"sScrollY": "",
		
		
			/**
			 * __Deprecated__ The functionality provided by this parameter has now been
			 * superseded by that provided through `ajax`, which should be used instead.
			 *
			 * Set the HTTP method that is used to make the Ajax call for server-side
			 * processing or Ajax sourced data.
			 *  @type string
			 *  @default GET
			 *
			 *  @dtopt Options
			 *  @dtopt Server-side
			 *  @name DataTable.defaults.serverMethod
			 *
			 *  @deprecated 1.10. Please use `ajax` for this functionality now.
			 */
			"sServerMethod": "GET",
		
		
			/**
			 * DataTables makes use of renderers when displaying HTML elements for
			 * a table. These renderers can be added or modified by plug-ins to
			 * generate suitable mark-up for a site. For example the Bootstrap
			 * integration plug-in for DataTables uses a paging button renderer to
			 * display pagination buttons in the mark-up required by Bootstrap.
			 *
			 * For further information about the renderers available see
			 * DataTable.ext.renderer
			 *  @type string|object
			 *  @default null
			 *
			 *  @name DataTable.defaults.renderer
			 *
			 */
			"renderer": null,
		
		
			/**
			 * Set the data property name that DataTables should use to get a row's id
			 * to set as the `id` property in the node.
			 *  @type string
			 *  @default DT_RowId
			 *
			 *  @name DataTable.defaults.rowId
			 */
			"rowId": "DT_RowId"
		};
		
		_fnHungarianMap( DataTable.defaults );
		
		
		
		/*
		 * Developer note - See note in model.defaults.js about the use of Hungarian
		 * notation and camel case.
		 */
		
		/**
		 * Column options that can be given to DataTables at initialisation time.
		 *  @namespace
		 */
		DataTable.defaults.column = {
			/**
			 * Define which column(s) an order will occur on for this column. This
			 * allows a column's ordering to take multiple columns into account when
			 * doing a sort or use the data from a different column. For example first
			 * name / last name columns make sense to do a multi-column sort over the
			 * two columns.
			 *  @type array|int
			 *  @default null <i>Takes the value of the column index automatically</i>
			 *
			 *  @name DataTable.defaults.column.orderData
			 *  @dtopt Columns
			 *
			 *  @example
			 *    // Using `columnDefs`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [
			 *          { "orderData": [ 0, 1 ], "targets": [ 0 ] },
			 *          { "orderData": [ 1, 0 ], "targets": [ 1 ] },
			 *          { "orderData": 2, "targets": [ 2 ] }
			 *        ]
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Using `columns`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columns": [
			 *          { "orderData": [ 0, 1 ] },
			 *          { "orderData": [ 1, 0 ] },
			 *          { "orderData": 2 },
			 *          null,
			 *          null
			 *        ]
			 *      } );
			 *    } );
			 */
			"aDataSort": null,
			"iDataSort": -1,
		
		
			/**
			 * You can control the default ordering direction, and even alter the
			 * behaviour of the sort handler (i.e. only allow ascending ordering etc)
			 * using this parameter.
			 *  @type array
			 *  @default [ 'asc', 'desc' ]
			 *
			 *  @name DataTable.defaults.column.orderSequence
			 *  @dtopt Columns
			 *
			 *  @example
			 *    // Using `columnDefs`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [
			 *          { "orderSequence": [ "asc" ], "targets": [ 1 ] },
			 *          { "orderSequence": [ "desc", "asc", "asc" ], "targets": [ 2 ] },
			 *          { "orderSequence": [ "desc" ], "targets": [ 3 ] }
			 *        ]
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Using `columns`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columns": [
			 *          null,
			 *          { "orderSequence": [ "asc" ] },
			 *          { "orderSequence": [ "desc", "asc", "asc" ] },
			 *          { "orderSequence": [ "desc" ] },
			 *          null
			 *        ]
			 *      } );
			 *    } );
			 */
			"asSorting": [ 'asc', 'desc' ],
		
		
			/**
			 * Enable or disable filtering on the data in this column.
			 *  @type boolean
			 *  @default true
			 *
			 *  @name DataTable.defaults.column.searchable
			 *  @dtopt Columns
			 *
			 *  @example
			 *    // Using `columnDefs`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [
			 *          { "searchable": false, "targets": [ 0 ] }
			 *        ] } );
			 *    } );
			 *
			 *  @example
			 *    // Using `columns`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columns": [
			 *          { "searchable": false },
			 *          null,
			 *          null,
			 *          null,
			 *          null
			 *        ] } );
			 *    } );
			 */
			"bSearchable": true,
		
		
			/**
			 * Enable or disable ordering on this column.
			 *  @type boolean
			 *  @default true
			 *
			 *  @name DataTable.defaults.column.orderable
			 *  @dtopt Columns
			 *
			 *  @example
			 *    // Using `columnDefs`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [
			 *          { "orderable": false, "targets": [ 0 ] }
			 *        ] } );
			 *    } );
			 *
			 *  @example
			 *    // Using `columns`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columns": [
			 *          { "orderable": false },
			 *          null,
			 *          null,
			 *          null,
			 *          null
			 *        ] } );
			 *    } );
			 */
			"bSortable": true,
		
		
			/**
			 * Enable or disable the display of this column.
			 *  @type boolean
			 *  @default true
			 *
			 *  @name DataTable.defaults.column.visible
			 *  @dtopt Columns
			 *
			 *  @example
			 *    // Using `columnDefs`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [
			 *          { "visible": false, "targets": [ 0 ] }
			 *        ] } );
			 *    } );
			 *
			 *  @example
			 *    // Using `columns`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columns": [
			 *          { "visible": false },
			 *          null,
			 *          null,
			 *          null,
			 *          null
			 *        ] } );
			 *    } );
			 */
			"bVisible": true,
		
		
			/**
			 * Developer definable function that is called whenever a cell is created (Ajax source,
			 * etc) or processed for input (DOM source). This can be used as a compliment to mRender
			 * allowing you to modify the DOM element (add background colour for example) when the
			 * element is available.
			 *  @type function
			 *  @param {element} td The TD node that has been created
			 *  @param {*} cellData The Data for the cell
			 *  @param {array|object} rowData The data for the whole row
			 *  @param {int} row The row index for the aoData data store
			 *  @param {int} col The column index for aoColumns
			 *
			 *  @name DataTable.defaults.column.createdCell
			 *  @dtopt Columns
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [ {
			 *          "targets": [3],
			 *          "createdCell": function (td, cellData, rowData, row, col) {
			 *            if ( cellData == "1.7" ) {
			 *              $(td).css('color', 'blue')
			 *            }
			 *          }
			 *        } ]
			 *      });
			 *    } );
			 */
			"fnCreatedCell": null,
		
		
			/**
			 * This parameter has been replaced by `data` in DataTables to ensure naming
			 * consistency. `dataProp` can still be used, as there is backwards
			 * compatibility in DataTables for this option, but it is strongly
			 * recommended that you use `data` in preference to `dataProp`.
			 *  @name DataTable.defaults.column.dataProp
			 */
		
		
			/**
			 * This property can be used to read data from any data source property,
			 * including deeply nested objects / properties. `data` can be given in a
			 * number of different ways which effect its behaviour:
			 *
			 * * `integer` - treated as an array index for the data source. This is the
			 *   default that DataTables uses (incrementally increased for each column).
			 * * `string` - read an object property from the data source. There are
			 *   three 'special' options that can be used in the string to alter how
			 *   DataTables reads the data from the source object:
			 *    * `.` - Dotted Javascript notation. Just as you use a `.` in
			 *      Javascript to read from nested objects, so to can the options
			 *      specified in `data`. For example: `browser.version` or
			 *      `browser.name`. If your object parameter name contains a period, use
			 *      `\\` to escape it - i.e. `first\\.name`.
			 *    * `[]` - Array notation. DataTables can automatically combine data
			 *      from and array source, joining the data with the characters provided
			 *      between the two brackets. For example: `name[, ]` would provide a
			 *      comma-space separated list from the source array. If no characters
			 *      are provided between the brackets, the original array source is
			 *      returned.
			 *    * `()` - Function notation. Adding `()` to the end of a parameter will
			 *      execute a function of the name given. For example: `browser()` for a
			 *      simple function on the data source, `browser.version()` for a
			 *      function in a nested property or even `browser().version` to get an
			 *      object property if the function called returns an object. Note that
			 *      function notation is recommended for use in `render` rather than
			 *      `data` as it is much simpler to use as a renderer.
			 * * `null` - use the original data source for the row rather than plucking
			 *   data directly from it. This action has effects on two other
			 *   initialisation options:
			 *    * `defaultContent` - When null is given as the `data` option and
			 *      `defaultContent` is specified for the column, the value defined by
			 *      `defaultContent` will be used for the cell.
			 *    * `render` - When null is used for the `data` option and the `render`
			 *      option is specified for the column, the whole data source for the
			 *      row is used for the renderer.
			 * * `function` - the function given will be executed whenever DataTables
			 *   needs to set or get the data for a cell in the column. The function
			 *   takes three parameters:
			 *    * Parameters:
			 *      * `{array|object}` The data source for the row
			 *      * `{string}` The type call data requested - this will be 'set' when
			 *        setting data or 'filter', 'display', 'type', 'sort' or undefined
			 *        when gathering data. Note that when `undefined` is given for the
			 *        type DataTables expects to get the raw data for the object back<
			 *      * `{*}` Data to set when the second parameter is 'set'.
			 *    * Return:
			 *      * The return value from the function is not required when 'set' is
			 *        the type of call, but otherwise the return is what will be used
			 *        for the data requested.
			 *
			 * Note that `data` is a getter and setter option. If you just require
			 * formatting of data for output, you will likely want to use `render` which
			 * is simply a getter and thus simpler to use.
			 *
			 * Note that prior to DataTables 1.9.2 `data` was called `mDataProp`. The
			 * name change reflects the flexibility of this property and is consistent
			 * with the naming of mRender. If 'mDataProp' is given, then it will still
			 * be used by DataTables, as it automatically maps the old name to the new
			 * if required.
			 *
			 *  @type string|int|function|null
			 *  @default null <i>Use automatically calculated column index</i>
			 *
			 *  @name DataTable.defaults.column.data
			 *  @dtopt Columns
			 *
			 *  @example
			 *    // Read table data from objects
			 *    // JSON structure for each row:
			 *    //   {
			 *    //      "engine": {value},
			 *    //      "browser": {value},
			 *    //      "platform": {value},
			 *    //      "version": {value},
			 *    //      "grade": {value}
			 *    //   }
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "ajaxSource": "sources/objects.txt",
			 *        "columns": [
			 *          { "data": "engine" },
			 *          { "data": "browser" },
			 *          { "data": "platform" },
			 *          { "data": "version" },
			 *          { "data": "grade" }
			 *        ]
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Read information from deeply nested objects
			 *    // JSON structure for each row:
			 *    //   {
			 *    //      "engine": {value},
			 *    //      "browser": {value},
			 *    //      "platform": {
			 *    //         "inner": {value}
			 *    //      },
			 *    //      "details": [
			 *    //         {value}, {value}
			 *    //      ]
			 *    //   }
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "ajaxSource": "sources/deep.txt",
			 *        "columns": [
			 *          { "data": "engine" },
			 *          { "data": "browser" },
			 *          { "data": "platform.inner" },
			 *          { "data": "platform.details.0" },
			 *          { "data": "platform.details.1" }
			 *        ]
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Using `data` as a function to provide different information for
			 *    // sorting, filtering and display. In this case, currency (price)
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [ {
			 *          "targets": [ 0 ],
			 *          "data": function ( source, type, val ) {
			 *            if (type === 'set') {
			 *              source.price = val;
			 *              // Store the computed dislay and filter values for efficiency
			 *              source.price_display = val=="" ? "" : "$"+numberFormat(val);
			 *              source.price_filter  = val=="" ? "" : "$"+numberFormat(val)+" "+val;
			 *              return;
			 *            }
			 *            else if (type === 'display') {
			 *              return source.price_display;
			 *            }
			 *            else if (type === 'filter') {
			 *              return source.price_filter;
			 *            }
			 *            // 'sort', 'type' and undefined all just use the integer
			 *            return source.price;
			 *          }
			 *        } ]
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Using default content
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [ {
			 *          "targets": [ 0 ],
			 *          "data": null,
			 *          "defaultContent": "Click to edit"
			 *        } ]
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Using array notation - outputting a list from an array
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [ {
			 *          "targets": [ 0 ],
			 *          "data": "name[, ]"
			 *        } ]
			 *      } );
			 *    } );
			 *
			 */
			"mData": null,
		
		
			/**
			 * This property is the rendering partner to `data` and it is suggested that
			 * when you want to manipulate data for display (including filtering,
			 * sorting etc) without altering the underlying data for the table, use this
			 * property. `render` can be considered to be the the read only companion to
			 * `data` which is read / write (then as such more complex). Like `data`
			 * this option can be given in a number of different ways to effect its
			 * behaviour:
			 *
			 * * `integer` - treated as an array index for the data source. This is the
			 *   default that DataTables uses (incrementally increased for each column).
			 * * `string` - read an object property from the data source. There are
			 *   three 'special' options that can be used in the string to alter how
			 *   DataTables reads the data from the source object:
			 *    * `.` - Dotted Javascript notation. Just as you use a `.` in
			 *      Javascript to read from nested objects, so to can the options
			 *      specified in `data`. For example: `browser.version` or
			 *      `browser.name`. If your object parameter name contains a period, use
			 *      `\\` to escape it - i.e. `first\\.name`.
			 *    * `[]` - Array notation. DataTables can automatically combine data
			 *      from and array source, joining the data with the characters provided
			 *      between the two brackets. For example: `name[, ]` would provide a
			 *      comma-space separated list from the source array. If no characters
			 *      are provided between the brackets, the original array source is
			 *      returned.
			 *    * `()` - Function notation. Adding `()` to the end of a parameter will
			 *      execute a function of the name given. For example: `browser()` for a
			 *      simple function on the data source, `browser.version()` for a
			 *      function in a nested property or even `browser().version` to get an
			 *      object property if the function called returns an object.
			 * * `object` - use different data for the different data types requested by
			 *   DataTables ('filter', 'display', 'type' or 'sort'). The property names
			 *   of the object is the data type the property refers to and the value can
			 *   defined using an integer, string or function using the same rules as
			 *   `render` normally does. Note that an `_` option _must_ be specified.
			 *   This is the default value to use if you haven't specified a value for
			 *   the data type requested by DataTables.
			 * * `function` - the function given will be executed whenever DataTables
			 *   needs to set or get the data for a cell in the column. The function
			 *   takes three parameters:
			 *    * Parameters:
			 *      * {array|object} The data source for the row (based on `data`)
			 *      * {string} The type call data requested - this will be 'filter',
			 *        'display', 'type' or 'sort'.
			 *      * {array|object} The full data source for the row (not based on
			 *        `data`)
			 *    * Return:
			 *      * The return value from the function is what will be used for the
			 *        data requested.
			 *
			 *  @type string|int|function|object|null
			 *  @default null Use the data source value.
			 *
			 *  @name DataTable.defaults.column.render
			 *  @dtopt Columns
			 *
			 *  @example
			 *    // Create a comma separated list from an array of objects
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "ajaxSource": "sources/deep.txt",
			 *        "columns": [
			 *          { "data": "engine" },
			 *          { "data": "browser" },
			 *          {
			 *            "data": "platform",
			 *            "render": "[, ].name"
			 *          }
			 *        ]
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Execute a function to obtain data
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [ {
			 *          "targets": [ 0 ],
			 *          "data": null, // Use the full data source object for the renderer's source
			 *          "render": "browserName()"
			 *        } ]
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // As an object, extracting different data for the different types
			 *    // This would be used with a data source such as:
			 *    //   { "phone": 5552368, "phone_filter": "5552368 555-2368", "phone_display": "555-2368" }
			 *    // Here the `phone` integer is used for sorting and type detection, while `phone_filter`
			 *    // (which has both forms) is used for filtering for if a user inputs either format, while
			 *    // the formatted phone number is the one that is shown in the table.
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [ {
			 *          "targets": [ 0 ],
			 *          "data": null, // Use the full data source object for the renderer's source
			 *          "render": {
			 *            "_": "phone",
			 *            "filter": "phone_filter",
			 *            "display": "phone_display"
			 *          }
			 *        } ]
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Use as a function to create a link from the data source
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [ {
			 *          "targets": [ 0 ],
			 *          "data": "download_link",
			 *          "render": function ( data, type, full ) {
			 *            return '<a href="'+data+'">Download</a>';
			 *          }
			 *        } ]
			 *      } );
			 *    } );
			 */
			"mRender": null,
		
		
			/**
			 * Change the cell type created for the column - either TD cells or TH cells. This
			 * can be useful as TH cells have semantic meaning in the table body, allowing them
			 * to act as a header for a row (you may wish to add scope='row' to the TH elements).
			 *  @type string
			 *  @default td
			 *
			 *  @name DataTable.defaults.column.cellType
			 *  @dtopt Columns
			 *
			 *  @example
			 *    // Make the first column use TH cells
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [ {
			 *          "targets": [ 0 ],
			 *          "cellType": "th"
			 *        } ]
			 *      } );
			 *    } );
			 */
			"sCellType": "td",
		
		
			/**
			 * Class to give to each cell in this column.
			 *  @type string
			 *  @default <i>Empty string</i>
			 *
			 *  @name DataTable.defaults.column.class
			 *  @dtopt Columns
			 *
			 *  @example
			 *    // Using `columnDefs`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [
			 *          { "class": "my_class", "targets": [ 0 ] }
			 *        ]
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Using `columns`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columns": [
			 *          { "class": "my_class" },
			 *          null,
			 *          null,
			 *          null,
			 *          null
			 *        ]
			 *      } );
			 *    } );
			 */
			"sClass": "",
		
			/**
			 * When DataTables calculates the column widths to assign to each column,
			 * it finds the longest string in each column and then constructs a
			 * temporary table and reads the widths from that. The problem with this
			 * is that "mmm" is much wider then "iiii", but the latter is a longer
			 * string - thus the calculation can go wrong (doing it properly and putting
			 * it into an DOM object and measuring that is horribly(!) slow). Thus as
			 * a "work around" we provide this option. It will append its value to the
			 * text that is found to be the longest string for the column - i.e. padding.
			 * Generally you shouldn't need this!
			 *  @type string
			 *  @default <i>Empty string<i>
			 *
			 *  @name DataTable.defaults.column.contentPadding
			 *  @dtopt Columns
			 *
			 *  @example
			 *    // Using `columns`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columns": [
			 *          null,
			 *          null,
			 *          null,
			 *          {
			 *            "contentPadding": "mmm"
			 *          }
			 *        ]
			 *      } );
			 *    } );
			 */
			"sContentPadding": "",
		
		
			/**
			 * Allows a default value to be given for a column's data, and will be used
			 * whenever a null data source is encountered (this can be because `data`
			 * is set to null, or because the data source itself is null).
			 *  @type string
			 *  @default null
			 *
			 *  @name DataTable.defaults.column.defaultContent
			 *  @dtopt Columns
			 *
			 *  @example
			 *    // Using `columnDefs`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [
			 *          {
			 *            "data": null,
			 *            "defaultContent": "Edit",
			 *            "targets": [ -1 ]
			 *          }
			 *        ]
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Using `columns`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columns": [
			 *          null,
			 *          null,
			 *          null,
			 *          {
			 *            "data": null,
			 *            "defaultContent": "Edit"
			 *          }
			 *        ]
			 *      } );
			 *    } );
			 */
			"sDefaultContent": null,
		
		
			/**
			 * This parameter is only used in DataTables' server-side processing. It can
			 * be exceptionally useful to know what columns are being displayed on the
			 * client side, and to map these to database fields. When defined, the names
			 * also allow DataTables to reorder information from the server if it comes
			 * back in an unexpected order (i.e. if you switch your columns around on the
			 * client-side, your server-side code does not also need updating).
			 *  @type string
			 *  @default <i>Empty string</i>
			 *
			 *  @name DataTable.defaults.column.name
			 *  @dtopt Columns
			 *
			 *  @example
			 *    // Using `columnDefs`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [
			 *          { "name": "engine", "targets": [ 0 ] },
			 *          { "name": "browser", "targets": [ 1 ] },
			 *          { "name": "platform", "targets": [ 2 ] },
			 *          { "name": "version", "targets": [ 3 ] },
			 *          { "name": "grade", "targets": [ 4 ] }
			 *        ]
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Using `columns`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columns": [
			 *          { "name": "engine" },
			 *          { "name": "browser" },
			 *          { "name": "platform" },
			 *          { "name": "version" },
			 *          { "name": "grade" }
			 *        ]
			 *      } );
			 *    } );
			 */
			"sName": "",
		
		
			/**
			 * Defines a data source type for the ordering which can be used to read
			 * real-time information from the table (updating the internally cached
			 * version) prior to ordering. This allows ordering to occur on user
			 * editable elements such as form inputs.
			 *  @type string
			 *  @default std
			 *
			 *  @name DataTable.defaults.column.orderDataType
			 *  @dtopt Columns
			 *
			 *  @example
			 *    // Using `columnDefs`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [
			 *          { "orderDataType": "dom-text", "targets": [ 2, 3 ] },
			 *          { "type": "numeric", "targets": [ 3 ] },
			 *          { "orderDataType": "dom-select", "targets": [ 4 ] },
			 *          { "orderDataType": "dom-checkbox", "targets": [ 5 ] }
			 *        ]
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Using `columns`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columns": [
			 *          null,
			 *          null,
			 *          { "orderDataType": "dom-text" },
			 *          { "orderDataType": "dom-text", "type": "numeric" },
			 *          { "orderDataType": "dom-select" },
			 *          { "orderDataType": "dom-checkbox" }
			 *        ]
			 *      } );
			 *    } );
			 */
			"sSortDataType": "std",
		
		
			/**
			 * The title of this column.
			 *  @type string
			 *  @default null <i>Derived from the 'TH' value for this column in the
			 *    original HTML table.</i>
			 *
			 *  @name DataTable.defaults.column.title
			 *  @dtopt Columns
			 *
			 *  @example
			 *    // Using `columnDefs`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [
			 *          { "title": "My column title", "targets": [ 0 ] }
			 *        ]
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Using `columns`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columns": [
			 *          { "title": "My column title" },
			 *          null,
			 *          null,
			 *          null,
			 *          null
			 *        ]
			 *      } );
			 *    } );
			 */
			"sTitle": null,
		
		
			/**
			 * The type allows you to specify how the data for this column will be
			 * ordered. Four types (string, numeric, date and html (which will strip
			 * HTML tags before ordering)) are currently available. Note that only date
			 * formats understood by Javascript's Date() object will be accepted as type
			 * date. For example: "Mar 26, 2008 5:03 PM". May take the values: 'string',
			 * 'numeric', 'date' or 'html' (by default). Further types can be adding
			 * through plug-ins.
			 *  @type string
			 *  @default null <i>Auto-detected from raw data</i>
			 *
			 *  @name DataTable.defaults.column.type
			 *  @dtopt Columns
			 *
			 *  @example
			 *    // Using `columnDefs`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [
			 *          { "type": "html", "targets": [ 0 ] }
			 *        ]
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Using `columns`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columns": [
			 *          { "type": "html" },
			 *          null,
			 *          null,
			 *          null,
			 *          null
			 *        ]
			 *      } );
			 *    } );
			 */
			"sType": null,
		
		
			/**
			 * Defining the width of the column, this parameter may take any CSS value
			 * (3em, 20px etc). DataTables applies 'smart' widths to columns which have not
			 * been given a specific width through this interface ensuring that the table
			 * remains readable.
			 *  @type string
			 *  @default null <i>Automatic</i>
			 *
			 *  @name DataTable.defaults.column.width
			 *  @dtopt Columns
			 *
			 *  @example
			 *    // Using `columnDefs`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [
			 *          { "width": "20%", "targets": [ 0 ] }
			 *        ]
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Using `columns`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columns": [
			 *          { "width": "20%" },
			 *          null,
			 *          null,
			 *          null,
			 *          null
			 *        ]
			 *      } );
			 *    } );
			 */
			"sWidth": null
		};
		
		_fnHungarianMap( DataTable.defaults.column );
		
		
		
		/**
		 * DataTables settings object - this holds all the information needed for a
		 * given table, including configuration, data and current application of the
		 * table options. DataTables does not have a single instance for each DataTable
		 * with the settings attached to that instance, but rather instances of the
		 * DataTable "class" are created on-the-fly as needed (typically by a
		 * $().dataTable() call) and the settings object is then applied to that
		 * instance.
		 *
		 * Note that this object is related to {@link DataTable.defaults} but this
		 * one is the internal data store for DataTables's cache of columns. It should
		 * NOT be manipulated outside of DataTables. Any configuration should be done
		 * through the initialisation options.
		 *  @namespace
		 *  @todo Really should attach the settings object to individual instances so we
		 *    don't need to create new instances on each $().dataTable() call (if the
		 *    table already exists). It would also save passing oSettings around and
		 *    into every single function. However, this is a very significant
		 *    architecture change for DataTables and will almost certainly break
		 *    backwards compatibility with older installations. This is something that
		 *    will be done in 2.0.
		 */
		DataTable.models.oSettings = {
			/**
			 * Primary features of DataTables and their enablement state.
			 *  @namespace
			 */
			"oFeatures": {
		
				/**
				 * Flag to say if DataTables should automatically try to calculate the
				 * optimum table and columns widths (true) or not (false).
				 * Note that this parameter will be set by the initialisation routine. To
				 * set a default use {@link DataTable.defaults}.
				 *  @type boolean
				 */
				"bAutoWidth": null,
		
				/**
				 * Delay the creation of TR and TD elements until they are actually
				 * needed by a driven page draw. This can give a significant speed
				 * increase for Ajax source and Javascript source data, but makes no
				 * difference at all fro DOM and server-side processing tables.
				 * Note that this parameter will be set by the initialisation routine. To
				 * set a default use {@link DataTable.defaults}.
				 *  @type boolean
				 */
				"bDeferRender": null,
		
				/**
				 * Enable filtering on the table or not. Note that if this is disabled
				 * then there is no filtering at all on the table, including fnFilter.
				 * To just remove the filtering input use sDom and remove the 'f' option.
				 * Note that this parameter will be set by the initialisation routine. To
				 * set a default use {@link DataTable.defaults}.
				 *  @type boolean
				 */
				"bFilter": null,
		
				/**
				 * Table information element (the 'Showing x of y records' div) enable
				 * flag.
				 * Note that this parameter will be set by the initialisation routine. To
				 * set a default use {@link DataTable.defaults}.
				 *  @type boolean
				 */
				"bInfo": null,
		
				/**
				 * Present a user control allowing the end user to change the page size
				 * when pagination is enabled.
				 * Note that this parameter will be set by the initialisation routine. To
				 * set a default use {@link DataTable.defaults}.
				 *  @type boolean
				 */
				"bLengthChange": null,
		
				/**
				 * Pagination enabled or not. Note that if this is disabled then length
				 * changing must also be disabled.
				 * Note that this parameter will be set by the initialisation routine. To
				 * set a default use {@link DataTable.defaults}.
				 *  @type boolean
				 */
				"bPaginate": null,
		
				/**
				 * Processing indicator enable flag whenever DataTables is enacting a
				 * user request - typically an Ajax request for server-side processing.
				 * Note that this parameter will be set by the initialisation routine. To
				 * set a default use {@link DataTable.defaults}.
				 *  @type boolean
				 */
				"bProcessing": null,
		
				/**
				 * Server-side processing enabled flag - when enabled DataTables will
				 * get all data from the server for every draw - there is no filtering,
				 * sorting or paging done on the client-side.
				 * Note that this parameter will be set by the initialisation routine. To
				 * set a default use {@link DataTable.defaults}.
				 *  @type boolean
				 */
				"bServerSide": null,
		
				/**
				 * Sorting enablement flag.
				 * Note that this parameter will be set by the initialisation routine. To
				 * set a default use {@link DataTable.defaults}.
				 *  @type boolean
				 */
				"bSort": null,
		
				/**
				 * Multi-column sorting
				 * Note that this parameter will be set by the initialisation routine. To
				 * set a default use {@link DataTable.defaults}.
				 *  @type boolean
				 */
				"bSortMulti": null,
		
				/**
				 * Apply a class to the columns which are being sorted to provide a
				 * visual highlight or not. This can slow things down when enabled since
				 * there is a lot of DOM interaction.
				 * Note that this parameter will be set by the initialisation routine. To
				 * set a default use {@link DataTable.defaults}.
				 *  @type boolean
				 */
				"bSortClasses": null,
		
				/**
				 * State saving enablement flag.
				 * Note that this parameter will be set by the initialisation routine. To
				 * set a default use {@link DataTable.defaults}.
				 *  @type boolean
				 */
				"bStateSave": null
			},
		
		
			/**
			 * Scrolling settings for a table.
			 *  @namespace
			 */
			"oScroll": {
				/**
				 * When the table is shorter in height than sScrollY, collapse the
				 * table container down to the height of the table (when true).
				 * Note that this parameter will be set by the initialisation routine. To
				 * set a default use {@link DataTable.defaults}.
				 *  @type boolean
				 */
				"bCollapse": null,
		
				/**
				 * Width of the scrollbar for the web-browser's platform. Calculated
				 * during table initialisation.
				 *  @type int
				 *  @default 0
				 */
				"iBarWidth": 0,
		
				/**
				 * Viewport width for horizontal scrolling. Horizontal scrolling is
				 * disabled if an empty string.
				 * Note that this parameter will be set by the initialisation routine. To
				 * set a default use {@link DataTable.defaults}.
				 *  @type string
				 */
				"sX": null,
		
				/**
				 * Width to expand the table to when using x-scrolling. Typically you
				 * should not need to use this.
				 * Note that this parameter will be set by the initialisation routine. To
				 * set a default use {@link DataTable.defaults}.
				 *  @type string
				 *  @deprecated
				 */
				"sXInner": null,
		
				/**
				 * Viewport height for vertical scrolling. Vertical scrolling is disabled
				 * if an empty string.
				 * Note that this parameter will be set by the initialisation routine. To
				 * set a default use {@link DataTable.defaults}.
				 *  @type string
				 */
				"sY": null
			},
		
			/**
			 * Language information for the table.
			 *  @namespace
			 *  @extends DataTable.defaults.oLanguage
			 */
			"oLanguage": {
				/**
				 * Information callback function. See
				 * {@link DataTable.defaults.fnInfoCallback}
				 *  @type function
				 *  @default null
				 */
				"fnInfoCallback": null
			},
		
			/**
			 * Browser support parameters
			 *  @namespace
			 */
			"oBrowser": {
				/**
				 * Indicate if the browser incorrectly calculates width:100% inside a
				 * scrolling element (IE6/7)
				 *  @type boolean
				 *  @default false
				 */
				"bScrollOversize": false,
		
				/**
				 * Determine if the vertical scrollbar is on the right or left of the
				 * scrolling container - needed for rtl language layout, although not
				 * all browsers move the scrollbar (Safari).
				 *  @type boolean
				 *  @default false
				 */
				"bScrollbarLeft": false,
		
				/**
				 * Flag for if `getBoundingClientRect` is fully supported or not
				 *  @type boolean
				 *  @default false
				 */
				"bBounding": false,
		
				/**
				 * Browser scrollbar width
				 *  @type integer
				 *  @default 0
				 */
				"barWidth": 0
			},
		
		
			"ajax": null,
		
		
			/**
			 * Array referencing the nodes which are used for the features. The
			 * parameters of this object match what is allowed by sDom - i.e.
			 *   <ul>
			 *     <li>'l' - Length changing</li>
			 *     <li>'f' - Filtering input</li>
			 *     <li>'t' - The table!</li>
			 *     <li>'i' - Information</li>
			 *     <li>'p' - Pagination</li>
			 *     <li>'r' - pRocessing</li>
			 *   </ul>
			 *  @type array
			 *  @default []
			 */
			"aanFeatures": [],
		
			/**
			 * Store data information - see {@link DataTable.models.oRow} for detailed
			 * information.
			 *  @type array
			 *  @default []
			 */
			"aoData": [],
		
			/**
			 * Array of indexes which are in the current display (after filtering etc)
			 *  @type array
			 *  @default []
			 */
			"aiDisplay": [],
		
			/**
			 * Array of indexes for display - no filtering
			 *  @type array
			 *  @default []
			 */
			"aiDisplayMaster": [],
		
			/**
			 * Map of row ids to data indexes
			 *  @type object
			 *  @default {}
			 */
			"aIds": {},
		
			/**
			 * Store information about each column that is in use
			 *  @type array
			 *  @default []
			 */
			"aoColumns": [],
		
			/**
			 * Store information about the table's header
			 *  @type array
			 *  @default []
			 */
			"aoHeader": [],
		
			/**
			 * Store information about the table's footer
			 *  @type array
			 *  @default []
			 */
			"aoFooter": [],
		
			/**
			 * Store the applied global search information in case we want to force a
			 * research or compare the old search to a new one.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @namespace
			 *  @extends DataTable.models.oSearch
			 */
			"oPreviousSearch": {},
		
			/**
			 * Store the applied search for each column - see
			 * {@link DataTable.models.oSearch} for the format that is used for the
			 * filtering information for each column.
			 *  @type array
			 *  @default []
			 */
			"aoPreSearchCols": [],
		
			/**
			 * Sorting that is applied to the table. Note that the inner arrays are
			 * used in the following manner:
			 * <ul>
			 *   <li>Index 0 - column number</li>
			 *   <li>Index 1 - current sorting direction</li>
			 * </ul>
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type array
			 *  @todo These inner arrays should really be objects
			 */
			"aaSorting": null,
		
			/**
			 * Sorting that is always applied to the table (i.e. prefixed in front of
			 * aaSorting).
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type array
			 *  @default []
			 */
			"aaSortingFixed": [],
		
			/**
			 * Classes to use for the striping of a table.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type array
			 *  @default []
			 */
			"asStripeClasses": null,
		
			/**
			 * If restoring a table - we should restore its striping classes as well
			 *  @type array
			 *  @default []
			 */
			"asDestroyStripes": [],
		
			/**
			 * If restoring a table - we should restore its width
			 *  @type int
			 *  @default 0
			 */
			"sDestroyWidth": 0,
		
			/**
			 * Callback functions array for every time a row is inserted (i.e. on a draw).
			 *  @type array
			 *  @default []
			 */
			"aoRowCallback": [],
		
			/**
			 * Callback functions for the header on each draw.
			 *  @type array
			 *  @default []
			 */
			"aoHeaderCallback": [],
		
			/**
			 * Callback function for the footer on each draw.
			 *  @type array
			 *  @default []
			 */
			"aoFooterCallback": [],
		
			/**
			 * Array of callback functions for draw callback functions
			 *  @type array
			 *  @default []
			 */
			"aoDrawCallback": [],
		
			/**
			 * Array of callback functions for row created function
			 *  @type array
			 *  @default []
			 */
			"aoRowCreatedCallback": [],
		
			/**
			 * Callback functions for just before the table is redrawn. A return of
			 * false will be used to cancel the draw.
			 *  @type array
			 *  @default []
			 */
			"aoPreDrawCallback": [],
		
			/**
			 * Callback functions for when the table has been initialised.
			 *  @type array
			 *  @default []
			 */
			"aoInitComplete": [],
		
		
			/**
			 * Callbacks for modifying the settings to be stored for state saving, prior to
			 * saving state.
			 *  @type array
			 *  @default []
			 */
			"aoStateSaveParams": [],
		
			/**
			 * Callbacks for modifying the settings that have been stored for state saving
			 * prior to using the stored values to restore the state.
			 *  @type array
			 *  @default []
			 */
			"aoStateLoadParams": [],
		
			/**
			 * Callbacks for operating on the settings object once the saved state has been
			 * loaded
			 *  @type array
			 *  @default []
			 */
			"aoStateLoaded": [],
		
			/**
			 * Cache the table ID for quick access
			 *  @type string
			 *  @default <i>Empty string</i>
			 */
			"sTableId": "",
		
			/**
			 * The TABLE node for the main table
			 *  @type node
			 *  @default null
			 */
			"nTable": null,
		
			/**
			 * Permanent ref to the thead element
			 *  @type node
			 *  @default null
			 */
			"nTHead": null,
		
			/**
			 * Permanent ref to the tfoot element - if it exists
			 *  @type node
			 *  @default null
			 */
			"nTFoot": null,
		
			/**
			 * Permanent ref to the tbody element
			 *  @type node
			 *  @default null
			 */
			"nTBody": null,
		
			/**
			 * Cache the wrapper node (contains all DataTables controlled elements)
			 *  @type node
			 *  @default null
			 */
			"nTableWrapper": null,
		
			/**
			 * Indicate if when using server-side processing the loading of data
			 * should be deferred until the second draw.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 *  @default false
			 */
			"bDeferLoading": false,
		
			/**
			 * Indicate if all required information has been read in
			 *  @type boolean
			 *  @default false
			 */
			"bInitialised": false,
		
			/**
			 * Information about open rows. Each object in the array has the parameters
			 * 'nTr' and 'nParent'
			 *  @type array
			 *  @default []
			 */
			"aoOpenRows": [],
		
			/**
			 * Dictate the positioning of DataTables' control elements - see
			 * {@link DataTable.model.oInit.sDom}.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type string
			 *  @default null
			 */
			"sDom": null,
		
			/**
			 * Search delay (in mS)
			 *  @type integer
			 *  @default null
			 */
			"searchDelay": null,
		
			/**
			 * Which type of pagination should be used.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type string
			 *  @default two_button
			 */
			"sPaginationType": "two_button",
		
			/**
			 * The state duration (for `stateSave`) in seconds.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type int
			 *  @default 0
			 */
			"iStateDuration": 0,
		
			/**
			 * Array of callback functions for state saving. Each array element is an
			 * object with the following parameters:
			 *   <ul>
			 *     <li>function:fn - function to call. Takes two parameters, oSettings
			 *       and the JSON string to save that has been thus far created. Returns
			 *       a JSON string to be inserted into a json object
			 *       (i.e. '"param": [ 0, 1, 2]')</li>
			 *     <li>string:sName - name of callback</li>
			 *   </ul>
			 *  @type array
			 *  @default []
			 */
			"aoStateSave": [],
		
			/**
			 * Array of callback functions for state loading. Each array element is an
			 * object with the following parameters:
			 *   <ul>
			 *     <li>function:fn - function to call. Takes two parameters, oSettings
			 *       and the object stored. May return false to cancel state loading</li>
			 *     <li>string:sName - name of callback</li>
			 *   </ul>
			 *  @type array
			 *  @default []
			 */
			"aoStateLoad": [],
		
			/**
			 * State that was saved. Useful for back reference
			 *  @type object
			 *  @default null
			 */
			"oSavedState": null,
		
			/**
			 * State that was loaded. Useful for back reference
			 *  @type object
			 *  @default null
			 */
			"oLoadedState": null,
		
			/**
			 * Source url for AJAX data for the table.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type string
			 *  @default null
			 */
			"sAjaxSource": null,
		
			/**
			 * Property from a given object from which to read the table data from. This
			 * can be an empty string (when not server-side processing), in which case
			 * it is  assumed an an array is given directly.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type string
			 */
			"sAjaxDataProp": null,
		
			/**
			 * Note if draw should be blocked while getting data
			 *  @type boolean
			 *  @default true
			 */
			"bAjaxDataGet": true,
		
			/**
			 * The last jQuery XHR object that was used for server-side data gathering.
			 * This can be used for working with the XHR information in one of the
			 * callbacks
			 *  @type object
			 *  @default null
			 */
			"jqXHR": null,
		
			/**
			 * JSON returned from the server in the last Ajax request
			 *  @type object
			 *  @default undefined
			 */
			"json": undefined,
		
			/**
			 * Data submitted as part of the last Ajax request
			 *  @type object
			 *  @default undefined
			 */
			"oAjaxData": undefined,
		
			/**
			 * Function to get the server-side data.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type function
			 */
			"fnServerData": null,
		
			/**
			 * Functions which are called prior to sending an Ajax request so extra
			 * parameters can easily be sent to the server
			 *  @type array
			 *  @default []
			 */
			"aoServerParams": [],
		
			/**
			 * Send the XHR HTTP method - GET or POST (could be PUT or DELETE if
			 * required).
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type string
			 */
			"sServerMethod": null,
		
			/**
			 * Format numbers for display.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type function
			 */
			"fnFormatNumber": null,
		
			/**
			 * List of options that can be used for the user selectable length menu.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type array
			 *  @default []
			 */
			"aLengthMenu": null,
		
			/**
			 * Counter for the draws that the table does. Also used as a tracker for
			 * server-side processing
			 *  @type int
			 *  @default 0
			 */
			"iDraw": 0,
		
			/**
			 * Indicate if a redraw is being done - useful for Ajax
			 *  @type boolean
			 *  @default false
			 */
			"bDrawing": false,
		
			/**
			 * Draw index (iDraw) of the last error when parsing the returned data
			 *  @type int
			 *  @default -1
			 */
			"iDrawError": -1,
		
			/**
			 * Paging display length
			 *  @type int
			 *  @default 10
			 */
			"_iDisplayLength": 10,
		
			/**
			 * Paging start point - aiDisplay index
			 *  @type int
			 *  @default 0
			 */
			"_iDisplayStart": 0,
		
			/**
			 * Server-side processing - number of records in the result set
			 * (i.e. before filtering), Use fnRecordsTotal rather than
			 * this property to get the value of the number of records, regardless of
			 * the server-side processing setting.
			 *  @type int
			 *  @default 0
			 *  @private
			 */
			"_iRecordsTotal": 0,
		
			/**
			 * Server-side processing - number of records in the current display set
			 * (i.e. after filtering). Use fnRecordsDisplay rather than
			 * this property to get the value of the number of records, regardless of
			 * the server-side processing setting.
			 *  @type boolean
			 *  @default 0
			 *  @private
			 */
			"_iRecordsDisplay": 0,
		
			/**
			 * Flag to indicate if jQuery UI marking and classes should be used.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bJUI": null,
		
			/**
			 * The classes to use for the table
			 *  @type object
			 *  @default {}
			 */
			"oClasses": {},
		
			/**
			 * Flag attached to the settings object so you can check in the draw
			 * callback if filtering has been done in the draw. Deprecated in favour of
			 * events.
			 *  @type boolean
			 *  @default false
			 *  @deprecated
			 */
			"bFiltered": false,
		
			/**
			 * Flag attached to the settings object so you can check in the draw
			 * callback if sorting has been done in the draw. Deprecated in favour of
			 * events.
			 *  @type boolean
			 *  @default false
			 *  @deprecated
			 */
			"bSorted": false,
		
			/**
			 * Indicate that if multiple rows are in the header and there is more than
			 * one unique cell per column, if the top one (true) or bottom one (false)
			 * should be used for sorting / title by DataTables.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bSortCellsTop": null,
		
			/**
			 * Initialisation object that is used for the table
			 *  @type object
			 *  @default null
			 */
			"oInit": null,
		
			/**
			 * Destroy callback functions - for plug-ins to attach themselves to the
			 * destroy so they can clean up markup and events.
			 *  @type array
			 *  @default []
			 */
			"aoDestroyCallback": [],
		
		
			/**
			 * Get the number of records in the current record set, before filtering
			 *  @type function
			 */
			"fnRecordsTotal": function ()
			{
				return _fnDataSource( this ) == 'ssp' ?
					this._iRecordsTotal * 1 :
					this.aiDisplayMaster.length;
			},
		
			/**
			 * Get the number of records in the current record set, after filtering
			 *  @type function
			 */
			"fnRecordsDisplay": function ()
			{
				return _fnDataSource( this ) == 'ssp' ?
					this._iRecordsDisplay * 1 :
					this.aiDisplay.length;
			},
		
			/**
			 * Get the display end point - aiDisplay index
			 *  @type function
			 */
			"fnDisplayEnd": function ()
			{
				var
					len      = this._iDisplayLength,
					start    = this._iDisplayStart,
					calc     = start + len,
					records  = this.aiDisplay.length,
					features = this.oFeatures,
					paginate = features.bPaginate;
		
				if ( features.bServerSide ) {
					return paginate === false || len === -1 ?
						start + records :
						Math.min( start+len, this._iRecordsDisplay );
				}
				else {
					return ! paginate || calc>records || len===-1 ?
						records :
						calc;
				}
			},
		
			/**
			 * The DataTables object for this table
			 *  @type object
			 *  @default null
			 */
			"oInstance": null,
		
			/**
			 * Unique identifier for each instance of the DataTables object. If there
			 * is an ID on the table node, then it takes that value, otherwise an
			 * incrementing internal counter is used.
			 *  @type string
			 *  @default null
			 */
			"sInstance": null,
		
			/**
			 * tabindex attribute value that is added to DataTables control elements, allowing
			 * keyboard navigation of the table and its controls.
			 */
			"iTabIndex": 0,
		
			/**
			 * DIV container for the footer scrolling table if scrolling
			 */
			"nScrollHead": null,
		
			/**
			 * DIV container for the footer scrolling table if scrolling
			 */
			"nScrollFoot": null,
		
			/**
			 * Last applied sort
			 *  @type array
			 *  @default []
			 */
			"aLastSort": [],
		
			/**
			 * Stored plug-in instances
			 *  @type object
			 *  @default {}
			 */
			"oPlugins": {},
		
			/**
			 * Function used to get a row's id from the row's data
			 *  @type function
			 *  @default null
			 */
			"rowIdFn": null,
		
			/**
			 * Data location where to store a row's id
			 *  @type string
			 *  @default null
			 */
			"rowId": null
		};

		/**
		 * Extension object for DataTables that is used to provide all extension
		 * options.
		 *
		 * Note that the `DataTable.ext` object is available through
		 * `jQuery.fn.dataTable.ext` where it may be accessed and manipulated. It is
		 * also aliased to `jQuery.fn.dataTableExt` for historic reasons.
		 *  @namespace
		 *  @extends DataTable.models.ext
		 */
		
		
		/**
		 * DataTables extensions
		 * 
		 * This namespace acts as a collection area for plug-ins that can be used to
		 * extend DataTables capabilities. Indeed many of the build in methods
		 * use this method to provide their own capabilities (sorting methods for
		 * example).
		 *
		 * Note that this namespace is aliased to `jQuery.fn.dataTableExt` for legacy
		 * reasons
		 *
		 *  @namespace
		 */
		DataTable.ext = _ext = {
			/**
			 * Buttons. For use with the Buttons extension for DataTables. This is
			 * defined here so other extensions can define buttons regardless of load
			 * order. It is _not_ used by DataTables core.
			 *
			 *  @type object
			 *  @default {}
			 */
			buttons: {},
		
		
			/**
			 * Element class names
			 *
			 *  @type object
			 *  @default {}
			 */
			classes: {},
		
		
			/**
			 * DataTables build type (expanded by the download builder)
			 *
			 *  @type string
			 */
			builder: "-source-",
		
		
			/**
			 * Error reporting.
			 * 
			 * How should DataTables report an error. Can take the value 'alert',
			 * 'throw', 'none' or a function.
			 *
			 *  @type string|function
			 *  @default alert
			 */
			errMode: "alert",
		
		
			/**
			 * Feature plug-ins.
			 * 
			 * This is an array of objects which describe the feature plug-ins that are
			 * available to DataTables. These feature plug-ins are then available for
			 * use through the `dom` initialisation option.
			 * 
			 * Each feature plug-in is described by an object which must have the
			 * following properties:
			 * 
			 * * `fnInit` - function that is used to initialise the plug-in,
			 * * `cFeature` - a character so the feature can be enabled by the `dom`
			 *   instillation option. This is case sensitive.
			 *
			 * The `fnInit` function has the following input parameters:
			 *
			 * 1. `{object}` DataTables settings object: see
			 *    {@link DataTable.models.oSettings}
			 *
			 * And the following return is expected:
			 * 
			 * * {node|null} The element which contains your feature. Note that the
			 *   return may also be void if your plug-in does not require to inject any
			 *   DOM elements into DataTables control (`dom`) - for example this might
			 *   be useful when developing a plug-in which allows table control via
			 *   keyboard entry
			 *
			 *  @type array
			 *
			 *  @example
			 *    $.fn.dataTable.ext.features.push( {
			 *      "fnInit": function( oSettings ) {
			 *        return new TableTools( { "oDTSettings": oSettings } );
			 *      },
			 *      "cFeature": "T"
			 *    } );
			 */
			feature: [],
		
		
			/**
			 * Row searching.
			 * 
			 * This method of searching is complimentary to the default type based
			 * searching, and a lot more comprehensive as it allows you complete control
			 * over the searching logic. Each element in this array is a function
			 * (parameters described below) that is called for every row in the table,
			 * and your logic decides if it should be included in the searching data set
			 * or not.
			 *
			 * Searching functions have the following input parameters:
			 *
			 * 1. `{object}` DataTables settings object: see
			 *    {@link DataTable.models.oSettings}
			 * 2. `{array|object}` Data for the row to be processed (same as the
			 *    original format that was passed in as the data source, or an array
			 *    from a DOM data source
			 * 3. `{int}` Row index ({@link DataTable.models.oSettings.aoData}), which
			 *    can be useful to retrieve the `TR` element if you need DOM interaction.
			 *
			 * And the following return is expected:
			 *
			 * * {boolean} Include the row in the searched result set (true) or not
			 *   (false)
			 *
			 * Note that as with the main search ability in DataTables, technically this
			 * is "filtering", since it is subtractive. However, for consistency in
			 * naming we call it searching here.
			 *
			 *  @type array
			 *  @default []
			 *
			 *  @example
			 *    // The following example shows custom search being applied to the
			 *    // fourth column (i.e. the data[3] index) based on two input values
			 *    // from the end-user, matching the data in a certain range.
			 *    $.fn.dataTable.ext.search.push(
			 *      function( settings, data, dataIndex ) {
			 *        var min = document.getElementById('min').value * 1;
			 *        var max = document.getElementById('max').value * 1;
			 *        var version = data[3] == "-" ? 0 : data[3]*1;
			 *
			 *        if ( min == "" && max == "" ) {
			 *          return true;
			 *        }
			 *        else if ( min == "" && version < max ) {
			 *          return true;
			 *        }
			 *        else if ( min < version && "" == max ) {
			 *          return true;
			 *        }
			 *        else if ( min < version && version < max ) {
			 *          return true;
			 *        }
			 *        return false;
			 *      }
			 *    );
			 */
			search: [],
		
		
			/**
			 * Selector extensions
			 *
			 * The `selector` option can be used to extend the options available for the
			 * selector modifier options (`selector-modifier` object data type) that
			 * each of the three built in selector types offer (row, column and cell +
			 * their plural counterparts). For example the Select extension uses this
			 * mechanism to provide an option to select only rows, columns and cells
			 * that have been marked as selected by the end user (`{selected: true}`),
			 * which can be used in conjunction with the existing built in selector
			 * options.
			 *
			 * Each property is an array to which functions can be pushed. The functions
			 * take three attributes:
			 *
			 * * Settings object for the host table
			 * * Options object (`selector-modifier` object type)
			 * * Array of selected item indexes
			 *
			 * The return is an array of the resulting item indexes after the custom
			 * selector has been applied.
			 *
			 *  @type object
			 */
			selector: {
				cell: [],
				column: [],
				row: []
			},
		
		
			/**
			 * Internal functions, exposed for used in plug-ins.
			 * 
			 * Please note that you should not need to use the internal methods for
			 * anything other than a plug-in (and even then, try to avoid if possible).
			 * The internal function may change between releases.
			 *
			 *  @type object
			 *  @default {}
			 */
			internal: {},
		
		
			/**
			 * Legacy configuration options. Enable and disable legacy options that
			 * are available in DataTables.
			 *
			 *  @type object
			 */
			legacy: {
				/**
				 * Enable / disable DataTables 1.9 compatible server-side processing
				 * requests
				 *
				 *  @type boolean
				 *  @default null
				 */
				ajax: null
			},
		
		
			/**
			 * Pagination plug-in methods.
			 * 
			 * Each entry in this object is a function and defines which buttons should
			 * be shown by the pagination rendering method that is used for the table:
			 * {@link DataTable.ext.renderer.pageButton}. The renderer addresses how the
			 * buttons are displayed in the document, while the functions here tell it
			 * what buttons to display. This is done by returning an array of button
			 * descriptions (what each button will do).
			 *
			 * Pagination types (the four built in options and any additional plug-in
			 * options defined here) can be used through the `paginationType`
			 * initialisation parameter.
			 *
			 * The functions defined take two parameters:
			 *
			 * 1. `{int} page` The current page index
			 * 2. `{int} pages` The number of pages in the table
			 *
			 * Each function is expected to return an array where each element of the
			 * array can be one of:
			 *
			 * * `first` - Jump to first page when activated
			 * * `last` - Jump to last page when activated
			 * * `previous` - Show previous page when activated
			 * * `next` - Show next page when activated
			 * * `{int}` - Show page of the index given
			 * * `{array}` - A nested array containing the above elements to add a
			 *   containing 'DIV' element (might be useful for styling).
			 *
			 * Note that DataTables v1.9- used this object slightly differently whereby
			 * an object with two functions would be defined for each plug-in. That
			 * ability is still supported by DataTables 1.10+ to provide backwards
			 * compatibility, but this option of use is now decremented and no longer
			 * documented in DataTables 1.10+.
			 *
			 *  @type object
			 *  @default {}
			 *
			 *  @example
			 *    // Show previous, next and current page buttons only
			 *    $.fn.dataTableExt.oPagination.current = function ( page, pages ) {
			 *      return [ 'previous', page, 'next' ];
			 *    };
			 */
			pager: {},
		
		
			renderer: {
				pageButton: {},
				header: {}
			},
		
		
			/**
			 * Ordering plug-ins - custom data source
			 * 
			 * The extension options for ordering of data available here is complimentary
			 * to the default type based ordering that DataTables typically uses. It
			 * allows much greater control over the the data that is being used to
			 * order a column, but is necessarily therefore more complex.
			 * 
			 * This type of ordering is useful if you want to do ordering based on data
			 * live from the DOM (for example the contents of an 'input' element) rather
			 * than just the static string that DataTables knows of.
			 * 
			 * The way these plug-ins work is that you create an array of the values you
			 * wish to be ordering for the column in question and then return that
			 * array. The data in the array much be in the index order of the rows in
			 * the table (not the currently ordering order!). Which order data gathering
			 * function is run here depends on the `dt-init columns.orderDataType`
			 * parameter that is used for the column (if any).
			 *
			 * The functions defined take two parameters:
			 *
			 * 1. `{object}` DataTables settings object: see
			 *    {@link DataTable.models.oSettings}
			 * 2. `{int}` Target column index
			 *
			 * Each function is expected to return an array:
			 *
			 * * `{array}` Data for the column to be ordering upon
			 *
			 *  @type array
			 *
			 *  @example
			 *    // Ordering using `input` node values
			 *    $.fn.dataTable.ext.order['dom-text'] = function  ( settings, col )
			 *    {
			 *      return this.api().column( col, {order:'index'} ).nodes().map( function ( td, i ) {
			 *        return $('input', td).val();
			 *      } );
			 *    }
			 */
			order: {},
		
		
			/**
			 * Type based plug-ins.
			 *
			 * Each column in DataTables has a type assigned to it, either by automatic
			 * detection or by direct assignment using the `type` option for the column.
			 * The type of a column will effect how it is ordering and search (plug-ins
			 * can also make use of the column type if required).
			 *
			 * @namespace
			 */
			type: {
				/**
				 * Type detection functions.
				 *
				 * The functions defined in this object are used to automatically detect
				 * a column's type, making initialisation of DataTables super easy, even
				 * when complex data is in the table.
				 *
				 * The functions defined take two parameters:
				 *
			     *  1. `{*}` Data from the column cell to be analysed
			     *  2. `{settings}` DataTables settings object. This can be used to
			     *     perform context specific type detection - for example detection
			     *     based on language settings such as using a comma for a decimal
			     *     place. Generally speaking the options from the settings will not
			     *     be required
				 *
				 * Each function is expected to return:
				 *
				 * * `{string|null}` Data type detected, or null if unknown (and thus
				 *   pass it on to the other type detection functions.
				 *
				 *  @type array
				 *
				 *  @example
				 *    // Currency type detection plug-in:
				 *    $.fn.dataTable.ext.type.detect.push(
				 *      function ( data, settings ) {
				 *        // Check the numeric part
				 *        if ( ! $.isNumeric( data.substring(1) ) ) {
				 *          return null;
				 *        }
				 *
				 *        // Check prefixed by currency
				 *        if ( data.charAt(0) == '$' || data.charAt(0) == '&pound;' ) {
				 *          return 'currency';
				 *        }
				 *        return null;
				 *      }
				 *    );
				 */
				detect: [],
		
		
				/**
				 * Type based search formatting.
				 *
				 * The type based searching functions can be used to pre-format the
				 * data to be search on. For example, it can be used to strip HTML
				 * tags or to de-format telephone numbers for numeric only searching.
				 *
				 * Note that is a search is not defined for a column of a given type,
				 * no search formatting will be performed.
				 * 
				 * Pre-processing of searching data plug-ins - When you assign the sType
				 * for a column (or have it automatically detected for you by DataTables
				 * or a type detection plug-in), you will typically be using this for
				 * custom sorting, but it can also be used to provide custom searching
				 * by allowing you to pre-processing the data and returning the data in
				 * the format that should be searched upon. This is done by adding
				 * functions this object with a parameter name which matches the sType
				 * for that target column. This is the corollary of <i>afnSortData</i>
				 * for searching data.
				 *
				 * The functions defined take a single parameter:
				 *
			     *  1. `{*}` Data from the column cell to be prepared for searching
				 *
				 * Each function is expected to return:
				 *
				 * * `{string|null}` Formatted string that will be used for the searching.
				 *
				 *  @type object
				 *  @default {}
				 *
				 *  @example
				 *    $.fn.dataTable.ext.type.search['title-numeric'] = function ( d ) {
				 *      return d.replace(/\n/g," ").replace( /<.*?>/g, "" );
				 *    }
				 */
				search: {},
		
		
				/**
				 * Type based ordering.
				 *
				 * The column type tells DataTables what ordering to apply to the table
				 * when a column is sorted upon. The order for each type that is defined,
				 * is defined by the functions available in this object.
				 *
				 * Each ordering option can be described by three properties added to
				 * this object:
				 *
				 * * `{type}-pre` - Pre-formatting function
				 * * `{type}-asc` - Ascending order function
				 * * `{type}-desc` - Descending order function
				 *
				 * All three can be used together, only `{type}-pre` or only
				 * `{type}-asc` and `{type}-desc` together. It is generally recommended
				 * that only `{type}-pre` is used, as this provides the optimal
				 * implementation in terms of speed, although the others are provided
				 * for compatibility with existing Javascript sort functions.
				 *
				 * `{type}-pre`: Functions defined take a single parameter:
				 *
			     *  1. `{*}` Data from the column cell to be prepared for ordering
				 *
				 * And return:
				 *
				 * * `{*}` Data to be sorted upon
				 *
				 * `{type}-asc` and `{type}-desc`: Functions are typical Javascript sort
				 * functions, taking two parameters:
				 *
			     *  1. `{*}` Data to compare to the second parameter
			     *  2. `{*}` Data to compare to the first parameter
				 *
				 * And returning:
				 *
				 * * `{*}` Ordering match: <0 if first parameter should be sorted lower
				 *   than the second parameter, ===0 if the two parameters are equal and
				 *   >0 if the first parameter should be sorted height than the second
				 *   parameter.
				 * 
				 *  @type object
				 *  @default {}
				 *
				 *  @example
				 *    // Numeric ordering of formatted numbers with a pre-formatter
				 *    $.extend( $.fn.dataTable.ext.type.order, {
				 *      "string-pre": function(x) {
				 *        a = (a === "-" || a === "") ? 0 : a.replace( /[^\d\-\.]/g, "" );
				 *        return parseFloat( a );
				 *      }
				 *    } );
				 *
				 *  @example
				 *    // Case-sensitive string ordering, with no pre-formatting method
				 *    $.extend( $.fn.dataTable.ext.order, {
				 *      "string-case-asc": function(x,y) {
				 *        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
				 *      },
				 *      "string-case-desc": function(x,y) {
				 *        return ((x < y) ? 1 : ((x > y) ? -1 : 0));
				 *      }
				 *    } );
				 */
				order: {}
			},
		
			/**
			 * Unique DataTables instance counter
			 *
			 * @type int
			 * @private
			 */
			_unique: 0,
		
		
			//
			// Depreciated
			// The following properties are retained for backwards compatiblity only.
			// The should not be used in new projects and will be removed in a future
			// version
			//
		
			/**
			 * Version check function.
			 *  @type function
			 *  @depreciated Since 1.10
			 */
			fnVersionCheck: DataTable.fnVersionCheck,
		
		
			/**
			 * Index for what 'this' index API functions should use
			 *  @type int
			 *  @deprecated Since v1.10
			 */
			iApiIndex: 0,
		
		
			/**
			 * jQuery UI class container
			 *  @type object
			 *  @deprecated Since v1.10
			 */
			oJUIClasses: {},
		
		
			/**
			 * Software version
			 *  @type string
			 *  @deprecated Since v1.10
			 */
			sVersion: DataTable.version
		};
		
		
		//
		// Backwards compatibility. Alias to pre 1.10 Hungarian notation counter parts
		//
		$.extend( _ext, {
			afnFiltering: _ext.search,
			aTypes:       _ext.type.detect,
			ofnSearch:    _ext.type.search,
			oSort:        _ext.type.order,
			afnSortData:  _ext.order,
			aoFeatures:   _ext.feature,
			oApi:         _ext.internal,
			oStdClasses:  _ext.classes,
			oPagination:  _ext.pager
		} );
		
		
		$.extend( DataTable.ext.classes, {
			"sTable": "dataTable",
			"sNoFooter": "no-footer",
		
			/* Paging buttons */
			"sPageButton": "paginate_button",
			"sPageButtonActive": "current",
			"sPageButtonDisabled": "disabled",
		
			/* Striping classes */
			"sStripeOdd": "odd",
			"sStripeEven": "even",
		
			/* Empty row */
			"sRowEmpty": "dataTables_empty",
		
			/* Features */
			"sWrapper": "dataTables_wrapper",
			"sFilter": "dataTables_filter",
			"sInfo": "dataTables_info",
			"sPaging": "dataTables_paginate paging_", /* Note that the type is postfixed */
			"sLength": "dataTables_length",
			"sProcessing": "dataTables_processing",
		
			/* Sorting */
			"sSortAsc": "sorting_asc",
			"sSortDesc": "sorting_desc",
			"sSortable": "sorting", /* Sortable in both directions */
			"sSortableAsc": "sorting_asc_disabled",
			"sSortableDesc": "sorting_desc_disabled",
			"sSortableNone": "sorting_disabled",
			"sSortColumn": "sorting_", /* Note that an int is postfixed for the sorting order */
		
			/* Filtering */
			"sFilterInput": "",
		
			/* Page length */
			"sLengthSelect": "",
		
			/* Scrolling */
			"sScrollWrapper": "dataTables_scroll",
			"sScrollHead": "dataTables_scrollHead",
			"sScrollHeadInner": "dataTables_scrollHeadInner",
			"sScrollBody": "dataTables_scrollBody",
			"sScrollFoot": "dataTables_scrollFoot",
			"sScrollFootInner": "dataTables_scrollFootInner",
		
			/* Misc */
			"sHeaderTH": "",
			"sFooterTH": "",
		
			// Deprecated
			"sSortJUIAsc": "",
			"sSortJUIDesc": "",
			"sSortJUI": "",
			"sSortJUIAscAllowed": "",
			"sSortJUIDescAllowed": "",
			"sSortJUIWrapper": "",
			"sSortIcon": "",
			"sJUIHeader": "",
			"sJUIFooter": ""
		} );
		
		
		(function() {
		
		// Reused strings for better compression. Closure compiler appears to have a
		// weird edge case where it is trying to expand strings rather than use the
		// variable version. This results in about 200 bytes being added, for very
		// little preference benefit since it this run on script load only.
		var _empty = '';
		_empty = '';
		
		var _stateDefault = _empty + 'ui-state-default';
		var _sortIcon     = _empty + 'css_right ui-icon ui-icon-';
		var _headerFooter = _empty + 'fg-toolbar ui-toolbar ui-widget-header ui-helper-clearfix';
		
		$.extend( DataTable.ext.oJUIClasses, DataTable.ext.classes, {
			/* Full numbers paging buttons */
			"sPageButton":         "fg-button ui-button "+_stateDefault,
			"sPageButtonActive":   "ui-state-disabled",
			"sPageButtonDisabled": "ui-state-disabled",
		
			/* Features */
			"sPaging": "dataTables_paginate fg-buttonset ui-buttonset fg-buttonset-multi "+
				"ui-buttonset-multi paging_", /* Note that the type is postfixed */
		
			/* Sorting */
			"sSortAsc":            _stateDefault+" sorting_asc",
			"sSortDesc":           _stateDefault+" sorting_desc",
			"sSortable":           _stateDefault+" sorting",
			"sSortableAsc":        _stateDefault+" sorting_asc_disabled",
			"sSortableDesc":       _stateDefault+" sorting_desc_disabled",
			"sSortableNone":       _stateDefault+" sorting_disabled",
			"sSortJUIAsc":         _sortIcon+"triangle-1-n",
			"sSortJUIDesc":        _sortIcon+"triangle-1-s",
			"sSortJUI":            _sortIcon+"carat-2-n-s",
			"sSortJUIAscAllowed":  _sortIcon+"carat-1-n",
			"sSortJUIDescAllowed": _sortIcon+"carat-1-s",
			"sSortJUIWrapper":     "DataTables_sort_wrapper",
			"sSortIcon":           "DataTables_sort_icon",
		
			/* Scrolling */
			"sScrollHead": "dataTables_scrollHead "+_stateDefault,
			"sScrollFoot": "dataTables_scrollFoot "+_stateDefault,
		
			/* Misc */
			"sHeaderTH":  _stateDefault,
			"sFooterTH":  _stateDefault,
			"sJUIHeader": _headerFooter+" ui-corner-tl ui-corner-tr",
			"sJUIFooter": _headerFooter+" ui-corner-bl ui-corner-br"
		} );
		
		}());
		
		
		
		var extPagination = DataTable.ext.pager;
		
		function _numbers ( page, pages ) {
			var
				numbers = [],
				buttons = extPagination.numbers_length,
				half = Math.floor( buttons / 2 ),
				i = 1;
		
			if ( pages <= buttons ) {
				numbers = _range( 0, pages );
			}
			else if ( page <= half ) {
				numbers = _range( 0, buttons-2 );
				numbers.push( 'ellipsis' );
				numbers.push( pages-1 );
			}
			else if ( page >= pages - 1 - half ) {
				numbers = _range( pages-(buttons-2), pages );
				numbers.splice( 0, 0, 'ellipsis' ); // no unshift in ie6
				numbers.splice( 0, 0, 0 );
			}
			else {
				numbers = _range( page-half+2, page+half-1 );
				numbers.push( 'ellipsis' );
				numbers.push( pages-1 );
				numbers.splice( 0, 0, 'ellipsis' );
				numbers.splice( 0, 0, 0 );
			}
		
			numbers.DT_el = 'span';
			return numbers;
		}
		
		
		$.extend( extPagination, {
			simple: function ( page, pages ) {
				return [ 'previous', 'next' ];
			},
		
			full: function ( page, pages ) {
				return [  'first', 'previous', 'next', 'last' ];
			},
		
			numbers: function ( page, pages ) {
				return [ _numbers(page, pages) ];
			},
		
			simple_numbers: function ( page, pages ) {
				return [ 'previous', _numbers(page, pages), 'next' ];
			},
		
			full_numbers: function ( page, pages ) {
				return [ 'first', 'previous', _numbers(page, pages), 'next', 'last' ];
			},
			
			first_last_numbers: function (page, pages) {
		 		return ['first', _numbers(page, pages), 'last'];
		 	},
		
			// For testing and plug-ins to use
			_numbers: _numbers,
		
			// Number of number buttons (including ellipsis) to show. _Must be odd!_
			numbers_length: 7
		} );
		
		
		$.extend( true, DataTable.ext.renderer, {
			pageButton: {
				_: function ( settings, host, idx, buttons, page, pages ) {
					var classes = settings.oClasses;
					var lang = settings.oLanguage.oPaginate;
					var aria = settings.oLanguage.oAria.paginate || {};
					var btnDisplay, btnClass, counter=0;
		
					var attach = function( container, buttons ) {
						var i, ien, node, button;
						var clickHandler = function ( e ) {
							_fnPageChange( settings, e.data.action, true );
						};
		
						for ( i=0, ien=buttons.length ; i<ien ; i++ ) {
							button = buttons[i];
		
							if ( $.isArray( button ) ) {
								var inner = $( '<'+(button.DT_el || 'div')+'/>' )
									.appendTo( container );
								attach( inner, button );
							}
							else {
								btnDisplay = null;
								btnClass = '';
		
								switch ( button ) {
									case 'ellipsis':
										container.append('<span class="ellipsis">&#x2026;</span>');
										break;
		
									case 'first':
										btnDisplay = lang.sFirst;
										btnClass = button + (page > 0 ?
											'' : ' '+classes.sPageButtonDisabled);
										break;
		
									case 'previous':
										btnDisplay = lang.sPrevious;
										btnClass = button + (page > 0 ?
											'' : ' '+classes.sPageButtonDisabled);
										break;
		
									case 'next':
										btnDisplay = lang.sNext;
										btnClass = button + (page < pages-1 ?
											'' : ' '+classes.sPageButtonDisabled);
										break;
		
									case 'last':
										btnDisplay = lang.sLast;
										btnClass = button + (page < pages-1 ?
											'' : ' '+classes.sPageButtonDisabled);
										break;
		
									default:
										btnDisplay = button + 1;
										btnClass = page === button ?
											classes.sPageButtonActive : '';
										break;
								}
		
								if ( btnDisplay !== null ) {
									node = $('<a>', {
											'class': classes.sPageButton+' '+btnClass,
											'aria-controls': settings.sTableId,
											'aria-label': aria[ button ],
											'data-dt-idx': counter,
											'tabindex': settings.iTabIndex,
											'id': idx === 0 && typeof button === 'string' ?
												settings.sTableId +'_'+ button :
												null
										} )
										.html( btnDisplay )
										.appendTo( container );
		
									_fnBindAction(
										node, {action: button}, clickHandler
									);
		
									counter++;
								}
							}
						}
					};
		
					// IE9 throws an 'unknown error' if document.activeElement is used
					// inside an iframe or frame. Try / catch the error. Not good for
					// accessibility, but neither are frames.
					var activeEl;
		
					try {
						// Because this approach is destroying and recreating the paging
						// elements, focus is lost on the select button which is bad for
						// accessibility. So we want to restore focus once the draw has
						// completed
						activeEl = $(host).find(document.activeElement).data('dt-idx');
					}
					catch (e) {}
		
					attach( $(host).empty(), buttons );
		
					if ( activeEl !== undefined ) {
						$(host).find( '[data-dt-idx='+activeEl+']' ).focus();
					}
				}
			}
		} );
		
		
		
		// Built in type detection. See model.ext.aTypes for information about
		// what is required from this methods.
		$.extend( DataTable.ext.type.detect, [
			// Plain numbers - first since V8 detects some plain numbers as dates
			// e.g. Date.parse('55') (but not all, e.g. Date.parse('22')...).
			function ( d, settings )
			{
				var decimal = settings.oLanguage.sDecimal;
				return _isNumber( d, decimal ) ? 'num'+decimal : null;
			},
		
			// Dates (only those recognised by the browser's Date.parse)
			function ( d, settings )
			{
				// V8 tries _very_ hard to make a string passed into `Date.parse()`
				// valid, so we need to use a regex to restrict date formats. Use a
				// plug-in for anything other than ISO8601 style strings
				if ( d && !(d instanceof Date) && ! _re_date.test(d) ) {
					return null;
				}
				var parsed = Date.parse(d);
				return (parsed !== null && !isNaN(parsed)) || _empty(d) ? 'date' : null;
			},
		
			// Formatted numbers
			function ( d, settings )
			{
				var decimal = settings.oLanguage.sDecimal;
				return _isNumber( d, decimal, true ) ? 'num-fmt'+decimal : null;
			},
		
			// HTML numeric
			function ( d, settings )
			{
				var decimal = settings.oLanguage.sDecimal;
				return _htmlNumeric( d, decimal ) ? 'html-num'+decimal : null;
			},
		
			// HTML numeric, formatted
			function ( d, settings )
			{
				var decimal = settings.oLanguage.sDecimal;
				return _htmlNumeric( d, decimal, true ) ? 'html-num-fmt'+decimal : null;
			},
		
			// HTML (this is strict checking - there must be html)
			function ( d, settings )
			{
				return _empty( d ) || (typeof d === 'string' && d.indexOf('<') !== -1) ?
					'html' : null;
			}
		] );
		
		
		
		// Filter formatting functions. See model.ext.ofnSearch for information about
		// what is required from these methods.
		// 
		// Note that additional search methods are added for the html numbers and
		// html formatted numbers by `_addNumericSort()` when we know what the decimal
		// place is
		
		
		$.extend( DataTable.ext.type.search, {
			html: function ( data ) {
				return _empty(data) ?
					data :
					typeof data === 'string' ?
						data
							.replace( _re_new_lines, " " )
							.replace( _re_html, "" ) :
						'';
			},
		
			string: function ( data ) {
				return _empty(data) ?
					data :
					typeof data === 'string' ?
						data.replace( _re_new_lines, " " ) :
						data;
			}
		} );
		
		
		
		var __numericReplace = function ( d, decimalPlace, re1, re2 ) {
			if ( d !== 0 && (!d || d === '-') ) {
				return -Infinity;
			}
		
			// If a decimal place other than `.` is used, it needs to be given to the
			// function so we can detect it and replace with a `.` which is the only
			// decimal place Javascript recognises - it is not locale aware.
			if ( decimalPlace ) {
				d = _numToDecimal( d, decimalPlace );
			}
		
			if ( d.replace ) {
				if ( re1 ) {
					d = d.replace( re1, '' );
				}
		
				if ( re2 ) {
					d = d.replace( re2, '' );
				}
			}
		
			return d * 1;
		};
		
		
		// Add the numeric 'deformatting' functions for sorting and search. This is done
		// in a function to provide an easy ability for the language options to add
		// additional methods if a non-period decimal place is used.
		function _addNumericSort ( decimalPlace ) {
			$.each(
				{
					// Plain numbers
					"num": function ( d ) {
						return __numericReplace( d, decimalPlace );
					},
		
					// Formatted numbers
					"num-fmt": function ( d ) {
						return __numericReplace( d, decimalPlace, _re_formatted_numeric );
					},
		
					// HTML numeric
					"html-num": function ( d ) {
						return __numericReplace( d, decimalPlace, _re_html );
					},
		
					// HTML numeric, formatted
					"html-num-fmt": function ( d ) {
						return __numericReplace( d, decimalPlace, _re_html, _re_formatted_numeric );
					}
				},
				function ( key, fn ) {
					// Add the ordering method
					_ext.type.order[ key+decimalPlace+'-pre' ] = fn;
		
					// For HTML types add a search formatter that will strip the HTML
					if ( key.match(/^html\-/) ) {
						_ext.type.search[ key+decimalPlace ] = _ext.type.search.html;
					}
				}
			);
		}
		
		
		// Default sort methods
		$.extend( _ext.type.order, {
			// Dates
			"date-pre": function ( d ) {
				return Date.parse( d ) || -Infinity;
			},
		
			// html
			"html-pre": function ( a ) {
				return _empty(a) ?
					'' :
					a.replace ?
						a.replace( /<.*?>/g, "" ).toLowerCase() :
						a+'';
			},
		
			// string
			"string-pre": function ( a ) {
				// This is a little complex, but faster than always calling toString,
				// http://jsperf.com/tostring-v-check
				return _empty(a) ?
					'' :
					typeof a === 'string' ?
						a.toLowerCase() :
						! a.toString ?
							'' :
							a.toString();
			},
		
			// string-asc and -desc are retained only for compatibility with the old
			// sort methods
			"string-asc": function ( x, y ) {
				return ((x < y) ? -1 : ((x > y) ? 1 : 0));
			},
		
			"string-desc": function ( x, y ) {
				return ((x < y) ? 1 : ((x > y) ? -1 : 0));
			}
		} );
		
		
		// Numeric sorting types - order doesn't matter here
		_addNumericSort( '' );
		
		
		$.extend( true, DataTable.ext.renderer, {
			header: {
				_: function ( settings, cell, column, classes ) {
					// No additional mark-up required
					// Attach a sort listener to update on sort - note that using the
					// `DT` namespace will allow the event to be removed automatically
					// on destroy, while the `dt` namespaced event is the one we are
					// listening for
					$(settings.nTable).on( 'order.dt.DT', function ( e, ctx, sorting, columns ) {
						if ( settings !== ctx ) { // need to check this this is the host
							return;               // table, not a nested one
						}
		
						var colIdx = column.idx;
		
						cell
							.removeClass(
								column.sSortingClass +' '+
								classes.sSortAsc +' '+
								classes.sSortDesc
							)
							.addClass( columns[ colIdx ] == 'asc' ?
								classes.sSortAsc : columns[ colIdx ] == 'desc' ?
									classes.sSortDesc :
									column.sSortingClass
							);
					} );
				},
		
				jqueryui: function ( settings, cell, column, classes ) {
					$('<div/>')
						.addClass( classes.sSortJUIWrapper )
						.append( cell.contents() )
						.append( $('<span/>')
							.addClass( classes.sSortIcon+' '+column.sSortingClassJUI )
						)
						.appendTo( cell );
		
					// Attach a sort listener to update on sort
					$(settings.nTable).on( 'order.dt.DT', function ( e, ctx, sorting, columns ) {
						if ( settings !== ctx ) {
							return;
						}
		
						var colIdx = column.idx;
		
						cell
							.removeClass( classes.sSortAsc +" "+classes.sSortDesc )
							.addClass( columns[ colIdx ] == 'asc' ?
								classes.sSortAsc : columns[ colIdx ] == 'desc' ?
									classes.sSortDesc :
									column.sSortingClass
							);
		
						cell
							.find( 'span.'+classes.sSortIcon )
							.removeClass(
								classes.sSortJUIAsc +" "+
								classes.sSortJUIDesc +" "+
								classes.sSortJUI +" "+
								classes.sSortJUIAscAllowed +" "+
								classes.sSortJUIDescAllowed
							)
							.addClass( columns[ colIdx ] == 'asc' ?
								classes.sSortJUIAsc : columns[ colIdx ] == 'desc' ?
									classes.sSortJUIDesc :
									column.sSortingClassJUI
							);
					} );
				}
			}
		} );
		
		/*
		 * Public helper functions. These aren't used internally by DataTables, or
		 * called by any of the options passed into DataTables, but they can be used
		 * externally by developers working with DataTables. They are helper functions
		 * to make working with DataTables a little bit easier.
		 */
		
		var __htmlEscapeEntities = function ( d ) {
			return typeof d === 'string' ?
				d.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') :
				d;
		};
		
		/**
		 * Helpers for `columns.render`.
		 *
		 * The options defined here can be used with the `columns.render` initialisation
		 * option to provide a display renderer. The following functions are defined:
		 *
		 * * `number` - Will format numeric data (defined by `columns.data`) for
		 *   display, retaining the original unformatted data for sorting and filtering.
		 *   It takes 5 parameters:
		 *   * `string` - Thousands grouping separator
		 *   * `string` - Decimal point indicator
		 *   * `integer` - Number of decimal points to show
		 *   * `string` (optional) - Prefix.
		 *   * `string` (optional) - Postfix (/suffix).
		 * * `text` - Escape HTML to help prevent XSS attacks. It has no optional
		 *   parameters.
		 *
		 * @example
		 *   // Column definition using the number renderer
		 *   {
		 *     data: "salary",
		 *     render: $.fn.dataTable.render.number( '\'', '.', 0, '$' )
		 *   }
		 *
		 * @namespace
		 */
		DataTable.render = {
			number: function ( thousands, decimal, precision, prefix, postfix ) {
				return {
					display: function ( d ) {
						if ( typeof d !== 'number' && typeof d !== 'string' ) {
							return d;
						}
		
						var negative = d < 0 ? '-' : '';
						var flo = parseFloat( d );
		
						// If NaN then there isn't much formatting that we can do - just
						// return immediately, escaping any HTML (this was supposed to
						// be a number after all)
						if ( isNaN( flo ) ) {
							return __htmlEscapeEntities( d );
						}
		
						flo = flo.toFixed( precision );
						d = Math.abs( flo );
		
						var intPart = parseInt( d, 10 );
						var floatPart = precision ?
							decimal+(d - intPart).toFixed( precision ).substring( 2 ):
							'';
		
						return negative + (prefix||'') +
							intPart.toString().replace(
								/\B(?=(\d{3})+(?!\d))/g, thousands
							) +
							floatPart +
							(postfix||'');
					}
				};
			},
		
			text: function () {
				return {
					display: __htmlEscapeEntities
				};
			}
		};
		
		
		/*
		 * This is really a good bit rubbish this method of exposing the internal methods
		 * publicly... - To be fixed in 2.0 using methods on the prototype
		 */
		
		
		/**
		 * Create a wrapper function for exporting an internal functions to an external API.
		 *  @param {string} fn API function name
		 *  @returns {function} wrapped function
		 *  @memberof DataTable#internal
		 */
		function _fnExternApiFunc (fn)
		{
			return function() {
				var args = [_fnSettingsFromNode( this[DataTable.ext.iApiIndex] )].concat(
					Array.prototype.slice.call(arguments)
				);
				return DataTable.ext.internal[fn].apply( this, args );
			};
		}
		
		
		/**
		 * Reference to internal functions for use by plug-in developers. Note that
		 * these methods are references to internal functions and are considered to be
		 * private. If you use these methods, be aware that they are liable to change
		 * between versions.
		 *  @namespace
		 */
		$.extend( DataTable.ext.internal, {
			_fnExternApiFunc: _fnExternApiFunc,
			_fnBuildAjax: _fnBuildAjax,
			_fnAjaxUpdate: _fnAjaxUpdate,
			_fnAjaxParameters: _fnAjaxParameters,
			_fnAjaxUpdateDraw: _fnAjaxUpdateDraw,
			_fnAjaxDataSrc: _fnAjaxDataSrc,
			_fnAddColumn: _fnAddColumn,
			_fnColumnOptions: _fnColumnOptions,
			_fnAdjustColumnSizing: _fnAdjustColumnSizing,
			_fnVisibleToColumnIndex: _fnVisibleToColumnIndex,
			_fnColumnIndexToVisible: _fnColumnIndexToVisible,
			_fnVisbleColumns: _fnVisbleColumns,
			_fnGetColumns: _fnGetColumns,
			_fnColumnTypes: _fnColumnTypes,
			_fnApplyColumnDefs: _fnApplyColumnDefs,
			_fnHungarianMap: _fnHungarianMap,
			_fnCamelToHungarian: _fnCamelToHungarian,
			_fnLanguageCompat: _fnLanguageCompat,
			_fnBrowserDetect: _fnBrowserDetect,
			_fnAddData: _fnAddData,
			_fnAddTr: _fnAddTr,
			_fnNodeToDataIndex: _fnNodeToDataIndex,
			_fnNodeToColumnIndex: _fnNodeToColumnIndex,
			_fnGetCellData: _fnGetCellData,
			_fnSetCellData: _fnSetCellData,
			_fnSplitObjNotation: _fnSplitObjNotation,
			_fnGetObjectDataFn: _fnGetObjectDataFn,
			_fnSetObjectDataFn: _fnSetObjectDataFn,
			_fnGetDataMaster: _fnGetDataMaster,
			_fnClearTable: _fnClearTable,
			_fnDeleteIndex: _fnDeleteIndex,
			_fnInvalidate: _fnInvalidate,
			_fnGetRowElements: _fnGetRowElements,
			_fnCreateTr: _fnCreateTr,
			_fnBuildHead: _fnBuildHead,
			_fnDrawHead: _fnDrawHead,
			_fnDraw: _fnDraw,
			_fnReDraw: _fnReDraw,
			_fnAddOptionsHtml: _fnAddOptionsHtml,
			_fnDetectHeader: _fnDetectHeader,
			_fnGetUniqueThs: _fnGetUniqueThs,
			_fnFeatureHtmlFilter: _fnFeatureHtmlFilter,
			_fnFilterComplete: _fnFilterComplete,
			_fnFilterCustom: _fnFilterCustom,
			_fnFilterColumn: _fnFilterColumn,
			_fnFilter: _fnFilter,
			_fnFilterCreateSearch: _fnFilterCreateSearch,
			_fnEscapeRegex: _fnEscapeRegex,
			_fnFilterData: _fnFilterData,
			_fnFeatureHtmlInfo: _fnFeatureHtmlInfo,
			_fnUpdateInfo: _fnUpdateInfo,
			_fnInfoMacros: _fnInfoMacros,
			_fnInitialise: _fnInitialise,
			_fnInitComplete: _fnInitComplete,
			_fnLengthChange: _fnLengthChange,
			_fnFeatureHtmlLength: _fnFeatureHtmlLength,
			_fnFeatureHtmlPaginate: _fnFeatureHtmlPaginate,
			_fnPageChange: _fnPageChange,
			_fnFeatureHtmlProcessing: _fnFeatureHtmlProcessing,
			_fnProcessingDisplay: _fnProcessingDisplay,
			_fnFeatureHtmlTable: _fnFeatureHtmlTable,
			_fnScrollDraw: _fnScrollDraw,
			_fnApplyToChildren: _fnApplyToChildren,
			_fnCalculateColumnWidths: _fnCalculateColumnWidths,
			_fnThrottle: _fnThrottle,
			_fnConvertToWidth: _fnConvertToWidth,
			_fnGetWidestNode: _fnGetWidestNode,
			_fnGetMaxLenString: _fnGetMaxLenString,
			_fnStringToCss: _fnStringToCss,
			_fnSortFlatten: _fnSortFlatten,
			_fnSort: _fnSort,
			_fnSortAria: _fnSortAria,
			_fnSortListener: _fnSortListener,
			_fnSortAttachListener: _fnSortAttachListener,
			_fnSortingClasses: _fnSortingClasses,
			_fnSortData: _fnSortData,
			_fnSaveState: _fnSaveState,
			_fnLoadState: _fnLoadState,
			_fnSettingsFromNode: _fnSettingsFromNode,
			_fnLog: _fnLog,
			_fnMap: _fnMap,
			_fnBindAction: _fnBindAction,
			_fnCallbackReg: _fnCallbackReg,
			_fnCallbackFire: _fnCallbackFire,
			_fnLengthOverflow: _fnLengthOverflow,
			_fnRenderer: _fnRenderer,
			_fnDataSource: _fnDataSource,
			_fnRowAttributes: _fnRowAttributes,
			_fnCalculateEnd: function () {} // Used by a lot of plug-ins, but redundant
			                                // in 1.10, so this dead-end function is
			                                // added to prevent errors
		} );
		

		// jQuery access
		$.fn.dataTable = DataTable;

		// Provide access to the host jQuery object (circular reference)
		DataTable.$ = $;

		// Legacy aliases
		$.fn.dataTableSettings = DataTable.settings;
		$.fn.dataTableExt = DataTable.ext;

		// With a capital `D` we return a DataTables API instance rather than a
		// jQuery object
		$.fn.DataTable = function ( opts ) {
			return $(this).dataTable( opts ).api();
		};

		// All properties that are available to $.fn.dataTable should also be
		// available on $.fn.DataTable
		$.each( DataTable, function ( prop, val ) {
			$.fn.DataTable[ prop ] = val;
		} );


		// Information about events fired by DataTables - for documentation.
		/**
		 * Draw event, fired whenever the table is redrawn on the page, at the same
		 * point as fnDrawCallback. This may be useful for binding events or
		 * performing calculations when the table is altered at all.
		 *  @name DataTable#draw.dt
		 *  @event
		 *  @param {event} e jQuery event object
		 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
		 */

		/**
		 * Search event, fired when the searching applied to the table (using the
		 * built-in global search, or column filters) is altered.
		 *  @name DataTable#search.dt
		 *  @event
		 *  @param {event} e jQuery event object
		 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
		 */

		/**
		 * Page change event, fired when the paging of the table is altered.
		 *  @name DataTable#page.dt
		 *  @event
		 *  @param {event} e jQuery event object
		 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
		 */

		/**
		 * Order event, fired when the ordering applied to the table is altered.
		 *  @name DataTable#order.dt
		 *  @event
		 *  @param {event} e jQuery event object
		 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
		 */

		/**
		 * DataTables initialisation complete event, fired when the table is fully
		 * drawn, including Ajax data loaded, if Ajax data is required.
		 *  @name DataTable#init.dt
		 *  @event
		 *  @param {event} e jQuery event object
		 *  @param {object} oSettings DataTables settings object
		 *  @param {object} json The JSON object request from the server - only
		 *    present if client-side Ajax sourced data is used</li></ol>
		 */

		/**
		 * State save event, fired when the table has changed state a new state save
		 * is required. This event allows modification of the state saving object
		 * prior to actually doing the save, including addition or other state
		 * properties (for plug-ins) or modification of a DataTables core property.
		 *  @name DataTable#stateSaveParams.dt
		 *  @event
		 *  @param {event} e jQuery event object
		 *  @param {object} oSettings DataTables settings object
		 *  @param {object} json The state information to be saved
		 */

		/**
		 * State load event, fired when the table is loading state from the stored
		 * data, but prior to the settings object being modified by the saved state
		 * - allowing modification of the saved state is required or loading of
		 * state for a plug-in.
		 *  @name DataTable#stateLoadParams.dt
		 *  @event
		 *  @param {event} e jQuery event object
		 *  @param {object} oSettings DataTables settings object
		 *  @param {object} json The saved state information
		 */

		/**
		 * State loaded event, fired when state has been loaded from stored data and
		 * the settings object has been modified by the loaded data.
		 *  @name DataTable#stateLoaded.dt
		 *  @event
		 *  @param {event} e jQuery event object
		 *  @param {object} oSettings DataTables settings object
		 *  @param {object} json The saved state information
		 */

		/**
		 * Processing event, fired when DataTables is doing some kind of processing
		 * (be it, order, searcg or anything else). It can be used to indicate to
		 * the end user that there is something happening, or that something has
		 * finished.
		 *  @name DataTable#processing.dt
		 *  @event
		 *  @param {event} e jQuery event object
		 *  @param {object} oSettings DataTables settings object
		 *  @param {boolean} bShow Flag for if DataTables is doing processing or not
		 */

		/**
		 * Ajax (XHR) event, fired whenever an Ajax request is completed from a
		 * request to made to the server for new data. This event is called before
		 * DataTables processed the returned data, so it can also be used to pre-
		 * process the data returned from the server, if needed.
		 *
		 * Note that this trigger is called in `fnServerData`, if you override
		 * `fnServerData` and which to use this event, you need to trigger it in you
		 * success function.
		 *  @name DataTable#xhr.dt
		 *  @event
		 *  @param {event} e jQuery event object
		 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
		 *  @param {object} json JSON returned from the server
		 *
		 *  @example
		 *     // Use a custom property returned from the server in another DOM element
		 *     $('#table').dataTable().on('xhr.dt', function (e, settings, json) {
		 *       $('#status').html( json.status );
		 *     } );
		 *
		 *  @example
		 *     // Pre-process the data returned from the server
		 *     $('#table').dataTable().on('xhr.dt', function (e, settings, json) {
		 *       for ( var i=0, ien=json.aaData.length ; i<ien ; i++ ) {
		 *         json.aaData[i].sum = json.aaData[i].one + json.aaData[i].two;
		 *       }
		 *       // Note no return - manipulate the data directly in the JSON object.
		 *     } );
		 */

		/**
		 * Destroy event, fired when the DataTable is destroyed by calling fnDestroy
		 * or passing the bDestroy:true parameter in the initialisation object. This
		 * can be used to remove bound events, added DOM nodes, etc.
		 *  @name DataTable#destroy.dt
		 *  @event
		 *  @param {event} e jQuery event object
		 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
		 */

		/**
		 * Page length change event, fired when number of records to show on each
		 * page (the length) is changed.
		 *  @name DataTable#length.dt
		 *  @event
		 *  @param {event} e jQuery event object
		 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
		 *  @param {integer} len New length
		 */

		/**
		 * Column sizing has changed.
		 *  @name DataTable#column-sizing.dt
		 *  @event
		 *  @param {event} e jQuery event object
		 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
		 */

		/**
		 * Column visibility has changed.
		 *  @name DataTable#column-visibility.dt
		 *  @event
		 *  @param {event} e jQuery event object
		 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
		 *  @param {int} column Column index
		 *  @param {bool} vis `false` if column now hidden, or `true` if visible
		 */

		return $.fn.dataTable;
	}));


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var getFormFields = __webpack_require__(36);
	var authApi = __webpack_require__(37);
	var api = __webpack_require__(9);
	var ui = __webpack_require__(11);
	var $ = __webpack_require__(2);
	var store = __webpack_require__(10);

	var addHandlers = function addHandlers() {
	  $('#sign-up').on('submit', onSignUp);
	  $('#sign-in').on('submit', onSignIn);
	  $('#change-password').on('submit', onChangePassword);
	  $('.navbar').on('click', '#sign-out', onSignOut);
	  $('.navbar').on('click', '#sign-in-btn', viewAuthForm);
	  $('.navbar').on('click', '#sign-up-btn', viewAuthForm);
	  $('.navbar').on('click', '#ch-pwd-btn', showPasswordChange);
	  $('.pwd-ch-cancel').on('click', cancelPasswordChange);
	};

	// function that displays and hides sign-up and sign-in auth forms when a users
	// clicks respective buttons in the navbar.
	var viewAuthForm = function viewAuthForm(event) {
	  if (event.target.text === 'SignIn') {
	    $('#sign-in').show();
	    $('#sign-up').hide();
	  } else if (event.target.text === 'SignUp') {
	    $('#sign-up').show();
	    $('#sign-in').hide();
	  }
	};
	// shows password auth form when change password is clicked
	var showPasswordChange = function showPasswordChange() {
	  $('#change-password').show();
	  $('.pwd-ch-cancel').show();
	};
	// hides password auth form when cancel button is clicked
	var cancelPasswordChange = function cancelPasswordChange() {
	  $('#pw-ch').val('');
	  $('#change-password').hide();
	  $('.pwd-ch-cancel').hide();
	};
	// api provides dates in epoch format. This function will be used as a callback
	// before the apiGames table is loaded
	var dateFormatChange = function dateFormatChange(data) {
	  data.map(function (elem) {
	    elem.first_release_date = new Date(elem.first_release_date).toDateString();
	  });
	  return;
	};

	var onSignUp = function onSignUp(event) {
	  event.preventDefault();
	  // retieve from data
	  var data = getFormFields(this);
	  authApi.signUp(data)
	  // automatic sign-in upon signing up
	  .done([ui.signUpSuccess, function (response) {
	    authApi.signIn(data).then(ui.signInSuccess)
	    // GET request to retrieve data and populate table
	    .then(function () {
	      return api.indexWantedGames(store.user);
	    })
	    // add classActivator function for row selection
	    .then(ui.indexWantedGamesSuccess)
	    // retrieve apiGames upon successful sign in
	    //request requires user authentication
	    .then(function () {
	      return api.indexApiGames(store.user);
	    }).then(function (data) {
	      // convert epoch date format to a user-friendly format
	      dateFormatChange(data);
	      return data;
	    })
	    // generate table
	    .then(ui.indexApiGamesSuccess).catch(ui.indexApiGamesFailure);
	  }]).catch(ui.signUpFailure);
	};

	// function for signing in
	var onSignIn = function onSignIn(event) {
	  var data = getFormFields(this);
	  event.preventDefault();
	  authApi.signIn(data).then(function (data) {
	    return ui.signInSuccess(data);
	  })
	  // GET request to retrieve data and populate table
	  .then(function () {
	    return api.indexWantedGames(store.user);
	  })
	  // add classActivator function for row selection
	  .then(ui.indexWantedGamesSuccess)
	  // GET request to retrieve data for table population
	  .then(function () {
	    return api.indexApiGames(store.user);
	  }).then(function (data) {
	    // convert epoch date format to a user-friendly format
	    dateFormatChange(data);
	    return data;
	  })
	  // populate apiGames table and add class activator function
	  .then(ui.indexApiGamesSuccess).catch(ui.indexApiGamesFailure);
	};

	var onChangePassword = function onChangePassword(event) {
	  var data = getFormFields(this);
	  event.preventDefault();
	  authApi.changePassword(data).then(ui.changePasswordSuccess).catch(ui.changePasswordFailure);
	};

	var onSignOut = function onSignOut(event) {
	  var data = getFormFields(this);
	  event.preventDefault();
	  authApi.signOut(data).then(ui.signOutSuccess);
	};

	module.exports = {
	  addHandlers: addHandlers
	};

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var addNestedValue = __webpack_require__(5);

	var getFormFields = function getFormFields(form) {
	  var target = {};

	  var elements = form.elements || [];
	  for (var i = 0; i < elements.length; i++) {
	    var e = elements[i];
	    if (!e.hasAttribute('name')) {
	      continue;
	    }

	    var type = 'TEXT';
	    switch (e.nodeName.toUpperCase()) {
	      case 'SELECT':
	        type = e.hasAttribute('multiple') ? 'MULTIPLE' : type;
	        break;
	      case 'INPUT':
	        type = e.getAttribute('type').toUpperCase();
	        break;
	    }

	    var name = e.getAttribute('name');

	    if (type === 'MULTIPLE') {
	      for (var _i = 0; _i < e.length; _i++) {
	        if (e[_i].selected) {
	          addNestedValue(target, name, e[_i].value);
	        }
	      }
	    } else if (type !== 'RADIO' && type !== 'CHECKBOX' || e.checked) {
	      addNestedValue(target, name, e.value);
	    }
	  }

	  return target;
	};

	module.exports = getFormFields;

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {'use strict';

	var store = __webpack_require__(10);
	var config = __webpack_require__(6);
	var signUp = function signUp(data) {
	  return $.ajax({
	    url: config.apiOrigin + '/sign-up',
	    method: 'POST',
	    data: data
	  });
	};

	var signIn = function signIn(data) {
	  return $.ajax({
	    url: config.apiOrigin + '/sign-in',
	    method: 'POST',
	    data: data
	  });
	};

	var changePassword = function changePassword(data) {
	  return $.ajax({
	    url: config.apiOrigin + '/change-password/' + store.user.id,
	    method: 'PATCH',
	    headers: {
	      Authorization: 'Token token=' + store.user.token
	    },
	    data: data
	  });
	};

	var signOut = function signOut(data) {
	  return $.ajax({
	    url: config.apiOrigin + '/sign-out/' + store.user.id,
	    method: 'DELETE',
	    headers: {
	      Authorization: 'Token token=' + store.user.token
	    },
	    data: data
	  });
	};

	module.exports = {
	  signIn: signIn,
	  signUp: signUp,
	  signOut: signOut,
	  changePassword: changePassword
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(39);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(46)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/sass-loader/index.js!./index.scss", function() {
				var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/sass-loader/index.js!./index.scss");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(40)();
	// imports


	// module
	exports.push([module.id, "@charset \"UTF-8\";\n/*!\n * Bootstrap v3.3.7 (http://getbootstrap.com)\n * Copyright 2011-2016 Twitter, Inc.\n * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)\n */\n/*! normalize.css v3.0.3 | MIT License | github.com/necolas/normalize.css */\nhtml {\n  font-family: sans-serif;\n  -ms-text-size-adjust: 100%;\n  -webkit-text-size-adjust: 100%; }\n\nbody {\n  margin: 0; }\n\narticle,\naside,\ndetails,\nfigcaption,\nfigure,\nfooter,\nheader,\nhgroup,\nmain,\nmenu,\nnav,\nsection,\nsummary {\n  display: block; }\n\naudio,\ncanvas,\nprogress,\nvideo {\n  display: inline-block;\n  vertical-align: baseline; }\n\naudio:not([controls]) {\n  display: none;\n  height: 0; }\n\n[hidden],\ntemplate {\n  display: none; }\n\na {\n  background-color: transparent; }\n\na:active,\na:hover {\n  outline: 0; }\n\nabbr[title] {\n  border-bottom: 1px dotted; }\n\nb,\nstrong {\n  font-weight: bold; }\n\ndfn {\n  font-style: italic; }\n\nh1 {\n  font-size: 2em;\n  margin: 0.67em 0; }\n\nmark {\n  background: #ff0;\n  color: #000; }\n\nsmall {\n  font-size: 80%; }\n\nsub,\nsup {\n  font-size: 75%;\n  line-height: 0;\n  position: relative;\n  vertical-align: baseline; }\n\nsup {\n  top: -0.5em; }\n\nsub {\n  bottom: -0.25em; }\n\nimg {\n  border: 0; }\n\nsvg:not(:root) {\n  overflow: hidden; }\n\nfigure {\n  margin: 1em 40px; }\n\nhr {\n  box-sizing: content-box;\n  height: 0; }\n\npre {\n  overflow: auto; }\n\ncode,\nkbd,\npre,\nsamp {\n  font-family: monospace, monospace;\n  font-size: 1em; }\n\nbutton,\ninput,\noptgroup,\nselect,\ntextarea {\n  color: inherit;\n  font: inherit;\n  margin: 0; }\n\nbutton {\n  overflow: visible; }\n\nbutton,\nselect {\n  text-transform: none; }\n\nbutton,\nhtml input[type=\"button\"],\ninput[type=\"reset\"],\ninput[type=\"submit\"] {\n  -webkit-appearance: button;\n  cursor: pointer; }\n\nbutton[disabled],\nhtml input[disabled] {\n  cursor: default; }\n\nbutton::-moz-focus-inner,\ninput::-moz-focus-inner {\n  border: 0;\n  padding: 0; }\n\ninput {\n  line-height: normal; }\n\ninput[type=\"checkbox\"],\ninput[type=\"radio\"] {\n  box-sizing: border-box;\n  padding: 0; }\n\ninput[type=\"number\"]::-webkit-inner-spin-button,\ninput[type=\"number\"]::-webkit-outer-spin-button {\n  height: auto; }\n\ninput[type=\"search\"] {\n  -webkit-appearance: textfield;\n  box-sizing: content-box; }\n\ninput[type=\"search\"]::-webkit-search-cancel-button,\ninput[type=\"search\"]::-webkit-search-decoration {\n  -webkit-appearance: none; }\n\nfieldset {\n  border: 1px solid #c0c0c0;\n  margin: 0 2px;\n  padding: 0.35em 0.625em 0.75em; }\n\nlegend {\n  border: 0;\n  padding: 0; }\n\ntextarea {\n  overflow: auto; }\n\noptgroup {\n  font-weight: bold; }\n\ntable {\n  border-collapse: collapse;\n  border-spacing: 0; }\n\ntd,\nth {\n  padding: 0; }\n\n/*! Source: https://github.com/h5bp/html5-boilerplate/blob/master/src/css/main.css */\n@media print {\n  *,\n  *:before,\n  *:after {\n    background: transparent !important;\n    color: #000 !important;\n    box-shadow: none !important;\n    text-shadow: none !important; }\n  a,\n  a:visited {\n    text-decoration: underline; }\n  a[href]:after {\n    content: \" (\" attr(href) \")\"; }\n  abbr[title]:after {\n    content: \" (\" attr(title) \")\"; }\n  a[href^=\"#\"]:after,\n  a[href^=\"javascript:\"]:after {\n    content: \"\"; }\n  pre,\n  blockquote {\n    border: 1px solid #999;\n    page-break-inside: avoid; }\n  thead {\n    display: table-header-group; }\n  tr,\n  img {\n    page-break-inside: avoid; }\n  img {\n    max-width: 100% !important; }\n  p,\n  h2,\n  h3 {\n    orphans: 3;\n    widows: 3; }\n  h2,\n  h3 {\n    page-break-after: avoid; }\n  .navbar {\n    display: none; }\n  .btn > .caret,\n  .dropup > .btn > .caret {\n    border-top-color: #000 !important; }\n  .label {\n    border: 1px solid #000; }\n  .table {\n    border-collapse: collapse !important; }\n    .table td,\n    .table th {\n      background-color: #fff !important; }\n  .table-bordered th,\n  .table-bordered td {\n    border: 1px solid #ddd !important; } }\n\n@font-face {\n  font-family: 'Glyphicons Halflings';\n  src: url(" + __webpack_require__(41) + ");\n  src: url(" + __webpack_require__(41) + "?#iefix) format(\"embedded-opentype\"), url(" + __webpack_require__(42) + ") format(\"woff2\"), url(" + __webpack_require__(43) + ") format(\"woff\"), url(" + __webpack_require__(44) + ") format(\"truetype\"), url(" + __webpack_require__(45) + "#glyphicons_halflingsregular) format(\"svg\"); }\n\n.glyphicon {\n  position: relative;\n  top: 1px;\n  display: inline-block;\n  font-family: 'Glyphicons Halflings';\n  font-style: normal;\n  font-weight: normal;\n  line-height: 1;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale; }\n\n.glyphicon-asterisk:before {\n  content: \"*\"; }\n\n.glyphicon-plus:before {\n  content: \"+\"; }\n\n.glyphicon-euro:before,\n.glyphicon-eur:before {\n  content: \"\\20AC\"; }\n\n.glyphicon-minus:before {\n  content: \"\\2212\"; }\n\n.glyphicon-cloud:before {\n  content: \"\\2601\"; }\n\n.glyphicon-envelope:before {\n  content: \"\\2709\"; }\n\n.glyphicon-pencil:before {\n  content: \"\\270F\"; }\n\n.glyphicon-glass:before {\n  content: \"\\E001\"; }\n\n.glyphicon-music:before {\n  content: \"\\E002\"; }\n\n.glyphicon-search:before {\n  content: \"\\E003\"; }\n\n.glyphicon-heart:before {\n  content: \"\\E005\"; }\n\n.glyphicon-star:before {\n  content: \"\\E006\"; }\n\n.glyphicon-star-empty:before {\n  content: \"\\E007\"; }\n\n.glyphicon-user:before {\n  content: \"\\E008\"; }\n\n.glyphicon-film:before {\n  content: \"\\E009\"; }\n\n.glyphicon-th-large:before {\n  content: \"\\E010\"; }\n\n.glyphicon-th:before {\n  content: \"\\E011\"; }\n\n.glyphicon-th-list:before {\n  content: \"\\E012\"; }\n\n.glyphicon-ok:before {\n  content: \"\\E013\"; }\n\n.glyphicon-remove:before {\n  content: \"\\E014\"; }\n\n.glyphicon-zoom-in:before {\n  content: \"\\E015\"; }\n\n.glyphicon-zoom-out:before {\n  content: \"\\E016\"; }\n\n.glyphicon-off:before {\n  content: \"\\E017\"; }\n\n.glyphicon-signal:before {\n  content: \"\\E018\"; }\n\n.glyphicon-cog:before {\n  content: \"\\E019\"; }\n\n.glyphicon-trash:before {\n  content: \"\\E020\"; }\n\n.glyphicon-home:before {\n  content: \"\\E021\"; }\n\n.glyphicon-file:before {\n  content: \"\\E022\"; }\n\n.glyphicon-time:before {\n  content: \"\\E023\"; }\n\n.glyphicon-road:before {\n  content: \"\\E024\"; }\n\n.glyphicon-download-alt:before {\n  content: \"\\E025\"; }\n\n.glyphicon-download:before {\n  content: \"\\E026\"; }\n\n.glyphicon-upload:before {\n  content: \"\\E027\"; }\n\n.glyphicon-inbox:before {\n  content: \"\\E028\"; }\n\n.glyphicon-play-circle:before {\n  content: \"\\E029\"; }\n\n.glyphicon-repeat:before {\n  content: \"\\E030\"; }\n\n.glyphicon-refresh:before {\n  content: \"\\E031\"; }\n\n.glyphicon-list-alt:before {\n  content: \"\\E032\"; }\n\n.glyphicon-lock:before {\n  content: \"\\E033\"; }\n\n.glyphicon-flag:before {\n  content: \"\\E034\"; }\n\n.glyphicon-headphones:before {\n  content: \"\\E035\"; }\n\n.glyphicon-volume-off:before {\n  content: \"\\E036\"; }\n\n.glyphicon-volume-down:before {\n  content: \"\\E037\"; }\n\n.glyphicon-volume-up:before {\n  content: \"\\E038\"; }\n\n.glyphicon-qrcode:before {\n  content: \"\\E039\"; }\n\n.glyphicon-barcode:before {\n  content: \"\\E040\"; }\n\n.glyphicon-tag:before {\n  content: \"\\E041\"; }\n\n.glyphicon-tags:before {\n  content: \"\\E042\"; }\n\n.glyphicon-book:before {\n  content: \"\\E043\"; }\n\n.glyphicon-bookmark:before {\n  content: \"\\E044\"; }\n\n.glyphicon-print:before {\n  content: \"\\E045\"; }\n\n.glyphicon-camera:before {\n  content: \"\\E046\"; }\n\n.glyphicon-font:before {\n  content: \"\\E047\"; }\n\n.glyphicon-bold:before {\n  content: \"\\E048\"; }\n\n.glyphicon-italic:before {\n  content: \"\\E049\"; }\n\n.glyphicon-text-height:before {\n  content: \"\\E050\"; }\n\n.glyphicon-text-width:before {\n  content: \"\\E051\"; }\n\n.glyphicon-align-left:before {\n  content: \"\\E052\"; }\n\n.glyphicon-align-center:before {\n  content: \"\\E053\"; }\n\n.glyphicon-align-right:before {\n  content: \"\\E054\"; }\n\n.glyphicon-align-justify:before {\n  content: \"\\E055\"; }\n\n.glyphicon-list:before {\n  content: \"\\E056\"; }\n\n.glyphicon-indent-left:before {\n  content: \"\\E057\"; }\n\n.glyphicon-indent-right:before {\n  content: \"\\E058\"; }\n\n.glyphicon-facetime-video:before {\n  content: \"\\E059\"; }\n\n.glyphicon-picture:before {\n  content: \"\\E060\"; }\n\n.glyphicon-map-marker:before {\n  content: \"\\E062\"; }\n\n.glyphicon-adjust:before {\n  content: \"\\E063\"; }\n\n.glyphicon-tint:before {\n  content: \"\\E064\"; }\n\n.glyphicon-edit:before {\n  content: \"\\E065\"; }\n\n.glyphicon-share:before {\n  content: \"\\E066\"; }\n\n.glyphicon-check:before {\n  content: \"\\E067\"; }\n\n.glyphicon-move:before {\n  content: \"\\E068\"; }\n\n.glyphicon-step-backward:before {\n  content: \"\\E069\"; }\n\n.glyphicon-fast-backward:before {\n  content: \"\\E070\"; }\n\n.glyphicon-backward:before {\n  content: \"\\E071\"; }\n\n.glyphicon-play:before {\n  content: \"\\E072\"; }\n\n.glyphicon-pause:before {\n  content: \"\\E073\"; }\n\n.glyphicon-stop:before {\n  content: \"\\E074\"; }\n\n.glyphicon-forward:before {\n  content: \"\\E075\"; }\n\n.glyphicon-fast-forward:before {\n  content: \"\\E076\"; }\n\n.glyphicon-step-forward:before {\n  content: \"\\E077\"; }\n\n.glyphicon-eject:before {\n  content: \"\\E078\"; }\n\n.glyphicon-chevron-left:before {\n  content: \"\\E079\"; }\n\n.glyphicon-chevron-right:before {\n  content: \"\\E080\"; }\n\n.glyphicon-plus-sign:before {\n  content: \"\\E081\"; }\n\n.glyphicon-minus-sign:before {\n  content: \"\\E082\"; }\n\n.glyphicon-remove-sign:before {\n  content: \"\\E083\"; }\n\n.glyphicon-ok-sign:before {\n  content: \"\\E084\"; }\n\n.glyphicon-question-sign:before {\n  content: \"\\E085\"; }\n\n.glyphicon-info-sign:before {\n  content: \"\\E086\"; }\n\n.glyphicon-screenshot:before {\n  content: \"\\E087\"; }\n\n.glyphicon-remove-circle:before {\n  content: \"\\E088\"; }\n\n.glyphicon-ok-circle:before {\n  content: \"\\E089\"; }\n\n.glyphicon-ban-circle:before {\n  content: \"\\E090\"; }\n\n.glyphicon-arrow-left:before {\n  content: \"\\E091\"; }\n\n.glyphicon-arrow-right:before {\n  content: \"\\E092\"; }\n\n.glyphicon-arrow-up:before {\n  content: \"\\E093\"; }\n\n.glyphicon-arrow-down:before {\n  content: \"\\E094\"; }\n\n.glyphicon-share-alt:before {\n  content: \"\\E095\"; }\n\n.glyphicon-resize-full:before {\n  content: \"\\E096\"; }\n\n.glyphicon-resize-small:before {\n  content: \"\\E097\"; }\n\n.glyphicon-exclamation-sign:before {\n  content: \"\\E101\"; }\n\n.glyphicon-gift:before {\n  content: \"\\E102\"; }\n\n.glyphicon-leaf:before {\n  content: \"\\E103\"; }\n\n.glyphicon-fire:before {\n  content: \"\\E104\"; }\n\n.glyphicon-eye-open:before {\n  content: \"\\E105\"; }\n\n.glyphicon-eye-close:before {\n  content: \"\\E106\"; }\n\n.glyphicon-warning-sign:before {\n  content: \"\\E107\"; }\n\n.glyphicon-plane:before {\n  content: \"\\E108\"; }\n\n.glyphicon-calendar:before {\n  content: \"\\E109\"; }\n\n.glyphicon-random:before {\n  content: \"\\E110\"; }\n\n.glyphicon-comment:before {\n  content: \"\\E111\"; }\n\n.glyphicon-magnet:before {\n  content: \"\\E112\"; }\n\n.glyphicon-chevron-up:before {\n  content: \"\\E113\"; }\n\n.glyphicon-chevron-down:before {\n  content: \"\\E114\"; }\n\n.glyphicon-retweet:before {\n  content: \"\\E115\"; }\n\n.glyphicon-shopping-cart:before {\n  content: \"\\E116\"; }\n\n.glyphicon-folder-close:before {\n  content: \"\\E117\"; }\n\n.glyphicon-folder-open:before {\n  content: \"\\E118\"; }\n\n.glyphicon-resize-vertical:before {\n  content: \"\\E119\"; }\n\n.glyphicon-resize-horizontal:before {\n  content: \"\\E120\"; }\n\n.glyphicon-hdd:before {\n  content: \"\\E121\"; }\n\n.glyphicon-bullhorn:before {\n  content: \"\\E122\"; }\n\n.glyphicon-bell:before {\n  content: \"\\E123\"; }\n\n.glyphicon-certificate:before {\n  content: \"\\E124\"; }\n\n.glyphicon-thumbs-up:before {\n  content: \"\\E125\"; }\n\n.glyphicon-thumbs-down:before {\n  content: \"\\E126\"; }\n\n.glyphicon-hand-right:before {\n  content: \"\\E127\"; }\n\n.glyphicon-hand-left:before {\n  content: \"\\E128\"; }\n\n.glyphicon-hand-up:before {\n  content: \"\\E129\"; }\n\n.glyphicon-hand-down:before {\n  content: \"\\E130\"; }\n\n.glyphicon-circle-arrow-right:before {\n  content: \"\\E131\"; }\n\n.glyphicon-circle-arrow-left:before {\n  content: \"\\E132\"; }\n\n.glyphicon-circle-arrow-up:before {\n  content: \"\\E133\"; }\n\n.glyphicon-circle-arrow-down:before {\n  content: \"\\E134\"; }\n\n.glyphicon-globe:before {\n  content: \"\\E135\"; }\n\n.glyphicon-wrench:before {\n  content: \"\\E136\"; }\n\n.glyphicon-tasks:before {\n  content: \"\\E137\"; }\n\n.glyphicon-filter:before {\n  content: \"\\E138\"; }\n\n.glyphicon-briefcase:before {\n  content: \"\\E139\"; }\n\n.glyphicon-fullscreen:before {\n  content: \"\\E140\"; }\n\n.glyphicon-dashboard:before {\n  content: \"\\E141\"; }\n\n.glyphicon-paperclip:before {\n  content: \"\\E142\"; }\n\n.glyphicon-heart-empty:before {\n  content: \"\\E143\"; }\n\n.glyphicon-link:before {\n  content: \"\\E144\"; }\n\n.glyphicon-phone:before {\n  content: \"\\E145\"; }\n\n.glyphicon-pushpin:before {\n  content: \"\\E146\"; }\n\n.glyphicon-usd:before {\n  content: \"\\E148\"; }\n\n.glyphicon-gbp:before {\n  content: \"\\E149\"; }\n\n.glyphicon-sort:before {\n  content: \"\\E150\"; }\n\n.glyphicon-sort-by-alphabet:before {\n  content: \"\\E151\"; }\n\n.glyphicon-sort-by-alphabet-alt:before {\n  content: \"\\E152\"; }\n\n.glyphicon-sort-by-order:before {\n  content: \"\\E153\"; }\n\n.glyphicon-sort-by-order-alt:before {\n  content: \"\\E154\"; }\n\n.glyphicon-sort-by-attributes:before {\n  content: \"\\E155\"; }\n\n.glyphicon-sort-by-attributes-alt:before {\n  content: \"\\E156\"; }\n\n.glyphicon-unchecked:before {\n  content: \"\\E157\"; }\n\n.glyphicon-expand:before {\n  content: \"\\E158\"; }\n\n.glyphicon-collapse-down:before {\n  content: \"\\E159\"; }\n\n.glyphicon-collapse-up:before {\n  content: \"\\E160\"; }\n\n.glyphicon-log-in:before {\n  content: \"\\E161\"; }\n\n.glyphicon-flash:before {\n  content: \"\\E162\"; }\n\n.glyphicon-log-out:before {\n  content: \"\\E163\"; }\n\n.glyphicon-new-window:before {\n  content: \"\\E164\"; }\n\n.glyphicon-record:before {\n  content: \"\\E165\"; }\n\n.glyphicon-save:before {\n  content: \"\\E166\"; }\n\n.glyphicon-open:before {\n  content: \"\\E167\"; }\n\n.glyphicon-saved:before {\n  content: \"\\E168\"; }\n\n.glyphicon-import:before {\n  content: \"\\E169\"; }\n\n.glyphicon-export:before {\n  content: \"\\E170\"; }\n\n.glyphicon-send:before {\n  content: \"\\E171\"; }\n\n.glyphicon-floppy-disk:before {\n  content: \"\\E172\"; }\n\n.glyphicon-floppy-saved:before {\n  content: \"\\E173\"; }\n\n.glyphicon-floppy-remove:before {\n  content: \"\\E174\"; }\n\n.glyphicon-floppy-save:before {\n  content: \"\\E175\"; }\n\n.glyphicon-floppy-open:before {\n  content: \"\\E176\"; }\n\n.glyphicon-credit-card:before {\n  content: \"\\E177\"; }\n\n.glyphicon-transfer:before {\n  content: \"\\E178\"; }\n\n.glyphicon-cutlery:before {\n  content: \"\\E179\"; }\n\n.glyphicon-header:before {\n  content: \"\\E180\"; }\n\n.glyphicon-compressed:before {\n  content: \"\\E181\"; }\n\n.glyphicon-earphone:before {\n  content: \"\\E182\"; }\n\n.glyphicon-phone-alt:before {\n  content: \"\\E183\"; }\n\n.glyphicon-tower:before {\n  content: \"\\E184\"; }\n\n.glyphicon-stats:before {\n  content: \"\\E185\"; }\n\n.glyphicon-sd-video:before {\n  content: \"\\E186\"; }\n\n.glyphicon-hd-video:before {\n  content: \"\\E187\"; }\n\n.glyphicon-subtitles:before {\n  content: \"\\E188\"; }\n\n.glyphicon-sound-stereo:before {\n  content: \"\\E189\"; }\n\n.glyphicon-sound-dolby:before {\n  content: \"\\E190\"; }\n\n.glyphicon-sound-5-1:before {\n  content: \"\\E191\"; }\n\n.glyphicon-sound-6-1:before {\n  content: \"\\E192\"; }\n\n.glyphicon-sound-7-1:before {\n  content: \"\\E193\"; }\n\n.glyphicon-copyright-mark:before {\n  content: \"\\E194\"; }\n\n.glyphicon-registration-mark:before {\n  content: \"\\E195\"; }\n\n.glyphicon-cloud-download:before {\n  content: \"\\E197\"; }\n\n.glyphicon-cloud-upload:before {\n  content: \"\\E198\"; }\n\n.glyphicon-tree-conifer:before {\n  content: \"\\E199\"; }\n\n.glyphicon-tree-deciduous:before {\n  content: \"\\E200\"; }\n\n.glyphicon-cd:before {\n  content: \"\\E201\"; }\n\n.glyphicon-save-file:before {\n  content: \"\\E202\"; }\n\n.glyphicon-open-file:before {\n  content: \"\\E203\"; }\n\n.glyphicon-level-up:before {\n  content: \"\\E204\"; }\n\n.glyphicon-copy:before {\n  content: \"\\E205\"; }\n\n.glyphicon-paste:before {\n  content: \"\\E206\"; }\n\n.glyphicon-alert:before {\n  content: \"\\E209\"; }\n\n.glyphicon-equalizer:before {\n  content: \"\\E210\"; }\n\n.glyphicon-king:before {\n  content: \"\\E211\"; }\n\n.glyphicon-queen:before {\n  content: \"\\E212\"; }\n\n.glyphicon-pawn:before {\n  content: \"\\E213\"; }\n\n.glyphicon-bishop:before {\n  content: \"\\E214\"; }\n\n.glyphicon-knight:before {\n  content: \"\\E215\"; }\n\n.glyphicon-baby-formula:before {\n  content: \"\\E216\"; }\n\n.glyphicon-tent:before {\n  content: \"\\26FA\"; }\n\n.glyphicon-blackboard:before {\n  content: \"\\E218\"; }\n\n.glyphicon-bed:before {\n  content: \"\\E219\"; }\n\n.glyphicon-apple:before {\n  content: \"\\F8FF\"; }\n\n.glyphicon-erase:before {\n  content: \"\\E221\"; }\n\n.glyphicon-hourglass:before {\n  content: \"\\231B\"; }\n\n.glyphicon-lamp:before {\n  content: \"\\E223\"; }\n\n.glyphicon-duplicate:before {\n  content: \"\\E224\"; }\n\n.glyphicon-piggy-bank:before {\n  content: \"\\E225\"; }\n\n.glyphicon-scissors:before {\n  content: \"\\E226\"; }\n\n.glyphicon-bitcoin:before {\n  content: \"\\E227\"; }\n\n.glyphicon-btc:before {\n  content: \"\\E227\"; }\n\n.glyphicon-xbt:before {\n  content: \"\\E227\"; }\n\n.glyphicon-yen:before {\n  content: \"\\A5\"; }\n\n.glyphicon-jpy:before {\n  content: \"\\A5\"; }\n\n.glyphicon-ruble:before {\n  content: \"\\20BD\"; }\n\n.glyphicon-rub:before {\n  content: \"\\20BD\"; }\n\n.glyphicon-scale:before {\n  content: \"\\E230\"; }\n\n.glyphicon-ice-lolly:before {\n  content: \"\\E231\"; }\n\n.glyphicon-ice-lolly-tasted:before {\n  content: \"\\E232\"; }\n\n.glyphicon-education:before {\n  content: \"\\E233\"; }\n\n.glyphicon-option-horizontal:before {\n  content: \"\\E234\"; }\n\n.glyphicon-option-vertical:before {\n  content: \"\\E235\"; }\n\n.glyphicon-menu-hamburger:before {\n  content: \"\\E236\"; }\n\n.glyphicon-modal-window:before {\n  content: \"\\E237\"; }\n\n.glyphicon-oil:before {\n  content: \"\\E238\"; }\n\n.glyphicon-grain:before {\n  content: \"\\E239\"; }\n\n.glyphicon-sunglasses:before {\n  content: \"\\E240\"; }\n\n.glyphicon-text-size:before {\n  content: \"\\E241\"; }\n\n.glyphicon-text-color:before {\n  content: \"\\E242\"; }\n\n.glyphicon-text-background:before {\n  content: \"\\E243\"; }\n\n.glyphicon-object-align-top:before {\n  content: \"\\E244\"; }\n\n.glyphicon-object-align-bottom:before {\n  content: \"\\E245\"; }\n\n.glyphicon-object-align-horizontal:before {\n  content: \"\\E246\"; }\n\n.glyphicon-object-align-left:before {\n  content: \"\\E247\"; }\n\n.glyphicon-object-align-vertical:before {\n  content: \"\\E248\"; }\n\n.glyphicon-object-align-right:before {\n  content: \"\\E249\"; }\n\n.glyphicon-triangle-right:before {\n  content: \"\\E250\"; }\n\n.glyphicon-triangle-left:before {\n  content: \"\\E251\"; }\n\n.glyphicon-triangle-bottom:before {\n  content: \"\\E252\"; }\n\n.glyphicon-triangle-top:before {\n  content: \"\\E253\"; }\n\n.glyphicon-console:before {\n  content: \"\\E254\"; }\n\n.glyphicon-superscript:before {\n  content: \"\\E255\"; }\n\n.glyphicon-subscript:before {\n  content: \"\\E256\"; }\n\n.glyphicon-menu-left:before {\n  content: \"\\E257\"; }\n\n.glyphicon-menu-right:before {\n  content: \"\\E258\"; }\n\n.glyphicon-menu-down:before {\n  content: \"\\E259\"; }\n\n.glyphicon-menu-up:before {\n  content: \"\\E260\"; }\n\n* {\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box; }\n\n*:before,\n*:after {\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box; }\n\nhtml {\n  font-size: 10px;\n  -webkit-tap-highlight-color: transparent; }\n\nbody {\n  font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n  font-size: 14px;\n  line-height: 1.42857;\n  color: #333333;\n  background-color: #fff; }\n\ninput,\nbutton,\nselect,\ntextarea {\n  font-family: inherit;\n  font-size: inherit;\n  line-height: inherit; }\n\na {\n  color: #337ab7;\n  text-decoration: none; }\n  a:hover, a:focus {\n    color: #23527c;\n    text-decoration: underline; }\n  a:focus {\n    outline: 5px auto -webkit-focus-ring-color;\n    outline-offset: -2px; }\n\nfigure {\n  margin: 0; }\n\nimg {\n  vertical-align: middle; }\n\n.img-responsive {\n  display: block;\n  max-width: 100%;\n  height: auto; }\n\n.img-rounded {\n  border-radius: 6px; }\n\n.img-thumbnail {\n  padding: 4px;\n  line-height: 1.42857;\n  background-color: #fff;\n  border: 1px solid #ddd;\n  border-radius: 4px;\n  -webkit-transition: all 0.2s ease-in-out;\n  -o-transition: all 0.2s ease-in-out;\n  transition: all 0.2s ease-in-out;\n  display: inline-block;\n  max-width: 100%;\n  height: auto; }\n\n.img-circle {\n  border-radius: 50%; }\n\nhr {\n  margin-top: 20px;\n  margin-bottom: 20px;\n  border: 0;\n  border-top: 1px solid #eeeeee; }\n\n.sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  margin: -1px;\n  padding: 0;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  border: 0; }\n\n.sr-only-focusable:active, .sr-only-focusable:focus {\n  position: static;\n  width: auto;\n  height: auto;\n  margin: 0;\n  overflow: visible;\n  clip: auto; }\n\n[role=\"button\"] {\n  cursor: pointer; }\n\nh1, h2, h3, h4, h5, h6,\n.h1, .h2, .h3, .h4, .h5, .h6 {\n  font-family: inherit;\n  font-weight: 500;\n  line-height: 1.1;\n  color: inherit; }\n  h1 small,\n  h1 .small, h2 small,\n  h2 .small, h3 small,\n  h3 .small, h4 small,\n  h4 .small, h5 small,\n  h5 .small, h6 small,\n  h6 .small,\n  .h1 small,\n  .h1 .small, .h2 small,\n  .h2 .small, .h3 small,\n  .h3 .small, .h4 small,\n  .h4 .small, .h5 small,\n  .h5 .small, .h6 small,\n  .h6 .small {\n    font-weight: normal;\n    line-height: 1;\n    color: #777777; }\n\nh1, .h1,\nh2, .h2,\nh3, .h3 {\n  margin-top: 20px;\n  margin-bottom: 10px; }\n  h1 small,\n  h1 .small, .h1 small,\n  .h1 .small,\n  h2 small,\n  h2 .small, .h2 small,\n  .h2 .small,\n  h3 small,\n  h3 .small, .h3 small,\n  .h3 .small {\n    font-size: 65%; }\n\nh4, .h4,\nh5, .h5,\nh6, .h6 {\n  margin-top: 10px;\n  margin-bottom: 10px; }\n  h4 small,\n  h4 .small, .h4 small,\n  .h4 .small,\n  h5 small,\n  h5 .small, .h5 small,\n  .h5 .small,\n  h6 small,\n  h6 .small, .h6 small,\n  .h6 .small {\n    font-size: 75%; }\n\nh1, .h1 {\n  font-size: 36px; }\n\nh2, .h2 {\n  font-size: 30px; }\n\nh3, .h3 {\n  font-size: 24px; }\n\nh4, .h4 {\n  font-size: 18px; }\n\nh5, .h5 {\n  font-size: 14px; }\n\nh6, .h6 {\n  font-size: 12px; }\n\np {\n  margin: 0 0 10px; }\n\n.lead {\n  margin-bottom: 20px;\n  font-size: 16px;\n  font-weight: 300;\n  line-height: 1.4; }\n  @media (min-width: 768px) {\n    .lead {\n      font-size: 21px; } }\n\nsmall,\n.small {\n  font-size: 85%; }\n\nmark,\n.mark {\n  background-color: #fcf8e3;\n  padding: .2em; }\n\n.text-left {\n  text-align: left; }\n\n.text-right {\n  text-align: right; }\n\n.text-center {\n  text-align: center; }\n\n.text-justify {\n  text-align: justify; }\n\n.text-nowrap {\n  white-space: nowrap; }\n\n.text-lowercase {\n  text-transform: lowercase; }\n\n.text-uppercase, .initialism {\n  text-transform: uppercase; }\n\n.text-capitalize {\n  text-transform: capitalize; }\n\n.text-muted {\n  color: #777777; }\n\n.text-primary {\n  color: #337ab7; }\n\na.text-primary:hover,\na.text-primary:focus {\n  color: #286090; }\n\n.text-success {\n  color: #3c763d; }\n\na.text-success:hover,\na.text-success:focus {\n  color: #2b542c; }\n\n.text-info {\n  color: #31708f; }\n\na.text-info:hover,\na.text-info:focus {\n  color: #245269; }\n\n.text-warning {\n  color: #8a6d3b; }\n\na.text-warning:hover,\na.text-warning:focus {\n  color: #66512c; }\n\n.text-danger {\n  color: #a94442; }\n\na.text-danger:hover,\na.text-danger:focus {\n  color: #843534; }\n\n.bg-primary {\n  color: #fff; }\n\n.bg-primary {\n  background-color: #337ab7; }\n\na.bg-primary:hover,\na.bg-primary:focus {\n  background-color: #286090; }\n\n.bg-success {\n  background-color: #dff0d8; }\n\na.bg-success:hover,\na.bg-success:focus {\n  background-color: #c1e2b3; }\n\n.bg-info {\n  background-color: #d9edf7; }\n\na.bg-info:hover,\na.bg-info:focus {\n  background-color: #afd9ee; }\n\n.bg-warning {\n  background-color: #fcf8e3; }\n\na.bg-warning:hover,\na.bg-warning:focus {\n  background-color: #f7ecb5; }\n\n.bg-danger {\n  background-color: #f2dede; }\n\na.bg-danger:hover,\na.bg-danger:focus {\n  background-color: #e4b9b9; }\n\n.page-header {\n  padding-bottom: 9px;\n  margin: 40px 0 20px;\n  border-bottom: 1px solid #eeeeee; }\n\nul,\nol {\n  margin-top: 0;\n  margin-bottom: 10px; }\n  ul ul,\n  ul ol,\n  ol ul,\n  ol ol {\n    margin-bottom: 0; }\n\n.list-unstyled {\n  padding-left: 0;\n  list-style: none; }\n\n.list-inline {\n  padding-left: 0;\n  list-style: none;\n  margin-left: -5px; }\n  .list-inline > li {\n    display: inline-block;\n    padding-left: 5px;\n    padding-right: 5px; }\n\ndl {\n  margin-top: 0;\n  margin-bottom: 20px; }\n\ndt,\ndd {\n  line-height: 1.42857; }\n\ndt {\n  font-weight: bold; }\n\ndd {\n  margin-left: 0; }\n\n.dl-horizontal dd:before, .dl-horizontal dd:after {\n  content: \" \";\n  display: table; }\n\n.dl-horizontal dd:after {\n  clear: both; }\n\n@media (min-width: 768px) {\n  .dl-horizontal dt {\n    float: left;\n    width: 160px;\n    clear: left;\n    text-align: right;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap; }\n  .dl-horizontal dd {\n    margin-left: 180px; } }\n\nabbr[title],\nabbr[data-original-title] {\n  cursor: help;\n  border-bottom: 1px dotted #777777; }\n\n.initialism {\n  font-size: 90%; }\n\nblockquote {\n  padding: 10px 20px;\n  margin: 0 0 20px;\n  font-size: 17.5px;\n  border-left: 5px solid #eeeeee; }\n  blockquote p:last-child,\n  blockquote ul:last-child,\n  blockquote ol:last-child {\n    margin-bottom: 0; }\n  blockquote footer,\n  blockquote small,\n  blockquote .small {\n    display: block;\n    font-size: 80%;\n    line-height: 1.42857;\n    color: #777777; }\n    blockquote footer:before,\n    blockquote small:before,\n    blockquote .small:before {\n      content: '\\2014   \\A0'; }\n\n.blockquote-reverse,\nblockquote.pull-right {\n  padding-right: 15px;\n  padding-left: 0;\n  border-right: 5px solid #eeeeee;\n  border-left: 0;\n  text-align: right; }\n  .blockquote-reverse footer:before,\n  .blockquote-reverse small:before,\n  .blockquote-reverse .small:before,\n  blockquote.pull-right footer:before,\n  blockquote.pull-right small:before,\n  blockquote.pull-right .small:before {\n    content: ''; }\n  .blockquote-reverse footer:after,\n  .blockquote-reverse small:after,\n  .blockquote-reverse .small:after,\n  blockquote.pull-right footer:after,\n  blockquote.pull-right small:after,\n  blockquote.pull-right .small:after {\n    content: '\\A0   \\2014'; }\n\naddress {\n  margin-bottom: 20px;\n  font-style: normal;\n  line-height: 1.42857; }\n\ncode,\nkbd,\npre,\nsamp {\n  font-family: Menlo, Monaco, Consolas, \"Courier New\", monospace; }\n\ncode {\n  padding: 2px 4px;\n  font-size: 90%;\n  color: #c7254e;\n  background-color: #f9f2f4;\n  border-radius: 4px; }\n\nkbd {\n  padding: 2px 4px;\n  font-size: 90%;\n  color: #fff;\n  background-color: #333;\n  border-radius: 3px;\n  box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.25); }\n  kbd kbd {\n    padding: 0;\n    font-size: 100%;\n    font-weight: bold;\n    box-shadow: none; }\n\npre {\n  display: block;\n  padding: 9.5px;\n  margin: 0 0 10px;\n  font-size: 13px;\n  line-height: 1.42857;\n  word-break: break-all;\n  word-wrap: break-word;\n  color: #333333;\n  background-color: #f5f5f5;\n  border: 1px solid #ccc;\n  border-radius: 4px; }\n  pre code {\n    padding: 0;\n    font-size: inherit;\n    color: inherit;\n    white-space: pre-wrap;\n    background-color: transparent;\n    border-radius: 0; }\n\n.pre-scrollable {\n  max-height: 340px;\n  overflow-y: scroll; }\n\n.container {\n  margin-right: auto;\n  margin-left: auto;\n  padding-left: 15px;\n  padding-right: 15px; }\n  .container:before, .container:after {\n    content: \" \";\n    display: table; }\n  .container:after {\n    clear: both; }\n  @media (min-width: 768px) {\n    .container {\n      width: 750px; } }\n  @media (min-width: 992px) {\n    .container {\n      width: 970px; } }\n  @media (min-width: 1200px) {\n    .container {\n      width: 1170px; } }\n\n.container-fluid {\n  margin-right: auto;\n  margin-left: auto;\n  padding-left: 15px;\n  padding-right: 15px; }\n  .container-fluid:before, .container-fluid:after {\n    content: \" \";\n    display: table; }\n  .container-fluid:after {\n    clear: both; }\n\n.row {\n  margin-left: -15px;\n  margin-right: -15px; }\n  .row:before, .row:after {\n    content: \" \";\n    display: table; }\n  .row:after {\n    clear: both; }\n\n.col-xs-1, .col-sm-1, .col-md-1, .col-lg-1, .col-xs-2, .col-sm-2, .col-md-2, .col-lg-2, .col-xs-3, .col-sm-3, .col-md-3, .col-lg-3, .col-xs-4, .col-sm-4, .col-md-4, .col-lg-4, .col-xs-5, .col-sm-5, .col-md-5, .col-lg-5, .col-xs-6, .col-sm-6, .col-md-6, .col-lg-6, .col-xs-7, .col-sm-7, .col-md-7, .col-lg-7, .col-xs-8, .col-sm-8, .col-md-8, .col-lg-8, .col-xs-9, .col-sm-9, .col-md-9, .col-lg-9, .col-xs-10, .col-sm-10, .col-md-10, .col-lg-10, .col-xs-11, .col-sm-11, .col-md-11, .col-lg-11, .col-xs-12, .col-sm-12, .col-md-12, .col-lg-12 {\n  position: relative;\n  min-height: 1px;\n  padding-left: 15px;\n  padding-right: 15px; }\n\n.col-xs-1, .col-xs-2, .col-xs-3, .col-xs-4, .col-xs-5, .col-xs-6, .col-xs-7, .col-xs-8, .col-xs-9, .col-xs-10, .col-xs-11, .col-xs-12 {\n  float: left; }\n\n.col-xs-1 {\n  width: 8.33333%; }\n\n.col-xs-2 {\n  width: 16.66667%; }\n\n.col-xs-3 {\n  width: 25%; }\n\n.col-xs-4 {\n  width: 33.33333%; }\n\n.col-xs-5 {\n  width: 41.66667%; }\n\n.col-xs-6 {\n  width: 50%; }\n\n.col-xs-7 {\n  width: 58.33333%; }\n\n.col-xs-8 {\n  width: 66.66667%; }\n\n.col-xs-9 {\n  width: 75%; }\n\n.col-xs-10 {\n  width: 83.33333%; }\n\n.col-xs-11 {\n  width: 91.66667%; }\n\n.col-xs-12 {\n  width: 100%; }\n\n.col-xs-pull-0 {\n  right: auto; }\n\n.col-xs-pull-1 {\n  right: 8.33333%; }\n\n.col-xs-pull-2 {\n  right: 16.66667%; }\n\n.col-xs-pull-3 {\n  right: 25%; }\n\n.col-xs-pull-4 {\n  right: 33.33333%; }\n\n.col-xs-pull-5 {\n  right: 41.66667%; }\n\n.col-xs-pull-6 {\n  right: 50%; }\n\n.col-xs-pull-7 {\n  right: 58.33333%; }\n\n.col-xs-pull-8 {\n  right: 66.66667%; }\n\n.col-xs-pull-9 {\n  right: 75%; }\n\n.col-xs-pull-10 {\n  right: 83.33333%; }\n\n.col-xs-pull-11 {\n  right: 91.66667%; }\n\n.col-xs-pull-12 {\n  right: 100%; }\n\n.col-xs-push-0 {\n  left: auto; }\n\n.col-xs-push-1 {\n  left: 8.33333%; }\n\n.col-xs-push-2 {\n  left: 16.66667%; }\n\n.col-xs-push-3 {\n  left: 25%; }\n\n.col-xs-push-4 {\n  left: 33.33333%; }\n\n.col-xs-push-5 {\n  left: 41.66667%; }\n\n.col-xs-push-6 {\n  left: 50%; }\n\n.col-xs-push-7 {\n  left: 58.33333%; }\n\n.col-xs-push-8 {\n  left: 66.66667%; }\n\n.col-xs-push-9 {\n  left: 75%; }\n\n.col-xs-push-10 {\n  left: 83.33333%; }\n\n.col-xs-push-11 {\n  left: 91.66667%; }\n\n.col-xs-push-12 {\n  left: 100%; }\n\n.col-xs-offset-0 {\n  margin-left: 0%; }\n\n.col-xs-offset-1 {\n  margin-left: 8.33333%; }\n\n.col-xs-offset-2 {\n  margin-left: 16.66667%; }\n\n.col-xs-offset-3 {\n  margin-left: 25%; }\n\n.col-xs-offset-4 {\n  margin-left: 33.33333%; }\n\n.col-xs-offset-5 {\n  margin-left: 41.66667%; }\n\n.col-xs-offset-6 {\n  margin-left: 50%; }\n\n.col-xs-offset-7 {\n  margin-left: 58.33333%; }\n\n.col-xs-offset-8 {\n  margin-left: 66.66667%; }\n\n.col-xs-offset-9 {\n  margin-left: 75%; }\n\n.col-xs-offset-10 {\n  margin-left: 83.33333%; }\n\n.col-xs-offset-11 {\n  margin-left: 91.66667%; }\n\n.col-xs-offset-12 {\n  margin-left: 100%; }\n\n@media (min-width: 768px) {\n  .col-sm-1, .col-sm-2, .col-sm-3, .col-sm-4, .col-sm-5, .col-sm-6, .col-sm-7, .col-sm-8, .col-sm-9, .col-sm-10, .col-sm-11, .col-sm-12 {\n    float: left; }\n  .col-sm-1 {\n    width: 8.33333%; }\n  .col-sm-2 {\n    width: 16.66667%; }\n  .col-sm-3 {\n    width: 25%; }\n  .col-sm-4 {\n    width: 33.33333%; }\n  .col-sm-5 {\n    width: 41.66667%; }\n  .col-sm-6 {\n    width: 50%; }\n  .col-sm-7 {\n    width: 58.33333%; }\n  .col-sm-8 {\n    width: 66.66667%; }\n  .col-sm-9 {\n    width: 75%; }\n  .col-sm-10 {\n    width: 83.33333%; }\n  .col-sm-11 {\n    width: 91.66667%; }\n  .col-sm-12 {\n    width: 100%; }\n  .col-sm-pull-0 {\n    right: auto; }\n  .col-sm-pull-1 {\n    right: 8.33333%; }\n  .col-sm-pull-2 {\n    right: 16.66667%; }\n  .col-sm-pull-3 {\n    right: 25%; }\n  .col-sm-pull-4 {\n    right: 33.33333%; }\n  .col-sm-pull-5 {\n    right: 41.66667%; }\n  .col-sm-pull-6 {\n    right: 50%; }\n  .col-sm-pull-7 {\n    right: 58.33333%; }\n  .col-sm-pull-8 {\n    right: 66.66667%; }\n  .col-sm-pull-9 {\n    right: 75%; }\n  .col-sm-pull-10 {\n    right: 83.33333%; }\n  .col-sm-pull-11 {\n    right: 91.66667%; }\n  .col-sm-pull-12 {\n    right: 100%; }\n  .col-sm-push-0 {\n    left: auto; }\n  .col-sm-push-1 {\n    left: 8.33333%; }\n  .col-sm-push-2 {\n    left: 16.66667%; }\n  .col-sm-push-3 {\n    left: 25%; }\n  .col-sm-push-4 {\n    left: 33.33333%; }\n  .col-sm-push-5 {\n    left: 41.66667%; }\n  .col-sm-push-6 {\n    left: 50%; }\n  .col-sm-push-7 {\n    left: 58.33333%; }\n  .col-sm-push-8 {\n    left: 66.66667%; }\n  .col-sm-push-9 {\n    left: 75%; }\n  .col-sm-push-10 {\n    left: 83.33333%; }\n  .col-sm-push-11 {\n    left: 91.66667%; }\n  .col-sm-push-12 {\n    left: 100%; }\n  .col-sm-offset-0 {\n    margin-left: 0%; }\n  .col-sm-offset-1 {\n    margin-left: 8.33333%; }\n  .col-sm-offset-2 {\n    margin-left: 16.66667%; }\n  .col-sm-offset-3 {\n    margin-left: 25%; }\n  .col-sm-offset-4 {\n    margin-left: 33.33333%; }\n  .col-sm-offset-5 {\n    margin-left: 41.66667%; }\n  .col-sm-offset-6 {\n    margin-left: 50%; }\n  .col-sm-offset-7 {\n    margin-left: 58.33333%; }\n  .col-sm-offset-8 {\n    margin-left: 66.66667%; }\n  .col-sm-offset-9 {\n    margin-left: 75%; }\n  .col-sm-offset-10 {\n    margin-left: 83.33333%; }\n  .col-sm-offset-11 {\n    margin-left: 91.66667%; }\n  .col-sm-offset-12 {\n    margin-left: 100%; } }\n\n@media (min-width: 992px) {\n  .col-md-1, .col-md-2, .col-md-3, .col-md-4, .col-md-5, .col-md-6, .col-md-7, .col-md-8, .col-md-9, .col-md-10, .col-md-11, .col-md-12 {\n    float: left; }\n  .col-md-1 {\n    width: 8.33333%; }\n  .col-md-2 {\n    width: 16.66667%; }\n  .col-md-3 {\n    width: 25%; }\n  .col-md-4 {\n    width: 33.33333%; }\n  .col-md-5 {\n    width: 41.66667%; }\n  .col-md-6 {\n    width: 50%; }\n  .col-md-7 {\n    width: 58.33333%; }\n  .col-md-8 {\n    width: 66.66667%; }\n  .col-md-9 {\n    width: 75%; }\n  .col-md-10 {\n    width: 83.33333%; }\n  .col-md-11 {\n    width: 91.66667%; }\n  .col-md-12 {\n    width: 100%; }\n  .col-md-pull-0 {\n    right: auto; }\n  .col-md-pull-1 {\n    right: 8.33333%; }\n  .col-md-pull-2 {\n    right: 16.66667%; }\n  .col-md-pull-3 {\n    right: 25%; }\n  .col-md-pull-4 {\n    right: 33.33333%; }\n  .col-md-pull-5 {\n    right: 41.66667%; }\n  .col-md-pull-6 {\n    right: 50%; }\n  .col-md-pull-7 {\n    right: 58.33333%; }\n  .col-md-pull-8 {\n    right: 66.66667%; }\n  .col-md-pull-9 {\n    right: 75%; }\n  .col-md-pull-10 {\n    right: 83.33333%; }\n  .col-md-pull-11 {\n    right: 91.66667%; }\n  .col-md-pull-12 {\n    right: 100%; }\n  .col-md-push-0 {\n    left: auto; }\n  .col-md-push-1 {\n    left: 8.33333%; }\n  .col-md-push-2 {\n    left: 16.66667%; }\n  .col-md-push-3 {\n    left: 25%; }\n  .col-md-push-4 {\n    left: 33.33333%; }\n  .col-md-push-5 {\n    left: 41.66667%; }\n  .col-md-push-6 {\n    left: 50%; }\n  .col-md-push-7 {\n    left: 58.33333%; }\n  .col-md-push-8 {\n    left: 66.66667%; }\n  .col-md-push-9 {\n    left: 75%; }\n  .col-md-push-10 {\n    left: 83.33333%; }\n  .col-md-push-11 {\n    left: 91.66667%; }\n  .col-md-push-12 {\n    left: 100%; }\n  .col-md-offset-0 {\n    margin-left: 0%; }\n  .col-md-offset-1 {\n    margin-left: 8.33333%; }\n  .col-md-offset-2 {\n    margin-left: 16.66667%; }\n  .col-md-offset-3 {\n    margin-left: 25%; }\n  .col-md-offset-4 {\n    margin-left: 33.33333%; }\n  .col-md-offset-5 {\n    margin-left: 41.66667%; }\n  .col-md-offset-6 {\n    margin-left: 50%; }\n  .col-md-offset-7 {\n    margin-left: 58.33333%; }\n  .col-md-offset-8 {\n    margin-left: 66.66667%; }\n  .col-md-offset-9 {\n    margin-left: 75%; }\n  .col-md-offset-10 {\n    margin-left: 83.33333%; }\n  .col-md-offset-11 {\n    margin-left: 91.66667%; }\n  .col-md-offset-12 {\n    margin-left: 100%; } }\n\n@media (min-width: 1200px) {\n  .col-lg-1, .col-lg-2, .col-lg-3, .col-lg-4, .col-lg-5, .col-lg-6, .col-lg-7, .col-lg-8, .col-lg-9, .col-lg-10, .col-lg-11, .col-lg-12 {\n    float: left; }\n  .col-lg-1 {\n    width: 8.33333%; }\n  .col-lg-2 {\n    width: 16.66667%; }\n  .col-lg-3 {\n    width: 25%; }\n  .col-lg-4 {\n    width: 33.33333%; }\n  .col-lg-5 {\n    width: 41.66667%; }\n  .col-lg-6 {\n    width: 50%; }\n  .col-lg-7 {\n    width: 58.33333%; }\n  .col-lg-8 {\n    width: 66.66667%; }\n  .col-lg-9 {\n    width: 75%; }\n  .col-lg-10 {\n    width: 83.33333%; }\n  .col-lg-11 {\n    width: 91.66667%; }\n  .col-lg-12 {\n    width: 100%; }\n  .col-lg-pull-0 {\n    right: auto; }\n  .col-lg-pull-1 {\n    right: 8.33333%; }\n  .col-lg-pull-2 {\n    right: 16.66667%; }\n  .col-lg-pull-3 {\n    right: 25%; }\n  .col-lg-pull-4 {\n    right: 33.33333%; }\n  .col-lg-pull-5 {\n    right: 41.66667%; }\n  .col-lg-pull-6 {\n    right: 50%; }\n  .col-lg-pull-7 {\n    right: 58.33333%; }\n  .col-lg-pull-8 {\n    right: 66.66667%; }\n  .col-lg-pull-9 {\n    right: 75%; }\n  .col-lg-pull-10 {\n    right: 83.33333%; }\n  .col-lg-pull-11 {\n    right: 91.66667%; }\n  .col-lg-pull-12 {\n    right: 100%; }\n  .col-lg-push-0 {\n    left: auto; }\n  .col-lg-push-1 {\n    left: 8.33333%; }\n  .col-lg-push-2 {\n    left: 16.66667%; }\n  .col-lg-push-3 {\n    left: 25%; }\n  .col-lg-push-4 {\n    left: 33.33333%; }\n  .col-lg-push-5 {\n    left: 41.66667%; }\n  .col-lg-push-6 {\n    left: 50%; }\n  .col-lg-push-7 {\n    left: 58.33333%; }\n  .col-lg-push-8 {\n    left: 66.66667%; }\n  .col-lg-push-9 {\n    left: 75%; }\n  .col-lg-push-10 {\n    left: 83.33333%; }\n  .col-lg-push-11 {\n    left: 91.66667%; }\n  .col-lg-push-12 {\n    left: 100%; }\n  .col-lg-offset-0 {\n    margin-left: 0%; }\n  .col-lg-offset-1 {\n    margin-left: 8.33333%; }\n  .col-lg-offset-2 {\n    margin-left: 16.66667%; }\n  .col-lg-offset-3 {\n    margin-left: 25%; }\n  .col-lg-offset-4 {\n    margin-left: 33.33333%; }\n  .col-lg-offset-5 {\n    margin-left: 41.66667%; }\n  .col-lg-offset-6 {\n    margin-left: 50%; }\n  .col-lg-offset-7 {\n    margin-left: 58.33333%; }\n  .col-lg-offset-8 {\n    margin-left: 66.66667%; }\n  .col-lg-offset-9 {\n    margin-left: 75%; }\n  .col-lg-offset-10 {\n    margin-left: 83.33333%; }\n  .col-lg-offset-11 {\n    margin-left: 91.66667%; }\n  .col-lg-offset-12 {\n    margin-left: 100%; } }\n\ntable {\n  background-color: transparent; }\n\ncaption {\n  padding-top: 8px;\n  padding-bottom: 8px;\n  color: #777777;\n  text-align: left; }\n\nth {\n  text-align: left; }\n\n.table {\n  width: 100%;\n  max-width: 100%;\n  margin-bottom: 20px; }\n  .table > thead > tr > th,\n  .table > thead > tr > td,\n  .table > tbody > tr > th,\n  .table > tbody > tr > td,\n  .table > tfoot > tr > th,\n  .table > tfoot > tr > td {\n    padding: 8px;\n    line-height: 1.42857;\n    vertical-align: top;\n    border-top: 1px solid #ddd; }\n  .table > thead > tr > th {\n    vertical-align: bottom;\n    border-bottom: 2px solid #ddd; }\n  .table > caption + thead > tr:first-child > th,\n  .table > caption + thead > tr:first-child > td,\n  .table > colgroup + thead > tr:first-child > th,\n  .table > colgroup + thead > tr:first-child > td,\n  .table > thead:first-child > tr:first-child > th,\n  .table > thead:first-child > tr:first-child > td {\n    border-top: 0; }\n  .table > tbody + tbody {\n    border-top: 2px solid #ddd; }\n  .table .table {\n    background-color: #fff; }\n\n.table-condensed > thead > tr > th,\n.table-condensed > thead > tr > td,\n.table-condensed > tbody > tr > th,\n.table-condensed > tbody > tr > td,\n.table-condensed > tfoot > tr > th,\n.table-condensed > tfoot > tr > td {\n  padding: 5px; }\n\n.table-bordered {\n  border: 1px solid #ddd; }\n  .table-bordered > thead > tr > th,\n  .table-bordered > thead > tr > td,\n  .table-bordered > tbody > tr > th,\n  .table-bordered > tbody > tr > td,\n  .table-bordered > tfoot > tr > th,\n  .table-bordered > tfoot > tr > td {\n    border: 1px solid #ddd; }\n  .table-bordered > thead > tr > th,\n  .table-bordered > thead > tr > td {\n    border-bottom-width: 2px; }\n\n.table-striped > tbody > tr:nth-of-type(odd) {\n  background-color: #f9f9f9; }\n\n.table-hover > tbody > tr:hover {\n  background-color: #f5f5f5; }\n\ntable col[class*=\"col-\"] {\n  position: static;\n  float: none;\n  display: table-column; }\n\ntable td[class*=\"col-\"],\ntable th[class*=\"col-\"] {\n  position: static;\n  float: none;\n  display: table-cell; }\n\n.table > thead > tr > td.active,\n.table > thead > tr > th.active,\n.table > thead > tr.active > td,\n.table > thead > tr.active > th,\n.table > tbody > tr > td.active,\n.table > tbody > tr > th.active,\n.table > tbody > tr.active > td,\n.table > tbody > tr.active > th,\n.table > tfoot > tr > td.active,\n.table > tfoot > tr > th.active,\n.table > tfoot > tr.active > td,\n.table > tfoot > tr.active > th {\n  background-color: #f5f5f5; }\n\n.table-hover > tbody > tr > td.active:hover,\n.table-hover > tbody > tr > th.active:hover,\n.table-hover > tbody > tr.active:hover > td,\n.table-hover > tbody > tr:hover > .active,\n.table-hover > tbody > tr.active:hover > th {\n  background-color: #e8e8e8; }\n\n.table > thead > tr > td.success,\n.table > thead > tr > th.success,\n.table > thead > tr.success > td,\n.table > thead > tr.success > th,\n.table > tbody > tr > td.success,\n.table > tbody > tr > th.success,\n.table > tbody > tr.success > td,\n.table > tbody > tr.success > th,\n.table > tfoot > tr > td.success,\n.table > tfoot > tr > th.success,\n.table > tfoot > tr.success > td,\n.table > tfoot > tr.success > th {\n  background-color: #dff0d8; }\n\n.table-hover > tbody > tr > td.success:hover,\n.table-hover > tbody > tr > th.success:hover,\n.table-hover > tbody > tr.success:hover > td,\n.table-hover > tbody > tr:hover > .success,\n.table-hover > tbody > tr.success:hover > th {\n  background-color: #d0e9c6; }\n\n.table > thead > tr > td.info,\n.table > thead > tr > th.info,\n.table > thead > tr.info > td,\n.table > thead > tr.info > th,\n.table > tbody > tr > td.info,\n.table > tbody > tr > th.info,\n.table > tbody > tr.info > td,\n.table > tbody > tr.info > th,\n.table > tfoot > tr > td.info,\n.table > tfoot > tr > th.info,\n.table > tfoot > tr.info > td,\n.table > tfoot > tr.info > th {\n  background-color: #d9edf7; }\n\n.table-hover > tbody > tr > td.info:hover,\n.table-hover > tbody > tr > th.info:hover,\n.table-hover > tbody > tr.info:hover > td,\n.table-hover > tbody > tr:hover > .info,\n.table-hover > tbody > tr.info:hover > th {\n  background-color: #c4e3f3; }\n\n.table > thead > tr > td.warning,\n.table > thead > tr > th.warning,\n.table > thead > tr.warning > td,\n.table > thead > tr.warning > th,\n.table > tbody > tr > td.warning,\n.table > tbody > tr > th.warning,\n.table > tbody > tr.warning > td,\n.table > tbody > tr.warning > th,\n.table > tfoot > tr > td.warning,\n.table > tfoot > tr > th.warning,\n.table > tfoot > tr.warning > td,\n.table > tfoot > tr.warning > th {\n  background-color: #fcf8e3; }\n\n.table-hover > tbody > tr > td.warning:hover,\n.table-hover > tbody > tr > th.warning:hover,\n.table-hover > tbody > tr.warning:hover > td,\n.table-hover > tbody > tr:hover > .warning,\n.table-hover > tbody > tr.warning:hover > th {\n  background-color: #faf2cc; }\n\n.table > thead > tr > td.danger,\n.table > thead > tr > th.danger,\n.table > thead > tr.danger > td,\n.table > thead > tr.danger > th,\n.table > tbody > tr > td.danger,\n.table > tbody > tr > th.danger,\n.table > tbody > tr.danger > td,\n.table > tbody > tr.danger > th,\n.table > tfoot > tr > td.danger,\n.table > tfoot > tr > th.danger,\n.table > tfoot > tr.danger > td,\n.table > tfoot > tr.danger > th {\n  background-color: #f2dede; }\n\n.table-hover > tbody > tr > td.danger:hover,\n.table-hover > tbody > tr > th.danger:hover,\n.table-hover > tbody > tr.danger:hover > td,\n.table-hover > tbody > tr:hover > .danger,\n.table-hover > tbody > tr.danger:hover > th {\n  background-color: #ebcccc; }\n\n.table-responsive {\n  overflow-x: auto;\n  min-height: 0.01%; }\n  @media screen and (max-width: 767px) {\n    .table-responsive {\n      width: 100%;\n      margin-bottom: 15px;\n      overflow-y: hidden;\n      -ms-overflow-style: -ms-autohiding-scrollbar;\n      border: 1px solid #ddd; }\n      .table-responsive > .table {\n        margin-bottom: 0; }\n        .table-responsive > .table > thead > tr > th,\n        .table-responsive > .table > thead > tr > td,\n        .table-responsive > .table > tbody > tr > th,\n        .table-responsive > .table > tbody > tr > td,\n        .table-responsive > .table > tfoot > tr > th,\n        .table-responsive > .table > tfoot > tr > td {\n          white-space: nowrap; }\n      .table-responsive > .table-bordered {\n        border: 0; }\n        .table-responsive > .table-bordered > thead > tr > th:first-child,\n        .table-responsive > .table-bordered > thead > tr > td:first-child,\n        .table-responsive > .table-bordered > tbody > tr > th:first-child,\n        .table-responsive > .table-bordered > tbody > tr > td:first-child,\n        .table-responsive > .table-bordered > tfoot > tr > th:first-child,\n        .table-responsive > .table-bordered > tfoot > tr > td:first-child {\n          border-left: 0; }\n        .table-responsive > .table-bordered > thead > tr > th:last-child,\n        .table-responsive > .table-bordered > thead > tr > td:last-child,\n        .table-responsive > .table-bordered > tbody > tr > th:last-child,\n        .table-responsive > .table-bordered > tbody > tr > td:last-child,\n        .table-responsive > .table-bordered > tfoot > tr > th:last-child,\n        .table-responsive > .table-bordered > tfoot > tr > td:last-child {\n          border-right: 0; }\n        .table-responsive > .table-bordered > tbody > tr:last-child > th,\n        .table-responsive > .table-bordered > tbody > tr:last-child > td,\n        .table-responsive > .table-bordered > tfoot > tr:last-child > th,\n        .table-responsive > .table-bordered > tfoot > tr:last-child > td {\n          border-bottom: 0; } }\n\nfieldset {\n  padding: 0;\n  margin: 0;\n  border: 0;\n  min-width: 0; }\n\nlegend {\n  display: block;\n  width: 100%;\n  padding: 0;\n  margin-bottom: 20px;\n  font-size: 21px;\n  line-height: inherit;\n  color: #333333;\n  border: 0;\n  border-bottom: 1px solid #e5e5e5; }\n\nlabel {\n  display: inline-block;\n  max-width: 100%;\n  margin-bottom: 5px;\n  font-weight: bold; }\n\ninput[type=\"search\"] {\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box; }\n\ninput[type=\"radio\"],\ninput[type=\"checkbox\"] {\n  margin: 4px 0 0;\n  margin-top: 1px \\9;\n  line-height: normal; }\n\ninput[type=\"file\"] {\n  display: block; }\n\ninput[type=\"range\"] {\n  display: block;\n  width: 100%; }\n\nselect[multiple],\nselect[size] {\n  height: auto; }\n\ninput[type=\"file\"]:focus,\ninput[type=\"radio\"]:focus,\ninput[type=\"checkbox\"]:focus {\n  outline: 5px auto -webkit-focus-ring-color;\n  outline-offset: -2px; }\n\noutput {\n  display: block;\n  padding-top: 7px;\n  font-size: 14px;\n  line-height: 1.42857;\n  color: #555555; }\n\n.form-control {\n  display: block;\n  width: 100%;\n  height: 34px;\n  padding: 6px 12px;\n  font-size: 14px;\n  line-height: 1.42857;\n  color: #555555;\n  background-color: #fff;\n  background-image: none;\n  border: 1px solid #ccc;\n  border-radius: 4px;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n  -webkit-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;\n  -o-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;\n  transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s; }\n  .form-control:focus {\n    border-color: #66afe9;\n    outline: 0;\n    -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6);\n    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6); }\n  .form-control::-moz-placeholder {\n    color: #999;\n    opacity: 1; }\n  .form-control:-ms-input-placeholder {\n    color: #999; }\n  .form-control::-webkit-input-placeholder {\n    color: #999; }\n  .form-control::-ms-expand {\n    border: 0;\n    background-color: transparent; }\n  .form-control[disabled], .form-control[readonly],\n  fieldset[disabled] .form-control {\n    background-color: #eeeeee;\n    opacity: 1; }\n  .form-control[disabled],\n  fieldset[disabled] .form-control {\n    cursor: not-allowed; }\n\ntextarea.form-control {\n  height: auto; }\n\ninput[type=\"search\"] {\n  -webkit-appearance: none; }\n\n@media screen and (-webkit-min-device-pixel-ratio: 0) {\n  input[type=\"date\"].form-control,\n  input[type=\"time\"].form-control,\n  input[type=\"datetime-local\"].form-control,\n  input[type=\"month\"].form-control {\n    line-height: 34px; }\n  input[type=\"date\"].input-sm, .input-group-sm > input[type=\"date\"].form-control,\n  .input-group-sm > input[type=\"date\"].input-group-addon,\n  .input-group-sm > .input-group-btn > input[type=\"date\"].btn,\n  .input-group-sm input[type=\"date\"],\n  input[type=\"time\"].input-sm,\n  .input-group-sm > input[type=\"time\"].form-control,\n  .input-group-sm > input[type=\"time\"].input-group-addon,\n  .input-group-sm > .input-group-btn > input[type=\"time\"].btn,\n  .input-group-sm\n  input[type=\"time\"],\n  input[type=\"datetime-local\"].input-sm,\n  .input-group-sm > input[type=\"datetime-local\"].form-control,\n  .input-group-sm > input[type=\"datetime-local\"].input-group-addon,\n  .input-group-sm > .input-group-btn > input[type=\"datetime-local\"].btn,\n  .input-group-sm\n  input[type=\"datetime-local\"],\n  input[type=\"month\"].input-sm,\n  .input-group-sm > input[type=\"month\"].form-control,\n  .input-group-sm > input[type=\"month\"].input-group-addon,\n  .input-group-sm > .input-group-btn > input[type=\"month\"].btn,\n  .input-group-sm\n  input[type=\"month\"] {\n    line-height: 30px; }\n  input[type=\"date\"].input-lg, .input-group-lg > input[type=\"date\"].form-control,\n  .input-group-lg > input[type=\"date\"].input-group-addon,\n  .input-group-lg > .input-group-btn > input[type=\"date\"].btn,\n  .input-group-lg input[type=\"date\"],\n  input[type=\"time\"].input-lg,\n  .input-group-lg > input[type=\"time\"].form-control,\n  .input-group-lg > input[type=\"time\"].input-group-addon,\n  .input-group-lg > .input-group-btn > input[type=\"time\"].btn,\n  .input-group-lg\n  input[type=\"time\"],\n  input[type=\"datetime-local\"].input-lg,\n  .input-group-lg > input[type=\"datetime-local\"].form-control,\n  .input-group-lg > input[type=\"datetime-local\"].input-group-addon,\n  .input-group-lg > .input-group-btn > input[type=\"datetime-local\"].btn,\n  .input-group-lg\n  input[type=\"datetime-local\"],\n  input[type=\"month\"].input-lg,\n  .input-group-lg > input[type=\"month\"].form-control,\n  .input-group-lg > input[type=\"month\"].input-group-addon,\n  .input-group-lg > .input-group-btn > input[type=\"month\"].btn,\n  .input-group-lg\n  input[type=\"month\"] {\n    line-height: 46px; } }\n\n.form-group {\n  margin-bottom: 15px; }\n\n.radio,\n.checkbox {\n  position: relative;\n  display: block;\n  margin-top: 10px;\n  margin-bottom: 10px; }\n  .radio label,\n  .checkbox label {\n    min-height: 20px;\n    padding-left: 20px;\n    margin-bottom: 0;\n    font-weight: normal;\n    cursor: pointer; }\n\n.radio input[type=\"radio\"],\n.radio-inline input[type=\"radio\"],\n.checkbox input[type=\"checkbox\"],\n.checkbox-inline input[type=\"checkbox\"] {\n  position: absolute;\n  margin-left: -20px;\n  margin-top: 4px \\9; }\n\n.radio + .radio,\n.checkbox + .checkbox {\n  margin-top: -5px; }\n\n.radio-inline,\n.checkbox-inline {\n  position: relative;\n  display: inline-block;\n  padding-left: 20px;\n  margin-bottom: 0;\n  vertical-align: middle;\n  font-weight: normal;\n  cursor: pointer; }\n\n.radio-inline + .radio-inline,\n.checkbox-inline + .checkbox-inline {\n  margin-top: 0;\n  margin-left: 10px; }\n\ninput[type=\"radio\"][disabled], input[type=\"radio\"].disabled,\nfieldset[disabled] input[type=\"radio\"],\ninput[type=\"checkbox\"][disabled],\ninput[type=\"checkbox\"].disabled,\nfieldset[disabled]\ninput[type=\"checkbox\"] {\n  cursor: not-allowed; }\n\n.radio-inline.disabled,\nfieldset[disabled] .radio-inline,\n.checkbox-inline.disabled,\nfieldset[disabled]\n.checkbox-inline {\n  cursor: not-allowed; }\n\n.radio.disabled label,\nfieldset[disabled] .radio label,\n.checkbox.disabled label,\nfieldset[disabled]\n.checkbox label {\n  cursor: not-allowed; }\n\n.form-control-static {\n  padding-top: 7px;\n  padding-bottom: 7px;\n  margin-bottom: 0;\n  min-height: 34px; }\n  .form-control-static.input-lg, .input-group-lg > .form-control-static.form-control,\n  .input-group-lg > .form-control-static.input-group-addon,\n  .input-group-lg > .input-group-btn > .form-control-static.btn, .form-control-static.input-sm, .input-group-sm > .form-control-static.form-control,\n  .input-group-sm > .form-control-static.input-group-addon,\n  .input-group-sm > .input-group-btn > .form-control-static.btn {\n    padding-left: 0;\n    padding-right: 0; }\n\n.input-sm, .input-group-sm > .form-control,\n.input-group-sm > .input-group-addon,\n.input-group-sm > .input-group-btn > .btn {\n  height: 30px;\n  padding: 5px 10px;\n  font-size: 12px;\n  line-height: 1.5;\n  border-radius: 3px; }\n\nselect.input-sm, .input-group-sm > select.form-control,\n.input-group-sm > select.input-group-addon,\n.input-group-sm > .input-group-btn > select.btn {\n  height: 30px;\n  line-height: 30px; }\n\ntextarea.input-sm, .input-group-sm > textarea.form-control,\n.input-group-sm > textarea.input-group-addon,\n.input-group-sm > .input-group-btn > textarea.btn,\nselect[multiple].input-sm,\n.input-group-sm > select[multiple].form-control,\n.input-group-sm > select[multiple].input-group-addon,\n.input-group-sm > .input-group-btn > select[multiple].btn {\n  height: auto; }\n\n.form-group-sm .form-control {\n  height: 30px;\n  padding: 5px 10px;\n  font-size: 12px;\n  line-height: 1.5;\n  border-radius: 3px; }\n\n.form-group-sm select.form-control {\n  height: 30px;\n  line-height: 30px; }\n\n.form-group-sm textarea.form-control,\n.form-group-sm select[multiple].form-control {\n  height: auto; }\n\n.form-group-sm .form-control-static {\n  height: 30px;\n  min-height: 32px;\n  padding: 6px 10px;\n  font-size: 12px;\n  line-height: 1.5; }\n\n.input-lg, .input-group-lg > .form-control,\n.input-group-lg > .input-group-addon,\n.input-group-lg > .input-group-btn > .btn {\n  height: 46px;\n  padding: 10px 16px;\n  font-size: 18px;\n  line-height: 1.33333;\n  border-radius: 6px; }\n\nselect.input-lg, .input-group-lg > select.form-control,\n.input-group-lg > select.input-group-addon,\n.input-group-lg > .input-group-btn > select.btn {\n  height: 46px;\n  line-height: 46px; }\n\ntextarea.input-lg, .input-group-lg > textarea.form-control,\n.input-group-lg > textarea.input-group-addon,\n.input-group-lg > .input-group-btn > textarea.btn,\nselect[multiple].input-lg,\n.input-group-lg > select[multiple].form-control,\n.input-group-lg > select[multiple].input-group-addon,\n.input-group-lg > .input-group-btn > select[multiple].btn {\n  height: auto; }\n\n.form-group-lg .form-control {\n  height: 46px;\n  padding: 10px 16px;\n  font-size: 18px;\n  line-height: 1.33333;\n  border-radius: 6px; }\n\n.form-group-lg select.form-control {\n  height: 46px;\n  line-height: 46px; }\n\n.form-group-lg textarea.form-control,\n.form-group-lg select[multiple].form-control {\n  height: auto; }\n\n.form-group-lg .form-control-static {\n  height: 46px;\n  min-height: 38px;\n  padding: 11px 16px;\n  font-size: 18px;\n  line-height: 1.33333; }\n\n.has-feedback {\n  position: relative; }\n  .has-feedback .form-control {\n    padding-right: 42.5px; }\n\n.form-control-feedback {\n  position: absolute;\n  top: 0;\n  right: 0;\n  z-index: 2;\n  display: block;\n  width: 34px;\n  height: 34px;\n  line-height: 34px;\n  text-align: center;\n  pointer-events: none; }\n\n.input-lg + .form-control-feedback, .input-group-lg > .form-control + .form-control-feedback,\n.input-group-lg > .input-group-addon + .form-control-feedback,\n.input-group-lg > .input-group-btn > .btn + .form-control-feedback,\n.input-group-lg + .form-control-feedback,\n.form-group-lg .form-control + .form-control-feedback {\n  width: 46px;\n  height: 46px;\n  line-height: 46px; }\n\n.input-sm + .form-control-feedback, .input-group-sm > .form-control + .form-control-feedback,\n.input-group-sm > .input-group-addon + .form-control-feedback,\n.input-group-sm > .input-group-btn > .btn + .form-control-feedback,\n.input-group-sm + .form-control-feedback,\n.form-group-sm .form-control + .form-control-feedback {\n  width: 30px;\n  height: 30px;\n  line-height: 30px; }\n\n.has-success .help-block,\n.has-success .control-label,\n.has-success .radio,\n.has-success .checkbox,\n.has-success .radio-inline,\n.has-success .checkbox-inline,\n.has-success.radio label,\n.has-success.checkbox label,\n.has-success.radio-inline label,\n.has-success.checkbox-inline label {\n  color: #3c763d; }\n\n.has-success .form-control {\n  border-color: #3c763d;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075); }\n  .has-success .form-control:focus {\n    border-color: #2b542c;\n    -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #67b168;\n    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #67b168; }\n\n.has-success .input-group-addon {\n  color: #3c763d;\n  border-color: #3c763d;\n  background-color: #dff0d8; }\n\n.has-success .form-control-feedback {\n  color: #3c763d; }\n\n.has-warning .help-block,\n.has-warning .control-label,\n.has-warning .radio,\n.has-warning .checkbox,\n.has-warning .radio-inline,\n.has-warning .checkbox-inline,\n.has-warning.radio label,\n.has-warning.checkbox label,\n.has-warning.radio-inline label,\n.has-warning.checkbox-inline label {\n  color: #8a6d3b; }\n\n.has-warning .form-control {\n  border-color: #8a6d3b;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075); }\n  .has-warning .form-control:focus {\n    border-color: #66512c;\n    -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #c0a16b;\n    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #c0a16b; }\n\n.has-warning .input-group-addon {\n  color: #8a6d3b;\n  border-color: #8a6d3b;\n  background-color: #fcf8e3; }\n\n.has-warning .form-control-feedback {\n  color: #8a6d3b; }\n\n.has-error .help-block,\n.has-error .control-label,\n.has-error .radio,\n.has-error .checkbox,\n.has-error .radio-inline,\n.has-error .checkbox-inline,\n.has-error.radio label,\n.has-error.checkbox label,\n.has-error.radio-inline label,\n.has-error.checkbox-inline label {\n  color: #a94442; }\n\n.has-error .form-control {\n  border-color: #a94442;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075); }\n  .has-error .form-control:focus {\n    border-color: #843534;\n    -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #ce8483;\n    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #ce8483; }\n\n.has-error .input-group-addon {\n  color: #a94442;\n  border-color: #a94442;\n  background-color: #f2dede; }\n\n.has-error .form-control-feedback {\n  color: #a94442; }\n\n.has-feedback label ~ .form-control-feedback {\n  top: 25px; }\n\n.has-feedback label.sr-only ~ .form-control-feedback {\n  top: 0; }\n\n.help-block {\n  display: block;\n  margin-top: 5px;\n  margin-bottom: 10px;\n  color: #737373; }\n\n@media (min-width: 768px) {\n  .form-inline .form-group {\n    display: inline-block;\n    margin-bottom: 0;\n    vertical-align: middle; }\n  .form-inline .form-control {\n    display: inline-block;\n    width: auto;\n    vertical-align: middle; }\n  .form-inline .form-control-static {\n    display: inline-block; }\n  .form-inline .input-group {\n    display: inline-table;\n    vertical-align: middle; }\n    .form-inline .input-group .input-group-addon,\n    .form-inline .input-group .input-group-btn,\n    .form-inline .input-group .form-control {\n      width: auto; }\n  .form-inline .input-group > .form-control {\n    width: 100%; }\n  .form-inline .control-label {\n    margin-bottom: 0;\n    vertical-align: middle; }\n  .form-inline .radio,\n  .form-inline .checkbox {\n    display: inline-block;\n    margin-top: 0;\n    margin-bottom: 0;\n    vertical-align: middle; }\n    .form-inline .radio label,\n    .form-inline .checkbox label {\n      padding-left: 0; }\n  .form-inline .radio input[type=\"radio\"],\n  .form-inline .checkbox input[type=\"checkbox\"] {\n    position: relative;\n    margin-left: 0; }\n  .form-inline .has-feedback .form-control-feedback {\n    top: 0; } }\n\n.form-horizontal .radio,\n.form-horizontal .checkbox,\n.form-horizontal .radio-inline,\n.form-horizontal .checkbox-inline {\n  margin-top: 0;\n  margin-bottom: 0;\n  padding-top: 7px; }\n\n.form-horizontal .radio,\n.form-horizontal .checkbox {\n  min-height: 27px; }\n\n.form-horizontal .form-group {\n  margin-left: -15px;\n  margin-right: -15px; }\n  .form-horizontal .form-group:before, .form-horizontal .form-group:after {\n    content: \" \";\n    display: table; }\n  .form-horizontal .form-group:after {\n    clear: both; }\n\n@media (min-width: 768px) {\n  .form-horizontal .control-label {\n    text-align: right;\n    margin-bottom: 0;\n    padding-top: 7px; } }\n\n.form-horizontal .has-feedback .form-control-feedback {\n  right: 15px; }\n\n@media (min-width: 768px) {\n  .form-horizontal .form-group-lg .control-label {\n    padding-top: 11px;\n    font-size: 18px; } }\n\n@media (min-width: 768px) {\n  .form-horizontal .form-group-sm .control-label {\n    padding-top: 6px;\n    font-size: 12px; } }\n\n.btn {\n  display: inline-block;\n  margin-bottom: 0;\n  font-weight: normal;\n  text-align: center;\n  vertical-align: middle;\n  touch-action: manipulation;\n  cursor: pointer;\n  background-image: none;\n  border: 1px solid transparent;\n  white-space: nowrap;\n  padding: 6px 12px;\n  font-size: 14px;\n  line-height: 1.42857;\n  border-radius: 4px;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none; }\n  .btn:focus, .btn.focus, .btn:active:focus, .btn:active.focus, .btn.active:focus, .btn.active.focus {\n    outline: 5px auto -webkit-focus-ring-color;\n    outline-offset: -2px; }\n  .btn:hover, .btn:focus, .btn.focus {\n    color: #333;\n    text-decoration: none; }\n  .btn:active, .btn.active {\n    outline: 0;\n    background-image: none;\n    -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);\n    box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125); }\n  .btn.disabled, .btn[disabled],\n  fieldset[disabled] .btn {\n    cursor: not-allowed;\n    opacity: 0.65;\n    filter: alpha(opacity=65);\n    -webkit-box-shadow: none;\n    box-shadow: none; }\n\na.btn.disabled,\nfieldset[disabled] a.btn {\n  pointer-events: none; }\n\n.btn-default {\n  color: #333;\n  background-color: #fff;\n  border-color: #ccc; }\n  .btn-default:focus, .btn-default.focus {\n    color: #333;\n    background-color: #e6e6e6;\n    border-color: #8c8c8c; }\n  .btn-default:hover {\n    color: #333;\n    background-color: #e6e6e6;\n    border-color: #adadad; }\n  .btn-default:active, .btn-default.active,\n  .open > .btn-default.dropdown-toggle {\n    color: #333;\n    background-color: #e6e6e6;\n    border-color: #adadad; }\n    .btn-default:active:hover, .btn-default:active:focus, .btn-default:active.focus, .btn-default.active:hover, .btn-default.active:focus, .btn-default.active.focus,\n    .open > .btn-default.dropdown-toggle:hover,\n    .open > .btn-default.dropdown-toggle:focus,\n    .open > .btn-default.dropdown-toggle.focus {\n      color: #333;\n      background-color: #d4d4d4;\n      border-color: #8c8c8c; }\n  .btn-default:active, .btn-default.active,\n  .open > .btn-default.dropdown-toggle {\n    background-image: none; }\n  .btn-default.disabled:hover, .btn-default.disabled:focus, .btn-default.disabled.focus, .btn-default[disabled]:hover, .btn-default[disabled]:focus, .btn-default[disabled].focus,\n  fieldset[disabled] .btn-default:hover,\n  fieldset[disabled] .btn-default:focus,\n  fieldset[disabled] .btn-default.focus {\n    background-color: #fff;\n    border-color: #ccc; }\n  .btn-default .badge {\n    color: #fff;\n    background-color: #333; }\n\n.btn-primary {\n  color: #fff;\n  background-color: #337ab7;\n  border-color: #2e6da4; }\n  .btn-primary:focus, .btn-primary.focus {\n    color: #fff;\n    background-color: #286090;\n    border-color: #122b40; }\n  .btn-primary:hover {\n    color: #fff;\n    background-color: #286090;\n    border-color: #204d74; }\n  .btn-primary:active, .btn-primary.active,\n  .open > .btn-primary.dropdown-toggle {\n    color: #fff;\n    background-color: #286090;\n    border-color: #204d74; }\n    .btn-primary:active:hover, .btn-primary:active:focus, .btn-primary:active.focus, .btn-primary.active:hover, .btn-primary.active:focus, .btn-primary.active.focus,\n    .open > .btn-primary.dropdown-toggle:hover,\n    .open > .btn-primary.dropdown-toggle:focus,\n    .open > .btn-primary.dropdown-toggle.focus {\n      color: #fff;\n      background-color: #204d74;\n      border-color: #122b40; }\n  .btn-primary:active, .btn-primary.active,\n  .open > .btn-primary.dropdown-toggle {\n    background-image: none; }\n  .btn-primary.disabled:hover, .btn-primary.disabled:focus, .btn-primary.disabled.focus, .btn-primary[disabled]:hover, .btn-primary[disabled]:focus, .btn-primary[disabled].focus,\n  fieldset[disabled] .btn-primary:hover,\n  fieldset[disabled] .btn-primary:focus,\n  fieldset[disabled] .btn-primary.focus {\n    background-color: #337ab7;\n    border-color: #2e6da4; }\n  .btn-primary .badge {\n    color: #337ab7;\n    background-color: #fff; }\n\n.btn-success {\n  color: #fff;\n  background-color: #5cb85c;\n  border-color: #4cae4c; }\n  .btn-success:focus, .btn-success.focus {\n    color: #fff;\n    background-color: #449d44;\n    border-color: #255625; }\n  .btn-success:hover {\n    color: #fff;\n    background-color: #449d44;\n    border-color: #398439; }\n  .btn-success:active, .btn-success.active,\n  .open > .btn-success.dropdown-toggle {\n    color: #fff;\n    background-color: #449d44;\n    border-color: #398439; }\n    .btn-success:active:hover, .btn-success:active:focus, .btn-success:active.focus, .btn-success.active:hover, .btn-success.active:focus, .btn-success.active.focus,\n    .open > .btn-success.dropdown-toggle:hover,\n    .open > .btn-success.dropdown-toggle:focus,\n    .open > .btn-success.dropdown-toggle.focus {\n      color: #fff;\n      background-color: #398439;\n      border-color: #255625; }\n  .btn-success:active, .btn-success.active,\n  .open > .btn-success.dropdown-toggle {\n    background-image: none; }\n  .btn-success.disabled:hover, .btn-success.disabled:focus, .btn-success.disabled.focus, .btn-success[disabled]:hover, .btn-success[disabled]:focus, .btn-success[disabled].focus,\n  fieldset[disabled] .btn-success:hover,\n  fieldset[disabled] .btn-success:focus,\n  fieldset[disabled] .btn-success.focus {\n    background-color: #5cb85c;\n    border-color: #4cae4c; }\n  .btn-success .badge {\n    color: #5cb85c;\n    background-color: #fff; }\n\n.btn-info {\n  color: #fff;\n  background-color: #5bc0de;\n  border-color: #46b8da; }\n  .btn-info:focus, .btn-info.focus {\n    color: #fff;\n    background-color: #31b0d5;\n    border-color: #1b6d85; }\n  .btn-info:hover {\n    color: #fff;\n    background-color: #31b0d5;\n    border-color: #269abc; }\n  .btn-info:active, .btn-info.active,\n  .open > .btn-info.dropdown-toggle {\n    color: #fff;\n    background-color: #31b0d5;\n    border-color: #269abc; }\n    .btn-info:active:hover, .btn-info:active:focus, .btn-info:active.focus, .btn-info.active:hover, .btn-info.active:focus, .btn-info.active.focus,\n    .open > .btn-info.dropdown-toggle:hover,\n    .open > .btn-info.dropdown-toggle:focus,\n    .open > .btn-info.dropdown-toggle.focus {\n      color: #fff;\n      background-color: #269abc;\n      border-color: #1b6d85; }\n  .btn-info:active, .btn-info.active,\n  .open > .btn-info.dropdown-toggle {\n    background-image: none; }\n  .btn-info.disabled:hover, .btn-info.disabled:focus, .btn-info.disabled.focus, .btn-info[disabled]:hover, .btn-info[disabled]:focus, .btn-info[disabled].focus,\n  fieldset[disabled] .btn-info:hover,\n  fieldset[disabled] .btn-info:focus,\n  fieldset[disabled] .btn-info.focus {\n    background-color: #5bc0de;\n    border-color: #46b8da; }\n  .btn-info .badge {\n    color: #5bc0de;\n    background-color: #fff; }\n\n.btn-warning {\n  color: #fff;\n  background-color: #f0ad4e;\n  border-color: #eea236; }\n  .btn-warning:focus, .btn-warning.focus {\n    color: #fff;\n    background-color: #ec971f;\n    border-color: #985f0d; }\n  .btn-warning:hover {\n    color: #fff;\n    background-color: #ec971f;\n    border-color: #d58512; }\n  .btn-warning:active, .btn-warning.active,\n  .open > .btn-warning.dropdown-toggle {\n    color: #fff;\n    background-color: #ec971f;\n    border-color: #d58512; }\n    .btn-warning:active:hover, .btn-warning:active:focus, .btn-warning:active.focus, .btn-warning.active:hover, .btn-warning.active:focus, .btn-warning.active.focus,\n    .open > .btn-warning.dropdown-toggle:hover,\n    .open > .btn-warning.dropdown-toggle:focus,\n    .open > .btn-warning.dropdown-toggle.focus {\n      color: #fff;\n      background-color: #d58512;\n      border-color: #985f0d; }\n  .btn-warning:active, .btn-warning.active,\n  .open > .btn-warning.dropdown-toggle {\n    background-image: none; }\n  .btn-warning.disabled:hover, .btn-warning.disabled:focus, .btn-warning.disabled.focus, .btn-warning[disabled]:hover, .btn-warning[disabled]:focus, .btn-warning[disabled].focus,\n  fieldset[disabled] .btn-warning:hover,\n  fieldset[disabled] .btn-warning:focus,\n  fieldset[disabled] .btn-warning.focus {\n    background-color: #f0ad4e;\n    border-color: #eea236; }\n  .btn-warning .badge {\n    color: #f0ad4e;\n    background-color: #fff; }\n\n.btn-danger {\n  color: #fff;\n  background-color: #d9534f;\n  border-color: #d43f3a; }\n  .btn-danger:focus, .btn-danger.focus {\n    color: #fff;\n    background-color: #c9302c;\n    border-color: #761c19; }\n  .btn-danger:hover {\n    color: #fff;\n    background-color: #c9302c;\n    border-color: #ac2925; }\n  .btn-danger:active, .btn-danger.active,\n  .open > .btn-danger.dropdown-toggle {\n    color: #fff;\n    background-color: #c9302c;\n    border-color: #ac2925; }\n    .btn-danger:active:hover, .btn-danger:active:focus, .btn-danger:active.focus, .btn-danger.active:hover, .btn-danger.active:focus, .btn-danger.active.focus,\n    .open > .btn-danger.dropdown-toggle:hover,\n    .open > .btn-danger.dropdown-toggle:focus,\n    .open > .btn-danger.dropdown-toggle.focus {\n      color: #fff;\n      background-color: #ac2925;\n      border-color: #761c19; }\n  .btn-danger:active, .btn-danger.active,\n  .open > .btn-danger.dropdown-toggle {\n    background-image: none; }\n  .btn-danger.disabled:hover, .btn-danger.disabled:focus, .btn-danger.disabled.focus, .btn-danger[disabled]:hover, .btn-danger[disabled]:focus, .btn-danger[disabled].focus,\n  fieldset[disabled] .btn-danger:hover,\n  fieldset[disabled] .btn-danger:focus,\n  fieldset[disabled] .btn-danger.focus {\n    background-color: #d9534f;\n    border-color: #d43f3a; }\n  .btn-danger .badge {\n    color: #d9534f;\n    background-color: #fff; }\n\n.btn-link {\n  color: #337ab7;\n  font-weight: normal;\n  border-radius: 0; }\n  .btn-link, .btn-link:active, .btn-link.active, .btn-link[disabled],\n  fieldset[disabled] .btn-link {\n    background-color: transparent;\n    -webkit-box-shadow: none;\n    box-shadow: none; }\n  .btn-link, .btn-link:hover, .btn-link:focus, .btn-link:active {\n    border-color: transparent; }\n  .btn-link:hover, .btn-link:focus {\n    color: #23527c;\n    text-decoration: underline;\n    background-color: transparent; }\n  .btn-link[disabled]:hover, .btn-link[disabled]:focus,\n  fieldset[disabled] .btn-link:hover,\n  fieldset[disabled] .btn-link:focus {\n    color: #777777;\n    text-decoration: none; }\n\n.btn-lg, .btn-group-lg > .btn {\n  padding: 10px 16px;\n  font-size: 18px;\n  line-height: 1.33333;\n  border-radius: 6px; }\n\n.btn-sm, .btn-group-sm > .btn {\n  padding: 5px 10px;\n  font-size: 12px;\n  line-height: 1.5;\n  border-radius: 3px; }\n\n.btn-xs, .btn-group-xs > .btn {\n  padding: 1px 5px;\n  font-size: 12px;\n  line-height: 1.5;\n  border-radius: 3px; }\n\n.btn-block {\n  display: block;\n  width: 100%; }\n\n.btn-block + .btn-block {\n  margin-top: 5px; }\n\ninput[type=\"submit\"].btn-block,\ninput[type=\"reset\"].btn-block,\ninput[type=\"button\"].btn-block {\n  width: 100%; }\n\n.fade {\n  opacity: 0;\n  -webkit-transition: opacity 0.15s linear;\n  -o-transition: opacity 0.15s linear;\n  transition: opacity 0.15s linear; }\n  .fade.in {\n    opacity: 1; }\n\n.collapse {\n  display: none; }\n  .collapse.in {\n    display: block; }\n\ntr.collapse.in {\n  display: table-row; }\n\ntbody.collapse.in {\n  display: table-row-group; }\n\n.collapsing {\n  position: relative;\n  height: 0;\n  overflow: hidden;\n  -webkit-transition-property: height, visibility;\n  transition-property: height, visibility;\n  -webkit-transition-duration: 0.35s;\n  transition-duration: 0.35s;\n  -webkit-transition-timing-function: ease;\n  transition-timing-function: ease; }\n\n.caret {\n  display: inline-block;\n  width: 0;\n  height: 0;\n  margin-left: 2px;\n  vertical-align: middle;\n  border-top: 4px dashed;\n  border-top: 4px solid \\9;\n  border-right: 4px solid transparent;\n  border-left: 4px solid transparent; }\n\n.dropup,\n.dropdown {\n  position: relative; }\n\n.dropdown-toggle:focus {\n  outline: 0; }\n\n.dropdown-menu {\n  position: absolute;\n  top: 100%;\n  left: 0;\n  z-index: 1000;\n  display: none;\n  float: left;\n  min-width: 160px;\n  padding: 5px 0;\n  margin: 2px 0 0;\n  list-style: none;\n  font-size: 14px;\n  text-align: left;\n  background-color: #fff;\n  border: 1px solid #ccc;\n  border: 1px solid rgba(0, 0, 0, 0.15);\n  border-radius: 4px;\n  -webkit-box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);\n  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);\n  background-clip: padding-box; }\n  .dropdown-menu.pull-right {\n    right: 0;\n    left: auto; }\n  .dropdown-menu .divider {\n    height: 1px;\n    margin: 9px 0;\n    overflow: hidden;\n    background-color: #e5e5e5; }\n  .dropdown-menu > li > a {\n    display: block;\n    padding: 3px 20px;\n    clear: both;\n    font-weight: normal;\n    line-height: 1.42857;\n    color: #333333;\n    white-space: nowrap; }\n\n.dropdown-menu > li > a:hover, .dropdown-menu > li > a:focus {\n  text-decoration: none;\n  color: #262626;\n  background-color: #f5f5f5; }\n\n.dropdown-menu > .active > a, .dropdown-menu > .active > a:hover, .dropdown-menu > .active > a:focus {\n  color: #fff;\n  text-decoration: none;\n  outline: 0;\n  background-color: #337ab7; }\n\n.dropdown-menu > .disabled > a, .dropdown-menu > .disabled > a:hover, .dropdown-menu > .disabled > a:focus {\n  color: #777777; }\n\n.dropdown-menu > .disabled > a:hover, .dropdown-menu > .disabled > a:focus {\n  text-decoration: none;\n  background-color: transparent;\n  background-image: none;\n  filter: progid:DXImageTransform.Microsoft.gradient(enabled = false);\n  cursor: not-allowed; }\n\n.open > .dropdown-menu {\n  display: block; }\n\n.open > a {\n  outline: 0; }\n\n.dropdown-menu-right {\n  left: auto;\n  right: 0; }\n\n.dropdown-menu-left {\n  left: 0;\n  right: auto; }\n\n.dropdown-header {\n  display: block;\n  padding: 3px 20px;\n  font-size: 12px;\n  line-height: 1.42857;\n  color: #777777;\n  white-space: nowrap; }\n\n.dropdown-backdrop {\n  position: fixed;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  top: 0;\n  z-index: 990; }\n\n.pull-right > .dropdown-menu {\n  right: 0;\n  left: auto; }\n\n.dropup .caret,\n.navbar-fixed-bottom .dropdown .caret {\n  border-top: 0;\n  border-bottom: 4px dashed;\n  border-bottom: 4px solid \\9;\n  content: \"\"; }\n\n.dropup .dropdown-menu,\n.navbar-fixed-bottom .dropdown .dropdown-menu {\n  top: auto;\n  bottom: 100%;\n  margin-bottom: 2px; }\n\n@media (min-width: 768px) {\n  .navbar-right .dropdown-menu {\n    right: 0;\n    left: auto; }\n  .navbar-right .dropdown-menu-left {\n    left: 0;\n    right: auto; } }\n\n.btn-group,\n.btn-group-vertical {\n  position: relative;\n  display: inline-block;\n  vertical-align: middle; }\n  .btn-group > .btn,\n  .btn-group-vertical > .btn {\n    position: relative;\n    float: left; }\n    .btn-group > .btn:hover, .btn-group > .btn:focus, .btn-group > .btn:active, .btn-group > .btn.active,\n    .btn-group-vertical > .btn:hover,\n    .btn-group-vertical > .btn:focus,\n    .btn-group-vertical > .btn:active,\n    .btn-group-vertical > .btn.active {\n      z-index: 2; }\n\n.btn-group .btn + .btn,\n.btn-group .btn + .btn-group,\n.btn-group .btn-group + .btn,\n.btn-group .btn-group + .btn-group {\n  margin-left: -1px; }\n\n.btn-toolbar {\n  margin-left: -5px; }\n  .btn-toolbar:before, .btn-toolbar:after {\n    content: \" \";\n    display: table; }\n  .btn-toolbar:after {\n    clear: both; }\n  .btn-toolbar .btn,\n  .btn-toolbar .btn-group,\n  .btn-toolbar .input-group {\n    float: left; }\n  .btn-toolbar > .btn,\n  .btn-toolbar > .btn-group,\n  .btn-toolbar > .input-group {\n    margin-left: 5px; }\n\n.btn-group > .btn:not(:first-child):not(:last-child):not(.dropdown-toggle) {\n  border-radius: 0; }\n\n.btn-group > .btn:first-child {\n  margin-left: 0; }\n  .btn-group > .btn:first-child:not(:last-child):not(.dropdown-toggle) {\n    border-bottom-right-radius: 0;\n    border-top-right-radius: 0; }\n\n.btn-group > .btn:last-child:not(:first-child),\n.btn-group > .dropdown-toggle:not(:first-child) {\n  border-bottom-left-radius: 0;\n  border-top-left-radius: 0; }\n\n.btn-group > .btn-group {\n  float: left; }\n\n.btn-group > .btn-group:not(:first-child):not(:last-child) > .btn {\n  border-radius: 0; }\n\n.btn-group > .btn-group:first-child:not(:last-child) > .btn:last-child,\n.btn-group > .btn-group:first-child:not(:last-child) > .dropdown-toggle {\n  border-bottom-right-radius: 0;\n  border-top-right-radius: 0; }\n\n.btn-group > .btn-group:last-child:not(:first-child) > .btn:first-child {\n  border-bottom-left-radius: 0;\n  border-top-left-radius: 0; }\n\n.btn-group .dropdown-toggle:active,\n.btn-group.open .dropdown-toggle {\n  outline: 0; }\n\n.btn-group > .btn + .dropdown-toggle {\n  padding-left: 8px;\n  padding-right: 8px; }\n\n.btn-group > .btn-lg + .dropdown-toggle, .btn-group-lg.btn-group > .btn + .dropdown-toggle {\n  padding-left: 12px;\n  padding-right: 12px; }\n\n.btn-group.open .dropdown-toggle {\n  -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);\n  box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125); }\n  .btn-group.open .dropdown-toggle.btn-link {\n    -webkit-box-shadow: none;\n    box-shadow: none; }\n\n.btn .caret {\n  margin-left: 0; }\n\n.btn-lg .caret, .btn-group-lg > .btn .caret {\n  border-width: 5px 5px 0;\n  border-bottom-width: 0; }\n\n.dropup .btn-lg .caret, .dropup .btn-group-lg > .btn .caret {\n  border-width: 0 5px 5px; }\n\n.btn-group-vertical > .btn,\n.btn-group-vertical > .btn-group,\n.btn-group-vertical > .btn-group > .btn {\n  display: block;\n  float: none;\n  width: 100%;\n  max-width: 100%; }\n\n.btn-group-vertical > .btn-group:before, .btn-group-vertical > .btn-group:after {\n  content: \" \";\n  display: table; }\n\n.btn-group-vertical > .btn-group:after {\n  clear: both; }\n\n.btn-group-vertical > .btn-group > .btn {\n  float: none; }\n\n.btn-group-vertical > .btn + .btn,\n.btn-group-vertical > .btn + .btn-group,\n.btn-group-vertical > .btn-group + .btn,\n.btn-group-vertical > .btn-group + .btn-group {\n  margin-top: -1px;\n  margin-left: 0; }\n\n.btn-group-vertical > .btn:not(:first-child):not(:last-child) {\n  border-radius: 0; }\n\n.btn-group-vertical > .btn:first-child:not(:last-child) {\n  border-top-right-radius: 4px;\n  border-top-left-radius: 4px;\n  border-bottom-right-radius: 0;\n  border-bottom-left-radius: 0; }\n\n.btn-group-vertical > .btn:last-child:not(:first-child) {\n  border-top-right-radius: 0;\n  border-top-left-radius: 0;\n  border-bottom-right-radius: 4px;\n  border-bottom-left-radius: 4px; }\n\n.btn-group-vertical > .btn-group:not(:first-child):not(:last-child) > .btn {\n  border-radius: 0; }\n\n.btn-group-vertical > .btn-group:first-child:not(:last-child) > .btn:last-child,\n.btn-group-vertical > .btn-group:first-child:not(:last-child) > .dropdown-toggle {\n  border-bottom-right-radius: 0;\n  border-bottom-left-radius: 0; }\n\n.btn-group-vertical > .btn-group:last-child:not(:first-child) > .btn:first-child {\n  border-top-right-radius: 0;\n  border-top-left-radius: 0; }\n\n.btn-group-justified {\n  display: table;\n  width: 100%;\n  table-layout: fixed;\n  border-collapse: separate; }\n  .btn-group-justified > .btn,\n  .btn-group-justified > .btn-group {\n    float: none;\n    display: table-cell;\n    width: 1%; }\n  .btn-group-justified > .btn-group .btn {\n    width: 100%; }\n  .btn-group-justified > .btn-group .dropdown-menu {\n    left: auto; }\n\n[data-toggle=\"buttons\"] > .btn input[type=\"radio\"],\n[data-toggle=\"buttons\"] > .btn input[type=\"checkbox\"],\n[data-toggle=\"buttons\"] > .btn-group > .btn input[type=\"radio\"],\n[data-toggle=\"buttons\"] > .btn-group > .btn input[type=\"checkbox\"] {\n  position: absolute;\n  clip: rect(0, 0, 0, 0);\n  pointer-events: none; }\n\n.input-group {\n  position: relative;\n  display: table;\n  border-collapse: separate; }\n  .input-group[class*=\"col-\"] {\n    float: none;\n    padding-left: 0;\n    padding-right: 0; }\n  .input-group .form-control {\n    position: relative;\n    z-index: 2;\n    float: left;\n    width: 100%;\n    margin-bottom: 0; }\n    .input-group .form-control:focus {\n      z-index: 3; }\n\n.input-group-addon,\n.input-group-btn,\n.input-group .form-control {\n  display: table-cell; }\n  .input-group-addon:not(:first-child):not(:last-child),\n  .input-group-btn:not(:first-child):not(:last-child),\n  .input-group .form-control:not(:first-child):not(:last-child) {\n    border-radius: 0; }\n\n.input-group-addon,\n.input-group-btn {\n  width: 1%;\n  white-space: nowrap;\n  vertical-align: middle; }\n\n.input-group-addon {\n  padding: 6px 12px;\n  font-size: 14px;\n  font-weight: normal;\n  line-height: 1;\n  color: #555555;\n  text-align: center;\n  background-color: #eeeeee;\n  border: 1px solid #ccc;\n  border-radius: 4px; }\n  .input-group-addon.input-sm,\n  .input-group-sm > .input-group-addon,\n  .input-group-sm > .input-group-btn > .input-group-addon.btn {\n    padding: 5px 10px;\n    font-size: 12px;\n    border-radius: 3px; }\n  .input-group-addon.input-lg,\n  .input-group-lg > .input-group-addon,\n  .input-group-lg > .input-group-btn > .input-group-addon.btn {\n    padding: 10px 16px;\n    font-size: 18px;\n    border-radius: 6px; }\n  .input-group-addon input[type=\"radio\"],\n  .input-group-addon input[type=\"checkbox\"] {\n    margin-top: 0; }\n\n.input-group .form-control:first-child,\n.input-group-addon:first-child,\n.input-group-btn:first-child > .btn,\n.input-group-btn:first-child > .btn-group > .btn,\n.input-group-btn:first-child > .dropdown-toggle,\n.input-group-btn:last-child > .btn:not(:last-child):not(.dropdown-toggle),\n.input-group-btn:last-child > .btn-group:not(:last-child) > .btn {\n  border-bottom-right-radius: 0;\n  border-top-right-radius: 0; }\n\n.input-group-addon:first-child {\n  border-right: 0; }\n\n.input-group .form-control:last-child,\n.input-group-addon:last-child,\n.input-group-btn:last-child > .btn,\n.input-group-btn:last-child > .btn-group > .btn,\n.input-group-btn:last-child > .dropdown-toggle,\n.input-group-btn:first-child > .btn:not(:first-child),\n.input-group-btn:first-child > .btn-group:not(:first-child) > .btn {\n  border-bottom-left-radius: 0;\n  border-top-left-radius: 0; }\n\n.input-group-addon:last-child {\n  border-left: 0; }\n\n.input-group-btn {\n  position: relative;\n  font-size: 0;\n  white-space: nowrap; }\n  .input-group-btn > .btn {\n    position: relative; }\n    .input-group-btn > .btn + .btn {\n      margin-left: -1px; }\n    .input-group-btn > .btn:hover, .input-group-btn > .btn:focus, .input-group-btn > .btn:active {\n      z-index: 2; }\n  .input-group-btn:first-child > .btn,\n  .input-group-btn:first-child > .btn-group {\n    margin-right: -1px; }\n  .input-group-btn:last-child > .btn,\n  .input-group-btn:last-child > .btn-group {\n    z-index: 2;\n    margin-left: -1px; }\n\n.nav {\n  margin-bottom: 0;\n  padding-left: 0;\n  list-style: none; }\n  .nav:before, .nav:after {\n    content: \" \";\n    display: table; }\n  .nav:after {\n    clear: both; }\n  .nav > li {\n    position: relative;\n    display: block; }\n    .nav > li > a {\n      position: relative;\n      display: block;\n      padding: 10px 15px; }\n      .nav > li > a:hover, .nav > li > a:focus {\n        text-decoration: none;\n        background-color: #eeeeee; }\n    .nav > li.disabled > a {\n      color: #777777; }\n      .nav > li.disabled > a:hover, .nav > li.disabled > a:focus {\n        color: #777777;\n        text-decoration: none;\n        background-color: transparent;\n        cursor: not-allowed; }\n  .nav .open > a, .nav .open > a:hover, .nav .open > a:focus {\n    background-color: #eeeeee;\n    border-color: #337ab7; }\n  .nav .nav-divider {\n    height: 1px;\n    margin: 9px 0;\n    overflow: hidden;\n    background-color: #e5e5e5; }\n  .nav > li > a > img {\n    max-width: none; }\n\n.nav-tabs {\n  border-bottom: 1px solid #ddd; }\n  .nav-tabs > li {\n    float: left;\n    margin-bottom: -1px; }\n    .nav-tabs > li > a {\n      margin-right: 2px;\n      line-height: 1.42857;\n      border: 1px solid transparent;\n      border-radius: 4px 4px 0 0; }\n      .nav-tabs > li > a:hover {\n        border-color: #eeeeee #eeeeee #ddd; }\n    .nav-tabs > li.active > a, .nav-tabs > li.active > a:hover, .nav-tabs > li.active > a:focus {\n      color: #555555;\n      background-color: #fff;\n      border: 1px solid #ddd;\n      border-bottom-color: transparent;\n      cursor: default; }\n\n.nav-pills > li {\n  float: left; }\n  .nav-pills > li > a {\n    border-radius: 4px; }\n  .nav-pills > li + li {\n    margin-left: 2px; }\n  .nav-pills > li.active > a, .nav-pills > li.active > a:hover, .nav-pills > li.active > a:focus {\n    color: #fff;\n    background-color: #337ab7; }\n\n.nav-stacked > li {\n  float: none; }\n  .nav-stacked > li + li {\n    margin-top: 2px;\n    margin-left: 0; }\n\n.nav-justified, .nav-tabs.nav-justified {\n  width: 100%; }\n  .nav-justified > li, .nav-tabs.nav-justified > li {\n    float: none; }\n    .nav-justified > li > a, .nav-tabs.nav-justified > li > a {\n      text-align: center;\n      margin-bottom: 5px; }\n  .nav-justified > .dropdown .dropdown-menu {\n    top: auto;\n    left: auto; }\n  @media (min-width: 768px) {\n    .nav-justified > li, .nav-tabs.nav-justified > li {\n      display: table-cell;\n      width: 1%; }\n      .nav-justified > li > a, .nav-tabs.nav-justified > li > a {\n        margin-bottom: 0; } }\n\n.nav-tabs-justified, .nav-tabs.nav-justified {\n  border-bottom: 0; }\n  .nav-tabs-justified > li > a, .nav-tabs.nav-justified > li > a {\n    margin-right: 0;\n    border-radius: 4px; }\n  .nav-tabs-justified > .active > a, .nav-tabs.nav-justified > .active > a,\n  .nav-tabs-justified > .active > a:hover, .nav-tabs.nav-justified > .active > a:hover,\n  .nav-tabs-justified > .active > a:focus, .nav-tabs.nav-justified > .active > a:focus {\n    border: 1px solid #ddd; }\n  @media (min-width: 768px) {\n    .nav-tabs-justified > li > a, .nav-tabs.nav-justified > li > a {\n      border-bottom: 1px solid #ddd;\n      border-radius: 4px 4px 0 0; }\n    .nav-tabs-justified > .active > a, .nav-tabs.nav-justified > .active > a,\n    .nav-tabs-justified > .active > a:hover, .nav-tabs.nav-justified > .active > a:hover,\n    .nav-tabs-justified > .active > a:focus, .nav-tabs.nav-justified > .active > a:focus {\n      border-bottom-color: #fff; } }\n\n.tab-content > .tab-pane {\n  display: none; }\n\n.tab-content > .active {\n  display: block; }\n\n.nav-tabs .dropdown-menu {\n  margin-top: -1px;\n  border-top-right-radius: 0;\n  border-top-left-radius: 0; }\n\n.navbar {\n  position: relative;\n  min-height: 50px;\n  margin-bottom: 20px;\n  border: 1px solid transparent; }\n  .navbar:before, .navbar:after {\n    content: \" \";\n    display: table; }\n  .navbar:after {\n    clear: both; }\n  @media (min-width: 768px) {\n    .navbar {\n      border-radius: 4px; } }\n\n.navbar-header:before, .navbar-header:after {\n  content: \" \";\n  display: table; }\n\n.navbar-header:after {\n  clear: both; }\n\n@media (min-width: 768px) {\n  .navbar-header {\n    float: left; } }\n\n.navbar-collapse {\n  overflow-x: visible;\n  padding-right: 15px;\n  padding-left: 15px;\n  border-top: 1px solid transparent;\n  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);\n  -webkit-overflow-scrolling: touch; }\n  .navbar-collapse:before, .navbar-collapse:after {\n    content: \" \";\n    display: table; }\n  .navbar-collapse:after {\n    clear: both; }\n  .navbar-collapse.in {\n    overflow-y: auto; }\n  @media (min-width: 768px) {\n    .navbar-collapse {\n      width: auto;\n      border-top: 0;\n      box-shadow: none; }\n      .navbar-collapse.collapse {\n        display: block !important;\n        height: auto !important;\n        padding-bottom: 0;\n        overflow: visible !important; }\n      .navbar-collapse.in {\n        overflow-y: visible; }\n      .navbar-fixed-top .navbar-collapse,\n      .navbar-static-top .navbar-collapse,\n      .navbar-fixed-bottom .navbar-collapse {\n        padding-left: 0;\n        padding-right: 0; } }\n\n.navbar-fixed-top .navbar-collapse,\n.navbar-fixed-bottom .navbar-collapse {\n  max-height: 340px; }\n  @media (max-device-width: 480px) and (orientation: landscape) {\n    .navbar-fixed-top .navbar-collapse,\n    .navbar-fixed-bottom .navbar-collapse {\n      max-height: 200px; } }\n\n.container > .navbar-header,\n.container > .navbar-collapse,\n.container-fluid > .navbar-header,\n.container-fluid > .navbar-collapse {\n  margin-right: -15px;\n  margin-left: -15px; }\n  @media (min-width: 768px) {\n    .container > .navbar-header,\n    .container > .navbar-collapse,\n    .container-fluid > .navbar-header,\n    .container-fluid > .navbar-collapse {\n      margin-right: 0;\n      margin-left: 0; } }\n\n.navbar-static-top {\n  z-index: 1000;\n  border-width: 0 0 1px; }\n  @media (min-width: 768px) {\n    .navbar-static-top {\n      border-radius: 0; } }\n\n.navbar-fixed-top,\n.navbar-fixed-bottom {\n  position: fixed;\n  right: 0;\n  left: 0;\n  z-index: 1030; }\n  @media (min-width: 768px) {\n    .navbar-fixed-top,\n    .navbar-fixed-bottom {\n      border-radius: 0; } }\n\n.navbar-fixed-top {\n  top: 0;\n  border-width: 0 0 1px; }\n\n.navbar-fixed-bottom {\n  bottom: 0;\n  margin-bottom: 0;\n  border-width: 1px 0 0; }\n\n.navbar-brand {\n  float: left;\n  padding: 15px 15px;\n  font-size: 18px;\n  line-height: 20px;\n  height: 50px; }\n  .navbar-brand:hover, .navbar-brand:focus {\n    text-decoration: none; }\n  .navbar-brand > img {\n    display: block; }\n  @media (min-width: 768px) {\n    .navbar > .container .navbar-brand,\n    .navbar > .container-fluid .navbar-brand {\n      margin-left: -15px; } }\n\n.navbar-toggle {\n  position: relative;\n  float: right;\n  margin-right: 15px;\n  padding: 9px 10px;\n  margin-top: 8px;\n  margin-bottom: 8px;\n  background-color: transparent;\n  background-image: none;\n  border: 1px solid transparent;\n  border-radius: 4px; }\n  .navbar-toggle:focus {\n    outline: 0; }\n  .navbar-toggle .icon-bar {\n    display: block;\n    width: 22px;\n    height: 2px;\n    border-radius: 1px; }\n  .navbar-toggle .icon-bar + .icon-bar {\n    margin-top: 4px; }\n  @media (min-width: 768px) {\n    .navbar-toggle {\n      display: none; } }\n\n.navbar-nav {\n  margin: 7.5px -15px; }\n  .navbar-nav > li > a {\n    padding-top: 10px;\n    padding-bottom: 10px;\n    line-height: 20px; }\n  @media (max-width: 767px) {\n    .navbar-nav .open .dropdown-menu {\n      position: static;\n      float: none;\n      width: auto;\n      margin-top: 0;\n      background-color: transparent;\n      border: 0;\n      box-shadow: none; }\n      .navbar-nav .open .dropdown-menu > li > a,\n      .navbar-nav .open .dropdown-menu .dropdown-header {\n        padding: 5px 15px 5px 25px; }\n      .navbar-nav .open .dropdown-menu > li > a {\n        line-height: 20px; }\n        .navbar-nav .open .dropdown-menu > li > a:hover, .navbar-nav .open .dropdown-menu > li > a:focus {\n          background-image: none; } }\n  @media (min-width: 768px) {\n    .navbar-nav {\n      float: left;\n      margin: 0; }\n      .navbar-nav > li {\n        float: left; }\n        .navbar-nav > li > a {\n          padding-top: 15px;\n          padding-bottom: 15px; } }\n\n.navbar-form {\n  margin-left: -15px;\n  margin-right: -15px;\n  padding: 10px 15px;\n  border-top: 1px solid transparent;\n  border-bottom: 1px solid transparent;\n  -webkit-box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 1px 0 rgba(255, 255, 255, 0.1);\n  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 1px 0 rgba(255, 255, 255, 0.1);\n  margin-top: 8px;\n  margin-bottom: 8px; }\n  @media (min-width: 768px) {\n    .navbar-form .form-group {\n      display: inline-block;\n      margin-bottom: 0;\n      vertical-align: middle; }\n    .navbar-form .form-control {\n      display: inline-block;\n      width: auto;\n      vertical-align: middle; }\n    .navbar-form .form-control-static {\n      display: inline-block; }\n    .navbar-form .input-group {\n      display: inline-table;\n      vertical-align: middle; }\n      .navbar-form .input-group .input-group-addon,\n      .navbar-form .input-group .input-group-btn,\n      .navbar-form .input-group .form-control {\n        width: auto; }\n    .navbar-form .input-group > .form-control {\n      width: 100%; }\n    .navbar-form .control-label {\n      margin-bottom: 0;\n      vertical-align: middle; }\n    .navbar-form .radio,\n    .navbar-form .checkbox {\n      display: inline-block;\n      margin-top: 0;\n      margin-bottom: 0;\n      vertical-align: middle; }\n      .navbar-form .radio label,\n      .navbar-form .checkbox label {\n        padding-left: 0; }\n    .navbar-form .radio input[type=\"radio\"],\n    .navbar-form .checkbox input[type=\"checkbox\"] {\n      position: relative;\n      margin-left: 0; }\n    .navbar-form .has-feedback .form-control-feedback {\n      top: 0; } }\n  @media (max-width: 767px) {\n    .navbar-form .form-group {\n      margin-bottom: 5px; }\n      .navbar-form .form-group:last-child {\n        margin-bottom: 0; } }\n  @media (min-width: 768px) {\n    .navbar-form {\n      width: auto;\n      border: 0;\n      margin-left: 0;\n      margin-right: 0;\n      padding-top: 0;\n      padding-bottom: 0;\n      -webkit-box-shadow: none;\n      box-shadow: none; } }\n\n.navbar-nav > li > .dropdown-menu {\n  margin-top: 0;\n  border-top-right-radius: 0;\n  border-top-left-radius: 0; }\n\n.navbar-fixed-bottom .navbar-nav > li > .dropdown-menu {\n  margin-bottom: 0;\n  border-top-right-radius: 4px;\n  border-top-left-radius: 4px;\n  border-bottom-right-radius: 0;\n  border-bottom-left-radius: 0; }\n\n.navbar-btn {\n  margin-top: 8px;\n  margin-bottom: 8px; }\n  .navbar-btn.btn-sm, .btn-group-sm > .navbar-btn.btn {\n    margin-top: 10px;\n    margin-bottom: 10px; }\n  .navbar-btn.btn-xs, .btn-group-xs > .navbar-btn.btn {\n    margin-top: 14px;\n    margin-bottom: 14px; }\n\n.navbar-text {\n  margin-top: 15px;\n  margin-bottom: 15px; }\n  @media (min-width: 768px) {\n    .navbar-text {\n      float: left;\n      margin-left: 15px;\n      margin-right: 15px; } }\n\n@media (min-width: 768px) {\n  .navbar-left {\n    float: left !important; }\n  .navbar-right {\n    float: right !important;\n    margin-right: -15px; }\n    .navbar-right ~ .navbar-right {\n      margin-right: 0; } }\n\n.navbar-default {\n  background-color: #f8f8f8;\n  border-color: #e7e7e7; }\n  .navbar-default .navbar-brand {\n    color: #777; }\n    .navbar-default .navbar-brand:hover, .navbar-default .navbar-brand:focus {\n      color: #5e5e5e;\n      background-color: transparent; }\n  .navbar-default .navbar-text {\n    color: #777; }\n  .navbar-default .navbar-nav > li > a {\n    color: #777; }\n    .navbar-default .navbar-nav > li > a:hover, .navbar-default .navbar-nav > li > a:focus {\n      color: #333;\n      background-color: transparent; }\n  .navbar-default .navbar-nav > .active > a, .navbar-default .navbar-nav > .active > a:hover, .navbar-default .navbar-nav > .active > a:focus {\n    color: #555;\n    background-color: #e7e7e7; }\n  .navbar-default .navbar-nav > .disabled > a, .navbar-default .navbar-nav > .disabled > a:hover, .navbar-default .navbar-nav > .disabled > a:focus {\n    color: #ccc;\n    background-color: transparent; }\n  .navbar-default .navbar-toggle {\n    border-color: #ddd; }\n    .navbar-default .navbar-toggle:hover, .navbar-default .navbar-toggle:focus {\n      background-color: #ddd; }\n    .navbar-default .navbar-toggle .icon-bar {\n      background-color: #888; }\n  .navbar-default .navbar-collapse,\n  .navbar-default .navbar-form {\n    border-color: #e7e7e7; }\n  .navbar-default .navbar-nav > .open > a, .navbar-default .navbar-nav > .open > a:hover, .navbar-default .navbar-nav > .open > a:focus {\n    background-color: #e7e7e7;\n    color: #555; }\n  @media (max-width: 767px) {\n    .navbar-default .navbar-nav .open .dropdown-menu > li > a {\n      color: #777; }\n      .navbar-default .navbar-nav .open .dropdown-menu > li > a:hover, .navbar-default .navbar-nav .open .dropdown-menu > li > a:focus {\n        color: #333;\n        background-color: transparent; }\n    .navbar-default .navbar-nav .open .dropdown-menu > .active > a, .navbar-default .navbar-nav .open .dropdown-menu > .active > a:hover, .navbar-default .navbar-nav .open .dropdown-menu > .active > a:focus {\n      color: #555;\n      background-color: #e7e7e7; }\n    .navbar-default .navbar-nav .open .dropdown-menu > .disabled > a, .navbar-default .navbar-nav .open .dropdown-menu > .disabled > a:hover, .navbar-default .navbar-nav .open .dropdown-menu > .disabled > a:focus {\n      color: #ccc;\n      background-color: transparent; } }\n  .navbar-default .navbar-link {\n    color: #777; }\n    .navbar-default .navbar-link:hover {\n      color: #333; }\n  .navbar-default .btn-link {\n    color: #777; }\n    .navbar-default .btn-link:hover, .navbar-default .btn-link:focus {\n      color: #333; }\n    .navbar-default .btn-link[disabled]:hover, .navbar-default .btn-link[disabled]:focus,\n    fieldset[disabled] .navbar-default .btn-link:hover,\n    fieldset[disabled] .navbar-default .btn-link:focus {\n      color: #ccc; }\n\n.navbar-inverse {\n  background-color: #222;\n  border-color: #090909; }\n  .navbar-inverse .navbar-brand {\n    color: #9d9d9d; }\n    .navbar-inverse .navbar-brand:hover, .navbar-inverse .navbar-brand:focus {\n      color: #fff;\n      background-color: transparent; }\n  .navbar-inverse .navbar-text {\n    color: #9d9d9d; }\n  .navbar-inverse .navbar-nav > li > a {\n    color: #9d9d9d; }\n    .navbar-inverse .navbar-nav > li > a:hover, .navbar-inverse .navbar-nav > li > a:focus {\n      color: #fff;\n      background-color: transparent; }\n  .navbar-inverse .navbar-nav > .active > a, .navbar-inverse .navbar-nav > .active > a:hover, .navbar-inverse .navbar-nav > .active > a:focus {\n    color: #fff;\n    background-color: #090909; }\n  .navbar-inverse .navbar-nav > .disabled > a, .navbar-inverse .navbar-nav > .disabled > a:hover, .navbar-inverse .navbar-nav > .disabled > a:focus {\n    color: #444;\n    background-color: transparent; }\n  .navbar-inverse .navbar-toggle {\n    border-color: #333; }\n    .navbar-inverse .navbar-toggle:hover, .navbar-inverse .navbar-toggle:focus {\n      background-color: #333; }\n    .navbar-inverse .navbar-toggle .icon-bar {\n      background-color: #fff; }\n  .navbar-inverse .navbar-collapse,\n  .navbar-inverse .navbar-form {\n    border-color: #101010; }\n  .navbar-inverse .navbar-nav > .open > a, .navbar-inverse .navbar-nav > .open > a:hover, .navbar-inverse .navbar-nav > .open > a:focus {\n    background-color: #090909;\n    color: #fff; }\n  @media (max-width: 767px) {\n    .navbar-inverse .navbar-nav .open .dropdown-menu > .dropdown-header {\n      border-color: #090909; }\n    .navbar-inverse .navbar-nav .open .dropdown-menu .divider {\n      background-color: #090909; }\n    .navbar-inverse .navbar-nav .open .dropdown-menu > li > a {\n      color: #9d9d9d; }\n      .navbar-inverse .navbar-nav .open .dropdown-menu > li > a:hover, .navbar-inverse .navbar-nav .open .dropdown-menu > li > a:focus {\n        color: #fff;\n        background-color: transparent; }\n    .navbar-inverse .navbar-nav .open .dropdown-menu > .active > a, .navbar-inverse .navbar-nav .open .dropdown-menu > .active > a:hover, .navbar-inverse .navbar-nav .open .dropdown-menu > .active > a:focus {\n      color: #fff;\n      background-color: #090909; }\n    .navbar-inverse .navbar-nav .open .dropdown-menu > .disabled > a, .navbar-inverse .navbar-nav .open .dropdown-menu > .disabled > a:hover, .navbar-inverse .navbar-nav .open .dropdown-menu > .disabled > a:focus {\n      color: #444;\n      background-color: transparent; } }\n  .navbar-inverse .navbar-link {\n    color: #9d9d9d; }\n    .navbar-inverse .navbar-link:hover {\n      color: #fff; }\n  .navbar-inverse .btn-link {\n    color: #9d9d9d; }\n    .navbar-inverse .btn-link:hover, .navbar-inverse .btn-link:focus {\n      color: #fff; }\n    .navbar-inverse .btn-link[disabled]:hover, .navbar-inverse .btn-link[disabled]:focus,\n    fieldset[disabled] .navbar-inverse .btn-link:hover,\n    fieldset[disabled] .navbar-inverse .btn-link:focus {\n      color: #444; }\n\n.breadcrumb {\n  padding: 8px 15px;\n  margin-bottom: 20px;\n  list-style: none;\n  background-color: #f5f5f5;\n  border-radius: 4px; }\n  .breadcrumb > li {\n    display: inline-block; }\n    .breadcrumb > li + li:before {\n      content: \"/\\A0\";\n      padding: 0 5px;\n      color: #ccc; }\n  .breadcrumb > .active {\n    color: #777777; }\n\n.pagination {\n  display: inline-block;\n  padding-left: 0;\n  margin: 20px 0;\n  border-radius: 4px; }\n  .pagination > li {\n    display: inline; }\n    .pagination > li > a,\n    .pagination > li > span {\n      position: relative;\n      float: left;\n      padding: 6px 12px;\n      line-height: 1.42857;\n      text-decoration: none;\n      color: #337ab7;\n      background-color: #fff;\n      border: 1px solid #ddd;\n      margin-left: -1px; }\n    .pagination > li:first-child > a,\n    .pagination > li:first-child > span {\n      margin-left: 0;\n      border-bottom-left-radius: 4px;\n      border-top-left-radius: 4px; }\n    .pagination > li:last-child > a,\n    .pagination > li:last-child > span {\n      border-bottom-right-radius: 4px;\n      border-top-right-radius: 4px; }\n  .pagination > li > a:hover, .pagination > li > a:focus,\n  .pagination > li > span:hover,\n  .pagination > li > span:focus {\n    z-index: 2;\n    color: #23527c;\n    background-color: #eeeeee;\n    border-color: #ddd; }\n  .pagination > .active > a, .pagination > .active > a:hover, .pagination > .active > a:focus,\n  .pagination > .active > span,\n  .pagination > .active > span:hover,\n  .pagination > .active > span:focus {\n    z-index: 3;\n    color: #fff;\n    background-color: #337ab7;\n    border-color: #337ab7;\n    cursor: default; }\n  .pagination > .disabled > span,\n  .pagination > .disabled > span:hover,\n  .pagination > .disabled > span:focus,\n  .pagination > .disabled > a,\n  .pagination > .disabled > a:hover,\n  .pagination > .disabled > a:focus {\n    color: #777777;\n    background-color: #fff;\n    border-color: #ddd;\n    cursor: not-allowed; }\n\n.pagination-lg > li > a,\n.pagination-lg > li > span {\n  padding: 10px 16px;\n  font-size: 18px;\n  line-height: 1.33333; }\n\n.pagination-lg > li:first-child > a,\n.pagination-lg > li:first-child > span {\n  border-bottom-left-radius: 6px;\n  border-top-left-radius: 6px; }\n\n.pagination-lg > li:last-child > a,\n.pagination-lg > li:last-child > span {\n  border-bottom-right-radius: 6px;\n  border-top-right-radius: 6px; }\n\n.pagination-sm > li > a,\n.pagination-sm > li > span {\n  padding: 5px 10px;\n  font-size: 12px;\n  line-height: 1.5; }\n\n.pagination-sm > li:first-child > a,\n.pagination-sm > li:first-child > span {\n  border-bottom-left-radius: 3px;\n  border-top-left-radius: 3px; }\n\n.pagination-sm > li:last-child > a,\n.pagination-sm > li:last-child > span {\n  border-bottom-right-radius: 3px;\n  border-top-right-radius: 3px; }\n\n.pager {\n  padding-left: 0;\n  margin: 20px 0;\n  list-style: none;\n  text-align: center; }\n  .pager:before, .pager:after {\n    content: \" \";\n    display: table; }\n  .pager:after {\n    clear: both; }\n  .pager li {\n    display: inline; }\n    .pager li > a,\n    .pager li > span {\n      display: inline-block;\n      padding: 5px 14px;\n      background-color: #fff;\n      border: 1px solid #ddd;\n      border-radius: 15px; }\n    .pager li > a:hover,\n    .pager li > a:focus {\n      text-decoration: none;\n      background-color: #eeeeee; }\n  .pager .next > a,\n  .pager .next > span {\n    float: right; }\n  .pager .previous > a,\n  .pager .previous > span {\n    float: left; }\n  .pager .disabled > a,\n  .pager .disabled > a:hover,\n  .pager .disabled > a:focus,\n  .pager .disabled > span {\n    color: #777777;\n    background-color: #fff;\n    cursor: not-allowed; }\n\n.label {\n  display: inline;\n  padding: .2em .6em .3em;\n  font-size: 75%;\n  font-weight: bold;\n  line-height: 1;\n  color: #fff;\n  text-align: center;\n  white-space: nowrap;\n  vertical-align: baseline;\n  border-radius: .25em; }\n  .label:empty {\n    display: none; }\n  .btn .label {\n    position: relative;\n    top: -1px; }\n\na.label:hover, a.label:focus {\n  color: #fff;\n  text-decoration: none;\n  cursor: pointer; }\n\n.label-default {\n  background-color: #777777; }\n  .label-default[href]:hover, .label-default[href]:focus {\n    background-color: #5e5e5e; }\n\n.label-primary {\n  background-color: #337ab7; }\n  .label-primary[href]:hover, .label-primary[href]:focus {\n    background-color: #286090; }\n\n.label-success {\n  background-color: #5cb85c; }\n  .label-success[href]:hover, .label-success[href]:focus {\n    background-color: #449d44; }\n\n.label-info {\n  background-color: #5bc0de; }\n  .label-info[href]:hover, .label-info[href]:focus {\n    background-color: #31b0d5; }\n\n.label-warning {\n  background-color: #f0ad4e; }\n  .label-warning[href]:hover, .label-warning[href]:focus {\n    background-color: #ec971f; }\n\n.label-danger {\n  background-color: #d9534f; }\n  .label-danger[href]:hover, .label-danger[href]:focus {\n    background-color: #c9302c; }\n\n.badge {\n  display: inline-block;\n  min-width: 10px;\n  padding: 3px 7px;\n  font-size: 12px;\n  font-weight: bold;\n  color: #fff;\n  line-height: 1;\n  vertical-align: middle;\n  white-space: nowrap;\n  text-align: center;\n  background-color: #777777;\n  border-radius: 10px; }\n  .badge:empty {\n    display: none; }\n  .btn .badge {\n    position: relative;\n    top: -1px; }\n  .btn-xs .badge, .btn-group-xs > .btn .badge,\n  .btn-group-xs > .btn .badge {\n    top: 0;\n    padding: 1px 5px; }\n  .list-group-item.active > .badge,\n  .nav-pills > .active > a > .badge {\n    color: #337ab7;\n    background-color: #fff; }\n  .list-group-item > .badge {\n    float: right; }\n  .list-group-item > .badge + .badge {\n    margin-right: 5px; }\n  .nav-pills > li > a > .badge {\n    margin-left: 3px; }\n\na.badge:hover, a.badge:focus {\n  color: #fff;\n  text-decoration: none;\n  cursor: pointer; }\n\n.jumbotron {\n  padding-top: 30px;\n  padding-bottom: 30px;\n  margin-bottom: 30px;\n  color: inherit;\n  background-color: #eeeeee; }\n  .jumbotron h1,\n  .jumbotron .h1 {\n    color: inherit; }\n  .jumbotron p {\n    margin-bottom: 15px;\n    font-size: 21px;\n    font-weight: 200; }\n  .jumbotron > hr {\n    border-top-color: #d5d5d5; }\n  .container .jumbotron,\n  .container-fluid .jumbotron {\n    border-radius: 6px;\n    padding-left: 15px;\n    padding-right: 15px; }\n  .jumbotron .container {\n    max-width: 100%; }\n  @media screen and (min-width: 768px) {\n    .jumbotron {\n      padding-top: 48px;\n      padding-bottom: 48px; }\n      .container .jumbotron,\n      .container-fluid .jumbotron {\n        padding-left: 60px;\n        padding-right: 60px; }\n      .jumbotron h1,\n      .jumbotron .h1 {\n        font-size: 63px; } }\n\n.thumbnail {\n  display: block;\n  padding: 4px;\n  margin-bottom: 20px;\n  line-height: 1.42857;\n  background-color: #fff;\n  border: 1px solid #ddd;\n  border-radius: 4px;\n  -webkit-transition: border 0.2s ease-in-out;\n  -o-transition: border 0.2s ease-in-out;\n  transition: border 0.2s ease-in-out; }\n  .thumbnail > img,\n  .thumbnail a > img {\n    display: block;\n    max-width: 100%;\n    height: auto;\n    margin-left: auto;\n    margin-right: auto; }\n  .thumbnail .caption {\n    padding: 9px;\n    color: #333333; }\n\na.thumbnail:hover,\na.thumbnail:focus,\na.thumbnail.active {\n  border-color: #337ab7; }\n\n.alert {\n  padding: 15px;\n  margin-bottom: 20px;\n  border: 1px solid transparent;\n  border-radius: 4px; }\n  .alert h4 {\n    margin-top: 0;\n    color: inherit; }\n  .alert .alert-link {\n    font-weight: bold; }\n  .alert > p,\n  .alert > ul {\n    margin-bottom: 0; }\n  .alert > p + p {\n    margin-top: 5px; }\n\n.alert-dismissable,\n.alert-dismissible {\n  padding-right: 35px; }\n  .alert-dismissable .close,\n  .alert-dismissible .close {\n    position: relative;\n    top: -2px;\n    right: -21px;\n    color: inherit; }\n\n.alert-success {\n  background-color: #dff0d8;\n  border-color: #d6e9c6;\n  color: #3c763d; }\n  .alert-success hr {\n    border-top-color: #c9e2b3; }\n  .alert-success .alert-link {\n    color: #2b542c; }\n\n.alert-info {\n  background-color: #d9edf7;\n  border-color: #bce8f1;\n  color: #31708f; }\n  .alert-info hr {\n    border-top-color: #a6e1ec; }\n  .alert-info .alert-link {\n    color: #245269; }\n\n.alert-warning {\n  background-color: #fcf8e3;\n  border-color: #faebcc;\n  color: #8a6d3b; }\n  .alert-warning hr {\n    border-top-color: #f7e1b5; }\n  .alert-warning .alert-link {\n    color: #66512c; }\n\n.alert-danger {\n  background-color: #f2dede;\n  border-color: #ebccd1;\n  color: #a94442; }\n  .alert-danger hr {\n    border-top-color: #e4b9c0; }\n  .alert-danger .alert-link {\n    color: #843534; }\n\n@-webkit-keyframes progress-bar-stripes {\n  from {\n    background-position: 40px 0; }\n  to {\n    background-position: 0 0; } }\n\n@keyframes progress-bar-stripes {\n  from {\n    background-position: 40px 0; }\n  to {\n    background-position: 0 0; } }\n\n.progress {\n  overflow: hidden;\n  height: 20px;\n  margin-bottom: 20px;\n  background-color: #f5f5f5;\n  border-radius: 4px;\n  -webkit-box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);\n  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1); }\n\n.progress-bar {\n  float: left;\n  width: 0%;\n  height: 100%;\n  font-size: 12px;\n  line-height: 20px;\n  color: #fff;\n  text-align: center;\n  background-color: #337ab7;\n  -webkit-box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.15);\n  box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.15);\n  -webkit-transition: width 0.6s ease;\n  -o-transition: width 0.6s ease;\n  transition: width 0.6s ease; }\n\n.progress-striped .progress-bar,\n.progress-bar-striped {\n  background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n  background-image: -o-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n  background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n  background-size: 40px 40px; }\n\n.progress.active .progress-bar,\n.progress-bar.active {\n  -webkit-animation: progress-bar-stripes 2s linear infinite;\n  -o-animation: progress-bar-stripes 2s linear infinite;\n  animation: progress-bar-stripes 2s linear infinite; }\n\n.progress-bar-success {\n  background-color: #5cb85c; }\n  .progress-striped .progress-bar-success {\n    background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n    background-image: -o-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n    background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent); }\n\n.progress-bar-info {\n  background-color: #5bc0de; }\n  .progress-striped .progress-bar-info {\n    background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n    background-image: -o-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n    background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent); }\n\n.progress-bar-warning {\n  background-color: #f0ad4e; }\n  .progress-striped .progress-bar-warning {\n    background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n    background-image: -o-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n    background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent); }\n\n.progress-bar-danger {\n  background-color: #d9534f; }\n  .progress-striped .progress-bar-danger {\n    background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n    background-image: -o-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n    background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent); }\n\n.media {\n  margin-top: 15px; }\n  .media:first-child {\n    margin-top: 0; }\n\n.media,\n.media-body {\n  zoom: 1;\n  overflow: hidden; }\n\n.media-body {\n  width: 10000px; }\n\n.media-object {\n  display: block; }\n  .media-object.img-thumbnail {\n    max-width: none; }\n\n.media-right,\n.media > .pull-right {\n  padding-left: 10px; }\n\n.media-left,\n.media > .pull-left {\n  padding-right: 10px; }\n\n.media-left,\n.media-right,\n.media-body {\n  display: table-cell;\n  vertical-align: top; }\n\n.media-middle {\n  vertical-align: middle; }\n\n.media-bottom {\n  vertical-align: bottom; }\n\n.media-heading {\n  margin-top: 0;\n  margin-bottom: 5px; }\n\n.media-list {\n  padding-left: 0;\n  list-style: none; }\n\n.list-group {\n  margin-bottom: 20px;\n  padding-left: 0; }\n\n.list-group-item {\n  position: relative;\n  display: block;\n  padding: 10px 15px;\n  margin-bottom: -1px;\n  background-color: #fff;\n  border: 1px solid #ddd; }\n  .list-group-item:first-child {\n    border-top-right-radius: 4px;\n    border-top-left-radius: 4px; }\n  .list-group-item:last-child {\n    margin-bottom: 0;\n    border-bottom-right-radius: 4px;\n    border-bottom-left-radius: 4px; }\n\na.list-group-item,\nbutton.list-group-item {\n  color: #555; }\n  a.list-group-item .list-group-item-heading,\n  button.list-group-item .list-group-item-heading {\n    color: #333; }\n  a.list-group-item:hover, a.list-group-item:focus,\n  button.list-group-item:hover,\n  button.list-group-item:focus {\n    text-decoration: none;\n    color: #555;\n    background-color: #f5f5f5; }\n\nbutton.list-group-item {\n  width: 100%;\n  text-align: left; }\n\n.list-group-item.disabled, .list-group-item.disabled:hover, .list-group-item.disabled:focus {\n  background-color: #eeeeee;\n  color: #777777;\n  cursor: not-allowed; }\n  .list-group-item.disabled .list-group-item-heading, .list-group-item.disabled:hover .list-group-item-heading, .list-group-item.disabled:focus .list-group-item-heading {\n    color: inherit; }\n  .list-group-item.disabled .list-group-item-text, .list-group-item.disabled:hover .list-group-item-text, .list-group-item.disabled:focus .list-group-item-text {\n    color: #777777; }\n\n.list-group-item.active, .list-group-item.active:hover, .list-group-item.active:focus {\n  z-index: 2;\n  color: #fff;\n  background-color: #337ab7;\n  border-color: #337ab7; }\n  .list-group-item.active .list-group-item-heading,\n  .list-group-item.active .list-group-item-heading > small,\n  .list-group-item.active .list-group-item-heading > .small, .list-group-item.active:hover .list-group-item-heading,\n  .list-group-item.active:hover .list-group-item-heading > small,\n  .list-group-item.active:hover .list-group-item-heading > .small, .list-group-item.active:focus .list-group-item-heading,\n  .list-group-item.active:focus .list-group-item-heading > small,\n  .list-group-item.active:focus .list-group-item-heading > .small {\n    color: inherit; }\n  .list-group-item.active .list-group-item-text, .list-group-item.active:hover .list-group-item-text, .list-group-item.active:focus .list-group-item-text {\n    color: #c7ddef; }\n\n.list-group-item-success {\n  color: #3c763d;\n  background-color: #dff0d8; }\n\na.list-group-item-success,\nbutton.list-group-item-success {\n  color: #3c763d; }\n  a.list-group-item-success .list-group-item-heading,\n  button.list-group-item-success .list-group-item-heading {\n    color: inherit; }\n  a.list-group-item-success:hover, a.list-group-item-success:focus,\n  button.list-group-item-success:hover,\n  button.list-group-item-success:focus {\n    color: #3c763d;\n    background-color: #d0e9c6; }\n  a.list-group-item-success.active, a.list-group-item-success.active:hover, a.list-group-item-success.active:focus,\n  button.list-group-item-success.active,\n  button.list-group-item-success.active:hover,\n  button.list-group-item-success.active:focus {\n    color: #fff;\n    background-color: #3c763d;\n    border-color: #3c763d; }\n\n.list-group-item-info {\n  color: #31708f;\n  background-color: #d9edf7; }\n\na.list-group-item-info,\nbutton.list-group-item-info {\n  color: #31708f; }\n  a.list-group-item-info .list-group-item-heading,\n  button.list-group-item-info .list-group-item-heading {\n    color: inherit; }\n  a.list-group-item-info:hover, a.list-group-item-info:focus,\n  button.list-group-item-info:hover,\n  button.list-group-item-info:focus {\n    color: #31708f;\n    background-color: #c4e3f3; }\n  a.list-group-item-info.active, a.list-group-item-info.active:hover, a.list-group-item-info.active:focus,\n  button.list-group-item-info.active,\n  button.list-group-item-info.active:hover,\n  button.list-group-item-info.active:focus {\n    color: #fff;\n    background-color: #31708f;\n    border-color: #31708f; }\n\n.list-group-item-warning {\n  color: #8a6d3b;\n  background-color: #fcf8e3; }\n\na.list-group-item-warning,\nbutton.list-group-item-warning {\n  color: #8a6d3b; }\n  a.list-group-item-warning .list-group-item-heading,\n  button.list-group-item-warning .list-group-item-heading {\n    color: inherit; }\n  a.list-group-item-warning:hover, a.list-group-item-warning:focus,\n  button.list-group-item-warning:hover,\n  button.list-group-item-warning:focus {\n    color: #8a6d3b;\n    background-color: #faf2cc; }\n  a.list-group-item-warning.active, a.list-group-item-warning.active:hover, a.list-group-item-warning.active:focus,\n  button.list-group-item-warning.active,\n  button.list-group-item-warning.active:hover,\n  button.list-group-item-warning.active:focus {\n    color: #fff;\n    background-color: #8a6d3b;\n    border-color: #8a6d3b; }\n\n.list-group-item-danger {\n  color: #a94442;\n  background-color: #f2dede; }\n\na.list-group-item-danger,\nbutton.list-group-item-danger {\n  color: #a94442; }\n  a.list-group-item-danger .list-group-item-heading,\n  button.list-group-item-danger .list-group-item-heading {\n    color: inherit; }\n  a.list-group-item-danger:hover, a.list-group-item-danger:focus,\n  button.list-group-item-danger:hover,\n  button.list-group-item-danger:focus {\n    color: #a94442;\n    background-color: #ebcccc; }\n  a.list-group-item-danger.active, a.list-group-item-danger.active:hover, a.list-group-item-danger.active:focus,\n  button.list-group-item-danger.active,\n  button.list-group-item-danger.active:hover,\n  button.list-group-item-danger.active:focus {\n    color: #fff;\n    background-color: #a94442;\n    border-color: #a94442; }\n\n.list-group-item-heading {\n  margin-top: 0;\n  margin-bottom: 5px; }\n\n.list-group-item-text {\n  margin-bottom: 0;\n  line-height: 1.3; }\n\n.panel {\n  margin-bottom: 20px;\n  background-color: #fff;\n  border: 1px solid transparent;\n  border-radius: 4px;\n  -webkit-box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);\n  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05); }\n\n.panel-body {\n  padding: 15px; }\n  .panel-body:before, .panel-body:after {\n    content: \" \";\n    display: table; }\n  .panel-body:after {\n    clear: both; }\n\n.panel-heading {\n  padding: 10px 15px;\n  border-bottom: 1px solid transparent;\n  border-top-right-radius: 3px;\n  border-top-left-radius: 3px; }\n  .panel-heading > .dropdown .dropdown-toggle {\n    color: inherit; }\n\n.panel-title {\n  margin-top: 0;\n  margin-bottom: 0;\n  font-size: 16px;\n  color: inherit; }\n  .panel-title > a,\n  .panel-title > small,\n  .panel-title > .small,\n  .panel-title > small > a,\n  .panel-title > .small > a {\n    color: inherit; }\n\n.panel-footer {\n  padding: 10px 15px;\n  background-color: #f5f5f5;\n  border-top: 1px solid #ddd;\n  border-bottom-right-radius: 3px;\n  border-bottom-left-radius: 3px; }\n\n.panel > .list-group,\n.panel > .panel-collapse > .list-group {\n  margin-bottom: 0; }\n  .panel > .list-group .list-group-item,\n  .panel > .panel-collapse > .list-group .list-group-item {\n    border-width: 1px 0;\n    border-radius: 0; }\n  .panel > .list-group:first-child .list-group-item:first-child,\n  .panel > .panel-collapse > .list-group:first-child .list-group-item:first-child {\n    border-top: 0;\n    border-top-right-radius: 3px;\n    border-top-left-radius: 3px; }\n  .panel > .list-group:last-child .list-group-item:last-child,\n  .panel > .panel-collapse > .list-group:last-child .list-group-item:last-child {\n    border-bottom: 0;\n    border-bottom-right-radius: 3px;\n    border-bottom-left-radius: 3px; }\n\n.panel > .panel-heading + .panel-collapse > .list-group .list-group-item:first-child {\n  border-top-right-radius: 0;\n  border-top-left-radius: 0; }\n\n.panel-heading + .list-group .list-group-item:first-child {\n  border-top-width: 0; }\n\n.list-group + .panel-footer {\n  border-top-width: 0; }\n\n.panel > .table,\n.panel > .table-responsive > .table,\n.panel > .panel-collapse > .table {\n  margin-bottom: 0; }\n  .panel > .table caption,\n  .panel > .table-responsive > .table caption,\n  .panel > .panel-collapse > .table caption {\n    padding-left: 15px;\n    padding-right: 15px; }\n\n.panel > .table:first-child,\n.panel > .table-responsive:first-child > .table:first-child {\n  border-top-right-radius: 3px;\n  border-top-left-radius: 3px; }\n  .panel > .table:first-child > thead:first-child > tr:first-child,\n  .panel > .table:first-child > tbody:first-child > tr:first-child,\n  .panel > .table-responsive:first-child > .table:first-child > thead:first-child > tr:first-child,\n  .panel > .table-responsive:first-child > .table:first-child > tbody:first-child > tr:first-child {\n    border-top-left-radius: 3px;\n    border-top-right-radius: 3px; }\n    .panel > .table:first-child > thead:first-child > tr:first-child td:first-child,\n    .panel > .table:first-child > thead:first-child > tr:first-child th:first-child,\n    .panel > .table:first-child > tbody:first-child > tr:first-child td:first-child,\n    .panel > .table:first-child > tbody:first-child > tr:first-child th:first-child,\n    .panel > .table-responsive:first-child > .table:first-child > thead:first-child > tr:first-child td:first-child,\n    .panel > .table-responsive:first-child > .table:first-child > thead:first-child > tr:first-child th:first-child,\n    .panel > .table-responsive:first-child > .table:first-child > tbody:first-child > tr:first-child td:first-child,\n    .panel > .table-responsive:first-child > .table:first-child > tbody:first-child > tr:first-child th:first-child {\n      border-top-left-radius: 3px; }\n    .panel > .table:first-child > thead:first-child > tr:first-child td:last-child,\n    .panel > .table:first-child > thead:first-child > tr:first-child th:last-child,\n    .panel > .table:first-child > tbody:first-child > tr:first-child td:last-child,\n    .panel > .table:first-child > tbody:first-child > tr:first-child th:last-child,\n    .panel > .table-responsive:first-child > .table:first-child > thead:first-child > tr:first-child td:last-child,\n    .panel > .table-responsive:first-child > .table:first-child > thead:first-child > tr:first-child th:last-child,\n    .panel > .table-responsive:first-child > .table:first-child > tbody:first-child > tr:first-child td:last-child,\n    .panel > .table-responsive:first-child > .table:first-child > tbody:first-child > tr:first-child th:last-child {\n      border-top-right-radius: 3px; }\n\n.panel > .table:last-child,\n.panel > .table-responsive:last-child > .table:last-child {\n  border-bottom-right-radius: 3px;\n  border-bottom-left-radius: 3px; }\n  .panel > .table:last-child > tbody:last-child > tr:last-child,\n  .panel > .table:last-child > tfoot:last-child > tr:last-child,\n  .panel > .table-responsive:last-child > .table:last-child > tbody:last-child > tr:last-child,\n  .panel > .table-responsive:last-child > .table:last-child > tfoot:last-child > tr:last-child {\n    border-bottom-left-radius: 3px;\n    border-bottom-right-radius: 3px; }\n    .panel > .table:last-child > tbody:last-child > tr:last-child td:first-child,\n    .panel > .table:last-child > tbody:last-child > tr:last-child th:first-child,\n    .panel > .table:last-child > tfoot:last-child > tr:last-child td:first-child,\n    .panel > .table:last-child > tfoot:last-child > tr:last-child th:first-child,\n    .panel > .table-responsive:last-child > .table:last-child > tbody:last-child > tr:last-child td:first-child,\n    .panel > .table-responsive:last-child > .table:last-child > tbody:last-child > tr:last-child th:first-child,\n    .panel > .table-responsive:last-child > .table:last-child > tfoot:last-child > tr:last-child td:first-child,\n    .panel > .table-responsive:last-child > .table:last-child > tfoot:last-child > tr:last-child th:first-child {\n      border-bottom-left-radius: 3px; }\n    .panel > .table:last-child > tbody:last-child > tr:last-child td:last-child,\n    .panel > .table:last-child > tbody:last-child > tr:last-child th:last-child,\n    .panel > .table:last-child > tfoot:last-child > tr:last-child td:last-child,\n    .panel > .table:last-child > tfoot:last-child > tr:last-child th:last-child,\n    .panel > .table-responsive:last-child > .table:last-child > tbody:last-child > tr:last-child td:last-child,\n    .panel > .table-responsive:last-child > .table:last-child > tbody:last-child > tr:last-child th:last-child,\n    .panel > .table-responsive:last-child > .table:last-child > tfoot:last-child > tr:last-child td:last-child,\n    .panel > .table-responsive:last-child > .table:last-child > tfoot:last-child > tr:last-child th:last-child {\n      border-bottom-right-radius: 3px; }\n\n.panel > .panel-body + .table,\n.panel > .panel-body + .table-responsive,\n.panel > .table + .panel-body,\n.panel > .table-responsive + .panel-body {\n  border-top: 1px solid #ddd; }\n\n.panel > .table > tbody:first-child > tr:first-child th,\n.panel > .table > tbody:first-child > tr:first-child td {\n  border-top: 0; }\n\n.panel > .table-bordered,\n.panel > .table-responsive > .table-bordered {\n  border: 0; }\n  .panel > .table-bordered > thead > tr > th:first-child,\n  .panel > .table-bordered > thead > tr > td:first-child,\n  .panel > .table-bordered > tbody > tr > th:first-child,\n  .panel > .table-bordered > tbody > tr > td:first-child,\n  .panel > .table-bordered > tfoot > tr > th:first-child,\n  .panel > .table-bordered > tfoot > tr > td:first-child,\n  .panel > .table-responsive > .table-bordered > thead > tr > th:first-child,\n  .panel > .table-responsive > .table-bordered > thead > tr > td:first-child,\n  .panel > .table-responsive > .table-bordered > tbody > tr > th:first-child,\n  .panel > .table-responsive > .table-bordered > tbody > tr > td:first-child,\n  .panel > .table-responsive > .table-bordered > tfoot > tr > th:first-child,\n  .panel > .table-responsive > .table-bordered > tfoot > tr > td:first-child {\n    border-left: 0; }\n  .panel > .table-bordered > thead > tr > th:last-child,\n  .panel > .table-bordered > thead > tr > td:last-child,\n  .panel > .table-bordered > tbody > tr > th:last-child,\n  .panel > .table-bordered > tbody > tr > td:last-child,\n  .panel > .table-bordered > tfoot > tr > th:last-child,\n  .panel > .table-bordered > tfoot > tr > td:last-child,\n  .panel > .table-responsive > .table-bordered > thead > tr > th:last-child,\n  .panel > .table-responsive > .table-bordered > thead > tr > td:last-child,\n  .panel > .table-responsive > .table-bordered > tbody > tr > th:last-child,\n  .panel > .table-responsive > .table-bordered > tbody > tr > td:last-child,\n  .panel > .table-responsive > .table-bordered > tfoot > tr > th:last-child,\n  .panel > .table-responsive > .table-bordered > tfoot > tr > td:last-child {\n    border-right: 0; }\n  .panel > .table-bordered > thead > tr:first-child > td,\n  .panel > .table-bordered > thead > tr:first-child > th,\n  .panel > .table-bordered > tbody > tr:first-child > td,\n  .panel > .table-bordered > tbody > tr:first-child > th,\n  .panel > .table-responsive > .table-bordered > thead > tr:first-child > td,\n  .panel > .table-responsive > .table-bordered > thead > tr:first-child > th,\n  .panel > .table-responsive > .table-bordered > tbody > tr:first-child > td,\n  .panel > .table-responsive > .table-bordered > tbody > tr:first-child > th {\n    border-bottom: 0; }\n  .panel > .table-bordered > tbody > tr:last-child > td,\n  .panel > .table-bordered > tbody > tr:last-child > th,\n  .panel > .table-bordered > tfoot > tr:last-child > td,\n  .panel > .table-bordered > tfoot > tr:last-child > th,\n  .panel > .table-responsive > .table-bordered > tbody > tr:last-child > td,\n  .panel > .table-responsive > .table-bordered > tbody > tr:last-child > th,\n  .panel > .table-responsive > .table-bordered > tfoot > tr:last-child > td,\n  .panel > .table-responsive > .table-bordered > tfoot > tr:last-child > th {\n    border-bottom: 0; }\n\n.panel > .table-responsive {\n  border: 0;\n  margin-bottom: 0; }\n\n.panel-group {\n  margin-bottom: 20px; }\n  .panel-group .panel {\n    margin-bottom: 0;\n    border-radius: 4px; }\n    .panel-group .panel + .panel {\n      margin-top: 5px; }\n  .panel-group .panel-heading {\n    border-bottom: 0; }\n    .panel-group .panel-heading + .panel-collapse > .panel-body,\n    .panel-group .panel-heading + .panel-collapse > .list-group {\n      border-top: 1px solid #ddd; }\n  .panel-group .panel-footer {\n    border-top: 0; }\n    .panel-group .panel-footer + .panel-collapse .panel-body {\n      border-bottom: 1px solid #ddd; }\n\n.panel-default {\n  border-color: #ddd; }\n  .panel-default > .panel-heading {\n    color: #333333;\n    background-color: #f5f5f5;\n    border-color: #ddd; }\n    .panel-default > .panel-heading + .panel-collapse > .panel-body {\n      border-top-color: #ddd; }\n    .panel-default > .panel-heading .badge {\n      color: #f5f5f5;\n      background-color: #333333; }\n  .panel-default > .panel-footer + .panel-collapse > .panel-body {\n    border-bottom-color: #ddd; }\n\n.panel-primary {\n  border-color: #337ab7; }\n  .panel-primary > .panel-heading {\n    color: #fff;\n    background-color: #337ab7;\n    border-color: #337ab7; }\n    .panel-primary > .panel-heading + .panel-collapse > .panel-body {\n      border-top-color: #337ab7; }\n    .panel-primary > .panel-heading .badge {\n      color: #337ab7;\n      background-color: #fff; }\n  .panel-primary > .panel-footer + .panel-collapse > .panel-body {\n    border-bottom-color: #337ab7; }\n\n.panel-success {\n  border-color: #d6e9c6; }\n  .panel-success > .panel-heading {\n    color: #3c763d;\n    background-color: #dff0d8;\n    border-color: #d6e9c6; }\n    .panel-success > .panel-heading + .panel-collapse > .panel-body {\n      border-top-color: #d6e9c6; }\n    .panel-success > .panel-heading .badge {\n      color: #dff0d8;\n      background-color: #3c763d; }\n  .panel-success > .panel-footer + .panel-collapse > .panel-body {\n    border-bottom-color: #d6e9c6; }\n\n.panel-info {\n  border-color: #bce8f1; }\n  .panel-info > .panel-heading {\n    color: #31708f;\n    background-color: #d9edf7;\n    border-color: #bce8f1; }\n    .panel-info > .panel-heading + .panel-collapse > .panel-body {\n      border-top-color: #bce8f1; }\n    .panel-info > .panel-heading .badge {\n      color: #d9edf7;\n      background-color: #31708f; }\n  .panel-info > .panel-footer + .panel-collapse > .panel-body {\n    border-bottom-color: #bce8f1; }\n\n.panel-warning {\n  border-color: #faebcc; }\n  .panel-warning > .panel-heading {\n    color: #8a6d3b;\n    background-color: #fcf8e3;\n    border-color: #faebcc; }\n    .panel-warning > .panel-heading + .panel-collapse > .panel-body {\n      border-top-color: #faebcc; }\n    .panel-warning > .panel-heading .badge {\n      color: #fcf8e3;\n      background-color: #8a6d3b; }\n  .panel-warning > .panel-footer + .panel-collapse > .panel-body {\n    border-bottom-color: #faebcc; }\n\n.panel-danger {\n  border-color: #ebccd1; }\n  .panel-danger > .panel-heading {\n    color: #a94442;\n    background-color: #f2dede;\n    border-color: #ebccd1; }\n    .panel-danger > .panel-heading + .panel-collapse > .panel-body {\n      border-top-color: #ebccd1; }\n    .panel-danger > .panel-heading .badge {\n      color: #f2dede;\n      background-color: #a94442; }\n  .panel-danger > .panel-footer + .panel-collapse > .panel-body {\n    border-bottom-color: #ebccd1; }\n\n.embed-responsive {\n  position: relative;\n  display: block;\n  height: 0;\n  padding: 0;\n  overflow: hidden; }\n  .embed-responsive .embed-responsive-item,\n  .embed-responsive iframe,\n  .embed-responsive embed,\n  .embed-responsive object,\n  .embed-responsive video {\n    position: absolute;\n    top: 0;\n    left: 0;\n    bottom: 0;\n    height: 100%;\n    width: 100%;\n    border: 0; }\n\n.embed-responsive-16by9 {\n  padding-bottom: 56.25%; }\n\n.embed-responsive-4by3 {\n  padding-bottom: 75%; }\n\n.well {\n  min-height: 20px;\n  padding: 19px;\n  margin-bottom: 20px;\n  background-color: #f5f5f5;\n  border: 1px solid #e3e3e3;\n  border-radius: 4px;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.05);\n  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.05); }\n  .well blockquote {\n    border-color: #ddd;\n    border-color: rgba(0, 0, 0, 0.15); }\n\n.well-lg {\n  padding: 24px;\n  border-radius: 6px; }\n\n.well-sm {\n  padding: 9px;\n  border-radius: 3px; }\n\n.close {\n  float: right;\n  font-size: 21px;\n  font-weight: bold;\n  line-height: 1;\n  color: #000;\n  text-shadow: 0 1px 0 #fff;\n  opacity: 0.2;\n  filter: alpha(opacity=20); }\n  .close:hover, .close:focus {\n    color: #000;\n    text-decoration: none;\n    cursor: pointer;\n    opacity: 0.5;\n    filter: alpha(opacity=50); }\n\nbutton.close {\n  padding: 0;\n  cursor: pointer;\n  background: transparent;\n  border: 0;\n  -webkit-appearance: none; }\n\n.modal-open {\n  overflow: hidden; }\n\n.modal {\n  display: none;\n  overflow: hidden;\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  z-index: 1050;\n  -webkit-overflow-scrolling: touch;\n  outline: 0; }\n  .modal.fade .modal-dialog {\n    -webkit-transform: translate(0, -25%);\n    -ms-transform: translate(0, -25%);\n    -o-transform: translate(0, -25%);\n    transform: translate(0, -25%);\n    -webkit-transition: -webkit-transform 0.3s ease-out;\n    -moz-transition: -moz-transform 0.3s ease-out;\n    -o-transition: -o-transform 0.3s ease-out;\n    transition: transform 0.3s ease-out; }\n  .modal.in .modal-dialog {\n    -webkit-transform: translate(0, 0);\n    -ms-transform: translate(0, 0);\n    -o-transform: translate(0, 0);\n    transform: translate(0, 0); }\n\n.modal-open .modal {\n  overflow-x: hidden;\n  overflow-y: auto; }\n\n.modal-dialog {\n  position: relative;\n  width: auto;\n  margin: 10px; }\n\n.modal-content {\n  position: relative;\n  background-color: #fff;\n  border: 1px solid #999;\n  border: 1px solid rgba(0, 0, 0, 0.2);\n  border-radius: 6px;\n  -webkit-box-shadow: 0 3px 9px rgba(0, 0, 0, 0.5);\n  box-shadow: 0 3px 9px rgba(0, 0, 0, 0.5);\n  background-clip: padding-box;\n  outline: 0; }\n\n.modal-backdrop {\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  z-index: 1040;\n  background-color: #000; }\n  .modal-backdrop.fade {\n    opacity: 0;\n    filter: alpha(opacity=0); }\n  .modal-backdrop.in {\n    opacity: 0.5;\n    filter: alpha(opacity=50); }\n\n.modal-header {\n  padding: 15px;\n  border-bottom: 1px solid #e5e5e5; }\n  .modal-header:before, .modal-header:after {\n    content: \" \";\n    display: table; }\n  .modal-header:after {\n    clear: both; }\n\n.modal-header .close {\n  margin-top: -2px; }\n\n.modal-title {\n  margin: 0;\n  line-height: 1.42857; }\n\n.modal-body {\n  position: relative;\n  padding: 15px; }\n\n.modal-footer {\n  padding: 15px;\n  text-align: right;\n  border-top: 1px solid #e5e5e5; }\n  .modal-footer:before, .modal-footer:after {\n    content: \" \";\n    display: table; }\n  .modal-footer:after {\n    clear: both; }\n  .modal-footer .btn + .btn {\n    margin-left: 5px;\n    margin-bottom: 0; }\n  .modal-footer .btn-group .btn + .btn {\n    margin-left: -1px; }\n  .modal-footer .btn-block + .btn-block {\n    margin-left: 0; }\n\n.modal-scrollbar-measure {\n  position: absolute;\n  top: -9999px;\n  width: 50px;\n  height: 50px;\n  overflow: scroll; }\n\n@media (min-width: 768px) {\n  .modal-dialog {\n    width: 600px;\n    margin: 30px auto; }\n  .modal-content {\n    -webkit-box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);\n    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5); }\n  .modal-sm {\n    width: 300px; } }\n\n@media (min-width: 992px) {\n  .modal-lg {\n    width: 900px; } }\n\n.tooltip {\n  position: absolute;\n  z-index: 1070;\n  display: block;\n  font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n  font-style: normal;\n  font-weight: normal;\n  letter-spacing: normal;\n  line-break: auto;\n  line-height: 1.42857;\n  text-align: left;\n  text-align: start;\n  text-decoration: none;\n  text-shadow: none;\n  text-transform: none;\n  white-space: normal;\n  word-break: normal;\n  word-spacing: normal;\n  word-wrap: normal;\n  font-size: 12px;\n  opacity: 0;\n  filter: alpha(opacity=0); }\n  .tooltip.in {\n    opacity: 0.9;\n    filter: alpha(opacity=90); }\n  .tooltip.top {\n    margin-top: -3px;\n    padding: 5px 0; }\n  .tooltip.right {\n    margin-left: 3px;\n    padding: 0 5px; }\n  .tooltip.bottom {\n    margin-top: 3px;\n    padding: 5px 0; }\n  .tooltip.left {\n    margin-left: -3px;\n    padding: 0 5px; }\n\n.tooltip-inner {\n  max-width: 200px;\n  padding: 3px 8px;\n  color: #fff;\n  text-align: center;\n  background-color: #000;\n  border-radius: 4px; }\n\n.tooltip-arrow {\n  position: absolute;\n  width: 0;\n  height: 0;\n  border-color: transparent;\n  border-style: solid; }\n\n.tooltip.top .tooltip-arrow {\n  bottom: 0;\n  left: 50%;\n  margin-left: -5px;\n  border-width: 5px 5px 0;\n  border-top-color: #000; }\n\n.tooltip.top-left .tooltip-arrow {\n  bottom: 0;\n  right: 5px;\n  margin-bottom: -5px;\n  border-width: 5px 5px 0;\n  border-top-color: #000; }\n\n.tooltip.top-right .tooltip-arrow {\n  bottom: 0;\n  left: 5px;\n  margin-bottom: -5px;\n  border-width: 5px 5px 0;\n  border-top-color: #000; }\n\n.tooltip.right .tooltip-arrow {\n  top: 50%;\n  left: 0;\n  margin-top: -5px;\n  border-width: 5px 5px 5px 0;\n  border-right-color: #000; }\n\n.tooltip.left .tooltip-arrow {\n  top: 50%;\n  right: 0;\n  margin-top: -5px;\n  border-width: 5px 0 5px 5px;\n  border-left-color: #000; }\n\n.tooltip.bottom .tooltip-arrow {\n  top: 0;\n  left: 50%;\n  margin-left: -5px;\n  border-width: 0 5px 5px;\n  border-bottom-color: #000; }\n\n.tooltip.bottom-left .tooltip-arrow {\n  top: 0;\n  right: 5px;\n  margin-top: -5px;\n  border-width: 0 5px 5px;\n  border-bottom-color: #000; }\n\n.tooltip.bottom-right .tooltip-arrow {\n  top: 0;\n  left: 5px;\n  margin-top: -5px;\n  border-width: 0 5px 5px;\n  border-bottom-color: #000; }\n\n.popover {\n  position: absolute;\n  top: 0;\n  left: 0;\n  z-index: 1060;\n  display: none;\n  max-width: 276px;\n  padding: 1px;\n  font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n  font-style: normal;\n  font-weight: normal;\n  letter-spacing: normal;\n  line-break: auto;\n  line-height: 1.42857;\n  text-align: left;\n  text-align: start;\n  text-decoration: none;\n  text-shadow: none;\n  text-transform: none;\n  white-space: normal;\n  word-break: normal;\n  word-spacing: normal;\n  word-wrap: normal;\n  font-size: 14px;\n  background-color: #fff;\n  background-clip: padding-box;\n  border: 1px solid #ccc;\n  border: 1px solid rgba(0, 0, 0, 0.2);\n  border-radius: 6px;\n  -webkit-box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);\n  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2); }\n  .popover.top {\n    margin-top: -10px; }\n  .popover.right {\n    margin-left: 10px; }\n  .popover.bottom {\n    margin-top: 10px; }\n  .popover.left {\n    margin-left: -10px; }\n\n.popover-title {\n  margin: 0;\n  padding: 8px 14px;\n  font-size: 14px;\n  background-color: #f7f7f7;\n  border-bottom: 1px solid #ebebeb;\n  border-radius: 5px 5px 0 0; }\n\n.popover-content {\n  padding: 9px 14px; }\n\n.popover > .arrow, .popover > .arrow:after {\n  position: absolute;\n  display: block;\n  width: 0;\n  height: 0;\n  border-color: transparent;\n  border-style: solid; }\n\n.popover > .arrow {\n  border-width: 11px; }\n\n.popover > .arrow:after {\n  border-width: 10px;\n  content: \"\"; }\n\n.popover.top > .arrow {\n  left: 50%;\n  margin-left: -11px;\n  border-bottom-width: 0;\n  border-top-color: #999999;\n  border-top-color: rgba(0, 0, 0, 0.25);\n  bottom: -11px; }\n  .popover.top > .arrow:after {\n    content: \" \";\n    bottom: 1px;\n    margin-left: -10px;\n    border-bottom-width: 0;\n    border-top-color: #fff; }\n\n.popover.right > .arrow {\n  top: 50%;\n  left: -11px;\n  margin-top: -11px;\n  border-left-width: 0;\n  border-right-color: #999999;\n  border-right-color: rgba(0, 0, 0, 0.25); }\n  .popover.right > .arrow:after {\n    content: \" \";\n    left: 1px;\n    bottom: -10px;\n    border-left-width: 0;\n    border-right-color: #fff; }\n\n.popover.bottom > .arrow {\n  left: 50%;\n  margin-left: -11px;\n  border-top-width: 0;\n  border-bottom-color: #999999;\n  border-bottom-color: rgba(0, 0, 0, 0.25);\n  top: -11px; }\n  .popover.bottom > .arrow:after {\n    content: \" \";\n    top: 1px;\n    margin-left: -10px;\n    border-top-width: 0;\n    border-bottom-color: #fff; }\n\n.popover.left > .arrow {\n  top: 50%;\n  right: -11px;\n  margin-top: -11px;\n  border-right-width: 0;\n  border-left-color: #999999;\n  border-left-color: rgba(0, 0, 0, 0.25); }\n  .popover.left > .arrow:after {\n    content: \" \";\n    right: 1px;\n    border-right-width: 0;\n    border-left-color: #fff;\n    bottom: -10px; }\n\n.carousel {\n  position: relative; }\n\n.carousel-inner {\n  position: relative;\n  overflow: hidden;\n  width: 100%; }\n  .carousel-inner > .item {\n    display: none;\n    position: relative;\n    -webkit-transition: 0.6s ease-in-out left;\n    -o-transition: 0.6s ease-in-out left;\n    transition: 0.6s ease-in-out left; }\n    .carousel-inner > .item > img,\n    .carousel-inner > .item > a > img {\n      display: block;\n      max-width: 100%;\n      height: auto;\n      line-height: 1; }\n    @media all and (transform-3d), (-webkit-transform-3d) {\n      .carousel-inner > .item {\n        -webkit-transition: -webkit-transform 0.6s ease-in-out;\n        -moz-transition: -moz-transform 0.6s ease-in-out;\n        -o-transition: -o-transform 0.6s ease-in-out;\n        transition: transform 0.6s ease-in-out;\n        -webkit-backface-visibility: hidden;\n        -moz-backface-visibility: hidden;\n        backface-visibility: hidden;\n        -webkit-perspective: 1000px;\n        -moz-perspective: 1000px;\n        perspective: 1000px; }\n        .carousel-inner > .item.next, .carousel-inner > .item.active.right {\n          -webkit-transform: translate3d(100%, 0, 0);\n          transform: translate3d(100%, 0, 0);\n          left: 0; }\n        .carousel-inner > .item.prev, .carousel-inner > .item.active.left {\n          -webkit-transform: translate3d(-100%, 0, 0);\n          transform: translate3d(-100%, 0, 0);\n          left: 0; }\n        .carousel-inner > .item.next.left, .carousel-inner > .item.prev.right, .carousel-inner > .item.active {\n          -webkit-transform: translate3d(0, 0, 0);\n          transform: translate3d(0, 0, 0);\n          left: 0; } }\n  .carousel-inner > .active,\n  .carousel-inner > .next,\n  .carousel-inner > .prev {\n    display: block; }\n  .carousel-inner > .active {\n    left: 0; }\n  .carousel-inner > .next,\n  .carousel-inner > .prev {\n    position: absolute;\n    top: 0;\n    width: 100%; }\n  .carousel-inner > .next {\n    left: 100%; }\n  .carousel-inner > .prev {\n    left: -100%; }\n  .carousel-inner > .next.left,\n  .carousel-inner > .prev.right {\n    left: 0; }\n  .carousel-inner > .active.left {\n    left: -100%; }\n  .carousel-inner > .active.right {\n    left: 100%; }\n\n.carousel-control {\n  position: absolute;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  width: 15%;\n  opacity: 0.5;\n  filter: alpha(opacity=50);\n  font-size: 20px;\n  color: #fff;\n  text-align: center;\n  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);\n  background-color: transparent; }\n  .carousel-control.left {\n    background-image: -webkit-linear-gradient(left, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.0001) 100%);\n    background-image: -o-linear-gradient(left, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.0001) 100%);\n    background-image: linear-gradient(to right, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.0001) 100%);\n    background-repeat: repeat-x;\n    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#80000000', endColorstr='#00000000', GradientType=1); }\n  .carousel-control.right {\n    left: auto;\n    right: 0;\n    background-image: -webkit-linear-gradient(left, rgba(0, 0, 0, 0.0001) 0%, rgba(0, 0, 0, 0.5) 100%);\n    background-image: -o-linear-gradient(left, rgba(0, 0, 0, 0.0001) 0%, rgba(0, 0, 0, 0.5) 100%);\n    background-image: linear-gradient(to right, rgba(0, 0, 0, 0.0001) 0%, rgba(0, 0, 0, 0.5) 100%);\n    background-repeat: repeat-x;\n    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#00000000', endColorstr='#80000000', GradientType=1); }\n  .carousel-control:hover, .carousel-control:focus {\n    outline: 0;\n    color: #fff;\n    text-decoration: none;\n    opacity: 0.9;\n    filter: alpha(opacity=90); }\n  .carousel-control .icon-prev,\n  .carousel-control .icon-next,\n  .carousel-control .glyphicon-chevron-left,\n  .carousel-control .glyphicon-chevron-right {\n    position: absolute;\n    top: 50%;\n    margin-top: -10px;\n    z-index: 5;\n    display: inline-block; }\n  .carousel-control .icon-prev,\n  .carousel-control .glyphicon-chevron-left {\n    left: 50%;\n    margin-left: -10px; }\n  .carousel-control .icon-next,\n  .carousel-control .glyphicon-chevron-right {\n    right: 50%;\n    margin-right: -10px; }\n  .carousel-control .icon-prev,\n  .carousel-control .icon-next {\n    width: 20px;\n    height: 20px;\n    line-height: 1;\n    font-family: serif; }\n  .carousel-control .icon-prev:before {\n    content: '\\2039'; }\n  .carousel-control .icon-next:before {\n    content: '\\203A'; }\n\n.carousel-indicators {\n  position: absolute;\n  bottom: 10px;\n  left: 50%;\n  z-index: 15;\n  width: 60%;\n  margin-left: -30%;\n  padding-left: 0;\n  list-style: none;\n  text-align: center; }\n  .carousel-indicators li {\n    display: inline-block;\n    width: 10px;\n    height: 10px;\n    margin: 1px;\n    text-indent: -999px;\n    border: 1px solid #fff;\n    border-radius: 10px;\n    cursor: pointer;\n    background-color: #000 \\9;\n    background-color: transparent; }\n  .carousel-indicators .active {\n    margin: 0;\n    width: 12px;\n    height: 12px;\n    background-color: #fff; }\n\n.carousel-caption {\n  position: absolute;\n  left: 15%;\n  right: 15%;\n  bottom: 20px;\n  z-index: 10;\n  padding-top: 20px;\n  padding-bottom: 20px;\n  color: #fff;\n  text-align: center;\n  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6); }\n  .carousel-caption .btn {\n    text-shadow: none; }\n\n@media screen and (min-width: 768px) {\n  .carousel-control .glyphicon-chevron-left,\n  .carousel-control .glyphicon-chevron-right,\n  .carousel-control .icon-prev,\n  .carousel-control .icon-next {\n    width: 30px;\n    height: 30px;\n    margin-top: -10px;\n    font-size: 30px; }\n  .carousel-control .glyphicon-chevron-left,\n  .carousel-control .icon-prev {\n    margin-left: -10px; }\n  .carousel-control .glyphicon-chevron-right,\n  .carousel-control .icon-next {\n    margin-right: -10px; }\n  .carousel-caption {\n    left: 20%;\n    right: 20%;\n    padding-bottom: 30px; }\n  .carousel-indicators {\n    bottom: 20px; } }\n\n.clearfix:before, .clearfix:after {\n  content: \" \";\n  display: table; }\n\n.clearfix:after {\n  clear: both; }\n\n.center-block {\n  display: block;\n  margin-left: auto;\n  margin-right: auto; }\n\n.pull-right {\n  float: right !important; }\n\n.pull-left {\n  float: left !important; }\n\n.hide {\n  display: none !important; }\n\n.show {\n  display: block !important; }\n\n.invisible {\n  visibility: hidden; }\n\n.text-hide {\n  font: 0/0 a;\n  color: transparent;\n  text-shadow: none;\n  background-color: transparent;\n  border: 0; }\n\n.hidden {\n  display: none !important; }\n\n.affix {\n  position: fixed; }\n\n@-ms-viewport {\n  width: device-width; }\n\n.visible-xs {\n  display: none !important; }\n\n.visible-sm {\n  display: none !important; }\n\n.visible-md {\n  display: none !important; }\n\n.visible-lg {\n  display: none !important; }\n\n.visible-xs-block,\n.visible-xs-inline,\n.visible-xs-inline-block,\n.visible-sm-block,\n.visible-sm-inline,\n.visible-sm-inline-block,\n.visible-md-block,\n.visible-md-inline,\n.visible-md-inline-block,\n.visible-lg-block,\n.visible-lg-inline,\n.visible-lg-inline-block {\n  display: none !important; }\n\n@media (max-width: 767px) {\n  .visible-xs {\n    display: block !important; }\n  table.visible-xs {\n    display: table !important; }\n  tr.visible-xs {\n    display: table-row !important; }\n  th.visible-xs,\n  td.visible-xs {\n    display: table-cell !important; } }\n\n@media (max-width: 767px) {\n  .visible-xs-block {\n    display: block !important; } }\n\n@media (max-width: 767px) {\n  .visible-xs-inline {\n    display: inline !important; } }\n\n@media (max-width: 767px) {\n  .visible-xs-inline-block {\n    display: inline-block !important; } }\n\n@media (min-width: 768px) and (max-width: 991px) {\n  .visible-sm {\n    display: block !important; }\n  table.visible-sm {\n    display: table !important; }\n  tr.visible-sm {\n    display: table-row !important; }\n  th.visible-sm,\n  td.visible-sm {\n    display: table-cell !important; } }\n\n@media (min-width: 768px) and (max-width: 991px) {\n  .visible-sm-block {\n    display: block !important; } }\n\n@media (min-width: 768px) and (max-width: 991px) {\n  .visible-sm-inline {\n    display: inline !important; } }\n\n@media (min-width: 768px) and (max-width: 991px) {\n  .visible-sm-inline-block {\n    display: inline-block !important; } }\n\n@media (min-width: 992px) and (max-width: 1199px) {\n  .visible-md {\n    display: block !important; }\n  table.visible-md {\n    display: table !important; }\n  tr.visible-md {\n    display: table-row !important; }\n  th.visible-md,\n  td.visible-md {\n    display: table-cell !important; } }\n\n@media (min-width: 992px) and (max-width: 1199px) {\n  .visible-md-block {\n    display: block !important; } }\n\n@media (min-width: 992px) and (max-width: 1199px) {\n  .visible-md-inline {\n    display: inline !important; } }\n\n@media (min-width: 992px) and (max-width: 1199px) {\n  .visible-md-inline-block {\n    display: inline-block !important; } }\n\n@media (min-width: 1200px) {\n  .visible-lg {\n    display: block !important; }\n  table.visible-lg {\n    display: table !important; }\n  tr.visible-lg {\n    display: table-row !important; }\n  th.visible-lg,\n  td.visible-lg {\n    display: table-cell !important; } }\n\n@media (min-width: 1200px) {\n  .visible-lg-block {\n    display: block !important; } }\n\n@media (min-width: 1200px) {\n  .visible-lg-inline {\n    display: inline !important; } }\n\n@media (min-width: 1200px) {\n  .visible-lg-inline-block {\n    display: inline-block !important; } }\n\n@media (max-width: 767px) {\n  .hidden-xs {\n    display: none !important; } }\n\n@media (min-width: 768px) and (max-width: 991px) {\n  .hidden-sm {\n    display: none !important; } }\n\n@media (min-width: 992px) and (max-width: 1199px) {\n  .hidden-md {\n    display: none !important; } }\n\n@media (min-width: 1200px) {\n  .hidden-lg {\n    display: none !important; } }\n\n.visible-print {\n  display: none !important; }\n\n@media print {\n  .visible-print {\n    display: block !important; }\n  table.visible-print {\n    display: table !important; }\n  tr.visible-print {\n    display: table-row !important; }\n  th.visible-print,\n  td.visible-print {\n    display: table-cell !important; } }\n\n.visible-print-block {\n  display: none !important; }\n  @media print {\n    .visible-print-block {\n      display: block !important; } }\n\n.visible-print-inline {\n  display: none !important; }\n  @media print {\n    .visible-print-inline {\n      display: inline !important; } }\n\n.visible-print-inline-block {\n  display: none !important; }\n  @media print {\n    .visible-print-inline-block {\n      display: inline-block !important; } }\n\n@media print {\n  .hidden-print {\n    display: none !important; } }\n\nbody {\n  line-height: 1.6;\n  font-size: 18px;\n  padding: 0px 10px;\n  max-width: 800px;\n  margin: 5px auto;\n  display: inline;\n  text-align: center; }\n\n#page-wrap {\n  max-width: 800px;\n  margin: 0 auto; }\n\ntable.display {\n  margin: 0 auto; }\n\nth {\n  text-align: center; }\n\n.table-header {\n  margin: 0 auto; }\n\np, h1, h2, h3, h4, h5 {\n  color: #000;\n  font-weight: 600; }\n\n.selected {\n  color: red; }\n\n.message {\n  color: red;\n  background-color: black; }\n\n.content {\n  background-color: grey; }\n\nbody {\n  background-color: #eee; }\n\ntable.display {\n  border: 1px solid #000;\n  background-color: white; }\n\n.header {\n  background-color: white; }\n\n.game-name, h1 {\n  color: #561717; }\n\nh4 {\n  color: #564017; }\n\nbody {\n  line-height: 1.6;\n  font-size: 18px;\n  padding: 0px 10px;\n  max-width: 800px;\n  margin: 5px auto;\n  display: inline;\n  text-align: center; }\n\n#page-wrap {\n  max-width: 800px;\n  margin: 0 auto; }\n\ntable.display {\n  margin: 0 auto; }\n\nth {\n  text-align: center; }\n\n.table-header {\n  margin: 0 auto; }\n\nbody {\n  line-height: 1.6;\n  font-size: 18px;\n  padding: 0px 10px;\n  max-width: 800px;\n  margin: 5px auto;\n  display: inline;\n  text-align: center; }\n\n#page-wrap {\n  max-width: 800px;\n  margin: 0 auto; }\n\ntable.display {\n  margin: 0 auto; }\n\nth {\n  text-align: center; }\n\n.table-header {\n  margin: 0 auto; }\n\n@media (max-width: 767px) {\n  body, h1, p, div {\n    line-height: 1.28;\n    font-size: 14.4px;\n    padding: 0 5px;\n    max-width: 560px;\n    margin: 2.5px auto; } }\n", ""]);

	// exports


/***/ }),
/* 40 */
/***/ (function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "f4769f9bdb7466be65088239c12046d1.eot";

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "448c34a56d699c29117adc64c43affeb.woff2";

/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "fa2772327f55d8198301fdb8bcfc8158.woff";

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "e18bbf611f2a2e43afc071aa2f4e1512.ttf";

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "89889688147bd7575d6327160d64e760.svg";

/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(self.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}

	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}

	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}

	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}

	function updateLink(linkElement, obj) {
		var css = obj.css;
		var sourceMap = obj.sourceMap;

		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		var blob = new Blob([css], { type: "text/css" });

		var oldSrc = linkElement.href;

		linkElement.href = URL.createObjectURL(blob);

		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ })
]);