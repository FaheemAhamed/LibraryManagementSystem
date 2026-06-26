const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); 
const authRoutes = require('./routes/authRoutes');
const memberRoutes = require('./routes/memberRoutes');
const bookRoutes = require('./routes/bookRoutes');

dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Library Management API is running...'); 
}); 

app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/books', bookRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});