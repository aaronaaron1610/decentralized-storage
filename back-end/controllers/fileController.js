const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();
const pinataSDK = require('@pinata/sdk');
const stream = require('stream');

// Initialize Pinata client
const { PINATA_API_KEY, PINATA_SECRET_API_KEY } = process.env;
const pinata = new pinataSDK(PINATA_API_KEY, PINATA_SECRET_API_KEY);

pinata.testAuthentication().then((result) => {
    console.log(result);
}).catch((err) => {
    console.error(err);
});

// Upload File
exports.uploadFile = async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  const fileName = req.files.file.name;
  const file = req.files.file;

  try {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(file.data);

    const options = {
      pinataMetadata: {
        name: fileName,
      },
      pinataOptions: {
        cidVersion: 0
      }
    };

    const pinataResult = await pinata.pinFileToIPFS(bufferStream, options);

    res.status(201).json({ ipfsHash: pinataResult.IpfsHash });
  } catch (err) {
    res.status(500).json({ error: `File upload failed: ${err.message}` });
  }
};

// Download File
exports.downloadFile = async (req, res) => {
  const { ipfsHash } = req.params;

  console.log("ipfsHash ", ipfsHash)

  try {
    const ipfsFileUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    const response = await axios.get(ipfsFileUrl, { responseType: 'arraybuffer' });

   
   const contentType = response.headers['content-type'];

   res.set('Content-Type', contentType);
   res.set('Content-Disposition', `attachment; filename="${ipfsHash}"`);
   res.send(response.data);
  } catch (err) {
    res.status(500).json({ error: `File download failed: ${err.message}` });
  }
};

exports.updatePermissions = async (req, res) => {
  const { fileId, user, hasAccess } = req.body;

  try {
    const file = fileStore.getFile(fileId);
    if (!file) return res.status(404).json({ message: 'File not found' });

    if (file.owner !== req.user.username) {
      return res.status(403).json({ message: 'Only the owner can update permissions' });
    }

    if (hasAccess) {
      if (!file.permissions.includes(user)) {
        file.permissions.push(user);
      }
    } else {
      file.permissions = file.permissions.filter(u => u !== user);
    }

    fileStore.updatePermissions(fileId, file.permissions);
    res.json(file);
  } catch (err) {
    res.status(500).json({ error: `Updating permissions failed: ${err.message}` });
  }
};
