import { authRegister } from "../auth";
import { createPf, userPfs, openPf, getPid } from "../portfolio";
import { Database } from "../database";
import request from 'supertest';
import { app, database } from "../index";
import { GridFSBucket } from "mongodb";
import {addFriend, removeFriend, getFriends, voteStock, getVotes, getActivity, like, comment, getComments} from "../social";

describe('Add friends', () => {
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
  it('Adding each other as friends', async () => {
    await addFriend(token1, user2, d);
    let friends1 = await getFriends(token1, d);
    let friends2 = await getFriends(token2, d);
    expect(friends1.friends).toStrictEqual([]);
    expect(friends2.friends).toStrictEqual([]);
  })
  it('Adding each other as friends', async () => {
    await addFriend(token2, user1, d);
    let friends1 = await getFriends(token1, d);
    let friends2 = await getFriends(token2, d);
    expect(friends1.friends[0].uid).toBe(user2);
    expect(friends2.friends[0].uid).toBe(user1);
  })
  it('Removing friends', async () => {
    await removeFriend(token1, user2, d);
    let friends1 = await getFriends(token1, d);
    let friends2 = await getFriends(token2, d);
    expect(friends1.friends).toStrictEqual([]);
    expect(friends2.friends).toStrictEqual([]);
  })
})

describe('stock voting', () => {
	const d = new Database(true);
  beforeAll(async () => {
    await d.connect();
  })

  let token = null;
  let user = null;

  it('Creating two new users', async () => {
    const rego1 = await authRegister('Ashley', 'strongpassword', d);
    token = rego1.token;
    user = rego1.uid;
  })
  it('Voting bull', async () => {
    await voteStock(token, 'IBM', 1, d);
    const votes = await getVotes(token, 'IBM', d);
    expect(votes).toStrictEqual({
      bear: 0,
      bull: 100,
      vote: 1,
    });
  })
  it('Unvoting bull', async () => {
    await voteStock(token, 'IBM', 1, d);
    const votes = await getVotes(token, 'IBM', d);
    expect(votes).toStrictEqual({
      bear: 0,
      bull: 0,
      vote: -1,
    });
  })
  it('Changing from bull to bear', async () => {
    await voteStock(token, 'IBM', 1, d);
    await voteStock(token, 'IBM', 0, d);
    const votes = await getVotes(token, 'IBM', d);
    expect(votes).toStrictEqual({
      bear: 100,
      bull: 0,
      vote: 0,
    });
  })
})

describe('Activity', () => {
	const d = new Database(true);
  beforeAll(async () => {
    await d.connect();
  })

  let token1 = null;
  let token2 = null;
  let token3 = null;
  let user1 = null;
  let user2 = null;
  let user3 = null;
  let aid = null;

  it('Creating two new users', async () => {
    const rego1 = await authRegister('Ashley', 'strongpassword', d);
    token1 = rego1.token;
    user1 = rego1.uid;
    const rego2 = await authRegister('yepp', 'strongpassword', d);
    user2 = rego2.uid;
    token2 = rego2.token;
    await addFriend(token1, user2, d);
    await addFriend(token2, user1, d);
    const rego3 = await authRegister('yyyyyy', 'strongpassword', d);
    user3 = rego3.uid;
    token3 = rego3.token;
    await addFriend(token2, user3, d);
    await addFriend(token3, user2, d);
  })
  it('Checking activity after liking a post', async () => {
    await voteStock(token1, 'IBM', 1, d);
    const activity1 = await getActivity(token1, d);
    aid = activity1[0].aid;
    expect(activity1.length).toStrictEqual(1);
    await like(token2, aid, d);
    const activity2 = await getActivity(token1, d);
    expect(activity2.length).toStrictEqual(2);
    const activity3 = await getActivity(token2, d);
    expect(activity3.length).toStrictEqual(2);
    const activity4 = await getActivity(token3, d);
    expect(activity4.length).toStrictEqual(0);
  })
  it('Checking activity after commenting a post', async () => {
    await comment(token2, aid, "yeet", d);
    const activity1 = await getActivity(token1, d);
    expect(activity1.length).toStrictEqual(3);
    const activity2 = await getActivity(token2, d);
    expect(activity2.length).toStrictEqual(3);
    const activity3 = await getActivity(token3, d);
    expect(activity3.length).toStrictEqual(0);
  })
})