import dotenv from 'dotenv';
import connectDB from './db/index.js';
import { app } from './app.js';

dotenv.config();

connectDB()
.then(() => {
    const port = process.env.port || 8000;
    app.on('error', (error) => {
        console.log('Unable to start server!!');
        throw error;
    })
    app.listen(port, () => {
        console.log(`Server running at port: ${port}`);
    })
})
.catch((err) => {
    console.log('DB connection failed: ', err);
})