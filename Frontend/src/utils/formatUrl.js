export const makeSecure = (url) => {
  if (!url) return "";
  // This ensures that even if Cloudinary returns http, your app requests https
  return url.replace("http://", "https://");
};