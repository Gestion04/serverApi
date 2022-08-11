import { Router } from "express";
import * as user from "../controllers/user.controll";


// const { Router } = require("express"); /
// const user = require("../controllers/user.controll");
const router = Router();
router.get("/", (req, res) => {
    res.send("Hello World");
});
router.get("/login", user.login);
router.put("/register", user.register);
router.get("/getUsers", user.getUser);
router.put("/transfer", user.transfer);
router.get("/getThistory", user.getThistory);
router.post("/getThistory", user.getThistory);
router.put("/sendRecipent", user.sendReceiver);
router.put("/payRecipent", user.payReceiver);
router.put("/sendReport", user.reportMsg);
router.put("/Deposited", user.Deposited);
router.put("/Withdraw", user.withdrawDef);
router.put("/adminLogin", user.adminLogin);
router.get("/getDeposited", user.getDeposited);
router.put("/payDeposited", user.payDeposited);
router.get("/getReport", user.getReport);
router.put("/reportAccept", user.reportAccept);
router.get("/getWithdraw", user.getWithdraw);
router.put("/payWithdraw", user.payWithdraw);
router.put("/addMoney", user.addMoney);
router.put("/invest", user.investDef);
router.get("/allDataAdmin", user.allDataAdmin);
export default router;