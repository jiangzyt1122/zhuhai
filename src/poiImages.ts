const imageModules = import.meta.glob('../poi-images/**/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  as: 'url'
});

const poiImageMap: Record<string, string[]> = {};

Object.entries(imageModules).forEach(([rawPath, url]) => {
  const path = rawPath.replace(/\\/g, '/');
  const match = path.match(/poi-images\/([^/]+)\//);
  if (!match) return;
  const name = match[1];
  if (!poiImageMap[name]) {
    poiImageMap[name] = [];
  }
  poiImageMap[name].push(url as string);
});

Object.values(poiImageMap).forEach((images) => {
  images.sort();
});

export { poiImageMap };
