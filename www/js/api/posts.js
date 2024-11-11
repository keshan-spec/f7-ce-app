import {
    API_URL,
    TIMEOUT_MS_LOW
} from './consts.js'
import {
    getSessionUser
} from './auth.js'

export async function fetchPosts(page, following = false) {
    const controller = new AbortController()
    const signal = controller.signal

    try {
        const user = await getSessionUser()
        if (!user || !user.id) return

        const queryParams = new URLSearchParams({
            user_id: user.id,
            following_only: following ? 1 : 0,
            page: page,
            limit: 10
        }).toString();

        const response = await fetch(`${API_URL}/wp-json/app/v2/get-posts?${queryParams}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            signal // Abort signal
        });

        const data = await response.json()
        return data
    } catch (error) {
        console.log(error);

        return {}
    }
}

export async function fetchComments(postId) {
    const controller = new AbortController()
    const signal = controller.signal

    try {
        const user = await getSessionUser()
        if (!user) return

        setTimeout(() => {
            controller.abort()
        }, TIMEOUT_MS_LOW)

        const response = await fetch(`${API_URL}/wp-json/app/v1/get-post-comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: user.id,
                post_id: postId
            }),
            signal
        })

        const data = await response.json()
        return data
    } catch (error) {
        if (error.name === 'AbortError') {
            throw {
                message: "Failed to fetch comments, your connection timed out",
                name: "TimeOutError"
            };
        } else {
            throw error; // Rethrow any other errors
        }
    }
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
    const controller = new AbortController()
    const signal = controller.signal

    try {
        const user = await getSessionUser()
        if (!user) return

        setTimeout(() => {
            controller.abort()
        }, TIMEOUT_MS_LOW)

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
            signal
        })

        const data = await response.json()
        return data
    } catch (error) {
        if (error.name === 'AbortError') {
            throw {
                message: "Failed to add comment, your connection timed out",
                name: "TimeOutError"
            };
        } else {
            throw error; // Rethrow any other errors
        }
    }
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

    const queryParams = new URLSearchParams({
        user_id: profileId,
        tagged: tagged ? 1 : 0,
        page: page,
        limit: 10
    }).toString();

    const response = await fetch(`${API_URL}/wp-json/app/v2/get-user-posts?${queryParams}`, {
        method: "GET",
        cache: "force-cache",
        headers: {
            "Content-Type": "application/json",
        },
        // body: JSON.stringify({
        //     user_id: profileId,
        //     page,
        //     limit,
        //     tagged
        // }),
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
    if (!user || !user.id) return null

    try {
        const response = await fetch(`${API_URL}/wp-json/app/v2/get-post?post_id=${post_id}&user_id=${user.id}`, {
            method: "GET",
            cache: "force-cache",
            headers: {
                "Content-Type": "application/json",
            },
            // body: JSON.stringify({
            //     user_id: user.id,
            //     post_id
            // }),
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

/**
 * @param {Object} data {
     post_id: string | number;
     new_tags: PostTag[];
     removed_tags: number[];
     caption ? : string;
     location ? : string;
 }
 */
export const updatePost = async (data) => {
    try {
        const user = await getSessionUser();
        if (!user || !user.id) return null;

        const response = await fetch(`${API_URL}/wp-json/app/v1/edit-post`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: user.id,
                ...data
            }),
        });

        const res = await response.json();
        return res;
    } catch (e) {
        console.error("Error updating post", e.message);
        return null;
    }
};