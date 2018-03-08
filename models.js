import mongoose from 'mongoose';

var userSchema = new mongoose.Schema({
    username: String,
    password: String
})

var productSchema = new mongoose.Schema({
    price: Number,
    title: String,
    description: String,
    imageUri: String
})

export var User = mongoose.model('User', userSchema);
export var Product = mongoose.model('Product', productSchema);


module.exports = {
    User: User,
    Product: Product
}