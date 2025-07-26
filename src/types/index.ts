export interface User {
  id: string;
  username: string;
  email: string;
  role: 'guest' | 'user' | 'admin';
  avatar?: string;
  joinDate: string;
  reputation: number;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  tags: string[];
  authorId: string;
  author: User;
  createdAt: string;
  updatedAt: string;
  views: number;
  votes: number;
  answerCount: number;
  acceptedAnswerId?: string;
}

export interface Answer {
  id: string;
  questionId: string;
  content: string;
  authorId: string;
  author: User;
  createdAt: string;
  updatedAt: string;
  votes: number;
  isAccepted: boolean;
}

export interface Vote {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'question' | 'answer';
  type: 'up' | 'down';
}

export interface Notification {
  id: string;
  userId: string;
  type: 'answer' | 'comment' | 'mention' | 'accept';
  message: string;
  relatedId: string;
  read: boolean;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  description?: string;
  count: number;
  color: string;
}