// Sends POST Request when Register button is clicked
document.getElementById('register').addEventListener("click", async function() {
    const email = document.getElementById('email-input').value;
    const user = document.getElementById('user-input').value;
    const pass = document.getElementById('pass-input').value;
    const conf_pass = document.getElementById('pass-confirm-input').value;
    
    // TODO: Validate code server side
    // Checks if passwords match
    if (pass !== conf_pass) {
        alert("Your password and confirmation password do not match");
        return;
    } 
    // Username can only include number and letters
    if (!user.match(/[A-Za-z0-9]+/)) {
        alert("Username can only include numbers and letters");
        return;
    }

    // Inputs must not be empty
    if (email.length === 0 || user.length === 0 || pass.length === 0 || conf_pass.length === 0) {
        alert("All field entries must be completed");
        return;
    }

    const data = { user: user, pass: pass, email: email };
    const response = await fetch("/register-attempt", {
        method: 'post',
        body: JSON.stringify(data),
    });

    // Response went okay
    if (response.ok) {
        const body = await response.json();
        alert("Account registered " + JSON.stringify(body));
        window.location.href = "signin.html";
    } else {
        alert(response.statusText);
        return;
    }
});

