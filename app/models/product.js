const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    productID: {
        type: String,
    },
    productName: {
        type: String,
    }
});

module.exports = mongoose.model('product', productSchema);