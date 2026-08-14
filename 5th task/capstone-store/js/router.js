export function getRoute() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  return { page: parts[0] || 'home', id: parts[1] || null };
}
export function startRouter(render) { addEventListener('hashchange', render); render(); }
