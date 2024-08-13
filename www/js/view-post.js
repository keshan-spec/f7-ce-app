import { getPostById } from "./api/posts.js"
import { formatPostDate } from "./utils.js"
var $ = Dom7

function displayPost(post) {
  const postsContainer = document.getElementById('post-view-container')
  postsContainer.innerHTML = '' // Clear any existing posts

  const post_actions = `
     <div class="media-post-actions">
        <div class="media-post-like" data-post-id="${post.id}">
          <i class="icon f7-icons ${post.is_liked ? 'text-red' : ''}">${post.is_liked ? 'heart_fill' : 'heart'}</i>
        </div>
        <div class="media-post-comment popup-open" data-popup=".comments-popup" data-post-id="${post.id}">
          <i class="icon f7-icons">chat_bubble</i>
        </div>
        <div class="media-post-share popup-open" data-popup=".share-popup">
          <i class="icon f7-icons">paperplane</i>
        </div>
        <div class="media-post-edit popup-open" data-popup=".edit-post-popup">
          <i class="icon f7-icons">gear_alt</i>
        </div>
      </div>
    `

  const date = formatPostDate(post.post_date)
  const postItem = `
          <div class="media-post" data-post-id="${post.id}" data-is-liked="${post.is_liked}">
            <div class="media-post-content">
              <div class="media-post-header">
                <div class="media-post-avatar" style="background-image: url('${post.user_profile_image || 'assets/img/profile-placeholder.jpg'}');"></div>
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
              <div class="media-post-likecount" data-like-count="${post.likes_count}">${post.likes_count} likes</div>
              <div class="media-post-description"><strong>${post.username}</strong> • ${post.caption}
                <span class="media-post-readmore">... more</span>
              </div>
              ${post.comments_count > 0 ? `<div class="media-post-commentcount popup-open" data-popup=".comments-popup" data-post-id="${post.id}">View ${post.comments_count} comments</div>` : ''}
            </div>
          </div>
        `
  postsContainer.insertAdjacentHTML('beforeend', postItem)
}

$(document).on('page:mount', '.page[data-name="post-view"]', async function (e) {
  var postId = e.detail.route.params.id
  const post = await getPostById(postId)
  displayPost(post)
})