import JWT from "jsonwebtoken";

const userAuth = async (req, res, next) => {
   const authHeader = req.headers.authorization;
   if (!authHeader || !authHeader.startsWith("Bearer"))
      return next("You are not authorized");

   const token = authHeader.split(" ")[1];

   try {
      const payload = JWT.verify(token, process.env.JWT_KEY);
      req.user = { userId: payload.userId, isAdmin: payload.isAdmin };
      next();
   } catch (error) {
      next("Invalid token");
   }
};

export default userAuth;
