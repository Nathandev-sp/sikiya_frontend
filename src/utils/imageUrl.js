const CLOUDFRONT_URL = process.env.EXPO_PUBLIC_CLOUDFRONT_URL;

export const getImageUrl = (imageKey) => {
  if (!imageKey) return null;
  // If it's already a full URL, return as is
  if (imageKey.startsWith('http')) return imageKey;
  return `${CLOUDFRONT_URL}/${imageKey}`;
};

