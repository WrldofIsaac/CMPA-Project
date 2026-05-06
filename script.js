const API_URL = "http://localhost:3000";

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

const searchInput = document.getElementById("searchInput");
const resultsBox = document.getElementById("searchResults");

// Local fallback data
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

// Debounce (prevents spam API calls)
let timeout;

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();

  clearTimeout(timeout);

  if (!query) {
    resultsBox.style.display = "none";
    resultsBox.innerHTML = "";
    return;
  }

  // 🔹 1. Show LOCAL results instantly
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

  // Show immediately (fast UX)
  resultsBox.innerHTML = html;
  resultsBox.style.display = "block";

  // 🔹 2. Fetch API results AFTER delay
  timeout = setTimeout(async () => {
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${query}&media=music&limit=5`);
      const apiData = await res.json();
      console.log(apiData);

      if (apiData.results.length > 0) {
        let apiHTML = `<div class="search-category">Songs</div>`;

       apiData.results.forEach(song => {
  if (!song.previewUrl) return; // ✅ skip broken audio

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
  }, 400); // delay = smoother + fewer requests
});

// Play preview when clicking API result
function playPreview(url, title) {
  openModal(`
    <strong>Now Playing:</strong><br>${title}<br><br>
    <audio controls autoplay>
      <source src="${url}" type="audio/mpeg">
      Your browser does not support audio.
    </audio>
  `);

  resultsBox.style.display = "none";
  searchInput.value = "";
}

// Local result click
function selectResult(text) {
  openModal(text);
  resultsBox.style.display = "none";
  searchInput.value = "";
}

// Close dropdown
document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-box")) {
    resultsBox.style.display = "none";
  }
});


function openModal(content) {
  document.getElementById("modalText").innerHTML = content; // 
  document.getElementById("modal").style.display = "flex";
}
function closeModal() {
  document.getElementById("modal").style.display = "none";
}