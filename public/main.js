const socket = io()

const clientsTotal = document.getElementById('client-total')

const messageContainer = document.getElementById('message-container')
const nameForm = document.getElementById('name-form')
const nameLabel = document.getElementById('name-label')
const nameInput = document.getElementById('name-input')
const nameButton = document.getElementById('name-submit-button')
const messageForm = document.getElementById('message-form')
const messageInput = document.getElementById('message-input')
const chatBox = document.getElementById('chatbox')
const userList = document.getElementById('users-list')
const userContainer = document.getElementById('users-container')

messageForm.addEventListener('submit', (e) => {
  e.preventDefault()
  sendMessage()
})

function sendMessage() {
    if (messageInput.value === '') return
    const data = {
      name: nameInput.value,
      message: messageInput.value,
      dateTime: new Date(),
    }
    socket.emit('message', data)
    addMessageToUI(true, data)
    messageInput.value = ''
  }

nameForm.addEventListener('submit', (e) => {
    e.preventDefault()
    if(nameInput.value === '')
    {
        alert('Nick nie może być pusty!')
        return
    }
    registerUser()
})

function registerUser() {
    if (nameInput.value === '') return
    socket.emit('new-user', nameInput.value)

    chatBox.style.display = "block"
    clientsTotal.style.display = 'block'
    userContainer.style.display = "block"

    nameInput.style.border = "none"
    nameInput.disabled = true
    nameInput.style.textAlign = "center"
    nameLabel.innerHTML = ""
    nameButton.style.display = 'none'
    nameForm.style.width = "400px"
}

socket.on('clients-total', (data) => {
  clientsTotal.innerText = `Liczba użytkowników w pokoju: ${data}`
})

socket.on('chat-message', (data) => {
  addMessageToUI(false, data)
})

function addMessageToUI(isOwnMessage, data) {
  clearFeedback()
  const element = `
      <li class="${isOwnMessage ? 'message-right' : 'message-left'}">
          <p class="message">
            ${data.message}
            <span>${data.name} ● ${moment(data.dateTime).fromNow()}</span>
          </p>
        </li>
        `

  messageContainer.innerHTML += element
  scrollToBottom()
}

function scrollToBottom() {
  messageContainer.scrollTo(0, messageContainer.scrollHeight)
}

messageInput.addEventListener('focus', (e) => {
  socket.emit('feedback', {
    feedback: `${nameInput.value} pisze`,
  })
})

messageInput.addEventListener('keypress', (e) => {
  socket.emit('feedback', {
    feedback: `${nameInput.value} pisze`,
  })
})
messageInput.addEventListener('blur', (e) => {
  socket.emit('feedback', {
    feedback: '',
  })
})

socket.on('feedback', (data) => {
  clearFeedback()
  const element = `
        <li class="message-feedback">
          <p class="feedback" id="feedback">${data.feedback}</p>
        </li>
  `
  messageContainer.innerHTML += element
})

function clearFeedback() {
  document.querySelectorAll('li.message-feedback').forEach((element) => {
    element.parentNode.removeChild(element)
  })
}

socket.on('user-joined', (data) => {
    const element = `
        <li class="user-feedback">
            <p class="feedback" id="feedback">${data} dołączył/a do czatu</p>
        </li>
    `

    messageContainer.innerHTML += element
})

socket.on('user-left', (data) => {
    const element = `
        <li class="user-feedback">
            <p class="feedback" id="feedback">${data} opuścił/a czat</p>
        </li>
    `

    messageContainer.innerHTML += element
})

socket.on('user-list', (data) => {
  clearNicks()  
  for(const id in data)
  {
    const element = `
      <li class="nick">
        ${data[id]}
      </li>
    `
    userList.innerHTML += element
  }
})

function clearNicks()
{
  document.querySelectorAll("li.nick").forEach((element) =>{
    element.parentNode.removeChild(element)
  })
}