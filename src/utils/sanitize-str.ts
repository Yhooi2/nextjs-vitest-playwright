export function sanitizeStr(str: string): string {
  console.log('sanitizeStr', str);
  return !str || typeof str !== 'string' ? '' : str.trim().normalize();
}
