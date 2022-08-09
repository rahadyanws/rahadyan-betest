import mongoose from 'mongoose';

mongoose.connect('mongodb+srv://rahadyanwidhis:HOn0TWZHgu789ZvE@cluster0.870ak.mongodb.net/db_rahadyan_betest?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Database = mongoose.connection;

export default Database;
