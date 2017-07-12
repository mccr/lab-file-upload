const express = require('express');
const router  = express.Router();
const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login');
const multer  = require('multer');
const upload = multer({ dest: './public/uploads/' });
const Post = require('../models/Post');
const path = require('path');
const debug = require('debug')('tumblr-lab:'+path.basename(__filename));


router.get('/', (req, res, next) => {
  Post.find({}, (err, posts) => {
    debug(posts);
    if (err) {
        next();
        return err;
      } else {
        res.render('posts/index', {
          posts: posts
        });
      }
  });
});

router.get('/new', ensureLoggedIn('/login'), (req, res, next) => {
  res.render('posts/new');
});

router.post('/new', [ensureLoggedIn('/login'), upload.single('photo')], (req, res, next) => {

      const newPost = Post({
        content: req.body.content,
        creatorId: req.user._id,
        picPath: `uploads/${req.file.filename}`,
        picName: req.file.originalname,
        comments: []
      });
      debug(newPost);
      newPost.save((err) => {
        if (err) {
          res.redirect("/posts/new", {
            errorMessage: "Something went wrong"
          });
        } else {
          debug(`new post created`);
          res.redirect("/posts");
        }
      });
});

router.get('/:id/create', ensureLoggedIn('/login'), (req, res, next) => {
  res.render('posts/create', {postId: req.params.id});
});

router.post('/:id', [ensureLoggedIn('/login'), upload.single('photo')], (req, res, next) => {
  debug('post create');
  const newComment = {
    content: req.body.content,
    authorId: req.user._id,
    imagePath: `uploads/${req.file.filename}`,
    imageName: req.file.originalname
  };
  Post.update({_id:req.params.id},{$push: {comments: newComment}}, (err, post) => {

        if (err) {
          res.redirect(`/posts/${req.params.id}/create`, {
            errorMessage: "Something went wrong"
          });
        } else {
          debug(`new comment created`);
          res.redirect("/posts");
        }
  });

});

router.get('/show', (req, res, next) => {
  res.render('posts/show');
});

module.exports = router;
