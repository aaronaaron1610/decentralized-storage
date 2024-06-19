const axios = require('axios');
const auth = require('../config/firebaseAdmin');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { email, password } = req.body;
    console.log("email ", email, "password ", password)
    try {
        // Check if the email is already registered
        try {
            await auth.getUserByEmail(email);
            console.log("Email already registered")
            return res.status(200).json({ message: 'Email already registered' });
        } catch (error) {
            if (error.code !== 'auth/user-not-found') {
                throw error;
            }
        }

        // Create the user with email and password
        const userRecord = await auth.createUser({
            email: email,
            password: password,
        });

        const customToken = await auth.createCustomToken(userRecord.uid, { email: email });

        res.status(201).json({ message: 'User created successfully', token: customToken });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Verify the user's email and password using Firebase Authentication REST API
        const response = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyB6gzEwYVEbC-mPSkUjiLrA2BCjFmi6mag`, {
            email: email,
            password: password,
            returnSecureToken: true
        });

        const { idToken, localId } = response.data;

        const customToken = await auth.createCustomToken(localId, { email: email });

        res.json({ token: customToken });
    } catch (err) {
        if (err.response && err.response.data && err.response.data.error) {
            console.log("response ",err.response.data )
            const errorCode = err.response.data.error.message;
            if (errorCode === 'EMAIL_NOT_FOUND' || errorCode === 'INVALID_PASSWORD' || errorCode === 'INVALID_LOGIN_CREDENTIALS') {
                return res.status(201).json({ message: 'Invalid credentials' });
            }
        }
        res.status(500).json({ error: err.message });
    }
};
