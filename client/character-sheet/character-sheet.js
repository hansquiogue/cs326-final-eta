window.characterSheet = {};
window.characterSheet["inventory"] = [
  { name: "example", qty: "1", wgt: "1 lb" },
];
window.characterSheet["spells"] = {
  0: [
    {
      name: "Acid Splash",
      cast: "Action",
      range: "60ft",
      duration: "Instant",
      component: "V, S",
      type: "Conjuration",
      details: "Hurl a bubble of acid.",
    },
  ],
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
document.getElementById("save-btn").addEventListener("mouseup", saveSheet);
// export button
document.getElementById("export-btn").addEventListener("mouseup", exportSheet);
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

// keep track of current spell tab pane
let currentSpellTab = "0";
$('a[data-toggle="tab"]').on("shown.bs.tab", (e) => {
  currentSpellTab = e.target.id.split("-")[2];
});

// update whole sheet
updateSheetValues();

// auto-save sheet every 60s
// currently disabled
// setTimeout(periodicSaveAll, 60000);

// debug
document.getElementById("export-btn").addEventListener("mouseup", (e) => {
  console.log(window.characterSheet);
});

function templateCopy(template) {
  return Object.fromEntries(Object.keys(template).map((x) => [x, template[x]]));
}

/**
 * Save an input to the characterSheet obj by id
 * @param  {} e
 */
function genericInputSave(e) {
  window.characterSheet[this.id] = this.value;
}

function saveAllGenerics() {
  for (const input of docInputs) {
    if (!input.classList.contains("special-save")) {
      window.characterSheet[input.id] = input.value;
    }
  }
}

function periodicSaveAll() {
  saveAllGenerics();
  saveInv();
  saveAllSpells();
  saveSheet();
  setTimeout(periodicSaveAll, 60000);
}
/**
 * Update the rendered sheet from the given sheet, or window.characterSheet.
 * @param  {} sheet=null The sheet to use, if null window.characterSheet is used.
 */
function updateFromObj(sheet = null) {
  sheet === null ? (sheet = window.characterSheet) : (sheet = sheet);
  for (item in sheet) {
    if (!["inventory", "spells"].includes(item)) {
      document.getElementById(item).value = characterSheet[item];
    }
  }
}

function createInventoryTables() {
  const targetElement = document.getElementById("inventory-table");
  while (targetElement.firstChild) {
    targetElement.removeChild(targetElement.lastChild);
  }

  window.characterSheet["inventory"].forEach((x) => {
    createInventoryRow(x);
  });
}

function createInventoryRow(item) {
  const row = document.getElementById("inventory-table").insertRow(),
    nameCell = row.insertCell(),
    qtyCell = row.insertCell(),
    wgtCell = row.insertCell(),
    closeCell = row.insertCell(),
    rowNum = window.characterSheet["inventory"].length - 1,
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
function addInventoryItem(e) {
  const blank = templateCopy(invItemTemplate);
  window.characterSheet["inventory"].push(blank);
  createInventoryRow(blank);
}
/**
 * Save changes to the window.characterSheet obj.
 * @param  {} e
 */
function saveInventoryItem(e) {
  const row = this.parentElement.parentElement;
  window.characterSheet["inventory"][row.rowIndex][
    this.classList[0]
  ] = this.value;
}

function saveInv() {
  const table = document.getElementById("inventory-table");
  for (let i = 0; i < table.rows.length; i++) {
    const row = table.rows[i];
    for (let j = 0; j < row.cells.length; j++) {
      const cell = row.cells[j];
      window.characterSheet["inventory"][i][cell.classList[0]] =
        cell.children[0].id;
    }
  }
}
/**
 * Delete a row from the rendered sheet and window.characterSheet obj.
 * @param  {} e
 */
function deleteInventoryItem(e) {
  const row = this.parentElement.parentElement;
  // remove inventory item from memory obj
  window.characterSheet["inventory"].splice(row.rowIndex, 1);
  row.remove();
}

function addSpell(e) {
  window.characterSheet["spells"][currentSpellTab].push(templateCopy());
  const table = document.getElementById("spell-table-body-" + currentSpellTab);
  createSpellRow(templateCopy(spellTemplate), table);
}

function createSpellTables() {
  // create and populate tables
  for (let level = 0; level < 10; level++) {
    // delete previous spell table (if exists)
    targetElement = document.getElementById("spell-" + level);
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
    for (let spell of window.characterSheet["spells"][level]) {
      createSpellRow(spell, tableBody);
    }

    // if (exampleLayout[level].length === 0) {
    //   createSpellRow(spellTemplateCopy(), tableBody);
    // }

    // add table to document
    document.getElementById("spell-" + level).appendChild(tableHead);
    document.getElementById("spell-" + level).appendChild(tableBodyWrapper);
  }
}

function createSpellRow(spell, tableBody) {
  // add new row
  const row = tableBody.insertRow();
  // create cells for each attribute of the spell
  for (attr in spell) {
    const cell = row.insertCell();
    cell.classList.add("col-" + cellSizes[attr]);
    cellContent = document.createElement("input");
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

function saveSpell(e) {
  const row = this.parentElement.parentElement;
  window.characterSheet["spells"][currentSpellTab][row.rowIndex][
    this.classList[0]
  ] = this.value;
}

function saveAllSpells() {
  for (level - 0; level < 10; level++) {
    table = document.getElementById("spell-table-body-" + i);
    for (let i = 0; i < table.rows.length; i++) {
      const row = table.rows[i];
      for (let j = 0; j < row.cells.length; j++) {
        const cell = row.cells[j];
        window.characterSheet["spells"][level][i][cell.classList[0]] =
          cell.children[0].name;
      }
    }
  }
}

function deleteSpell() {
  const row = this.parentElement.parentElement;
  // remove inventory item from memory obj
  window.characterSheet["spells"][currentSpellTab].splice(row.rowIndex, 1);
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

async function saveSheet() {
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(window.characterSheet),
  };

  await fetch("/char-sheets-save", options);
}
async function exportSheet() {
  const options = {
    method: "GET",
  };

  saveSheet();
  const file = await fetch("/char-sheets-export");

  if (file.ok) {
    const fileParse = await file.json();
    console.log("Got file:");
    console.log(fileParse);
  }
}
async function resetSheet() {
  // TODO add a confirmation dialog and strip all data
}

function getNewImage() {}
