// Load the WASM module and instantiate it
import init, { script_swap } from "./pkg/transliterate_ferris_wasm.js";

document.addEventListener('DOMContentLoaded', () => {
  init().then(() => {
    // Attach an event listener to the "Transliterate" button
    document.getElementById('transliterate').addEventListener('click', () => {
      const selectedScript = document.getElementById("t1-select").value;
      // Check if the "Indic" radio button is selected
      if (document.getElementById("indicRadio").checked) {
        const crosswordDivs = document.querySelectorAll('[id^="crossword_"]');
        const indic = ["devanagari", "telugu", "kannada"];
        const roman = ["itrans", "iast", "slp1", "hk"];
        let conversion;

        if (indic.includes(selectedScript)) {
          conversion = 3;
        } else if (roman.includes(selectedScript)) {
          conversion = 2;
        }

        crosswordDivs.forEach((div) => {
          if (div) {
            console.log("Crossword Table:", div);
            const crosswordTable = div;
            const cells = crosswordTable.querySelectorAll("td[contenteditable]");
            cells.forEach((cell) => {
              // Get the input data from the cell
              const inputData = cell.innerText;
              console.log("Input Data:", inputData);

              // Perform transliteration using the transliterateCell function
              const transliterated = script_swap(inputData, 'slp1', selectedScript, conversion);
              console.log("Transliterated Data:", transliterated);

              // Update the cell content with the transliterated value
              cell.innerText = transliterated;
            });
          } else {
            console.error("Table not found inside the crossword div.");
          }
        });
      }
    });
  });
});


document.addEventListener('DOMContentLoaded', () => {
  init().then(() => {

    // function transliterateOnInput() {
    document.getElementById('submitBtn').addEventListener('click', async function() {
      const indic = ["devanagari", "telugu", "kannada"];
      const roman = ["itrans", "iast", "slp1", "hk"];
      const inputData = document.getElementById('words').value;
      const t1_select = document.getElementById("t1-select").value;

      if (document.getElementById("indicRadio").checked) {
        // Perform transliteration only if "Indic" is selected
        let conversion;

        if (indic.includes(t1_select)) {
          conversion = 1;
        } else if (roman.includes(t1_select)) {
          conversion = 2;
        }

        // Use the 'script_swap' function to perform the transliteration
        const transliterated = script_swap(inputData, t1_select, 'slp1', conversion);
        console.log(transliterated);

        document.getElementById('words').value = transliterated;
      }
    });

  });
});
