
'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import { draw, mctsGetBestMove, mctsMove } from '../js/chess_board';//runAI and machineMove really should be moved elsewhere.. .but for now im leaving them there
import { store, activate_AI, deactivate_AI, action_AI_next_move } from './store';//This is still needed because you need a custom listener (actually ask about this)
import { socketConnectCreator, socketDisconnectCreator, addSocketListenerCreator, tempUpdStoreListener, tempUpdPlayersListener, socketEmitCreator, update_currPlayer_AC } from './socket';
import { UPDATE_CHESS_STORE, NEW_PLAYER, UPDATE_PLAYERS_STORE } from '../js/constants';
import { connect } from 'react-redux';

class Canvas extends React.Component {
  constructor(props){
    super(props);
    console.log(props);
    this.state=Object.assign({},props.storeState,{
      canvas: '',
    })
    this.captureCanvasEl = this.captureCanvasEl.bind(this);
    this.activateAI= this.activateAI.bind(this);
    this.deactivateAI= this.deactivateAI.bind(this);
  }

  deactivateAI(){
    this.props.dispatchDeactivateAI();
  }

  activateAI(){
    this.props.dispatchActivateAI();
    // this.props.dispatchAInextMove();
    mctsMove(mctsGetBestMove());
  }

  captureCanvasEl(canvasEl){//Note, this runs BEFORE componentDidMount!!! (during the first rendering!)
    this.setState(
      {canvas: canvasEl},
    )
  }

  componentDidMount () {

    this.props.socketConnect()

    socketEmitCreator(NEW_PLAYER, prompt("Please enter your name!"), "Updating server store with new player name!")()

    let addSocketListener1= addSocketListenerCreator(UPDATE_CHESS_STORE, tempUpdStoreListener);//ASK HAL IF THERE IS A BETTER WAY TO DO THIS!!!
    addSocketListener1();//CHANGE THIS UP SO NO NEED TO HAVE tempUpdStoreListener.. an anon function will do  ..(update: not so sure anymore.. but try it out)

    let addSocketListener2= addSocketListenerCreator(UPDATE_PLAYERS_STORE, tempUpdPlayersListener);
    addSocketListener2();

    this.unsubscribe= store.subscribe(() => {//react redux generally takes care of store.subscribe, but in this case, you need a custom listener that draws!
      //so you still have to do your own subscribe
      console.log('local store changed... (re)drawing !!');
      console.log('this.storeState changed: to ', this.props.storeState)
      draw(this.state.canvas);
    })

  }

  componentWillUnmount(){
    // clear listeners//STILL NEED TO CLEAR LISTNERS>. I DONT KNOW HOW
    this.props.socketDisconnect();
    this.unsubscribe();
  }

  render() {
    let team=this.props.storeState.currentPlayerState.team;
    let currentTurn=this.props.storeState.chessState.currentTurn;
    let playersState=this.props.storeState.playersState;
    let aiStatus= this.props.storeState.aiState.active;

    return(
      <div>
        {(team === 'red') && <h1 style={{color: 'red'}} className='center'>You are team red!</h1>}
        {(team === 'black') && <h1 style={{color: 'black'}} className='center'>You are team black!</h1>}
        {(team === null) && <h1 style={{color: 'grey'}} className='center'>You are spectating!</h1>}
        <h2 className='center'>Current Turn: {currentTurn} </h2>

        <div className='inline-block'>
        { !aiStatus ? <button onClick={ this.activateAI }>Let AI take Over!</button> : <button onClick={ this.deactivateAI }>Turn off AI!</button> }
          <h3 style={{color: 'grey'}}> Players/Spectators</h3>
          {playersState.map(playerObj=>{
            if(playerObj.team==='red') return(<h4 style={{color: playerObj.team}}>Red Player: {playerObj.name}</h4>)
            else if(playerObj.team==='black') return(<h4 style={{color: playerObj.team}}>Black Player: {playerObj.name}</h4>)
            else return (<h4 style={{color: 'grey'}}>Spectating: {playerObj.name}</h4>)
          })}
        </div>
        <div className='inline-block'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>

        <div className='inline-block'>
          <canvas ref={this.captureCanvasEl} id="chess" width="800" height="800"></canvas>
        </div>
      </div>
    )

  }
}

/* -----------------    CONTAINER     ------------------ */

const mapState = (state) => ({
  storeState: state,
});

const mapDispatch = (dispatch) => (
    {
      dispatchAInextMove: function(moveObj){
        dispatch(action_AI_next_move(moveObj));
      },
      dispatchActivateAI: function(){
        dispatch(activate_AI());
      },
      dispatchDeactivateAI: function(){
        dispatch(deactivate_AI());
      },
      socketConnect: function(){
        dispatch(socketConnectCreator());
      },
      socketDisconnect: function(){
        dispatch(socketDisconnectCreator());
      }
    }
  )

export default connect(mapState, mapDispatch)(Canvas);
