// Parameters from url
const url_params = new URLSearchParams(window.location.search);
// User retrieved from url parameter
const user = url_params.get("user");

window.addEventListener("load", async function () {
    // Welcome message to logged in user
    document.getElementById("welcome").innerText = "Welcome " + user + "!";

    // Functionality when create a character button is clicked in modal
    document.getElementById('create-char').addEventListener('click', async function () {
      const name = document.getElementById("new-char-name").value;
      
      const data = { user: user, char: name };
      // New request for character
      const add_resp = await fetch(
        "/manage-sheets-add",
        {
          method: "post",
          body: JSON.stringify(data),
        }
      );

      if (add_resp.ok) {
        const body = await add_resp.json();
        alert("New character recieved" + JSON.stringify(body));

        // New character is generated in gallery
        createNewCharInGallery(name);

        // Modal is hiden
        document.getElementById('create-modal').click();
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
            "Current Character Selected: None";
        }
      });

    // Whenever play button is clicked
    document
      .getElementById("play-btn")
      .addEventListener("click", async function () {
        const char = getSelectedCharacter().value;
        const data = { user:"user", char: char };
        
        window.location.href = "/gallery/user/USERNAME-TODO/character/" + char;

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
  document
    .getElementById(id)
    .parentElement.parentElement.parentElement.remove();
}

// Updates current selected character text whenever new selection is made
window.addEventListener('change', () => {
  const curr_char = getSelectedCharacter().value;
  document.getElementById("curr-selected-text").innerText =
    "Current Character Selected: " + curr_char;
});