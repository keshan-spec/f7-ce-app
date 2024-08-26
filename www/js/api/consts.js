export const API_URL = 'https://carevents.com/uk'

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