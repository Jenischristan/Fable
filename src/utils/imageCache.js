const loadedImageUrls = new Set();

export const isImageCached = (url) => {
  return Boolean(url && loadedImageUrls.has(url));
};

export const markImageCached = (url) => {
  if (url) {
    loadedImageUrls.add(url);
  }
};
