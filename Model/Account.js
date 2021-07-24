const { Schema, model, Types } = require('mongoose');

const AccountSchema = new Schema({
    account_no: {
      type: Number,
      required: true,
      unique: true
    },
    account_type: {
        type: String,
        required: true,
        enum: [
            "SHORT",
            "LONG",
            "CURR",
            "CHAR"
        ]
    },
    money: {
        type: Number,
        required: true,
        min: 0
    },
    conf_label: {
        type: String,
        required: true,
        enum: [
            "TS",
            "S",
            "C",
            "U"
        ]
    },
    int_label: {
        type: String,
        required: true,
        enum: [
            "VT",
            "T",
            "ST",
            "U"
        ]
    },
    owner: {
        type: Types.ObjectId,
        ref: 'users',
        required: true
    }
},{
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

module.exports = model('accounts', AccountSchema);
