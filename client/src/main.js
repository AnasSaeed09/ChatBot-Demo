import bot from '../assets/bot.svg';
import user from '../assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');
let loadInterval;

// Generate a unique ID for each message
const generateUniqueId = () => {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);
  return `id-${timestamp}-${hexadecimalString}`;
};

// Loader animation
const loader = (element) => {
  element.textContent = '';
  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300);
};

// Typing text animation
const typeText = (element, text) => {
  let index = 0;

  const interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
};

// Chat message HTML structure
function chatStripe(isAi, value, uniqueId) {
  return `
    <div class="wrapper ${isAi ? 'ai' : ''}">
      <div class="chat">
        <div class="profile">
          <img 
            src="${isAi ? bot : user}" 
            alt="${isAi ? 'bot' : 'user'}" 
          />
        </div>
        <div class="message" id="${uniqueId}">${value}</div>
      </div>
    </div>
  `;
}

// Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);
  const userMessage = data.get('prompt');

  if (!userMessage) {
    alert('Please enter a prompt!');
    return;
  }

  // Add user message to chat
  chatContainer.innerHTML += chatStripe(false, userMessage);
  form.reset();

  // Add bot loader placeholder
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, ' ', uniqueId);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);

  // Requesting the server
  try {
    const response = await fetch('http://localhost:5000', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: userMessage }),
    });

    clearInterval(loadInterval);
    messageDiv.innerHTML = ' ';

    if (response.ok) {
      const data = await response.json();
      const parsedData = data.bot.trim();
      typeText(messageDiv, parsedData);
    } else {
      const errorData = await response.json();
      messageDiv.innerHTML = errorData.error || 'An error occurred!';
    }
  } catch (e) {
    clearInterval(loadInterval);
    messageDiv.innerHTML = 'Something went wrong';
    console.error('Server Error:', e);
    alert('Server is not responding. Please try again later.');
  }

  chatContainer.scrollTop = chatContainer.scrollHeight; // Ensure chat stays scrolled
};

// Add event listeners for submit and Enter key
form.addEventListener('submit', handleSubmit);

form.addEventListener('keyup', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    handleSubmit(e);
  }
});
