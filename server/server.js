import * as url from "url";
import * as http from "http";
import * as fs from "fs";
import { join } from "path";

// This function processes what happens when a GET Request is called.
function processGET(request, response, options) {
  // Parsed requests
  const parsed = url.parse(request.url, true);

  let defaultOption = false;

  // TODO: Seperate GET and POST Requests
  // Manage .. API endpoint
  switch (parsed.pathname) {
    case "/manage-sheets-load":
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify("Char loaded [" + ["Nutmeg", "Noob"] + "]"));
      break;
    case "/char-sheets-load":
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify("Placeholder " + "{char. json will go here}"));
      break;
    case "/char-sheets-export":
      response.writeHead(200, { "Content-Type": "application/json" });
      response.write(JSON.stringify({ savedSheet: "Placeholder" }));
      break;
    default:
      defaultOption = true;
  }
  if (defaultOption) {
    // File name for homepage
    const filename =
      parsed.pathname === "/"
        ? "homepage.html"
        : parsed.pathname.replace("/", "");
    // Path for different pages
    const path = filename.includes("homepage")
      ? join("client/homepage/", filename)
      : join("client/", filename);

    // Path exists
    if (fs.existsSync(path)) {
      if (filename.endsWith("html")) {
        response.writeHead(200, { "Content-Type": "text/html" });
      } else if (filename.endsWith("css")) {
        response.writeHead(200, { "Content-Type": "text/css" });
      } else if (filename.endsWith("js")) {
        response.writeHead(200, { "Content-Type": "text/javascript" });
      } else {
        response.writeHead(200);
      }
      response.write(fs.readFileSync(path));
    } else {
      response.writeHead(404);
      response.write(
        "You seem to be a bit lost adventurer.. \n 404: Page not found!"
      );
    }
  }
  response.end();
}

// This function processes what happens when a POST Request is called.
function processPOST(request, response, options) {
  // Parsed requests
  const parsed = url.parse(request.url, true);

  switch (parsed.pathname) {
    // Login attempt API endpoint
    case "/login-attempt":
      checkRequest(options, ["user", "pass"]);
      break;
    // Register attempt API endpoint
    case "/register-attempt":
      checkRequest(options, ["user", "pass", "email"]);
      break;
    // Logout attempt API endpoint
    case "/logout-attempt":
      checkRequest(options, ["user"]);
      break;
    // Character selection API endpoints
    case "/manage-sheets-select": case "/manage-sheets-add": case "/manage-sheets-delete":
      checkRequest(options, ["user", "char"]);
      break;
    case "/char-sheets-save":
      response.writeHead(200);
      response.write("Sheet saved");
      break;
    // Path not found
    default:
      response.writeHead(404);
      response.write("404: You seem to be a bit lost adventurer..");
  }
  // Checks the endpoint request
  function checkRequest(opt, keys) {
    // Request invalid
    if (!requestCriteriaValid(opt, keys)) {
      badRequest();
      // Request Valid
    } else {
        response.writeHead(200, { "Content-Type": "application/json" });
        response.write(JSON.stringify(opt));
    }
  }

  function badRequest() {
    response.writeHead(400);
    response.write("400: Request does not match criteria");
  }
  response.end();
}

// Function that checks if response criteria is met
function requestCriteriaValid(req, keys) {
  const valid = true;
  if (typeof req !== "object") {
    return !valid;
  } else if (Object.keys(req).length !== keys.length) {
    return !valid;
    // Request includes proper keys
  } else if (
    !requestContentsValid(req, keys, (r, k) => Object.keys(r).includes(k))
  ) {
    return !valid;
    // Request includes proper values
  } else if (
    !requestContentsValid(req, keys, (r, k) => typeof r[k] === "string")
  ) {
    return !valid;
  } else {
    return valid;
  }
  // Helper function that checks if quest contents are valid
  function requestContentsValid(resp, keys, condition) {
    return keys.filter((key) => condition(resp, key)).length === keys.length;
  }
}

// Creates the server
const server = http.createServer((request, response) => {
  // GET Request
  if (request.method === "GET") {
    const options = url.parse(request.url, true).query;
    processGET(request, response, options);
    // POST Request
  } else {
    let requestBody = "";
    request.on("data", function (data) {
      requestBody += data;
    });
    request.on("end", function () {
      const options = JSON.parse(requestBody);
      processPOST(request, response, options);
    });
  }
});

server.listen(process.env.PORT || 8080);
