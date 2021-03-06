'use strict';

const invItemTemplate = {
  name: "",
  qty: "",
  wgt: "",
};

const spellTemplate = {
  name: "",
  cast: "",
  range: "",
  duration: "",
  component: "",
  type: "",
  details: "",
};

const cellSizes = {
  name: 4,
  cast: 1,
  range: 1,
  duration: 1,
  component: 1,
  type: 1,
  details: 3,
};

const spellTableHeaderTemplate = `
<thead>
  <tr>
    <th class="col-4">Name</th>
    <th class="col-1">Cast</th>
    <th class="col-1">Range</th>
    <th class="col-1">Duration</th>
    <th class="col-1">Component</th>
    <th class="col-1">Type</th>
    <th>Details</th>
  </tr>
</thead>
`;

const deleteButtonContents =
  '<span aria-hidden="true" class="table-delete button-symbol">&times;</span>';

// add event listeners to get inputs and save to memory obj
const docInputs = document.getElementsByTagName("input");
for (const input of docInputs) {
  if (!input.classList.contains("special-save")) {
    input.addEventListener("change", genericInputSave);
    input.addEventListener("input", genericInputSave);
  }
}

// save button
document.getElementById("save-btn").addEventListener("mouseup", async function() {
  // Alerts user if there sheet was saved or not
  saveSheet() ? alert("Sheet saved successfully!") : alert("Sheet was unable to be saved");
});
// export button
document.getElementById("export-btn").addEventListener("click", saveSheet);
document.getElementById("reset-btn").addEventListener("mouseup", resetSheet);

// inventory add button
document
  .getElementById("inv-add-btn")
  .addEventListener("mouseup", addInventoryItem);
// inventory save-on-close
document.getElementById("inv-modal-close").addEventListener("mouseup", saveInv);

// spell add button
document.getElementById("spell-add-btn").addEventListener("mouseup", addSpell);
// spells save-on-close
document
  .getElementById("spell-modal-close")
  .addEventListener("mouseup", saveAllSpells);

// dice roller
document.getElementById("dice-notation").addEventListener("input", checkDice);
document.getElementById("rollBtn").addEventListener("mouseup", rollDice);

// Slider maximum
document.getElementById("exp-points").addEventListener("input", setSliderMax);

// slider updates
document.getElementById("exp-range").addEventListener("input", setSliderLabel);

// name readonly
document.getElementById("char-name").readOnly = true;

// auto-save sheet every 60s
// currently disabled
setTimeout(periodicSaveAll, 60000);

function templateCopy(template) {
  return Object.fromEntries(Object.keys(template).map((x) => [x, template[x]]));
}

/**
 * Save an input to the characterSheet obj by id
 */
function genericInputSave() {
  if (this.id === "char-name") {
    window.characterSheet.charName = this.value;
  } else {
    window.characterSheet.charAttributes[this.id] = this.value;
  }
}

/**
 * Saves generic entries
 */
function saveAllGenerics() {
  for (const input of docInputs) {
    if (!input.classList.contains("special-save")) {
      window.characterSheet.charName[input.id] = input.value;
    }
  }
}

/** 
 * Saves entire sheet
*/
function periodicSaveAll() {
  saveAllGenerics();
  saveInv();
  saveAllSpells();
  saveSheet();
  setTimeout(periodicSaveAll, 60000);
}

/**
 * Update the rendered sheet from window.characterSheet.
 */
function updateFromObj() {
  const sheet = window.characterSheet.charAttributes;
  document.getElementById("char-name").value = window.characterSheet.charName;
  for (const item in sheet) {
    if (!["inventory", "spells"].includes(item)) {
      document.getElementById(item).value =
        window.characterSheet.charAttributes[item];
    }
  }

  // fix slider
  setSliderMax();
  document.getElementById("exp-range").value = sheet["exp-range"];
  setSliderLabel();

  // set user image
  if (
    !(
      window.characterSheet.charImage === "" ||
      window.characterSheet.charImage === undefined
    )
  ) {
    document.getElementById("user-img-actual").src =
      window.characterSheet.charImage;
  }
}

function createInventoryTables() {
  const targetElement = document.getElementById("inventory-table");
  while (targetElement.firstChild) {
    targetElement.removeChild(targetElement.lastChild);
  }

  window.characterSheet.charAttributes["inventory"].forEach((x) => {
    createInventoryRow(x);
  });
}

function createInventoryRow(item) {
  const row = document.getElementById("inventory-table").insertRow(),
    nameCell = row.insertCell(),
    qtyCell = row.insertCell(),
    wgtCell = row.insertCell(),
    closeCell = row.insertCell(),
    nameInput = document.createElement("input"),
    qtyInput = document.createElement("input"),
    wgtInput = document.createElement("input"),
    closeBtn = document.createElement("button");

  if (item !== null) {
    nameInput.value = item.name;
    qtyInput.value = item.qty;
    wgtInput.value = item.wgt;
  }

  nameInput.className = "name form-control special-save";
  nameInput.type = "text";
  nameInput.addEventListener("input", saveInventoryItem);

  qtyInput.className = "qty form-control special-save";
  qtyInput.type = "text";
  qtyInput.addEventListener("input", saveInventoryItem);

  wgtInput.className = "wgt form-control special-save";
  wgtInput.type = "text";
  wgtInput.addEventListener("input", saveInventoryItem);

  closeBtn.type = "button";
  closeBtn.className = "close";
  closeBtn.innerHTML = deleteButtonContents;
  closeBtn.addEventListener("mouseup", deleteInventoryItem);

  nameCell.appendChild(nameInput);
  qtyCell.appendChild(qtyInput);
  wgtCell.appendChild(wgtInput);
  closeCell.appendChild(closeBtn);

  nameCell.classList.add("col-9");
}
/**
 * Add a row to the inventory list.
 */
function addInventoryItem() {
  const blank = templateCopy(invItemTemplate);
  window.characterSheet.charAttributes["inventory"].push(blank);
  createInventoryRow(blank);
}
/**
 * Save changes to the window.characterSheet obj.
 */
function saveInventoryItem() {
  const row = this.parentElement.parentElement;
  window.characterSheet.charAttributes["inventory"][row.rowIndex][
    this.classList[0]
  ] = this.value;
}

function saveInv() {
  const table = document.getElementById("inventory-table");
  for (let i = 0; i < table.rows.length; i++) {
    const row = table.rows[i];
    for (let j = 0; j < row.cells.length; j++) {
      const cell = row.cells[j];
      window.characterSheet.charAttributes["inventory"][i][cell.classList[0]] =
        cell.children[0].id;
    }
  }
}
/**
 * Delete a row from the rendered sheet and window.characterSheet obj.
 */
function deleteInventoryItem() {
  const row = this.parentElement.parentElement;
  // remove inventory item from memory obj
  window.characterSheet.charAttributes["inventory"].splice(row.rowIndex, 1);
  row.remove();
}

function getActiveSpellTab() {
  // Overcomplicated function because we're not allowed jquery
  for (const child of document.getElementById("nav-tabContent").children) {
    if (child.classList.contains("active")) {
      return child.id.split("-")[1];
    }
  }
  return -1;
}

function addSpell() {
  window.characterSheet.charAttributes["spells"][getActiveSpellTab()].push(
    templateCopy(spellTemplate)
  );
  const table = document.getElementById(
    "spell-table-body-" + getActiveSpellTab()
  );
  createSpellRow(templateCopy(spellTemplate), table);
}

function createSpellTables() {
  // create and populate tables
  for (let level = 0; level < 10; level++) {
    // delete previous spell table (if exists)
    const targetElement = document.getElementById("spell-" + level);
    while (targetElement.firstChild) {
      targetElement.removeChild(targetElement.lastChild);
    }
    // create header
    const tableHead = document.createElement("table");
    tableHead.className = "table table-sm";
    tableHead.id = "spell-table-head-" + level;
    tableHead.innerHTML = spellTableHeaderTemplate;
    // create easily-addressable body
    const tableBodyWrapper = document.createElement("div"),
      tableBody = document.createElement("table");
    // scrollable wrapper
    tableBodyWrapper.classList.add("scroll-table");
    // bootstrap table
    tableBody.className = "table table-sm table-borderless";
    tableBody.id = "spell-table-body-" + level;
    tableBodyWrapper.appendChild(tableBody);

    // Populate the table with saved spells
    for (const spell of window.characterSheet.charAttributes["spells"][level]) {
      createSpellRow(spell, tableBody);
    }

    // add table to document
    document.getElementById("spell-" + level).appendChild(tableHead);
    document.getElementById("spell-" + level).appendChild(tableBodyWrapper);
  }
}

function createSpellRow(spell, tableBody) {
  // add new row
  const row = tableBody.insertRow();
  // create cells for each attribute of the spell
  for (const attr in spell) {
    const cell = row.insertCell();
    cell.classList.add("col-" + cellSizes[attr]);
    const cellContent = document.createElement("input");
    cellContent.type = "text";
    cellContent.name = attr;
    cellContent.id = spell.name + "-" + attr;
    cellContent.classList.add(attr);
    cellContent.classList.add("form-control");
    cellContent.classList.add("special-save");
    cellContent.value = spell[attr];

    cellContent.addEventListener("input", saveSpell);

    cell.appendChild(cellContent);
  }
  // add a delete button
  const deleteButtonCell = row.insertCell(),
    deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.classList.add("close");
  deleteButton.id = spell.name + "-delete";
  deleteButton.innerHTML = deleteButtonContents;
  deleteButton.addEventListener("mouseup", deleteSpell);
  deleteButtonCell.appendChild(deleteButton);
}

function saveSpell() {
  const row = this.parentElement.parentElement;
  window.characterSheet.charAttributes["spells"][getActiveSpellTab()][
    row.rowIndex
  ][this.classList[0]] = this.value;
}

function saveAllSpells() {
  for (let level = 0; level < 10; level++) {
    const table = document.getElementById("spell-table-body-" + level);
    for (let i = 0; i < table.rows.length; i++) {
      const row = table.rows[i];
      for (let j = 0; j < row.cells.length; j++) {
        const cell = row.cells[j];
        window.characterSheet.charAttributes["spells"][level][i][
          cell.classList[0]
        ] = cell.children[0].name;
      }
    }
  }
}

function deleteSpell() {
  const row = this.parentElement.parentElement;
  // remove inventory item from memory obj
  window.characterSheet.charAttributes["spells"][getActiveSpellTab()].splice(
    row.rowIndex,
    1
  );
  row.remove();
}

/**
 * Update all visual values on sheet from window.characterSheet.
 * This includes inventory and spells.
 */
function updateSheetValues() {
  updateFromObj();
  createSpellTables();
  createInventoryTables();
}

/**
 * Saves the save and sends a request to the server based
 * on the contents that are inputted at the time
 * @returns {boolean} Returns true if sheet can be saved
 */
async function saveSheet() {
  const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(window.characterSheet),
    },
    pageURL = new URL(window.location.href),
    user = pageURL.pathname.split("/")[3],
    char = pageURL.pathname.split("/")[5];

  const response = await fetch(
    "/char-sheet-save/user/" + user + "/character/" + char,
    options
  );
  
  // Returns true if sheet can be saved or false otherwise
  const sheetStatus = response.ok ? true : false;
  return sheetStatus;
}

async function resetSheet() {
  // check that user didn't click accidentally
  if (
    window.confirm(
      "Are you sure? This will delete your character sheet forever."
    )
  ) {
    // clear checkboxes
    const inputs = document.getElementsById("input");
    for (const input of inputs) {
      if (input.type.toLowerCase() === "checkbox") {
        input.checked = false;
      }
    }
    // clear basic inputs
    for (const input of docInputs) {
      if (!input.classList.contains("special-save")) {
        input.value = ""; // on-page
        window.characterSheet.charAttributes[input.id] = ""; // in-memory
      }
    }
    // clear spells
    for (let level = 0; level < 10; level++) {
      // delete previous spell table (if exists)
      const targetElement = document.getElementById(
        "spell-table-body-" + level
      );
      while (targetElement.firstChild) {
        targetElement.removeChild(targetElement.lastChild);
      }
    }
    // clear inventory
    const targetElement = document.getElementById("inventory-table");
    while (targetElement.firstChild) {
      targetElement.removeChild(targetElement.lastChild);
    }
    // clear in-memory spells & inventory
    window.characterSheet.charAttributes["inventory"] = [];
    window.characterSheet.charAttributes["spells"] = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: [],
    };

    saveSheet();
  }
}

function diceError() {
  const input = document.getElementById("dice-notation");
  if (!input.classList.contains("is-invalid")) {
    input.classList.add("is-invalid");
    input.classList.add("text-danger");
  }
}

function diceNoError() {
  const input = document.getElementById("dice-notation");
  if (input.classList.contains("is-invalid")) {
    input.classList.remove("is-invalid");
    input.classList.remove("text-danger");
  }
}

function checkDice() {
  try {
    window.Dice.parse(document.getElementById("dice-notation").value);
    diceNoError();
  } catch {
    if (document.getElementById("dice-notation").value === "") {
      diceNoError();
    } else {
      diceError();
    }
  }
}

function rollDice() {
  try {
    const roll = window.Dice.detailed(
      document.getElementById("dice-notation").value
    );
    let result = "" + roll.result + " (" + roll.rolls.join(" + ") + ")";
    result += roll.modifier ? " + " + roll.modifier : "";
    document.getElementById("roll-result").value = result;
    diceNoError();
  } catch (error) {
    diceError();
    return;
  }
}

function setSliderMax() {
  // Exp to next level
  const exp = document.getElementById("exp-points").value;
  // There is an input for exp to next level
  if (exp !== "") {
    const range = document.getElementById("exp-range");
    range.setAttribute("max", exp);
  }
}

function setSliderLabel() {
  const range = document.getElementById("exp-range");
  document.getElementById("exp-range-label").textContent =
    "Experience Points: " + range.value;
}

// Whenever log out is clicked
document.getElementById("logout").addEventListener("click", async function () {
  window.location.href = "/logout";
});

// Whenever character gallery button is clicked
document.getElementById("gallery").addEventListener("click", async function () {
  const pageURL = new URL(window.location.href),
    user = pageURL.pathname.split("/")[3];

  // Redirects with GET request query to a character selection gallery
  window.location.href = "/gallery/user/" + user;
});

// When page loads
window.addEventListener("load", async () => {
  const pageURL = new URL(window.location.href);

  const exportElem = document.getElementById("export-btn");
  const user = pageURL.pathname.split("/")[3];
  const char = pageURL.pathname.split("/")[5];

  exportElem.href = "/char-sheet-export/user/" + user + "/character/" + char;
  exportElem.download = char + "_sheets.json";

  // request using same get to be sent here, with flag to request json
  // instead of webpage
  const response = await fetch(pageURL.pathname + "?getSheet=true");

  if (response.ok) {
    const body = await response.json();
    window.characterSheet = body;

    if (window.characterSheet.charAttributes === undefined) {
      window.characterSheet.charAttributes = {};
      window.characterSheet.charAttributes.inventory = [];
      window.characterSheet.charAttributes.spells = {
        0: [],
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: [],
        7: [],
        8: [],
        9: [],
      };
      saveSheet();
    }

    updateSheetValues();
  } else {
    alert("ERROR: Character not found.");
    window.location.href = "/gallery/user/" + pageURL.pathname.split("/")[3];
  }
});

document
  .getElementById("img-link-btn")
  .addEventListener("mouseup", async () => {
    const imgURL = document.getElementById("char-link").value;
    try {
      new URL(imgURL);
      const img = new Image();
      img.onload = () => {
        clearTimeout(timer);
        document.getElementById("user-img-actual").src = imgURL;
        window.characterSheet.charImage = imgURL;
        saveSheet();
      };
      img.onerrer = img.onabort = () => {
        clearTimeout(timer);
        alert("URL failed to load image.");
      };
      const timer = setTimeout(() => {
        img.src = imgURL;
        alert("URL failed to load image.");
      }, 5000);
      img.src = imgURL;
    } catch (e) {
      console.log(e.stack);
    }
  });
