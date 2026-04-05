const  mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
        },
    email:{
        type: String,
        required:  true,
        unique: true,
        lowercase: true
    } ,
    password:{
        type: String,
        required: true,
        minlength: 6,
        select: false
    },
    role:{
        type: String,
        enum:['user', 'admin'],
        default:'user'

    },
    avatar:{
        type: String,
        default: ''
    },
    addresses:[{
        fullName: String,
        phone: String,
        street: String,
        city: String,
        state: String,
        pincode: String,
        country:{
            type:String,
            default: 'India'
        }
    }],
    refreshToken:{
        type: String,
        select:false
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
module.exports = mongoose.model('User', userSchema);