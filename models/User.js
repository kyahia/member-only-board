const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
   fullname: { type: String, required: true },
   username: { type: String, required: true, unique: true },
   email: { type: String, required: true },
   password: String,
   membership: { type: String, default: 'visitor', enum:{ values: ['visitor', 'author'] } }
});

UserSchema.virtual('url').get(function(){ return '/user/' + this._id });

//Export model
module.exports = mongoose.model('User', UserSchema);