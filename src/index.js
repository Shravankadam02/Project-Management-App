import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './db/index.js';


dotenv.config();

const port = process.env.PORT || 3000;


connectDB().then(() => {
   app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    });
}).catch((error) => {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
});


