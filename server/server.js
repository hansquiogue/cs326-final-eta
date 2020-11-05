import * as url from "url";
import * as http from "http";
import * as fs from "fs";
import {join} from 'path';

// This function processes what happens when a GET Request is called. 
function processGET (request, response, options) {
    // Parsed requests
    const parsed = url.parse(request.url, true);

    // TODO: Seperate GET and POST Requests
    // Manage .. API endpoint
    if (parsed.pathname === '/manage-sheets-get') {

    // Manage .. API endpoint
    } else if (parsed.pathname === '/manage-sheets-add') {
    
    // Manage .. API end point
    } else if (parsed.pathname === '/manage-sheets-delete') {
    
    // Character sheet .. API end point
    } else if (parsed.pathname === '/char-sheets-get') {

    // Character sheet .. API end point
    } else if (parsed.pathname === '/char-sheets-save') {

    // Character sheet .. API end point
    } else if (parsed.pathname === '/char-sheets-export') {
    
    // Fetching files
    } else {
        // File name for homepage
        const filename = parsed.pathname === '/' ? "homepage.html" : parsed.pathname.replace('/', '');
        // Path for different pages
        let path = filename.includes("homepage") ? join("client/homepage/", filename) : join("client/", filename);
        
        // Path exists
        if (fs.existsSync(path)) {
            if (filename.endsWith("html")) {
                response.writeHead(200, {"Content-Type" : "text/html"});
            } else if (filename.endsWith("css")) {
                response.writeHead(200, {"Content-Type" : "text/css"});
            } else if (filename.endsWith("js")) {
                response.writeHead(200, {"Content-Type" : "text/javascript"});
            } else {
                response.writeHead(200);
            }
            response.write(fs.readFileSync(path));
        } else {
            response.writeHead(404);
            response.write("You seem to be a bit lost adventurer.. \n 404: Page not found!");
        }
    }
    response.end();
}

// This function processes what happens when a POST Request is called. 
function processPOST (request, response, options) {
    // Parsed requests
    const parsed = url.parse(request.url, true);

    // Login attempt API endpoint
    if (parsed.pathname === '/login-attempt') {
        // Requests are not valid
        if (typeof(options) !== 'object') {
            badRequest();
        } else if (Object.keys(options).length !== 2) {
            badRequest();
        } else if (!Object.keys(options).includes("user") || !Object.keys(options).includes("pass")) {
            badRequest();
        } else if (typeof(options.user) !== 'string' || typeof(options.pass) !== 'string') {
            badRequest();
        // Request valid (for now) 
        // TODO: Authentication later?
        } else {
            response.writeHead(200, {"Content-Type" : "text/javascript"});
            fs.writeFileSync('./client/temp-storage.json', JSON.stringify(options));
        }

    // Register attempt API endpoint
    } else if (parsed.pathname === '/register-attempt') {

    
    } else {
        response.writeHead(404);
        response.write("404: Page not found!");
    }

    function badRequest() {
        response.writeHead(400);
        response.write("Bad request");
    }

    response.end();
}

// Creates the server
const server = http.createServer((request, response) => {	
    // GET Request
    if (request.method === 'GET') {
        const options = url.parse(request.url, true).query;
        processGET(request, response, options);
    // POST Request
    } else {
        let requestBody = "";
            request.on('data', function (data) {
            requestBody += data;
        });
        request.on('end', function () {
            const options = JSON.parse(requestBody);
            processPOST(request, response, options);
        });
    }
});

server.listen(8080);