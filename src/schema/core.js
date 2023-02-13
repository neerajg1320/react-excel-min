// Input is an array of objects
export function generateKeyFromHeader(header) {
  return header.toLowerCase().replaceAll(/[\s./]/g, '_')
}
