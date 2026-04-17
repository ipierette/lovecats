// CJS wrapper — importa o handler ESM do backend via dynamic import()
module.exports = async function handler(req, res) {
  const { default: h } = await import('../backend/api/upload-url.js');
  return h(req, res);
};

