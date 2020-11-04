// to be replaced when developing full functionality
const exampleLayout = {
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

const cellSizes = {
  name: 4,
  cast: 1,
  range: 1,
  duration: 1,
  component: 1,
  type: 1,
  details: 3,
};

const tableHeaderTemplate = `
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
  '<span aria-hidden="true" class="table-delete">&times;</span>';

// create and populate tables
for (let level = 0; level < 10; level++) {
  // create header
  const tableHead = document.createElement("table");
  tableHead.className = "table table-sm";
  tableHead.id = "spell-table-head-" + level;
  tableHead.innerHTML = tableHeaderTemplate;
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
  for (let spell of exampleLayout[level]) {
    createSpellRow(spell, tableBody);
  }

  if (exampleLayout[level].length === 0) {
    createSpellRow(
      {
        name: "",
        cast: "",
        range: "",
        duration: "",
        component: "",
        type: "",
        details: "",
      },
      tableBody
    );
  }

  // add table to document
  document.getElementById("spell-" + level).appendChild(tableHead);
  document.getElementById("spell-" + level).appendChild(tableBodyWrapper);
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
    cellContent.classList.add("form-control");
    cellContent.value = spell[attr];

    cell.appendChild(cellContent);
  }
  // add a delete button
  const deleteButtonCell = row.insertCell(),
    deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.classList.add("close");
  deleteButton.id = spell.name + "-delete";
  deleteButton.innerHTML = deleteButtonContents;
  deleteButtonCell.appendChild(deleteButton);

  // TODO rework so inputs can be properly saved and buttons work
}
