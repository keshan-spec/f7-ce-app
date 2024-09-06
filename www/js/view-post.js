import app from "./app.js"
import {
  getPostById
} from "./api/posts.js"
import {
  detectDoubleTapClosure,
  togglePostLike
} from "./homepage.js"
import {
  formatPostDate
} from "./utils.js"
import store from "./store.js"
var $ = Dom7

function displayPost(post) {
  const postsContainer = document.getElementById('post-view-container')
  postsContainer.innerHTML = '' // Clear any existing posts

  const user = store.getters.user.value

  let post_actions = `
     <div class="media-post-actions">
        <div class="media-post-like" data-post-id="${post.id}">
          <i class="icon f7-icons ${post.is_liked ? 'text-red' : ''}" data-post-id="${post.id}">${post.is_liked ? 'heart_fill' : 'heart'}</i>
        </div>
        <div class="media-post-comment popup-open" data-popup=".comments-popup" data-post-id="${post.id}">
          <i class="icon f7-icons">chat_bubble</i>
        </div>
        <div class="media-post-share popup-open" data-popup=".share-popup">
          <i class="icon f7-icons">paperplane</i>
        </div>
    `

  if (post.user_id == user.id) {
    post_actions += `
        <div class="media-post-edit popup-open" data-popup=".edit-post-popup" data-post-id="${post.id}">
          <i class="icon f7-icons">gear_alt</i>
        </div>
      `
  }

  post_actions += `</div>`

  const date = formatPostDate(post.post_date)
  const maxDescriptionLength = 10; // Set your character limit here
  const isLongDescription = post.caption.length > maxDescriptionLength;
  const shortDescription = isLongDescription ? post.caption.slice(0, maxDescriptionLength) : post.caption;
  let imageHeight = 400;

  if (post.media.length > 0) {
    imageHeight = post.media[0].media_height;

    if (imageHeight > 800) {
      imageHeight = 'auto';
    }
  }

  let profile_link;

  if (post.user_id == user.id) {
    profile_link = `
      <a href="#" class="view-profile">
        <div class="media-post-avatar" style="background-image: url('${post.user_profile_image || 'assets/img/profile-placeholder.jpg'}');"></div>
        <div class="media-post-user">${post.username}</div>
      </a>`
  } else {
    profile_link = `
      <a href="/profile-view/${post.user_id}">
        <div class="media-post-avatar" style="background-image: url('${post.user_profile_image || 'assets/img/profile-placeholder.jpg'}');"></div>
        <div class="media-post-user">${post.username}</div>
      </a>`
  }

  const postItem = `
  <div class="media-post single" data-post-id="${post.id}" data-is-liked="${post.is_liked}">
            <div class="media-single-post-content">
            <div class="media-post-header">
                ${profile_link}
                <div class="media-post-date">${date}</div>
              </div>
              <div class="media-single-post-content">
                <div class="swiper-container">
                  <div class="swiper-wrapper">
                    ${post.media.map(mediaItem => `
                       <div class="swiper-slide post-media" style="height: ${imageHeight};">
                        ${mediaItem.media_type === 'video' ? `
                          <video autoplay loop muted playsinline class="video-background media-post-video" id="${mediaItem.id}">
                            <source src="${mediaItem.media_url}" type="${mediaItem.media_mime_type}" />
                          </video>
                        ` : `
                          <img src="${mediaItem.media_url}" alt="${mediaItem.media_alt}" />
                        `}
                      </div>
                    `).join('')}
                  </div>
                  <div class="swiper-pagination"></div>
                </div>
              </div>
              ${post_actions}
              <div class="media-post-likecount" data-like-count="${post.likes_count}">${post.likes_count} likes</div>
              <div class="media-post-description">
                <strong>${post.username}</strong> <br/> <span class="post-caption">${shortDescription}</span>
                <span class="full-description hidden">${post.caption}</span>
                ${isLongDescription ? `<span class="media-post-readmore">... more</span>` : ''}
              </div>
              ${post.comments_count > 0 ? `<div class="media-post-commentcount popup-open" data-popup=".comments-popup" data-post-id="${post.id}">View ${post.comments_count} comments</div>` : ''}
            </div>
          </div>`

  postsContainer.insertAdjacentHTML('beforeend', postItem)
}

// $(document).on('touchstart', '.media-single-post-content .swiper-wrapper', detectDoubleTapClosure((e) => {
//   const parent = e.closest('.media-post')
//   const postId = parent.getAttribute('data-post-id')
//   const isLiked = parent.getAttribute('data-is-liked') === 'true'

//   if (isLiked) {
//     return
//   }

//   togglePostLike(postId, true)
// }), {
//   passive: false
// })

$(document).on('page:beforein', '.page[data-name="post-view"]', async function (e) {
  var pathStore = store.getters.getPathData

  var postId = e.detail.route.params.id

  if (!postId || postId === '-1') {
    return
  }

  let cachedData = null

  try {
    if (pathStore && pathStore.value[`/post/${postId}`]) {
      cachedData = pathStore.value[`/post/${postId}`]
    }
  } catch (error) {
    console.error('Error fetching cached data:', error)
  }

  if (!cachedData) {
    $('.loading-fullscreen').show()

    const post = await getPostById(postId)
    if (!post) {
      app.dialog.alert('Post not found', 'Error')
      return
    }

    store.dispatch('setPathData', {
      path: `/post/${postId}`,
      data: post,
    })

    cachedData = post
  } else {
    $('.loading-fullscreen').hide()
  }

  displayPost(cachedData)
})