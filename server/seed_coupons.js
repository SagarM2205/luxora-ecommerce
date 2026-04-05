require('dotenv').config();
const mongoose = require('mongoose');
const Coupon = require('./models/Coupon');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB");
    await Coupon.deleteMany(); // Reset
    await Coupon.create([
      { code: 'LUXORA10', discountPercentage: 10, maxDiscountAmount: 2000 },
      { code: 'WELCOME20', discountPercentage: 20, maxDiscountAmount: 5000 },
    ]);
    console.log("Coupons seeded!");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
