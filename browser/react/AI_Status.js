import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { store } from './store';//f*ck it just gonna import it for now.. later do mapdispatch
import { addSocketListenerCreator } from './socket';
import { UPDATE_OPP_AI_STAT } from '../js/constants'


class AI_Status extends React.Component {

  componentDidMount (){

  }

  componentWillUnmount(){
    //clear listenners?  dont know how
  }

  render(){
    let status= this.props.opponentAIStat.status;
    console.log(status)
    return (
      <div>
        <h3>AI Status</h3>
        { status=== 'Thinking ...' && <div><h4 className='blink_me'> Thinking... </h4>{/* <h5>(running minimax with alpha beta pruning)</h5> */}</div> }
        { status=== 'Finalizing ...' && <div><h4> Finalizing...</h4>{/*<h5>(running monte carlo tree search for long term planning)</h5>*/}</div> }
        { status=== 'Waiting' && <div><h4> Waiting </h4></div>}
      </div>
    )
  }
}

const mapState = ({ opponentAIStat }) => ({
  opponentAIStat,
});

export default connect(mapState)(AI_Status);
