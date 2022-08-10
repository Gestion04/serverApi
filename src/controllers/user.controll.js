import Users from '../models/Users';
import Report from '../models/Report';
import Deposit from '../models/Deposited';
import Reference from '../models/Reference';
import Pushs from '../models/Pushs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Receiver from '../models/Receiver';
import Thistory from '../models/Thistory';
import Withdraw from '../models/Withdraw';
import Server from '../models/Server';
// const Users = require('../models/users');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
const free = 3;
(async()=>{
    const server = await Server.findOne();
    if(!server){
        const newServer = new Server({
            Admin: 'admin',
            AllBalance: 0,
            Balance: 0
        });
        await newServer.save();
    }
})()
export const register = async (req, res) => {
    try{
        const { email, password, fullName, number, codeReference, wallet } = req.body;
        const IdReference = Math.floor(Math.random() * (9999999 - 1000000 + 1)) + 100000;
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, async (err, hash) => {
                const userSave = new Users({ email, password:hash, fullName, number:Number(number), codeReference:Number(codeReference), wallet, IdReference, balance: 0, pendientBalance: 0, withdrawBalance: 0, depositBalance: 0, investBalance: 0, gainBalance: 0 });
                const userReferencia = await Users.findOne({ IdReference:userSave.codeReference});
                if(userReferencia){
                    await new Reference({
                        number: Number(number),
                        gain: 0,
                        date: new Date(),
                        referenceNumber: userReferencia.number
                    }).save();
                }
                Users.findOne({ number:Number(number)}, (err, user) => {
                    if(user){
                        res.status(400).json({
                            message: 'User already exists'
                        });
                    }else{
                        Users.findOne({ email }, (err, user) => {
                            if(user){
                                res.status(400).json({
                                    message: 'Email already exists'
                                });
                            }else{
                                (async ()=>{
                                    await userSave.save();
                                    res.json({ message: 'User created successfully'});
                                })();
                            }
                        })
                    }
                })
            })
        })
    }catch(err){
        res.json({ message: err });
    }
}
export const login = (req, res) => {
    try{
        const { number, password } = req.query;
        Users.findOne({ number:Number(number)}, (err, user) => {
            if(err) throw err;
            if(!user){
                res.json({ message: 'User not found', success: false });
            }else{
                bcrypt.compare(String(password), String(user.password), (err, result) => {
                    if(err) throw err;
                    if(result){
                        let userEdit = {
                            fullName: user.fullName,
                            number: Number(user.number),
                            email: user.email,
                            wallet: user.wallet,
                            IdReference: user.IdReference,
                            codeReference: user.codeReference,
                            balance: user.balance,
                            pendientBalance: user.pendientBalance,
                            withdrawBalance: user.withdrawBalance,
                            depositBalance: user.depositBalance
                        }
                        const token = jwt.sign({ user: userEdit }, process.env.JWT_SECRET, { expiresIn: '180d' });

                        res.json({ message: 'User found', user: userEdit, token: token, success: true });
                    }else{
                        res.json({ message: 'Wrong password', success: false });
                    }
                })
            }
        })
    }
    catch(err){
        res.json({ message: err });
    }
}

export const getUser = async (req, res) => {
    try{
        const user = await Users.find({});
        res.json({ user:JSON.stringify(user), success: true, message: 'Users found' });
    }catch(err){
        res.json({ message: err });
    }
}


export const transfer = (req, res) => {
    try{
        const { token } = req.headers;
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if(err) throw err;
        const { number, amount, password } = req.body;
        Users.findOne({ number:Number(number)}, async (err, user) => {
            if(err) throw err;
            if(user.balance < amount || amount <= 0) return res.json({message: "You don't have enough money", success: false});
            if(!user){
                res.json({ message: 'User not found, choose another number', success: false });
            }else{
                const userPassword = await Users.findOne({ number:Number(decoded?.user?.number)});
                bcrypt.compare(String(password), String(userPassword.password), (err, result) => {
                    if(err) throw err;
                    if(result){
                        (async ()=>{
                            const userBalance = await Users.findOne({ number:Number(decoded?.user?.number)});
                            if(number == decoded?.user?.number) return res.json({message: "You can't transfer to your own number"});
                            if(!userBalance.balance >= amount) return res.json({message: "You don't have enough money"});
                            const userNew = await Users.findOneAndUpdate({ number:Number(decoded?.user?.number)}, { $inc: { balance: -amount } });
                            await Users.findOneAndUpdate({ number:Number(number)}, { $inc: { balance: +amount }})
                            await new Thistory({
                                number: Number(decoded?.user?.number),
                                type: "Send",
                                amount: -amount,
                                date: new Date()
                            }).save()
                            await new Thistory({
                                number: Number(number),
                                type: "Receive",
                                amount: amount,
                                date: new Date()
                            }).save()
                            const token = jwt.sign({ user: userNew }, process.env.JWT_SECRET, { expiresIn: '180d' })
                            res.json({ message: 'Transfer successful', success: true });
                        })();

                    }else{
                        res.json({ message: 'Wrong password', success: false });
                    }
                })
            }
        })
    })
    }catch(err){
        res.json({ message: err });
    }
}
export const push = (req, res) => {
    try{
        
    }catch(err){
        res.json({ message: err });
    }
}

export const getThistory = (req, res) => {
    try{
        const { token } = req.headers;
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if(err) throw err;
            const data = await Thistory.find({number:Number(decoded?.user?.number||0)})
            const data2 = await Receiver.find({number:Number(decoded?.user?.number||0)})
            const data3 = await Reference.find({referenceNumber:Number(decoded?.user?.number||0)})
            const data4 = await Pushs.find({number:Number(decoded?.user?.number||0)})
            const user = await Users.findOne({number:Number(decoded?.user?.number||0)})
            if(!user) return res.json({message: "User not found", success: false});
            const token = jwt.sign({ user, thistory:JSON.stringify(data),receiver:JSON.stringify(data2), reference:JSON.stringify(data3), pushs: JSON.stringify(data4) }, process.env.JWT_SECRET, { expiresIn: '180d' });
            
            res.json({thistory:JSON.stringify(data),receiver:JSON.stringify(data2), user, token, reference:JSON.stringify(data3), pushs: JSON.stringify(data4), success:true})
        })
    }catch(err){
        res.json({ message: err });
    }
}

export const sendReceiver = (req, res) => {
    try{
        const { token } = req.headers;
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if(err) throw err;
            const { number, amount } = req.body;
            const user = await Users.findOne({ number:Number(number)});
            if(!user) return res.json({message: "User not found", success: false});
            if(number === Number(decoded?.user?.number)) return res.json({message: "You can't send to your own number", success: false});
            await new Receiver({
                number: Number(number),
                amount: Number(amount),
                date: new Date(),
                pendientNumber: Number(decoded?.user?.number),
                status: true
            }).save()
            await Users.findOneAndUpdate({ number:Number(number)}, { $inc: { pendientBalance: +amount } })
            res.json({ message: 'Receiver sent', success: true });
        })
    }
    catch(err){
        res.json({ message: err });
    }
}
export const payReceiver = (req, res) => {
    try{
        const { token } = req.headers;
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if(err) throw err;
            const { amount, date, pendientNumber } = req.body;
            const user = await Users.findOne({ number:Number(decoded?.user?.number||0)});
            if(user.balance < amount || amount <= 0) return res.json({message: "You don't have enough money", success: false});
            if(!user){
                res.json({ message: 'User not found, choose another number', success: false });
            }else{
                (async ()=>{
                    const userBalance = await Users.findOne({ number:Number(decoded?.user?.number||0)});
                    if(pendientNumber == decoded?.user?.number) return res.json({message: "You can't transfer to your own number"});
                    if(!userBalance.balance >= amount) return res.json({message: "You don't have enough money"});
                    await Users.findOneAndUpdate({ number:Number(decoded?.user?.number||0)}, { $inc: { balance: -amount } });
                    await Users.findOneAndUpdate({ number:Number(pendientNumber)}, { $inc: { balance: +amount }})
                    await new Thistory({
                        number: Number(decoded?.user?.number||0),
                        type: "Send",
                        amount: -amount,
                        date: new Date()
                    }).save()
                    await new Thistory({
                        number: Number(pendientNumber),
                        type: "Receive",
                        amount: amount,
                        date: new Date()
                    }).save()
                    await Users.findOneAndUpdate({ number:Number(decoded?.user?.number||0)}, { $inc: { pendientBalance: -amount } })
                    await Receiver.findOneAndRemove({ number:Number(decoded?.user?.number||0), amount:Number(amount), date, pendientNumber:Number(pendientNumber)})
                    res.json({ message: 'Receiver paid', success: true });
                })();
            }
        })
    }
    catch(err){
        res.json({ message: err });
    }
}

export const reportMsg = (req, res) => {
    try{
        const { token } = req.headers;
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if(err) throw err;
            const { message, name, title,imgUrl } = req.body;
            const user = await Users.findOne({ number:Number(decoded?.user?.number)});
            if(!user) return res.json({message: "User not found", success: false});
            await new Report({
                number: Number(decoded?.user?.number),
                name: name,
                title: title,
                message: message,
                urlImage: imgUrl,
                date: new Date()
            }).save()
            res.json({ message: 'Report sent', success: true });
        })
    }
    catch(err){
        res.json({ message: err });
    }
}

export const Deposited = (req, res) => {
    try{
        const { token } = req.headers;
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if(err) throw err;
            const { hash, screenshots } = req.body;
            await new Deposit({
                number: Number(decoded?.user?.number),
                hash: hash,
                urlImage: screenshots,
                date: new Date(),
                status: true
            }).save()
            await new Pushs({
                number: Number(decoded?.user?.number),
                title: `Deposit Request`,
                message: `you requested a validate a deposit`,
                date: new Date()
            }).save()
            res.json({ message: 'deposit sent', success: true });
        })
    }
    catch(err){
        res.json({ message: err });
    }
}
export const withdrawDef = (req, res) => {
    try{
        const { token } = req.headers;
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if(err) throw err;
            const { amount } = req.body;
            const user = await Users.findOne({ number:Number(decoded?.user?.number)});
            if(!user) return res.json({message: "User not found", success: false});
            if(user.balance < amount || amount <= 0) return res.json({message: "You don't have enough money", success: false});
            await Users.findOneAndUpdate({ number:Number(decoded?.user?.number)}, { $inc: { balance: -amount } })
            await new Thistory({
                type: "Withdraw",
                number: Number(decoded?.user?.number),
                wallet: Number(decoded.user.wallet),
                amount: -(amount*(100-free)/100),
                date: new Date(),
                status: true
            }).save()
            await new Pushs({
                number: Number(decoded?.user?.number),
                title: `Withdrawal Request`,
                message: `you requested to withdraw ${-(amount*(100-free)/100)} USDT`,
                date: new Date()
            }).save()
            await new Withdraw({
                number: Number(decoded?.user?.number),
                amount: -(amount*(100-free)/100),
                wallet: decoded.user.wallet,
                date: new Date(),
                status: true
            }).save()            
            res.json({ message: 'Withdraw sent', success: true });
        })
    }
    catch(err){
        res.json({ message: err });
    }

}

export const adminLogin = (req, res) => {
    try{
        const { password } = req.body;
        if(password == process.env.ADMIN_PASSWORD){
            const token = jwt.sign({ user: { number: 0 } }, process.env.JWT_SECRET, { expiresIn: '30d' });
            res.json({ message: 'Admin logged', success: true, token });
        }
        else{
            res.json({ message: 'Wrong password', success: false });
        }
    }
    catch(err){
        res.json({ message: err });
    }
}
export const getWithdraw = async (req, res) => {
    try{
        const withdraw = await Withdraw.find({});
        if(!withdraw) return res.json({message: "Withdraw not found", success: false});
        res.json({ message: 'Withdraw found', success: true, withdraw:JSON.stringify(withdraw) });
    }catch(err){
        res.json({ message: err });
    }
}
export const payWithdraw = async (req, res) => {
    try{
        const { token } = req.headers;
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if(err) throw err;
            if(decoded?.user?.number != 0) return res.json({message: "You are not admin", success: false});
            const { number, amount, date, wallet, pay } = req.body;
            await Withdraw.findOneAndRemove({ number:Number(number), amount:Number(amount), date, status:true, wallet})
            if(pay){
                await new Pushs({
                    number: Number(number),
                    title: `Successful Withdrawal`,
                    message: `Successful withdrawal of ${-amount} USDT`,
                    date: new Date()
                }).save()
                res.json({ message: 'Withdraw paid', success: true });
            }else{
                await new Pushs({
                    number: Number(number),
                    title: `Failed Withdrawal`,
                    message: `Failed Withdrawal of ${-amount} USDT`,
                    date: new Date()
                }).save()
                await new Thistory({
                    type: "Failed Withdrawal",
                    number: Number(number),
                    wallet: wallet,
                    amount: +Math.abs(amount),
                    date: new Date(),
                    status: true
                }).save()
                await Users.findOneAndUpdate({ number:Number(number)}, { $inc: { balance: +Math.abs(amount) } })
                await Server.findOneAndUpdate({ Admin: 'admin'}, { $inc: { Balance: +(amount*free/100) } },{ $dec: { AllBalance: +(amount*(100-free)/100) } })
                res.json({ message: 'Withdraw not paid', success: true });
            }
        })
    }
    catch(err){
        res.json({ message: err });
    }
}

export const getDeposited = async (req, res) => {
    try{
        const deposited = await Deposit.find({});
        res.json({ deposited:JSON.stringify(deposited), success: true });
    }
    catch(err){
        res.json({ message: err });
    }
}

export const payDeposited = async (req, res) => {
    try{
        const { token } = req.headers;
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if(err) throw err;
            if(decoded?.user?.number != 0) return res.json({message: "You are not admin", success: false});
            const { number, amount, date, hash, pay, urlImage } = req.body;
            await Deposit.findOneAndRemove({ number:Number(number), date, status:true, hash,urlImage:urlImage})
            
            if(pay){
                let user = await Users.findOneAndUpdate({ number:Number(number)}, { $inc: { balance: +amount, depositBalance:+amount } })
                await Server.findOneAndUpdate({ Admin: 'admin'}, { $inc: { AllBalance: +amount } })
                await new Pushs({
                    number: Number(number),
                    title: `Successful Deposit`,
                    message: `Successful deposit of ${amount} USDT`,
                    date: new Date()
                }).save()
                await new Thistory({
                    type: "Deposit",
                    number: Number(user.number),
                    wallet: user.wallet,
                    amount: +amount,
                    date: new Date(),
                    status: true
                }).save()
                res.json({ message: 'Deposit paid', success: true });
            }else{
                await new Pushs({
                    number: Number(number),
                    title: `Failed Deposit`,
                    message: `Failed deposit of ${amount} USDT`,
                    date: new Date()
                }).save()
                res.json({ message: 'Deposit not paid', success: true });
            }
        })
    }catch(err){
        res.json({ message: err });
    }
}

export const getReport = async (req, res) => {
    try{
        const report = await Report.find({});
        res.json({ report:JSON.stringify(report), success: true });
    }
    catch(err){
        res.json({ message: err });
    }
}
export const reportAccept = async (req, res) => {
    try{
        const { token } = req.headers;
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if(err) throw err;
            if(decoded?.user?.number != 0) return res.json({message: "You are not admin", success: false});
            const { number, name, title, date, message, bool } = req.body;
            await Report.findOneAndRemove({ number:Number(number), name, title, date, status:true, message})
            if(bool){
                await Pushs({
                    number: Number(number),
                    title: `Successful Report`,
                    message: `Successful report of ${title}`,
                    date: new Date()
                }).save()
                res.json({ message: 'Report sent', success: true });
            }else{
                await Pushs({
                    number: Number(number),
                    title: `Failed Report`,
                    message: `Failed report of ${title}`,
                    date: new Date()
                }).save()
                res.json({ message: 'Report sent fail', success: true });
            }
        })
    }catch(err){
        res.json({ message: err });
    }
}
export const addMoney = async (req, res) => {
    try{
        const { token } = req.headers;
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if(err) throw err;
            if(decoded?.user?.number != 0) return res.json({message: "You are not admin", success: false});
            const { number, amount } = req.body;
            let user = await Users.findOne({ number:Number(number)})
            if(!user) return res.json({ message: 'User not found', success: false });
            if(user){
                await Users.findOneAndUpdate({ number:Number(number)}, { $inc: { balance: +amount } })
                await Server.findOneAndUpdate({ Admin: 'admin'}, { $inc: { AllBalance: +amount } })
                await new Pushs({
                    number: Number(number),
                    title: `Successful Add Money`,
                    message: `Successful add money of ${amount} USDT`,
                    date: new Date()
                }).save()
                await new Thistory({
                    type: "Deposit",
                    number: Number(user.number),
                    wallet: user.wallet,
                    amount: +amount,
                    date: new Date(),
                    status: true
                }).save()
                res.json({ message: 'Add money success', success: true });
            }else{
                res.json({ message: 'User not found', success: true });
            }
        })
    }catch(err){
        res.json({ message: err });
    }
}

export const invertDef = async (req, res) => {

}