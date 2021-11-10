import { authRegister } from "../auth";
import { createPf, deletePf, userPfs, openPf, getPid, editPf } from "../portfolio";
import { Database } from "../database";
import request from 'supertest';
import { app, database } from "../index";
import { GridFSBucket } from "mongodb";
import {addFriend, removeFriend, getFriends} from "../social";

describe('Add freinds', () => {
	const d = new Database(true);
  beforeAll(async () => {
    await d.connect();
  })

  let token1 = null;
  let token2 = null;
  let user1 = null;
  let user2 = null;

  it('Creating two new users', async () => {
    const rego1 = await authRegister('Ashley', 'strongpassword', d);
    token1 = rego1.token;
    user1 = rego1.uid
    const rego2 = await authRegister('yepp', 'strongpassword', d);
    user2 = rego2.uid;
    token2 = rego2.token;
  })
  it('Addign each otehr as friends', async () => {
    await addFriend(token1, user2, d);
    let friends1 = await getFriends(token1, d);
    let friends2 = await getFriends(token2, d);
    expect(friends1).toBe(expect.any(Object));
    expect(friends2).toBe(expect.any(Object));
  })
  it('Addign each otehr as friends', async () => {
    await addFriend(token2, user1, d);
    let friends1 = await getFriends(token1, d);
    let friends2 = await getFriends(token2, d);
    expect(friends1).toBe(expect.any(Object));
    expect(friends2).toBe(expect.any(Object));
  })
  it('Addign each otehr as friends', async () => {
    await removeFriend(token1, user2, d);
    let friends1 = await getFriends(token1, d);
    let friends2 = await getFriends(token2, d);
    expect(friends1).toBe(expect.any(Object));
    expect(friends2).toBe(expect.any(Object));
  })
})