import React, { Fragment } from 'react';
import './App.css';
// import {VcFlow} from './views/VcFlow';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import {VcReceiptFlow} from './views/VcReceiptFlow';


export const App =  () => {
  return (
    <Fragment>
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6">
          Przepływ wystawiania weryfikowalnych poświadczeń
        </Typography>
      </Toolbar>
    </AppBar>
      <br/>
      <br/>
      <VcReceiptFlow/>

    </Fragment>
  );
};

export default App;
