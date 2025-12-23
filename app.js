document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("searchForm");
  const input = document.getElementById("searchInput");
  const wordEl = document.getElementById("word");
  const pronunciationEl = document.getElementById("pronunciation");
  const originEl = document.getElementById("origin");
  const definitionsEl = document.getElementById("definitions");
  const synonymsEl = document.getElementById("synonyms");
  const audioBtn = document.getElementById("playAudio");
  const statusEl = document.getElementById("status");
  const messagesEl = document.getElementById("messages");
  const historyList = document.getElementById("historyList");

  let currentAudioSrc = null;

  async function fetchWordData(word) {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
      word
    )}`;
    try {
      statusEl.classList.remove("hidden");
      const response = await fetch(url);
      if (!response.ok) throw new Error("Word not found");
      const data = await response.json();
      return data[0];
    } catch (error) {
      console.error(error);
      return null;
    } finally {
      statusEl.classList.add("hidden");
    }
  }

  function resetUI() {
    wordEl.textContent = "";
    pronunciationEl.textContent = "";
    originEl.textContent = "";
    definitionsEl.innerHTML = "";
    synonymsEl.innerHTML = "";
    audioBtn.style.display = "none";
    messagesEl.innerHTML = "";
    currentAudioSrc = null;
  }

  function displayWordData(data) {
    if (!data) {
      showMessage("No results found.", "error");
      return;
    }

    wordEl.textContent = data.word;
    pronunciationEl.textContent =
      data.phonetics.find((p) => p.text)?.text ||
      "Pronunciation not available.";
    originEl.textContent = data.origin ? `Origin: ${data.origin}` : "";

    const audioSrc = data.phonetics.find((p) => p.audio)?.audio;
    if (audioSrc) {
      currentAudioSrc = audioSrc.startsWith("//")
        ? "https:" + audioSrc
        : audioSrc;
      audioBtn.style.display = "inline-block";
    }

    definitionsEl.innerHTML = "<div class='section-title'>Definitions</div>";
    data.meanings.forEach((meaning) => {
      meaning.definitions.forEach((def) => {
        definitionsEl.innerHTML += `
          <div class="definition">
            <strong>${meaning.partOfSpeech}:</strong> ${def.definition}
            ${def.example ? `<div class="example">“${def.example}”</div>` : ""}
          </div>`;
      });
    });

    synonymsEl.innerHTML = "<div class='section-title'>Synonyms</div>";
    const synonyms = [];
    data.meanings.forEach((m) =>
      m.definitions.forEach((d) => synonyms.push(...(d.synonyms || [])))
    );
    if (synonyms.length) {
      synonymsEl.innerHTML += synonyms
        .map((s) => `<span class="token">${s}</span>`)
        .join("");
    } else {
      synonymsEl.innerHTML +=
        "<div class='message'>No synonyms available.</div>";
    }
  }

  function showMessage(text, type = "info") {
    messagesEl.innerHTML = `<div class="message ${
      type === "error" ? "error" : ""
    }">${text}</div>`;
  }

  // === Search History ===
  function saveToHistory(word) {
    let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
    if (!history.includes(word)) {
      history.push(word);
      localStorage.setItem("searchHistory", JSON.stringify(history));
    }
    renderHistory();
  }

  function renderHistory() {
    let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
    historyList.innerHTML = "";
    history.forEach((word) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.textContent = word;
      btn.addEventListener("click", () => {
        input.value = word;
        form.dispatchEvent(new Event("submit"));
      });
      li.appendChild(btn);
      historyList.appendChild(li);
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    resetUI();
    const word = input.value.trim();
    if (!word) {
      showMessage("Please enter a word.", "error");
      return;
    }
    const data = await fetchWordData(word);
    displayWordData(data);
    if (data) saveToHistory(word);
  });

  audioBtn.addEventListener("click", () => {
    if (currentAudioSrc) new Audio(currentAudioSrc).play();
  });

  // Render history on page load
  renderHistory();
});
