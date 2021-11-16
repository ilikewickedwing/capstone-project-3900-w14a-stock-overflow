import { useContext, useRef, useEffect, useState, forwardRef } from "react";
import { ApiContext } from "../api";
import ErrorIcon from '@mui/icons-material/Error';
import { IconButton } from "@material-ui/core";
import NotificationsIcon from '@mui/icons-material/Notifications';
import PropTypes from "prop-types";
import { Badge } from "@mui/material";

const mockNotifs = [
  {
    ownerUid: 'affdsa',
    info: 'Your request has been validated',
  },
  {
    ownerUid: 'affasdfdsa',
    info: 'You have a friend request',
  },
  {
    ownerUid: 'affdasdfsa',
    info: 'Your stocks have increased in value',
  },
  {
    ownerUid: 'affdsasdfa',
    info: 'Give feedback',
  },
]

export default function NotificationButton() {
  const [ open, setOpen ] = useState(false);
  const [ notifications, setNotifications ]= useState([]);
  const api = useContext(ApiContext);
  
  const wrapperRef = useRef(null);
  
  const notifRef = useRef(null);
  
  // Get notifications from backend
  useEffect(() => {
    const getNotifications = async () => {
      const token = localStorage.getItem('token');
      const resp = await api.userNotifications(token);
      const respJson = await resp.json();
      if (resp.status === 200) {
        setNotifications(respJson.notifications);
        // setNotifications(mockNotifs);
      }
    }
    getNotifications();
  }, [api])
  
  // Detect when outside click
  useEffect(() => {
    const sendClearApiCall = () => {
      const token = localStorage.getItem('token');
      if (token !== null) {
        api.userNotificationsClear(token);
      }
    }
    const handleClick = e => {
      if (wrapperRef.current !== null && notifRef.current !== null) {
        const isOpen = notifRef.current.style.display !== 'none';
        if (wrapperRef.current.contains(e.target)) {
          if (!isOpen) {
            setOpen(true);
          } else {
            setOpen(false);
            sendClearApiCall();
          }
        } else {
          if (isOpen) {
            setOpen(false)
            sendClearApiCall();
          }
        }
      }
    }
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    }
  }, [])
  
  const wrapperStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  }
  const notifContainStyle = {
    position: 'relative'
  }
  const renderIcon = () => {
    if (notifications.length === 0) {
      return (<NotificationsIcon style={{ fontSize: '2rem', color: '#ffffff' }}/>)
    }
    return (
      <Badge badgeContent={notifications.length} color="secondary">
        <NotificationsIcon style={{ fontSize: '2rem', color: '#ffffff' }}/>
      </Badge>
    )
  }
  return (
    <div ref={wrapperRef} style={wrapperStyle}>
      <IconButton color="primary">
        {renderIcon()}
      </IconButton>
      <div style={notifContainStyle}>
        <Notifications ref={notifRef} notifications={notifications} open={open} setOpen={setOpen}/>
      </div>
    </div>
  )
}

const Notifications = forwardRef((props, ref) => {
  const api = useContext(ApiContext);
  // const wrapperRef = useRef(null);
  // Tell api that all notifications are read when opened
  useEffect(() => {
    if (props.open) {
      const token = localStorage.getItem('token');
      api.userNotificationsClear(token);
    }
  }, [props.open, api])
  
  const renderNotifs = () => {
    const notifPanelStyle = {
      display: 'flex',
      padding: '1rem',
      alignItems: 'center',
      borderTop: '1px solid grey',
    }
    const infoStyle = {
      marginLeft: '1rem',
      fontSize: '0.9rem',
    }
    if (props.notifications.length === 0) {
      return (
        <div style={{ borderTop: '1px solid grey', textAlign: 'center', padding: '1rem' }}>
          You have no new notifications
        </div>
      )
    }
    return props.notifications.map((n, i) => {
      return (
        <div key={i} style={notifPanelStyle}>
          <ErrorIcon style={{ color: '#2F87FA', fontSize: '0.9rem' }}/>
          <div style={infoStyle}>{n.info}</div>
        </div>
      )
    })
  }
  let panelWrapperStyle = {
    position: 'absolute',
    zIndex: '99999999',
    top: '0px',
    right: '0px',
    backgroundColor: '#ffffff',
    boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
    padding: '0.3rem',
    width: '300px',
    marginTop: '2rem',
    borderRadius: '5px',
  }
  if (!props.open) {
    panelWrapperStyle = { display: 'none' }
  }
  const notifHeaderStyle = {
    display: 'flex',
    justifyContent: 'center',
    fontWeight: '600',
    padding: '0.5rem',
  }
  return (
    <div ref={ref} style={panelWrapperStyle}>
      <div style={notifHeaderStyle}>Notifications</div>
      { renderNotifs() }
    </div>
  )
});

Notifications.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  notifications: PropTypes.array,
}