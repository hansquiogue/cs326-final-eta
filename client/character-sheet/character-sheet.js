window.characterSheet = {
  user: "",
  charName: "",
  charImage: "",
  charAttributes: {},
};
window.characterSheet.charAttributes["inventory"] = [
  { name: "example", qty: "1", wgt: "1 lb" },
];
window.characterSheet.charAttributes["spells"] = {
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

// dice roller
document.getElementById("dice-notation").addEventListener("input", checkDice);
document.getElementById("rollBtn").addEventListener("mouseup", rollDice);

// update whole sheet
// updateSheetValues();

// auto-save sheet every 60s
// currently disabled
// setTimeout(periodicSaveAll, 60000);

// debug
document.getElementById("export-btn").addEventListener("mouseup", () => {
  console.log(window.characterSheet);
});

function templateCopy(template) {
  return Object.fromEntries(Object.keys(template).map((x) => [x, template[x]]));
}

/**
 * Save an input to the characterSheet obj by id
 * @param  {} e
 */
function genericInputSave() {
  if (["char-name"].contains(this.id)) {
    window.characterSheet.charName = this.value;
  } else {
    window.characterSheet.charAttributes[this.id] = this.value;
  }
}

// function saveAllGenerics() {
//   for (const input of docInputs) {
//     if (!input.classList.contains("special-save")) {
//       window.characterSheet[input.id] = input.value;
//     }
//   }
// }

// function periodicSaveAll() {
//   saveAllGenerics();
//   saveInv();
//   saveAllSpells();
//   saveSheet();
//   setTimeout(periodicSaveAll, 60000);
// }
/**
 * Update the rendered sheet from the given sheet, or window.characterSheet.
 * @param  {} sheet=null The sheet to use, if null window.characterSheet is used.
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
    // rowNum = window.characterSheet["inventory"].length - 1,
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
 * @param  {} e
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
 * @param  {} e
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

async function saveSheet() {
  const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(window.characterSheet),
    },
    pageURL = new URL(window.location.href),
    user = pageURL.pathname[3],
    char = pageURL.pathname[5];

  const response = await fetch(
    "/char-sheets-save/user/" + user + "/character/" + char,
    options
  );

  if (response.ok) {
    const body = await response.text();
    alert("Sheet accepted" + JSON.stringify(body));
  }
}

async function exportSheet() {
  const options = {
      method: "GET",
    },
    pageURL = new URL(window.location.href),
    user = pageURL.pathname[3],
    char = pageURL.pathname[5];

  saveSheet();
  const file = await fetch(
    "/char-sheets-export/user/" + user + "/character/" + char,
    options
  );

  if (file.ok) {
    const fileParse = await file.json();
    alert("Exported file (placeholder)" + JSON.stringify(fileParse));
    // console.log("Got file:");
    // console.log(fileParse);
  }
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
    // console.log(error);
    diceError();
    return;
  }
}

// function getNewImage() {
//   null;
//   // waiting for database to implement this because it's too database-dependent
// }

// Whenever log out is clicked
document.getElementById("logout").addEventListener("click", async function () {
  // const pageURL = new URL(window.location.href),
  //   user = pageURL.pathname[3];

  window.location.href = "/logout";
});

// Whenever character gallery button is clicked
document.getElementById("gallery").addEventListener("click", async function () {
  const pageURL = new URL(window.location.href),
    user = pageURL.pathname[3];
  // char = pageURL.pathname[5];

  // Redirects with GET request query to a character selection gallery
  window.location.href = "/gallery/user/" + user;
  // "../login/selector.html?user=" + user + "&token=" + token;
});

// Slider
document.getElementById("exp-points").addEventListener("input", () => {
  // Exp to next level
  const exp = document.getElementById("exp-points").value;
  // There is an input for exp to next level
  if (exp !== "") {
    const range = document.getElementById("exp-range");
    range.setAttribute("max", exp);
  }
});

// When page loads
window.addEventListener("load", async () => {
  // // Parameters from url
  // const url_params = new URLSearchParams(window.location.search);

  const pageURL = new URL(window.location.href);

  // console.log(pageURL.pathname);

  // request using same get to be sent here, with flag to request json
  // instead of webpage
  const response = await fetch(pageURL.pathname + "?getSheet=true");

  if (response.ok) {
    const body = await response.json();
    // console.log(body);
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
    }

    updateSheetValues();
  } else {
    // console.log("not found");
    alert("ERROR: Character not found.");
    window.location.href = "/gallery/user/" + pageURL.pathname[3];
  }
});
