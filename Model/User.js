const { Schema, model } = require('mongoose');
const CryptoJS = require('crypto-js');

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
},{
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

userSchema.pre('save', function (next){
   if(this.isNew || this.isModified('password')){
       this.password = CryptoJS.SHA256("SALT" + this.password + "9733713").toString();
   }
   next();
});

userSchema.methods.checkPassword = function (password){
    return CryptoJS.SHA256("SALT" + password + "9733713").toString() === this.password;
};

module.exports = model('users', userSchema);
