function getPlaylistId(input) {
  if (!input) return null;
  try {
    if (/^https?:\/\//i.test(input)) {
      const url = new URL(input);
      const id = url.searchParams.get("list");
      if (id) return id;
    }
  } catch (e) {}
  return input.trim();
}

let player = null;
let mode = "menu"; // 'menu' | 'playing'

const moodListEl = document.getElementById("mood-list");
const overlayEl = document.getElementById("screen-overlay");
const playerEl = document.getElementById("player");

const items = Array.from(moodListEl.querySelectorAll(".mood-item"));
let selectedIndex = Math.max(
  0,
  items.findIndex((li) => li.classList.contains("active"))
);

function setOverlay(text) {
  overlayEl.textContent = text;
}

function showMenu() {
  mode = "menu";
  moodListEl.style.display = "grid";
  playerEl.classList.remove("show");
  setOverlay("Select a mood");
}

function showPlayer() {
  mode = "playing";
  moodListEl.style.display = "none";
  playerEl.classList.add("show");
}

function selectIndex(idx) {
  selectedIndex = (idx + items.length) % items.length;
  items.forEach((li, i) => li.classList.toggle("active", i === selectedIndex));
}

function currentPlaylistId() {
  const li = items[selectedIndex];
  return getPlaylistId(li?.dataset.playlist);
}

function startPlayback() {
  const listId = currentPlaylistId();
  if (!listId) {
    setOverlay("Invalid playlist");
    return;
  }
  showPlayer();

  if (!player) {
    player = new YT.Player("player", {
      height: "100%",
      width: "100%",
      playerVars: { 
        listType: "playlist", 
        list: listId, 
        index: 0,
        controls: 0,       
        disablekb: 1,
        modestbranding: 1,
        rel: 0,
        fs: 0   },
      events: {
        onReady: () => {
          setOverlay("Playing…");
          player.playVideo && player.playVideo();
        },
        onStateChange: (e) => {
          if (e.data === YT.PlayerState.PLAYING) setOverlay("Playing…");
          else if (e.data === YT.PlayerState.PAUSED) setOverlay("Paused");
          else if (e.data === YT.PlayerState.ENDED) setOverlay("End of playlist");
          else if (e.data === YT.PlayerState.BUFFERING) setOverlay("Buffering…");
        },
        onError: (e) => {
          console.warn("Video error", e);
          setOverlay("Error: cannot load video");
          },
        },
      });
     } else {
    player.loadPlaylist({ list: listId, listType: "playlist", index: 0 });
    player.playVideo && player.playVideo();
  }
}

// Button references
const btnMenu = document.querySelector(".menu-button");
const btnFwd = document.querySelector(".forward-button");
const btnBack = document.querySelector(".backward-button");
const btnDown = document.querySelector(".down-button");
const btnCenter = document.querySelector(".center-button");

btnMenu.addEventListener("click", () => {
  if (mode === "playing") {
    showMenu();
  } else if (mode === "menu") {
    showPlayer();
  }else {
    setOverlay("Select a mood");
  }
});

btnCenter.addEventListener("click", () => {
  if (mode === "menu") startPlayback();
  else if (mode === "playing" && player) {
    const s = player.getPlayerState();
    if (s === YT.PlayerState.PLAYING) player.pauseVideo();
    else player.playVideo();
  }
});

btnDown.addEventListener("click", () => {
  if (player) {
    const s = player.getPlayerState();
    if (s === YT.PlayerState.PLAYING) player.pauseVideo();
    else player.playVideo();
  } else if (mode === "menu") {
    startPlayback();
  }
});

btnFwd.addEventListener("click", () => {
  if (mode === "menu") {
    selectIndex(selectedIndex + 1);
    setOverlay(items[selectedIndex].textContent.trim());
  } else if (player) {
    player.nextVideo();
  }
});

btnBack.addEventListener("click", () => {
  if (mode === "menu") {
    selectIndex(selectedIndex - 1);
    setOverlay(items[selectedIndex].textContent.trim());
  } else if (player) {
    player.previousVideo();
  }
});

items.forEach((li, i) => {
  li.addEventListener("click", () => {
    selectIndex(i);
    setOverlay(li.textContent.trim());
  });
});

window.onYouTubeIframeAPIReady = function () {
  setOverlay("Select a mood");
};

showMenu();