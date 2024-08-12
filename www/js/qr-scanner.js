import { verifyScan } from "./api/scanner.js"

export const onScanSuccess = async (decodedText) => {
    // https://mydrivelife.com/qr/clpmhHGEXyUD
    // get the qr code and verify it
    alert(decodedText)

    try {
        const url = new URL(decodedText)
        if (url.hostname === 'mydrivelife.com') {
            const qrCode = url.pathname.split('/').pop()
            if (qrCode) {
                const response = await verifyScan(qrCode)
                alert(JSON.stringify(response))
                return response
            }
        } else {
            throw new Error('Invalid QR Code')
        }
    } catch (error) {
        console.log('error', error)
    }
}

export function onScanFailure(error) {
    // handle scan failure, usually better to ignore and keep scanning.
    // for example:
    console.warn(`Code scan error = ${error}`)
}
