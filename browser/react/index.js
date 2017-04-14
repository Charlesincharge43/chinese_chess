'use strict';
import { Router, Route, hashHistory, IndexRoute} from 'react-router';//what's going on here?
import React from 'react';
import ReactDOM from 'react-dom';
import Canvas from './Canvas.js';
import { store } from './store';

import { Provider } from 'react-redux';

ReactDOM.render(
  (
    <Provider store={store}>
      <Router history={hashHistory}>
        <Route path="/" component={Canvas} />
      </Router>
    </Provider>
  ), document.getElementById('app')
);
