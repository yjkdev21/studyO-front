const imgSrc = import.meta.env.VITE_PROFILE_IMG_BASE_PATH;
const thumbnailSrc = import.meta.env.VITE_THUMBNAIL_BASE_PATH;

export const getProfileImageSrc = (profileImage) => {
  return profileImage?.includes(imgSrc)
    ? profileImage
    : profileImage
      ? `${imgSrc}${profileImage}`
      : "/images/default-profile.png";
};

export const getThumbnailSrc = (thumb) => {
  return thumb?.includes(thumbnailSrc)
    ? thumb
    : thumb
      ? `${thumbnailSrc}${thumb}`
      : "/images/default-thumbnail.png";
};