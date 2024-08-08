import { API_URL } from './consts.js'

export const getUserGarage = async (profileId) => {
    try {
        const response = await fetch(`${API_URL}/wp-json/app/v1/get-user-garage`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: profileId }),
        })

        const data = await response.json()
        if (response.status !== 200) {
            throw new Error('Failed to fetch users posts')
        }

        return data
    } catch (error) {
        console.error(error)
        return null
    }
}