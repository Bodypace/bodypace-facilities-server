export function expectToHaveBeenCalledWith(
  func: any,
  first: number,
  last: number,
  logs: any[][],
) {
  const len = last - first + 1;
  expect(logs.length).toBe(len);

  let callNo = first;
  for (let i = 0; i < len; ++i) {
    expect(func).toHaveBeenNthCalledWith(callNo++, ...logs[i]);
  }
}
