import { API_URL } from "./consts.js"
import store from "../store.js"

export const getSessionUser = async () => {
    // get session from somewhere    
    // return {
    //     id: 1
    // }

    return store.state.user
    return null
}

export const getUserDetails = async (id) => {
    try {
        let url = `${API_URL}/wp-json/app/v1/get-user-profile`
        let response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: id }),
        })

        const data = await response.json()

        if (response.status !== 200) throw new Error(data.message)
        return data
    } catch (error) {
        console.error('Error fetching user details:', error)
        return null
    }
}

export const verifyUser = async (credentials) => {
    try {
        const response = await fetch(`${API_URL}/wp-json/ticket_scanner/v1/verify_user`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
        })

        if (response.ok) {
            return JSON.parse(await response.json())
        }
    } catch (error) {
        console.error(error)
        return error
    }
}

export const handleSignUp = async (user) => {
    try {
        const response = await fetch(`${API_URL}/wp-json/app/v1/register-user`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(user),
        })

        const data = await response.json()

        if (response.status !== 201) {
            return {
                success: false,
                message: data.message,
                code: data.code,
            }
        }

        return data
    } catch (error) {
        throw error
    }
}

export const updateUsername = async (user) => {
    const response = await fetch(`${API_URL}/wp-json/app/v1/update-username`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
    })

    const data = await response.json()
    return data
}

export const updatePassword = async (new_password, old_password) => {
    const user = await getSessionUser()
    if (!user) return

    const response = await fetch(`${API_URL}/wp-json/app/v1/update-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: user.id, new_password, old_password }),
    })

    const data = await response.json()
    return data
}

export const updateUserDetails = async (details, email_changed) => {
    const user = await getSessionUser()
    if (!user) return

    const response = await fetch(`${API_URL}/wp-json/app/v1/update-user-details`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: user.id, ...details, email_changed }),
    })

    const data = await response.json()
    return data
}