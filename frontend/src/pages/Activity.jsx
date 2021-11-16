import Paper from '@material-ui/core/Paper';
import axios from "axios";
import { apiBaseUrl } from '../comp/const';
import { Button, TextField } from '@material-ui/core';
import { useState } from 'react';

const Activity = (props) => {
  const token = localStorage.getItem('token');

  const handleLike = async() => {
    try {
      const resp = await axios.post(`${apiBaseUrl}/activity/like`, {
        token: token,
        aid: props.aid
    });
    //console.log(resp.data);
    props.getActivityCallBack()
    } catch (e) {
      alert(e);
    }
  }

  const [comment, setComment] = useState('');
  const handleOnSubmit = async(e) => {
    e.preventDefault()
    console.log(comment);
    try {
      const resp = await axios.post(`${apiBaseUrl}/activity/comment`, {
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
    <>
    <Paper elevation={1} style={{display: 'flex', marginBottom: 10, marginTop:10, padding: 10}}>
      <div>{props.time}</div>:
      <div style={{marginLeft: 30}}>{props.message}</div>
      <div style={{marginLeft: 30}}>{props.likes}</div>
      <Button onClick={handleLike}>Like</Button>
    </Paper>
    {
      props.userComments.map(index => {
        let subString = index.time.substring(11,16)
        return <div>{subString} - {index.ownerName}: {index.message}</div>
      })
    }
    <form noValidate autoComplete="off" onSubmit={handleOnSubmit}>
      <TextField id="standard-basic" label="Comment" value={comment} onChange={(e) => setComment(e.target.value)}/>
    </form>
    </>
  )
}

export default Activity;