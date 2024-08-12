import { getSessionUser } from "./auth.js"
import { API_URL } from "./consts.js"

export const verifyScan = async (decodedText) => {
    const user = await getSessionUser()

    const response = await fetch(`${API_URL}/wp-json/app/v1/verify-qr-code`, {
        cache: "no-cache",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: user?.id, qr_code: decodedText }),
    })

    const data = await response.json()
    return data
}

export const linkProfile = async (decodedText) => {
    const user = await getSessionUser()

    const response = await fetch(`${API_URL}/wp-json/app/v1/link-qr-code-entity`, {
        cache: "no-cache",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ entity_id: user?.id, qr_code: decodedText, entity_type: "profile" }),
    })

    const data = await response.json()
    return data
}

export const getIDFromQrCode = async (decodedText) => {
    const response = await fetch(`${API_URL}/wp-json/app/v1/get-linked-entity`, {
        cache: "no-cache",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ qr_code: decodedText }),
    })

    const data = await response.json()

    if ((data && data.error) || response.status === 404) {
        throw new Error(data.error)
    }

    return data
}