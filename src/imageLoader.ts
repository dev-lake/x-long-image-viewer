type ImageLoadPriority = "high" | "low" | "auto";

type CachedImage = {
  image: HTMLImageElement;
  promise: Promise<HTMLImageElement>;
  settled: boolean;
  lastUsed: number;
};

// A post contains at most a small gallery; keeping the cache bounded avoids
// retaining decoded full-resolution images from many previously opened posts.
const MAX_CACHED_IMAGES = 4;
const imageCache = new Map<string, CachedImage>();

function trimImageCache(): void {
  if (imageCache.size <= MAX_CACHED_IMAGES) {
    return;
  }

  const removableEntries = [...imageCache.entries()]
    .filter(([, entry]) => entry.settled)
    .sort(([, first], [, second]) => first.lastUsed - second.lastUsed);

  while (imageCache.size > MAX_CACHED_IMAGES && removableEntries.length > 0) {
    const [url] = removableEntries.shift()!;
    imageCache.delete(url);
  }
}

export function preloadImage(url: string, priority: ImageLoadPriority = "auto"): Promise<HTMLImageElement> {
  const cached = imageCache.get(url);
  if (cached) {
    cached.lastUsed = Date.now();
    if (priority === "high") {
      cached.image.fetchPriority = "high";
    }
    return cached.promise;
  }

  const image = new Image();
  image.decoding = "async";
  image.fetchPriority = priority;

  const entry: CachedImage = {
    image,
    promise: Promise.resolve(image),
    settled: false,
    lastUsed: Date.now()
  };

  entry.promise = new Promise<HTMLImageElement>((resolve, reject) => {
    image.onload = async () => {
      try {
        await image.decode();
      } catch {
        // A completed image can still be displayed when explicit decoding is unavailable.
      }

      entry.settled = true;
      entry.lastUsed = Date.now();
      trimImageCache();
      resolve(image);
    };

    image.onerror = () => {
      imageCache.delete(url);
      reject(new Error(`Unable to load image: ${url}`));
    };
  });

  imageCache.set(url, entry);
  image.src = url;

  return entry.promise;
}
