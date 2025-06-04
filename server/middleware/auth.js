import jwt from 'jsonwebtoken'

const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' })

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        console.log('✅ Token decoded:', decoded) // <-- 👈 log ici
        req.user = decoded.user
        next()
    } catch (err) {
        console.error('❌ Invalid token:', err.message)
        res.status(401).json({ message: 'Token is not valid' })
    }
}

export default auth
