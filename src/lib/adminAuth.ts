export function verifyAdminAuth(request: Request): boolean {
  const adminSecret = process.env.ADMIN_KEY || 'sollelio-discovery-2026';
  const authHeader = request.headers.get('x-admin-key');
  if (authHeader === adminSecret) return true;

  try {
    const url = new URL(request.url);
    const keyParam = url.searchParams.get('key');
    if (keyParam === adminSecret) return true;
  } catch {
    // URL parsing fallback
  }

  return false;
}
