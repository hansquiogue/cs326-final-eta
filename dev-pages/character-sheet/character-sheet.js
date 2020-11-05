window.characterSheet = {};

const docInputs = document.getElementsByTagName("input");

// console.log(docInputs);

for (const input of docInputs) {
  if (!input.classList.contains("special-save")) {
    input.addEventListener("change", genericInputSave);
    input.addEventListener("input", genericInputSave);
  }
}

function genericInputSave(e) {
  window.characterSheet[this.id] = this.value;
}

document.getElementById("export-btn").addEventListener("mouseup", (e) => {
  console.log(window.characterSheet);
});
