/**
  This file manages all friend specific functions
*/

import { Database } from "./database";
import { getStock } from "./stocks";
import * as schedule from "node-schedule";
import { API } from "./api";

const api = new API(); 

export const addFriend = async (token, friend, database) => {
    // Return error if no friend given
  if (friend == "") {
    return -1;
  }

  // Return error if user not found
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    return -2;
  }

  // Create the portfolio and return the result
  const friendResp = await database.addFriend(uid, friend);
  return friendResp;
}

export const removeFriend = async (token, friend, database) => {
      // Return error if no friend given
  if (friend == "") {
    return -1;
  }

  // Return error if user not found
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    return -2;
  }

  // Create the portfolio and return the result
  const friendResp = await database.removeFriend(uid, friend);
  return friendResp;
}

export const getFriends = async (token, database) => {
    // Return error if user not found
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    return -1;
  }

  // Create the portfolio and return the result
  const friendResp = await database.getFriends(uid);
  if (friendResp !== -2) {
    const obj = { friends: friendResp };
    return obj;
  }
  return friendResp;
}

export const comment = async (token, aid, message, database) => {
  // Return error if user not found
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    return -1;
  }

  if (message === '') {
    return -2;
  }

  const resp = await database.comment(uid, aid, message);
  if (resp === null) {
    return -3;
  }
  return true;
}

export const like = async (token, aid, database) => {
  // Return error if user not found
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    return -1;
  }  
  const resp = await database.like(uid, aid);
  if (resp === null) {
    return -2;
  }
  return true;
}