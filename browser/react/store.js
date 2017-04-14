import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { createLogger } from 'redux-logger';

const CHANGE_CH_STATE_EVERYTHING='CHANGE_CH_STATE_EVERYTHING';
export const change_CH_State_Everything_AC = (entireChessStateObj)=>{
	return {type: CHANGE_CH_STATE_EVERYTHING, entireChessStateObj: entireChessStateObj}
}

const CHANGE_PLAYERS_STATE= 'CHANGE_PLAYERS_STATE';
export const change_Players_State_AC= (entirePlayersStateObj)=>{
	return {type: CHANGE_PLAYERS_STATE, entirePlayersStateObj: entirePlayersStateObj}
}

const SET_CURR_ID= 'SET_CURR_ID';
export const set_currPlayer_socketID_AC= (socketID)=>{
	return {type: SET_CURR_ID, socketID: socketID}
}

const UPDATE_CURRENT_PLAYER= 'UPDATE_CURRENT_PLAYER';
export const update_currPlayer_AC= (playerObj)=>{
	return {type: UPDATE_CURRENT_PLAYER, playerObj: playerObj}
}


const PIECE_GENERAL = 0;
const PIECE_GUARD = 1;
const PIECE_CAVALIER = 2;
const PIECE_ELEPHANT = 3;
const PIECE_CHARIOT = 4;
const PIECE_CANNON = 5;
const PIECE_SOLDIER = 6
const IN_PLAY = true;

const initialState = {
	"black":{},
	"red":{},
	"currentTurn":null,
}

export const chessStateReducer = function (prevState = initialState, action){
	let newState = Object.assign({}, prevState);
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

	switch(action.type){//don't need the 2 following.. since client will just change everything
		// case CHANGE_CH_STATE:
    //   let team= action.pieceChangeObj.team;
    //   let key= action.pieceChangeObj.key;
    //   let val= action.pieceChangeObj.pieceVal;
		// 	newState[team][key]=val;
		// 	return newState;
		//
		// case CHANGE_CH_TURN:
		// 	newState.currentTurn= action.currentTurn;
		// 	return newState;

		case CHANGE_CH_STATE_EVERYTHING:
			newState= Object.assign({},action.entireChessStateObj);//NOTE.. entireChessStateObj comes from the server, and is NOT deep cloned!!!
			//WILL THIS BE A PROBLEM?  I really really hope not... (i mean it's from the server right...?)
			//should i deep clone it anyway
			return newState;

		default:
			return prevState;
	}
}

const playersStateReducer = function(prevState = [], action){
	let newState = prevState.slice(0);

	switch(action.type){
		//Client side, so the follow 2 cases are not necessary
		//
		// case ADD_PLAYER:
		// 	newState=newState.concat(action.playerObj);
		// 	return newState;
		//
		// case CHANGE_PLAYER:
		// 	for(let i=0;i<newState.length;i++){
		// 		if(newState[i].socketID===action.playerObj.socketID){
		// 			newState[i]= Object.assign({},action.playerObj);
		// 			break;
		// 		}
		// 	}
		// 	return newState;

		case CHANGE_PLAYERS_STATE:
			newState= action.entirePlayersStateObj;//this is NOT MAKING CLONES OF PLAYERSTATE... ONLY DO THIS IF PLAYERSTATE IS ALREADY
			//A CLONE (OR A JSON OBJECT SENT FROM SERVER)
			return newState;

		default:
			return prevState;
	}
}

const currentPlayerStateReducer = function(prevState = {}, action){
	let newState = Object.assign({},prevState);

	switch(action.type){
		case SET_CURR_ID:
			newState.socketID= action.socketID;
			return newState;

		case UPDATE_CURRENT_PLAYER:
			newState= action.playerObj;
			return newState;
		default:
			return prevState;
	}
}




let reducers=combineReducers({
  chessState: chessStateReducer,
	playersState: playersStateReducer,
	currentPlayerState: currentPlayerStateReducer,
});

export const store = createStore(reducers,applyMiddleware(createLogger(),thunkMiddleware));
