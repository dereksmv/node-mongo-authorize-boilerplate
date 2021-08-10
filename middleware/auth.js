const jwt = require("jsonwebtoken");



const verifyToken = (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403)
              .json({
                  message: "Not authenticated",
                  authenticated: false
              })
  }
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};



module.exports = verifyToken;