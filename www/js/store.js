import {
  getNotificationCount,
  getSessionUser,
  getUserDetails,
  getUserNotifications,
  markMultipleNotificationsAsRead
} from './api/auth.js'
import {
  sendRNMessage
} from './api/consts.js'
import {
  fetchTrendingEvents,
  fetchTrendingUsers,
  fetchTrendingVenues,
  fetchEventCats
} from './api/discover.js'
import {
  getPostsForGarage,
  getUserGarage
} from './api/garage.js'
import {
  fetchPosts,
  getPostsForUser
} from './api/posts.js'

var createStore = Framework7.createStore

const DEFAULT_SEARCH_RESULTS = {
  events: {
    data: [],
    total_pages: 0,
    page: 1,
    limit: 10,
  },
  users: {
    data: [],
    total_pages: 0,
    page: 1,
    limit: 10,
  },
  venues: {
    data: [],
    total_pages: 0,
    page: 1,
    limit: 10,
  },
  top_results: {
    events: [],
    users: [],
    venues: [],
  },
  success: false,
}

const DEFAULT_PAGINATED_DATA = {
  data: [],
  new_data: [],
  total_pages: 0,
  page: 1,
  limit: 10,
}

const store = createStore({
  state: {
    user: null,
    posts: {
      new_data: [],
      data: [],
      total_pages: 0,
      page: 1,
      limit: 10,
    },
    following_posts: {
      new_data: [],
      data: [],
      total_pages: 0,
      page: 1,
      limit: 10,
    },
    registerData: {
      user_id: '',
      email: '',
      password: '',
      username: '',
    },
    myGarage: [],
    myPosts: {
      new_data: [],
      data: [],
      total_pages: 0,
      page: 1,
      limit: 10,
    },
    myTags: {
      new_data: [],
      data: [],
      total_pages: 0,
      page: 1,
      limit: 10,
    },
    garageViewPosts: {
      data: [],
      total_pages: 0,
      page: 1,
      limit: 10,
    },
    garageViewTags: {
      data: [],
      total_pages: 0,
      page: 1,
      limit: 10,
    },
    scannedData: null,
    scanningQrCode: false,
    paths: {}, // Object to store unique paths and their data
    userPaths: {}, // Object to store unique user paths and their data
    userPathsUpdated: false,
    notifications: [],
    // discover page
    trendingEvents: [],
    trendingVenues: [],
    eventCategories: [],
    filteredEvents: {
      data: [],
      total_pages: 0,
      page: 1,
      limit: 10,
    },
    filteredVenues: {
      data: [],
      total_pages: 0,
      page: 1,
      limit: 10,
    },
    discoverSearchData: DEFAULT_SEARCH_RESULTS,
    trendingUsers: DEFAULT_PAGINATED_DATA,
    // Search results
    searchResults: DEFAULT_SEARCH_RESULTS,
    notificationCount: 0,
    poorNetworkError: false,
  },
  getters: {
    checkPoorNetworkError({
      state
    }) {
      return state.poorNetworkError
    },
    getNotifCount({
      state
    }) {
      return state.notificationCount
    },
    getTrendingUsers({
      state
    }) {
      return state.trendingUsers
    },
    getSearchResults({
      state
    }) {
      return state.searchResults
    },
    getFilteredEvents({
      state
    }) {
      return state.filteredEvents
    },
    getFilteredVenues({
      state
    }) {
      return state.filteredVenues
    },
    getEventCategories({
      state
    }) {
      return state.eventCategories
    },
    getTrendingEvents({
      state
    }) {
      return state.trendingEvents
    },
    getTrendingVenues({
      state
    }) {
      return state.trendingVenues
    },
    getPathData({
      state
    }) {
      return state.paths
    },
    getUserPathUpdated({
      state
    }) {
      return state.userPathsUpdated
    },
    getUserPathData({
      state
    }) {
      return state.userPaths
    },
    getGarageViewPosts({
      state
    }) {
      return state.garageViewPosts
    },
    getGarageViewTags({
      state
    }) {
      return state.garageViewTags
    },
    user({
      state
    }) {
      return state.user
    },
    getRegisterData({
      state
    }) {
      return state.registerData
    },
    isAuthenticated({
      state
    }) {
      return !!state.user
    },
    posts({
      state
    }) {
      return state.posts
    },
    followingPosts({
      state
    }) {
      return state.following_posts
    },
    myGarage({
      state
    }) {
      return state.myGarage
    },
    myPosts({
      state
    }) {
      return state.myPosts
    },
    myTags({
      state
    }) {
      return state.myTags
    },
    scannedData({
      state
    }) {
      return state.scannedData
    },
    isScanningQrCode({
      state
    }) {
      return state.scanningQrCode
    },
    getNotifications({
      state
    }) {
      return state.notifications
    },
  },
  actions: {
    updatePost({
      state
    }, {
      post_id,
      caption
    }) {
      // loop through the posts and find the post with the post_id
      const posts = state.posts.data
      const post = posts.find(p => p.id == post_id)

      const myPosts = state.myPosts.data
      const myPost = myPosts.find(p => p.id == post_id)

      // update the post with the new data
      if (post) {
        // update the post with the new data
        post.caption = caption
        // update the state with the new posts
        state.posts = {
          ...state.posts,
          data: posts,
        }
      }

      if (myPost) {
        myPost.caption = caption

        state.myPosts = {
          ...state.myPosts,
          data: myPosts,
        }
      }
    },
    markNotificationsAsRead({
      state
    }, notification_ids) {
      markMultipleNotificationsAsRead(notification_ids)
      state.notificationCount = 0
    },
    async notificationCount({
      state
    }) {
      const response = await getNotificationCount()
      state.notificationCount = response.count
    },
    setSearchResults({
      state
    }, payload) {
      state.searchResults = payload
    },
    async filterEvents({
      state
    }, {
      filters,
      page = 1
    }) {
      try {
        const events = await fetchTrendingEvents(page, true, filters)

        const data = {
          new_data: events.data,
          data: [
            ...state.filteredEvents.data,
            ...events.data,
          ],
          total_pages: events.total_pages,
          page: page,
          limit: events.limit,
        }

        state.filteredEvents = data
      } catch (error) {
        console.error('Failed to filter events', error)
        state.filteredEvents = {
          new_data: [],
          data: [],
          total_pages: 0,
          page: 1,
          limit: 10,
        }
      }
    },
    async filterTrendingUsers({
      state
    }, page = 1) {
      try {
        const response = await fetchTrendingUsers(page)

        const data = {
          new_data: response.data,
          data: [
            ...state.trendingUsers.data,
            ...response.data,
          ],
          total_pages: response.total_pages,
          page: page,
          limit: response.limit,
        }

        state.trendingUsers = data
      } catch (error) {
        console.log('Failed to fetch trending users', error);
        state.trendingUsers = {
          new_data: [],
          data: [],
          total_pages: 0,
          page: 1,
          limit: 10,
        }
      }
    },
    async filterVenues({
      state
    }, {
      filters,
      page = 1
    }) {
      try {
        const events = await fetchTrendingVenues(page, true, filters)

        let existingVenues = state.filteredVenues.data.length > 0 ? state.filteredVenues.data : state.trendingVenues.data

        const data = {
          new_data: events.data,
          data: [
            ...existingVenues,
            ...events.data,
          ],
          total_pages: events.total_pages,
          page: page,
          limit: events.limit,
        }

        state.filteredVenues = data
      } catch (error) {
        console.error('Failed to filter venues', error)
        state.filteredVenues = {
          new_data: [],
          data: [],
          total_pages: 0,
          page: 1,
          limit: 10,
        }
      }
    },
    async fetchEventCategories({
      state
    }) {
      const categories = await fetchEventCats()

      state.eventCategories = categories
    },
    async getTrendingEvents({
      state
    }) {
      const events = await fetchTrendingEvents(1, false)
      state.trendingEvents = events
    },
    async getTrendingVenues({
      state
    }) {
      const venues = await fetchTrendingVenues(1, false)
      state.trendingVenues = venues
    },
    async fetchNotifications({
      state
    }) {
      const notifications = await getUserNotifications()
      state.notifications = notifications
    },
    async getUserPosts({
      state
    }, {
      user_id,
      page = 1,
      clear = false
    }) {
      const posts = await getPostsForUser(user_id, page)

      let prevUserPosts = {
        data: []
      }

      if (!clear) {
        if (state.userPaths[`user-${user_id}-posts`]) {
          prevUserPosts = state.userPaths[`user-${user_id}-posts`]
        }
      }

      const data = {
        new_data: posts.data,
        data: [
          ...prevUserPosts.data,
          ...posts.data,
        ],
        total_pages: posts.total_pages,
        page: page,
        limit: posts.limit,
        cleared: clear,
      }

      state.userPaths[`user-${user_id}-posts`] = data
      state.userPathsUpdated = true
    },
    async getUserTags({
      state
    }, {
      user_id,
      page = 1,
      clear = false
    }) {
      const posts = await getPostsForUser(user_id, page, true)

      let prevUserPosts = {
        data: []
      }
      if (!clear) {
        if (state.userPaths[`user-${user_id}-tags`]) {
          prevUserPosts = state.userPaths[`user-${user_id}-tags`]
        }
      }

      const data = {
        new_data: posts.data,
        data: [
          ...prevUserPosts.data,
          ...posts.data,
        ],
        total_pages: posts.total_pages,
        page: page,
        limit: posts.limit,
        cleared: clear,
      }

      state.userPaths[`user-${user_id}-tags`] = data
      state.userPathsUpdated = true
    },
    clearPathData({
      state
    }) {
      state.paths = {}
    },
    setPathData({
      state
    }, {
      path,
      data
    }) {
      // Ensure the path key exists
      if (!state.paths[path]) {
        state.paths[path] = {}
      }

      // Update the data for the given path
      state.paths[path] = {
        ...state.paths[path],
        ...data,
      }
    },
    removePathData({
      state
    }, path) {
      if (state.paths[path]) {
        delete state.paths[path]
      }
    },
    async login({
      state
    }, {
      token
    }) {
      try {
        const userDetails = await getUserDetails(token)

        if (!userDetails || !userDetails.success) {
          window.localStorage.removeItem('token')
          throw new Error('User not found')
        }

        window.localStorage.setItem('token', token)
        state.user = userDetails.user

        setTimeout(() => {
          sendRNMessage({
            type: "authData",
            user_id: userDetails.user.id,
            page: 'auth',
          })
        }, 1000)
      } catch (error) {
        console.error('Login failed', error)
      }
    },
    logout({
      state
    }) {
      state.user = null
      window.localStorage.removeItem('token')
    },
    async updateUserDetails({
      state
    }, external = false) {
      const token = window.localStorage.getItem('token')

      if (!token) {
        return this.logout()
      }

      try {
        const userDetails = await getUserDetails(token)

        if (!userDetails || !userDetails.success) {
          window.localStorage.removeItem('token')
          throw new Error('User not found')
        }

        window.localStorage.setItem('token', token)
        state.user = {
          ...userDetails.user,
          refreshed: true,
          external_refresh: external,
        }
      } catch (error) {
        console.error('Login failed', error)
      }
    },
    async checkAuth(context) {
      const token = await getSessionUser()

      if (token) {
        await context.dispatch('login', {
          token: token
        })
      } else {
        window.localStorage.removeItem('token')
      }
    },
    async getPosts({
      state
    }, page = 1) {
      try {
        const posts = await fetchPosts(page)

        const data = {
          new_data: posts.data,
          data: [
            ...state.posts.data,
            ...posts.data,
          ],
          total_pages: posts.total_pages,
          page: page,
          limit: posts.limit,
        }

        state.posts = data
      } catch (error) {
        console.error('Failed to fetch posts', error)

        if (error.name === 'RequestTimeout') {
          state.poorNetworkError = true
        }

        state.posts = {
          new_data: [],
          data: [],
          total_pages: 0,
          page: 1,
          limit: 10,
        }
      }
    },
    async setGarageViewPosts({
      state
    }, garage_id, page = 1) {
      const posts = await getPostsForGarage(garage_id, page)

      let prevData = state.garageViewPosts.data

      if (page === 1) {
        prevData = []
      }

      const data = {
        data: [
          ...prevData,
          ...posts.data,
        ],
        total_pages: posts.total_pages,
        page: page,
        limit: posts.limit,
      }

      state.garageViewPosts = data
    },
    async setGarageViewTags({
      state
    }, garage_id, page = 1) {
      const posts = await getPostsForGarage(garage_id, page, true)

      let prevData = state.garageViewTags.data

      if (page === 1) {
        prevData = []
      }

      const data = {
        data: [
          ...prevData,
          ...posts.data,
        ],
        total_pages: posts.total_pages,
        page: page,
        limit: posts.limit,
      }

      state.garageViewTags = data
    },
    async getFollowingPosts({
      state
    }, page = 1) {
      try {
        const posts = await fetchPosts(page, true)

        const data = {
          new_data: posts.data,
          data: [
            ...state.following_posts.data,
            ...posts.data,
          ],
          total_pages: posts.total_pages,
          page: page,
          limit: posts.limit,
        }

        state.following_posts = data
      } catch (error) {
        console.error('Failed to fetch following posts', error)

        if (error.name === 'RequestTimeout') {
          state.poorNetworkError = true
        }

        state.following_posts = {
          new_data: [],
          data: [],
          total_pages: 0,
          page: 1,
          limit: 10,
        }
      }
    },
    async setRegisterData({
      state
    }, {
      email,
      password,
      username,
      user_id
    }) {
      state.registerData = {
        email: email,
        password: password,
        username: username,
        user_id: user_id,
      }
    },
    async getMyGarage({
      state
    }) {
      const garage = await getUserGarage(state.user.id)
      state.myGarage = garage
    },
    async getMyPosts({
      state
    }, {
      page = 1,
      clear = false
    }) {
      const posts = await getPostsForUser(state.user.id, page)

      if (clear) {
        state.myPosts = {
          new_data: posts.data,
          data: posts.data,
          total_pages: posts.total_pages || 0,
          page: page,
          limit: posts.limit || 10,
          cleared: true,
        }
        return
      }

      const data = {
        new_data: posts.data,
        data: [
          ...state.myPosts.data,
          ...posts.data,
        ],
        total_pages: posts.total_pages,
        page: page,
        limit: posts.limit,
      }

      state.myPosts = data
    },
    async getMyTags({
      state
    }, {
      page = 1,
      clear = false
    }) {
      const posts = await getPostsForUser(state.user.id, page, true)

      if (clear) {
        state.myTags = {
          new_data: posts.data,
          data: posts.data,
          total_pages: posts.total_pages || 0,
          page: page,
          limit: posts.limit || 10,
          cleared: true,
        }
        return
      }

      const data = {
        new_data: posts.data,
        data: [
          ...state.myTags.data,
          ...posts.data,
        ],
        total_pages: posts.total_pages,
        page: page,
        limit: posts.limit,
      }

      state.myTags = data
    },
    setScannedData({
      state
    }, data) {
      state.scannedData = data
    },
    setScanningQrCode({
      state
    }, value) {
      state.scanningQrCode = value
    },
  },
})

export default store