/* eslint-disable no-unused-vars */
import {
  QueryFunctionContext,
  useInfiniteQuery,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions
} from "@tanstack/react-query";
import { Configs, FetchResponse, GetInfinitePagesInterface } from "@/types/fetch.type";

import { Nullable } from "@/types/nullable.type";  
import { PostQueryKeyT, QueryKeyT }  from "@/types/react-query.type";
import { apiClient } from "@/configs/api-client.config";

/**
 *
 * @param param0
 * @param configs
 * @returns
 */
export const fetcher = async <T>(
  { queryKey, pageParam: page }: QueryFunctionContext<QueryKeyT>,
  configs?: Configs
) => {
  const [url, params] = queryKey;

  const paramsRequest: any = {
    ...params
  };

  if (page) {
    paramsRequest["page"] = page;
  }

  const res = await apiClient.get<T>(url, {
    ...configs,
    params: paramsRequest
  });

  return res.data;
};

/**
 *
 * @param url
 * @param configs
 * @param queryOptions
 * @returns
 */
export const useFetch = <T>(
  url: Nullable<string>,
  configs?: Configs,
  queryOptions?: UseQueryOptions<T, Error, T, QueryKeyT>
) => {
  const context = useQuery<T, Error, T, QueryKeyT>(
    [url!, configs?.params],
    ({ queryKey, meta }: any) => fetcher({ queryKey, meta }, configs),
    {
      enabled: !!url,
      ...queryOptions
    }
  );

  return context;
};

/**
 *
 * @param url
 * @param configs
 * @returns
 */
export const usePrefetch = <T>(url: string | null, configs?: Configs) => {
  const queryClient = useQueryClient();

  return () => {
    if (!url) {
      return;
    }

    queryClient.prefetchQuery<T, Error, T, QueryKeyT>(
      [url!, configs?.params],
      ({ queryKey, meta }) => fetcher({ queryKey, meta }, configs)
    );
  };
};

// FOR POST FETCHER
/**
 *
 * @param param0
 * @param configs
 * @returns
 */
export const fetcherByPost = async <T>(
  { queryKey, pageParam }: QueryFunctionContext<PostQueryKeyT>,
  configs?: Configs
) => {
  const [url, body, params]: any = queryKey;
  let res;

  if (pageParam) {
    res = await apiClient.post<T>(
      url,
      {
        data: {
          ...body.data,
          page_number: pageParam
        }
      },
      { ...configs, params: { ...params, pageParam } }
    );
  } else {
    res = await apiClient.post<T>(url, body, { ...configs, params: { ...params } });
  }

  return res.data;
};

/**
 *
 * @param url
 * @param body
 * @param configs
 * @param queryOptions
 * @returns
 */
export const usePostFetch = <T>(
  url: Nullable<string>,
  body?: object,
  configs?: Configs,
  queryOptions?: UseQueryOptions<T, Error, T, PostQueryKeyT>
) => {
  const context = useQuery<T, Error, T, PostQueryKeyT>(
    [url!, body, configs?.params],
    ({ queryKey, meta }: any) => fetcherByPost({ queryKey, meta }, configs),
    {
      enabled: !!url,
      ...queryOptions
    }
  );

  return context;
};

/**
 *
 * @param url
 * @param body
 * @param configs
 * @returns
 */
export const usePostPrefetch = <T>(url: Nullable<string>, body?: object, configs?: Configs) => {
  const queryClient = useQueryClient();

  return () => {
    if (!url) {
      return;
    }

    queryClient.prefetchQuery<T, Error, T, PostQueryKeyT>(
      [url, body, configs?.params],
      ({ queryKey, meta }) => fetcherByPost({ queryKey, meta }, configs)
    );
  };
};
// END POST FETCHER

/**
 *
 * @param url
 * @param body
 * @param configs
 * @param queryOptions
 * @returns
 */
export const usePostLoadMore = <T>(
  url: Nullable<string>,
  body?: object,
  configs?: Configs,
  queryOptions?: any
) => {
  const context = useInfiniteQuery<
    GetInfinitePagesInterface<T>,
    Error,
    GetInfinitePagesInterface<T>,
    PostQueryKeyT
  >(
    [url!, body, configs?.params],
    ({ queryKey, pageParam = 1, meta }: any) =>
      fetcherByPost({ queryKey, pageParam, meta }, configs),
    {
      getPreviousPageParam: (firstPage: any): number | boolean => {
        return firstPage?.data?.current_page ?? false;
      },

      getNextPageParam: (lastPage: any) => {
        if (lastPage?.data?.current_page < lastPage?.data?.total_pages) {
          return lastPage.data.current_page + 1;
        }

        return undefined;
      },

      ...queryOptions
    }
  );

  return context;
};

/**
 *
 * @param url
 * @param configs
 * @param queryOptions
 * @returns
 */
export const useLoadMore = <T>(url: Nullable<string>, configs?: Configs, queryOptions?: any) => {
  const context = useInfiniteQuery<
    GetInfinitePagesInterface<T>,
    Error,
    GetInfinitePagesInterface<T>,
    QueryKeyT
  >(
    [url!, configs?.params],
    ({ queryKey, pageParam = 1, meta }: any) => fetcher({ queryKey, pageParam, meta }, configs),
    {
      getPreviousPageParam: (firstPage: any): number | boolean => {
        return firstPage?.page ?? false;
      },

      getNextPageParam: (lastPage: any) => {
        if (lastPage?.page < lastPage?.total_pages) {
          return lastPage.page + 1;
        }

        return undefined;
      },
      ...queryOptions
    }
  );

  return context;
};

/**
 *
 * @param func
 * @param url
 * @param params
 * @param updater
 * @param queryOptions
 * @returns
 */
const useGenericMutation = <T, S>(
  func: (data: T | S) => Promise<FetchResponse<S>>,
  url: string,
  params?: object,
  updater?: ((oldData: T, newData: S) => T) | undefined,
  queryOptions?: UseMutationOptions<any, any, any, any>
) => {
  const queryClient = useQueryClient();

  return useMutation<FetchResponse, FetchResponse, T | S>(func, {
    onMutate: async (data: any) => {
      await queryClient.cancelQueries([url!, params]);
      const previousData = queryClient.getQueryData([url!, params]);

      queryClient.setQueryData<T>([url!, params], (oldData) => {
        return updater ? updater(oldData!, data as S) : (data as T);
      });

      return previousData;
    },

    onError: (err, _, context) => {
      queryClient.setQueryData([url!, params], context);
    },

    onSettled: () => {
      queryClient.invalidateQueries([url!, params]);
    },

    ...queryOptions
  });
};

/**
 *
 * @param url
 * @param configs
 * @param updater
 * @param queryOptions
 * @returns
 */
export const useDelete = <T>(
  url: string,
  configs?: Configs,
  updater?: (oldData: T, id: string | number) => T,
  queryOptions?: any
) => {
  return useGenericMutation<T, string | number>(
    (id) => apiClient.delete(`${url}/${id}`, configs),
    url,
    configs?.params,
    updater,
    queryOptions
  );
};

/**
 *
 * @param url
 * @param configs
 * @param updater
 * @param queryOptions
 * @returns
 */
export const usePost = <T, S>(
  url: string,
  configs?: Configs,
  updater?: (oldData: T, newData: S) => T,
  queryOptions?: any
) => {
  return useGenericMutation<T, S>(
    (data) => apiClient.post<S>(url, data, configs),
    url,
    configs?.params,
    updater,
    queryOptions
  );
};

/**
 *
 * @param url
 * @param configs
 * @param updater
 * @param queryOptions
 * @returns
 */
export const usePatch = <T, S>(
  url: string,
  configs?: Configs,
  updater?: (oldData: T, newData: S) => T,
  queryOptions?: any
) => {
  return useGenericMutation<T, S>(
    (data) => apiClient.patch<S>(url, data, configs),
    url,
    configs?.params,
    updater,
    queryOptions
  );
};

/**
 *
 * @param url
 * @param configs
 * @param updater
 * @param queryOptions
 * @returns
 */
export const usePut = <T, S>(
  url: string,
  configs?: Configs,
  updater?: (oldData: T, newData: S) => T,
  queryOptions?: any
) => {
  return useGenericMutation<T, S>(
    (data) => apiClient.put<S>(url, data, configs),
    url,
    configs?.params,
    updater,
    queryOptions
  );
};
