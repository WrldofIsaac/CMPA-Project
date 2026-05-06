const API_URL = "http://localhost:3000";

// =======================
// 🔐 AUTH (FIXED - GLOBAL)
// =======================
async function register() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({username,password})
  });

  const data = await res.json();
  document.getElementById("authMessage").textContent = data.message;
}

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({username,password})
  });

  const data = await res.json();
  if(data.token){
    localStorage.setItem("token", data.token);
    document.getElementById("authMessage").textContent = "Logged in!";
  }
}

// =======================
// 📑 TABS (FIXED)
// =======================
function openTab(evt, tabName) {
  const tabContents = document.querySelectorAll(".tab-content");
  const tabs = document.querySelectorAll(".tab");

  tabContents.forEach(tab => tab.classList.remove("active"));
  tabs.forEach(tab => tab.classList.remove("active"));

  document.getElementById(tabName).classList.add("active");
  evt.currentTarget.classList.add("active");
}

// =======================
// 🚀 MAIN APP
// =======================
document.addEventListener("DOMContentLoaded", () => {

  // =======================
  // 🌙 THEME TOGGLE (FIXED)
  // =======================
  const themeToggle = document.getElementById("themeToggle");

  // Load saved theme
  if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light-mode");
    themeToggle.textContent = "☀️ Light Mode";
  }

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");

    if (document.body.classList.contains("light-mode")) {
      themeToggle.textContent = "☀️ Light Mode";
      localStorage.setItem("theme", "light");
    } else {
      themeToggle.textContent = "🌙 Dark Mode";
      localStorage.setItem("theme", "dark");
    }
  });

  // =======================
  // 🔍 SEARCH SYSTEM
  // =======================
  const searchInput = document.getElementById("searchInput");
  const resultsBox = document.getElementById("searchResults");

  const localData = [
    { name: "New Releases", category: "Songs", desc: "Latest music drops" },
    { name: "Artists", category: "Songs", desc: "Top creators" },
    { name: "Top Songs", category: "Songs", desc: "Trending tracks" },

    { name: "Tracks", category: "Products", desc: "Studio-quality music" },
    { name: "Pads Pack", category: "Products", desc: "Atmospheric textures" },
    { name: "Guitar Bundle", category: "Products", desc: "Guitar tones" },

    { name: "Ambient Pads", category: "Sounds", desc: "Soft textures" },
    { name: "Loops", category: "Sounds", desc: "Ready loops" },
    { name: "Templates", category: "Sounds", desc: "DAW templates" }
  ];

  let timeout;

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    clearTimeout(timeout);

    if (!query) {
      resultsBox.style.display = "none";
      resultsBox.innerHTML = "";
      return;
    }

    // Local results
    const localFiltered = localData.filter(item =>
      item.name.toLowerCase().includes(query)
    );

    let html = "";

    if (localFiltered.length > 0) {
      html += `<div class="search-category">Quick Results</div>`;
      localFiltered.forEach(item => {
        html += `
          <div class="search-item" onclick="selectResult('${item.desc}')">
            ${item.name}
          </div>
        `;
      });
    }

    resultsBox.innerHTML = html;
    resultsBox.style.display = "block";

    // API results (delayed)
    timeout = setTimeout(async () => {
      try {
        const res = await fetch(`https://itunes.apple.com/search?term=${query}&media=music&limit=5`);
        const apiData = await res.json();

        if (apiData.results.length > 0) {
          let apiHTML = `<div class="search-category">Songs</div>`;

          apiData.results.forEach(song => {
            if (!song.previewUrl) return;

            apiHTML += `
              <div class="search-item" onclick="playPreview('${song.previewUrl}', '${song.trackName}')">
                
                <img 
                  src="${song.artworkUrl100.replace('100x100','300x300')}" 
                  class="search-thumb"
                />

                <div class="search-info">
                  <div class="search-title">${song.trackName}</div>
                  <div class="search-artist">${song.artistName}</div>
                </div>

              </div>
            `;
          });

          resultsBox.innerHTML += apiHTML;
        }

      } catch (err) {
        console.error("API error:", err);
      }
    }, 400);
  });

  // Close dropdown
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-box")) {
      resultsBox.style.display = "none";
    }
  });

});

// =======================
// 🎵 GLOBAL FUNCTIONS
// =======================
function playPreview(url, title) {
  openModal(`
    <strong>Now Playing:</strong><br>${title}<br><br>
    <audio controls autoplay>
      <source src="${url}" type="audio/mpeg">
    </audio>
  `);

  document.getElementById("searchResults").style.display = "none";
  document.getElementById("searchInput").value = "";
}

function selectResult(text) {
  openModal(text);
  document.getElementById("searchResults").style.display = "none";
  document.getElementById("searchInput").value = "";
}

function openModal(content) {
  document.getElementById("modalText").innerHTML = content;
  document.getElementById("modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}