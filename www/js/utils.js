export function formatPostDate(date) {
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