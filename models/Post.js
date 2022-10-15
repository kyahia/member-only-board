const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
   title: { type: String, required: true },
   content: { type: String, required: true },
   user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

PostSchema.virtual('url').get(function(){ return '/post/' + this._id });

//Export model
module.exports = mongoose.model('Post', PostSchema);