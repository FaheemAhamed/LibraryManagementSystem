const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); 
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');

dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Library Management API is running...'); 
}); 


app.use('/api/users', userRoutes);
app.use("/api/books", bookRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});