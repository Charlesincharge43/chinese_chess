import { CONNECT, UPDATE_PIECES, UPDATE_TURN, NEW_PLAYER } from './constants'; //remember you can't import or export client side... need node
// import initialState from './defaultState'; //NO LONGER USING THIS
import {store, change_CH_State_AC, change_CH_Key_AC, change_CH_Turn_AC, change_CH_State_Everything_AC, chessStateReducer} from '../react/store';
import { socketEmitCreator } from '../react/socket';

var NUMBER_OF_ROWS = 9;
var NUMBER_OF_COLS = 8;
var BLACK='#000000';
var BLOCK_COLOUR_1= '#FFC377';//normal color
var BLOCK_COLOUR_2= '#FFFFFF';//river color
// var BLOCK_COLOUR_3= '#FFD094';
var BLOCK_COLOUR_3= '#FFDAAA';//palace color
var STARTING_POINT_X= 50;// X coord for where to start drawing the board (top left corner)
var STARTING_POINT_Y= 35;// Y coord for where to start drawing the board (top left corner)
var IMAGE_SIZE = 300;//size of image blocks on the original image file (for drawImage..)
var PIECE_SIZE = 68;//size for the image blocks in the image file to scale down to for actual display
var SELECT_LINE_WIDTH = 3;
var HIGHLIGHT_COLOUR = '#FF0000';
var TEST_COLOUR = '#D2FF94';
var IN_PLAY = true;
var BLOCK_SIZE;

//MOVE THESE GLOBAL VARIABLES TO THE STORE AS SOON AS YOU GET REDUX WORKING
var selectedKey = null;// CHANGE THIS ASAP... DON'T LIKE  THE IDEA OF CHANGEABLE GLOBAL VARS BEING USED LIKE THIS
var state={};
var playerTeam=null;

var moveHitBoxesArr=[];//this will populated by moveHitBoxes() in draw()
var canvasVar;
var pieces;
var ctx;

export const draw = function(canvas)
{
  canvasVar= canvas;//YES VERY HACKY WAY OF DOING THIS... WHEN I CHANGE EVERYTHING TO BE METHODS OF AN OBJECT
  //I'LL CHANGE IT BUT FOR NOW I JUST WANT THINGS WORKING

    // Main entry point got the HTML5 chess board example
    // canvas = document.getElementById('chess'); //no longer need, because canvas is passed in from Canvas component

    // Canvas supported?
    if(canvas.getContext)
    {
        ctx = canvas.getContext('2d');// all this is doing is saying the canvas will be in 2d
        ctx.clearRect(0, 0, canvas.width, canvas.height);//putting this here temporarily, so no need to use redraw()
        //draw will now be invoked multiple times so yeah.. you need to reset by clearing the canvas and then redrawing

        // Calculate the precise block size
        BLOCK_SIZE = canvas.height * 0.85 / NUMBER_OF_ROWS;

        //self explanatory
        loadStatefromStore();

        // Draw the background
        drawBoard();

        // defaultPositions();//MYSTERY SOLVED... DEFAULT POSITIONS!!!!  You were running default positions!!!  THATS WHY THINGS WERE REVERTING

        moveHitBoxes();//this will change the global variable moveHitBoxesArr

        // Draw pieces
        pieces = new Image();// Draw pieces ***** I don't get this part at all :( // I kinda get it now
        pieces.onload = drawPieces;
        pieces.src = '/xiangqi-pieces-sprites.png';//dimensions: width 2100, height, 600

        canvas.addEventListener('click', board_click, false);
    }
    else
    {
        alert("Canvas not supported!");
    }
}

function loadStatefromStore(){
  console.log('loading new state (for drawing) from local store');
  var storeState= store.getState()
  state = storeState.chessState;
  playerTeam = storeState.currentPlayerState.team;
}

function drawBoard()
{
    //Draw 9 rows top to bottom
    for(let iRowCounter = 0; iRowCounter < NUMBER_OF_ROWS; iRowCounter++)
    {
        drawRow(iRowCounter);
    }

    drawPalaceX();//Draw X's for the palace

    // Draw rectangle outline of the entire board (one large rect)
    ctx.lineWidth = 3;
    ctx.strokeRect(STARTING_POINT_X, STARTING_POINT_Y, NUMBER_OF_COLS * BLOCK_SIZE, NUMBER_OF_ROWS * BLOCK_SIZE);

}

function drawPalaceX(){
  let start1pos=[STARTING_POINT_X+BLOCK_SIZE*3, STARTING_POINT_Y];
  let end1pos=[STARTING_POINT_X+BLOCK_SIZE*5, STARTING_POINT_Y+BLOCK_SIZE*2];
  let start2pos=[STARTING_POINT_X+BLOCK_SIZE*5, STARTING_POINT_Y];
  let end2pos=[STARTING_POINT_X+BLOCK_SIZE*3, STARTING_POINT_Y+BLOCK_SIZE*2];
  let start3pos=[STARTING_POINT_X+BLOCK_SIZE*3, STARTING_POINT_Y+BLOCK_SIZE*7];
  let end3pos=[STARTING_POINT_X+BLOCK_SIZE*5, STARTING_POINT_Y+BLOCK_SIZE*9];
  let start4pos=[STARTING_POINT_X+BLOCK_SIZE*5, STARTING_POINT_Y+BLOCK_SIZE*7];
  let end4pos=[STARTING_POINT_X+BLOCK_SIZE*3, STARTING_POINT_Y+BLOCK_SIZE*9];
  drawLine(start1pos,end1pos)
  drawLine(start2pos,end2pos)
  drawLine(start3pos,end3pos)
  drawLine(start4pos,end4pos)
}

function drawLine(start,end){
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(...start);
  ctx.lineTo(...end);
  ctx.stroke();
}

function drawRow(iRowCounter)
{
  if(iRowCounter!==4){//For none river rows (any row that's not number 5.. which is technically 4 in rowcounter since it starts at 0)
    // Draw 8 blocks left to right
    for(let iBlockCounter = 0; iBlockCounter < NUMBER_OF_COLS; iBlockCounter++)
    {
      drawBlock(iRowCounter, iBlockCounter);
    }
  }
  else {//For river row
    //draw one long rectangle with river color (white currently)
    ctx.fillStyle = BLOCK_COLOUR_2;//river color
    let Xpos=STARTING_POINT_X;//x coord of top left corner of square
    let Ypos=STARTING_POINT_Y+(iRowCounter * BLOCK_SIZE);//y coord of top left corner of square
    ctx.lineWidth = 3;
    ctx.fillRect(Xpos, Ypos, BLOCK_SIZE * NUMBER_OF_COLS, BLOCK_SIZE);
    ctx.strokeRect(Xpos, Ypos, BLOCK_SIZE * NUMBER_OF_COLS, BLOCK_SIZE);
  }
}

function drawBlock(iRowCounter, iBlockCounter)
{
  // Set the color of tile
    if (([0, 1, 7, 8].indexOf(iRowCounter) !== -1)&&([3,4].indexOf(iBlockCounter)!==-1)){//rows 1,2,9,10 intersected by columns 3,4 represent palace squares
      ctx.fillStyle = BLOCK_COLOUR_3;//palace color
    } else {
      ctx.fillStyle = BLOCK_COLOUR_1;//none-river/none-palace color
    }

    // Draw rectangle for the background
    let Xpos=STARTING_POINT_X+(iBlockCounter * BLOCK_SIZE);//x coord of top left corner of square
    let Ypos=STARTING_POINT_Y+(iRowCounter * BLOCK_SIZE);//y coord of top left corner of square
    ctx.lineWidth = 3;
    ctx.fillRect(Xpos, Ypos, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeRect(Xpos, Ypos, BLOCK_SIZE, BLOCK_SIZE);
}

function moveHitBoxes(){//returns an array of objects with {x1,y1, x2,y2, xCent,yCent} that represent
//the top left corner,  bottom right corner, and center coordinates of squares that are the hitboxes for
//moving pieces
var canvCoord;

//remember since we're talking vertices, and not tiles, there will be one more row and column
//than NUMBER_OF_ROWS/NUMBER_OF_COLS constants
  for(let row = 0; row<NUMBER_OF_ROWS+1; row++){
    for(let col=0; col<NUMBER_OF_COLS+1; col++){
      canvCoord= convertStateXY(col,row);
      moveHitBoxesArr.push({
        x1: canvCoord.x-(BLOCK_SIZE/2),
        y1: canvCoord.y-(BLOCK_SIZE/2),
        x2: canvCoord.x+(BLOCK_SIZE/2),
        y2: canvCoord.y+(BLOCK_SIZE/2),
        xCent: canvCoord.x,
        yCent: canvCoord.y,
      })
      // ctx.strokeStyle = TEST_COLOUR;
      // ctx.strokeRect(canvCoord.x-(BLOCK_SIZE/2), canvCoord.y-(BLOCK_SIZE/2), BLOCK_SIZE, BLOCK_SIZE); // uncomment to test if hitboxes are in the right
      // locations!!! (just click a piece to show it after you uncomment)
    }
  }
  // console.log(moveHitBoxesArr)
}

function convertStateXY(x,y){//converts 0,0 to 25,25 (or whatever coordinate representing the coordinate on canvas is)
  let canvX= STARTING_POINT_X+x * BLOCK_SIZE;
  let canvY= STARTING_POINT_Y+y * BLOCK_SIZE;
  return {x: canvX, y:canvY};
}

function convertCanvXY(canvX, canvY){//convert something like 37.33,37.33 to 0,0 (or whatever coordinate representing the x,y coord in state is)
  let x= (canvX-STARTING_POINT_X)/BLOCK_SIZE;
  let y= (canvY-STARTING_POINT_Y)/BLOCK_SIZE;
  return {x,y};
}

//rename this asap!  this function only returns top left corner for piece hitbox
function drawPieceStartingPoint(curPiece){//takes in piece Object {piece: __, x:__, y:__, status:__}, outputs object {x:, y:} with converted coord
  //via convertStateXY represented TOP LEFT CORNER of square with side length PIECE_SIZE
  let convertedCoord=convertStateXY(curPiece.x,curPiece.y);
  return {x:convertedCoord.x-(PIECE_SIZE/2), y:convertedCoord.y-(PIECE_SIZE/2)};
}

function convertToStateCoord(){

}

function drawPieces()
{
    drawTeamOfPieces(state.black, true);
    drawTeamOfPieces(state.red, false);
}

function drawTeamOfPieces(teamOfPieces, bBlackTeam)
{
    // Loop through each piece and draw it on the canvas
    for (let pieceKey in teamOfPieces)
    {
        drawPiece(teamOfPieces[pieceKey], bBlackTeam);
    }

}

function drawPiece(curPiece, bBlackTeam)
{
    var imageCoords = getImageCoords(curPiece.piece, bBlackTeam)
    var drawCoord= drawPieceStartingPoint(curPiece);
    // Draw the piece onto the canvas:
    //First parameter is image src, 2nd and 3rd are coordinates on the image, 4th and 5th are piece size in the image src
    //6 and 7 are coordinates for where the piece begins drawing, the last 2 are height and width (for original image to scale down to)
    if(curPiece.status){ctx.drawImage(pieces,
        imageCoords.x, imageCoords.y, IMAGE_SIZE, IMAGE_SIZE,
        drawCoord.x, drawCoord.y,
        PIECE_SIZE, PIECE_SIZE)};//need the piece_size/2 since you want the piece to be CENTERED on the square corners, so you have to
        //start drawing to the top left of the locations where a block is normally drawn

}

function getImageCoords(pieceCode, bBlackTeam)
{
    var imageCoords =
    {
        "x": pieceCode * 300,
        "y": (bBlackTeam ? 300:0)
    };

    return imageCoords;
}

//------------------------------------------------------------------------------------------------------------
//Above is draw... nothing to do with user actions..
//below actually has to do with user actions.. you need to separate these eventually into their own modules (and files)

function board_click(ev)
{
  if(playerTeam=== state.currentTurn){//ONLY handle click events if the player's team matches the current turn team
    var rect = canvasVar.getBoundingClientRect();
    var clickedX = event.clientX - rect.left;//YOU NEED THIS OFFSETTING OR SCROLLING WILL FUCK UP YOUR SHIT
    var clickedY = event.clientY - rect.top;

    let clickedLocObj={x:clickedX, y:clickedY};

    // ctx.fillStyle = "red";//use this and bottom 2 lines to debug hitbox problems (not selecting properly)
    // ctx.fillRect(clickedX,clickedY,10,10);

    if(selectedKey === null)
    {
      checkIfPieceClicked(clickedLocObj);
    }
    else
    {
      processMove(clickedLocObj);
    }
  }
}

function checkIfCoordInRect(x,y,rectX1,rectY1,rectX2,rectY2){//rectX1,rectY1 are the top left corner of rectangle, X2/Y2 are bottom right corner
  //checks if coordinate x,y is located within a rectangle
  //this is used for determining if someone clicked on a piece

  // ctx.fillStyle = "red";//use this and bottom 2 lines to debug hitbox problems (not selecting properly)
  // ctx.fillRect(x,y,10,10);
  // ctx.strokeRect(rectX1, rectY1, PIECE_SIZE, PIECE_SIZE);

  // console.log('is x: '+x+'y: '+y+'inside '+rectX1+','+rectY1+' and '+rectX2+','+rectY2)
  return ((x>rectX1 && x<rectX2)&&(y>rectY1 && y<rectY2));
}

function checkIfPieceClicked(clickedLocObj)
{
    var getPiece = getPieceAtBlock(clickedLocObj);
    var pieceAtBlock = getPiece.pieceVal;
    var pieceKey = getPiece.key;

    if (pieceAtBlock !== null)
    {
        selectPiece(pieceAtBlock, pieceKey);
    }
}

function getPieceAtBlock(clickedLocObj)
{
    var team = (state.currentTurn === 'black' ? state.black:state.red);
    return getPieceAtBlockForTeam(team, clickedLocObj);
}

function getPieceAtBlockForTeam(teamOfPieces, clickedLocObj, team)
{

    var curPiece = null,
        pieceAtBlock = null,
        pieceCoord,
        pieceKey;
    for (let key in teamOfPieces)
    {
        curPiece=teamOfPieces[key];
        pieceCoord= drawPieceStartingPoint(curPiece);

        // ctx.strokeRect(pieceCoord.x, pieceCoord.y, PIECE_SIZE, PIECE_SIZE); // uncomment to test if hitboxes are in the right
        // locations!!!(just click a piece to show it after you uncomment)

        let inhitBoxBool = checkIfCoordInRect(
        clickedLocObj.x, clickedLocObj.y,//coordinate of where user clicked
        pieceCoord.x, pieceCoord.y,//coordinate of top left corner of piece hitbox
        pieceCoord.x+PIECE_SIZE, pieceCoord.y+PIECE_SIZE)//coordinate of bottom right corner of piece hitbox
        console.log(inhitBoxBool);

        if (curPiece.status === IN_PLAY && inhitBoxBool)
        {

            pieceAtBlock = curPiece;
            pieceKey = key;
            // iPieceCounter = teamOfPieces.length;//this is to break the loop (why not just break????)***
            break;
        }
    }
    return {pieceVal: pieceAtBlock, key: pieceKey, team: team};
}

function selectPiece(pieceAtBlock, pieceKey)//note.. the selectedKey happens at getPieceAtBlockForTeam, not in this function
{
  var pieceCoord= drawPieceStartingPoint(pieceAtBlock);
    // Draw outline
    ctx.lineWidth = SELECT_LINE_WIDTH;
    ctx.strokeStyle = HIGHLIGHT_COLOUR;
    ctx.strokeRect(pieceCoord.x, pieceCoord.y,
        PIECE_SIZE, PIECE_SIZE);
    ctx.strokeStyle = BLACK;
    selectedKey = pieceKey;
    console.log('Selected Piece is: ',pieceAtBlock)
    showLegalMoves(pieceAtBlock);
}

function processMove(clickedLocObj)
{
  let pieceObjToMove=state[state.currentTurn][selectedKey];
  console.log('currentTurn ', state.currentTurn);
  console.log('selectedKey', selectedKey);
  let targetCoord=snapToVertex(clickedLocObj);
  let stateCoord= convertCanvXY(targetCoord.x,targetCoord.y);
  // console.log('clickedLocObj is ',clickedLocObj)
  // console.log('targetCoord is ', targetCoord)
  // processPieceAtTarget(pieceObjToMove,clickedLocObj,targetCoord);

  // console.log(stateCoord);
  let targetResult=processPieceAtTarget(clickedLocObj);
  if(targetResult===true) movePiece(pieceObjToMove,stateCoord);
  else if(targetResult===false) return;
  else {
    deactivatePiece(targetResult);//remember this has key and object.. not just the piece object itself.. basically like pieceTeamandKey
    movePiece(pieceObjToMove,stateCoord);
  }
  selectedKey=null;
  changeTurn();
}

function reDraw(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  draw(canvas);//THIS WORKS JUST FINE>. I finally fixed it... see comments at the top
  // drawBoard();//No longer needed
  // drawPieces();
}

function snapToVertex(clickedLocObj){//takes in clickLocObj, representing where user clicked, and returns
  //snappedCoord (it's basically clickedLocObj, but "centered to a vertex" that is the center of a moveHitBox)
  let snappedX,
      snappedY,
      snappedCoord;

  for(let hitBoxSqObj of moveHitBoxesArr){
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

function movePiece(pieceObj,newStateCoord){
  console.log('old coord: ',pieceObj.x,pieceObj.y)
  console.log('new coord input: ',newStateCoord.x,newStateCoord.y)
  let newPiece=Object.assign({},pieceObj);
  newPiece.x=newStateCoord.x;
  newPiece.y=newStateCoord.y;

  let newPieceTeamandKey={team: state.currentTurn, key: selectedKey, pieceVal: newPiece}
  let socketEmit= socketEmitCreator(UPDATE_PIECES, newPieceTeamandKey, 'Updating server store with new chess state from client (movement)');
  socketEmit();
  // let pieceChangeAO=change_CH_State_AC(newPieceTeamandKey);
  // store.dispatch(pieceChangeAO);
}

function deactivatePiece(pieceTeamandKey){
  pieceTeamandKey.pieceVal=Object.assign({},pieceTeamandKey.pieceVal);//this is the main thing you want to clone
  pieceTeamandKey.pieceVal.status=false;
  let socketEmit= socketEmitCreator(UPDATE_PIECES, pieceTeamandKey, 'Updating server store with new chess state from client (deactivating)');
  socketEmit();
}

function removePiece(pieceObj){
  pieceObj.status=false;
}

function processPieceAtTarget(clickedLocObj)
{
    var targetPieceRed,
        targetPieceBlack,
        enemyPieceandKey;

    targetPieceRed= getPieceAtBlockForTeam(state.red, clickedLocObj, 'red');
    targetPieceBlack= getPieceAtBlockForTeam(state.black, clickedLocObj, 'black');

    console.log('targetted-> red: ',targetPieceRed,'black: ',targetPieceBlack);
    if(state.currentTurn==='red'){
      if(targetPieceRed.pieceVal){console.log('invalid move');return false;};//invalid move.. get out of this function and have current player make move again
      if(targetPieceBlack.pieceVal) enemyPieceandKey=targetPieceBlack;//there's now an enemy piece designated
    }
    else if(state.currentTurn==='black'){
      if(targetPieceBlack.pieceVal){console.log('invalid move');return false;};//invalid move.. get out of this function and have current player make move again
      if(targetPieceRed.pieceVal) enemyPieceandKey=targetPieceRed;//there's now an enemy piece designated
    }

    // switch (selectedPiece.piece)
    // {
    //     case PIECE_PAWN:
    //
    //         bCanMove = canPawnMoveToBlock(selectedPiece, clickedBlock, enemyPiece);
    //
    //     break;
    //
    //     case PIECE_CASTLE:
    //
    //         // TODO
    //
    //     break;
    //
    //     case PIECE_ROUKE:
    //
    //         // TODO
    //
    //     break;
    //
    //     case PIECE_BISHOP:
    //
    //         // TODO
    //
    //     break;
    //
    //     case PIECE_QUEEN:
    //
    //         // TODO
    //
    //     break;
    //
    //     case PIECE_KING:
    //
    //         // TODO
    //
    //     break;
    // }

    return enemyPieceandKey ? enemyPieceandKey : true;
}

function changeTurn(){
  let nextTurn= state.currentTurn === 'red' ? 'black': 'red';
  console.log('next turn is ', nextTurn);
  let socketEmit= socketEmitCreator(UPDATE_TURN, nextTurn, 'Updating server store to change turn');
  socketEmit();
  // let changeTurnAO=change_CH_Turn_AC(state.currentTurn === 'red' ? 'black': 'red');
  // store.dispatch(changeTurnAO);
}
