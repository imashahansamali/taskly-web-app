const jwt = require("jsonwebtoken");
const User = require("../models/User");
module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ");
    if (token?.[0] !== "Bearer" || !token[1])
      return res.status(401).json({ message: "Please sign in again." });
    const decoded = jwt.verify(token[1], process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (
      !user ||
      (user.passwordChangedAt &&
        decoded.iat * 1000 < user.passwordChangedAt.getTime())
    )
      return res
        .status(401)
        .json({ message: "Session expired. Please sign in again." });
    req.userId = user._id;
    req.account = user;
    next();
  } catch {
    return res
      .status(401)
      .json({ message: "Session expired. Please sign in again." });
  }
};
