import jwt from 'jsonwebtoken'
import User from "../models/User.js"

export const register = async (req, res) => {
    const { name, email, password } = req.body

    try {
        let user = await User.findOne({ email })
        if (user) return res.status(400).json({ message: 'User already exists' })

        user = new User({ name, email, password })
        await user.save()

        const payload = { user: { id: user.id } }
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });

        res.status(201).json({ token })
    } catch (error) {
        console.error("❌ Error in controller:", error.message);
        console.error(error.message)
        res.status(500).send('Server error')
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await User.findOne({ email })
        if (!user) return res.status(400).json({ message: 'Invalid credentials' })

        const isMatch = await user.comparePassword(password)
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' })

        const payload = { user: { id: user.id } }
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });

        res.json({ token })
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server error')
    }
}
