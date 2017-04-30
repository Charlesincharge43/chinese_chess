import { Game } from './game'
import { shuffle } from './utils'


export function MonteCarlo (gameInstance, timePerTurnMS, maxDepth=5){
  this.gameInstance=gameInstance;
  this.timePerTurn=timePerTurnMS;//how many milliseconds to continue running simulations and building stats tree until it is forced to choose a move
  this.maxDepth=maxDepth;
  this.root;//should point to root node
  this.totalSims;//should be the sims value of the root node
}

MonteCarlo.prototype.bestMove= function (){
  let startTime = Date.now();
  while ((Date.now() - startTime) < this.timePerTurn) {
    this.run_simulation();
  }
  //  Takes an instance of a Board and optionally some keyword
  //  arguments.  Initializes the list of game states and the
  //  statistics tables.
  // pass
}

MonteCarlo.prototype.setRootStatsNode= function(){
  this.root= new StatsNode(this.gameInstance);
}

MonteCarlo.prototype.uppConfBoundInterval= function(statsNode){//see https://en.wikipedia.org/wiki/Monte_Carlo_tree_search exploration vs exploitation.  REALLY cool.. this is essentially how MCTS "decides" to choose the right node to explore (during selection process)
  return (statsNode.wins / statsNode.sims) + Math.sqrt(2 * Math.log(statsNode.parent.sims) / statsNode.sims);
}

MonteCarlo.prototype.select= function(statsNode){
  //base case
  if(!statsNode.children.length) return statsNode
  //recursive case
  else {
    statsNode.children.sort(function(a, b){return this.uppConfBoundInterval(b)-this.uppConfBoundInterval(a)}.bind(this));
    return this.select(statsNode.children[0])
  }
}

MonteCarlo.prototype.expand= function(statsNode){
  let potentialMoves= statsNode.game.populateLegalMoves();
  statsNode.children= potentialMoves.map(moveObjs=>{
    let gameCopy=new Game(statsNode.game.boardState, statsNode.game.chessState)//man you really should have just had it all in one state... to make this more "domain independent", fix it up so you just only need some very general inputs (like just state, and more general methods as well)
    gameCopy.next_state(moveObjs);
    return new StatsNode(gameCopy, statsNode, statsNode.depth+1);
  })
}

MonteCarlo.prototype.run_simulation= function(statsNode, gameforsim=null, depth=0){//will simulate a game from a current game state (represented by statsNode) all the way to a certain depth, and then run the evaluation function and return that value
  //base case
  if(depth>=this.maxDepth || (gameforsim && gameforsim.chessState.ended)){
    gameforsim.display()
    return gameforsim.evaluate();
  }
  //recursive case
  else{
    let newdepth=depth+1;
    if(!gameforsim) {
      gameforsim=new Game(statsNode.game.boardState, statsNode.game.chessState);
    }
      let potentialMoves= gameforsim.populateLegalMoves();
      shuffle(potentialMoves);
      gameforsim.next_state(potentialMoves[0]);
      return this.run_simulation(statsNode, gameforsim, newdepth);
  }
}

MonteCarlo.prototype.update= function (leafStatsNode, simulationResults){
  /*
  Starting with the leaf stats node (where the simulation ran from)... recursively update it and its parents' wins/sims value.
  Note, it will update nodes differently (and a bit counter-intuitively) depending on the whose turn it is that a node represents
  (if a node's game state has current turn being black, a win for red will actually *positively* affect the value of that node...
  reason being that a game state whose turn is black is actually a *result* of a red's move).. therefore that node should have a positive value */

}

export function StatsNode(gameInstance, parent=null, depth=0) {
  this.game=gameInstance;
  this.parent=parent;
  this.depth=depth;//just in case we decide to implement depth
  this.children=[];
  this.wins=0;//this doesnt mean just wins from simulations directly from this node, but rather total wins done from sims of this node as well as that of all its descendants
  this.sims=0;//this doesnt mean just simulations directly from this node, but rather total simulations done from this node as well as that of all its descendants
}

StatsNode.prototype.setChildren= function(statsNodeArr){
  this.children=statsNodeArr;
}

StatsNode.prototype.addChild= function(statsNode){
  this.children.push(statsNode)
}

StatsNode.prototype.getChildren= function(){//EXPANSION

}
