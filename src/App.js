import React, { Fragment } from 'react';
import './App.css';
import {VcFlow} from './views/VcFlow';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';


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
      <VcFlow/>

    </Fragment>
  );
};

export default App;
