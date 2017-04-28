

var PIECE_GENERAL = 0;
var PIECE_GUARD = 1;
var PIECE_CAVALIER = 2;
var PIECE_ELEPHANT = 3;
var PIECE_CHARIOT = 4;
var PIECE_CANNON = 5;
var PIECE_SOLDIER = 6

function LegalMoves (state, constants){
  this.state=state;
  this.constants=constants;//{PIECE_GENERAL: 0, PIECE_GUARD: 1} etc...
}

LegalMoves.prototype.getFinal=function(selectedPiece){

}

LegalMoves.prototype.get= function(piece){
  let arrMoves;//should look like { legalMoves: [{x:1,y:1},{x:1,y:2}] , pathMoves: {x:1,y:0}]  } //legalMoves are moves you can make.. .pathMoves are to visually demonstrate the path (for units like elephant and cavs that can be blocked)
  switch (piece.piece){
    case PIECE_SOLDIER:
    arrMoves= this.getSoldierMoves(piece);
    break;

    case PIECE_CHARIOT:
    arrMoves= this.getCharMoves(piece);
    break;

    case PIECE_CAVALIER:
    arrMoves= this.getCavMoves(piece);
    break;
  }
  console.log(arrMoves);
  return arrMoves;
}

LegalMoves.prototype.getSoldierMoves= function(piece){
  // console.log('showing legal moves for PIECE_SOLDIER',piece.piece, ', team ', piece)
  let crossedRiver;
  let arrMoves=[];
  if(piece.team==='red'){
    piece.y-1>=0 && arrMoves.push({x:piece.x,y:piece.y-1});
    if(piece.y<5){
      piece.x+1<=8 && arrMoves.push({x:piece.x+1,y:piece.y});
      piece.x-1>=0 && arrMoves.push({x:piece.x-1,y:piece.y});
    }
    for(let i=0;i<arrMoves.length;i++){
      if(this.getPieceAtXY(arrMoves[i]) && this.getPieceAtXY(arrMoves[i]).team==='red'){arrMoves.splice(i,1); i--;}

    }
  }
  else {
    piece.y+1<=9 && arrMoves.push({x:piece.x,y:piece.y+1});
    if(piece.y>5){
      piece.x+1<=8 && arrMoves.push({x:piece.x+1,y:piece.y});
      piece.x-1>=0 && arrMoves.push({x:piece.x-1,y:piece.y});
    }
    for(let i=0;i<arrMoves.length;i++){
      if(this.getPieceAtXY(arrMoves[i]) && this.getPieceAtXY(arrMoves[i]).team==='black'){arrMoves.splice(i,1); i--;}
    }
  }

  return {legalMoves: arrMoves}
}

LegalMoves.prototype.getCharMoves= function(piece){
  let arrMoves=[];
  //go up
  for(let y=piece.y-1; y>=0; y--){
    let pieceOnPath= this.getPieceAtXY({x: piece.x, y});
    if(pieceOnPath){
      if(pieceOnPath.team===piece.team) break;//if someone on the same team is encountered on the path, break (stop traveling further)
      else {
        arrMoves.push({x: piece.x, y});
        break;
      }
    }
    arrMoves.push({x: piece.x, y});
  }

  //go down
  for(let y=piece.y+1; y<=9; y++){
    let pieceOnPath= this.getPieceAtXY({x: piece.x, y});
    if(pieceOnPath){
      if(pieceOnPath.team===piece.team) break;//if someone on the same team is encountered on the path, break (stop traveling further)
      else {
        arrMoves.push({x: piece.x, y});
        break;
      }
    }
    arrMoves.push({x: piece.x, y});
  }

  //go left
  for(let x=piece.x-1; x>=0; x--){
    let pieceOnPath= this.getPieceAtXY({x, y:piece.y});
    if(pieceOnPath){
      if(pieceOnPath.team===piece.team) break;//if someone on the same team is encountered on the path, break (stop traveling further)
      else{
        arrMoves.push({x, y:piece.y});
        break;
      }
    }
    arrMoves.push({x, y:piece.y});
  }

  //go right
  for(let x=piece.x+1; x<=8; x++){
    let pieceOnPath= this.getPieceAtXY({x, y:piece.y});
    if(pieceOnPath){
      if(pieceOnPath.team===piece.team) break;//if someone on the same team is encountered on the path, break (stop traveling further)
      else{
        arrMoves.push({x, y:piece.y});
        break;
      }
    }
    arrMoves.push({x, y:piece.y});
  }
  return {legalMoves: arrMoves};
}

LegalMoves.prototype.getCavMoves= function(piece){
  // let arrMoves=[]
  return this.getCavMovesRec({x: piece.x, y:piece.y}, null, 0, piece.team);
}

LegalMoves.prototype.getCavMovesRec= function(locObj, dir, step, team, arrLegalMoves=[], arrPathMoves=[]){//pathMoves are purely to visualize the path (not endpoint which are the legal moves)
  let x=locObj.x; let y=locObj.y;
  let [moveUp,moveDown,moveLeft,moveRight]=[{x, y: y-1},{x, y: y+1},{x: x-1, y},{x: x+1, y}];
  let [withinTopBorder,withinDownBorder,withinLeftBorder,withinRightBorder]=[moveUp.y>=0,moveDown.y<=9,moveLeft.x>=0,moveRight.x<=8];
  let [pieceOnPathUp, pieceOnPathDown, pieceOnPathLeft, pieceOnPathRight] = [withinTopBorder && this.getPieceAtXY(moveUp),withinDownBorder && this.getPieceAtXY(moveDown),withinLeftBorder && this.getPieceAtXY(moveLeft),withinRightBorder &&this.getPieceAtXY(moveRight)];
  let canMoveUp= pieceOnPathUp && (step === 2 && pieceOnPathUp.team === team || step < 2) ? false : withinTopBorder ? true : false;
  let canMoveDown= pieceOnPathDown && (step === 2 && pieceOnPathDown.team === team || step < 2) ? false : withinDownBorder ? true : false;
  let canMoveLeft= pieceOnPathLeft && (step === 2 && pieceOnPathLeft.team === team || step < 2) ? false : withinLeftBorder ? true :  false;
  let canMoveRight= pieceOnPathRight && (step === 2 && pieceOnPathRight.team === team || step < 2) ? false : withinRightBorder ? true : false;

  if(step===0){
    if(canMoveUp) this.getCavMovesRec(moveUp,'up',step+1, team, arrLegalMoves, arrPathMoves); //up
    if(canMoveDown) this.getCavMovesRec(moveDown,'down',step+1, team, arrLegalMoves, arrPathMoves);//down
    if(canMoveLeft) this.getCavMovesRec(moveLeft,'left',step+1, team, arrLegalMoves, arrPathMoves);//left
    if(canMoveRight) this.getCavMovesRec(moveRight,'right',step+1, team, arrLegalMoves, arrPathMoves);//right
  }
  else if(step===1){//on step one
    arrPathMoves.push(locObj)//pathMoves are purely to visualize the path (not endpoint which are the legal moves)
    if(dir==='up' && canMoveUp) this.getCavMovesRec(moveUp,'up',step+1, team, arrLegalMoves, arrPathMoves);
    if(dir==='down' && canMoveDown) this.getCavMovesRec(moveDown,'down',step+1, team, arrLegalMoves, arrPathMoves);
    if(dir==='left' && canMoveLeft) this.getCavMovesRec(moveLeft,'left',step+1, team, arrLegalMoves, arrPathMoves);
    if(dir==='right' && canMoveRight) this.getCavMovesRec(moveRight,'right',step+1, team, arrLegalMoves, arrPathMoves);
  }
  else if(step===2){//on step two
    arrPathMoves.push(locObj)//pathMoves are purely to visualize the path (not endpoint which are the legal moves)
    if(dir==='up' || dir==='down'){
      if(canMoveLeft) arrLegalMoves.push(moveLeft);
      if(canMoveRight) arrLegalMoves.push(moveRight);
    }
    else if(dir==='left' || dir==='right'){
      if(canMoveUp) arrLegalMoves.push(moveUp);
      if(canMoveDown) arrLegalMoves.push(moveDown);
    }
  }
  return {legalMoves: arrLegalMoves, pathMoves: arrPathMoves};
}



LegalMoves.prototype.getPieceAtXY= function(locObj){//not very dry.. this is repeated in utils... how to fix this?
  console.log('locObj is ', locObj)
  let x=locObj.x;
  let y=locObj.y;
  let lookup= this.state.boardState[y][x];
  if(Object.keys(lookup).length !== 0) return this.state.chessState[lookup.team][lookup.key];
  return null;
}

export default LegalMoves;
