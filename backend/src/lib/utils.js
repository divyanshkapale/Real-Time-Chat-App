import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign(
    { userId }, 
    process.env.JWT_SECRET, 
    { expiresIn: "7d" } 
  );

  res.cookie("jwt", token, {
    httpOnly: true, // JS cannot access cookie ⇒ prevents XSS attacks
    secure: process.env.NODE_ENV === "production", // only HTTPS in production
    sameSite: "strict", // prevents CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

   return token;
};
