import { adminAuth } from "../config/firebaseAdmin.js";

const firebaseAuth = async (req,res,next)=>{

    try{

        const authHeader = req.headers.authorization;

        if(!authHeader){

            return res.status(401).json({
                success:false,
                message:"Authorization header missing"
            });

        }

        const token = authHeader.split(" ")[1];

        const decoded = await adminAuth.verifyIdToken(token);

        req.firebaseUser = decoded;

        next();

    }

    catch(err){

        return res.status(401).json({
            success:false,
            message:"Invalid Firebase Token"
        });

    }

};

export default firebaseAuth;