const  express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/products/:productId/reviews', require('./routes/reviewRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));



app.get('/api/health', (req, res)=>{
    res.json({
        success: true, message: ' LUXORA API is runnig!'
    })
})

const PORT = process.env.PORT || 5000;

// Error handler
app.use(require('./middleware/errorHandler'));


connectDB().then(()=>{
    app.listen(PORT,() => {
        console.log('LUXORA Server runnig on port'+PORT);
    });
});