import * as React from 'react';
// MUI5 for navabr
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import Popover from '@mui/material/Popover';

import { useHistory } from 'react-router';
import { ApiContext } from '../api';

// MUI4 for the rest
import { makeStyles } from '@material-ui/core/styles';

import { Typography } from '@material-ui/core';
import { Grid } from '@material-ui/core';


import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';

import {TabButton, CreatePortContent, CreatePortField} from '../styles/styling'; 
import Navigation from './Navigation';

// adjust container height to change how many cards are displayed on the right column. hacky solution
const useStyles = makeStyles({
  box: {
    height: "100%",
    width: "100%"
  },
  container: {
    height: "800px"
  },
  innerContainer: {
    height: "100%"
  },
  item: {
    flex: "auto"
  },
  root: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});

export default function Dashboard() {
  const api = React.useContext(ApiContext);
  let history = useHistory(); 
  const token = localStorage.getItem('token');

  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [name, setName] = React.useState('');

  // handle logout
  const onLogOut = async () => {
    const resp = await api.authLogout(token);
    if (resp.status === 403) alert('Invalid token');
    if (resp.status === 200) {
        alert('Token has been invalidated');
        history.push('/');
    } else {
        alert(`Server returned unexpected status code of ${resp.status}`);
    }
  }

  // handle delete user
  const onDeleteUser = async () => {
    console.log(token);

    const resp = await api.authDelete(token);
    if (resp.status === 403) alert('Invalid token');
    if (resp.status === 200) {
        alert('Account has been delted');
        history.push('/');
    } else {
        alert(`Server returned unexpected status code of ${resp.status}`);
    }
  }

  //handle popover open and close
  const handleCreatePort = (event) => {
    setAnchorEl(event.currentTarget);
  }
  const handleClose = () => {
    setAnchorEl(null);  
  }
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover': undefined;

  const submitNewPort = async(e) => {
    console.log(token);
    api.post('user/pf/create',{
      body:JSON.stringify({
        token,
        name,
      }),
    })
      .then (() =>{
        alert('New portfolio named:'+name+ ' was created');
      })
      .catch ((err)=> {
        alert(err);
      })
    e.preventDefault();
    return null;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Navigation />
      <br/>
      <Grid spacing={4} className={classes.container} container>
        <Grid xs={9} item>
          
          <Card className={classes.root}>
            <CardContent>
            <TabButton >Dashboard</TabButton>
            <TabButton id="createPortButton" onClick={handleCreatePort}>
              Add New Portfolio
            </TabButton>
              <Typography className={classes.title} color="textSecondary" gutterBottom>
                Word of the Day Word of the DayWord of the DayWord of 
                Word of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of the ord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWoord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWoord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWoord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWoord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWoord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWoord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWoord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWoord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWoord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWoord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWoord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWoord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWord of the Day Word of the DayWord of the DayWord of theWo
              </Typography>
              
              <Typography className={classes.pos} color="textSecondary">
                adjective
              </Typography>
              <Typography variant="body2" component="p">
                well meaning and kindly.
                <br />
                {'"a benevolent smile"'}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small">Learn More</Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid xs={3} item>
          <Grid
            spacing={4}
            direction="column"
            justifyContent="space-evenly"
            className={classes.container}
            container
          >
            <Grid className={classes.item} item>
              <Card className={classes.root}>
                <CardContent>
                  <Typography className={classes.title} color="textSecondary" gutterBottom>
                    Overview of earnings/losses
                  </Typography>
                  
                  <Typography className={classes.pos} color="textSecondary">
                    adjective
                  </Typography>
                  <Typography variant="body2" component="p">
                    well meaning and kindly.
                    <br />
                    {'"a benevolent smile"'}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small">Learn More</Button>
                </CardActions>
              </Card>
            </Grid>

            <Grid className={classes.item} item>
              <Card className={classes.root}>
                <CardContent>
                  <Typography className={classes.title} color="textSecondary" gutterBottom>
                    Weekly leaderboard
                  </Typography>
                  
                  <Typography className={classes.pos} color="textSecondary">
                    adjective
                  </Typography>
                  <Typography variant="body2" component="p">
                    well meaning and kindly.
                    <br />
                    {'"a benevolent smile"'}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small">Learn More</Button>
                </CardActions>
              </Card>
            </Grid>

            <Grid className={classes.item} item>
              <Card className={classes.root}>
                <CardContent>
                  <Typography className={classes.title} color="textSecondary" gutterBottom>
                    All user's recent activity
                  </Typography>
                  
                  <Typography className={classes.pos} color="textSecondary">
                    adjective
                  </Typography>
                  <Typography variant="body2" component="p">
                    well meaning and kindly.
                    <br />
                    {'"a benevolent smile"'}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small">Learn More</Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical:'bottom',
          horizontal:'left',
        }}
        transformOrigin={{
          vertical:'top',
          horizontal:'center',
        }}
      >
        <CreatePortContent>
          <form autoComplete="off" onSubmit={submitNewPort}>
            <CreatePortField
              required
              fullWidth
              id="createPortButton"
              label="Enter New Portfolio Name"
              onChange={(e)=> {setName(e.target.value);}}
            />
            <br />
            <Button type="button" onClick={handleClose}>Cancel</Button>
            <Button type="submit">Create Portfolio</Button>
          </form>
        </CreatePortContent>
      </Popover>
    </Box>

  
  );
}
