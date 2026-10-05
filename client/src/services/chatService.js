import api from './api';

export const chatService = {
  getConversations: async () => {
    const response = await api.get('/chat/conversations');
    return response.data;
  },

  getOrCreateConversation: async (recipientId) => {
    const response = await api.post('/chat/conversations', { recipientId });
    return response.data;
  },

  getMessages: async (conversationId) => {
    const response = await api.get(`/chat/conversations/${conversationId}/messages`);
    return response.data;
  },

  deleteConversation: async (conversationId) => {
    const response = await api.delete(`/chat/conversations/${conversationId}`);
    return response.data;
  },

  blockUser: async (conversationId) => {
    const response = await api.post(`/chat/conversations/${conversationId}/block`);
    return response.data;
  },

  unblockUser: async (conversationId) => {
    const response = await api.delete(`/chat/conversations/${conversationId}/block`);
    return response.data;
  },

  reportUser: async (conversationId, reason, details = '') => {
    const response = await api.post(`/chat/conversations/${conversationId}/report`, { reason, details });
    return response.data;
  },

  sendMessage: async (conversationId, formData) => {
    const response = await api.post(`/chat/conversations/${conversationId}/messages`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
