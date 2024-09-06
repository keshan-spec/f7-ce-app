import {
    API_URL
} from './consts.js'
import {
    getSessionUser
} from './auth.js'

export async function fetchPosts(page, following = false) {
    const controller = new AbortController()
    const signal = controller.signal

    try {
        const user = await getSessionUser()
        if (!user) return

        // setTimeout(() => {
        //     controller.abort()
        // }, 5)

        const response = await fetch(`${API_URL}/wp-json/app/v1/get-posts?page=${page}&limit=10`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: user.id,
                following_only: following,
            }),
            signal // Abort signal
        })

        const data = await response.json()
        return data
    } catch (error) {
        console.log(error);

        return {}
    }
}

export async function fetchComments(postId) {
    const user = await getSessionUser()
    if (!user) return

    const response = await fetch(`${API_URL}/wp-json/app/v1/get-post-comments`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_id: user.id,
            post_id: postId
        }),
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
        body: JSON.stringify({
            user_id: user.id,
            post_id: postId
        }),
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
        body: JSON.stringify({
            user_id: user.id,
            post_id: postId,
            comment,
            parent_id: comment_id
        }),
    })

    const data = await response.json()
    return data
}

export const deleteComment = async (commentId) => {
    const user = await getSessionUser()
    if (!user) return

    const response = await fetch(`${API_URL}/wp-json/app/v1/delete-post-comment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_id: user.id,
            comment_id: commentId
        }),
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
            body: JSON.stringify({
                user_id: user.id,
                comment_id: commentId,
                owner_id: ownerId
            }),
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

export const getPostsForUser = async (profileId, page = 1, tagged = false, limit = 10) => {
    const response = await fetch(`${API_URL}/wp-json/app/v1/get-user-posts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_id: profileId,
            page,
            limit,
            tagged
        }),
    })

    const data = await response.json()
    if (response.status !== 200) {
        return {
            data: [],
            total_pages: 0,
            page: 1,
            limit
        }
    }

    return data
}

export const getPostById = async (post_id) => {
    const user = await getSessionUser()
    if (!user) return

    try {
        const response = await fetch(`${API_URL}/wp-json/app/v1/get-post`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: user.id,
                post_id
            }),
        })
        const data = await response.json()
        return data
    } catch (error) {
        return null
    }
}

export const deletePost = async (post_id) => {
    const user = await getSessionUser()
    if (!user) return

    try {
        const response = await fetch(`${API_URL}/wp-json/app/v1/delete-post`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: user.id,
                post_id
            }),
        })

        if (response.status !== 200) {
            throw new Error("Error deleting post")
        }

        return true
    } catch (error) {
        return false
    }
}