const express = require('express')
const router = express.Router()
const axios = require('axios')
const jwt = require('jsonwebtoken')
require('dotenv').config()

router.post('/register', async (req, res) => {
    try {
        const response = await axios.post(`${process.env.DJANGO_URL}/api/register/`, req.body)
        return res.status(response.status).json(response.data)
    } catch (err) {
        const status = err.response?.status || 500
        const data = err.response?.data || { error: 'Registration failed' }
        return res.status(status).json(data)
    }
})

router.post('/login', async (req, res) => {
    try {
        const response = await axios.post(`${process.env.DJANGO_URL}/api/login/`, req.body)
        const token = jwt.sign(
            { userId: response.data.user_id, username: response.data.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        )
        return res.json({ token, username: response.data.username })
    } catch (err) {
        return res.status(401).json({ error: 'Invalid credentials' })
    }
})

module.exports = router
