const { Schema, model } = require('mongoose');

const TransActionSchema = new Schema({
    from: {
        type: Number,
        required: true
    },
    to: Number,
    amount: {
        type: Number,
        required: true
    },
    user: {
        type: String,
        required: true
    }
},{
    timestamps: {
        createdAt: "transaction_date"
    }
});

module.exports = model('transactions', TransActionSchema);
