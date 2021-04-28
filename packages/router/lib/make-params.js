export default function makeParams(defs, list) {
  const params = Object.create(null);

  for (let i = 0, len = defs.length; i < len; i++) {
    params[defs[i].name] = list[i + 1];
  }

  return params;
}
