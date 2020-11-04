import * as url from "url";
import * as http from "http";
import * as fs from "fs";

// This function processes what happens when a GET/POST Request is called. 
function process (request, response, options) {
    

}


// Creates the server
const server = http.createServer((request, response) => {	
    // GET Request
    if (request.method === 'GET') {
        const options = url.parse(request.url, true).query;
        process(request, response, options);
    // POST Request
    } else {
        let requestBody = "";
            request.on('data', function (data) {
            requestBody += data;
        });
        request.on('end', function () {
            const options = JSON.parse(requestBody);
            process(request, response, options);
        });
    }
});

server.listen(8080);