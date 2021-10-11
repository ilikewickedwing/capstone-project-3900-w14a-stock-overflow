import { createContext } from "react";

const ENDPOINT = 'http://localhost:5050'

export const ApiContext = createContext();

const getToken = () => (`Bearer ${localStorage.getItem('token')}`);

/**
 * Wrapper class to make API calls
 */
export default class API {
  /**
   * Fetches the user profile from the backend endpoint
   * @param {string} uid 
   * @returns {Promise}
   */
  userProfile(uid) {
    return fetch(`${ENDPOINT}/user/profile?uid=${uid}`)
  }

  /**
   * Calls the login endpoint
   * @param {string} username 
   * @param {string} password 
   * @returns {Promise}
   */
  authLogin(username, password) {
    return fetch(`${ENDPOINT}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    });
  }
  /**
   * Logs out and invalidates a given token
   * @param {string} token
   * @returns {Promise}
   */
  authLogout(token) {
    return fetch(`${ENDPOINT}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify({
        token: token
      })
    });
  }
  /**
   * Calls the register endpoint
   * @param {string} username 
   * @param {string} password 
   * @returns {Promise}
   */
  authRegister(username, password) {
    return fetch(`${ENDPOINT}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    });
  }

  authDelete(token) {
    return fetch(`${ENDPOINT}/auth/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify({
        token: token,
      })
    });
  }

  post(path, options){
    return fetch(`${ENDPOINT}/${path}`,{
      ...options,
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: getToken(),
      },
    });
    }

  get(path, options){
    return fetch(`${ENDPOINT}/${path}`,{
      ...options,
      method: 'GET',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: getToken(),
      },
    });
    }
}
