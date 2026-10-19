import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys, unwrap } from '@/lib/queryClient';
import { settingsRepository } from '@/services/repositories/settingsRepository';
import type { SettingsFormValues } from '@/validation';

/** Business settings rarely change, so they are cached for the session. */
export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    staleTime: 10 * 60_000,
    queryFn: async () => unwrap(await settingsRepository.getActive()),
  });
}

export function useSaveSettings() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string | null;
      values: SettingsFormValues;
    }) =>
      unwrap(
        id
          ? await settingsRepository.update(id, values)
          : await settingsRepository.create(values),
      ),
    onSuccess: (data) => client.setQueryData(queryKeys.settings, data),
  });
}
