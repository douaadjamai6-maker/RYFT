
document.addEventListener("DOMContentLoaded", () => {
  // 1. Mock Buyer Database
  const buyerDatabase = {
    "yassine_dz": {
      name: "Yassine Amrani",
      username: "@yassine_dz",
      avatar: "default-avatar.png",
      joinedDate: "2026-08-25",
      completedOrders: 3,
      cancelledOrders: 1,
      cleanOrdersSinceLastCancel: 2,
      history: [
        { id: "ORD-9082", title: "Casual Hoodie", date: "Sep 02, 2026", status: "completed", price: "4200 DA" },
        { id: "ORD-8812", title: "Wireless Headphones", date: "Aug 29, 2026", status: "cancelled", price: "3500 DA" },
        { id: "ORD-8701", title: "USB-C Cable", date: "Aug 26, 2026", status: "completed", price: "800 DA" },
        { id: "ORD-8540", title: "Running Sneakers", date: "Aug 25, 2026", status: "completed", price: "6800 DA" }
      ]
    },
    "lina_t": {
      name: "Lina T.",
      username: "@lina_t",
      avatar: "default-avatar.png",
      joinedDate: "2025-05-12",
      completedOrders: 14,
      cancelledOrders: 0,
      cleanOrdersSinceLastCancel: 14,
      history: [
        { id: "ORD-5102", title: "Makeup Palette", date: "Jul 10, 2026", status: "completed", price: "3200 DA" }
      ]
    }
  };

  // 2. Read 'user' query parameter from URL
  const urlParams = new URLSearchParams(window.location.search);
  const rawUserParam = urlParams.get("user") || "yassine_dz";
  const userKey = rawUserParam.toLowerCase().trim().replace(/^@/, '');

  // 3. Get profile or fallback dynamically
  const buyerProfileData = buyerDatabase[userKey] || {
    name: rawUserParam.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
    username: `@${userKey}`,
    avatar: "default-avatar.png",
    joinedDate: "2026-09-01",
    completedOrders: 1,
    cancelledOrders: 0,
    cleanOrdersSinceLastCancel: 1,
    history: []
  };

  // 4. Populate DOM
  document.getElementById("buyer-name").textContent = buyerProfileData.name;
  document.getElementById("buyer-handle").textContent = buyerProfileData.username;
  if (buyerProfileData.avatar) {
    document.getElementById("buyer-avatar").src = buyerProfileData.avatar;
  }

  // 5. Calculate New User Status (within 30 days)
  const joinDate = new Date(buyerProfileData.joinedDate);
  const currentDate = new Date();
  const diffInDays = Math.floor((currentDate - joinDate) / (1000 * 60 * 60 * 24));
  const isNewUser = diffInDays <= 30;

  // 6. Calculate Flagged Status
  const isFlagged = buyerProfileData.cancelledOrders > 0 && buyerProfileData.cleanOrdersSinceLastCancel < 5;

  // 7. Render Badges
  const badgesContainer = document.getElementById("badges-container");
  let badgesHTML = "";

  if (isNewUser) {
    badgesHTML += `<span class="trust-badge badge-new"><i class="fa-solid fa-sparkles"></i> New to Ryft</span>`;
  }

  if (isFlagged) {
    badgesHTML += `<span class="trust-badge badge-flagged"><i class="fa-solid fa-triangle-exclamation"></i> Flagged Buyer</span>`;
  } else if (!isNewUser && buyerProfileData.completedOrders >= 5) {
    badgesHTML += `<span class="trust-badge badge-trusted"><i class="fa-solid fa-circle-check"></i> Trusted Buyer</span>`;
  }

  badgesContainer.innerHTML = badgesHTML;

  // 8. Handle Flag Warning Banner
  const alertBox = document.getElementById("cancellation-alert");
  if (isFlagged) {
    const cleanLeftText = document.getElementById("clean-orders-left");
    const ordersNeeded = 5 - buyerProfileData.cleanOrdersSinceLastCancel;
    
    cleanLeftText.textContent = `${ordersNeeded} more`;
    alertBox.style.display = "flex";
  } else if (alertBox) {
    alertBox.style.display = "none";
  }

  // 9. Update Stats Grid
  const totalOrders = buyerProfileData.completedOrders + buyerProfileData.cancelledOrders;
  const rate = totalOrders > 0 ? Math.round((buyerProfileData.completedOrders / totalOrders) * 100) : 0;

  document.getElementById("stat-completed-count").textContent = buyerProfileData.completedOrders;
  document.getElementById("stat-cancelled-count").textContent = buyerProfileData.cancelledOrders;
  document.getElementById("stat-completion-rate").textContent = `${rate}%`;

  // 10. Render History Logs
  const historyContainer = document.getElementById("history-container");
  
  if (buyerProfileData.history.length === 0) {
    historyContainer.innerHTML = `<p style="text-align:center; color:#64748b; font-size:13px; padding: 20px 0;">No order history available.</p>`;
  } else {
    historyContainer.innerHTML = buyerProfileData.history.map(item => {
      const isCompleted = item.status === "completed";
      return `
        <div class="history-item">
          <div class="history-info">
            <div class="history-icon ${isCompleted ? 'icon-success' : 'icon-cancel'}">
              <i class="fa-solid ${isCompleted ? 'fa-bag-shopping' : 'fa-xmark'}"></i>
            </div>
            <div class="history-details">
              <h5>${item.title}</h5>
              <span>${item.id} • ${item.date}</span>
            </div>
          </div>
          <div style="text-align: right;">
            <div class="history-status ${isCompleted ? 'status-completed' : 'status-cancelled'}">
              ${isCompleted ? 'Completed' : 'Cancelled'}
            </div>
            <span style="font-size:12px; font-weight:600; color:#475569;">${item.price}</span>
          </div>
        </div>
      `;
    }).join("");
  }

  // 11. Message Button Link
  const messageBtn = document.getElementById("message-buyer-btn");
  if (messageBtn) {
    messageBtn.href = `conversation.html?user=${encodeURIComponent(userKey)}`;
  }
});
