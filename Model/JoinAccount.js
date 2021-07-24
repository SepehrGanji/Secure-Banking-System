const { Schema, model, Types } = require('mongoose');

const JoinAccountSchema = new Schema({
    account_id: {
        type: Types.ObjectId,
        ref: 'accounts',
        required: true
    },
    user_name: {
        type: String,
        required: true
    },
    conf_label: {
        type: String,
        enum: [
            "TS",
            "S",
            "C",
            "U"
        ]
    },
    int_label: {
        type: String,
        enum: [
            "VT",
            "T",
            "ST",
            "U"
        ]
    },
    pending: {
        type: Boolean,
        required: true,
        default: true
    }
});

module.exports = model('joinaccount', JoinAccountSchema);
