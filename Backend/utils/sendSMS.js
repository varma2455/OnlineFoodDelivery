import axios from "axios";

const sendSMS = async (phone, otp) => {

    try {

        // MSG91 API code will be added in the next step

        console.log("Phone :", phone);
        console.log("OTP :", otp);

    } catch (error) {

        console.log(error);

    }

};

export default sendSMS;