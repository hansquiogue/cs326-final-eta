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
        if (!charName.match(/^\S[A-Za-z0-9 ]/) || charName.length > 50) {
            // Help error message displayed
            document.getElementById('new-char-help').innerText = 
                `Character name must:
                - Only contain letters, numbers or spaces
                - Start with letters or numbers 
                - Be between 2-50 characters long`;
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
        if (input.value.match(/^\S[A-Za-z0-9 ]/) || charName.length > 50) {
            input.classList.remove('is-invalid');
        // Input does not match criteria
        } else {
            input.classList.add('is-invalid');
        }
    });

    // Whenever play button is clicked
    document.getElementById('play-btn').addEventListener('click', async function () {
        // Checks if a character has been selected
        if (!checkCharSelected()) {
            return;
        }

        // Current character selected
        const charName = getSelectedCharacter().value.replace(/\s+/g, '-');
        window.location.href = '/gallery/user/' + user + '/character/' + charName;
    });

    // When normal delete button is clicked
    document.getElementById('delete-btn').addEventListener('click', function() {
         // Character selected is stored in data to send
         const charName = getSelectedCharacter();

         if (charName !== undefined) {
            // Changes confirmation message to current character
            document.getElementById('delete-char-text').innerText = charName.value;
         }
    });

    // Whenever delete confirmation button is clicked
    document.getElementById('delete').addEventListener('click', async function() {
        // Checks if a character has been selected
        if (!checkCharSelected()) {
            hideModal(document.getElementById('confirm-delete'));
            hideModal(document.getElementsByClassName('modal-backdrop')[0]);
            return;
        }

        // Character selected is stored in data to send
        const charName = getSelectedCharacter().value;
        const data = { character: charName };

        // Sends delete request of character
        const response = await fetch('/character/delete', {
            method: 'DELETE',
            headers: { 'Content-Type' : 'application/json' },
            body: JSON.stringify(data)
        });

        // Delete response is okay
        if (response.ok) {
            // Character deleted in gallery
            deleteCurrCharInGallery();
            // Selected character is set it none
            document.getElementById('curr-selected-text').innerText = 'None';
            
            // Hides modal
            hideModal(document.getElementById('confirm-delete'));
            hideModal(document.getElementsByClassName('modal-backdrop')[0]);

            // Modal text is reset
            document.getElementById('delete-char-text').innerText = 'No character selected!';

            // Image is reset
            resetImage();
        // Delete response failure
        } else {
            alert('An error has occured while deleting the character ' + charName);
        }
    });

    // When logout button is clicked
    document.getElementById('logout').addEventListener('click', async function() {
        const response = await fetch('/logout');
        if (response.ok) {
            window.location.href = '/';
        }
    });
});

/**
 * Checks if a character has been selected. Prints an alert
 * if no character has been selected. Returns true if a character
 * has been selected and false otherwise.
 * @returns {boolean} Represents if character has been selected
 */
function checkCharSelected() {
    // No character selected
    if (getSelectedCharacter() === undefined) {
        alert('No character selected!');
        return false;
    }
    return true;
}

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

/**
 * Programmatically deletes the current character selected in the gallery
 */
function deleteCurrCharInGallery() {
    const id = getSelectedCharacter().id;
    document.getElementById(id).parentElement.parentElement.parentElement.remove();
}

// Resets current image to default image
function resetImage() {
    // Image url is set to default
    const currImage = document.getElementById('currImage');
    currImage.src = '/gallery/user/:user/default.jpg';
}


// Whenever there are any changes, the page will look for the selected character
window.addEventListener('change', async () => {
    const currChar = getSelectedCharacter().value;
    document.getElementById('curr-selected-text').innerText = currChar;

    // Retrieving image endpoint
    const endPoint = '/gallery/user/' + user + '/character/' + currChar + '?getImage=true';
    // Gets character's image
    const response = await fetch(endPoint);

    if (response.ok) {
        // URL of picture
        const body = await response.text();
        
        // Current image HTML
        const currImage = document.getElementById('currImage');
        currImage.src = body;
    } else {
        resetImage();    
    }
});