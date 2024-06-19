require('dotenv').config();
const pinataSDK = require('@pinata/sdk');
const fs = require('fs');

const { PINATA_API_KEY, PINATA_SECRET_API_KEY } = process.env;
const pinata = new pinataSDK(PINATA_API_KEY, PINATA_SECRET_API_KEY);

pinata.testAuthentication().then((result) => {
    console.log(result);
}).catch((err) => {
    console.error(err);
});

const readableStreamForFile = fs.createReadStream('./config/download.png');
const options = {
    pinataMetadata: {
        name: "your_file_name",
    },
    pinataOptions: {
        cidVersion: 0
    }
};

pinata.pinFileToIPFS(readableStreamForFile, options).then((result) => {
    console.log(result);
}).catch((err) => {
    console.error(err);
});
