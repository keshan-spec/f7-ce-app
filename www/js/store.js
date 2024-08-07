import { getSessionUser, getUserDetails, verifyUser } from './api/auth.js'
import { fetchPosts } from './api/posts.js'
var createStore = Framework7.createStore

const store = createStore({
  state: {
    user: null,
    posts: {
      data: [],
      total_pages: 0,
      page: 1,
      limit: 10,
    },
  },
  getters: {
    user({ state }) {
      return state.user
    },
    isAuthenticated({ state }) {
      return !!state.user
    },
    posts({ state }) {
      return state.posts
    },
  },
  actions: {
    async login({ state }, { id }) {
      try {
        const userDetails = await getUserDetails(id)

        if (!userDetails) {
          throw new Error('User not found')
        }

        state.user = userDetails.user
      } catch (error) {
        console.error('Login failed', error)
      }
    },
    logout({ state }) {
      state.user = null
    },
    async checkAuth({ state }) {
      const user = await getSessionUser()

      if (user) {
        state.user = user
      }
    },
    async getPosts({ state }, page = 1) {
      const posts = await fetchPosts(page)
      state.posts = posts
    },
  },
})

export default store