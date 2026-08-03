import { useState } from "react";
import "./AIFoodAssistant.css";

import {
    FaRobot,
    FaPaperPlane,
    FaMicrophone,
    FaTimes
} from "react-icons/fa";

import Message from "./Message";

const defaultMessages = [
{
id:1,
type:"bot",
text:"👋 Hi! I'm FoodExpress AI.\nWhat would you like to eat today?"
}
];

export default function AIFoodAssistant(){

const [messages,setMessages]=useState(defaultMessages);

const [text,setText]=useState("");

const sendMessage=()=>{

if(text==="") return;

setMessages([
...messages,
{
id:Date.now(),
type:"user",
text
},
{
id:Date.now()+1,
type:"bot",
text:"🍕 Great choice! I found some delicious meals for you."
}
]);

setText("");

};

return(

<div className="aiAssistant">

<div className="assistantHeader">

<div>

<FaRobot/>

FoodExpress AI

</div>

<button>

<FaTimes/>

</button>

</div>

<div className="chatBody">

{
messages.map(msg=>

<Message
key={msg.id}
message={msg}
/>

)
}

</div>

<div className="quickSuggestions">

<button>🍕 Pizza</button>

<button>🍔 Burger</button>

<button>🥗 Healthy</button>

<button>🌶 Spicy</button>

</div>

<div className="chatInput">

<input

value={text}

onChange={(e)=>setText(e.target.value)}

placeholder="Ask AI for food..."

 />

<button>

<FaMicrophone/>

</button>

<button

onClick={sendMessage}

>

<FaPaperPlane/>

</button>

</div>

</div>

);

}