const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = Schema({
  content: String,
  creatorId: String,
  picPath: String,
  picName: String,
  comments: [{
    content: String,
    authorId: String,
    imagePath: String,
    imageName: String
  }]
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;
