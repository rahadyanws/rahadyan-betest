import express from 'express';
import db from './configs/Database.js';
import router from './routes/index.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

db.on('error', (err) => console.error(err));
db.once('open', () => console.log('MongoDB connected!'));

const app = express();
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use('/user', router);

app.listen('3000', () => console.log('Server running at port:3000'));
