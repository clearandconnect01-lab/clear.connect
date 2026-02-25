// ===== CONFIGURATION =====
const API_URL = 'http://localhost:5000/api';

// ===== DATA =====
const collectors = [
  { name: "Green Earth Recycling", materials: ["plastic", "paper"], contact: "+91 98765 43210" },
  { name: "Metal & More", materials: ["metal"], contact: "+91 91234 56789" },
  { name: "Eco Glass Collectors", materials: ["glass"], contact: "+91 99887 77665" },
  { name: "E-Waste Hub", materials: ["ewaste"], contact: "+91 90909 80808" },
];

// ===== UTILS =====
function getCurrentUserEmail() {
  return localStorage.getItem("userEmail");
}

function setCurrentUserEmail(email) {
  localStorage.setItem("userEmail", email);
}

function clearUserSession() {
  localStorage.removeItem("userEmail");
}

// ===== FUNCTIONS =====

// 1. Render Collectors (Index Page)
function renderCollectors(list) {
  const container = document.getElementById('collectorList');
  if (!container) return;
  container.innerHTML = '';
  list.forEach(c => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${c.name}</h3>
      <p><strong>Materials:</strong> ${c.materials.join(', ')}</p>
      <p><strong>Contact:</strong> ${c.contact}</p>
      <button onclick="window.location.href='calculate.html'">View Details</button>
    `;
    container.appendChild(card);
  });
}

// 2. Save Profile (Signup/Login)
async function saveProfile() {
  const name = document.getElementById("name")?.value.trim() || document.getElementById("setupName")?.value.trim();
  const email = document.getElementById("email")?.value.trim() || document.getElementById("setupEmail")?.value.trim();
  const phone = document.getElementById("phone")?.value.trim() || document.getElementById("setupPhone")?.value.trim();

  if (!name || !email || !phone) {
    alert("Please fill all fields!");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone }),
    });
    const data = await res.json();

    if (data.success) {
      setCurrentUserEmail(email);
      // Redirect or update UI based on current page
      if (window.location.pathname.endsWith("profile.html")) {
        loadProfile(); // Reload profile data
      } else {
        window.location.href = "index.html"; // Go to home / refresh
      }
    } else {
      alert("Error saving profile: " + data.message);
    }
  } catch (err) {
    console.error(err);
    alert("Server error. Ensure backend is running.");
  }
}

// 3. Load Profile (Profile Page)
async function loadProfile() {
  const email = getCurrentUserEmail();
  if (!email) {
    // Show setup form, hide profile
    document.getElementById("profileSection").style.display = "none";
    document.getElementById("setupSection").style.display = "block";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/profile/${email}`);
    if (!res.ok) throw new Error("User not found");
    const user = await res.json();

    // Show profile, hide setup
    document.getElementById("setupSection").style.display = "none";
    document.getElementById("profileSection").style.display = "block";

    // Populate Data
    document.getElementById("userName").textContent = user.name || "User";
    document.getElementById("userEmail").textContent = user.email || "";
    document.getElementById("userPhone").textContent = user.phone || "";
    document.getElementById("points").textContent = user.greenPoints || 0;

    // Populate History
    const historyTable = document.getElementById("historyTable");
    historyTable.innerHTML = "";
    if (!user.history || user.history.length === 0) {
      historyTable.innerHTML = "<tr><td colspan='4'>No history yet</td></tr>";
    } else {
      user.history.forEach(h => {
        historyTable.innerHTML += `
          <tr>
            <td>${h.material}</td>
            <td>${h.kg}</td>
            <td>${h.points}</td>
            <td>${new Date(h.date).toLocaleString()}</td>
          </tr>
        `;
      });
    }

  } catch (err) {
    console.error(err);
    // If fetch fails (user deleted or server error), clear session and show setup
    alert("Could not load profile. Please sign in again.");
    clearUserSession();
    window.location.reload();
  }
}

// 4. Calculate Points (Calculator Page)
async function calculateAndSavePoints() {
  const email = getCurrentUserEmail();
  if (!email) {
    alert("Please log in first!");
    window.location.href = "index.html";
    return;
  }

  const plastic = parseInt(document.getElementById('plastic')?.value) || 0;
  const paper = parseInt(document.getElementById('paper')?.value) || 0;
  const metal = parseInt(document.getElementById('metal')?.value) || 0;
  const glass = parseInt(document.getElementById('glass')?.value) || 0;
  const ewaste = parseInt(document.getElementById('ewaste')?.value) || 0;

  if (plastic + paper + metal + glass + ewaste === 0) {
    alert("Please enter at least one material quantity.");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, plastic, paper, metal, glass, ewaste }),
    });
    const data = await res.json();

    if (data.success) {
      document.getElementById('result').innerText = `You earned: ${data.earned} points 🌱 | Total: ${data.totalPoints} points 🌱`;
      document.getElementById('proceedBtn').style.display = 'inline-block';
    } else {
      alert("Error: " + data.message);
    }
  } catch (err) {
    console.error(err);
    alert("Server error.");
  }
}

// 5. Logout
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    clearUserSession();
    window.location.href = "index.html";
  }
}

// ===== INITIALIZATION =====
window.onload = () => {
  const path = window.location.pathname;
  const email = getCurrentUserEmail();

  // Route: index.html (or root)
  if (path.endsWith("index.html") || path === "/") {
    if (email) {
      document.getElementById("mainContent").style.display = "block";
      renderCollectors(collectors);
    } else {
      document.getElementById("profileSetup").style.display = "block";
    }
  }

  // Route: profile.html
  if (path.endsWith("profile.html")) {
    loadProfile();
    document.getElementById("logoutBtn")?.addEventListener("click", logout);
  }

  // Route: calculate.html
  if (path.endsWith("calculate.html")) {
    if (!email) {
      window.location.href = "index.html";
    }
  }
};
