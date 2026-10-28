import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { desktop } from '@/shared/api/desktop';
import { QUERY_KEYS } from '../api/query-keys';

export function useCoverImage(id: string | null | undefined) {
  const { data: blob } = useQuery({
    queryKey: [...QUERY_KEYS.COVERS, id],
    enabled: !!id,
    queryFn: async () => {
      const cover = await desktop('coverRead', { id: id as string });
      const bytes = Uint8Array.from(atob(cover.data), (character) => character.charCodeAt(0));
      return new Blob([bytes], { type: cover.mimeType });
    },
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 60_000,
    retry: false,
  });
  const [image, setImage] = useState<{ blob: Blob; url: string }>();
  useEffect(() => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    setImage({ blob, url });
    return () => URL.revokeObjectURL(url);
  }, [blob]);
  return image?.blob === blob ? image?.url : undefined;
}
