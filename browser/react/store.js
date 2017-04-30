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

const CHANGE_BOARD = 'CHANGE_BOARD';
export const change_board= (board)=>{
	return {type: CHANGE_BOARD, board: board}
}

//MAKE A WINNER ACTION CREATOR (AND CASE IN REDUCER)

//MAKE A ENDED ACTION CREATOR (AND CASE IN REDUCER)

// later just have all these constants in constants
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
	"ended":false,
	"winner": null,
}

// const initialBoard= [
// 	[{},{},{},{},{},{},{},{},{},],
// 	[{},{},{},{},{},{},{},{},{},],
// 	[{},{},{},{},{},{},{},{},{},],
// 	[{},{},{},{},{},{},{},{},{},],
// 	[{},{},{},{},{},{},{},{},{},],
// 	[{},{},{},{},{},{},{},{},{},],
// 	[{},{},{},{},{},{},{},{},{},],
// 	[{},{},{},{},{},{},{},{},{},],
// 	[{},{},{},{},{},{},{},{},{},],
// 	[{},{},{},{},{},{},{},{},{},],
// ]

const initialBoard = [[{"team":"black","key":"CH1"},{"team":"black","key":"CAV1"},{"team":"black","key":"ELE1"},{"team":"black","key":"GU1"},{"team":"black","key":"GEN"},{"team":"black","key":"GU2"},{"team":"black","key":"ELE2"},{"team":"black","key":"CAV2"},{"team":"black","key":"CH2"}],[{},{},{},{},{},{},{},{},{}],[{},{"team":"black","key":"CAN1"},{},{},{},{},{},{"team":"black","key":"CAN2"},{}],[{"team":"black","key":"SOL1"},{},{"team":"black","key":"SOL2"},{},{"team":"black","key":"SOL3"},{},{"team":"black","key":"SOL4"},{},{"team":"black","key":"SOL5"}],[{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{}],[{"team":"red","key":"SOL1"},{},{"team":"red","key":"SOL2"},{},{"team":"red","key":"SOL3"},{},{"team":"red","key":"SOL4"},{},{"team":"red","key":"SOL5"}],[{},{"team":"red","key":"CAN1"},{},{},{},{},{},{"team":"red","key":"CAN2"},{}],[{},{},{},{},{},{},{},{},{}],[{"team":"red","key":"CH1"},{"team":"red","key":"CAV1"},{"team":"red","key":"ELE1"},{"team":"red","key":"GU1"},{"team":"red","key":"GEN"},{"team":"red","key":"GU2"},{"team":"red","key":"ELE2"},{"team":"red","key":"CAV2"},{"team":"red","key":"CH2"}]]

export const boardStateReducer = function (prevState = initialBoard, action){
	let newState=initialBoard.slice(0);//copy outer array
	for(let yArr of newState){
		yArr= yArr.slice(0);//copy inner array
		for(let lookupVal of yArr){
			lookupVal= Object.assign({},lookupVal);//copy objects inside the array
		}
	}
	switch(action.type){
		case CHANGE_BOARD:
			newState= action.board;
			return newState;

		default:
			return prevState;
	}
}

export const chessStateReducer = function (prevState = initialState, action){
	let newState = Object.assign({}, prevState);//**** on second thought, do we even NEED deep clone here?  you're simply assigning newState to action.entireChessStateObj from server... cloning makes no difference because you are not changing small parts of the original chessState
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
		case CHANGE_CH_STATE_EVERYTHING:
			newState= action.entireChessStateObj;//this is NOT MAKING CLONES OF ENTIRECHESSSTATE... ONLY DO THIS IF CHESSSTATE IS ALREADY
			//A CLONE (OR A JSON OBJECT SENT FROM SERVER)
			return newState;

		default:
			return prevState;
	}
}

const playersStateReducer = function(prevState = [], action){
	let newState = prevState.slice(0);

	switch(action.type){
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
	boardState: boardStateReducer,//This is the only thing that does not get anything from server (this is recreated every time from chessState - when that changes)
});

export const store = createStore(reducers,applyMiddleware(createLogger(),thunkMiddleware));
