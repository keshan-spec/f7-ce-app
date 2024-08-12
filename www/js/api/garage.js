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
            return []
        }

        return data
    } catch (error) {
        console.error(error)
        return []
    }
}

export const getGargeById = async (garageId) => {
    try {
        const response = await fetch(`${API_URL}/wp-json/app/v1/get-garage`, {
            method: "POST",
            cache: "force-cache",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ garage_id: garageId }),
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

export const getPostsForGarage = async (garageId, page = 1, tagged = false) => {
    try {
        const response = await fetch(`${API_URL}/wp-json/app/v1/get-garage-posts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ garage_id: garageId, page, limit: 10, tagged }),
        })

        const data = await response.json()
        if (response.status !== 200) {
            return null
        }

        return data
    } catch (error) {
        return null
    }
}