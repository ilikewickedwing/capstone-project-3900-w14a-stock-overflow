/**
  This file manages all friend specific functions
*/

import { Database } from "./database";
import { getStock } from "./stocks";
import * as schedule from "node-schedule";
import { checkStock } from "./stocks";
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

export const declineFriend = async (token, friend, database) => {
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
  const friendResp = await database.declineFriend(uid, friend);
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
  if (Array.isArray(friendResp)) {
    const obj = { friends: friendResp };
    return obj;
  }
  return friendResp;
}

export const getFriendReq = async (token, database) => {
  // Return error if user not found
const uid = await database.getTokenUid(token);
if (uid === null) {
  return -1;
}

// Create the portfolio and return the result
const friendResp = await database.getFriendReq(uid);
if (Array.isArray(friendResp)) {
  const obj = { friendReq: friendResp };
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

  return resp;
}

export const getComments = async (token, aid, database) => {
  // Return error if user not found
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    return -1;
  }

  const resp = await database.getComments(aid);
  if (resp === null) {
    return -3;
  }
  return resp;
}

export const like = async (token, aid, database) => {
  // Return error if user not found
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    return -1;
  }  
  const resp = await database.like(uid, aid);
  
  return resp;
}

// type: 1 = bull, 0 = bear
export const voteStock = async (token, stock, type, database) => {
  // Return error if user not found
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    return -1;
  }  

  // Return error if stock is not valid
  if (!await checkStock(stock)) {
    return -2;
  }

  const resp = await database.voteStock(uid, stock, type);
  return resp;
}

export const getVotes = async (token, stock, database) => {
  // Return error if user not found
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    return -1;
  }  
  const resp = await database.getVotes(uid, stock);
  return resp;
}


export const getActivity = async (token, database) => {
  // Return error if user not found
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    return -1;
  }  
  const resp = await database.getActivity(uid);
  if (resp === null) {
    return -2;
  }
  return resp;
}