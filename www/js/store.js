import {
  getSessionUser,
  getUserDetails,
  getUserNotifications
} from './api/auth.js'
import {
  sendRNMessage
} from './api/consts.js'
import {
  fetchTrendingEvents,
  fetchTrendingVenues,
  getEventCategories
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
    discoverSearchData: {
      data: [],
      total_pages: 0,
      page: 1,
      limit: 10,
    },
    // Search results
    searchResults: DEFAULT_SEARCH_RESULTS,
  },
  getters: {
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
    async filterVenues({
      state
    }, {
      filters,
      page = 1
    }) {
      try {
        const events = await fetchTrendingVenues(page, true, filters)

        const data = {
          new_data: events.data,
          data: [
            ...state.filteredVenues.data,
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
      const categories = await getEventCategories()

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
      page = 1
    }) {
      const posts = await getPostsForUser(user_id, page)

      let prevUserPosts = {
        data: []
      }

      if (state.userPaths[`user-${user_id}-posts`]) {
        prevUserPosts = state.userPaths[`user-${user_id}-posts`]
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
      }

      state.userPaths[`user-${user_id}-posts`] = data
      state.userPathsUpdated = true
    },
    async getUserTags({
      state
    }, {
      user_id,
      page = 1
    }) {
      const posts = await getPostsForUser(user_id, page, true)

      let prevUserPosts = {
        data: []
      }

      if (state.userPaths[`user-${user_id}-tags`]) {
        prevUserPosts = state.userPaths[`user-${user_id}-tags`]
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
    }) {
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
          refreshed: true
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
    }, page = 1) {
      const posts = await getPostsForUser(state.user.id, page)

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
    }, page = 1) {
      const posts = await getPostsForUser(state.user.id, page, true)

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