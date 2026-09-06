import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DashboardWalletCard.css";

import {
    FaWallet,
    FaPlus,
    FaArrowUp,
    FaArrowDown,
    FaCreditCard,
    FaCoins
} from "react-icons/fa";


const transactions = [

    {
        id:1,
        title:"Pizza Order",
        amount:"-₹299",
        date:"Today",
        type:"debit"
    },

    {
        id:2,
        title:"Cashback Reward",
        amount:"+₹50",
        date:"Yesterday",
        type:"credit"
    },

    {
        id:3,
        title:"Wallet Recharge",
        amount:"+₹500",
        date:"2 Days Ago",
        type:"credit"
    }

];

const DashboardWalletCard = () => {

    const [wallet, setWallet] = useState({
        balance: 0,
        rewardPoints: 0
    });
    


    useEffect(() => {

        const fetchWallet = async () => {
    
            try {
    
                const token = localStorage.getItem("token");
    
                const { data } = await axios.get(
                    "https://onlinefooddelivery-9g60.onrender.com/api/dashboard/wallet",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
    
                if (data.success) {
                    setWallet(data.wallet);
                }
    
            } catch (err) {
                console.log(err);
            }
    
        };
    
        fetchWallet();
    
    }, []);

    return (

        <div className="wallet-card">

            {/* Header */}

            <div className="wallet-header">

                <div>

                    <p>Available Balance</p>

                    <h2>₹ {wallet.balance}</h2>

                </div>

                <div className="wallet-icon">

                    <FaWallet />

                </div>

            </div>

            {/* Reward */}

            <div className="reward-box">

                <div>

                    <FaCoins />

                </div>

                <div>

                    <h4>Reward Points</h4>

                    <p>{wallet.rewardPoints} Points</p>

                </div>

            </div>

            {/* Buttons */}

            <div className="wallet-buttons">

                <button className="add-money">

                    <FaPlus />

                    Add Money

                </button>

                <button className="withdraw-money">

                    <FaArrowUp />

                    Withdraw

                </button>

            </div>

            {/* Divider */}

            <div className="wallet-divider"></div>

            {/* Recent Transactions */}

            <div className="wallet-transactions">

                <h3>

                    Recent Transactions

                </h3>

                {

                    transactions.map((item)=>(

                        <div
                            className="transaction-item"
                            key={item.id}
                        >

                            <div className="transaction-left">

                                <div
                                    className={
                                        item.type==="credit"
                                        ?
                                        "transaction-icon credit"
                                        :
                                        "transaction-icon debit"
                                    }
                                >

                                    {

                                        item.type==="credit"

                                        ?

                                        <FaArrowDown/>

                                        :

                                        <FaCreditCard/>

                                    }

                                </div>

                                <div>

                                    <h4>

                                        {item.title}

                                    </h4>

                                    <span>

                                        {item.date}

                                    </span>

                                </div>

                            </div>

                            <h5
                                className={
                                    item.type==="credit"
                                    ?
                                    "credit-text"
                                    :
                                    "debit-text"
                                }
                            >

                                {item.amount}

                            </h5>

                        </div>

                    ))

                }

            </div>

        </div>

    );

};

export default DashboardWalletCard;