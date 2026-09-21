const QRCode = require('qrcode');

const generateCertificateQRCode = async (certificateNumber) => {
  try {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verifyUrl = `${clientUrl}/verify/${certificateNumber}`;

    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 280,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });

    return {
      qrDataUrl,
      verifyUrl
    };
  } catch (error) {
    console.error('[QR Generation Error]', error.message);
    throw error;
  }
};

module.exports = {
  generateCertificateQRCode
};
