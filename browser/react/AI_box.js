
import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

import { mctsGetBestMove, mctsMove } from '../js/chess_board';
import { activate_AI, deactivate_AI, action_AI_next_move, set_AI_thinking_on, set_AI_thinking_off, store } from './store';
import AI_Status from './AI_Status';



class AI_box extends React.Component {
  constructor(props){
    super(props);
    this.state={
      active: false,
      thinking: false,
    };

    this.activateAI= this.activateAI.bind(this);
    this.deactivateAI= this.deactivateAI.bind(this);
  }

  deactivateAI(){
    this.props.dispatchDeactivateAI();
    this.setState({active: false})
  }

  activateAI(){
    this.setState({active: true})
    this.props.dispatchActivateAI();
  }

  componentDidMount(){
    this.unsubscribe= store.subscribe(() => {
      // console.log('here')
      // console.log("is thinking? ", this.state.thinking)
      // console.log('AIs team ', this.props.currentPlayerState.team)
      // console.log("current turn ", this.props.chessState.currentTurn)
      // console.log('AI activated? ', this.state.active)
      setTimeout(()=>{
        if(!this.state.thinking && this.props.currentPlayerState.team === this.props.chessState.currentTurn && this.state.active){
          this.setState({thinking: true})
          console.log('AI will run')
          mctsMove(mctsGetBestMove());
        }
        // this.setState({thinking: true})
        // mctsMove(mctsGetBestMove());
        // this.setState({thinking: false})
        setTimeout(()=>{
          this.setState({thinking: false})
              }
          , 250)
            }
        , 250);//this is my hacky solution for making the server

    })
  }

  render(){
    let aiStatus= this.props.aiState.active;
    return(

      <div>
          { !aiStatus ? <button onClick={ this.activateAI }>Let AI take Over!</button> : <button onClick={ this.deactivateAI }>Turn off AI!</button> }
        <p></p>
        <AI_Status />
      </div>

    )
  }
}


const mapDispatch = (dispatch) => ({
  // dispatchAInextMove: function(moveObj){
  //   dispatch(action_AI_next_move(moveObj));
  // },
  dispatchAIthinkingOn: function(){
    dispatch(set_AI_thinking_on());
  },
  dispatchAIthinkingOff: function(){
    dispatch(set_AI_thinking_off());
  },
  dispatchActivateAI: function(){
    dispatch(activate_AI());
  },
  dispatchDeactivateAI: function(){
    dispatch(deactivate_AI());
  },
})

const mapState = ({aiState, currentPlayerState, chessState }) => ({
  aiState,
  currentPlayerState,
  chessState,
});

export default connect(mapState, mapDispatch)(AI_box);
