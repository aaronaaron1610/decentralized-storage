const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Read the file
const filePath = path.join(__dirname, 'config/decentralized-storage.json');
const fileStream = fs.createReadStream(filePath);

// Create form data
const form = new FormData();
form.append('file', fileStream);

// Infura project credentials
const projectId = 'ec2561e066c043fcb43489d229d1a75d';
const projectSecret = 'QfJR0/H8YHAflNrKP6ChtoSDw7v/xEjc0Y20CKPoP0Rm1J4/eJu0og';

// Axios request
axios.post('https://ipfs.infura.io:5001/api/v0/add?pin=false', form, {
  auth: {
    username: projectId,
    password: projectSecret
  },
  headers: {
    ...form.getHeaders()
  }
})
.then(response => {
  console.log('File uploaded:', response.data);
})
.catch(error => {
  console.error('Error uploading file:', error);
});
