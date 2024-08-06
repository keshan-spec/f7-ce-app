
const API_URL = 'https://wordpress-889362-4267074.cloudwaysapps.com/uk'

export async function fetchPosts(page) {
    const response = await fetch(`${API_URL}/wp-json/app/v1/get-posts?page=${page}&limit=10`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: 1 }),
    })

    const data = await response.json()
    return data
}

export async function fetchComments(postId) {
    const response = await fetch(`${API_URL}/wp-json/app/v1/get-post-comments`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: 1, post_id: postId }),
    })

    const data = await response.json()
    return data
}

export const maybeLikePost = async (postId) => {
    const response = await fetch(`${API_URL}/wp-json/app/v1/toggle-like-post`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: 1, post_id: postId }),
    })
    const data = await response.json()
    return data
}

export const addComment = async (postId, comment, comment_id=null) => {
    const response = await fetch(`${API_URL}/wp-json/app/v1/add-post-comment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: 1, post_id: postId, comment, parent_id: comment_id }),
    })

    const data = await response.json()
    return data
}

export const maybeLikeComment = async (commentId, ownerId) => {
    try {
        const response = await fetch(`${API_URL}/wp-json/app/v1/toggle-like-comment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: 1, comment_id: commentId, owner_id: ownerId }),
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