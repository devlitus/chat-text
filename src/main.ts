import { Ollama, ChatResponse } from "ollama";

const $sendButton = document.querySelector("#send-button") as HTMLButtonElement;
const $chatMessages = document.querySelector(
  "#chat-messages"
) as HTMLDivElement;
const $messageInput = document.querySelector(
  "#message-input"
) as HTMLInputElement;
const $loader = document.querySelector('#loader') as HTMLDivElement;

let assistantMessageContainer: HTMLDivElement | null = null;
let assistantMessageBubble: HTMLSpanElement | null = null;
const ollama = new Ollama();
const model = "llama3.1";

async function fetchResponse(message: string) {
  try {
    const response = await ollama.chat({
      model,
      messages: [{ role: "user", content: message }],
      stream: true,
    });
    for await (let part of response) {
      await handleSendMessagePart(part);
    }
  } catch (error) {
    console.error("Error fetching response:", error);
    return null;
  } finally {
    $loader.style.display = 'none';
  }
}

function displayUserMessage(content: string) {
  const messageContainer = document.createElement('div');
  messageContainer.classList.add('message', 'user');

  const messageBubble = document.createElement('span');
  messageBubble.classList.add('message-bubble');
  messageBubble.textContent = content;

  messageContainer.appendChild(messageBubble);
  $chatMessages.appendChild(messageContainer);

  // Scroll to the bottom of the chat
  $chatMessages.scrollTop = $chatMessages.scrollHeight;
  assistantMessageContainer = null;
  assistantMessageBubble = null;
}

function displayAssistantMessage(content: string) {
  if (!assistantMessageContainer) {
    assistantMessageContainer = document.createElement('div');
    assistantMessageContainer.classList.add('message', 'assistant');

    assistantMessageBubble = document.createElement('span');
    assistantMessageBubble.classList.add('message-bubble');

    assistantMessageContainer.appendChild(assistantMessageBubble);
    $chatMessages.appendChild(assistantMessageContainer);
  }

  if (assistantMessageBubble) {
    assistantMessageBubble.textContent += content; 
  }


  // Scroll to the bottom of the chat
  $chatMessages.scrollTop = $chatMessages.scrollHeight;
}

async function handleSendMessagePart(part: ChatResponse) {
  if (part && part.message.role === 'assistant') {
    displayAssistantMessage(part.message.content);
  }
}

async function handleSendMessage() {
  const message = $messageInput.value.trim();
  if (!message) return;

  // Display user message
  displayUserMessage(message);
  
  // Fetch and display response
  await fetchResponse(message);

  // Clear input field
  $messageInput.value = '';
}

$sendButton.addEventListener('click', handleSendMessage);
$messageInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    handleSendMessage();
  }
});