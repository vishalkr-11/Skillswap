import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import {
  providerService, serviceService, bookingService,
  reviewService, messageService,
} from '../services'

// ── chatId helper (same algorithm as backend) ────────
export function buildChatId(id1, id2) {
  return [String(id1), String(id2)].sort().join('_')
}

// ── Providers ─────────────────────────────────────────
export function useProviders(params) {
  return useQuery({
    queryKey: ['providers', params],
    queryFn: () => providerService.getAll(params),
    placeholderData: (prev) => prev,
    select: (data) => ({ providers: data?.providers ?? data?.data ?? (Array.isArray(data) ? data : []) }),
  })
}

export function useInfiniteProviders(params) {
  return useInfiniteQuery({
    queryKey: ['providers-infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      providerService.getAll({ ...params, page: pageParam, limit: 9 }),
    getNextPageParam: (last, pages) => last?.meta?.hasNext ? pages.length + 1 : undefined,
  })
}

export function useProvider(id) {
  return useQuery({
    queryKey: ['provider', id],
    queryFn: () => providerService.getById(id),
    enabled: !!id,
    retry: false,
    select: (data) => data?.provider ?? data,
  })
}

// ── Services ──────────────────────────────────────────
export function useServices(params) {
  return useQuery({
    queryKey: ['services', params],
    queryFn: () => serviceService.getAll(params),
    placeholderData: (prev) => prev,
  })
}

export function useService(id) {
  return useQuery({
    queryKey: ['service', id],
    queryFn: () => serviceService.getById(id),
    enabled: !!id,
    retry: false,
    select: (data) => data?.service ?? data,
  })
}

export function useCreateService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: serviceService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  })
}

// ── Bookings ──────────────────────────────────────────
export function useUserBookings() {
  return useQuery({
    queryKey: ['bookings-user'],
    queryFn: bookingService.getUserBookings,
    retry: false,
    select: (data) => Array.isArray(data) ? data : (data?.bookings ?? []),
  })
}

export function useProviderBookings() {
  return useQuery({
    queryKey: ['bookings-provider'],
    queryFn: bookingService.getProviderBookings,
    retry: false,
    select: (data) => Array.isArray(data) ? data : (data?.bookings ?? []),
  })
}

export function useCreateBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: bookingService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings-user'] })
      qc.invalidateQueries({ queryKey: ['bookings-provider'] })
    },
  })
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }) => bookingService.updateStatus(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings-user'] })
      qc.invalidateQueries({ queryKey: ['bookings-provider'] })
    },
  })
}

// ── Reviews ───────────────────────────────────────────
export function useProviderReviews(providerId) {
  return useQuery({
    queryKey: ['reviews', providerId],
    queryFn: () => reviewService.getByProvider(providerId),
    enabled: !!providerId,
    retry: false,
    select: (data) => Array.isArray(data) ? data : (data?.reviews ?? []),
  })
}

export function useCreateReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: reviewService.create,
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ['reviews', vars.providerId] }),
  })
}

// ── Messages ──────────────────────────────────────────
export function useMessages(chatId) {
  return useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => messageService.getMessages(chatId),
    enabled: !!chatId,
    retry: false,
    refetchInterval: false,
    select: (data) => Array.isArray(data) ? data : (data?.messages ?? []),
  })
}

export function useUserChats() {
  return useQuery({
    queryKey: ['chats'],
    queryFn: messageService.getUserChats,
    retry: false,
    select: (data) => Array.isArray(data) ? data : (data?.chats ?? []),
  })
}

// Send message — strips _localSenderId before hitting API
export function useSendMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ receiverId, content }) =>
      messageService.sendMessage({ receiverId, content }),
    onMutate: async ({ receiverId, content, _localSenderId }) => {
      if (!receiverId || !_localSenderId) return {}
      const chatId = buildChatId(_localSenderId, receiverId)
      await qc.cancelQueries({ queryKey: ['messages', chatId] })
      const prev = qc.getQueryData(['messages', chatId])
      qc.setQueryData(['messages', chatId], (old) => [
        ...(Array.isArray(old) ? old : []),
        {
          _id: `opt_${Date.now()}`,
          content,
          senderId: _localSenderId,
          createdAt: new Date().toISOString(),
          optimistic: true,
        },
      ])
      return { prev, chatId }
    },
    onError: (_, __, ctx) => {
      if (ctx?.chatId) qc.setQueryData(['messages', ctx.chatId], ctx.prev)
    },
    onSettled: (_, __, ___, ctx) => {
      if (ctx?.chatId) qc.invalidateQueries({ queryKey: ['messages', ctx.chatId] })
      qc.invalidateQueries({ queryKey: ['chats'] })
    },
  })
}
