import { useContext, useEffect, useState } from "react";
import { ApiContext } from "../api";
import Navigation from "../comp/Navigation";
import { PageBody } from "../styles/styling";
import profileImg from '../assets/dp.jpg';
import { Button } from "@material-ui/core";
import TitleImg from '../assets/working.jpg';
import { useHistory } from "react-router";

export default function DiscoverCelebrityPage () {
  const [ celebrities, setCelebrities ] = useState([]);
  const api = useContext(ApiContext);
  const history = useHistory();
  useEffect(() => {
    const callApi = async () => {
      const resp = await api.getCelebrityDiscover();
      if (resp.status === 200) {
        const respJson = await resp.json();
        setCelebrities(respJson.celebrities);
        // setCelebrities(mockCelebrities);
      } else {
        alert(`Server returned with status ${resp.status}`);
      }
    }
    callApi();
  }, [api])
  
  const renderCelebs = () => {
    if (celebrities.length === 0) {
      const msgStyle = {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '2rem',
        marginTop: '3rem',
        color: 'grey',
      }
      return (
        <div style={msgStyle}>
          There are currently no celebrities :c
        </div>
      )
    }
    return celebrities.map(c => {
      const panelStyle = {
        backgroundColor: '#ffffff',
        boxSizing: 'border-box',
        margin: '1rem',
        display: 'flex',
        flexDirection : 'column',
        width: '300px',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '5px',
      }
      const contentWrapStyle = {
        borderTop: '1px solid grey',
        padding: '20px',
        boxSizing: 'border-box',
        width: '100%',
      }
      const usernameStyle = {
        fontSize: '30px',
        marginBottom: '10px',
        display: 'flex',
        justifyContent: 'flex-start',
        width: '100%',
      }
      const dpStyle = {
        borderTopLeftRadius: '5px',
        borderTopRightRadius: '5px',
        width: '100%',
      }
      const followerNumStyle = {
        display: 'flex',
        justifyContent: 'flex-start',
        width: '100%',
      }
      const btnWrapStyle = {
        display: 'flex',
        justifyContent: 'flex-end',
        width: '100%',
      }
      return (
        <div style={panelStyle}>
          <img style={dpStyle} src={profileImg} alt="profile"/>
          <div style={contentWrapStyle}>
            <div style={usernameStyle}>{c.username}</div>
            <div style={followerNumStyle}>{`${Math.floor(Math.random() * 100)} Followers`}</div>
            <div style={btnWrapStyle}>
              <Button color="secondary">Follow</Button>
            </div>
          </div>
        </div>
      )
    })
  }
  
  const panelsContainStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
  }
  
  const titleStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '3rem',
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontWeight: '600',
    minHeight: '60vh',
    backgroundColor: '#EAEEF7',
    color: 'white',
  }
  
  const titleTagStyle = {
    color: '#6D6875',
  }
  
  const titleImgStyle = {
    width: 'auto',
    height: '50vh',
  }
  
  return (
    <PageBody>
      <Navigation/>
      <div style={titleStyle}>
        <div>
          <div style={titleTagStyle}>Discover 
            <span style={{ color: '#F4C54F' }}> your </span>
            favourite celebrities
          </div>
          <Button 
            onClick={() => history.push('/celebrity/request')}
            variant="contained" color="secondary">Become a celebrity now</Button>
        </div>
        <img style={titleImgStyle} src={TitleImg} alt="title"/>
      </div>
      <div style={panelsContainStyle}>
        { renderCelebs() }
      </div>
    </PageBody>
  )
}