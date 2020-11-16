// User retrieved from url parameter
const user = window.location.pathname.split('/')[3];

window.addEventListener("load", async function () {
    // Welcome message to logged in user
    document.getElementById("welcome").innerText = "Welcome " + user + "!";

    // Functionality when create a character button is clicked in modal
    document.getElementById('create-char').addEventListener('click', async function () {
        // Current character selected
        const charName = document.getElementById("new-char-name").value;
        // New query based on character name
        const query = '?char-name=' + charName;
        // Submitting get request with new character name
        const response = await fetch('/character/create' + query);

        // Response was okay
        if (response.ok) {
            // New character is generated in gallery
            createNewCharInGallery(charName);

            // Modal is hiden
            document.getElementById('create-modal').click();
        
        // Bad response
        } else {
            alert('Character cannot be created at this time');
        }
    });

    // Whenever delete button is clicked
    // TODO: Confirmation message
    document
      .getElementById("delete")
      .addEventListener("click", async function () {
        const char = getSelectedCharacter().value;
        const data = { user: user, char: char };

        const delete_resp = await fetch(
          "/manage-sheets-delete",
          {
            method: "post",
            body: JSON.stringify(data),
          }
        );

        if (delete_resp.ok) {
          const body = await delete_resp.json();
          alert("Chacter deleted request recieved" + JSON.stringify(body));

          deleteCharInGallery();

          document.getElementById("curr-selected-text").innerText =
            "None";
        }
      });

    // Whenever play button is clicked
    document
      .getElementById("play-btn")
      .addEventListener("click", async function () {
        // Gets selected character and converts spaces to dashes and lowercases it
        const char = getSelectedCharacter().value.replace(/\s+/g, '-').toLowerCase();
        const data = { user:"user", char: char };
        
        window.location.href = "/gallery/user/" + user + "/character/" + char;

        // await fetch("/" + "user" + "/gallery/" + char,
        //   {
        //     method: "post",
        //     body: JSON.stringify(data),
        //   }
        // );
    });
  
});

// Whenever log out is clicked
document
.getElementById("logout")
.addEventListener("click", async function () {
  const logout_resp = await fetch(
    "/logout-attempt",
    {
      method: "post",
      body: JSON.stringify({ user: user }),
    }
  );

  if (logout_resp.ok) {
    const body = await logout_resp.json();
    alert("User logged out request recieved" + JSON.stringify(body));
    window.location.href = "/";
  }
});

function createNewCharInGallery(name) {
    // Parent
    const parent = document.getElementById("char-gallery");

    // New div for row created underneath
    const newRow = document.createElement("div");
    newRow.className = "row mt-2";
    parent.appendChild(newRow);

    // New div for col created underneath
    const newCol = document.createElement("div");
    // Adding attributes to newCol
    newCol.setAttribute("class", "col mx-3 btn-group btn-group-toggle");
    newCol.setAttribute("data-toggle", "buttons");
    newRow.appendChild(newCol);

    // New label for button design created underneath
    const newLabel = document.createElement("label");
    newLabel.className = "btn btn-secondary";
    newLabel.innerText = name;
    newCol.appendChild(newLabel);

    // New input underneath
    const newInput = document.createElement("input");
    const numChar = document.getElementsByClassName("radio-char").length + 1;
    // Adding new attributes
    newInput.setAttribute("class", "radio-char");
    newInput.setAttribute("type", "radio");
    newInput.setAttribute("name", "charselect");
    newInput.setAttribute("autocomplete", "off");
    newInput.setAttribute("id", "char" + numChar.toString());
    newInput.setAttribute("value", name);
    newLabel.appendChild(newInput);
}

function getSelectedCharacter() {
    let char_list = document.getElementsByName("charselect");
    char_list = Array.from(char_list);
    return char_list.filter((char) => char.checked)[0];
}

// TODO: Update character selected
function deleteCharInGallery() {
  const id = getSelectedCharacter().id;
  document.getElementById(id).parentElement.parentElement.parentElement.remove();
}

// Updates current selected character text whenever new selection is made
window.addEventListener('change', () => {
  const curr_char = getSelectedCharacter().value;
  document.getElementById("curr-selected-text").innerText = curr_char;
});

/**
 * Gets character sheet template and returns it. If an 
 * error occurs, undefined is returned. 
 */
async function getCharSheetTemplate() {
  const response = await fetch('../character-sheet-template.json');
  if (response.ok) {
      const body = await response.json();
      return body;
  } else {
      return undefined;
  }
}