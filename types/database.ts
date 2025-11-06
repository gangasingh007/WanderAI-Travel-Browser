export type Chat = {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type Message = {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  chatId: string;
  createdAt: string;
};
