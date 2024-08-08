import { getSessionUser, getUserDetails } from './api/auth.js'
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
    registerData: {
      user_id: '',
      email: '',
      password: '',
      username: '',
    }
  },
  getters: {
    user({ state }) {
      return state.user
    },
    getRegisterData({ state }) {
      return state.registerData
    },
    isAuthenticated({ state }) {
      return !!state.user
    },
    posts({ state }) {
      return state.posts
    },
  },
  actions: {
    async login({ state }, { token }) {
      try {
        const userDetails = await getUserDetails(token)

        if (!userDetails || !userDetails.success) {
          window.localStorage.removeItem('token')
          throw new Error('User not found')
        }

        window.localStorage.setItem('token', token)
        state.user = userDetails.user
      } catch (error) {
        console.error('Login failed', error)
      }
    },
    logout({ state }) {
      state.user = null
      window.localStorage.removeItem('token')
    },
    async checkAuth(context) {
      const token = await getSessionUser()

      if (token) {
        await context.dispatch('login', { token: token })
      } else {
        window.localStorage.removeItem('token')
      }
    },
    async getPosts({ state }, page = 1) {
      const posts = await fetchPosts(page)

      const data = {
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
    async setRegisterData({ state }, { email, password, username, user_id }) {
      state.registerData = {
        email: email,
        password: password,
        username: username,
        user_id: user_id,
      }
    },
  },
})

export default store