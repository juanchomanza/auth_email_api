const catchError = require('../utils/catchError');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const sendEmail = require('../utils/sendEmail');
const EmailCode = require('../models/EmailCode');
const getAll = catchError(async(req, res) => {
    const results = await User.findAll();
    return res.json(results);
});

const create = catchError(async(req, res) => {
    const {lastName, firstName, password, email, country, image, frontBaseUrl } = req.body
    const hashed = await bcrypt.hash(password, 10)
    const result = await User.create({lastName, firstName, email, country, image, password: hashed});
    const code = require('crypto').randomBytes(32).toString("hex")
    const url = `${frontBaseUrl}/verify_email/${code}`
    await sendEmail({
		to: email, // Email del receptor
		subject: `Verify here for use BoldZone `, // asunto
		html: `<h2> Hola! ${firstName} ${lastName} </h2>
        <h3> Welcome to BoldZone </h3>
        <p> Thanks for sign up, just gere verified here: </p>
        <a href="${url}"> ${url} </a>
        <br>
        <img width="300px" height="300px" src="${image}"> ` // texto
})
    EmailCode.create({ code, userId: result.id})
    return res.status(201).json(result);
});

const getOne = catchError(async(req, res) => {
    const { id } = req.params;
    const result = await User.findByPk(id);
    if(!result) return res.sendStatus(404);
    return res.json(result);
});

const remove = catchError(async(req, res) => {
    const { id } = req.params;
    await User.destroy({ where: {id} });
    return res.sendStatus(204);
});

const update = catchError(async(req, res) => {
    const { id } = req.params;
    const result = await User.update(
        req.body,
        { where: {id}, returning: true }
    );
    if(result[0] === 0) return res.sendStatus(404);
    return res.json(result[1][0]);
});

const verifyCode = catchError(async(req, res) => {
    const {code} = req.params
    const codeFound = await EmailCode.findOne({where: {code}})
    if(!codeFound) return res.status(401).json({message: "Invalid code!"})
    const user = await User.update(
        {isVerified: true},
        {where: {id: codeFound.userId}}
    )
    await codeFound.destroy()
    return res.status(200).json({message: "User verified!", user})

})

const login = catchError(async(req,res) => {
    const {email, password} = req.body
    const user = await User.findOne({where: {email}})
    if(!user) return res.status(401).json({message: "Invalid Credentials!"})
    const verify = await bcrypt.compare(password, user.password)
    if(!verify) return res.status(401).json({message: "Invalid Credentials!"})
    const token = jwt.sign({user}, process.env.TOKEN_SECRET, {expiresIn: "1d"})
    return res.status(200).json({token})
})

const changePassword = catchError(async(req, res) =>{
    const {email} = req.params
    const user = await User.findOne({where: {email}})
    if(!user) return res.status(401).json({message: "Look your email feed"})
    
})

module.exports = {
    getAll,
    create,
    getOne,
    remove,
    update,
    verifyCode,
    login
}