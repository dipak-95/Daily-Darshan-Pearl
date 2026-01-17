const http = require('http');

const payload = JSON.stringify({
    name: "Antigravity Test Temple",
    location: "Cloud VPS",
    description: "This temple was uploaded safely via script to test the Live Connection.",
    image: "https://placehold.co/600x400/png",
    activeContentTypes: ["darshan", "aarti"]
});

const options = {
    hostname: '72.62.195.222',
    port: 5000,
    path: '/api/temples',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('BODY:', data);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(payload);
req.end();
