import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import type { ApiErrorResponse, ApiResponse } from "../types";

// List Products
export const listOrdersRequest = async (params?: { category?: string; search?: string }): Promise<ApiResponse<any[]>> => {
  const queryParams = new URLSearchParams();
  if (params?.category && params.category !== 'all') {
    queryParams.append('category', params.category);
  }
  if (params?.search) {
    queryParams.append('search', params.search);
  }
  
  const url = `/order/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const res = await api.get<ApiResponse<any>>(url);
  return res.data;
}

export const useListOrders = (params?: { category?: string; search?: string }) =>
  useQuery<ApiResponse<any[]>>({
    queryKey: ["orders", params],
    queryFn: () => listOrdersRequest(params),
  })

// Create Product
const createOrderRequest = async (payload: Omit<any, 'id'>): Promise<ApiResponse<any>> => {
  const res = await api.post<ApiResponse<any>>('/order/', payload);
  return res.data;
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<any>, ApiErrorResponse, Omit<any, 'id'>>({
    mutationFn: createOrderRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
