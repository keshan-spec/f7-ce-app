
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
    document.getElementById('comments-list').innerHTML = '<div class="preloader"></div>'

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