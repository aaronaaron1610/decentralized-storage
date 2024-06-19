const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const morgan = require('morgan');
const cors = require('cors');
const authController = require('./controllers/authController');
const fileController = require('./controllers/fileController');
const dotenv = require('dotenv')
dotenv.config()

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(fileUpload());
app.use(morgan('dev'));
app.use(cors()); 

// routes
app.post('/api/files/upload', fileController.uploadFile);
app.use('/api/files/download/:ipfsHash', fileController.downloadFile);
// app.use('/api/files/permissions', fileController.updatePermissions);
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
