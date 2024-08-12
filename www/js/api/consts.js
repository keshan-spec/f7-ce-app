export const API_URL = 'https://wordpress-889362-4267074.cloudwaysapps.com/uk'

export const sendRNMessage = ({
    page,
    type,
    user_id,
    association_id,
    association_type
}) => {
    if (typeof window.ReactNativeWebView === 'undefined') {
        alert(`This is not a react native webview, failed to send message: ${type} - ${user_id}`)
        console.warn(`This is not a react native webview, failed to send message: ${type} - ${user_id}`)
    }

    try {
        if (window !== undefined && window.ReactNativeWebView) {
            alert(`Sending message: ${type} - ${user_id}`)

            window.ReactNativeWebView.postMessage(JSON.stringify({
                type,
                page,
                user_id,
                association_id,
                association_type
            }))
        } else {
            alert(`Failed to send message: ${type} - ${user_id}`)
            console.warn(`Failed to send message: ${type} - ${user_id}`)
        }
    } catch (e) {
        console.error(e)
        alert(`Failed to send message: ${type} - ${user_id}`)
    }
}