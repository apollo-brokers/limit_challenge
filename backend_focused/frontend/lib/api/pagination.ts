import type { Paginated } from './types';

export async function getAllPages<T>(
  getPage: (page: number, signal?: AbortSignal) => Promise<Paginated<T>>,
  signal?: AbortSignal,
): Promise<T[]> {
  const results: T[] = [];
  let page = 1;

  while (true) {
    signal?.throwIfAborted();
    const response = await getPage(page, signal);
    results.push(...response.results);

    if (!response.next) return results;
    page += 1;
  }
}
