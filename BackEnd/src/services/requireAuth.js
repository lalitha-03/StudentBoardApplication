const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization)
    return res.status(401).send({ message: "You must be logged in!" });

  jwt.verify(authorization, process.env.JWT_SECRET, async (err, payload) => {
    if (err) {
      return res.status(401).send({ message: "You must be logged in" });
    }

    const { user, role } = payload;
    req.user = user;
    req.role = role;
    next();
  });
};
