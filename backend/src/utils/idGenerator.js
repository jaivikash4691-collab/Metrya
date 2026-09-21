const generateInstrumentId = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `INS-${year}-${random}`;
};

const generateApplicationNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `VER-${year}-${random}`;
};

const generateCertificateNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `MET-CERT-${year}-${random}`;
};

const generateSealNumber = (quarter = 'Q1') => {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `LM-SEAL-${year}-${quarter}-${random}`;
};

module.exports = {
  generateInstrumentId,
  generateApplicationNumber,
  generateCertificateNumber,
  generateSealNumber
};
