'use strict';

window.addEventListener('load', () => {
    // Parameters from url
    const urlParams = new URLSearchParams(window.location.search);
    // Error query retrieved from url parameter
    const attempt = urlParams.get('error');
    // HTML elements to change 
    const forms = document.getElementsByClassName('form-control');
    const emailHelp = document.getElementById('email-help');
    const userHelp = document.getElementById('user-help');
    const passHelp = document.getElementById('pass-help');
    // Inputs to check
    const pass = document.getElementById('password');
    const confPass = document.getElementById('confirm-password');

    // Errors created with username and email
    if (attempt === 'user-exists') {
        forms[0].classList.add('is-invalid');
        forms[1].classList.add('is-invalid');
        emailHelp.innerText = 'Email might already exist';
        userHelp.innerText = 'Username might already exist';

        // Error removed when email entry is made
        document.getElementById('email').addEventListener('input', () => {
            forms[0].classList.remove("is-invalid");
            emailHelp.innerText = "";
        });
        // Error removed when username entry is made
        document.getElementById('username').addEventListener('input', () => {
            forms[1].classList.remove("is-invalid");
            userHelp.innerText = "";
        });
    }

    // Checks if passwords have same value
    pass.addEventListener('input', updatePassInputs);

    // Checks if passwords have same value
    confPass.addEventListener('input', updatePassInputs);

    /**
     * updatePassInputs
     * Updates password inputs based on whether they match or not
    */
    function updatePassInputs() {
        // Errors created when password don't match
        if (pass.value !== confPass.value) {
            forms[2].classList.add('is-invalid');
            forms[3].classList.add('is-invalid');
            passHelp.innerText = "Passwords do not match";
        // Password entries put back to normal
        } else {
            forms[2].classList.remove('is-invalid');
            forms[3].classList.remove('is-invalid');
            passHelp.innerText = "";
        }
    }
});