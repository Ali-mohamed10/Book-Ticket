import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../services/bookingService';
import { CheckoutParams, Booking } from '../types/booking';

/**
 * Hook to trigger Checkout Creation
 */
export const useCreateCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CheckoutParams) => bookingService.createCheckout(params),
    onSuccess: () => {
      // Invalidate tables and seat maps queries to show newly reserved tables immediately
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['seatMaps'] });
    },
  });
};

/**
 * Hook to poll booking status every 2 seconds on the Success Page
 * Polling continues until status is 'PAID', 'FAILED', or 'EXPIRED'
 */
export const useBookingStatus = (query: { id?: string; sessionId?: string }) => {
  return useQuery<Booking, Error>({
    queryKey: ['bookingStatus', query.id || query.sessionId],
    queryFn: () => bookingService.getBooking(query),
    enabled: !!(query.id || query.sessionId),
    refetchInterval: (queryResult) => {
      const status = queryResult.state.data?.status;
      // Keep polling every 2 seconds if PENDING, stop if PAID, FAILED, EXPIRED, CANCELLED
      if (status === 'PENDING') {
        return 2000;
      }
      return false;
    },
    refetchIntervalInBackground: true,
  });
};
