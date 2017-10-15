'use strict';
var constantsObj= require('../browser/js/constants');
const { UPDATE_CHESS_STORE, UPDATE_PIECES, UPDATE_TURN, CHANGE_CH_STATE, CHANGE_CH_TURN, NEW_PLAYER, UPDATE_PLAYERS_STORE, REQUEST_UPDATE_FROM_SERVER, RESET_SERVER_REQ, RESTART_GAME_REQ, UPDATE_OPP_AI_STAT } = require('../browser/js/constants');
const { change_CH_State_AC, change_CH_Turn_AC, change_Player_AC, add_Player_AC, remove_Player_AC, restart_game_AC } = require('./store');

/* eslint-disable global-require */
var socketio = require('socket.io');
var chalk = require('chalk');

var store = require('./store').store;//THIS IS A DIFFERENT STORE FROM THE BROWSER SIDE REACT ONE!!!  THIS IS FOR STORING STORES FOR CURRENT GAMES
//(MATCHING BROWSER SIDE STORES WILL CHANGE THEIR STORES TO MATCH THE SERVER)

var app = require('./app');
var server = require('http').createServer(app);
var io = socketio(server);

// var createApplication = function () {
//     var app = require('./app');
//     server.on('request', app); // Attach the Express application.
// }; //THIS CAUSE A LOT OF PROBLEMS!!!!!! (you did the io= socketio(server) before attaching express.. as in line 13 did not exist)
// and only in line 18... crazy problem... you shoiuld ask about this later

var startServer = function () {

    var PORT = process.env.PORT || 3000;

    server.listen(PORT, function () {
        console.log(chalk.blue('Server started on port', chalk.magenta(PORT)));
    });

};

startServer();

io.on('connection', function (socket) {
  console.log(socket.id, 'connected');

  function updateClientsChessState(){
    // console.log('emitting chess state to clients ');
    io.emit(UPDATE_CHESS_STORE, store.getState().chessState)
  }

  updateClientsChessState();
  //First emit to update chess store at the beginning, works perfect!

  function updateClientsPlayersState(){
    // console.log('emitting player state to clients ');
    io.emit(UPDATE_PLAYERS_STORE, store.getState().playersState)//WHY DID SOCKET.EMIT WORK EAERLIER (WHEN I HAD STORE.SUBSCRIBE() UNCOMMENTED IT SENT TO ALL? SO WERID)
  }

  function updTeamsinPlayersState(){
    // console.log('updating Teams');
    let playersStateArr= store.getState().playersState;
    let player0_Obj= Object.assign({},playersStateArr[0]);
    let player1_Obj= Object.assign({},playersStateArr[1]);
    player0_Obj.team='red';
    player1_Obj.team='black';
    let change_Player_AO0= change_Player_AC(player0_Obj);
    store.dispatch(change_Player_AO0);
    let change_Player_AO1= change_Player_AC(player1_Obj);
    store.dispatch(change_Player_AO1);
    // console.log(store.getState().playersState);
    updateClientsPlayersState();
  }

  //It was very clever of you to make a listener for changes in the store and update clients with new information whenever there are changes
  //but honestly it just doesn't work out as well as intended.  Because clients emit small changes (3 emits per turn usually), the server ends up
  //emitting back 6 times, when really it should emit back twice (once for update chess state and once for update playersstate)
  // I'd actually still like to implement this somehow.. aska bout it later
  // store.subscribe(() => {
  //   updateClientsChessState();
  //   updateClientsPlayersState();
  // })

  // console.log('checking const ',REQUEST_UPDATE_FROM_SERVER)

  socket.on(REQUEST_UPDATE_FROM_SERVER, function(){
    console.log('received request to update clients with chessState and players information')
    updateClientsChessState();
    updateClientsPlayersState();
  })

  socket.on(NEW_PLAYER, function(playerName){
    // console.log('new player.. adding');
    let newPlayerObj = {socketID: socket.id, name: playerName, team: null };
    let add_Player_AO= add_Player_AC(newPlayerObj);
    store.dispatch(add_Player_AO);
    updTeamsinPlayersState();
    // updateClientsPlayersState();
  })

  socket.on(UPDATE_PIECES, function(pieceChangeObj){
    // console.log('recieved updated chess state from client');
    // console.log(pieceChangeObj)
    let change_CH_State_AO = change_CH_State_AC(pieceChangeObj);
    store.dispatch(change_CH_State_AO);
  })

  socket.on(UPDATE_TURN, function(nextTurn){
    let change_CH_Turn_AO = change_CH_Turn_AC(nextTurn);
    store.dispatch(change_CH_Turn_AO);
  })

  socket.on(RESET_SERVER_REQ, function(){
    console.log('received request to reset server store from client');
    store.dispatch(reset_server_AC());
  })

  socket.on(RESTART_GAME_REQ, function(){
    console.log('received request to reset server store from client');
    store.dispatch(restart_game_AC());
  })

  socket.on(UPDATE_OPP_AI_STAT, function(actionObj){
    console.log('broadcasting : ', actionObj);
    socket.broadcast.emit(UPDATE_OPP_AI_STAT, actionObj);
  })

  socket.on('disconnect', function () {
    store.dispatch(remove_Player_AC(socket.id));
    updTeamsinPlayersState();

    console.log('Goodbye, ', socket.id, ' :(');
  });
});

// implement the code below once you have database up
// startDb
// .then(createApplication)
// .then(startServer)
// .catch(function (err) {
//     console.error(chalk.red(err.stack));
//     process.exit(1);
// });
