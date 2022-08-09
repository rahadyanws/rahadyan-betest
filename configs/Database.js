import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/db_rahadyan_betest', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Database = mongoose.connection;

export default Database;
