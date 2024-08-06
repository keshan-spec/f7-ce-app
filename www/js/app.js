//------------------------------------------ CORE ------------------------------------------//

var $ = Dom7

var app = new Framework7({
  name: 'DriveLife',
  theme: 'ios',
  //theme: 'auto',
  cache: false,
  el: '#app', // App root element

  // App store
  store: store,
  // App routes
  routes: routes,
})



//------------------------------------------ CUSTOM ------------------------------------------//


//GLOBAL

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

//HOME (DISCOVER)

// Init slider
var swiper = app.swiper.create('.swiper-container', {
  speed: 400,
  spaceBetween: 0,
  observer: true,
  pagination: '.swiper-pagination'

})


//Comments Popup
var CommentsPopup = app.popup.create({
  el: '.comments-popup',
  swipeToClose: 'to-bottom'
});

// on document ready
$(document).on('page:init', function (e) {
  // do something on page init
  console.log('page init')
  fetchPosts(1)
})

let currentPage = 1
const limit = 10
const API_URL = 'https://wordpress-889362-4267074.cloudwaysapps.com/uk'
let totalPages = 40 // Initialize with a large value, update on first fetch

async function fetchPosts(page) {
  const response = await fetch(`${API_URL}/wp-json/app/v1/get-posts?page=${page}&limit=10`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: 1 }),
  })

  const data = await response.json();
  totalPages = data.total_pages
  displayPosts(data.data)
}

function displayPosts(posts) {
  const postsContainer = document.getElementById('tab-latest')

    // < source src = "${mediaItem.media_url}" type = "${mediaItem.media_mime_type}" />

  posts.forEach(post => {
    const postItem = `
          <div class="media-post">
            <div class="media-post-content">
              <div class="media-post-header">
                <div class="media-post-avatar" style="background-image: url('${post.user_profile_image || 'assets/img/avatar1.jpg'}');"></div>
                <div class="media-post-user">${post.username}</div>
                <div class="media-post-date">${post.post_date}</div>
              </div>
              <div class="media-post-content">
                <div class="swiper-container">
                  <div class="swiper-wrapper">
                    ${post.media.map(mediaItem => `
                      <div class="swiper-slide">
                        ${mediaItem.media_type === 'video' ? `
                          <video autoplay loop muted playsinline class="video-background">
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
              <div class="media-post-actions">
                <div class="media-post-like">
                  <i class="icon f7-icons">${post.is_liked ? 'heart_fill' : 'heart'}</i>
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
              <div class="media-post-likecount">${post.likes_count} likes</div>
              <div class="media-post-description"><strong>${post.username}</strong> • ${post.caption}
                <span class="media-post-readmore">... more</span>
              </div>
              <div class="media-post-commentcount popup-open" data-popup=".comments-popup" data-post-id="${post.id}">View ${post.comments_count} comments</div>
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

// Fetch initial posts when the page is initialized
document.addEventListener('DOMContentLoaded', () => {
  fetchPosts(currentPage)
})

// Infinite Scroll Event
const infiniteScrollContent = document.querySelector('.infinite-scroll-content')
infiniteScrollContent.addEventListener('infinite', function () {
  if (currentPage >= totalPages) {
    app.infiniteScroll.destroy(infiniteScrollContent)
    return
  }

  currentPage++
  fetchPosts(currentPage)
})

// on .popup-open click
$(document).on('click', '.popup-open', function () {
  const postId = this.getAttribute('data-post-id')
  fetchComments(postId)
  CommentsPopup.open()
})

async function fetchComments(postId) {
  document.getElementById('comments-list').innerHTML = '<div class="preloader"></div>'

  const response = await fetch(`${API_URL}/wp-json/app/v1/get-post-comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: 1, post_id: postId }),
  })

  const data = await response.json()

  displayComments(data)
}

function displayComments(comments) {
  const commentsContainer = document.getElementById('comments-list')

  comments.forEach(comment => {
    const replyItems = comment.replies.length > 0 ?`
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
                        <i class="icon f7-icons">${reply.liked ? 'heart_fill' : 'heart'}</i> <span>${reply.likes_count}</span>
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
              <i class="icon f7-icons">${comment.liked ? 'heart_fill' : 'heart'}</i> <span>${comment.likes_count}</span>
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

// on .comment-replies-toggle click
$(document).on('click', '.comment-replies-toggle', function () {
  const commentRepliesContainer = this.nextElementSibling
  commentRepliesContainer.classList.toggle('show')
  const repliesCount = this.getAttribute('data-replies-count')

  this.innerText = this.innerText === `Show ${repliesCount} replies` ? `Hide ${repliesCount} replies` : `Show ${repliesCount} replies`
})