export const PAGE_SIZE = 8;

export function paginate<T>(rows: T[], page: number, size = PAGE_SIZE) {
  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total / size) || 1);
  const current = Math.min(Math.max(1, page), pages);
  const start = (current - 1) * size;
  return {
    rows: rows.slice(start, start + size),
    total,
    pages,
    current,
    size,
    from: total ? start + 1 : 0,
    to: Math.min(start + size, total),
  };
}
