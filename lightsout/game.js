(() => {
  const SIZE = 3;
  const REDIRECT_DELAY_MS = 1000;
  const boardEl = document.getElementById('board');
  const movesEl = document.getElementById('moves');
  const lightsEl = document.getElementById('lights');
  const bestEl = document.getElementById('best');
  const progressEl = document.getElementById('progress');
  const feedbackEl = document.getElementById('feedback');
  const restartBtn = document.getElementById('restartBtn');
  const newGameBtn = document.getElementById('newGameBtn');
  // const levelLabel = document.getElementById('levelLabel');
  const hintEl = document.getElementById('hint');

  let board = [];
  let initialBoard = [];
  let moves = 0;
  let locked = false;
  let best = Number(localStorage.getItem('lightsOutBest') || 0);
  let enigmaVisible = false;

  bestEl.textContent = best ? best : '—';

  function emptyBoard() {
    return Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
  }

  function toggleAt(grid, row, col) {
    if (row >= 0 && row < SIZE && col >= 0 && col < SIZE) {
      grid[row][col] = !grid[row][col];
    }
  }

  // Genera una configurazione sempre risolvibile partendo dalla griglia spenta
  // e applicando una serie casuale di mosse valide.
  function createPuzzle() {
    const grid = emptyBoard();
    const scrambleMoves = 9 + Math.floor(Math.random() * 9);
    for (let i = 0; i < scrambleMoves; i++) {
      const r = Math.floor(Math.random() * SIZE);
      const c = Math.floor(Math.random() * SIZE);
      toggleAt(grid, r, c);
      toggleAt(grid, r - 1, c);
      toggleAt(grid, r + 1, c);
      toggleAt(grid, r, c - 1);
      toggleAt(grid, r, c + 1);
    }
    // Evita una partita già risolta.
    if (grid.every(row => row.every(value => !value))) {
      toggleAt(grid, 2, 2);
      toggleAt(grid, 1, 2);
      toggleAt(grid, 3, 2);
      toggleAt(grid, 2, 1);
      toggleAt(grid, 2, 3);
    }
    return grid;
  }

  function countLights() {
    return board.flat().filter(Boolean).length;
  }

  function setFeedback(message, type = '') {
    feedbackEl.textContent = message;
    feedbackEl.className = `feedback ${type}`.trim();
  }

  function render() {
    boardEl.innerHTML = '';
    board.forEach((row, r) => row.forEach((isOn, c) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `cell${isOn ? ' on' : ' off'}`;
      button.setAttribute('aria-label', `Riga ${r + 1}, colonna ${c + 1}: ${isOn ? 'accesa' : 'spenta'}`);
      button.setAttribute('aria-pressed', String(isOn));
      button.disabled = locked;
      const img = document.createElement('img');
      if (isOn) {

        img.src = 'empty.png';
      } else {

        img.src = 'logo.png';
      }
      img.alt = '';
      img.draggable = false;
      button.appendChild(img);
      button.addEventListener('click', () => playMove(r, c));
      boardEl.appendChild(button);
    }));

    const remaining = countLights();
    movesEl.textContent = moves;
    lightsEl.textContent = remaining;
    progressEl.style.width = `${(remaining / (SIZE * SIZE)) * 100}%`;
  }

  function playMove(r, c) {
    if (locked) return;
    toggleAt(board, r, c);
    toggleAt(board, r - 1, c);
    toggleAt(board, r + 1, c);
    toggleAt(board, r, c - 1);
    toggleAt(board, r, c + 1);
    moves++;
    render();

    if (countLights() === 0) {
      finishGame();
    } else {
      setFeedback('Bene! Continua: mostra tutti i teschi.');
      if ( enigmaVisible == false && moves >= 50 ){
        showGiveUp();
      }
    }
  }

  function showGiveUp(){
    restartBtn.removeEventListener('click', restart);
    restartBtn.textContent = "Mi arrendo!";
    restartBtn.classList.add('giveup');
    restartBtn.addEventListener('click', giveUp);
  }

  function giveUp(){
    showEnigmaLink();
    setFeedback("Ti sei arreso. Il link all'enigma è in fondo alla pagina");
    showRestart();
  }

  function showRestart(){
    restartBtn.removeEventListener('click', giveUp);
    restartBtn.textContent = "Ricomincia";
    restartBtn.classList.remove('giveup');
    restartBtn.addEventListener('click', restart); 
  }
  function finishGame() {
    locked = true;
    if (!best || moves < best) {
      best = moves;
      localStorage.setItem('lightsOutBest', String(best));
      bestEl.textContent = best;
    }
    render();
    setFeedback(`🎉 Complimenti! Hai vinto!`, 'correct');
    boardEl.classList.add('won');
    window.setTimeout(goToEnigma, REDIRECT_DELAY_MS);
  }

  function goToEnigma(){
    window.location.href = 'hai_vinto.html';
  }

  function startGame() {
    locked = false;
    moves = 0;
    board = createPuzzle();
    initialBoard = board.map(row => [...row]);
    boardEl.classList.remove('won');
    // levelLabel.textContent = 'LIVELLO 1';
    setFeedback('Mostra tutti i teschi');
    showRestart();
    hideEnigmaLink();
    if (best > 0) {
     showEnigmaLink();
    }
    render();
  }

  function showEnigmaLink(){
      enigmaVisible = true;
      hintEl.innerHTML = '';
      const a = document.createElement('a');
      a.href = 'hai_vinto.html';
      a.textContent = "Accedi all'enigma";
      hintEl.appendChild(a);
  }
  function hideEnigmaLink(){
    enigmaVisible = false;
    hintEl.innerHTML = '';
  }

  restartBtn.addEventListener('click', restart);

  function restart(){
    if (locked) return;
    board = initialBoard.map(row => [...row]);
    moves = 0;
    setFeedback('Partita ripristinata. Riprova!');
    render();
  }

  newGameBtn.addEventListener('click', startGame);
  startGame();
})();
