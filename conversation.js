document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const sellerParam = urlParams.get("seller") || urlParams.get("shop");
  const rawSellerName = sellerParam ? decodeURIComponent(sellerParam) : "Electro dz";
  const activeSellerKey = rawSellerName.toLowerCase().trim();

  const currentRole = localStorage.getItem("ryft_user_role") || "buyer"; 
  const STORAGE_KEY = `ryft_chat_${activeSellerKey}`;
  const convoThread = document.querySelector(".convo-thread");
  const messageInput = document.querySelector(".convo-input-bar input");
  const sendBtn = document.querySelector(".send-btn");
  const micBtn = document.querySelector(".mic-btn");

  let mediaRecorder = null;
  let audioChunks = [];
  let isRecording = false;

  // Mark conversation as read
  if (sellerParam) {
    const READ_KEY = "ryft_read_messages";
    const readList = JSON.parse(localStorage.getItem(READ_KEY) || "[]");
    if (!readList.includes(activeSellerKey)) {
      readList.push(activeSellerKey);
      localStorage.setItem(READ_KEY, JSON.stringify(readList));
    }
  }

  function getFormattedTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  }

  function loadMessages() {
    if (!convoThread) return;
    const messages = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const dynamicRows = convoThread.querySelectorAll(".convo-row:not(.static-card)");
    dynamicRows.forEach(row => row.remove());

    messages.forEach(msg => appendMessageToDOM(msg));
    convoThread.scrollTop = convoThread.scrollHeight;
  }

  function saveMessage(msgObj) {
    const messages = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    messages.push(msgObj);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }

  function appendMessageToDOM(msg) {
    if (!convoThread) return;
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

  // Send Text Message
  if (sendBtn && messageInput) {
    const handleSendMessage = () => {
      const text = messageInput.value.trim();
      if (!text) return;

      const newMsg = {
        senderRole: currentRole,
        type: "text",
        text: text,
        time: getFormattedTime()
      };

      saveMessage(newMsg);
      appendMessageToDOM(newMsg);
      messageInput.value = "";
    };

    sendBtn.addEventListener("click", handleSendMessage);
    messageInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleSendMessage();
    });
  }

  // Voice Recording Logic
  if (micBtn && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
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
          micBtn.style.color = "#ef4444";
        } catch (err) {
          console.error("Microphone access error:", err);
        }
      } else {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        isRecording = false;
        micBtn.style.color = "";
      }
    });
  }

  // Header & Product Card Injection
  const title = urlParams.get("title");
  const price = urlParams.get("price");
  const image = urlParams.get("image");
  const shop = urlParams.get("shop") || rawSellerName;

  const pageTitle = document.getElementById("convo-page-title");
  const headerName = document.getElementById("convo-header-name");
  const headerAvatar = document.getElementById("convo-header-avatar");
  const sellerAvatar = document.getElementById("convo-seller-avatar");
  const profileLink = document.getElementById("convo-profile-link");

  const stores = {
    "electro dz": { name: "Electro dz", logo: "electrologo.jpg" },
    "thewoman_dz": { name: "thewoman_dz", logo: "clotheslogo.jpg" },
    "the_shoe_dz": { name: "the_shoe_dz", logo: "shoeslogo.jpg" },
    "makeup_dz": { name: "makeup_dz", logo: "makeuplogo.jpg" },
    "yassine_dz": { name: "Yassine Amrani", logo: "default-avatar.png" }
  };

  const currentUser = stores[activeSellerKey] || {
    name: shop,
    logo: "electrologo.jpg"
  };

  if (pageTitle) pageTitle.textContent = `RYFT — ${currentUser.name}`;
  if (headerName) headerName.textContent = currentUser.name;
  if (headerAvatar) {
    headerAvatar.src = currentUser.logo;
    headerAvatar.alt = currentUser.name;
  }
  if (sellerAvatar) {
    sellerAvatar.src = currentUser.logo;
    sellerAvatar.alt = currentUser.name;
  }
  if (profileLink) {
    profileLink.href = `seller-view-buyer-profile.html?user=${encodeURIComponent(activeSellerKey)}`;
  }

  // Inject Product Card matching your target design
  if (title && price && convoThread) {
    const decodedTitle = decodeURIComponent(title);
    const decodedPrice = decodeURIComponent(price);
    const decodedImage = image ? decodeURIComponent(image) : "headphones.jpg";
    const decodedShop = shop ? decodeURIComponent(shop) : currentUser.name;

    const cardHTML = `
      <div class="convo-row row-right static-card" style="margin-bottom: 20px;">
        <div>
          <div style="border: 2px solid #00bcd4; border-radius: 16px; padding: 10px; background: #fff; max-width: 290px; display: flex; gap: 12px; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
            <img src="${decodedImage}" alt="${decodedTitle}" style="width: 65px; height: 65px; object-fit: cover; border-radius: 10px;">
            <div>
              <h4 style="margin: 0; font-size: 0.92rem; font-weight: 600; color: #111;">${decodedTitle}</h4>
              <p style="margin: 3px 0; font-size: 0.88rem; font-weight: 700; color: #ff5722;">${decodedPrice}</p>
              <span style="font-size: 0.75rem; color: #888;">${decodedShop}</span>
            </div>
          </div>
          <span class="bubble-time" style="text-align: right; display: block; font-size: 0.72rem; color: #aaa; margin-top: 4px;">auto sent when message icon tapped</span>
        </div>
        <div class="bubble-avatar">A</div>
      </div>
    `;
    convoThread.insertAdjacentHTML("afterbegin", cardHTML);
  }

  loadMessages();
});