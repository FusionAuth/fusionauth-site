const cache = {};

/* We don't want to regenerate the diagram if nothing has changed */
export function generateHash(dataObj) {
  // Dark magic: https://stackoverflow.com/a/7616484/2890472
  const data = JSON.stringify(dataObj);
  let hash = 0;
  let i;
  let chr;
  if (data.length === 0) return hash;
  for (i = 0; i < data.length; i += 1) {
    chr = data.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
}

export default cache;
