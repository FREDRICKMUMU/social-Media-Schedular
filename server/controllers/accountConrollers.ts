import {Response} from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { Account } from "../models/Account.js";
import zernio from "../config/zernio.js";
//GEY ALL ACCOUNTS
//GET /api/accounts


export const getAccounts = async (req: AuthRequest, res: Response) : Promise<void> =>{
    try{
        const acccounts = await Account.find({user: req.user._id})
        res.json(acccounts)
    } catch (error: any) {
        res.status(500).json({message: error?.message || "Server error"});
    }
}

// ADD ACCOUNT
//POST /spi/accounts
export const addAccount = async (req: AuthRequest, res: Response) : Promise<void> =>{
    try{
        const {platform, handle, avatarUrl} = req.body;
        const account = await Account.create({user: req.user._id, platform, handle,avatarUrl}) ;
        res.status(201).json(account)
    } catch (error: any) {
        res.status(500).json({message: error?.message || "Server error"});
    }
}

//DISCONNECT ACCOUNT
//DELETE /apiu/accounts/:id
export const disconnectAccount = async (req: AuthRequest, res: Response) : Promise<void> =>{
    try{
        const account = await Account.findOne({_id: req.params.id, user: req.user._id}) ;
        if(!account){
            res.status(404).json({message: "Account not found"});
            return;
        }
        if(account.zernioAccountId){
            try{
                await zernio.accounts.deleteAccount({path: {accountId: account.zernioAccountId}})
            } catch(error: any){
                res.status(500).json({message: error?.response?.data?.message || error?.message});
                return
            }
        }
        await account.deleteOne()
        res.json({message: "Account disconnected successfullys"})
    } catch (error: any) {
        res.status(500).json({message: error?.message || "Server error"});
    }
}

