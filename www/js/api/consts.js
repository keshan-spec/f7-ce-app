export const API_URL = 'https://wordpress-889362-4267074.cloudwaysapps.com/uk'
export const TIMEOUT_MS_LOW = 15 * 1000 // 15 seconds
export const TIMEOUT_MS_HIGH = 30 * 1000 // 30 seconds
export const TIMEOUT_MS_HIGHER = 60 * 1000 // 60 seconds

export const sendRNMessage = ({
    page,
    type,
    user_id,
    association_id,
    association_type
}) => {
    if (typeof window.ReactNativeWebView === 'undefined') {
        console.warn(`This is not a react native webview, failed to send message: ${type} - ${user_id}`)
    }

    try {
        if (window !== undefined && window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type,
                page,
                user_id,
                association_id,
                association_type
            }))
        } else {
            console.warn(`Failed to send message: ${type} - ${user_id}`)
        }
    } catch (e) {
        console.error(e)
    }
}