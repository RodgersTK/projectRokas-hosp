const http = require('http');
const fs = require('fs');
const url = require('url');

const server = http.createServer((req, res) => {
    const reqUrl = url.parse(req.url, true);

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'GET') {
        if (reqUrl.pathname === '/hospdb.json') {
            // Read the JSON file and send its contents as response
            fs.readFile('hospdb.json', (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Internal Server Error');
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(data);
                }
            });
        } else {
            // Extract ID from query parameters
            const id = reqUrl.query.id;

            // Read the JSON file
            fs.readFile('hospdb.json', (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Internal Server Error');
                } else {
                    let patients = JSON.parse(data);

                    // Check if patients is an array
                    if (Array.isArray(patients.patients)) {
                        // Find patient record with matching ID
                        const patient = patients.patients.find(patient => patient.id === id);

                        if (patient) {
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify(patient));
                        } else {
                            res.writeHead(404, { 'Content-Type': 'text/plain' });
                            res.end('Patient not found');
                        }
                    } else {
                        // Handle the case when patients is not an array
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Internal Server Error: Invalid data format');
                    }
                }
            });
        }
    } else if (req.method === 'OPTIONS') {
        // Respond to preflight requests
        res.writeHead(200);
        res.end();
    } else if (req.method === 'DELETE') {
        if (reqUrl.pathname === '/delete') {
            // Extract ID from query parameters
            const id = reqUrl.query.id;

            // Read the JSON file
            fs.readFile('hospdb.json', (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Internal Server Error');
                } else {
                    let patients = JSON.parse(data);

                    // Find index of record with matching ID
                    const index = patients.patients.findIndex(patient => patient.id === id);

                    if (index !== -1) {
                        // Remove record from array
                        patients.patients.splice(index, 1);

                        // Write updated data back to JSON file
                        fs.writeFile('hospdb.json', JSON.stringify(patients, null, 2), (err) => {
                            if (err) {
                                res.writeHead(500, { 'Content-Type': 'text/plain' });
                                res.end('Internal Server Error');
                            } else {
                                res.writeHead(200, { 'Content-Type': 'text/plain' });
                                res.end('Record deleted successfully');
                            }
                        });
                    } else {
                        res.writeHead(404, { 'Content-Type': 'text/plain' });
                        res.end('Record not found');
                    }
                }
            });
        }
    } else if (req.method === 'PATCH') {
        if (reqUrl.pathname === '/update') {
            let body = '';

            // Collect request body data
            req.on('data', (chunk) => {
                body += chunk;
            });

            // Process request body
            req.on('end', () => {
                try {
                    const updateData = JSON.parse(body);

                    // Read the JSON file
                    fs.readFile('hospdb.json', (err, data) => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'text/plain' });
                            res.end('Internal Server Error');
                        } else {
                            let patients = JSON.parse(data);

                            // Find index of record with matching ID
                            const index = patients.patients.findIndex(patient => patient.id === updateData.id);

                            if (index !== -1) {
                                // Update patient record
                                patients.patients[index] = updateData;

                                // Write updated data back to JSON file
                                fs.writeFile('hospdb.json', JSON.stringify(patients, null, 2), (err) => {
                                    if (err) {
                                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                                        res.end('Internal Server Error');
                                    } else {
                                        res.writeHead(200, { 'Content-Type': 'text/plain' });
                                        res.end('Record updated successfully');
                                    }
                                });
                            } else {
                                res.writeHead(404, { 'Content-Type': 'text/plain' });
                                res.end('Record not found');
                            }
                        }
                    });
                } catch (error) {
                    res.writeHead(400, { 'Content-Type': 'text/plain' });
                    res.end('Bad Request: Invalid JSON data');
                }
            });
        }
    }
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
