import User from '../models/UserModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createClient } from 'redis';

const client = createClient({
  url: 'redis://redis-10526.c263.us-east-1-2.ec2.cloud.redislabs.com:10526',
  password: 'kbjquJqVaDLHpXWUBxpQ1m2h6vimwsFq',
});

client.on('error', (err) => console.log('Redis Client Error', err));

await client.connect();

export const getUsers = async (req, res) => {
  const redis_key = 'get_all_users';
  const reply = await client.get(redis_key);
  if (reply) {
    res.status(200).json(JSON.parse(reply));
  } else {
    console.log('call mongoDB');
    try {
      const users = await User.find({}).select(
        'userName accountNumber emailAddress identityNumber'
      );
      await client.set(redis_key, JSON.stringify(users));
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      'userName accountNumber emailAddress identityNumber'
    );
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getAccountNumber = async (req, res) => {
  try {
    const user = await User.find({
      accountNumber: req.params.accountNumber,
    }).select('userName accountNumber emailAddress identityNumber');
    if (user.length === 0)
      return res.status(404).json({ message: 'Data is not found!' });
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getIdentityNumber = async (req, res) => {
  try {
    const user = await User.find({
      identityNumber: req.params.identityNumber,
    }).select('userName accountNumber emailAddress identityNumber');
    if (user.length === 0)
      return res.status(404).json({ message: 'Data is not found!' });
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const addUser = async (req, res) => {
  const redis_key = 'get_all_users';
  const {
    userName,
    accountNumber,
    emailAddress,
    identityNumber,
    password,
    confirmPassword,
  } = req.body;
  if (password !== confirmPassword)
    return res
      .status(400)
      .json({ message: 'Password and confirm password is not match!' });
  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(password, salt);
  try {
    await User.create({
      userName: userName,
      accountNumber: accountNumber,
      emailAddress: emailAddress,
      identityNumber: identityNumber,
      password: hashPassword,
    });
    res.json({ message: 'Save has been successfull!' });
    const users = await User.find({}).select(
      'userName accountNumber emailAddress identityNumber'
    );
    await client.set(redis_key, JSON.stringify(users));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const editUser = async (req, res) => {
  const checkId = await User.findById(req.params.id);
  if (!checkId) return res.status(404).json({ message: 'Data is not found!' });
  try {
    const user = await User.updateOne(
      { _id: req.params.id },
      { $set: req.body }
    );
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const checkId = await User.findById(req.params.id);
  if (!checkId) return res.status(404).json({ message: 'Data is not found!' });
  try {
    const result = await User.deleteOne({ _id: req.params.id });
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const user = await User.find({
      emailAddress: req.body.emailAddress,
    });
    if (user.length === 0)
      return res.status(404).json({ message: 'Email is not found!' });
    const match = await bcrypt.compare(req.body.password, user[0].password);
    if (!match) return res.status(400).json({ message: 'Wrong password!' });
    const _id = user[0]._id;
    const userName = user[0].userName;
    const emailAddress = user[0].emailAddress;
    const accessToken = jwt.sign(
      { _id, userName, emailAddress },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: '1d',
      }
    );
    const refreshToken = jwt.sign(
      { _id, userName, emailAddress },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: '1d',
      }
    );
    await User.updateOne({ _id: _id }, { refreshToken: refreshToken });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ accessToken });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
