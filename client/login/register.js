// Sends POST Request when Register button is clicked
document.getElementById('register').addEventListener("click", async function() {
    const email = document.getElementById('email-input').value;
    const user = document.getElementById('user-input').value;
    const pass = document.getElementById('pass-input').value;
    const conf_pass = document.getElementById('pass-confirm-input').value;
    
    // Checks if passwords match
    if (pass !== conf_pass) {
        alert("Your password and confirmation password do not match");
        return;
    } 
    // TODO: Make email valid entry

    // Inputs must not be empty
    if (email.length === 0 || user.length === 0 || pass.length === 0 || conf_pass.length === 0) {
        alert("Every field must be filled");
        return;
    }

    const data = { user: user, pass: pass, email: email };
    const response = await fetch("http://localhost:8080/register-attempt", {
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

