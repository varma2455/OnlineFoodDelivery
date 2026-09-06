import "./AIFoodAssistant.css";

export default function Message({message}){

return(

<div className={`message ${message.type}`}>

{message.text}

</div>

);

}