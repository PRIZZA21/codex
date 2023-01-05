
import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

// loader function
function loader(element)
{
  element.textContent='';
  loadInterval=setInterval(() =>{
    element.textContent+='.';

    if(element.textContent==='....')
    {
      element.textContent='';
    }
  },300)
}

//function to ensure typing is one by one
function typeText(element, text)
{
  let index=0;

  let interval = setInterval(() => {
    if(index<text.length)
    {
      element.innerHTML += text.charAt(index);
      index++;
    }
    else
    {
      clearInterval(interval); // clearInterval cancels a time repeating action set by setInterval
    }

  }, 20);
}

// function to generate unique ID to map

function generateUniqueId()
{
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);
  
  return `id-${timestamp}-${hexadecimalString}`;
}


function chatStripe(isAi, value, uniqueId) {
  return (
      `
      <div class="wrapper ${isAi && 'ai'}">
          <div class="chat">
              <div class="profile">
                  <img 
                    src=${isAi ? bot : user} 
                    alt="${isAi ? 'bot' : 'user'}" 
                  />
              </div>
              <div class="message" id=${uniqueId}>${value}</div>
          </div>
      </div>
  `
  )
}

const handleSubmit = async(e)=>{
  e.preventDefault();
  const data = new FormData(form);

  // user's chatstripe
   chatContainer.innerHTML+=chatStripe(false,data.get('prompt'))

   form.reset(); // used to clear the form once the user gives input
   
   // bot's chatstripe
  const uniqueId=generateUniqueId();
  chatContainer.innerHTML+=chatStripe(true," ",uniqueId); // doubt here
  
  chatContainer.scrollTop=chatContainer.scrollHeight; // DOUBT  
  const messageDiv = document.getElementById(uniqueId);
  
  loader(messageDiv); // start of loading

  // fetch data from server -> bot's response
  const response = await fetch('http://localhost:5000',{
    method:'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      prompt:data.get('prompt') // this is the data from textarea
    })
  })

  clearInterval(loadInterval); // since we are no longer loading 
  messageDiv.innerHTML=''; // so that we clear the div that has loading .......

  if(response.ok)
  {
    const data = await response.json();
    const parsedData = data.bot.trim(); // CHECL THE RESPONSE FOR BOT AND TRIM ( IMPORTANT)

    typeText(messageDiv, parsedData);
  } else
  {
     const err = await response.text();

     messageDiv.innerHTML='Something went wrong';
     alert(err);
  }
}

form.addEventListener('submit',handleSubmit);
form.addEventListener('keyup',(e)=>{
  if(e.keyCode===13)
  {
    handleSubmit(e);
  }
})

