import { CONNECT, UPDATE_PIECES, UPDATE_TURN, NEW_PLAYER, REQUEST_UPDATE_FROM_SERVER } from './constants'; //remember you can't import or export client side... need node
// import initialState from './defaultState'; //NO LONGER USING THIS
import {store, change_CH_State_AC, change_CH_Key_AC, change_CH_Turn_AC, change_CH_State_Everything_AC, chessStateReducer} from '../react/store';
import { soldierLegalMoves } from './legalMoves';
import { socketEmitCreator } from '../react/socket';
import { UtilObj, getPieceAtCanvXY, snapToVertex, convertStateXY, topLeftCorner } from './utils';
import LegalMoves from './legalMoves'
import { Game } from './Game'
import { MonteCarlo, StatsNode } from './mcts'

var NUMBER_OF_ROWS = 9;
var NUMBER_OF_COLS = 8;
var BLACK='#000000';
var BLOCK_COLOUR_1= '#FFC377';//normal color
var BLOCK_COLOUR_2= '#FFFFFF';//river color
// var BLOCK_COLOUR_3= '#FFD094';
var BLOCK_COLOUR_3= '#FFDAAA';//palace color
var STARTING_POINT_X= 50;// X coord for where to start drawing the board (top left corner)
var STARTING_POINT_Y= 35;// Y coord for where to start drawing the board (top left corner)
var START_LOCOBJ= {x:STARTING_POINT_X,y:STARTING_POINT_Y}
var IMAGE_SIZE = 300;//size of image blocks on the original image file (for drawImage..)
var PIECE_SIZE = 68;//size for the image blocks in the image file to scale down to for actual display
var SELECT_LINE_WIDTH = 3;
var HIGHLIGHT_COLOUR = '#FF0000';
var TEST_COLOUR = '#D2FF94';
var MOVE_COLOUR = '#0080ff';
var PATH_COLOUR = '#99ccff';
var IN_PLAY = true;
var BLOCK_SIZE;

var PIECE_GENERAL = 0;
var PIECE_GUARD = 1;
var PIECE_CAVALIER = 2;
var PIECE_ELEPHANT = 3;
var PIECE_CHARIOT = 4;
var PIECE_CANNON = 5;
var PIECE_SOLDIER = 6

//MOVE THESE GLOBAL VARIABLES TO THE STORE AS SOON AS YOU GET REDUX WORKING
var utilObj;
var legalMoves;
var selectedKey = null;// CHANGE THIS ASAP... DON'T LIKE  THE IDEA OF CHANGEABLE GLOBAL VARS BEING USED LIKE THIS
var state={};//this is piece data (if you need to iterate through the pieces use this)
// var board=[];//this is board data (if you need to iterate through positions, use this)
var playerTeam=null;

var moveHitBoxesArr=[];//this will populated by moveHitBoxes() in draw()
var canvasVar;
var pieces;
var ctx;
var westernPieces;

var animLoop;
var requestAnimationFrame;

export const draw = function(canvas, westernPiecesToggle)//westernPiecesToggle: if true, change pieces.src
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

        //make a new util object with these values passed in (so those methods have this data available)
        utilObj= new UtilObj(START_LOCOBJ, PIECE_SIZE, BLOCK_SIZE, state, moveHitBoxesArr)//this will be empty.  Set after moveHitBoxes().  god this is a mess
        legalMoves= new LegalMoves(state, {
          PIECE_GENERAL,
          PIECE_GUARD,
          PIECE_CAVALIER,
          PIECE_ELEPHANT,
          PIECE_CHARIOT,
          PIECE_CANNON,
          PIECE_SOLDIER,
        });

        // Draw the background
        drawBoard();

        moveHitBoxes();//this will change the global variable moveHitBoxesArr
        utilObj.moveHitBoxesArr=moveHitBoxesArr;

        // Draw pieces
        pieces = new Image();// Draw pieces ***** I don't get this part at all :( // I kinda get it now
        pieces.onload = drawPieces;
        pieces.src= westernPiecesToggle ? '/xiangqi-pieces-sprites-western.png' : '/xiangqi-pieces-sprites.png';
        westernPieces= westernPiecesToggle//This is needed to redraw (to "unoutline when deselect")



        //ONLY add click event listeners if the player's team matches the current turn team
        if(playerTeam=== state.chessState.currentTurn){
          canvas.addEventListener('click', board_click, false);
        }
        else {
          //don't know if the line below is necessary.. but it works now.. im not about to remove it (maybe later)
          // console.log('turn changed, so removing click handlers for team ', playerTeam)
          canvas.removeEventListener('click', board_click, false);
        }


//----- testing
//doesnt work :(


// requestAnimationFrame = window.requestAnimationFrame ||
//                             window.mozRequestAnimationFrame ||
//                             window.webkitRequestAnimationFrame ||
//                             window.msRequestAnimationFrame;
//
//                             var angle = 0;
//
              function drawCircle(radius) {
                console.log('drawing with new radius ', radius)
                ctx.clearRect(0, 0, 15, 15);
                //
                // // color in the background
                // ctx.fillStyle = "#EEEEEE";
                // ctx.fillRect(0, 0, canvasWidth, canvasHeight);

                // draw the circle
                ctx.beginPath();

                // var radius = 25 + 150 * Math.abs(Math.cos(30));
                ctx.arc(225, 225, radius, 0, Math.PI * 2, false);
                ctx.closePath();

                // color in the circle
                ctx.fillStyle = "#006699";
                ctx.fill();

                // requestAnimationFrame(drawCircle);
            }

    // ctx.beginPath();
    //
    // var radius = 175;
    // ctx.arc(225, 225, radius, 0, Math.PI * 2, false);
    // ctx.closePath();
    // var radius = 175;
    // ctx.arc(225, 225, radius, 0, Math.PI * 2, false);
    // ctx.closePath();
    // ctx.fillStyle = "#006699";
    // ctx.fill();

//----- testing


    }
    else
    {
        alert("Canvas not supported!");
    }
}

function loadStatefromStore(){
  console.log('loading new state (for drawing) from local store');
  var storeState= store.getState();//When the server data is loaded, this is what kicks off the re-rendering
  state = storeState;
  playerTeam = storeState.currentPlayerState.team;
  if(state.chessState.currentTurn){
    let consoleBoard= new Game(state.boardState, state.chessState);
    let score= consoleBoard.evaluate();
    console.log('score is currently: ', score);
    // console.log('asdfasdf', consoleBoard);
    consoleBoard.display();
  }
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

function drawLine(start,end,color){
  ctx.strokeStyle= color;
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

  for(let row = 0; row<NUMBER_OF_ROWS+1; row++){
    for(let col=0; col<NUMBER_OF_COLS+1; col++){

      canvCoord= utilObj.convertStateXY({x:col,y:row});

      moveHitBoxesArr.push({
        x1: canvCoord.x-(BLOCK_SIZE/2),
        y1: canvCoord.y-(BLOCK_SIZE/2),
        x2: canvCoord.x+(BLOCK_SIZE/2),
        y2: canvCoord.y+(BLOCK_SIZE/2),
        xCent: canvCoord.x,
        yCent: canvCoord.y,
      })
    }
  }
}

function drawPieces()
{
    drawTeamOfPieces(state.chessState.black, true);
    drawTeamOfPieces(state.chessState.red, false);
    // drawBoardObj(); //FOR DEBUGGING PURPOSES
}

function testDrawSquares(arrLocObj,side, testColor){//take an array of location objects (stateXY not canvXY), and a side length, draw on canvas squares around the locations
  for(let locObj of arrLocObj){
    let canvCoord= utilObj.convertStateXY(locObj);
    ctx.strokeStyle = testColor;
    ctx.strokeRect(canvCoord.x-(side/2), canvCoord.y-(side/2), side, side);
    ctx.strokeStyle = BLACK;
  }
}

function drawTeamOfPieces(teamOfPieces, bBlackTeam)
{
    // Loop through each piece and draw it on the canvas
    for (let pieceKey in teamOfPieces)
    {
      // console.log('wait what ',teamOfPieces)
        drawPiece(teamOfPieces[pieceKey], bBlackTeam);
    }

}

function drawPiece(curPiece, bBlackTeam)
{
    var imageCoords = getImageCoords(curPiece.piece, bBlackTeam)
    var pieceCanvCoord = utilObj.convertStateXY({x:curPiece.x,y:curPiece.y})
    var topleftDrawCoord= utilObj.topLeftCorner(pieceCanvCoord)

    // Draw the piece onto the canvas:
    //First parameter is image src, 2nd and 3rd are coordinates on the image, 4th and 5th are piece size in the image src
    //6 and 7 are coordinates for where the piece begins drawing, the last 2 are height and width (for original image to scale down to)
    // console.log('curPiece ',curPiece)
    // console.log('drawCoord ',topleftDrawCoord)
    if(curPiece.status){ctx.drawImage(pieces,
        imageCoords.x, imageCoords.y, IMAGE_SIZE, IMAGE_SIZE,
        topleftDrawCoord.x, topleftDrawCoord.y,
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
//------------------------------------------------------------------------------------------------------------
//Above is draw... nothing to do with user actions..
//below actually has to do with user actions.. you need to separate these eventually into their own modules (and files)
//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------

function board_click(ev)
{
    var rect = canvasVar.getBoundingClientRect();
    var clickedX = event.clientX - rect.left;//YOU NEED THIS OFFSETTING OR SCROLLING WILL FUCK UP YOUR SHIT
    var clickedY = event.clientY - rect.top;

    let clickedLocObj={x:clickedX, y:clickedY};

    if(selectedKey === null) selectPiece(clickedLocObj)
    else processMove(clickedLocObj);
}

function outlinePiece(pieceAtBlock){// Draw outline
  console.log('here')

  // let outlineInterval = setInterval(doGameLoop, 35);
  //
  // var testvar= 0
  //  function doGameLoop(){
  //    testvar++;
  //    drawCircle(testvar);
  //  }

  drawOutline()

  // function drawOutline(){
  //   // var pieceCanvCoord = convertStateXY({x:pieceAtBlock.x,y:pieceAtBlock.y}, START_LOCOBJ,BLOCK_SIZE)//center of coordinates of piece (in canvas, not in state)
  //   var pieceCanvCoord = utilObj.convertStateXY({x:pieceAtBlock.x,y:pieceAtBlock.y})
  //   // var topleftDrawCoord= topLeftCorner(pieceCanvCoord,PIECE_SIZE)
  //   var topleftDrawCoord= utilObj.topLeftCorner(pieceCanvCoord)
  //   ctx.lineWidth = SELECT_LINE_WIDTH;
  //   ctx.strokeStyle = HIGHLIGHT_COLOUR;
  //   ctx.strokeRect(topleftDrawCoord.x, topleftDrawCoord.y,
  //     PIECE_SIZE, PIECE_SIZE);
  //     ctx.strokeStyle = BLACK;
  // }

  function drawOutline(){
    // var pieceCanvCoord = convertStateXY({x:pieceAtBlock.x,y:pieceAtBlock.y}, START_LOCOBJ,BLOCK_SIZE)//center of coordinates of piece (in canvas, not in state)
    var pieceCanvCoord = utilObj.convertStateXY({x:pieceAtBlock.x,y:pieceAtBlock.y})
    // var topleftDrawCoord= topLeftCorner(pieceCanvCoord,PIECE_SIZE)
    var topleftDrawCoord= utilObj.topLeftCorner(pieceCanvCoord)
    ctx.lineWidth = SELECT_LINE_WIDTH;
    ctx.strokeStyle = HIGHLIGHT_COLOUR;
    ctx.strokeRect(topleftDrawCoord.x, topleftDrawCoord.y,
      PIECE_SIZE, PIECE_SIZE);
      ctx.strokeStyle = BLACK;
  }

}

// function selectPiece(clickedLocObj)// THIS IS ONLY USED FOR TESTING GAME.JS
// {
  //this is in lieu of making a legitimate test (now I think of it you really should make them.. it's just too time consuming)
  // let game= new Game(state.boardState, state.chessState);
  // console.log('Starting board: '); game.display();
  //
  // // console.log('elephant chessState for original board: ',game.chessState.red.ELE1)
  // let nextGameState1= game.next_state_makeChildNode({ selectedPieceLookupVal: {key: 'ELE1', team: 'red' }, targetLoc: {x:4,y:7} });
  // console.log('child1 board: '); nextGameState1.display();
  // // console.log('elephant chessState for child1 board: ',nextGameState1.chessState.red.ELE1)
  //
  // let nextGameState2= game.next_state_makeChildNode({ selectedPieceLookupVal: {key: 'ELE1', team: 'red' }, targetLoc: {x:4,y:5} });
  // console.log('child2 board: '); nextGameState2.display();
  // // console.log('elephant chessState for child2 board: ',nextGameState2.chessState.red.ELE1)
  //
  // // console.log('elephant chessState for original board again: ',game.chessState.red.ELE1)
  // console.log('original board again: '); game.display();//to show that changing child game states did not affect original board
  //
  // let nextGameState1_1= nextGameState1.next_state_makeChildNode({ selectedPieceLookupVal: {key: 'ELE1', team: 'black' }, targetLoc: {x:4,y:9} })
  // console.log('child1-1 board: '); nextGameState1_1.display();//Shows that taking a general leads to the game ending, and one team declared winner
  //
  // console.log('game1 parent',nextGameState1.parent);
  // console.log('game2 parent',nextGameState2.parent);
  // console.log('original board children',game.children);

  // game.populateLegalMovesforTeam(state.chessState.currentTurn);
  // game.next_state({ selectedPieceLookupVal: {key: 'ELE1', team: 'red' }, targetLoc: {x:4,y:7} })
  // game.display();
  // // game.next_state({ selectedPieceLookupVal: {key: 'ELE1', team: 'red' }, targetLoc: {x:4,y:6} })//should throw an error
  // // game.display();
  // game.next_state({ selectedPieceLookupVal: {key: 'ELE1', team: 'red' }, targetLoc: {x:0,y:0} })
  // game.display();
  //
  // game.next_state({ selectedPieceLookupVal: {key: 'ELE1', team: 'red' }, targetLoc: {x:4,y:0} })
  // game.display();
  // console.log(game.evaluate());

// ------------- this is for testing the actual MCTS

  // let game= new Game(state.boardState, state.chessState);
  // let mcts= new MonteCarlo(game,5000,50);
  // mcts.bestMove();
  // let rootNode= new StatsNode(game);  rootNode.sims=100; rootNode.wins=60;
  // let child1= new StatsNode(game, rootNode, 1); child1.sims=40; child1.wins=23;
  // let child2= new StatsNode(game, rootNode, 1); child2.sims=4; child2.wins=2;
  // let child3= new StatsNode(game, rootNode, 1); child3.sims=56; child3.wins=25;
  // rootNode.setChildren([child1, child2, child3]);
  // let selectedNode= mcts.select(rootNode);  console.log('selectedNode ',selectedNode);
  // child3.game.display();
  // mcts.expand(child3);
  // console.log('child3 should now have children with game states representing red moves', child3);
  // // child3.children[0].game.display();
  // mcts.expand(child3.children[0]);
  // console.log('child3 first child (where chariot goes to 0,8) should now its own children with game states represent black moves', child3.children[0])
  // child3.children[0].children[0].game.display();
  // mcts.expand(child3.children[0].children[0]);
  // child3.children[0].children[0].children[0].game.display();
  // mcts.expand(child3.children[0].children[0].children[0]);
  // child3.children[0].children[0].children[0].children[0].game.display();

  // let rootNode2= new StatsNode(game);
  // mcts.expand(rootNode2);
  // for(let childNode of rootNode2.children){
  //   let results= mcts.run_simulation(childNode);
  //   mcts.update(childNode, results)
  // }
  //
  // let selectedChild=mcts.select(rootNode2);
  // mcts.expand(selectedChild);
  // for(let childNode2 of selectedChild.children){
  //   let results2= mcts.run_simulation(childNode2);
  //   mcts.update(childNode2, results2)
  // }
  //
  // let selectedChild2=mcts.select(rootNode2);
  // mcts.expand(selectedChild2);
  // for(let childNode3 of selectedChild2.children){
  //   let results3= mcts.run_simulation(childNode3);
  //   mcts.update(childNode3, results3)
  // }
  // console.log(selectedChild);
  // console.log(selectedChild2);
  // console.log(rootNode2);
// }

function selectPiece(clickedLocObj)    //REINSTATE THIS BLOCK OF CODE AFTER TESTING YOUR GAME.JS
{
  var pieceAtBlock = utilObj.getPieceAtCanvXY(clickedLocObj, state.chessState.currentTurn);
  if(pieceAtBlock){
    selectedKey= pieceAtBlock.pieceKey;
    outlinePiece(pieceAtBlock);
    showLegalMoves(pieceAtBlock);
    }
}

function showLegalMoves(pieceAtBlock){//****
  let arrMoves= legalMoves.get(pieceAtBlock);
  let initialLegalMoves= arrMoves.legalMoves;//THIS NEEDS TO EVENTUALLY BE CHANGED TO RETURN THE INTERSECTION OF SHOW INITIALLEGAL MOVES AND CHECKMATE THINGY
  let pathMoves= arrMoves.pathMoves;
  // console.log('initial moves: ',initialLegalMoves);
  // console.log('pathMoves: ', pathMoves);
  testDrawSquares(pathMoves, BLOCK_SIZE/2/2/2, PATH_COLOUR);
  testDrawSquares(initialLegalMoves, BLOCK_SIZE/2, MOVE_COLOUR);
}

function processMove(clickedLocObj)
{

  let selectedPiece=state.chessState[state.chessState.currentTurn][selectedKey];
  let targetCoord=utilObj.snapToVertex(clickedLocObj);
  let stateCoord= utilObj.convertCanvXY({x:targetCoord.x,y:targetCoord.y});

  let targetResult=processPieceAtTarget(clickedLocObj);
  if(targetResult===true) movePiece(selectedPiece,stateCoord);
  else if(targetResult===false) {
    selectedKey = null;
    draw(canvasVar, westernPieces);
    return;
  }
  else {
    deactivatePiece(targetResult);
    movePiece(selectedPiece,stateCoord);
  }
  selectedKey=null;
  changeTurn();
}

function reDraw(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  draw(canvas);
}

export function mctsGetBestMove() {
  let game= new Game(state.boardState, state.chessState);
  let mcts= new MonteCarlo(game,5000,25);
  return mcts.bestMove();
}

export function mctsMove(movePieceObj) {//movePieceObj-> { selectedPieceLookupVal: {...}, targetLoc: {x:... , y:... } }
  // console.log('should be moving! ');
  let targetResult= utilObj.getPieceAtXY(movePieceObj.targetLoc);
  let selectedPiece= state.chessState[movePieceObj.selectedPieceLookupVal.team][movePieceObj.selectedPieceLookupVal.key];
  if(targetResult) deactivatePiece(targetResult);
  movePiece(selectedPiece, movePieceObj.targetLoc);
  changeTurn();
}

function movePiece(selectedPiece,newStateCoord){
    // console.log('should be movinnnnnnnnn')
  let newPiece=Object.assign({},selectedPiece);
  newPiece.x=newStateCoord.x;
  newPiece.y=newStateCoord.y;

  let socketEmit= socketEmitCreator(UPDATE_PIECES, newPiece, 'Updating server store with new chess state from client (movement)');
  socketEmit();
}

function deactivatePiece(piece){
  piece=Object.assign({},piece);//this is the main thing you want to clone
  piece.status=false;
  let socketEmit= socketEmitCreator(UPDATE_PIECES, piece, 'Updating server store with new chess state from client (deactivating)');
  socketEmit();
}

function removePiece(pieceObj){
  pieceObj.status=false;
}

function processPieceAtTarget(clickedLocObj)//either returns true, (can move to loc), false (invalid mov), or a piece obj (enemy piece which you will need to deactivate and then move)
{
    var targetPieceRed,
        targetPieceBlack,
        enemyPiece=null;

    let opposingTeam= state.chessState.currentTurn === 'red' ? 'black' : 'red';
    let targettedPiece= utilObj.getPieceAtCanvXY(clickedLocObj);

    if(targettedPiece){
      if(targettedPiece.team===opposingTeam) return targettedPiece;//return targettedPiece if enemy
      else return false;//return false if targettedPiece is ally (don't let move)
    }
    else return true;//return true if no targettedPiece (target location is empty, so just move)
}

function changeTurn(){
  let nextTurn= state.chessState.currentTurn === 'red' ? 'black': 'red';
  let socketEmit= socketEmitCreator(UPDATE_TURN, nextTurn, 'Updating server store to change turn');
  socketEmit();

  setTimeout(()=>{
    let emitRequestForUp= socketEmitCreator(REQUEST_UPDATE_FROM_SERVER, null, 'Requesting server for update');
    emitRequestForUp();
        }
    , 250);//this is my hacky solution for making the server send back just one response after changing pieces, and changing turns (which are multiple emitters to server.. initially i had a listener on server to send back changes everytime.. but that was too much)
}
