//------------------------------------------ CORE ------------------------------------------//
import store from './store.js'
import { fetchComments } from './api/posts.js'

var $ = Dom7
var currentPage = 1

var app = new Framework7({
  name: 'DriveLife',
  theme: 'ios',
  //theme: 'auto',
  cache: false,
  el: '#app', // App root element
  on: {
    init: function () {
      store.dispatch('getPosts', currentPage)
    },
  },
  // App store
  store: store,
  // App routes
  routes: routes,
})

//------------------------------------------ CUSTOM ------------------------------------------//
// Action Sheet with Grid Layout
var actionSheet = app.actions.create({
  grid: true,
  buttons: [
    [
      {
        text: '<div class="actions-grid-item">Add Post</div>',
        icon: '<img src="assets/img/actionsheet-img1.jpg" width="48" style="max-width: 100%; border-radius: 8px"/>',
        onClick: function () {
          app.dialog.alert('Button 1 clicked')
        }
      },
      {
        text: '<div class="actions-grid-item">Scan QR Code</div>',
        icon: '<img src="assets/img/actionsheet-img1.jpg" width="48" style="max-width: 100%; border-radius: 8px"/>',
        onClick: function () {
          app.dialog.alert('Button 2 clicked')
        }
      },
      {
        text: '<div class="actions-grid-item">Add Vehicle</div>',
        icon: '<img src="assets/img/actionsheet-img1.jpg" width="48" style="max-width: 100%; border-radius: 8px"/>',
        onClick: function () {
          app.dialog.alert('Button 3 clicked')
        }
      }
    ],
  ]
})

document.getElementById('open-action-sheet').addEventListener('click', function () {
  actionSheet.open()
})

// Init slider
app.swiper.create('.swiper-container', {
  speed: 400,
  spaceBetween: 0,
  observer: true,
  pagination: '.swiper-pagination'
})

var postsStore = store.getters.posts
var totalPages = 0;

postsStore.onUpdated((data)=> {
  totalPages = data.total_pages
  displayPosts(data.data)
})

// Infinite Scroll Event
const infiniteScrollContent = document.querySelector('.infinite-scroll-content')
infiniteScrollContent.addEventListener('infinite', function () {
  if (currentPage >= totalPages) {
    app.infiniteScroll.destroy(infiniteScrollContent)
    return
  }

  currentPage++
  store.dispatch('getPosts', currentPage)
})


//Comments Popup
var CommentsPopup = app.popup.create({
  el: '.comments-popup',
  swipeToClose: 'to-bottom'
});

function displayPosts(posts) {
  const postsContainer = document.getElementById('tab-latest')

  posts.forEach(post => {
    const post_actions = `
     <div class="media-post-actions">
        <div class="media-post-like">
          <i class="icon f7-icons ${post.is_liked && 'text-red'}">${post.is_liked ? 'heart_fill' : 'heart'}</i>
        </div>
        <div class="media-post-comment popup-open" data-popup=".comments-popup" data-post-id="${post.id}">
          <i class="icon f7-icons">chat_bubble</i>
        </div>
        <div class="media-post-share">
          <i class="icon f7-icons">paperplane</i>
        </div>
        <div class="media-post-edit">
          <i class="icon f7-icons">gear_alt</i>
        </div>
      </div>
    `

    const date = formatPostDate(post.post_date)
    const postItem = `
          <div class="media-post">
            <div class="media-post-content">
              <div class="media-post-header">
                <div class="media-post-avatar" style="background-image: url('${post.user_profile_image || 'assets/img/avatar1.jpg'}');"></div>
                <div class="media-post-user">${post.username}</div>
                <div class="media-post-date">${date}</div>
              </div>
              <div class="media-post-content">
                <div class="swiper-container">
                  <div class="swiper-wrapper">
                    ${post.media.map(mediaItem => `
                      <div class="swiper-slide">
                        ${mediaItem.media_type === 'video' ? `
                          <video autoplay loop muted playsinline class="video-background">
                            <source src ="${mediaItem.media_url}" type ="${mediaItem.media_mime_type}" />
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
              <div class="media-post-likecount">${post.likes_count} likes</div>
              <div class="media-post-description"><strong>${post.username}</strong> • ${post.caption}
                <span class="media-post-readmore">... more</span>
              </div>
              ${post.comments_count > 0 ? `<div class="media-post-commentcount popup-open" data-popup=".comments-popup" data-post-id="${post.id}">View ${post.comments_count} comments</div>` : ''}
            </div>
          </div>
        `
    postsContainer.insertAdjacentHTML('beforeend', postItem)
  })

  // Initialize swiper for the dynamically added content
  app.swiper.create('.swiper-container', {
    pagination: {
      el: '.swiper-pagination',
    },
  })
}

function displayComments(comments) {
  const commentsContainer = document.getElementById('comments-list')

  if (!comments.length) {
    commentsContainer.innerHTML = '<div class="no-comments">No comments found</div>'
    return
  }

  comments.forEach(comment => {
    const replyItems = comment.replies.length > 0 ? `
      <div class="comment-replies" data-comment-id="${comment.id}">
            <span class="comment-replies-toggle" data-replies-count="${comment.replies.length}">
            Show ${comment.replies.length} replies
            </span>
            <div class="comment-replies-container">
              ${comment.replies.map(reply => `
                <div class="comment">
                  <div class="comment-profile-img" style="background-image:url('${reply.profile_image}');"></div>
                  <div class="comment-content-container">
                    <div class="comment-username">${reply.display_name}</div>
                    <div class="comment-content">${reply.comment}</div>
                    <div class="comment-actions">
                      <div class="comment-like">
                        <i class="icon f7-icons ${reply.liked && 'text-red'}">${reply.liked ? 'heart_fill' : 'heart'}</i> <span>${reply.likes_count}</span>
                      </div>
                      <div class="comment-reply">
                        <i class="icon f7-icons">chat_bubble</i> <span>Reply</span>
                      </div>
                    </div>
                  </div>
                  <div class="clearfix"></div>
                </div>
              `).join('')}
            </div>
      </div>
    ` : ''

    const commentItem = `
      <div class="comment">
        <div class="comment-profile-img" style="background-image:url('${comment.profile_image}');"></div>
        <div class="comment-content-container">
          <div class="comment-username">${comment.display_name}</div>
          <div class="comment-content">${comment.comment}</div>
          <div class="comment-actions">
            <div class="comment-like">
              <i class="icon f7-icons ${comment.liked && 'text-red'}">${comment.liked ? 'heart_fill' : 'heart'}</i> <span>${comment.likes_count}</span>
            </div>
            <div class="comment-reply">
              <i class="icon f7-icons">chat_bubble</i> <span>Reply</span>
            </div>
          </div>
          ${replyItems}
        </div>
        <div class="clearfix"></div>
      </div>
    `
    commentsContainer.insertAdjacentHTML('beforeend', commentItem)
  })
}

function formatPostDate(date) {
  const postDate = new Date(date)
  // show date as Just now, 1 minute ago, 1 hour ago, 1 day ago, 1 week ago, 1 month ago, 1 year ago
  const currentDate = new Date()
  const diff = currentDate - postDate
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)

  if (months > 0) {
    return months === 1 ? '1 month ago' : `${months} months ago`
  }

  if (weeks > 0) {
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`
  }

  if (days > 0) {
    return days === 1 ? '1 day ago' : `${days} days ago`
  }

  if (hours > 0) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`
  }

  if (minutes > 0) {
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`
  }

  return 'Just now'
}

// on .popup-open click
$(document).on('click', '.popup-open', async function  () {
  const postId = this.getAttribute('data-post-id')
  const comments = await fetchComments(postId)
  displayComments(comments)
  CommentsPopup.open()
})

// on .comment-replies-toggle click
$(document).on('click', '.comment-replies-toggle', function () {
  const commentRepliesContainer = this.nextElementSibling
  commentRepliesContainer.classList.toggle('show')
  const repliesCount = this.getAttribute('data-replies-count')

  this.innerText = this.innerText === `Show ${repliesCount} replies` ? `Hide ${repliesCount} replies` : `Show ${repliesCount} replies`
})