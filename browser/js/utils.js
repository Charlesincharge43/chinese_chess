var PIECE_SIZE = 68;//size for the image blocks in the image file to scale down to for actual display
var STARTING_POINT_X= 50;
var STARTING_POINT_Y= 35;
var START_LOCOBJ= {x:STARTING_POINT_X,y:STARTING_POINT_Y}


export function UtilObj(start_loc_obj, piece_size, block_size, state, moveHitBoxesArr){
  this.moveHitBoxesArr=moveHitBoxesArr;
  this.startx=start_loc_obj.x;
  this.starty=start_loc_obj.y;
  this.piece_size=piece_size;
  this.block_size=block_size;
  this.state=state;
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
export function checkIfCoordInRect(x,y,rectX1,rectY1,rectX2,rectY2){//rectX1,rectY1 are the top left corner of rectangle, X2/Y2 are bottom right corner
  //checks if coordinate x,y is located within a rectangle
  //this is used for determining if someone clicked on a piece

  // ctx.fillStyle = "red";//use this and bottom 2 lines to debug hitbox problems (not selecting properly)
  // ctx.fillRect(x,y,10,10);
  // ctx.strokeRect(rectX1, rectY1, PIECE_SIZE, PIECE_SIZE);

  // console.log('is x: '+x+'y: '+y+'inside '+rectX1+','+rectY1+' and '+rectX2+','+rectY2)
  return ((x>rectX1 && x<rectX2)&&(y>rectY1 && y<rectY2));
}

export function populateBoard(chessState){
  const board= [
  	[{},{},{},{},{},{},{},{},{},],
  	[{},{},{},{},{},{},{},{},{},],
  	[{},{},{},{},{},{},{},{},{},],
  	[{},{},{},{},{},{},{},{},{},],
  	[{},{},{},{},{},{},{},{},{},],
  	[{},{},{},{},{},{},{},{},{},],
  	[{},{},{},{},{},{},{},{},{},],
  	[{},{},{},{},{},{},{},{},{},],
  	[{},{},{},{},{},{},{},{},{},],
  	[{},{},{},{},{},{},{},{},{},],
  ]
	for(let key in chessState.black){
		let piece=chessState.black[key];
		if(piece.status===true) board[piece.y][piece.x]={team: 'black', key};
	}
	for(let key in chessState.red){
		let piece=chessState.red[key];
		if(piece.status===true) board[piece.y][piece.x]={team: 'red', key};
	}
  return board;
}

export function deepCloneChessState(chessState){

  const newChessState = Object.assign({}, chessState);
  newChessState.black = Object.assign({}, chessState.black);
  newChessState.red = Object.assign({}, chessState.red);
  Object.keys(chessState.black).forEach((key)=>{
    newChessState.black[key]=Object.assign({}, chessState.black[key]);
  });
  Object.keys(chessState.red).forEach((key)=>{
    newChessState.red[key]=Object.assign({}, chessState.red[key]);
  })
  return newChessState;
}

export function deepCloneBoardState(boardState){
  let newBoardState=boardState.slice(0);//copy outer array
  for (let i = 0; i < boardState.length; i++){
    newBoardState[i]= newBoardState[i].slice(0);//copy inner array
    for (let j = 0; j < newBoardState[i].length; j++){
      newBoardState[i][j]=Object.assign({},newBoardState[i][j]);//copy object
    }
  }
  return newBoardState;
}

export function shuffle(arr) {
    for (let i = arr.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [arr[i - 1], arr[j]] = [arr[j], arr[i - 1]];
    }
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

UtilObj.prototype.snapToVertex= function(clickedLocObj){//takes in clickLocObj, representing where user clicked, and returns
  //snappedCoord (it's basically clickedLocObj, but "centered to a vertex" that is the center of a moveHitBox)
  let snappedX,
      snappedY,
      snappedCoord;

  for(let hitBoxSqObj of this.moveHitBoxesArr){
    if(checkIfCoordInRect(
      clickedLocObj.x, clickedLocObj.y,//coordinate of where user clicked
      hitBoxSqObj.x1, hitBoxSqObj.y1,//coordinate of top left corner of movehitbox
      hitBoxSqObj.x2, hitBoxSqObj.y2)//coordinate of bottom right corner of movehitbox
    )
    {
      snappedX= hitBoxSqObj.xCent;
      snappedY= hitBoxSqObj.yCent;
      snappedCoord= {x:snappedX, y:snappedY};
      return snappedCoord;
    }
  }
}


//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

UtilObj.prototype.convertStateXY= function(locObj){
  let x=locObj.x
  let y=locObj.y
  let canvX= this.startx+x * this.block_size;
  let canvY= this.starty+y * this.block_size;
  // console.log(canvX, canvY)
  return {x: canvX, y:canvY};
}

UtilObj.prototype.convertCanvXY= function(canvLocObj){//convert something like 37.33,37.33 to 0,0 (or whatever coordinate representing the x,y coord in state is)
  let x= (canvLocObj.x-this.startx)/this.block_size;
  let y= (canvLocObj.y-this.starty)/this.block_size;
  // console.log(canvLocObj)
  return {x,y};
}


//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

//NEED TO ABSTRACT THE CONVERTED THING PART OUT TO CHESS_BOARD

//rename this asap!  this function only returns top left corner for piece hitbox

UtilObj.prototype.topLeftCorner=function(locObj){
  let x=locObj.x; let y=locObj.y
  return {x:x-(this.piece_size/2), y:y-(this.piece_size/2)};
}


//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

UtilObj.prototype.getPieceAtCanvXY=function(clickedlocObj, currentTeam){
  let canvCoord= this.snapToVertex(clickedlocObj);
  // console.log(clickedlocObj)
  let stateXY= this.convertCanvXY(canvCoord);
  // console.log(this.convertCanvXY(canvCoord));
  let clickedPiece= this.getPieceAtXY(stateXY)
  if(clickedPiece && currentTeam)  return clickedPiece.team=== currentTeam ? this.getPieceAtXY(stateXY) : null;
  return clickedPiece;
}

UtilObj.prototype.getPieceAtXY= function(locObj){
	let x=locObj.x;
	let y=locObj.y;
  // console.log(this.state)
  // console.log(this.state.boardState[y][x])
	let lookup= this.state.boardState[y][x];
  // console.log('lookup is ',this.state.boardState)
  if(Object.keys(lookup).length !== 0) return this.state.chessState[lookup.team][lookup.key];
  return null;
}

UtilObj.prototype.getPieceAtBlock= function(clickedLocObj, team)//LocObj and State are necessary, team is optional (to narrow down search)
{

    let stateToPass=this.state;
    if(team) stateToPass= {[team]: this.state[team]}//again, to speed up the search by half

    return this.getPieceAtBlockForTeam(clickedLocObj, stateToPass);
}

UtilObj.prototype.getPieceAtBlockForTeam= function(clickedLocObj, passedState)//just divided it out into teams do dont have to go through both teams
{
  console.log('passedState is ',passedState)
    var curPiece = null,
        pieceAtBlock = null,
        pieceCoord;

    for(let teamKey in passedState){
      for (let pieceKey in passedState[teamKey])
      {

        curPiece=passedState[teamKey][pieceKey];

        pieceCoord= this.topLeftCorner(this.convertStateXY({x:curPiece.x,y:curPiece.y}))

        // ctx.strokeRect(pieceCoord.x, pieceCoord.y, PIECE_SIZE, PIECE_SIZE); // uncomment to test if hitboxes are in the right
        // locations!!!(just click a piece to show it after you uncomment)

        let inhitBoxBool = checkIfCoordInRect(
          clickedLocObj.x, clickedLocObj.y,//coordinate of where user clicked
          pieceCoord.x, pieceCoord.y,//coordinate of top left corner of piece hitbox
          pieceCoord.x+this.piece_size, pieceCoord.y+this.piece_size)//coordinate of bottom right corner of piece hitbox
          // console.log(inhitBoxBool);
          if (curPiece.status === true && inhitBoxBool)
          {
            pieceAtBlock = curPiece;
            break;
          }
      }
    }
    console.log('should be returning pieceat block which is ', pieceAtBlock)

    return pieceAtBlock;
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
