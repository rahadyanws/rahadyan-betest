import User from '../models/UserModel.js';
import jwt from 'jsonwebtoken';

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);
    const user = await User.find({ refreshToken: refreshToken });
    if (!user[0]) return res.sendStatus(403);
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) res.sendStatus(403);
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
        res.json({ accessToken });
      }
    );
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
