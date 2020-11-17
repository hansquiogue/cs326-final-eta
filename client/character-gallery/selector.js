// User retrieved from url parameter
const user = window.location.pathname.split('/')[3];

window.addEventListener('load', async function () {
    // Welcome message to logged in user
    document.getElementById('welcome').innerText = 'Welcome ' + user + '!';

    // Get's users character list
    const charList = await getCharacterList();
    // Error getting characters
    if (charList === undefined) {
        alert('Error retreiving characters. Please try again.');
    // No errors getting characters
    } else {
        // List of characters can be generated
        initGallery(charList);
    }

    // Functionality when create a character button is clicked in modal
    document.getElementById('create-char').addEventListener('click', async function () {
        // Current character selected
        const charName = document.getElementById('new-char-name').value;
        
        // Character name must be a letter, number, or space and be at least 2 characters
        if (!charName.match(/^\S[A-Za-z0-9 ]{1,20}/)) {
            // Help error message displayed
            document.getElementById('new-char-help').innerText = 
                `Character name must:
                - Only contain letters, numbers or spaces
                - Start with letters or numbers 
                - Be between 2-20 characters long`;
            // Adds error surrounding input text 
            document.getElementById('new-char-name').classList.add('is-invalid');
            return;
        } 
        
        // New query based on character name
        const query = '?char-name=' + charName;
        // Submitting get request with new character name
        const response = await fetch('/character/create' + query);

        // Response was okay
        if (response.ok) {
            // New character is generated in gallery programmatically
            createNewCharInGallery(charName);

            // Modal is hiden (Both modal itself and modal backdrop)
            hideModal(document.getElementById('create-modal'));
            hideModal(document.getElementsByClassName('modal-backdrop')[0]);
        // Bad response
        } else {
            alert('Character cannot be created at this time');
        }
    });

    // Removes error surrounding create character modal input
    document.getElementById('new-char-name').addEventListener('input', () => {
        const input = document.getElementById('new-char-name');
        // Input matches character name criteria
        if (input.value.match(/^\S[A-Za-z0-9 ]{1,20}/)) {
            input.classList.remove('is-invalid');
        // Input does not match criteria
        } else {
            input.classList.add('is-invalid');
        }
    });

    // Whenever play button is clicked
    document.getElementById('play-btn').addEventListener('click', async function () {
        // Current character selected
        const charName = document.getElementById('new-char-name').value.replace(/\s+/g, '-').toLowerCase();
        
        if (charName === 'none') {
            alert('No character selected');
            return;
        }

        const data = { user:'user', char: char };
        
        window.location.href = '/gallery/user/' + user + '/character/' + char;

        // await fetch('/' + 'user' + '/gallery/' + char,
        //   {
        //     method: 'post',
        //     body: JSON.stringify(data),
        //   }
        // );
    });



    // Whenever delete button is clicked
    // TODO: Confirmation message
    document
      .getElementById('delete')
      .addEventListener('click', async function () {
        const char = getSelectedCharacter().value;
        const data = { user: user, char: char };

        const delete_resp = await fetch(
          '/manage-sheets-delete',
          {
            method: 'post',
            body: JSON.stringify(data),
          }
        );

        if (delete_resp.ok) {
          const body = await delete_resp.json();
          alert('Chacter deleted request recieved' + JSON.stringify(body));

          deleteCharInGallery();

          document.getElementById('curr-selected-text').innerText =
            'None';
        }
      });
});


/**
 * Gets a user's character list
 * @returns {Array<string>} An array that contains a user's character names
 */
async function getCharacterList() {
    const response = await fetch('/user/' + user + '/characters');
    const body = await response.json();
    return body; 
}

/**
 * Initializes a user's characters
 * @param {Array<string>} charList An array of a user's characters 
 */
function initGallery(charList) {
    // Creates new character in gallery
    charList.forEach(char => createNewCharInGallery(char));
}

/**
 * Helper function that hides a modal 
 * @param {HTML Element} elem An HTML element 
 */
function hideModal(elem) {
    elem.classList.remove('show');
    elem.classList.add('hidden');
}

/**
 * Programmatically generates a new character in the gallery
 * @param {string} name A character's name
 */
function createNewCharInGallery(name) {
    // Parent
    const parent = document.getElementById('char-gallery');

    // New div for row created underneath
    const newRow = document.createElement('div');
    newRow.className = 'row mt-2';
    parent.appendChild(newRow);

    // New div for col created underneath
    const newCol = document.createElement('div');
    // Adding attributes to newCol
    newCol.setAttribute('class', 'col mx-3 btn-group btn-group-toggle');
    newCol.setAttribute('data-toggle', 'buttons');
    newRow.appendChild(newCol);

    // New label for button design created underneath
    const newLabel = document.createElement('label');
    newLabel.className = 'btn btn-secondary';
    newLabel.innerText = name;
    newCol.appendChild(newLabel);

    // New input underneath
    const newInput = document.createElement('input');
    const numChar = document.getElementsByClassName('radio-char').length + 1;
    // Adding new attributes
    newInput.setAttribute('class', 'radio-char');
    newInput.setAttribute('type', 'radio');
    newInput.setAttribute('name', 'charselect');
    newInput.setAttribute('autocomplete', 'off');
    newInput.setAttribute('id', 'char' + numChar.toString());
    newInput.setAttribute('value', name);
    newLabel.appendChild(newInput);
}

/**
 * Returns the selected character in the gallery
 * @returns {HTML Element} The HTML element of a selected character
 */
function getSelectedCharacter() {
    let char_list = document.getElementsByName('charselect');
    char_list = Array.from(char_list);
    return char_list.filter((char) => char.checked)[0];
}

// TODO: Update character selected
function deleteCharInGallery() {
  const id = getSelectedCharacter().id;
  document.getElementById(id).parentElement.parentElement.parentElement.remove();
}

// Whenever there are any changes, the page will look for the selected character
window.addEventListener('change', () => {
    const curr_char = getSelectedCharacter().value;
    document.getElementById('curr-selected-text').innerText = curr_char;
});