import jwt from 'jsonwebtoken'

const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' })

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        console.log('Decoded token:', decoded)

        // Ensure user object exists and has an id
        if (!decoded.user || !decoded.user.id) {
            console.error('Invalid token structure:', decoded)
            return res.status(401).json({ message: 'Invalid token structure' })
        }

        req.user = decoded.user
        console.log('req.user set to:', req.user)
        next()
    } catch (err) {
        console.error('Token verification error:', err.message)
        res.status(401).json({ message: 'Token is not valid' })
    }
}

export default auth
