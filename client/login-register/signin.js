window.addEventListener('load', () => {
    // Parameters from url
    const urlParams = new URLSearchParams(window.location.search);
    // Attempty query retrieved from url parameter
    const attempt = urlParams.get("attempt");
    
    // Invalid attempt
    if (attempt === 'failure') {
        // HTML elements to change
        const forms = document.getElementsByClassName('form-control');
        const userHelp = document.getElementById('user-help');
        const passHelp = document.getElementById('pass-help');

        // Adds errors surrounding form inputs and creates error messages
        forms[0].classList.add("is-invalid");
        forms[1].classList.add("is-invalid");
        userHelp.innerText = "Username must be valid";
        passHelp.innerText = "Password must be valid";

        // Errors for username are removed when input is recieved
        document.getElementById('username').addEventListener('input', () => {
            forms[0].classList.remove("is-invalid");
            userHelp.innerText = "";
        });

        // Errors for password are removed when input is recieved
        document.getElementById('password').addEventListener('input', () => {
            forms[1].classList.remove("is-invalid");
            passHelp.innerText = "";
        });
    }
});
