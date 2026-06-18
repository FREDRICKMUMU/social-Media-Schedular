import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { addAccount, getAccounts, disconnectAccount } from "../controllers/accountConrollers.js";

const accountRouter = express.Router();

accountRouter.get('/', protect, getAccounts);
accountRouter.post('/', protect, addAccount);
accountRouter.delete('/:id', protect, disconnectAccount);

export default accountRouter;