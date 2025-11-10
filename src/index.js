import 'dotenv/config';
import connectDB from './db/index.js';
import { app } from './app.js';


connectDB()
.then(() => {
    const port = process.env.port || 8000;
    app.on('error', (error) => {
        console.error('Unable to start server!!');
        throw error;
    })
    app.listen(port, () => {
        console.log(`Server running at port: ${port}`);
    })
})
.catch((err) => {
    console.error('DB connection failed: ', err);
})