import {
    getSessionUser,
    getUserById
} from "./api/auth.js"
import {
    getUserGarage
} from "./api/garage.js"
import {
    maybeFollowUser
} from "./api/profile.js"
import app from "./app.js"
import {
    createGarageContent,
    displayProfile,
    fillGridWithPosts
} from "./profile.js"
import store from "./store.js"

var $ = Dom7

var totalPostPages = 1
var totalFPostPages = 1
var currentPostPage = 1
var currentFPostPage = 1

var isFetchingPosts = false
var refreshed = false;

var userId = null

$(document).on('page:init', '.page[data-name="profile-view"]', async function (e) {
    userId = e.detail.route.params.id

    currentPostPage = 1
    currentFPostPage = 1
    isFetchingPosts = false
    refreshed = false

    store.dispatch('getUserPosts', {
        user_id: userId,
        clear: true
    })

    store.dispatch('getUserTags', {
        user_id: userId,
        clear: true
    })
})

$(document).on('page:beforein', '.page[data-name="profile-view"]', async function (e) {
    $('.loading-fullscreen').show()

    var pathStore = store.getters.getPathData
    userId = e.detail.route.params.id

    const sessionUser = await getSessionUser()

    if (!sessionUser || !sessionUser.id) {
        return;
    }

    // Follow button
    const followButton = $('.user-follow-btn')
    const sessionFollowings = sessionUser.following;

    if (sessionFollowings.includes(`${userId}`)) {
        followButton.text('Following')
    } else {
        followButton.text('Follow')
    }

    followButton.attr('data-user-id', userId)

    let cachedData = null
    try {
        if (pathStore && pathStore.value[`/user/${userId}`]) {
            cachedData = pathStore.value[`/user/${userId}`]
        }
    } catch (error) {
        console.error('Error fetching cached data:', error)
    }

    await renderProfileData(cachedData, userId)
})

$(document).on('click', '.user-follow-btn', async function () {
    const followButton = $(this)
    const isFollowing = followButton.text() === 'Following'

    // change the button text
    followButton.text(isFollowing ? 'Follow' : 'Following')
    const response = await maybeFollowUser(followButton.attr('data-user-id'))

    if (response && response.success) {
        store.dispatch('updateUserDetails', {
            external: true
        })
    }
})

async function renderProfileData(cachedData, userId) {
    // if (!refreshed && !cachedData) {
    // }

    refreshed = false

    if (!cachedData) {
        const data = await getUserById(userId)
        console.log('User data:', data);

        if (!data || data.error) {
            $('.loading-fullscreen').hide()
            app.dialog.alert('User not found', 'Error')

            view.router.back(view.history[0], {
                force: true
            })
            return
        }

        const garage = await getUserGarage(userId)

        if (garage) {
            createGarageContent(garage, '.pview-current-vehicles-list', '.pview-past-vehicles-list')
        }

        // Assuming `path` is a dynamic path like '/garage/2'
        store.dispatch('setPathData', {
            path: `/user/${userId}`,
            data: {
                user: data.user,
                garage: garage,
            },
        })

        displayProfile(data.user, 'profile-view')
    } else {
        displayProfile(cachedData.user, 'profile-view')

        if (cachedData.garage) {
            createGarageContent(cachedData.garage, '.pview-current-vehicles-list', '.pview-past-vehicles-list')
        }
    }

    $('.loading-fullscreen').hide()
}

function populateUsersPosts(data) {
    if (data) {
        const postsKey = `user-${userId}-posts`
        const tagsKey = `user-${userId}-tags`

        // Handle posts
        if (data[postsKey]) {
            totalPostPages = data[postsKey].total_pages || 0

            let reset = data[postsKey].cleared || false

            console.log(reset);

            // Only update the DOM if there are new posts
            if (data[postsKey].new_data && data[postsKey].new_data.length > 0) {
                fillGridWithPosts(data[postsKey].new_data, 'profile-view-grid-posts', reset)
                // Clear new_data after processing to avoid re-rendering

                data[postsKey].new_data = []
            }

            if ((data[postsKey].page === totalPostPages) || (totalPostPages == 0)) {
                // hide preloader
                $('.infinite-scroll-preloader.posts-tab.view-profile').hide()
            }

            if (data[postsKey].data.length === 0) {
                const profileGrid = document.getElementById('profile-view-grid-posts')
                profileGrid.innerHTML = '<p>No posts</p>'
                return;
            }

        }

        // Handle tags
        if (data[tagsKey]) {
            totalFPostPages = data[tagsKey].total_pages || 0

            let reset = data[tagsKey].cleared || false

            // Only update the DOM if there are new tags
            if (data[tagsKey].new_data && data[tagsKey].new_data.length > 0) {
                fillGridWithPosts(data[tagsKey].new_data, 'profile-view-grid-tags', reset)
                // Clear new_data after processing to avoid re-rendering
                data[tagsKey].new_data = []
            }

            if ((data[tagsKey].page === totalFPostPages) || (totalFPostPages == 0)) {
                // hide preloader
                $('.infinite-scroll-preloader.tags-tab.view-profile').hide()
            }

            if (data[tagsKey].data.length === 0) {
                const profileGrid = document.getElementById('profile-view-grid-tags')
                profileGrid.innerHTML = '<p>No tagged posts</p>'
                return;
            }

        }
    }
}

store.getters.getUserPathUpdated.onUpdated(() => {
    const data = store.getters.getUserPathData.value
    populateUsersPosts(data)
})

$(document).on('infinite', '.profile-landing-page.infinite-scroll-content.view-page', async function (e) {
    if (isFetchingPosts) return

    const activeTab = document.querySelector('.profile-tabs .tab-link-active')
    const activeTabId = activeTab.id

    if (!activeTabId || activeTabId === 'my-garage') return

    const getterFunc = activeTabId === 'my-posts' ? 'getUserPosts' : 'getUserTags'

    isFetchingPosts = true

    if (activeTabId === 'my-posts') {
        currentPostPage++
        if (currentPostPage <= totalPostPages) {
            await store.dispatch(getterFunc, {
                user_id: userId,
                page: currentPostPage
            })
            isFetchingPosts = false
        }
    } else {
        currentFPostPage++

        if (currentFPostPage <= totalFPostPages) {
            await store.dispatch(getterFunc, {
                user_id: userId,
                page: currentFPostPage
            })
            isFetchingPosts = false
        }
    }
})

$(document).on('ptr:refresh', '.profile-landing-page.view-page.ptr-content', async function (e) {
    try {
        currentPostPage = 1
        currentFPostPage = 1

        store.dispatch('removePathData', `/user/${userId}`)

        await renderProfileData(null, userId)

        store.dispatch('getUserPosts', {
            user_id: userId,
            clear: true
        })

        store.dispatch('getUserTags', {
            user_id: userId,
            clear: true
        })

        refreshed = true
    } catch (error) {
        console.log('Error refreshing profile page:', error);
    }

    app.ptr.get('.profile-landing-page.view-page.ptr-content').done()
})