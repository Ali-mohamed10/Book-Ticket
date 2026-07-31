import { useQuery } from '@tanstack/react-query';
import { lookupService } from '../services/lookupService';

export const useCountries = () => {
  return useQuery({
    queryKey: ['countries'],
    queryFn: lookupService.getCountries,
    staleTime: 1000 * 60 * 60, // 1 hour (rarely changes)
  });
};

export const useCities = (countryId = null) => {
  return useQuery({
    queryKey: ['cities', countryId],
    queryFn: () => lookupService.getCities(countryId),
    staleTime: 1000 * 60 * 60,
  });
};

export const useVenues = (cityId = null) => {
  return useQuery({
    queryKey: ['venues', cityId],
    queryFn: () => lookupService.getVenues(cityId),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: lookupService.getCategories,
    staleTime: 1000 * 60 * 60,
  });
};
