export const generateUEID = () => {
  let random = () => crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
  const [first, second] = [(random() * 46656) | 0, (random() * 46656) | 0]
      .map((value) => ('000' + value.toString(36)).slice(-3));

  return first + second;
};
