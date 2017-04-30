import { deepCloneChessState, deepCloneBoardState} from './utils'
import LegalMoves from './legalMoves'

var PIECE_GENERAL = 0;
var PIECE_GUARD = 1;
var PIECE_CAVALIER = 2;
var PIECE_ELEPHANT = 3;
var PIECE_CHARIOT = 4;
var PIECE_CANNON = 5;
var PIECE_SOLDIER = 6
// again this is really bad.. having these constants everywhere.. you need ONE SINGLE source of truth.. so implement this later (both here and in legalMoves.js)

//Each instance of Game represents a game STATE (board and chessstate, and current turn)
//To do.. still need to make a way to disable the move and other methods once a winner has been declared
export function Game(boardState, chessState, parent=null, turnNumber=0){//Because it'd be a nightmare to hook everything up and shiz, I'm simply make this new state JUST for AI to simulate on
//NEED TO DEEP CLONE USING DEEPCLONE FUNCTIONS YOU HAD TO WASTE TIME WRITING... BECAUSE YOU WERE AN IDIOT AND USED THE HORRIBLY STRUCTURED CHESSSTATE FROM TUTORIAL, NOW IT'S BITING YOU IN THE ASS
  this.boardState=deepCloneBoardState(boardState);//yes super confusing... board state is the array or arrays of lookup values for the pieces in the chess State (the indices represent x and y values)
  this.chessState=deepCloneChessState(chessState);//chess state contains information about PIECES, which can be looked up via team and key (lookup values in board state).  It also holds currentTurn, ended, winner, and selectedKey values (do we still need selectedKey here?), as well as
  //REASON WE NEED NEED TO DO OBJECT.ASSIGN ABOVE IS SO THAT WHEN CHILDREN STATES ARE CHANGED, THEY DO NOT CHANGE THE PARENT STATES
  // this.parent=parent;//this represents parent game state (should be null if at beginning of game) //actually going to the take the game tree thing out of this... this should all be in the MCTS
  // this.children=[];//This represents future game states
  this.turnNumber=turnNumber;//not really used or displayed in the actual game (in canvas).. yet.
  this.legalMoves=[];//an array of movePieceObj's, each of which this.move/next_state/new_state_makeChildNode can be invoked with to actually "make" a move
  this.enemyLegalMoves=[];//not sure if actually needed, but just making this for now... may be a cool feature to show enemy moves in the future
}

Game.prototype.display= function(){//a quick and easy way to display the board on the console, without having to render to canvas (for debugging purposes)
  console.log('current turn (next move): ', this.chessState.currentTurn+'\n\n');
  // console.log('Game ended: ',this.chessState.ended, 'Winner: ', this.chessState.winner+'\n');
  let colCounter=0; let rowCounter=0;
  this.boardState.forEach(row=>{
    let rowstr='';
    row.forEach(objAtVertex=>{
      if(Object.keys(objAtVertex).length) rowstr=rowstr.concat(this.chessState[objAtVertex.team][objAtVertex.key].piece+' ')
      else rowstr=rowstr.concat('+ ');
    })
    console.log(rowstr+'\n')
  })
  console.log('\n\n\n');
}

// Game.prototype.selectPiece(piece){//honestly, i think this is useless.. unless you decide to actually incorporate this into the chess_board and canvas
//   if(this.chessState.currentTurn !== piece.team) throw(`an attempt was made to select a piece from team ${piece.team} that is not supposed to be moving at the currentTurn: ${this.chessState.currentTurn}`);//May get rid of this later if I find a need to somehow select pieces from a team not on the current Turn for whatever reason
//   this.chessState.selectedKey=piece.key;
// }

Game.prototype.populateLegalMoves= function(){
  console.log('populating move for ',this.chessState.currentTurn)
  this.populateLegalMovesforTeam(this.chessState.currentTurn);
  // console.log('should be returning this ',this.legalMoves)
  return this.legalMoves;
}

Game.prototype.populateLegalMovesforTeam= function(team){
  let legalMoves= new LegalMoves({chessState: this.chessState, boardState: this.boardState});
  let arrToPop=[];

  for(let key in this.chessState[team]){
    let currentPiece= this.chessState[team][key];
    let allMoveObjsforPiece= legalMoves.get(currentPiece).legalMoves
      .map(locObj=>{
        return this.createMove(currentPiece,locObj)
      })
    arrToPop= arrToPop.concat(allMoveObjsforPiece)
  }

  if(team===this.chessState.currentTurn) this.legalMoves=arrToPop;
  else this.enemyLegalMoves=arrToPop;

  return team===this.chessState.currentTurn ? this.legalMoves : this.enemyLegalMoves;
}

Game.prototype.createMove= function(piece,targetLocObj){//create movePieceObj for this.move/next_state/new_state_makeChildNode
  return { selectedPieceLookupVal: {key: piece.pieceKey, team: piece.team }, targetLoc: targetLocObj }
}

Game.prototype.move= function(movePieceObj){//movePieceObj-> { selectedPieceLookupVal: {...}, targetLoc: {x:... , y:... } } //this will NOT change the turn after moving (need to invoke next_state to incorporate both movement and turn change)
  /*
  remember selectedPieceLookupVal (and other objects in the boardState) represents *lookup* values to get the actual piece values in chessState
  (which can be used to repopulate/update the boardState from util.js when there are changes to the piece values in chessState, to keep the chessState
  as the single source of truth)...
  but since that is resource intensive (populating entire board), we are not going to do that here even though we do that on the canvas
  Instead this function will manually change only what is required on the boardState and chessState.  Thus, the computer will not have to
  do too many extra/unnecessary calculations during the monte carlo tree search
  */
  let targetPiece;//represents (targetted) piece object in chessState (IF the targetted location at boardState actually contains a lookup value that points to a piece object in chessState)
  let targetLoc= movePieceObj.targetLoc; let newx= targetLoc.x; let newy= targetLoc.y;

  let selectedPieceLookupVal= movePieceObj.selectedPieceLookupVal;
  let selectedPiece= this.chessState[selectedPieceLookupVal.team][selectedPieceLookupVal.key];//represents the (selected) piece object in chessState (which boardState lookup values are used to find), not boardState
  let origLoc= {x: selectedPiece.x, y: selectedPiece.y}; let oldx= origLoc.x; let oldy= origLoc.y;

  let lookupValAtTarget= this.boardState[newy][newx];//may be an empty object if no piece there

  if(!Object.keys(lookupValAtTarget).length){
    this.boardState[newy][newx]= selectedPieceLookupVal;//if nothing found at that new location, have it point to the selectedPieceLookupVal
    this.boardState[oldy][oldx]= {};//now have the old location point to an empty object
    selectedPiece.x= newx; selectedPiece.y= newy//now that boardState has changed to reflect the new position of the piece, change the selectedPiece in chessState to match board state
  }
  else{//if new location contains a lookup value, do the same as above, except also change the targetPiece (in chessState) to have the value false for its status
    this.boardState[newy][newx]= selectedPieceLookupVal;
    this.boardState[oldy][oldx]= {};
    selectedPiece.x= newx; selectedPiece.y= newy;
    targetPiece= this.chessState[lookupValAtTarget.team][lookupValAtTarget.key];
    if(targetPiece.team=== selectedPiece.team) throw('BUG FOUND: An attempt was made to move piece to the position of a friendly piece. LegalMoves should have prevented this!')
    //LegalMoves.get should never return moves containing an illegal one like this (moving a piece to a location inhabited by another friendly piece)..
    //but I thought I'd put this here anyway just in case
    this.deactivatePiece(targetPiece);//the targetted (enemy) piece should now be deactivated
  }
}

Game.prototype.next_state= function(movePieceObj){//movePieceObj-> { selectedPieceLookupVal: {...}, targetLoc: {x:... , y:... } }
  //this is for playing the game without making a game tree (so no making new game tree nodes or anything.. just one game node whose values are modified at each move)
  if(movePieceObj.selectedPieceLookupVal.team!== this.chessState.currentTurn) console.error(`Caution: team ${movePieceObj.selectedPieceLookupVal.team} is making a move when it should be team ${this.chessState.currentTurn}'s turn!`);
  this.move(movePieceObj);
  this.changeTurn();
  this.checkWinner();
  return this;//so you can change methods (e.g., game.next_state(move1).next_state(move2) etc.)
}

// Game.prototype.next_state_makeChildNode= function(movePieceObj){
// //need a check later on to make sure the parent hasn't already created an identical child earlier
//   if(movePieceObj.selectedPieceLookupVal.team!== this.chessState.currentTurn) console.error(`Caution: team ${movePieceObj.selectedPieceLookupVal.team} is making a move when it should be team ${this.chessState.currentTurn}'s turn!`);
//   let newGameInstance=new Game(this.boardState, this.chessState, this, this.turnNumber);//to give child game state a pointer back to parent
//   newGameInstance.move(movePieceObj);//move the piece to new location (and deactivate if enemy piece is there)
//   newGameInstance.changeTurn();
//   newGameInstance.checkWinner();
//   this.children.push(newGameInstance);//so parent will have a pointer to this child state
//
//   return newGameInstance
// }

Game.prototype.evaluate= function(){//if it's simply too resource intensive for MCTS to simulate all the way to a win or a loss, this can be used to evaluate who is *winning* or *losing*
  let redScore=0; let blackScore=0; let total;
  for(let key in this.chessState.red){
    let piece=this.chessState.red[key];
    // console.log('pieec ',piece, 'status',piece.status)
    if(piece.status){
      switch(piece.piece){
        case PIECE_GUARD:
        redScore+= 2;
          break;
        case PIECE_CAVALIER:
        redScore+= 4;
          break;
        case PIECE_ELEPHANT:
        redScore+= 2;
          break;
        case PIECE_CHARIOT:
        redScore+= 9;
          break;
        case PIECE_CANNON:
        redScore+= 4.5;
          break;
        case PIECE_SOLDIER://I should add a special property to the soldier pieces that can tell you if they are across river or not.. that way i can adjust score (1 for not cross, 2 for cross)
        redScore+= 1.5;
          break;
      }
    }
    if(piece.piece=== PIECE_GENERAL && !piece.status) return {redScore: 0, blackScore: 1};
  }
  for(let key in this.chessState.black){
    let piece=this.chessState.black[key];
    if(piece.status){
      switch(piece.piece){
        case PIECE_GUARD:
        blackScore+= 2;
          break;
        case PIECE_CAVALIER:
        blackScore+= 4;
          break;
        case PIECE_ELEPHANT:
        blackScore+= 2;
          break;
        case PIECE_CHARIOT:
        blackScore+= 9;
          break;
        case PIECE_CANNON:
        blackScore+= 4.5;
          break;
        case PIECE_SOLDIER://I should add a special property to the soldier pieces that can tell you if they are across river or not.. that way i can adjust score (1 for not cross, 2 for cross)
        blackScore+= 1.5;
          break;
      }
    }
    if(piece.piece=== PIECE_GENERAL && !piece.status) return {redScore: 1, blackScore: 0};
  }
  console.log('redscore: ', redScore, 'blackScore: ', blackScore)
  total= redScore+blackScore;
  return {redScore: redScore/(total), blackScore: blackScore/(total)};
}

Game.prototype.changeTurn= function(){
  this.chessState.currentTurn= this.chessState.currentTurn=== 'red' ? 'black' : 'red';
  this.turnNumber+=1;
}

Game.prototype.deactivatePiece= function(piece){
  piece.status= false;
}

Game.prototype.checkWinner= function(){
  if(!this.chessState.red.GEN.status) this.declareWinner('black')
  else if(!this.chessState.black.GEN.status) this.declareWinner('red');
}

Game.prototype.declareWinner= function(team){
  this.chessState.ended=true;
  this.chessState.winner=team;
}
