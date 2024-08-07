import { API_URL } from './consts.js'
import { getSessionUser } from './auth.js'

export async function fetchPosts(page) {
    const user = await getSessionUser()
    if (!user) return

    const response = await fetch(`${API_URL}/wp-json/app/v1/get-posts?page=${page}&limit=10`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: user.id }),
    })

    const data = await response.json()
    return data
}

export async function fetchComments(postId) {
    const user = await getSessionUser()
    if (!user) return

    const response = await fetch(`${API_URL}/wp-json/app/v1/get-post-comments`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: user.id, post_id: postId }),
    })

    const data = await response.json()
    return data
}

export const maybeLikePost = async (postId) => {
    const user = await getSessionUser()
    if (!user) return

    const response = await fetch(`${API_URL}/wp-json/app/v1/toggle-like-post`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: user.id, post_id: postId }),
    })
    const data = await response.json()
    return data
}

export const addComment = async (postId, comment, comment_id = null) => {
    const user = await getSessionUser()
    if (!user) return


    const response = await fetch(`${API_URL}/wp-json/app/v1/add-post-comment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: user.id, post_id: postId, comment, parent_id: comment_id }),
    })

    const data = await response.json()
    return data
}

export const maybeLikeComment = async (commentId, ownerId) => {
    const user = await getSessionUser()
    if (!user) return

    try {
        const response = await fetch(`${API_URL}/wp-json/app/v1/toggle-like-comment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: user.id, comment_id: commentId, owner_id: ownerId }),
        })
        const data = await response.json()

        if (!response.ok || response.status !== 200) {
            throw new Error(data.message)
        }

        return data
    } catch (e) {
        console.error("Error liking comment")
        throw new Error(e.message)
    }
}