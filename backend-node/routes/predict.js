const express = require('express')
const router = express.Router()
const multer = require('multer')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const FormData = require('form-data')
const auth = require('../middleware/auth')

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
})

const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png']
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only jpg/jpeg/png files allowed'), false)
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } })

router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        const form = new FormData()
        form.append('image', fs.createReadStream(req.file.path), req.file.originalname)
        form.append('user_id', req.user.userId)

        const headers = { ...form.getHeaders() }
        if (req.djangoSession) {
            headers['Cookie'] = `sessionid=${req.djangoSession}`
        }

        const response = await axios.post(`${process.env.DJANGO_URL}/api/predict/`, form, { headers })
        fs.unlink(req.file.path, () => {})
        return res.status(response.status).json(response.data)
    } catch (err) {
        if (req.file) fs.unlink(req.file.path, () => {})
        const status = err.response?.status || 500
        const data = err.response?.data || { error: 'Prediction failed' }
        return res.status(status).json(data)
    }
})

router.get('/', auth, async (req, res) => {
    try {
        const headers = {}
        if (req.djangoSession) {
            headers['Cookie'] = `sessionid=${req.djangoSession}`
        }
        const response = await axios.get(`${process.env.DJANGO_URL}/api/history/`, {
            params: { user_id: req.user.userId },
            headers
        })
        return res.json(response.data)
    } catch (err) {
        const status = err.response?.status || 500
        const data = err.response?.data || { error: 'Failed to fetch history' }
        return res.status(status).json(data)
    }
})

router.get('/history', auth, async (req, res) => {
    try {
        const headers = {}
        if (req.djangoSession) {
            headers['Cookie'] = `sessionid=${req.djangoSession}`
        }
        const response = await axios.get(`${process.env.DJANGO_URL}/api/history/`, {
            params: { user_id: req.user.userId },
            headers
        })
        return res.json(response.data)
    } catch (err) {
        const status = err.response?.status || 500
        const data = err.response?.data || { error: 'Failed to fetch history' }
        return res.status(status).json(data)
    }
})

module.exports = router
