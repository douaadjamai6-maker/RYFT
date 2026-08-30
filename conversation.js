document.addEventListener("DOMContentLoaded", () => {
  // 1. Identify URL params & active role context
  const urlParams = new URLSearchParams(window.location.search);
  const sellerParam = urlParams.get("seller") || urlParams.get("shop");
  const rawSellerName = sellerParam ? decodeURIComponent(sellerParam) : "electro dz";
  const activeSellerKey = rawSellerName.toLowerCase().trim();

  // Role simulation check: Reads active account mode (defaults to 'buyer' unless set to 'seller')
  const currentRole = localStorage.getItem("ryft_user_role") || "buyer"; 

  const STORAGE_KEY = `ryft_chat_${activeSellerKey}`;
  const convoThread = document.querySelector(".convo-thread");
  const messageInput = document.querySelector(".convo-input-bar input");
  const sendBtn = document.querySelector(".send-btn");
  const micBtn = document.querySelector(".mic-btn");

  // Audio Recording Variables
  let mediaRecorder = null;
  let audioChunks = [];
  let isRecording = false;

  // 2. Mark conversation as read
  if (sellerParam) {
    const READ_KEY = "ryft_read_messages";
    const readList = JSON.parse(localStorage.getItem(READ_KEY) || "[]");
    if (!readList.includes(activeSellerKey)) {
      readList.push(activeSellerKey);
      localStorage.setItem(READ_KEY, JSON.stringify(readList));
    }
  }

  // Helper: Format Current Time (e.g., 10:35 pm)
  function getFormattedTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  }

  // Helper: Load Messages from localStorage
  function loadMessages() {
    const messages = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    
    // Clear dynamic messages (preserve auto-sent product card if present)
    const dynamicRows = convoThread.querySelectorAll(".convo-row:not(.static-card)");
    dynamicRows.forEach(row => row.remove());

    messages.forEach(msg => appendMessageToDOM(msg));
    convoThread.scrollTop = convoThread.scrollHeight;
  }

  // Helper: Save new message to localStorage
  function saveMessage(msgObj) {
    const messages = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    messages.push(msgObj);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }

  // Helper: Append Message DOM element based on current role perspective
  function appendMessageToDOM(msg) {
    const isSentByMe = msg.senderRole === currentRole;
    const rowClass = isSentByMe ? "row-right" : "row-left";
    const bubbleClass = isSentByMe ? "bubble-sent" : "bubble-received";

    const row = document.createElement("div");
    row.className = `convo-row ${rowClass}`;

    let contentHTML = "";
    if (msg.type === "text") {
      contentHTML = `<div class="bubble ${bubbleClass}">${msg.text}</div>`;
    } else if (msg.type === "audio") {
      contentHTML = `
        <div class="bubble ${bubbleClass} voice-bubble" style="display:flex; align-items:center; gap:8px;">
          <audio src="${msg.audioUrl}" controls style="max-width: 200px; height: 32px;"></audio>
        </div>`;
    }

    if (isSentByMe) {
      row.innerHTML = `
        <div>
          ${contentHTML}
          <span class="bubble-time" style="text-align: right;">${msg.time}</span>
        </div>
        <div class="bubble-avatar">${currentRole === "buyer" ? "A" : "S"}</div>
      `;
    } else {
      row.innerHTML = `
        <img src="electrologo.jpg" alt="Avatar" class="bubble-avatar-img">
        <div>
          ${contentHTML}
          <span class="bubble-time">${msg.time}</span>
        </div>
      `;
    }

    convoThread.appendChild(row);
    convoThread.scrollTop = convoThread.scrollHeight;
  }

  // 3. Send Text Message Event
  function handleSendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    const newMsg = {
      senderRole: currentRole, // 'buyer' or 'seller'
      type: "text",
      text: text,
      time: getFormattedTime()
    };

    saveMessage(newMsg);
    appendMessageToDOM(newMsg);
    messageInput.value = "";
  }

  sendBtn.addEventListener("click", handleSendMessage);
  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSendMessage();
  });

  // 4. Voice Recording Logic (Mic Button)
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    micBtn.addEventListener("click", async () => {
      if (!isRecording) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaRecorder = new MediaRecorder(stream);
          audioChunks = [];

          mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);

          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
            const reader = new FileReader();
            
            // Convert audio blob to Base64 data URL for localStorage persistence
            reader.readAsDataURL(audioBlob);
            reader.onloadend = () => {
              const base64Audio = reader.result;
              const voiceMsg = {
                senderRole: currentRole,
                type: "audio",
                audioUrl: base64Audio,
                time: getFormattedTime()
              };
              saveMessage(voiceMsg);
              appendMessageToDOM(voiceMsg);
            };
          };

          mediaRecorder.start();
          isRecording = true;
          micBtn.style.color = "#ef4444"; // Highlight mic icon in red while recording
        } catch (err) {
          console.error("Microphone access denied or error:", err);
        }
      } else {
        // Stop recording
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        isRecording = false;
        micBtn.style.color = "";
      }
    });
  }

  // 5. Inject Auto-Sent Product Card (If present in URL)
  const title = urlParams.get("title");
  const price = urlParams.get("price");
  const image = urlParams.get("image");
  const shop = urlParams.get("shop");

  if (title && price && image && shop && convoThread) {
    const cardHTML = `
      <div class="convo-row row-right static-card">
        <div class="auto-sent-card">
          <div class="auto-sent-content">
            <img src="${image}" alt="${title}" class="auto-sent-img">
            <div class="auto-sent-details">
              <p class="auto-sent-title">${title}</p>
              <p class="auto-sent-price">${price}</p>
              <p class="auto-sent-shop">${shop}</p>
            </div>
          </div>
          <p class="auto-sent-subtext">auto sent when message icon tapped</p>
        </div>
      </div>
    `;
    convoThread.insertAdjacentHTML("afterbegin", cardHTML);
  }

  // Initialize and render all persistent thread messages
  loadMessages();
});