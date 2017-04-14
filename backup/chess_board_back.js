
console.log('test');
var NUMBER_OF_ROWS = 9;
var NUMBER_OF_COLS = 8;
var BLOCK_COLOUR_1= '#FFC377';//normal color
var BLOCK_COLOUR_2= '#FFFFFF';//river color
// var BLOCK_COLOUR_3= '#FFD094';
var BLOCK_COLOUR_3= '#FFDAAA';//palace color
var STARTING_POINT_X= 50;// X coord for where to start drawing the board (top left corner)
var STARTING_POINT_Y= 35;// Y coord for where to start drawing the board (top left corner)
var PIECE_GENERAL = 0;
var PIECE_GUARD = 1;
var PIECE_CAVALIER = 2;
var PIECE_ELEPHANT = 3;
var PIECE_CHARIOT = 4;
var PIECE_CANNON = 5;
var PIECE_SOLDIER = 6
var IN_PLAY = true;
var IMAGE_SIZE = 300;//size of image blocks on the original image file (for drawImage..)
var PIECE_SIZE = 68;//size for the image blocks in the image file to scale down to for actual display
var SELECT_LINE_WIDTH = 3;
var HIGHLIGHT_COLOUR = '#FF0000';
var TEST_COLOUR = '#D2FF94';

//MOVE THESE GLOBAL VARIABLES TO THE STORE AS SOON AS YOU GET REDUX WORKING
var selectedPiece = null;// CHANGE THIS ASAP... DON'T LIKE  THE IDEA OF CHANGEABLE GLOBAL VARS BEING USED LIKE THIS
var json; //
var currentTurn= 'red';//it's always been up for debate who is "supposed" to have the first turn traditionally, but most modern tourneys say red
var moveHitBoxesArr=[];//this will populated by moveHitBoxes() in draw()


function draw()
{
    // Main entry point got the HTML5 chess board example
    canvas = document.getElementById('chess');

    // Canvas supported?
    if(canvas.getContext)
    {
        ctx = canvas.getContext('2d');// all this is doing is saying the canvas will be in 2d
        console.log(canvas)

        // Calculate the precise block size
        BLOCK_SIZE = canvas.height * 0.85 / NUMBER_OF_ROWS; // this was original...
        console.log('BLOCK_SIZE is ',BLOCK_SIZE)
        // BLOCK_SIZE = canvas.height / 8;

        // Draw the background
        drawBoard();

        defaultPositions();

        moveHitBoxes();//this will change the global variable moveHitBoxesArr

        // Draw pieces
        pieces = new Image();// Draw pieces ***** I don't get this part at all :(
        // pieces.src = 'pieces.png';
        pieces.src = 'xiangqi-pieces-sprites.png';//dimensions: width 2100, height, 600
        pieces.onload = drawPieces;

        canvas.addEventListener('click', board_click, false);
    }
    else
    {
        alert("Canvas not supported!");
    }
}

function drawBoard()
{
    //Draw 9 rows top to bottom
    for(iRowCounter = 0; iRowCounter < NUMBER_OF_ROWS; iRowCounter++)
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
    for(iBlockCounter = 0; iBlockCounter < NUMBER_OF_COLS; iBlockCounter++)
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









defaultPositions();//default positions (x, y?  row ,col?) for all the pieces





function defaultPositions()//Note these coordinates (x,y) do NOT represent actual coordinates on the canvas..
//use convertToCanvCoord() to convert from state coordinates to draw friendly canvas coordinates (should be vertices on board)
//use convertToStateCoord() to convert normal canvas coordinates to state coordinates  (for changing the state)
{
    json =
    {
        "black":
        [
            {
                "piece": PIECE_CHARIOT,
                "x": 0,
                "y": 0,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_CAVALIER,
                "x": 1,
                "y": 0,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_ELEPHANT,
                "x": 2,
                "y": 0,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_GUARD,
                "x": 3,
                "y": 0,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_GENERAL,
                "x": 4,
                "y": 0,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_GUARD,
                "x": 5,
                "y": 0,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_ELEPHANT,
                "x": 6,
                "y": 0,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_CAVALIER,
                "x": 7,
                "y": 0,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_CHARIOT,
                "x": 8,
                "y": 0,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_CANNON,
                "x": 1,
                "y": 2,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_CANNON,
                "x": 7,
                "y": 2,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_SOLDIER,
                "x": 0,
                "y": 3,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_SOLDIER,
                "x": 2,
                "y": 3,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_SOLDIER,
                "x": 4,
                "y": 3,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_SOLDIER,
                "x": 6,
                "y": 3,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_SOLDIER,
                "x": 8,
                "y": 3,
                "status": IN_PLAY
            }
        ],
        "red":
        [
            {
                "piece": PIECE_CHARIOT,
                "x": 0,
                "y": 9,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_CAVALIER,
                "x": 1,
                "y": 9,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_ELEPHANT,
                "x": 2,
                "y": 9,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_GUARD,
                "x": 3,
                "y": 9,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_GENERAL,
                "x": 4,
                "y": 9,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_GUARD,
                "x": 5,
                "y": 9,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_ELEPHANT,
                "x": 6,
                "y": 9,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_CAVALIER,
                "x": 7,
                "y": 9,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_CHARIOT,
                "x": 8,
                "y": 9,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_CANNON,
                "x": 1,
                "y": 7,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_CANNON,
                "x": 7,
                "y": 7,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_SOLDIER,
                "x": 0,
                "y": 6,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_SOLDIER,
                "x": 2,
                "y": 6,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_SOLDIER,
                "x": 4,
                "y": 6,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_SOLDIER,
                "x": 6,
                "y": 6,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_SOLDIER,
                "x": 8,
                "y": 6,
                "status": IN_PLAY
            }
        ],
    };
}

function moveHitBoxes(){//returns an array of objects with {x1,y1, x2,y2, xCent,yCent} that represent
//the top left corner,  bottom right corner, and center coordinates of squares that are the hitboxes for
//moving pieces
var canvCoord;

//remember since we're talking vertices, and not tiles, there will be one more row and column
//than NUMBER_OF_ROWS/NUMBER_OF_COLS constants
  for(let row = 0; row<NUMBER_OF_ROWS+1; row++){
    for(let col=0; col<NUMBER_OF_COLS+1; col++){
      canvCoord= convertStateXY(col,row,BLOCK_SIZE,BLOCK_SIZE);
      moveHitBoxesArr.push({
        x1: canvCoord.x,
        y1: canvCoord.y,
        x2: canvCoord.x+BLOCK_SIZE,
        y2: canvCoord.y+BLOCK_SIZE,
        xCent: col,
        yCent: row,
      })
      // ctx.strokeStyle = TEST_COLOUR;
      // ctx.strokeRect(canvCoord.x, canvCoord.y, BLOCK_SIZE, BLOCK_SIZE); // uncomment to test if hitboxes are in the right
      //locations!!! (just click a piece to show it after you uncomment)
    }
  }

  console.log(moveHitBoxesArr)
}

function convertStateXY(x,y,height,width){
  let convX= STARTING_POINT_X-(width/2)+x * BLOCK_SIZE;
  let convY= STARTING_POINT_Y-(height/2)+y * BLOCK_SIZE;
  return {x: convX, y:convY};
}

function convertCanvXY(){

}

function convertToCanvCoord(curPiece){//takes in piece Object {piece: __, x:__, y:__, status:__}, outputs object {x:, y:} with converted coord
  //via convertStateXY
  return convertStateXY(curPiece.x,curPiece.y,PIECE_SIZE,PIECE_SIZE);
}

function convertToStateCoord(){

}

function drawPieces()
{
    drawTeamOfPieces(json.black, true);
    drawTeamOfPieces(json.red, false);
}

function drawTeamOfPieces(teamOfPieces, bBlackTeam)
{
    var iPieceCounter;

    // Loop through each piece and draw it on the canvas
    // commented out for now
    for (iPieceCounter = 0; iPieceCounter < teamOfPieces.length; iPieceCounter++)
    {
        drawPiece(teamOfPieces[iPieceCounter], bBlackTeam);
    }

    // TESTING!!!
    // console.log('drawing')
    // let curPiece=teamOfPieces[6];
    // var imageCoords = getImageCoords(curPiece.piece, bBlackTeam)
    // console.log('pieces are ', pieces);
    // console.log('imageCoords are ',imageCoords.x, imageCoords.y);

    // ctx.drawImage(pieces, imageCoords.x, imageCoords.y, IMAGE_SIZE, IMAGE_SIZE,
    //   3.5 * BLOCK_SIZE, 3.5 * BLOCK_SIZE, PIECE_SIZE, PIECE_SIZE);//to understand how this works, see comments in drawPiece
    //
    // drawPiece({piece:0,x:4,y:5},false)

}

function drawPiece(curPiece, bBlackTeam)
{
    var imageCoords = getImageCoords(curPiece.piece, bBlackTeam)
    var drawCoord= convertToCanvCoord(curPiece);
    // Draw the piece onto the canvas:
    //First parameter is image src, 2nd and 3rd are coordinates on the image, 4th and 5th are piece size in the image src
    //6 and 7 are coordinates for where the piece begins drawing, the last 2 are height and width (for original image to scale down to)
    ctx.drawImage(pieces,
        imageCoords.x, imageCoords.y, IMAGE_SIZE, IMAGE_SIZE,
        drawCoord.x, drawCoord.y,
        PIECE_SIZE, PIECE_SIZE);//need the piece_size/2 since you want the piece to be CENTERED on the square corners, so you have to
        //start drawing to the top left of the locations where a block is normally drawn

}

function getImageCoords(pieceCode, bBlackTeam)
{
    var imageCoords =
    {
        "x": pieceCode * 300,
        "y": (bBlackTeam?300:0)
    };

    return imageCoords;
}

function board_click(ev)
{
  // console.log([ev.clientX,ev.clientY])

  //x and y are 8 pixels to the left and above ev.clientX/ev.clientY
    // var x = ev.clientX - canvas.offsetLeft;
    // var y = ev.clientY - canvas.offsetTop;
    // console.log([x,y])
    //actually going to forget about offsetting for now

    // var clickedBlock = screenToBlock(x, y);
    // console.log('test')
    let clickedX=ev.clientX;
    let clickedY=ev.clientY;
    // console.log(clickedX, clickedY)

    var clickedLocObj={x:clickedX, y:clickedY};
    // console.log(clickedLocObj)

    if(selectedPiece === null)
    {
        checkIfPieceClicked(clickedLocObj);
    }
    else
    {
        processMove(clickedLocObj);
    }
}

function checkIfCoordInRect(x,y,rectX1,rectY1,rectX2,rectY2){//rectX1,rectY1 are the top left corner of rectangle, X2/Y2 are bottom right corner
  //checks if coordinate x,y is located within a rectangle
  //this is used for determining if someone clicked on a piece
  return ((x>rectX1 && x<rectX2)&&(y>rectY1 && y<rectY2));
}

function checkIfPieceClicked(clickedLocObj)
{
    var pieceAtBlock = getPieceAtBlock(clickedLocObj);

    if (pieceAtBlock !== null)
    {
        selectPiece(pieceAtBlock);
    }
}

function getPieceAtBlock(clickedLocObj)
{
    var team = (currentTurn === 'black' ? json.black:json.red);

    return getPieceAtBlockForTeam(team, clickedLocObj);
}

function getPieceAtBlockForTeam(teamOfPieces, clickedLocObj)
{
    var curPiece = null,
        iPieceCounter = 0,
        pieceAtBlock = null,
        pieceCoord;

    for (iPieceCounter = 0; iPieceCounter < teamOfPieces.length; iPieceCounter++)
    {
        curPiece = teamOfPieces[iPieceCounter];

        pieceCoord= convertToCanvCoord(curPiece);

        // ctx.strokeRect(pieceCoord.x, pieceCoord.y, PIECE_SIZE, PIECE_SIZE); // uncomment to test if hitboxes are in the right
        //locations!!! (just click a piece to show it after you uncomment)

        if (curPiece.status === IN_PLAY &&
            checkIfCoordInRect(
            clickedLocObj.x, clickedLocObj.y,//coordinate of where user clicked
            pieceCoord.x, pieceCoord.y,//coordinate of top left corner of piece hitbox
            pieceCoord.x+PIECE_SIZE, pieceCoord.y+PIECE_SIZE)//coordinate of bottom right corner of piece hitbox
            )
        {
            curPiece.position = iPieceCounter;
            //this is so you can refer to and change the relevant piece object in the array

            pieceAtBlock = curPiece;
            iPieceCounter = teamOfPieces.length;//this is to break the loop (why not just break????)***
        }
    }

    return pieceAtBlock;
}

function selectPiece(pieceAtBlock)
{
  var pieceCoord= convertToCanvCoord(pieceAtBlock);
    // Draw outline
    ctx.lineWidth = SELECT_LINE_WIDTH;
    ctx.strokeStyle = HIGHLIGHT_COLOUR;
    // ctx.strokeRect(pieceCoord.x, pieceCoord.y,
    //     PIECE_SIZE, PIECE_SIZE);
    ctx.strokeRect(pieceCoord.x, pieceCoord.y,
        PIECE_SIZE, PIECE_SIZE);

    selectedPiece = pieceAtBlock;
}

function processMove(clickedLocObj)
{
  for(let hitBoxSqObj of moveHitBoxesArr){
    if(checkIfCoordInRect(
      clickedLocObj.x, clickedLocObj.y,//coordinate of where user clicked
      hitBoxSqObj.x1, hitBoxSqObj.y1,//coordinate of top left corner of piece hitbox
      hitBoxSqObj.x2, hitBoxSqObj.y2)//coordinate of bottom right corner of piece hitbox
    )
    {
      json
    }
  }
}
