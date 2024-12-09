const QRCode = require('qrcode');
exports.generateQRCode=async(data)=>{
    try {
        // Generate QR code
        const qrCodeData = await QRCode.toDataURL(data.toString())
        return qrCodeData;
    } catch (err) {
        throw err;
    }
}
