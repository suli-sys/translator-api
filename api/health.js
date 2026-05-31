module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  return res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  });
};
