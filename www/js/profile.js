function createProfileContent(user) {
  return `
    <div class="profile-header">
      <div class="cover-image" style="background-image: url('${user.cover_image}');"></div>
      <div class="profile-image" style="background-image: url('${user.profile_image}');"></div>
      <div class="profile-info">
        <h2>${user.name} (@${user.username})</h2>
        <p>${user.email}</p>
        <p>Posts: ${user.posts_count}</p>
        <p>Followers: ${user.followers.length}</p>
        <p>Following: ${user.following.length}</p>
      </div>
    </div>
    <div class="profile-links">
      ${user.profile_links.instagram ? `<a href="https://instagram.com/${user.profile_links.instagram}" target="_blank">Instagram</a>` : ''}
      ${user.profile_links.facebook ? `<a href="https://facebook.com/${user.profile_links.facebook}" target="_blank">Facebook</a>` : ''}
      ${user.profile_links.tiktok ? `<a href="https://www.tiktok.com/${user.profile_links.tiktok}" target="_blank">TikTok</a>` : ''}
      ${user.profile_links.youtube ? `<a href="https://www.youtube.com/${user.profile_links.youtube}" target="_blank">YouTube</a>` : ''}
      ${user.profile_links.mivia ? `<a href="https://www.mivia.com/${user.profile_links.mivia}" target="_blank">Mivia</a>` : ''}
      ${user.profile_links.custodian ? `<a href="https://www.custodian.com/${user.profile_links.custodian}" target="_blank">Custodian</a>` : ''}
      ${user.profile_links.external_links.map(link => `<a href="${link.link.url}" target="_blank">${link.link.label}</a>`).join('')}
    </div>
  `
}

export function displayProfile(user) {
  if (!user) return

  const profileContainer = document.getElementById('profile-page') // Make sure you have a container with this ID
  profileContainer.innerHTML = createProfileContent(user)
}
