const thunkMiddleware = require('redux-thunk').default;//NOTE YOU MUST USE REQUIRE FOR SERVER SIDE..
// (appraently tension between node community and the guys that made ES6 or whatevs)
const { createStore, applyMiddleware, combineReducers } = require('redux');
const { createLogger } = require('redux-logger');

const CHANGE_CH_STATE='CHANGE_CH_STATE';
const change_CH_State_AC = (pieceChangeOBj)=>{
	return {type: CHANGE_CH_STATE, pieceChangeObj: pieceChangeOBj};
}//pieceChangeObj looks something like: {team: "black", key: "CH1", pieceVal: {"piece": PIECE_CHARIOT,"x": 0,"y": 0,"status": false} }

const CHANGE_CH_TURN='CHANGE_CH_TURN';
const change_CH_Turn_AC = (turnstr)=>{
	return {type: CHANGE_CH_TURN, currentTurn: turnstr};
}

const CHANGE_PLAYER= 'CHANGE_PLAYER';
const change_Player_AC = (playerObj)=>{//playerObj looks something like: {socketID: 12345, name: Charlieee, team: null}
	return {type: CHANGE_PLAYER, playerObj: playerObj};//NOTE SOCKETID SHOULD NEVER CHANGE.. THAT IS THE IDENTIFIER... TEAM AND NAME ARE ONLY ONES THAT CAN CHANGE
}

const ADD_PLAYER= 'ADD_PLAYER';
const add_Player_AC = (playerObj)=>{//playerObj looks something like: {socketID: 12345, name: Charlieee, team: null}
	return {type: ADD_PLAYER, playerObj: playerObj};
}

const REMOVE_PLAYER= 'REMOVE_PLAYER';
const remove_Player_AC = (socketID)=>{//playerObj looks something like: {socketID: 12345, name: Charlieee, team: null}
	return {type: REMOVE_PLAYER, socketID: socketID};
}

const CHANGE_CH_STATE_EVERYTHING='CHANGE_CH_STATE_EVERYTHING';


const PIECE_GENERAL = 0;
const PIECE_GUARD = 1;
const PIECE_CAVALIER = 2;
const PIECE_ELEPHANT = 3;
const PIECE_CHARIOT = 4;
const PIECE_CANNON = 5;
const PIECE_SOLDIER = 6
const IN_PLAY = true;

const initialChessState =
{
    "black":
    {
      "CH1": {
          "piece": PIECE_CHARIOT,
          "x": 0,
          "y": 0,
          "status": IN_PLAY
      },

      "CAV1": {
          "piece": PIECE_CAVALIER,
          "x": 1,
          "y": 0,
          "status": IN_PLAY
      },
      "ELE1": {
          "piece": PIECE_ELEPHANT,
          "x": 2,
          "y": 0,
          "status": IN_PLAY
      },
      "GU1": {
          "piece": PIECE_GUARD,
          "x": 3,
          "y": 0,
          "status": IN_PLAY
      },
      "GEN": {
          "piece": PIECE_GENERAL,
          "x": 4,
          "y": 0,
          "status": IN_PLAY
      },
      "GU2": {
          "piece": PIECE_GUARD,
          "x": 5,
          "y": 0,
          "status": IN_PLAY
      },
      "ELE2": {
          "piece": PIECE_ELEPHANT,
          "x": 6,
          "y": 0,
          "status": IN_PLAY
      },
      "CAV2": {
          "piece": PIECE_CAVALIER,
          "x": 7,
          "y": 0,
          "status": IN_PLAY
      },
      "CH2": {
          "piece": PIECE_CHARIOT,
          "x": 8,
          "y": 0,
          "status": IN_PLAY
      },
      "CAN1": {
          "piece": PIECE_CANNON,
          "x": 1,
          "y": 2,
          "status": IN_PLAY
      },
      "CAN2": {
          "piece": PIECE_CANNON,
          "x": 7,
          "y": 2,
          "status": IN_PLAY
      },
      "SOL1": {
          "piece": PIECE_SOLDIER,
          "x": 0,
          "y": 3,
          "status": IN_PLAY
      },
      "SOL2": {
          "piece": PIECE_SOLDIER,
          "x": 2,
          "y": 3,
          "status": IN_PLAY
      },
      "SOL3": {
          "piece": PIECE_SOLDIER,
          "x": 4,
          "y": 3,
          "status": IN_PLAY
      },
      "SOL4": {
          "piece": PIECE_SOLDIER,
          "x": 6,
          "y": 3,
          "status": IN_PLAY
      },
      "SOL5": {
          "piece": PIECE_SOLDIER,
          "x": 8,
          "y": 3,
          "status": IN_PLAY
      }
    },

    "red":
    {
      "CH1": {
          "piece": PIECE_CHARIOT,
          "x": 0,
          "y": 9,
          "status": IN_PLAY
      },
      "CAV1": {
          "piece": PIECE_CAVALIER,
          "x": 1,
          "y": 9,
          "status": IN_PLAY
      },
      "ELE1": {
          "piece": PIECE_ELEPHANT,
          "x": 2,
          "y": 9,
          "status": IN_PLAY
      },
      "GU1": {
          "piece": PIECE_GUARD,
          "x": 3,
          "y": 9,
          "status": IN_PLAY
      },
      "GEN": {
          "piece": PIECE_GENERAL,
          "x": 4,
          "y": 9,
          "status": IN_PLAY
      },
      "GU2": {
          "piece": PIECE_GUARD,
          "x": 5,
          "y": 9,
          "status": IN_PLAY
      },
      "ELE2": {
          "piece": PIECE_ELEPHANT,
          "x": 6,
          "y": 9,
          "status": IN_PLAY
      },
      "CAV2": {
          "piece": PIECE_CAVALIER,
          "x": 7,
          "y": 9,
          "status": IN_PLAY
      },
      "CH2": {
          "piece": PIECE_CHARIOT,
          "x": 8,
          "y": 9,
          "status": IN_PLAY
      },
      "CAN1": {
          "piece": PIECE_CANNON,
          "x": 1,
          "y": 7,
          "status": IN_PLAY
      },
      "CAN2": {
          "piece": PIECE_CANNON,
          "x": 7,
          "y": 7,
          "status": IN_PLAY
      },
      "SOL1": {
          "piece": PIECE_SOLDIER,
          "x": 0,
          "y": 6,
          "status": IN_PLAY
      },
      "SOL2": {
          "piece": PIECE_SOLDIER,
          "x": 2,
          "y": 6,
          "status": IN_PLAY
      },
      "SOL3": {
          "piece": PIECE_SOLDIER,
          "x": 4,
          "y": 6,
          "status": IN_PLAY
      },
      "SOL4": {
          "piece": PIECE_SOLDIER,
          "x": 6,
          "y": 6,
          "status": IN_PLAY
      },
      "SOL5": {
          "piece": PIECE_SOLDIER,
          "x": 8,
          "y": 6,
          "status": IN_PLAY
      }
    },

		"selectedKey": null,
		"currentTurn": 'red',//it's always been up for debate who is "supposed" to have the first turn traditionally, but most modern tourneys say red
};

const chessStateReducer = function (prevState = initialChessState, action){
	const newState = Object.assign({}, prevState);
  newState.black = Object.assign({}, prevState.black);
  newState.red = Object.assign({}, prevState.red);
  Object.keys(prevState.black).forEach((key)=>{
    newState.black[key]=Object.assign({}, prevState.black[key]);
  });
  Object.keys(prevState.red).forEach((key)=>{
    newState.red[key]=Object.assign({}, prevState.red[key]);
  })
  //the above is like deep cloning.. remember object.assign only changes the OUTERMOST obj..
  //the keys may still reference the same objects.. so changing those would change the original outer obj too
  //see picture on your phone

	switch(action.type){
		case CHANGE_CH_STATE:
      let {team, key, pieceVal } = action.pieceChangeObj //pieceChangeObj looks like: //{team: "black", key: "CH1", pieceVal: {"piece": PIECE_CHARIOT,"x": 0,"y": 0,"status": false} }

			newState[team][key]=pieceVal;
			return newState;


		case CHANGE_CH_TURN:
			newState.currentTurn= action.currentTurn;
			return newState;

		default:
			return prevState;
	}
}

const playersStateReducer = function(prevState = [], action){
	// const newState = Object.assign({}, prevState);
	let newState = prevState.slice(0);

	switch(action.type){
		case ADD_PLAYER:
			newState=newState.concat(action.playerObj);
			return newState;

		case CHANGE_PLAYER:
			for(let i=0;i<newState.length;i++){
				if(newState[i].socketID===action.playerObj.socketID){
					newState[i]= Object.assign({},action.playerObj);//is this part necessary?  you're basically cloning a clone
					break;
				}
			}
			return newState;

		case REMOVE_PLAYER:
			for(let i=0;i<newState.length;i++){
				if(newState[i].socketID===action.socketID){
					newState.splice(i,1);//remove the playerObj at index i
					break;
				}
			}
			return newState;

		default:
			return prevState;
	}
}

let reducers=combineReducers({//this is how the entire store.getState() object will look like
  chessState: chessStateReducer,//this is chessState (the monstrosity above)
  playersState: playersStateReducer,
});

// const store = createStore(reducers,applyMiddleware(createLogger(),thunkMiddleware));
const store = createStore(reducers,applyMiddleware(thunkMiddleware));//createLogger() unfortunately is too overwhelming in server console :(

module.exports= {
  chessStateReducer,
  store,
  change_CH_State_AC,
  change_CH_Turn_AC,
	change_Player_AC,
	add_Player_AC,
	remove_Player_AC,
}
