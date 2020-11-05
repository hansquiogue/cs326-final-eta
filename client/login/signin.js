// Sends POST Request when Sign In button is clicked
document.getElementById('sign-in').addEventListener("click", async function() {
    const user = document.getElementById('user-input').value;
    const pass = document.getElementById('pass-input').value;
    
    // Checks if there are entries for all fields
    if (user.length === 0 || pass.length === 0) {
        alert("Every field must be filled");
        return;
    }

    const data = { user: user, pass: pass };

    const response = await fetch("http://localhost:8080/login-attempt", {
        method: 'post',
        body: JSON.stringify(data),
    });

    // Response error message printed
    if (!response.ok) {
        alert(response.statusText);
        return;
    }

    // Temporary: retrieve user credentials and redirect to character selector page
    const temp_response = await fetch("../temp-storage.json");
    const temp_json = await temp_response.json();
    alert("Credentials Recieved" + JSON.stringify(temp_json));
    window.location.href = "selector.html";
});