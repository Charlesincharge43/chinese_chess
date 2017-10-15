

var PIECE_GENERAL = 0;
var PIECE_GUARD = 1;
var PIECE_CAVALIER = 2;
var PIECE_ELEPHANT = 3;
var PIECE_CHARIOT = 4;
var PIECE_CANNON = 5;
var PIECE_SOLDIER = 6

function LegalMoves (state, constants){
  this.state=state;
  this.constants=constants;//{PIECE_GENERAL: 0, PIECE_GUARD: 1} etc...   //maybe implement this later
}

LegalMoves.prototype.getFinal=function(selectedPiece){// IF YOU HAVE TIME... do this part for the checkmate and checking logic

}

LegalMoves.prototype.get= function(piece){
  let arrMoves= {legalMoves:[], pathMoves:[]};
  if (this.state.chessState.ended) return arrMoves
  //should look like { legalMoves: [{x:1,y:1},{x:1,y:2}] , pathMoves: {x:1,y:0}]  }
  //legalMoves are moves you can make.. .pathMoves are to visually demonstrate the path (for units like elephant and cavs that can be blocked)
  //legalMoves are used by the AI and humans, pathMoves are only used as visual markers to aid humans (and not used by AI)
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

    case PIECE_ELEPHANT:
    arrMoves= this.getEleMoves(piece);
    break;

    case PIECE_CANNON:
    arrMoves= this.getCannonMoves(piece);
    break;

    case PIECE_GUARD:
    arrMoves= this.getGuardMoves(piece);
    break;

    case PIECE_GENERAL:
    arrMoves= this.getGenMoves(piece);
    break;
  }

  arrMoves.pathMoves= !arrMoves.pathMoves ? [] : arrMoves.pathMoves;//better way to do this?
  // console.log(arrMoves);
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
    if(piece.y>4){
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

LegalMoves.prototype.getEleMoves= function(piece){
  return this.getEleMovesRec({x: piece.x, y:piece.y}, null, 0, piece.team);
}

LegalMoves.prototype.getEleMovesRec= function(locObj, dir, step, team, arrLegalMoves=[], arrPathMoves=[]){
  let x=locObj.x; let y=locObj.y;
  let [moveNE,moveSE,moveSW,moveNW]=[{x: x+1, y: y-1},{x: x+1, y: y+1},{x: x-1, y: y+1},{x: x-1, y: y-1}];
  let [withinTopBorder,withinDownBorder,withinLeftBorder,withinRightBorder]=
  [
    team === 'black' ? (moveNE.y>=0 && moveNW.y>=0) : (moveNE.y>=5 && moveNW.y>=5),
    team === 'red' ? (moveSE.y<=9 && moveSW.y<=9) : (moveSE.y<=5 && moveSW.y<=4),
    moveNW.x>=0 && moveSW.x>=0,
    moveNE.x<=8 && moveSE.x<=8,
  ];

  let [pieceOnPathNE, pieceOnPathSE, pieceOnPathNW, pieceOnPathSW] =
  [
    withinRightBorder && withinTopBorder && this.getPieceAtXY(moveNE),
    withinRightBorder && withinDownBorder && this.getPieceAtXY(moveSE),
    withinLeftBorder && withinTopBorder && this.getPieceAtXY(moveNW),
    withinLeftBorder && withinDownBorder && this.getPieceAtXY(moveSW),
  ]
  let canMoveNE= pieceOnPathNE && (step === 1 && pieceOnPathNE.team === team || step === 0) ? false : withinRightBorder && withinTopBorder ? true : false;
  let canMoveSE= pieceOnPathSE && (step === 1 && pieceOnPathSE.team === team || step === 0) ? false : withinRightBorder && withinDownBorder ? true : false;
  let canMoveNW= pieceOnPathNW && (step === 1 && pieceOnPathNW.team === team || step === 0) ? false : withinLeftBorder && withinTopBorder ? true : false;
  let canMoveSW= pieceOnPathSW && (step === 1 && pieceOnPathSW.team === team || step === 0) ? false : withinLeftBorder && withinDownBorder ? true : false;

  if(step===0){
    if(canMoveNE) this.getEleMovesRec(moveNE,'NE',step+1, team, arrLegalMoves, arrPathMoves);
    if(canMoveSE) this.getEleMovesRec(moveSE,'SE',step+1, team, arrLegalMoves, arrPathMoves);
    if(canMoveNW) this.getEleMovesRec(moveNW,'NW',step+1, team, arrLegalMoves, arrPathMoves);
    if(canMoveSW) this.getEleMovesRec(moveSW,'SW',step+1, team, arrLegalMoves, arrPathMoves);
  }
  else if(step===1){
    arrPathMoves.push(locObj);
    if(dir==='NE' && canMoveNE) arrLegalMoves.push(moveNE);
    if(dir==='SE' && canMoveSE) arrLegalMoves.push(moveSE);
    if(dir==='NW' && canMoveNW) arrLegalMoves.push(moveNW);
    if(dir==='SW' && canMoveSW) arrLegalMoves.push(moveSW);
  }
  return {legalMoves: arrLegalMoves, pathMoves: arrPathMoves};
}

LegalMoves.prototype.getCannonMoves= function(piece){
  let arrMoves= {legalMoves: [], pathMoves: [], screens: []};
  let cannonMovesInitial= this.getCannonMovesRec({x: piece.x, y:piece.y}, null, 0, piece.team);
  arrMoves.legalMoves= arrMoves.legalMoves.concat(cannonMovesInitial.legalMoves);
  arrMoves.screens= arrMoves.screens.concat(cannonMovesInitial.screens);
  arrMoves.screens.forEach(screenPiece=>{
    let jumpMoves=this.getCannonJumpMovesRec({x: screenPiece.piece.x, y: screenPiece.piece.y}, screenPiece.dir, 0, piece.team);
    arrMoves.legalMoves = arrMoves.legalMoves.concat(jumpMoves.legalMoves);
    arrMoves.pathMoves = arrMoves.pathMoves.concat(jumpMoves.pathMoves);
  })
  return arrMoves;
}

LegalMoves.prototype.getCannonMovesRec= function(locObj, dir, step, team, arrLegalMoves=[], screens){
  let x=locObj.x; let y=locObj.y;
  let [moveUp,moveDown,moveLeft,moveRight]=[{x, y: y-1},{x, y: y+1},{x: x-1, y},{x: x+1, y}];
  let [withinTopBorder,withinDownBorder,withinLeftBorder,withinRightBorder] = [moveUp.y>=0,moveDown.y<=9,moveLeft.x>=0,moveRight.x<=8];
  let [pieceOnPathUp, pieceOnPathDown, pieceOnPathLeft, pieceOnPathRight] = [withinTopBorder && this.getPieceAtXY(moveUp),withinDownBorder && this.getPieceAtXY(moveDown),withinLeftBorder && this.getPieceAtXY(moveLeft),withinRightBorder && this.getPieceAtXY(moveRight)];

  let canMoveUp= pieceOnPathUp ? false : withinTopBorder ? true : false;
  let canMoveDown= pieceOnPathDown ? false : withinDownBorder ? true : false;
  let canMoveLeft= pieceOnPathLeft ? false : withinLeftBorder ? true :  false;
  let canMoveRight= pieceOnPathRight ? false : withinRightBorder ? true : false;

  if(step===0){
    screens=[{piece: pieceOnPathUp, dir: 'up'}, {piece: pieceOnPathDown, dir: 'down'}, {piece: pieceOnPathLeft, dir: 'left'}, {piece: pieceOnPathRight, dir: 'right'}].filter(element => element.piece);//need filter out all falsy elements
    if(canMoveUp) this.getCannonMovesRec(moveUp,'up',step+1, team, arrLegalMoves, screens);
    if(canMoveDown) this.getCannonMovesRec(moveDown,'down',step+1, team, arrLegalMoves, screens);
    if(canMoveLeft) this.getCannonMovesRec(moveLeft,'left',step+1, team, arrLegalMoves, screens);
    if(canMoveRight) this.getCannonMovesRec(moveRight,'right',step+1, team, arrLegalMoves, screens);
    return {legalMoves: arrLegalMoves, screens};
  }
  else if(step>0){
    arrLegalMoves.push(locObj);
    if(dir=== 'up'){
      if(canMoveUp) this.getCannonMovesRec(moveUp,'up',step+1, team, arrLegalMoves, screens);
      else if(pieceOnPathUp) screens.push({piece: pieceOnPathUp, dir: 'up'});
    }
    else if(dir=== 'down'){
      if(canMoveDown) this.getCannonMovesRec(moveDown,'down',step+1, team, arrLegalMoves, screens);
      else if(pieceOnPathDown) screens.push({piece: pieceOnPathDown, dir: 'down'});
    }
    else if(dir=== 'left'){
      if(canMoveLeft) this.getCannonMovesRec(moveLeft,'left',step+1, team, arrLegalMoves, screens);
      else if(pieceOnPathLeft) screens.push({piece: pieceOnPathLeft, dir: 'left'});
    }
    else if(dir=== 'right'){
      if(canMoveRight) this.getCannonMovesRec(moveRight,'right',step+1, team, arrLegalMoves, screens);
      else if(pieceOnPathRight) screens.push({piece: pieceOnPathRight, dir: 'right'});
    }
  }
}

LegalMoves.prototype.getCannonJumpMovesRec= function(locObj, dir, step, team, arrLegalMoves=[], arrPathMoves=[]){
  let x=locObj.x; let y=locObj.y;
  let [moveUp,moveDown,moveLeft,moveRight]=[{x, y: y-1},{x, y: y+1},{x: x-1, y},{x: x+1, y}];
  let [withinTopBorder,withinDownBorder,withinLeftBorder,withinRightBorder] = [moveUp.y>=0,moveDown.y<=9,moveLeft.x>=0,moveRight.x<=8];
  let [pieceOnPathUp, pieceOnPathDown, pieceOnPathLeft, pieceOnPathRight] = [withinTopBorder && this.getPieceAtXY(moveUp),withinDownBorder && this.getPieceAtXY(moveDown),withinLeftBorder && this.getPieceAtXY(moveLeft),withinRightBorder && this.getPieceAtXY(moveRight)];

  let canPathMoveUp= pieceOnPathUp ? false : withinTopBorder ? true : false;
  let canPathMoveDown= pieceOnPathDown ? false : withinDownBorder ? true : false;
  let canPathMoveLeft= pieceOnPathLeft ? false : withinLeftBorder ? true :  false;
  let canPathMoveRight= pieceOnPathRight ? false : withinRightBorder ? true : false;

  arrPathMoves.push(locObj);

  if(dir=== 'up'){
    if(canPathMoveUp) this.getCannonJumpMovesRec(moveUp,'up',step+1, team, arrLegalMoves, arrPathMoves);
    else if(pieceOnPathUp && pieceOnPathUp.team !== team) arrLegalMoves.push(moveUp);
  }
  else if(dir=== 'down'){
    if(canPathMoveDown) this.getCannonJumpMovesRec(moveDown,'down',step+1, team, arrLegalMoves, arrPathMoves);
    else if(pieceOnPathDown && pieceOnPathDown.team !== team) arrLegalMoves.push(moveDown);
  }
  else if(dir=== 'left'){
    if(canPathMoveLeft) this.getCannonJumpMovesRec(moveLeft,'left',step+1, team, arrLegalMoves, arrPathMoves);
    else if(pieceOnPathLeft && pieceOnPathLeft.team !== team) arrLegalMoves.push(moveLeft);
  }
  else if(dir=== 'right'){
    if(canPathMoveRight) this.getCannonJumpMovesRec(moveRight,'right',step+1, team, arrLegalMoves, arrPathMoves);
    else if(pieceOnPathRight && pieceOnPathRight.team !== team) arrLegalMoves.push(moveRight);
  }
  return step===0 && {legalMoves: arrLegalMoves, pathMoves: arrPathMoves};
}

LegalMoves.prototype.getGuardMoves= function(piece){
  let arrMoves = {legalMoves: []};
  let potentialMoves=
  (piece.x===3 && piece.y===0) ||
  (piece.x===5 && piece.y===0) ||
  (piece.x===3 && piece.y===2) ||
  (piece.x===5 && piece.y===2) ? [{x: 4,y: 1}] :
  (piece.x===3 && piece.y===7) ||
  (piece.x===5 && piece.y===7) ||
  (piece.x===3 && piece.y===9) ||
  (piece.x===5 && piece.y===9) ? [{x: 4,y: 8}] :
  (piece.x===4 && piece.y===1) ? [{x: 3,y: 0},{x: 5,y: 0},{x: 3,y: 2},{x: 5,y: 2}] :
  (piece.x===4 && piece.y===8) && [{x: 3,y: 7},{x: 5,y: 7},{x: 3,y: 9},{x: 5,y: 9}] ;

  arrMoves.legalMoves= potentialMoves.filter(locObj=>{
  let pieceAtLoc= this.getPieceAtXY(locObj);
  return !pieceAtLoc || pieceAtLoc.team !== piece.team ? true : false;
  })
  return arrMoves;
}

LegalMoves.prototype.getGenMoves= function(piece){
  let arrMoves= {legalMoves: [], pathMoves: []};
  arrMoves.legalMoves= arrMoves.legalMoves.concat(this.getGenMovesUsual(piece).legalMoves);
  let flyingMoves= this.getFlyingGenMovesRec({x: piece.x, y: piece.y}, piece.team, 0);

  if(flyingMoves.legalMoves.length>0){
    arrMoves.legalMoves= arrMoves.legalMoves.concat(flyingMoves.legalMoves);
    arrMoves.pathMoves= arrMoves.pathMoves.concat(flyingMoves.pathMoves);//this way, only if flying general move can be made will the pathMoves be displayed
  }
  return arrMoves;
}

LegalMoves.prototype.getGenMovesUsual= function(piece){
  let x=piece.x; let y=piece.y; let arrLegalMoves=[];
  let [moveUp,moveDown,moveLeft,moveRight]=[{x, y: y-1},{x, y: y+1},{x: x-1, y},{x: x+1, y}];
  let [withinTopBorder,withinDownBorder,withinLeftBorder,withinRightBorder] =
  piece.team === 'red' ? [moveUp.y>=7,moveDown.y<=9,moveLeft.x>=3,moveRight.x<=5] : [moveUp.y>=0,moveDown.y<=2,moveLeft.x>=3,moveRight.x<=5];
  let [pieceOnPathUp, pieceOnPathDown, pieceOnPathLeft, pieceOnPathRight] = [withinTopBorder && this.getPieceAtXY(moveUp),withinDownBorder && this.getPieceAtXY(moveDown),withinLeftBorder && this.getPieceAtXY(moveLeft),withinRightBorder && this.getPieceAtXY(moveRight)];

  arrLegalMoves.push(pieceOnPathUp && pieceOnPathUp.team === piece.team ? null : withinTopBorder ? moveUp : null);
  arrLegalMoves.push(pieceOnPathDown && pieceOnPathDown.team === piece.team ? null : withinDownBorder ? moveDown : null);
  arrLegalMoves.push(pieceOnPathLeft && pieceOnPathLeft.team === piece.team ? null : withinLeftBorder ? moveLeft : null);
  arrLegalMoves.push(pieceOnPathRight && pieceOnPathRight.team === piece.team ? null : withinRightBorder ? moveRight : null);

  arrLegalMoves= arrLegalMoves.filter(el=>el);
  return {legalMoves: arrLegalMoves}
}

LegalMoves.prototype.getFlyingGenMovesRec= function(locObj, team, step, arrLegalMoves=[], arrPathMoves=[]){//should always return either an empty arrMoves, or an arrMoves with one element (the location of enemy general)
  let x=locObj.x; let y=locObj.y;
  let [moveUp, moveDown]=[{x, y: y-1},{x, y: y+1}];
  let [withinTopBorder, withinDownBorder]=[moveUp.y>=0, moveDown.y<=9];
  let [pieceOnPathUp, pieceOnPathDown]=[withinTopBorder && this.getPieceAtXY(moveUp), withinDownBorder && this.getPieceAtXY(moveDown)];

  if(step > 0) arrPathMoves.push(locObj);
  if(team==='red'){
    let canPathMoveUp= pieceOnPathUp ? false : withinTopBorder ? true : false;
    if(canPathMoveUp) this.getFlyingGenMovesRec(moveUp, team, step+1, arrLegalMoves, arrPathMoves);
    else if(pieceOnPathUp && pieceOnPathUp.piece===PIECE_GENERAL) arrLegalMoves.push(moveUp);
  }
  else {
    let canPathMoveDown= pieceOnPathDown ? false : withinDownBorder ? true : false;
    if(canPathMoveDown) this.getFlyingGenMovesRec(moveDown, team, step+1, arrLegalMoves, arrPathMoves);
    else if(pieceOnPathDown && pieceOnPathDown.piece===PIECE_GENERAL) arrLegalMoves.push(moveDown);
  }
  if(step === 0){
    return {legalMoves: arrLegalMoves, pathMoves: arrPathMoves}
  }
}

LegalMoves.prototype.getPieceAtXY= function(locObj){//not very dry.. this is repeated in utils... how to fix this?
  let x=locObj.x;
  let y=locObj.y;
  let lookup= this.state.boardState[y][x];
  if(Object.keys(lookup).length !== 0) return this.state.chessState[lookup.team][lookup.key];
  return null;
}

export default LegalMoves;
