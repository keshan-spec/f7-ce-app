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

$(document).on('page:afterin', '.page[data-name="profile-view"]', async function (e) {
    var view = app.views.current
    var userId = e.detail.route.params.id

    const sessionUser = await getSessionUser()
    if (sessionUser.id == userId) {
        $('.tab-link[href="#view-profile"]').click()
        return
    }

    // Infinite Scroll
    const infiniteScrollContent = document.querySelector('.profile-landing-page.infinite-scroll-content.view-page')

    infiniteScrollContent.addEventListener('infinite', async function () {
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

    // Follow button
    const followButton = $('.user-follow-btn')
    const sessionFollowings = sessionUser.following;

    if (sessionFollowings.includes(`${userId}`)) {
        followButton.text('Following')
    } else {
        followButton.text('Follow')
    }

    followButton.attr('data-user-id', userId)

    const data = await getUserById(userId)
    if (!data || data.error) {
        app.dialog.alert('User not found', 'Error')
        view.router.back(view.history[0], {
            force: true
        })
        return
    }


    displayProfile(data.user, 'profile-view')
    const garage = await getUserGarage(userId)
    if (garage) {
        createGarageContent(garage, '.pview-current-vehicles-list', '.pview-past-vehicles-list')
    }

    store.dispatch('getUserPosts', {
        user_id: userId
    })
    store.dispatch('getUserTags', {
        user_id: userId
    })

    store.getters.getUserPathUpdated.onUpdated(() => {
        const data = store.getters.getUserPathData.value

        if (data) {
            const postsKey = `user-${userId}-posts`
            const tagsKey = `user-${userId}-tags`

            // Handle posts
            if (data[postsKey]) {
                totalPostPages = data[postsKey].total_pages || 0

                // Only update the DOM if there are new posts
                if (data[postsKey].new_data && data[postsKey].new_data.length > 0) {
                    fillGridWithPosts(data[postsKey].new_data, 'profile-view-grid-posts')
                    // Clear new_data after processing to avoid re-rendering

                    data[postsKey].new_data = []
                }

                if ((data[postsKey].page === totalPostPages) || (totalPostPages == 0)) {
                    // hide preloader
                    $('.infinite-scroll-preloader.posts-tab.view-profile').hide()
                }
            }

            // Handle tags
            if (data[tagsKey]) {
                totalFPostPages = data[tagsKey].total_pages || 0

                // Only update the DOM if there are new tags
                if (data[tagsKey].new_data && data[tagsKey].new_data.length > 0) {
                    fillGridWithPosts(data[tagsKey].new_data, 'profile-view-grid-tags')
                    // Clear new_data after processing to avoid re-rendering
                    data[tagsKey].new_data = []
                }

                if ((data[tagsKey].page === totalFPostPages) || (totalFPostPages == 0)) {
                    // hide preloader
                    $('.infinite-scroll-preloader.tags-tab.view-profile').hide()
                }
            }
        }
    })
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