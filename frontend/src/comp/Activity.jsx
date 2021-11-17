import Paper from '@material-ui/core/Paper';
import React from 'react'; 
import axios from "axios";
import { apiBaseUrl } from './const';
import { Button, TextField } from '@material-ui/core';
import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';

const Activity = (props) => {
  // 0 =hide, 1= view
  const [toggle, setToggle] = React.useState(false);
  const token = localStorage.getItem('token');
  const uid =localStorage.getItem('uid');
  
  const handleLike = async() => {
    try {
      await axios.post(`${apiBaseUrl}/activity/like`, {
        token: token,
        aid: props.aid
    });

    props.getActivityCallBack()
    } catch (e) {
      alert(e);
    }
  }

  const [comment, setComment] = useState('');
  const handleOnSubmit = async(e) => {
    e.preventDefault()
    try {
      await axios.post(`${apiBaseUrl}/activity/comment`, {
        token: token,
        aid: props.aid,
        message: comment
    });
    props.getActivityCallBack()
    } catch (e) {
      alert(e);
    }
    setComment('');
  }

  return (
    <div>
      <span style={{fontWeight:'bold'}}> {props.time} </span>
      <Paper elevation={3} style={{display: 'flex', flexDirection:'column', margin:'1%', padding: "1%", marginBottom:'2%'}}>
        <div>{props.message}</div>
        <div>likes: {props.likes}</div>
        <div>
          <IconButton onClick={handleLike}>
            {
              (props.likedUsers.indexOf(uid) !== -1) ? (
                <ThumbUpOutlinedIcon style={{color:"green"}} />
              ):(
                <ThumbUpOutlinedIcon style={{color:"grey"}}  />  
              )
            }
          </IconButton>
          <IconButton onClick={() => setToggle(!toggle)}>
              <CommentOutlinedIcon /> 
          </IconButton>
      {toggle &&
        <form noValidate autoComplete="off" onSubmit={handleOnSubmit}>
          <TextField fullWidth id="standard-basic" label="Comment" value={comment} onChange={(e) => setComment(e.target.value)}/>
        </form>
      }
        </div>
          {
            props.userComments.map((e,i) => {
                let subString = e.time.substring(11,16)
                return (
                  <div style={{margin:'0px 0px 2px 10px'}} key={i}>
                    <span style={{fontWeight:'bold'}}>{e.time.split('T')[0]} {subString} </span> - {e.ownerName}: {e.message}
                  </div>
                )
            })
          }
      </Paper>
    </div>
  )
}

export default Activity;