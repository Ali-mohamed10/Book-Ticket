import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { seatMapService } from '../services/seatMapService';
import { tableService } from '../services/tableService';

export const useSeatMaps = () => {
  return useQuery({
    queryKey: ['seatMaps'],
    queryFn: seatMapService.getSeatMaps,
  });
};

export const useSeatMap = (id) => {
  return useQuery({
    queryKey: ['seatMap', id],
    queryFn: () => seatMapService.getSeatMapById(id),
    enabled: !!id,
  });
};

export const useSeatMapBySlug = (slug) => {
  return useQuery({
    queryKey: ['seatMap', 'slug', slug],
    queryFn: () => seatMapService.getSeatMapBySlug(slug),
    enabled: !!slug,
  });
};

export const useCreateSeatMap = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: seatMapService.createSeatMap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seatMaps'] });
    },
  });
};

export const useUpdateSeatMap = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => seatMapService.updateSeatMap(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['seatMaps'] });
      queryClient.invalidateQueries({ queryKey: ['seatMap', data.id] });
    },
  });
};

export const useDeleteSeatMap = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: seatMapService.deleteSeatMap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seatMaps'] });
    },
  });
};

export const useUpsertTables = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tableService.upsertTables,
    onSuccess: (data) => {
      if (data && data.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['seatMap', data[0].seat_map_id] });
      }
    },
  });
};

export const useUploadSvg = () => {
  return useMutation({
    mutationFn: (file) => seatMapService.uploadFile(file, 'svgs'),
  });
};

export const useUploadPreviewImage = () => {
  return useMutation({
    mutationFn: (file) => seatMapService.uploadFile(file, 'previews'),
  });
};
