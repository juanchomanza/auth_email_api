const { getAll, create, getOne, remove, update, verifyCode, login, sendEmailForChangePassword, changePassword, me } = require('../controllers/user.controllers');
const express = require('express');
const verifyJWT = require('../utils/verifyJWT');

const userRouter = express.Router();

userRouter.route('/')
    .get(verifyJWT,getAll)
    .post(create);

userRouter.route('/me')
    .get(verifyJWT,me);
    


userRouter.route('/login')
    .post(login);
userRouter.route('/verify/:code')
    .get(verifyCode);
userRouter.route('/:id')
    .get(verifyJWT,getOne)
    .delete(verifyJWT,remove)
    .put(verifyJWT,update);

userRouter.route('/reset_password')
    .post(sendEmailForChangePassword);
userRouter.route('/reset_password/:code')
    .post(changePassword);


module.exports = userRouter;