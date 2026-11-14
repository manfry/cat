const form = document.getElementById("answerForm");
const input = document.getElementById("answer");
const feedback = document.getElementById("feedback");


// function c(testo) {
//     return btoa(encodeURI(testo.trim().toLocaleLowerCase("it-IT").normalize("NFD").replace(/\p{Diacritic}/gu, "")));
// }


// function d(testo) {
//     return decodeURIComponent(atob(testo));
// }

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const parolaInserita = input.value.trim().toLocaleLowerCase("it-IT").normalize("NFD").replace(/\p{Diacritic}/gu, "");

  if (!parolaInserita) {
    mostraMessaggio("Inserisci una parola.", "error");
    input.focus();
    return;
  }

  const risposta = RISPOSTE_CORRETTE.find(
    (elemento) => elemento.parola === parolaInserita
  );

  if (risposta) {
    mostraMessaggio("Parola corretta! Ti accompagno alla prossima tappa…", "correct");
    // Il piccolo ritardo permette di visualizzare il messaggio prima del cambio pagina.
    window.setTimeout(() => {
      window.location.href = risposta.link;
    }, 350);
  } else {
    mostraMessaggio("La parola è sbagliata", "error");
    input.select();
  }
});

function mostraMessaggio(testo, tipo) {
  feedback.textContent = testo;
  feedback.className = `feedback ${tipo}`;
}
