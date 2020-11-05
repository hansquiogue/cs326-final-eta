// Sends POST Request when Sign In button is clicked
document.getElementById('sign-in').addEventListener("click", async function() {
    const data = {
        user: document.getElementById('user-input').value,
        pass: document.getElementById('pass-input').value
    };

    const response = await fetch("http://localhost:8080/login-attempt", {
        method: 'post',
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        console.log(response.error);
        return;
    }

    // Temporary: retrieve user credentials and redirect to character selector page
    const temp_response = await fetch("../temp-storage.json");
    const temp_json = await temp_response.json();
    alert("Credentials Recieved" + JSON.stringify(temp_json));
    window.location.href = "selector.html";
});

