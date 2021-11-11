import { Step, StepLabel, Stepper } from "@material-ui/core";
import React, { useContext, useState } from "react"
import PropTypes from 'prop-types';
import { Button } from "@material-ui/core";
// Free stock photo taken from https://www.vecteezy.com/vector-art/3339946-women-freelance-with-laptop-sitting-on-bench-in-park-concept
import VectorImg from '../assets/pixelworking.jpg';
// Taken from https://www.freepik.com/free-vector/cloud-computing-security-abstract-concept-illustration_11668583.htm#page=1&query=security&position=1&from_view=keyword
import SecureImg from '../assets/secure.jpg';
// Taken from https://www.freepik.com/free-vector/finish-line-concept-illustration_7766414.htm#page=1&query=finish&position=3&from_view=search
import FinishImg from '../assets/finish.jpg';
import FileUpload from "../files/FileUpload";
import FileDownload from "../files/FileDownload";
import { ApiContext } from "../api";
import { useHistory } from "react-router";

const steps = ['Why become a celebrity?', 'Complete form', 'Verify your identity', 'Finish']

export default function CelebrityRequestPage() {
  const [ activeStep, setActiveStep ] = useState(0);
  const [ info, setInfo ] = useState('');
  const [ fids, setFids ] = useState([]);
  const [ fileMap, setFileMap ] = useState({});
  const api = useContext(ApiContext);
  const token = localStorage.getItem('token');
  const pageStyle = {
    backgroundColor: '#6D6875',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  }
  const widgetWrapperStyle = {
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '5px',
    width: '75%',
    height: '75%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  }
  const makeApiRequest = async () => {
    const resp = await api.postCelebrityMakeRequest(token, info, fids);
    if (resp.status !== 200) {
      const respJson = await resp.json();
      alert(respJson.error); 
    }
    return;
  }
  return (
    <div style={pageStyle}>
      <div style={widgetWrapperStyle}>
        <Stepper activeStep={activeStep}>
          { steps.map((label, i) => (
            <Step key={i}>
              <StepLabel>
                <span style={{ fontWeight: '600' }}>
                  {label}
                </span>
              </StepLabel>
            </Step>
          )) }
        </Stepper>
        <StepPage step={0} activeStep={activeStep} setActiveStep={setActiveStep}>
          <StartPage/>
        </StepPage>
        <StepPage step={1} activeStep={activeStep} setActiveStep={setActiveStep}>
          <FormPage info={info} setInfo={setInfo}/>
        </StepPage>
        <StepPage step={2} activeStep={activeStep} setActiveStep={setActiveStep}>
          <VerifyIdentityPage setFileMap={setFileMap} setFids={setFids}/>
        </StepPage>
        <StepPage makeApiRequest={makeApiRequest} step={3} activeStep={activeStep} setActiveStep={setActiveStep}>
          <FinishPage info={info} fileMap={fileMap} fids={fids}/>
        </StepPage>
        <WhatNextPage step={4} activeStep={activeStep}/>
      </div>
    </div>
  )
}

function StepPage(props) {
  const pageWrapStyle = {
    display: props.step === props.activeStep ? 'flex' : 'none',
    justifyContent: 'space-between',
    flexDirection: 'column',
    height: '100%',
  }
  const contentWrapStyle = {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '1rem',
    justifyContent: 'center',
    height: '100%',
  }
  const btnWrapStyle = {
    display: 'flex',
    justifyContent: 'space-between',
  }
  const onNext = async () => {
    // If it is finish button call api
    if (props.activeStep === steps.length - 1) {
      await props.makeApiRequest();
    }
    props.setActiveStep(props.activeStep + 1)
  }
  return (
    <div style={pageWrapStyle}>
      <div style={contentWrapStyle}>
        { props.children }
      </div>
      <div style={btnWrapStyle}>
        <Button
          color="inherit"
          disabled={props.activeStep === 0}
          onClick={() => props.setActiveStep(props.activeStep - 1)}
        >
          Back
        </Button>
        <Button
          onClick={onNext}
        >
          { props.activeStep === steps.length -1 ? 'Finish' : 'Next' }
        </Button>
      </div>
    </div>
  )
}

StepPage.propTypes = {
  step: PropTypes.number,
  activeStep: PropTypes.number,
  setActiveStep: PropTypes.func,
  children: PropTypes.any,
  makeApiRequest: PropTypes.func,
}

const headingStyle = {
  textAlign: 'center',
  fontSize: '2rem',
  fontWeight: '600',
  fontFamily: 'Arial, Helvetica, sans-serif',
  padding: '1rem',
  color: '#111111',
}

const textStyle = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: '1.2rem',
  color: '#444444',
  maxWidth: '1000px',
  margin: '2rem',
  width: '100%',
  display: 'flex',
}


function StartPage() {
  const imgStyle = {
    width: '100%',
  }
  return (
    <React.Fragment>
      <div style={headingStyle}>Why become a celebrity?</div>
      <img style={imgStyle} src={VectorImg} alt='logo'/>
      <div style={textStyle}>
        Whether its building your online presence, or sharing with your followers,
        becoming a celebrity is a big deal. Being a celebrity means that people are
        now able to follow you, and keep track of your activity and even better - be
        inspired by you.
      </div>
    </React.Fragment>
  )
}

const questionStyle = {
  fontSize: '1.5rem',
  textAlign: 'center',
  fontFamily: 'Arial, Helvetica, sans-serif',
  marginBottom: '2rem',
}

function FormPage(props) {
  const pageStyle = {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100%',
  }
  return (
    <div style={pageStyle}>
      <div style={questionStyle}>
        Tell us in 200 words or less 
        why you want to become a celebrity.
      </div>
      <textarea 
        onChange={e => props.setInfo(e.target.value)}
        value={props.info} rows="20"></textarea>
    </div>
  )
}

FormPage.propTypes = {
  info: PropTypes.string,
  setInfo: PropTypes.func,
}

function VerifyIdentityPage(props) {
  const imgStyle = {
    width: '250px',
  }
  return (
    <React.Fragment>
      <div style={headingStyle}>Being a celebrity is a big deal</div>
      <img style={imgStyle} src={SecureImg} alt='logo'/>
      <div style={textStyle}>
        We here at StockOverflow understand that becoming a celebrity is a big deal
        . To ensure the safety of our users, please provide documents to verify your
        identity
      </div>
      <div style={questionStyle}>Please upload documents to verify your identity</div>
      <FileUpload setFileMap={props.setFileMap} setFids={props.setFids}/>
  </React.Fragment>
  )
}

VerifyIdentityPage.propTypes = {
  setFids: PropTypes.func,
  setFileMap: PropTypes.func,
}

function FinishPage(props) {
  const infoAnswerStyle = {
    padding: '1rem',
    border: '1px solid grey',
    borderRadius: '3px',
    marginBottom: '1rem',
    width: '100%',
    boxSizing: 'border-box',
    minHeight: '100px',
  }
  const sectionStyle = {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    boxSizing: 'border-box',
    margin: '1rem',
    paddingTop: '1.5rem',
  }
  return (
    <React.Fragment>
        <div style={headingStyle}>You are nearly done!</div>
        <div style={textStyle}>
          Please verify you have given the correct information:
        </div>
        <div style={sectionStyle}>
          <div style={questionStyle}>
            Tell us in 200 words or less 
            why you want to become a celebrity.
          </div>
          <div style={infoAnswerStyle}>{props.info}</div>
        </div>
        <div style={sectionStyle}>
          <div style={questionStyle}>
            Uploaded documents
          </div>
          <FileDownload fids={props.fids} fileMap={props.fileMap}/>
        </div>
    </React.Fragment>
  )
}

FinishPage.propTypes = {
  info: PropTypes.string,
  fids: PropTypes.array,
  fileMap: PropTypes.object,
}

function WhatNextPage(props) {
  const history = useHistory();
  const pageStyle = {
    display: props.step === props.activeStep ? 'flex' : 'none',
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  }
  const imgStyle = {
    width: '300px',
  }
  return (
    <div style={pageStyle}>
      <div style={headingStyle}>Your request has been sent! Whats next?</div>
      <img style={imgStyle} src={FinishImg} alt='logo'/>
      <div style={questionStyle}>
        Our team will review your application to become a celebrity and
        you will be notified if your application is successful. Please
        wait up to 2-3 days for our team to get back to you.
      </div>
      <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
        <Button 
          onClick={() => history.push('/dashboard')}
          color="primary">Go back to dashboard</Button>
      </div>
    </div>
  )
}

WhatNextPage.propTypes = {
  step: PropTypes.number,
  activeStep: PropTypes.number,
}