import mongoose from 'mongoose';

const User = mongoose.Schema({
  userName: {
    type: String,
    require: true,
  },
  accountNumber: {
    type: Number,
    require: true,
    index: true,
  },
  emailAddress: {
    type: String,
    require: true,
  },
  identityNumber: {
    type: String,
    require: true,
    index: true,
  },
  password: {
    type: String,
    require: true,
  },
  refreshToken: {
    type: String
  },
});

export default mongoose.model('Users', User);
