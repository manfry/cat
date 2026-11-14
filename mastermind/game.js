(() => {
  const COLORS = [
    { name: "Rosso", value: "#f04e55" },
    { name: "Blu", value: "#438ee8" },
    { name: "Verde", value: "#59c982" },
    { name: "Giallo", value: "#f2c94c" },
    { name: "Viola", value: "#a879e8" },
    { name: "Arancione", value: "#f29443" }
  ];
  const MAX_TURNS = 10, SIZE = 4;
  const board = document.getElementById("board");
  const palette = document.getElementById("palette");
  const currentEl = document.getElementById("current-code");
  const remainingEl = document.getElementById("remaining");
  const countEl = document.getElementById("selection-count");
  const submitBtn = document.getElementById("submit");
  const message = document.getElementById("message");
  const REDIRECT_DELAY_MS = 1000;
  let secret, current, turn, selectedColor, finished;

  function goToEnigma() {
    window.location.href = 'flexagon.html';
  }

  function newGame() {
    secret = Array.from({ length: SIZE }, () => Math.floor(Math.random() * COLORS.length));
    current = Array(SIZE).fill(null);
    turn = 0; selectedColor = 0; finished = false;
    message.className = "message";
    message.textContent = "Seleziona i 4 colori della combinazione.";
    renderPalette(); renderCurrent(); renderBoard(); updateStatus();
  }
  function renderPalette() {
    palette.innerHTML = "";
    COLORS.forEach((c, i) => {
      const b = document.createElement("button");
      b.className = "color-choice" + (i === selectedColor ? " selected" : "");
      // b.style.background = c.value; 
      b.title = c.name;
      b.setAttribute("aria-label", c.name);
      b.classList.add('button' + c.name);
      b.addEventListener("click", () => { selectedColor = i; renderPalette(); });
      palette.appendChild(b);
    });
  }
  function renderCurrent() {
    currentEl.innerHTML = "";
    current.forEach((color, i) => {
      const pin = document.createElement("button");
      pin.className = "pin" + (color !== null ? " filled" + " button" + COLORS[color].name : "");
      // pin.style.background = color === null ? "" : COLORS[color].value;
      pin.title = `Posizione ${i + 1}`;
      pin.setAttribute("aria-label", `Posizione ${i + 1}${color === null ? ", vuota" : ", " + COLORS[color].name}`);
      pin.addEventListener("click", () => {
        if (finished) return;
        current[i] = selectedColor; renderCurrent(); updateStatus();
      });
      currentEl.appendChild(pin);
    });
    countEl.textContent = `${current.filter(v => v !== null).length} / 4 selezionati`;
    submitBtn.disabled = finished || current.some(v => v === null);
  }
  function renderBoard() {
    board.innerHTML = "";
    for (let r = 0; r < MAX_TURNS; r++) {
      const row = document.createElement("div");
      row.className = "guess-row" + (r === turn && !finished ? " active" : "");
      const pins = document.createElement("div"); pins.className = "guess-pins";
      for (let p = 0; p < SIZE; p++) {
        const pin = document.createElement("span"); pin.className = "pin";
        if (r < turn) {
          const value = history[r].guess[p];
          pin.classList.add("filled"); pin.style.background = COLORS[value].value;
        }
        pins.appendChild(pin);
      }
      const feedback = document.createElement("div"); feedback.className = "feedback";
      if (r < turn) {
        const f = history[r].feedback;
        for (let i = 0; i < SIZE; i++) {
          const dot = document.createElement("i");
          if (i < f.exact) dot.className = "black";
          else if (i < f.exact + f.misplaced) dot.className = "white";
          feedback.appendChild(dot);
        }
      } else {
        for (let i = 0; i < SIZE; i++) { const dot = document.createElement("i"); feedback.appendChild(dot); }
      }
      row.append(pins, feedback); board.appendChild(row);
    }
  }
  let history = [];
  function score(guess) {
    let exact = 0, secretRest = [], guessRest = [];
    guess.forEach((v, i) => {
      if (v === secret[i]) exact++;
      else { secretRest.push(secret[i]); guessRest.push(v); }
    });
    let misplaced = 0;
    guessRest.forEach(v => {
      const index = secretRest.indexOf(v);
      if (index !== -1) { misplaced++; secretRest.splice(index, 1); }
    });
    return { exact, misplaced };
  }
  function updateStatus() {
    remainingEl.textContent = MAX_TURNS - turn;
    submitBtn.disabled = finished || current.some(v => v === null);
  }
  submitBtn.addEventListener("click", () => {
    let won = false;
    if (finished || current.some(v => v === null)) return;
    const guess = [...current], feedback = score(guess);
    history.push({ guess, feedback }); turn++;
    if (feedback.exact === SIZE) {
      won = true;
      finished = true; message.className = "message success";
      message.textContent = `Complimenti! Hai trovato il codice in ${turn} ${turn === 1 ? "tentativo" : "tentativi"}.`;
    } else if (turn >= MAX_TURNS) {
      finished = true; message.className = "message error";
      message.textContent = `Tentativi esauriti. Il codice era: ${secret.map(v => COLORS[v].name).join(" · ")}.`;
    } else {
      message.className = "message";
      // message.textContent = `${feedback.exact} posizione/i corretta/e · ${feedback.misplaced} colore/i corretto/i in posizione diversa.`;
      message.textContent = feedback.exact === 1 ? `${feedback.exact} posizione corretta · ` : `${feedback.exact} posizioni corrette · `;
      message.textContent += feedback.misplaced === 1 ? `${feedback.misplaced} colore corretto in posizione diversa.` : `${feedback.misplaced} colori corretti in posizione diversa.`;
    }
    current = Array(SIZE).fill(null);
    renderCurrent(); renderBoard(); updateStatus();
    if (won === true) {
      window.setTimeout(goToEnigma, REDIRECT_DELAY_MS);
    }
  });
  document.getElementById("clear").addEventListener("click", () => {
    if (finished) return;
    current = Array(SIZE).fill(null); renderCurrent();
  });
  document.getElementById("new-game").addEventListener("click", () => { history = []; newGame(); });
  history = [];
  newGame();
})();