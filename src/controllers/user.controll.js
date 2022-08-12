import Users from "../models/Users";
import Report from "../models/Report";
import Deposit from "../models/Deposited";
import Reference from "../models/Reference";
import Pushs from "../models/Pushs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Receiver from "../models/Receiver";
import Thistory from "../models/Thistory";
import Withdraw from "../models/Withdraw";
import Server from "../models/Server";
import Invest from "../models/Invests";

// const Users = require('../models/users');
// const bcrypt = require('bcrypt');/
// const jwt = require('jsonwebtoken');userBalance
const free = 3;
(async () => {
  const server = await Server.findOne();
  if (!server) {
    const newServer = new Server({
      Admin: "admin",
      AllBalance: 0,
      Balance: 0,
      Invests: 0,
    });
    await newServer.save();
  }
})();
export const register = async (req, res) => {
  try {
    const { email, password, fullName, number, codeReference, wallet } =
      req.body;
    const IdReference =
      Math.floor(Math.random() * (9999999 - 1000000 + 1)) + 100000;
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        const userSave = new Users({
          email,
          password: hash,
          fullName,
          number: Number(number),
          codeReference: Number(codeReference),
          wallet,
          IdReference,
          balance: 0,
          pendientBalance: 0,
          withdrawBalance: 0,
          depositBalance: 0,
          investBalance: 0,
          gainBalance: 0,
        });
        const userReference = await Users.findOne({
          IdReference: userSave.codeReference,
        });
        Users.findOne({ number: Number(number) }, (err, user) => {
          if (user) {
            res.status(400).json({
              message: "User already exists, add another number",
            });
          } else {
            Users.findOne({ email }, (err, user) => {
              if (user) {
                res.status(400).json({
                  message: "Email already exists",
                });
              } else {
                (async () => {
                  if (userReference) {
                    await new Reference({
                      number: Number(number),
                      gain: 0,
                      date: new Date(),
                      referenceNumber: userReference.number,
                    }).save();
                  }
                  await userSave.save();
                  res.json({
                    message: "User created successfully",
                    success: true,
                  });
                })();
              }
            });
          }
        });
      });
    });
  } catch (err) {
    res.json({ message: err });
  }
};
export const login = (req, res) => {
  try {
    const { number, password } = req.query;
    Users.findOne({ number: Number(number) }, (err, user) => {
      if (err) return res.json({ message: err });
      if (!user) {
        res.json({ message: "User not found", success: false });
      } else {
        bcrypt.compare(
          String(password),
          String(user.password),
          (err, result) => {
            if (err) return res.json({ message: err });
            if (result) {
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
                depositBalance: user.depositBalance,
              };
              const token = jwt.sign(
                { user: userEdit },
                process.env.JWT_SECRET,
                { expiresIn: "180d" }
              );

              res.json({
                message: "User found",
                user: userEdit,
                token: token,
                success: true,
              });
            } else {
              res.json({ message: "Wrong password", success: false });
            }
          }
        );
      }
    });
  } catch (err) {
    res.json({ message: err });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await Users.find({});
    res.json({
      user: JSON.stringify(user),
      success: true,
      message: "Users found",
    });
  } catch (err) {
    res.json({ message: err });
  }
};

export const transfer = (req, res) => {
  try {
    const token  = req.body.token || req.headers.token;
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) return res.json({ message: err });
      const { number, amount, password } = req.body;
      Users.findOne({ number: Number(number) }, async (err, user) => {
        if (err) return res.json({ message: err });

        if (!user) {
          res.json({
            message: "User not found, choose another number",
            success: false,
          });
        } else {
          const userPassword = await Users.findOne({
            number: Number(decoded.user.number),
          });
        if (!userPassword) return res.json({ message: "User not found" });
          bcrypt.compare(
            String(password),
            String(userPassword.password),
            (err, result) => {
              if (err) return res.json({ message: err });
              if (result) {
                (async () => {
                  if (userPassword.balance < amount || amount <= 0)
                    return res.json({
                      message: "You don't have enough money",
                      success: false,
                    });
                  if (number == decoded?.user?.number)
                    return res.json({
                      message: "You can't transfer to your own number",
                    });
                  const userNew = await Users.findOneAndUpdate(
                    { number: Number(decoded.user.number) },
                    { $inc: { balance: -amount } }
                  );
                  await Users.findOneAndUpdate(
                    { number: Number(number) },
                    { $inc: { balance: +amount } }
                  );
                  await new Thistory({
                    number: Number(decoded.user.number),
                    type: "Send",
                    amount: -amount,
                    date: new Date(),
                  }).save();
                  await new Thistory({
                    number: Number(number),
                    type: "Receive",
                    amount: amount,
                    date: new Date(),
                  }).save();
                  const token = jwt.sign(
                    { user: userNew },
                    process.env.JWT_SECRET,
                    { expiresIn: "180d" }
                  );
                  res.json({ message: "Transfer successful", success: true });
                })();
              } else {
                res.json({ message: "Wrong password", success: false });
              }
            }
          );
        }
      });
    });
  } catch (err) {
    res.json({ message: err });
  }
};
export const push = (req, res) => {
  try {
  } catch (err) {
    res.json({ message: err });
  }
};

export const getThistory = (req, res) => {
  try {
    const token = req.body.token || req.headers.token;
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) return res.json({ message: "Token not found" });
      const data = await Thistory.find({
        number: Number(decoded.user.number),
      });
      const data2 = await Receiver.find({
        number: Number(decoded.user.number),
      });
      const data3 = await Reference.find({
        referenceNumber: Number(decoded.user.number),
      });
      const data4 = await Pushs.find({
        number: Number(decoded.user.number),
      });
      const data5 = await Invest.find({
        number: Number(decoded.user.number),
      });
      const user = await Users.findOne({
        number: Number(decoded.user.number),
      });
      if (!user) return res.json({ message: "User not found", success: false });
      const token = jwt.sign(
        {user},
        process.env.JWT_SECRET,
        { expiresIn: "180d" }
      );

      res.json({
        thistory: JSON.stringify(data),
        receiver: JSON.stringify(data2),
        user,
        token,
        reference: JSON.stringify(data3),
        pushs: JSON.stringify(data4),
        invests: JSON.stringify(data5),
        success: true,
      });
    });
  } catch (err) {
    res.json({ message: err });
  }
};

export const sendReceiver = (req, res) => {
  try {
    const token = req.body.token || req.headers.token;
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) return res.json({ message: err });
      const { number, amount } = req.body;
      const user = await Users.findOne({ number: Number(number) });
      if (!user) return res.json({ message: "User not found", success: false });
      if (number === Number(decoded.user.number))
        return res.json({
          message: "You can't send to your own number",
          success: false,
        });
      await new Receiver({
        number: Number(number),
        amount: Number(amount),
        date: new Date(),
        pendientNumber: Number(decoded.user.number),
        status: true,
      }).save();
      await Users.findOneAndUpdate(
        { number: Number(number) },
        { $inc: { pendientBalance: +amount } }
      );
      res.json({ message: "Receiver sent", success: true });
    });
  } catch (err) {
    res.json({ message: err });
  }
};
export const payReceiver = (req, res) => {
  try {
    const token = req.body.token || req.headers.token;
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) return res.json({ message: err });
      const { amount, date, pendientNumber } = req.body;
      const user = await Users.findOne({
        number: Number(decoded.user.number),
      });
      if (user.balance < amount || amount <= 0)
        return res.json({
          message: "You don't have enough money",
          success: false,
        });
      if (!user) {
        res.json({
          message: "User not found, choose another number",
          success: false,
        });
      } else {
        (async () => {
          const userBalance = await Users.findOne({
            number: Number(decoded.user.number),
          });
          if (pendientNumber == decoded?.user?.number)
            return res.json({
              message: "You can't transfer to your own number",
            });
          if (!userBalance.balance >= amount)
            return res.json({ message: "You don't have enough money" });
          await Users.findOneAndUpdate(
            { number: Number(decoded.user.number) },
            { $inc: { balance: -amount } }
          );
          await Users.findOneAndUpdate(
            { number: Number(pendientNumber) },
            { $inc: { balance: +amount } }
          );
          await new Thistory({
            number: Number(decoded.user.number),
            type: "Send",
            amount: -amount,
            date: new Date(),
          }).save();
          await new Thistory({
            number: Number(pendientNumber),
            type: "Receive",
            amount: amount,
            date: new Date(),
          }).save();
          await Users.findOneAndUpdate(
            { number: Number(decoded.user.number) },
            { $inc: { pendientBalance: -amount } }
          );
          await Receiver.findOneAndRemove({
            number: Number(decoded.user.number),
            amount: Number(amount),
            date,
            pendientNumber: Number(pendientNumber),
          });
          res.json({ message: "Receiver paid", success: true });
        })();
      }
    });
  } catch (err) {
    res.json({ message: err });
  }
};

export const reportMsg = (req, res) => {
  try {
    const token = req.body.token || req.headers.token;
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) return res.json({ message: err });
      const { message, name, title, imgUrl } = req.body;
      const user = await Users.findOne({
        number: Number(decoded.user.number),
      });
      if (!user) return res.json({ message: "User not found", success: false });
      await new Report({
        number: Number(decoded.user.number),
        email: decoded?.user?.email,
        name: name,
        title: title,
        message: message,
        urlImage: imgUrl,
        date: new Date(),
      }).save();
      res.json({ message: "Report sent", success: true });
    });
  } catch (err) {
    res.json({ message: err });
  }
};

export const Deposited = (req, res) => {
  try {
    const token = req.body.token || req.headers.token;
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) return res.json({ message: err });
      const { hash, screenshots } = req.body;
      await new Deposit({
        number: Number(decoded.user.number),
        hash: hash,
        urlImage: screenshots,
        date: new Date(),
        status: true,
      }).save();
      await new Pushs({
        number: Number(decoded.user.number),
        title: `Deposit Request`,
        message: `you requested a validate a deposit`,
        date: new Date(),
      }).save();
      res.json({ message: "deposit sent", success: true });
    });
  } catch (err) {
    res.json({ message: err });
  }
};
export const withdrawDef = (req, res) => {
  try {
    const token = req.body.token || req.headers.token;
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) return res.json({ message: err });
      const { amount } = req.body;
      const user = await Users.findOne({
        number: Number(decoded.user.number),
      });
      if (!user) return res.json({ message: "User not found", success: false });
      if (user.balance < amount || amount <= 0)
        return res.json({
          message: "You don't have enough money",
          success: false,
        });
      await Users.findOneAndUpdate(
        { number: Number(decoded.user.number) },
        { $inc: { balance: -amount } }
      );
      await new Thistory({
        type: "Withdraw",
        number: Number(decoded.user.number),
        wallet: Number(decoded.user.wallet),
        amount: -((amount * (100 - free)) / 100),
        date: new Date(),
        status: true,
      }).save();
      await new Pushs({
        number: Number(decoded.user.number),
        title: `Withdrawal Request`,
        message: `you requested to withdraw ${-(
          (amount * (100 - free)) /
          100
        )} USDT`,
        date: new Date(),
      }).save();
      await new Withdraw({
        number: Number(decoded.user.number),
        amount: -((amount * (100 - free)) / 100),
        wallet: decoded.user.wallet,
        date: new Date(),
        status: true,
      }).save();
      res.json({ message: "Withdraw sent", success: true });
    });
  } catch (err) {
    res.json({ message: err });
  }
};

export const adminLogin = (req, res) => {
  try {
    const { password } = req.body;
    if (password == process.env.ADMIN_PASSWORD) {
      const token = jwt.sign({ user: { number: 0 } }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      });
      res.json({ message: "Admin logged", success: true, token });
    } else {
      res.json({ message: "Wrong password", success: false });
    }
  } catch (err) {
    res.json({ message: err });
  }
};
export const getWithdraw = async (req, res) => {
  try {
    const withdraw = await Withdraw.find({});
    if (!withdraw)
      return res.json({ message: "Withdraw not found", success: false });
    res.json({
      message: "Withdraw found",
      success: true,
      withdraw: JSON.stringify(withdraw),
    });
  } catch (err) {
    res.json({ message: err });
  }
};
export const payWithdraw = async (req, res) => {
  try {
    const token = req.body.token || req.headers.token;
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) return res.json({ message: err });
      if (decoded?.user?.number != 0)
        return res.json({ message: "You are not admin", success: false });
      const { number, amount, date, wallet, pay } = req.body;
      await Withdraw.findOneAndRemove({
        number: Number(number),
        amount: Number(amount),
        date,
        status: true,
        wallet,
      });
      if (pay) {
        await new Pushs({
          number: Number(number),
          title: `Successful Withdrawal`,
          message: `Successful withdrawal of ${-amount} USDT`,
          date: new Date(),
        }).save();
        res.json({ message: "Withdraw paid", success: true });
      } else {
        await new Pushs({
          number: Number(number),
          title: `Failed Withdrawal`,
          message: `Failed Withdrawal of ${-amount} USDT`,
          date: new Date(),
        }).save();
        await new Thistory({
          type: "Failed Withdrawal",
          number: Number(number),
          wallet: wallet,
          amount: +Math.abs(amount),
          date: new Date(),
          status: true,
        }).save();
        await Users.findOneAndUpdate(
          { number: Number(number) },
          { $inc: { balance: +Math.abs(amount) } }
        );
        await Server.findOneAndUpdate(
          { Admin: "admin" },
          { $inc: { Balance: +((amount * free) / 100) } },
          { $dec: { AllBalance: +((amount * (100 - free)) / 100) } }
        );
        res.json({ message: "Withdraw not paid", success: true });
      }
    });
  } catch (err) {
    res.json({ message: err });
  }
};

export const getDeposited = async (req, res) => {
  try {
    const deposited = await Deposit.find({});
    res.json({ deposited: JSON.stringify(deposited), success: true });
  } catch (err) {
    res.json({ message: err });
  }
};

export const payDeposited = async (req, res) => {
  try {
    const token = req.body.token || req.headers.token;
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) return res.json({ message: err });
      if (decoded?.user?.number != 0)
        return res.json({ message: "You are not admin", success: false });
      const { number, amount, date, hash, pay, urlImage } = req.body;
      await Deposit.findOneAndRemove({
        number: Number(number),
        date,
        status: true,
        hash,
        urlImage: urlImage,
      });

      if (pay) {
        let user = await Users.findOneAndUpdate(
          { number: Number(number) },
          { $inc: { balance: +amount, depositBalance: +amount } }
        );
        await Server.findOneAndUpdate(
          { Admin: "admin" },
          { $inc: { AllBalance: +amount } }
        );
        await new Pushs({
          number: Number(number),
          title: `Successful Deposit`,
          message: `Successful deposit of ${amount} USDT`,
          date: new Date(),
        }).save();
        await new Thistory({
          type: "Deposit",
          number: Number(user.number),
          wallet: user.wallet,
          amount: +amount,
          date: new Date(),
          status: true,
        }).save();
        res.json({ message: "Deposit paid", success: true });
      } else {
        await new Pushs({
          number: Number(number),
          title: `Failed Deposit`,
          message: `Failed deposit of ${amount} USDT`,
          date: new Date(),
        }).save();
        res.json({ message: "Deposit not paid", success: true });
      }
    });
  } catch (err) {
    res.json({ message: err });
  }
};

export const getReport = async (req, res) => {
  try {
    const report = await Report.find({});
    res.json({ report: JSON.stringify(report), success: true });
  } catch (err) {
    res.json({ message: err });
  }
};
export const reportAccept = async (req, res) => {
  try {
    const token = req.body.token || req.headers.token;
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) return res.json({ message: err });
      if (decoded?.user?.number != 0)
        return res.json({ message: "You are not admin", success: false });
      const { number, name, title, date, message, bool } = req.body;
      await Report.findOneAndRemove({
        number: Number(number),
        name,
        title,
        date,
        status: true,
        message,
      });
      if (bool) {
        await Pushs({
          number: Number(number),
          title: `Successful Report`,
          message: `Successful report of ${title}`,
          date: new Date(),
        }).save();
        res.json({ message: "Report sent", success: true });
      } else {
        await Pushs({
          number: Number(number),
          title: `Failed Report`,
          message: `Failed report of ${title}`,
          date: new Date(),
        }).save();
        res.json({ message: "Report sent fail", success: true });
      }
    });
  } catch (err) {
    res.json({ message: err });
  }
};
export const addMoney = async (req, res) => {
  try {
    const token = req.body.token || req.headers.token;
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) return res.json({ message: err });
      if (decoded?.user?.number != 0)
        return res.json({ message: "You are not admin", success: false });
      const { number, amount } = req.body;
      let user = await Users.findOne({ number: Number(number) });
      if (!user) return res.json({ message: "User not found", success: false });
      if (user) {
        await Users.findOneAndUpdate(
          { number: Number(number) },
          { $inc: { balance: +amount } }
        );
        await Server.findOneAndUpdate(
          { Admin: "admin" },
          { $inc: { AllBalance: +amount } }
        );
        await new Pushs({
          number: Number(number),
          title: `Successful Add Money`,
          message: `Successful add money of ${amount} USDT`,
          date: new Date(),
        }).save();
        await new Thistory({
          type: "Deposit",
          number: Number(user.number),
          wallet: user.wallet,
          amount: +amount,
          date: new Date(),
          status: true,
        }).save();
        res.json({ message: "Add money success", success: true });
      } else {
        res.json({ message: "User not found", success: true });
      }
    });
  } catch (err) {
    res.json({ message: err });
  }
};

// Standard = 10 - 100 // 1% 2 days
// Gold = 100 - 1000 // 2.3% 15 days
// Premium = 1000 - ∞ // 2.6% 30 days
const TypeInvests = {
  Standard: {
    percent: 1,
    days: 2,
  },
  Gold: {
    percent: 2.3,
    days: 15,
  },
  Premium: {
    percent: 2.6,
    days: 30,
  },
};
const dayTime = 30; // 86400
setInterval(async () => {
  try {
    const users = await Invest.find({});
    if (users.length > 0 || false) {
      users?.forEach(async (user) => {
        if (!user) return;
        const { amount, type, number, date, day, dateEnd, gain } = user;
        let { percent, days } = TypeInvests[type];
        if (day > days) return;
        let dateEdit = new Date(date) / 1000 + dayTime * day;
        const timeCalculate = Math.floor(dateEdit - Date.now() / 1000);
        if (timeCalculate <= 0) {
          await new Thistory({
            type: "Invest Gain",
            number: Number(number),
            wallet: user.wallet,
            amount: +((amount * percent) / 100),
            date: new Date(),
            status: true,
          }).save();
          await Users.findOneAndUpdate(
            { number: Number(number) },
            {
              $inc: {
                balance: +((amount * percent) / 100),
                gainBalance: +((amount * percent) / 100),
              },
            }
          );
          await Invest.findOneAndUpdate(
            { amount, type, number, date, day, dateEnd, gain },
            { $inc: { day: +1, gain: +((amount * percent) / 100) } }
          );
          if (day === days) {
            await new Thistory({
              type: "Invest End",
              number: Number(number),
              wallet: user.wallet,
              amount: +amount,
              date: new Date(),
              status: false,
            }).save();
            await Invest.findOneAndRemove({
              amount,
              type,
              number,
              date,
              dateEnd,
            });
            await Users.findOneAndUpdate(
              { number: Number(number) },
              { $inc: { investBalance: -amount, balance: +amount } }
            );
            return;
          }
        }
      });
    }
  } catch (e) {
    console.log(e);
  }
}, 10000);

export const investDef = async (req, res) => {
  const token = req.body.token || req.headers.token;
  try {
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) return res.json({ message: err });
      const { amount, type } = req.body;
      if (!Object.keys(TypeInvests).some((key) => key === (type || "")))
        return res.json({ message: "Plans not found", success: false });
        if (type === "Premium") {
            if(amount < 500) return res.json({ message: "The amount must be more than 500 USDT in premium", success: false });
        }else if (type === "Gold") {
            if(amount < 100 || 500 < amount) return res.json({ message: "The amount must be greater than 100 USDT and less than 500 USDT in Gold", success: false });
        }else if (type === "Standard") {
            if(amount < 10 || 100 < amount) return res.json({ message: "The amount must be greater than 10 USDT and less than 100 USDT in Standard", success: false });
        }
      let user = await Users.findOne({
        number: Number(decoded.user.number),
      });
      if (!user) return res.json({ message: "User not found", success: false });
      if (user.balance < amount || amount <= 0)
        return res.json({ message: "Not enough balance", success: false });
      if (amount < 10)
        return res.json({
          message: "Amount must be greater than 10 USDT",
          success: false,
        });
      await Users.findOneAndUpdate(
        { number: Number(decoded.user.number) },
        { $inc: { investBalance: +amount, balance: -amount } }
      );
      await new Thistory({
        type: "Invest Start",
        number: Number(decoded.user.number),
        wallet: user.wallet,
        amount: -amount,
        date: new Date(),
        status: true,
      }).save();
      await new Invest({
        number: Number(decoded.user.number),
        amount: Number(amount),
        type: type,
        date: new Date(),
        dateEnd: new Date(
          (new Date() / 1000 + dayTime * TypeInvests[type].days) * 1000
        ),
        day: 1,
        status: true,
        gain: 0,
      }).save();
      let reference = await Reference.findOneAndUpdate({
        number: Number(decoded.user.number),
      }, { $inc: { gain: +((amount * 0.3) / 100) } });
      if (reference) {
        await Users.findOneAndUpdate(
          { number: Number(reference.referenceNumber) },
          { $inc: { balance: +((amount * 0.3) / 100) } }
        );
        await new Thistory({
          type: "Reference",
          number: Number(reference.referenceNumber),
          wallet: user.wallet,
          amount: +((amount * 0.3) / 100),
          date: new Date(),
          status: true,
        }).save();
      }
      res.json({ message: "Invest success", success: true });
    });
  } catch (e) {
    res.json({ message: e });
  }
};
export const getInvest = async (req, res) => {
  const token = req.body.token || req.headers.token;
  try {
    jwt
      .verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) return res.json({ message: err });
        const { number } = req.body;
        let user = await Users.findOne({ number: Number(number) });
        if (!user)
          return res.json({ message: "User not found", success: false });
        let invests = await Invest.find({ number: Number(number) });
        if (!invests)
          return res.json({ message: "Invest not found", success: false });
        res.json({ message: "Invest found", success: true, invests });
      })
      .catch((err) => {
        res.json({ message: err });
      });
  } catch (e) {
    res.json({ message: e });
  }
};
export const allDataAdmin = async (req, res) => {
  // users - withdraw - invest - report - deposit
  const token = req.body.token || req.headers.token;
  try {
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) return res.json({ message: "Token expired" });
      if (decoded?.user?.number !== 0)
        return res.json({ message: "Not admin", success: false });
      const user = await Users.find({});
      const withdraw = await Withdraw.find({});
      const invest = await Invest.find({});
      const report = await Report.find({});
      const deposited = await Deposit.find({});
      res.json({
        user: JSON.stringify(user),
        withdraw: JSON.stringify(withdraw),
        invest: JSON.stringify(invest),
        report: JSON.stringify(report),
        deposited: JSON.stringify(deposited),
        success: true,
      });
    });
  } catch (e) {
    res.json({ message: e });
  }
};
