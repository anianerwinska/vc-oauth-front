import React, { Fragment } from 'react';
import './App.css';
import {VcFlow} from './views/VcFlow';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';


export const App =  () => {
  return (
    <Fragment>
    <AppBar position="static">
      <Toolbar>
        <IconButton edge="start" color="red" aria-label="menu">
        </IconButton>
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
