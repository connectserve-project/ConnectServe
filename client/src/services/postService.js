import api from './api';

export const postService = {
  getFeed: async (page = 1, limit = 10, scope = 'all') => {
    const response = await api.get(`/posts/feed?page=${page}&limit=${limit}&scope=${scope}`);
    return response.data;
  },

  getExplore: async (params = {}) => {
    const response = await api.get('/posts/explore', { params });
    return response.data;
  },

  getPostById: async (id) => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  createPost: async (formData) => {
    const response = await api.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deletePost: async (id) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },

  toggleLike: async (id) => {
    const response = await api.post(`/posts/${id}/like`);
    return response.data;
  },

  addComment: async (id, content) => {
    const response = await api.post(`/posts/${id}/comments`, { content });
    return response.data;
  },

  deleteComment: async (postId, commentId) => {
    const response = await api.delete(`/posts/${postId}/comments/${commentId}`);
    return response.data;
  },

  sharePost: async (id) => {
    const response = await api.post(`/posts/${id}/share`);
    return response.data;
  },

  reportPost: async (id, reason, details) => {
    const response = await api.post(`/posts/${id}/report`, { reason, details });
    return response.data;
  },
};
