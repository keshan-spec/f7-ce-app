import { API_URL } from "./consts.js"
import store from "../store.js"

export const getSessionUser = async () => {
    // get session from somewhere    
    if (store.state.user) {
        return store.state.user
    }

    // check in local storage
    const session = window.localStorage.getItem('token')
    if (session) {
        return session
    }

    return null
}

export const getUserDetails = async (token) => {
    try {
        let url = `${API_URL}/wp-json/app/v1/get-user-profile`
        let response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
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
            return await response.json()
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
        return error
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

export const updateContentIds = async (content_ids, user_id) => {
    const response = await fetch(`${API_URL}/wp-json/app/v1/update-selected-content`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_id,
            content_ids
        }),
    })

    const data = await response.json()
    return data
}

export const updateAboutUserIds = async (content_ids, user_id) => {
    const response = await fetch(`${API_URL}/wp-json/app/v1/update-about-content`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_id,
            content_ids
        }),
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