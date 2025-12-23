document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("searchForm");
  const input = document.getElementById("searchInput");
  const wordEl = document.getElementById("word");
  const pronunciationEl = document.getElementById("pronunciation");
  const definitionsEl = document.getElementById("definitions");
  const synonymsEl = document.getElementById("synonyms");
  const audioBtn = document.getElementById("playAudio");

  // Fetch data from dictionary API
  async function fetchWordData(word) {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Word not found");
      const data = await response.json();
      return data[0]; // First result
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  // Display data in DOM
  function displayWordData(data) {
    if (!data) {
      wordEl.textContent = "No results found.";
      pronunciationEl.textContent = "";
      definitionsEl.innerHTML = "";
      synonymsEl.innerHTML = "";
      audioBtn.style.display = "none";
      return;
    }

    // Word
    wordEl.textContent = data.word;

    // Pronunciation
    const phoneticText = data.phonetics.find((p) => p.text)?.text;
    pronunciationEl.textContent =
      phoneticText || "Pronunciation not available.";

    // Audio playback
    const audioSrc = data.phonetics.find((p) => p.audio)?.audio;
    if (audioSrc) {
      audioBtn.style.display = "inline-block";
      audioBtn.onclick = () => new Audio(audioSrc).play();
    } else {
      audioBtn.style.display = "none";
    }

    // Definitions
    definitionsEl.innerHTML = "<h3>Definitions:</h3>";
    data.meanings.forEach((meaning) => {
      meaning.definitions.forEach((def) => {
        definitionsEl.innerHTML += `
          <p><strong>${meaning.partOfSpeech}:</strong> ${def.definition} 
          ${def.example ? `<em>(${def.example})</em>` : ""}</p>`;
      });
    });

    // Synonyms
    synonymsEl.innerHTML = "<h3>Synonyms:</h3>";
    let synonymList = [];
    data.meanings.forEach((meaning) => {
      meaning.definitions.forEach((def) => {
        if (def.synonyms && def.synonyms.length > 0) {
          synonymList = synonymList.concat(def.synonyms);
        }
      });
    });
    synonymsEl.innerHTML +=
      synonymList.length > 0
        ? synonymList.join(", ")
        : "No synonyms available.";
  }

  // Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const word = input.value.trim();
    if (!word) {
      wordEl.textContent = "Please enter a word.";
      pronunciationEl.textContent = "";
      definitionsEl.innerHTML = "";
      synonymsEl.innerHTML = "";
      audioBtn.style.display = "none";
      return;
    }
    const data = await fetchWordData(word);
    displayWordData(data);
  });
});
