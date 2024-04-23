// main.js
const socket = io();

let room = "room1"; 

const clientsTotal = document.getElementById("client-total");

const messageContainer1 = document.getElementById("message-container-1");
const messageContainer2 = document.getElementById("message-container-2");
const messageContainer3 = document.getElementById("message-container-3");
const messageContainer4 = document.getElementById("message-container-4");
const nameForm = document.getElementById("name-form");
const nameLabel = document.getElementById("name-label");
const nameInput = document.getElementById("name-input");
const nameButton = document.getElementById("name-submit-button");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
const chatBox = document.getElementById("chatbox");
const userList = document.getElementById("users-list");
const userContainer = document.getElementById("users-container");
const roomsDropdown = document.getElementById("rooms-dropdown")
const roomButtons = document.querySelectorAll(".room-button");

const messageContainers = Array.of(
  messageContainer1, 
  messageContainer2, 
  messageContainer3,
  messageContainer4)
let currentMessageContainerIndex = 0

function updateMessageContrainerIndex(room) {
  switch (room) {
    case "room1":
      currentMessageContainerIndex = 0;
      break;
    case "room2":
      currentMessageContainerIndex = 1;
      break;
    case "room3":
      currentMessageContainerIndex = 2;
      break;
    case "room4":
      currentMessageContainerIndex = 3;
      break;
    default:
      console.log("Invalid room ID");
      currentMessageContainerIndex = 0;
  }
}

roomButtons.forEach((button) => {
  button.addEventListener("click", () => {
    room = button.id;
    socket.emit("join-room", room, nameInput.value);
    messageContainers[currentMessageContainerIndex].classList.remove("message-container-show");
    messageContainers[currentMessageContainerIndex].classList.add("message-container");
    updateMessageContrainerIndex(room)
    messageContainers[currentMessageContainerIndex].classList.add("message-container-show");
    messageContainers[currentMessageContainerIndex].classList.remove("message-container");
  });
});

function setActive(button) {
  roomButtons.forEach(function(btn) {
      btn.classList.remove('active');
  });
  button.classList.add('active');
}

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage();
});

function sendMessage() {
  if (messageInput.value === "") return;
  const data = {
    name: nameInput.value,
    message: messageInput.value,
    dateTime: new Date(),
    currentMessageContainerIndex: currentMessageContainerIndex
  };
  socket.emit("message", data, room);
  addMessageToUI(true, data);
  messageInput.value = "";
}

nameForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (nameInput.value === "") {
    alert("Nick nie może być pusty!");
    return;
  }
  registerUser();
});

function registerUser() {
  if (nameInput.value === "") return;
  socket.emit("new-user", nameInput.value, room);

  chatBox.style.display = "block";
  clientsTotal.style.display = "block";
  userContainer.style.display = "block";

  nameInput.style.border = "none";
  nameInput.disabled = true;
  nameInput.style.textAlign = "center";
  nameLabel.innerHTML = "";
  nameButton.style.display = "none";
  nameForm.style.width = "400px";
  roomsDropdown.style.display = "none";

  messageContainers[currentMessageContainerIndex].classList.remove("message-container-show");
  messageContainers[currentMessageContainerIndex].classList.add("message-container");
  updateMessageContrainerIndex(roomsDropdown.value)
 // messageContainers[currentMessageContainerIndex].style.display = "block"
  messageContainers[currentMessageContainerIndex].classList.add("message-container-show");
  messageContainers[currentMessageContainerIndex].classList.remove("message-container");
  setActive(roomButtons[currentMessageContainerIndex])
}

socket.on("clients-total", (data) => {
  clientsTotal.innerText = `Liczba użytkowników w pokoju: ${data}`;
});

socket.on("chat-message", (data) => {
  addMessageToUI(false, data);
});

function addMessageToUI(isOwnMessage, data) {
  clearFeedback();
  if (data.isImage) {
    const element = `
      <li class="message ${isOwnMessage ? "message-right" : "message-left"}">
        <img src="${data.message}" alt="Image" />
        <p>
          <span>${data.name} ● ${moment(data.dateTime).calendar()}</span>
        </p>
      </li>
    `;
    messageContainers[data.currentMessageContainerIndex].innerHTML += element;
  } else {
    const element = `
      <li class="message ${isOwnMessage ? "message-right" : "message-left"}">
        <p>
          ${data.message}
          <span>${data.name} ● ${moment(data.dateTime).calendar()}</span>
        </p>
      </li>
    `;
    messageContainers[data.currentMessageContainerIndex].innerHTML += element;
  }
  scrollToBottom();
}


function scrollToBottom() {
  messageContainers[currentMessageContainerIndex].scrollTo(0, messageContainers[currentMessageContainerIndex].scrollHeight);
}

messageInput.addEventListener("focus", (e) => {
  socket.emit("feedback", {
    feedback: `${nameInput.value} pisze`,
  });
});

messageInput.addEventListener("keypress", (e) => {
  socket.emit("feedback", {
    feedback: `${nameInput.value} pisze`,
  });
});
messageInput.addEventListener("blur", (e) => {
  socket.emit("feedback", {
    feedback: "",
  });
});

socket.on("feedback", (data) => {
  clearFeedback();
  const element = `
        <li class="message-feedback">
          <p class="feedback" id="feedback">${data.feedback}</p>
        </li>
  `;
  messageContainers[currentMessageContainerIndex].innerHTML += element;
});

function clearFeedback() {
  document.querySelectorAll("li.message-feedback").forEach((element) => {
    element.parentNode.removeChild(element);
  });
}

socket.on("user-joined", (data) => {
  const element = `
        <li class="user-feedback">
            <p class="feedback" id="feedback">${data} dołączył/a do czatu</p>
        </li>
    `;

    messageContainers[currentMessageContainerIndex].innerHTML += element;
});

socket.on("user-left", (data) => {
  const element = `
        <li class="user-feedback">
            <p class="feedback" id="feedback">${data} opuścił/a czat</p>
        </li>
    `;

    messageContainers[currentMessageContainerIndex].innerHTML += element;
});

socket.on("user-list", (data) => {
  clearNicks();
  for (const id in data) {
    const element = `
      <li class="nick">
        ${data[id]}
      </li>
    `;
    userList.innerHTML += element;
  }
});

function clearNicks() {
  document.querySelectorAll("li.nick").forEach((element) => {
    element.parentNode.removeChild(element);
  });
}

const photoButton = document.getElementById("photo-button");
const fileInput = document.getElementById("file-input");

photoButton.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = () => {
    const dataUrl = reader.result;
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const data = {
        name: nameInput.value,
        message: canvas.toDataURL(),
        dateTime: new Date(),
        isImage: true,
        currentMessageContainerIndex: currentMessageContainerIndex
      };
      socket.emit("message", data, room);
      addMessageToUI(true, data);
    };
  };
  reader.readAsDataURL(file);
});
