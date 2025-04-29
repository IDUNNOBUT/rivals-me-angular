export type PaginationDto = {
  page: number;
  pageSize: number;
};

export type PaginationResponseDto<T> = {
  data: T;
  meta: {
    pages: number;
    hasMore: boolean;
  }
};


