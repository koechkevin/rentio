import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';

export interface Upload {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedById: string;
  createdAt: string;
  updatedAt: string;
}

export interface EntityUpload {
  id: string;
  uploadId: string;
  upload: Upload;
  entityType: string;
  entityId: string;
  isPrimary: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface UploadFileResponse {
  success: boolean;
  data: Upload;
}

export interface LinkUploadRequest {
  uploadId: string;
  entityType: 'UNIT' | 'PROPERTY' | 'USER';
  entityId: string;
  isPrimary?: boolean;
  order?: number;
}

export const uploadApi = createApi({
  reducerPath: 'uploadApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Upload', 'EntityUpload'],
  endpoints: (builder) => ({
    uploadFile: builder.mutation<UploadFileResponse, { file: File; propertyId?: string; entityType?: string }>({
      query: ({ file, propertyId, entityType }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: '/uploads',
          method: 'POST',
          body: formData,
          headers: {
            ...(propertyId ? { 'x-property-id': propertyId } : {}),
            ...(entityType ? { 'x-entity-type': entityType } : {}),
          },
          formData: true,
        };
      },
      invalidatesTags: ['Upload'],
    }),
    linkUpload: builder.mutation<{ success: boolean; data: EntityUpload }, LinkUploadRequest>({
      query: (data) => ({
        url: '/uploads/link',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['EntityUpload'],
    }),
    getEntityUploads: builder.query<
      { success: boolean; data: EntityUpload[] },
      { entityType: string; entityId: string }
    >({
      query: ({ entityType, entityId }) => `/uploads/entity/${entityType}/${entityId}`,
      providesTags: ['EntityUpload'],
    }),
    unlinkUpload: builder.mutation<{ success: boolean }, string>({
      query: (entityUploadId) => ({
        url: `/uploads/link/${entityUploadId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['EntityUpload'],
    }),
    updateUploadOrder: builder.mutation<
      { success: boolean },
      { entityUploadId: string; order: number; isPrimary?: boolean }
    >({
      query: ({ entityUploadId, ...data }) => ({
        url: `/uploads/link/${entityUploadId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['EntityUpload'],
    }),
  }),
});

export const {
  useUploadFileMutation,
  useLinkUploadMutation,
  useGetEntityUploadsQuery,
  useUnlinkUploadMutation,
  useUpdateUploadOrderMutation,
} = uploadApi;
