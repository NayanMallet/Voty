import User from "../models/User.js"
import bcrypt from 'bcryptjs'

// Update user name
export const updateName = async (req, res) => {
    try {
        const { name } = req.body

        console.log('updateName - req.user:', req.user)
        console.log('updateName - req.user.id:', req.user?.id)

        // Find and update the user
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name },
            { new: true }
        ).select('-password')

        if (!user) return res.status(404).json({ message: 'User not found' })

        res.json(user)
    } catch (error) {
        console.error('Error updating name:', error.message)
        res.status(500).json({ message: 'Server error' })
    }
}

// Update user email
export const updateEmail = async (req, res) => {
    try {
        const { email, password } = req.body

        console.log('updateEmail - req.user:', req.user)
        console.log('updateEmail - req.user.id:', req.user?.id)

        // Find the user
        const user = await User.findById(req.user.id)
        if (!user) return res.status(404).json({ message: 'User not found' })

        // Verify password
        const isMatch = await user.comparePassword(password)
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' })

        // Check if email is already in use
        const existingUser = await User.findOne({ email })
        if (existingUser && existingUser.id !== user.id) {
            return res.status(400).json({ message: 'User already exists' })
        }

        // Update email
        user.email = email
        await user.save()

        res.json({ ...user.toObject(), password: undefined })
    } catch (error) {
        console.error('Error updating email:', error.message)
        res.status(500).json({ message: 'Server error' })
    }
}

// Update user password
export const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body

        console.log('updatePassword - req.user:', req.user)
        console.log('updatePassword - req.user.id:', req.user?.id)

        // Find the user
        const user = await User.findById(req.user.id)
        if (!user) return res.status(404).json({ message: 'User not found' })

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword)
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' })

        // Update password
        user.password = newPassword
        await user.save()

        res.json({ message: 'Password updated successfully' })
    } catch (error) {
        console.error('Error updating password:', error.message)
        res.status(500).json({ message: 'Server error' })
    }
}

// Delete user account
export const deleteAccount = async (req, res) => {
    try {
        const { password } = req.body

        console.log('deleteAccount - req.user:', req.user)
        console.log('deleteAccount - req.user.id:', req.user?.id)
        console.log('deleteAccount - request body:', req.body)

        // Find the user
        const user = await User.findById(req.user.id)
        if (!user) return res.status(404).json({ message: 'User not found' })

        // Verify password
        const isMatch = await user.comparePassword(password)
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' })

        // Delete the user
        await User.findByIdAndDelete(req.user.id)

        res.json({ message: 'Account deleted successfully' })
    } catch (error) {
        console.error('Error deleting account:', error.message)
        res.status(500).json({ message: 'Server error' })
    }
}
