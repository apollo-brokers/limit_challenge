'use client';

import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import type { AutocompleteOption, AutocompleteSource } from '@/lib/api/autocomplete';

export function useAutocompleteOptions(
  source: AutocompleteSource,
  search: string,
  open: boolean,
  selectedId: string,
  initialOption?: AutocompleteOption,
) {
  const queryClient = useQueryClient();
  const term = search.trim();
  const debouncedTerm = useDebouncedValue(term);
  const isSearching = term !== debouncedTerm;
  const canSearch = term === '' || term.length >= 2;
  const showResults = canSearch && !isSearching;
  const results = useInfiniteQuery({
    queryKey: [source.key, 'autocomplete', 'search', debouncedTerm],
    queryFn: ({ pageParam, signal }) => source.search(debouncedTerm, pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: (page) => page.nextPage,
    enabled: open && showResults,
  });
  const loadedOptions = results.data?.pages.flatMap((page) => page.options) ?? [];
  const knownOption =
    (initialOption?.id === selectedId ? initialOption : undefined) ??
    loadedOptions.find((option) => option.id === selectedId);
  const selected = useQuery({
    queryKey: [source.key, 'autocomplete', 'selected', selectedId],
    queryFn: ({ signal }) => source.get(selectedId, signal),
    enabled: Boolean(selectedId) && !knownOption,
    initialData: knownOption,
  });
  const selectedOption = selectedId ? (knownOption ?? selected.data ?? null) : null;
  const error =
    (open && showResults ? results.error : null) ??
    (selectedId && !knownOption ? selected.error : null);

  function selectOption(option: AutocompleteOption | null) {
    if (option) {
      queryClient.setQueryData([source.key, 'autocomplete', 'selected', option.id], option);
    }
  }

  async function refetch() {
    await Promise.all([
      open && showResults ? results.refetch() : undefined,
      selectedId && !knownOption ? selected.refetch() : undefined,
    ]);
  }

  function fetchNextPage() {
    if (open && showResults && results.hasNextPage && !results.isFetchingNextPage) {
      return results.fetchNextPage();
    }
  }

  return {
    options: showResults
      ? [...new Map(loadedOptions.map((option) => [option.id, option])).values()]
      : [],
    selectedOption,
    loading:
      (open && canSearch && (isSearching || results.isLoading)) ||
      (Boolean(selectedId) && !selectedOption && selected.isLoading),
    isSearching,
    isError: Boolean(error),
    error,
    refetch,
    hasNextPage: showResults && Boolean(results.hasNextPage),
    isFetchingNextPage: showResults && results.isFetchingNextPage,
    fetchNextPage,
    selectOption,
  };
}
