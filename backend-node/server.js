require('dotenv').config()
const express = require('express')
const cors = require('cors')
const fs = require('fs')

const authRoutes = require('./routes/auth')
const predictRoutes = require('./routes/predict')

const app = express()
const PORT = process.env.PORT || 5000

fs.mkdirSync('uploads', { recursive: true })

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/predict', predictRoutes)
app.use('/api/history', predictRoutes)

app.get('/', (req, res) => {
    res.json({ message: 'VisualDerm Node API' })
})

app.listen(PORT, () => {
    console.log(`Node server running on port ${PORT}`)
})
