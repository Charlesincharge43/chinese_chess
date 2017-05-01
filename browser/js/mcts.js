import { Game } from './game'
import { shuffle } from './utils'


export function MonteCarlo (gameInstance, timePerTurnMS, maxDepth=25, minMaxDepth=3){
  this.gameInstance=gameInstance;
  this.timePerTurn=timePerTurnMS;//how many milliseconds to continue running simulations and building stats tree until it is forced to choose a move
  this.maxDepth=maxDepth;
  this.minMaxDepth=minMaxDepth;
  this.root;//should point to root node
  this.maxDepthExplored=0;
  this.switch=false;//delete this later
  this.idcount=0;//delete later.. this is for debugging purposes
}

MonteCarlo.prototype.bestMove= function (){
  this.setRootStatsNode();

  // let testnode= new StatsNode(this.gameInstance);
  // let minmaxEval=this.shallowMinimax(testnode);
  // console.log('minmaxEval value is: ', minmaxEval);
  // console.log(testnode)

  // let testnode2= new StatsNode(this.gameInstance);
  // console.log('minmax depth',this.minMaxDepth)

  let minmaxEval=this.shallowMinimaxAB(this.root, -100000000000, 100000000000, 'red', this.minMaxDepth);
  // console.log(this.root);

  this.switch=true;

  let startTime = Date.now();
  while ((Date.now() - startTime) < this.timePerTurn) {
    this.runMonteCarlo(this.root);
  }
  let bestMove=this.root.children.sort(function(a,b){return b.sims-a.sims})[0];
  console.log('best move so far: ', bestMove)
  console.log(this.root)
  console.log('total simulations run: ', this.root.sims)
  console.log('max depth explored: ', this.maxDepthExplored)
  return bestMove.move;
}

MonteCarlo.prototype.runMonteCarlo= function (statsNode){
  let nodeToInvestigate= this.select(statsNode);//select via UCB (exploration vs exploitation.. see notes below)
  this.expand(nodeToInvestigate);
  for(let childNode of nodeToInvestigate.children){
    let results= this.run_simulation(childNode);
    this.update(childNode, results);
  }
}

MonteCarlo.prototype.setRootStatsNode= function(){
  this.root= new StatsNode(this.gameInstance);
  this.root.pruned= false;
}

MonteCarlo.prototype.uppConfBoundInterval= function(statsNode){//see https://en.wikipedia.org/wiki/Monte_Carlo_tree_search exploration vs exploitation.  REALLY cool.. this is essentially how MCTS "decides" to choose the right node to explore (during selection process)
  if(!statsNode.sims) return 100;//if a statsNode has never been investigated before, it must take priority over all nodes for selection;
  return (statsNode.wins / statsNode.sims) + Math.sqrt(2 * Math.log(statsNode.parent.sims) / statsNode.sims);
}

MonteCarlo.prototype.select= function(statsNode){
  //base case
  if(!statsNode.children.length) return statsNode
  //recursive case
  else {
      statsNode.children.sort(function(a, b){return this.uppConfBoundInterval(b)-this.uppConfBoundInterval(a)}.bind(this));
      return this.select(statsNode.children[0]);
  }
}

MonteCarlo.prototype.expand= function(statsNode){
  // this.switch===true && console.log('expanding node ', statsNode,' which has ', statsNode.children.length, 'children');
  // if(statsNode.depth===2) console.log('should be expanding hereeee... ', statsNode);
  let potentialMoves= statsNode.game.populateLegalMoves();
  statsNode.children= potentialMoves.map(moveObjs=>{
    let gameCopy=new Game(statsNode.game.boardState, statsNode.game.chessState)//man you really should have just had it all in one state... to make this more "domain independent", fix it up so you just only need some very general inputs (like just state, and more general methods as well)
    gameCopy.next_state(moveObjs);
    return new StatsNode(gameCopy, statsNode, statsNode.depth+1, moveObjs);
  })

}

MonteCarlo.prototype.selectiveExpand= function(statsNode, pieceKey){
  let potentialMoves= statsNode.game.getLegalMovesforPiece(pieceKey);
  let hackysolution=this;

  let newMoves= potentialMoves.map(moveObjs=>{
    let gameCopy=new Game(statsNode.game.boardState, statsNode.game.chessState)//man you really should have just had it all in one state... to make this more "domain independent", fix it up so you just only need some very general inputs (like just state, and more general methods as well)
    gameCopy.next_state(moveObjs);
    let newstatsNode= new StatsNode(gameCopy, statsNode, statsNode.depth+1, moveObjs);
    newstatsNode.id=hackysolution.idcount; hackysolution.idcount+=1;//get rid of this eventually.. you were using this to debug
    return newstatsNode;
  })
  statsNode.children= statsNode.children.concat(newMoves);//YOUR PROBLEM IS YOU RETURNED statsNode.children, and not just the part you added... thus, you ended up adding multiple things multiple times! (because there was a nested for loop in alpha beta... just check it ou)
  return newMoves;
}

MonteCarlo.prototype.shallowMinimaxAB= function(statsNode, α, β, maximizingPlayer, maxdepth=3, depth=0){

  Number.prototype.between = function (min, max) {//Is there a better place to put it?  not sure if i can import it or anything
    return this > min && this < max;
  };

  let currentTeam= statsNode.game.chessState.currentTurn;
  let evalVal; let minmaxEval;
  //base case
  if(depth===maxdepth || statsNode.game.ended) {
    // console.log('got to maxdepth... ', maxdepth)
    statsNode.minmaxEval= statsNode.game.evaluate();
    evalVal= statsNode.minmaxEval.redScore;
    return evalVal;
  }
  //recursive case
  else if(currentTeam===maximizingPlayer) {
    evalVal = -100000000000;

    nested_loop1:
    for(let key in statsNode.game.chessState[currentTeam]){

      let childNodesforPiece= this.selectiveExpand(statsNode, key);


      for(let childNode of childNodesforPiece){
        evalVal = Math.max(evalVal, this.shallowMinimaxAB(childNode, α, β, maximizingPlayer, maxdepth, depth+1));
        α = Math.max(α, evalVal);
        if(β <= α) {
          // console.log('about to break');
          break nested_loop1;}
      }
      // console.log('just checking')
    }
    statsNode.minmaxEval={redScore: evalVal, blackScore: 1-evalVal};
    // console.log('should be setting minmaxeval ', statsNode.minmaxEval);
    // console.log('children to filter: ', statsNode.children, 'by ', evalVal);

//-----------filtering block ----------

    if(depth===0 || depth ===1){
      statsNode.children= statsNode.children.filter(child=>{
        child.pruned=false;
        // console.log(child.minmaxEval)
        return child.minmaxEval.redScore.between(evalVal-.01,evalVal+.01);
      })
    }
    else {
      statsNode.children.sort(function(a,b){return b.minmaxEval.redScore-a.minmaxEval.redScore})
      statsNode.children= statsNode.children.slice(0,5)
    }
//-----------filtering block ----------

    // console.log(statsNode.children.length)
    return evalVal;
  }

  else {
    evalVal = 100000000000;

    nested_loop2:
    for(let key in statsNode.game.chessState[currentTeam]){
      let childNodesforPiece= this.selectiveExpand(statsNode, key);
      for(let childNode of childNodesforPiece){

        evalVal = Math.min(evalVal, this.shallowMinimaxAB(childNode, α, β, maximizingPlayer, maxdepth, depth+1));
        β = Math.min(β, evalVal);

        if(β <= α) {
          // console.log('about to break');
          break nested_loop2;}
      }
    }

    statsNode.minmaxEval={redScore: evalVal, blackScore: 1-evalVal};

//-----------filtering block ----------

  if(depth===0 || depth ===1){
    statsNode.children= statsNode.children.filter(child=>{
      child.pruned=false;
      return child.minmaxEval.blackScore.between((1-evalVal)-.01,(1-evalVal)+.01);
    })
  }
  else{
    statsNode.children.sort(function(a,b){return b.minmaxEval.blackScore-a.minmaxEval.blackScore})
    statsNode.children= statsNode.children.slice(0,5)
  }

//-----------filtering block ----------
    // console.log('children to filter: ', statsNode.children, 'by ', evalVal);
    // console.log('should be setting minmaxeval ', statsNode.minmaxEval);
    return evalVal;
  }
}

// MonteCarlo.prototype.shallowMinimax= function(statsNode, depth=0, maxdepth=2){//i know its MINimax, but I just find it makes more sense to have 2 different maxes (and choosing the which one depending on current team) rather than a max and a min
//   let currentTeam= statsNode.game.chessState.currentTurn;
//
//   //base case
//   if(depth===maxdepth || statsNode.game.ended) {
//     statsNode.minmaxEval= statsNode.game.evaluate();
//     return statsNode.minmaxEval;
//   }
//
//   //recursive case
//   else {
//     // console.log('at depth ', depth)
//     this.expand(statsNode);
//     // console.log('expanded ', statsNode)
//
// // REPEATING A LOT OF IF ELSE WITH THE TEAMS... REFACTOR THIS ASAP
//     let max= currentTeam === 'red'
//               ? Math.max(...statsNode.children.map(child=>{
//                 return this.shallowMinimax(child, depth+1, maxdepth).redScore;//let max equal the highest redscore obtained by its children (if on team red)
//                 }))
//               : Math.max(...statsNode.children.map(child=>{
//                 return this.shallowMinimax(child, depth+1, maxdepth).blackScore;//let max equal the highest blackscore obtained by its children (if on team black)
//               }))//the parent of the final depth will always only have one child because of this... i wonder if this is a good or bad thing
//
//     // console.log('children before being filtered out: ',statsNode.children);
//     // console.log('on team ', currentTeam, 'max score for ', currentTeam, 'is ', max);
//
//     // if(depth < maxdepth-2){// Minimax choice of branches gets more and more stupid the closer you get to the max search depth.. esp when its such a shallow search like this.
//       // statsNode.children= currentTeam === 'red'
//       // ? statsNode.children.filter(child=>{
//       //   return child.minmaxEval.redScore===max;//only keep the children that have minmaxEval scores equal to max red score (if on team red)
//       // })
//       // : statsNode.children.filter(child=>{
//       //   return child.minmaxEval.blackScore===max;//only keep the children that have minmaxEval scores equal to max black score (if on team black)
//       // })
//     // }
//       // statsNode.minmaxEval= statsNode.children[0].minmaxEval;//now set its own minmaxEval score equal to its children
//     statsNode.minmaxEval= currentTeam === 'red' ? {redScore: max, blackScore: 1-max} : {redScore: 1-max, blackScore: max} ;//****hacky solution.. change up the Math.max block of code later when you have time (so it returns whole minmaxEval sorted by its red/black score property, rather than just one of its properties)
//
//     return statsNode.minmaxEval;//now return this score to its parent for its parent's own shallowMinimax calculations
//   }
// }

MonteCarlo.prototype.run_simulation= function(statsNode, gameforsim=null, depth=0){//will simulate a game from a current game state (represented by statsNode) all the way to a certain depth, and then run the evaluation function and return that value
  //base case
  if(depth>=this.maxDepth || (gameforsim && gameforsim.chessState.ended)){
    // gameforsim.display() //UNCOMMENT THIS FOR PRESENTATION PURPOSES
    return gameforsim.evaluate();
  }
  //recursive case
  else{
    let newdepth=depth+1;
    (newdepth > this.maxDepthExplored) && (this.maxDepthExplored = newdepth);
    if(!gameforsim) {
      gameforsim=new Game(statsNode.game.boardState, statsNode.game.chessState);
    }
      let potentialMoves= gameforsim.populateLegalMoves();
      shuffle(potentialMoves);
      gameforsim.next_state(potentialMoves[0]);
      return this.run_simulation(statsNode, gameforsim, newdepth);
  }
}

MonteCarlo.prototype.update= function (statsNode, simulationResults, nodeUpdated=0){
  /*
  Starting with the *leaf* stats node (where the simulation ran from)... recursively update it and its parents' wins/sims value.
  Note, it will update nodes differently (and a bit counter-intuitively) depending on the whose turn it is that a node represents
  (if a node's game state has current turn being black, a win for red will actually *positively* affect the value of that node...
  reason being that a game state whose turn is black is actually a *result* of a red's move).. therefore that node should have a positive value */

  //update self!
  statsNode.sims+=1;//this happens regardless what the results are
  statsNode.wins+= statsNode.game.chessState.currentTurn=== 'black' ? simulationResults.redScore : simulationResults.blackScore;

  //base case
  if(!statsNode.parent){
    return nodeUpdated;//return number of nodes updated
  }
  //recursive case
  else {
    this.update(statsNode.parent, simulationResults, nodeUpdated+1)//call this function on its parent
  }
}

export function StatsNode(gameInstance, parent=null, depth=0, moveObj=null) {
  this.game=gameInstance;
  this.move=moveObj;
  this.parent=parent;
  this.depth=depth;//just in case we decide to implement depth
  this.children=[];
  this.wins=0;//this doesnt mean just wins from simulations directly from this node, but rather total wins done from sims of this node as well as that of all its descendants
  this.sims=0;//this doesnt mean just simulations directly from this node, but rather total simulations done from this node as well as that of all its descendants
  this.minmaxEval={redScore: 0, blackScore: 0};//only used for shallow minimax right before rollout/simulation phase
  this.pruned=true;//just for debugging purposes
  this.id;//for debugging purposes
}

StatsNode.prototype.setChildren= function(statsNodeArr){
  this.children=statsNodeArr;
}

// StatsNode.prototype.addChild= function(statsNode){
//   this.children.push(statsNode)
// }
