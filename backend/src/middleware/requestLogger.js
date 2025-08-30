const logs = [];

function requestLogger(req, res, next) {
  const { method, url, headers, body } = req;

  const safeBody = { ...body };
  if (safeBody.password) safeBody.password = "[REDACTED]";
  if (safeBody.token) safeBody.token = "[REDACTED]";

  logs.push({
    method,
    url,
    headers: {
      'user-agent': headers['user-agent'],
      'x-forwarded-for': headers['x-forwarded-for'] || req.ip,
    },
    body: safeBody,
    timestamp: new Date().toISOString()
  });

  if (logs.length > 50) logs.shift();

  next();
}

function getLogs() {
  return logs;
}

module.exports = { requestLogger, getLogs };
