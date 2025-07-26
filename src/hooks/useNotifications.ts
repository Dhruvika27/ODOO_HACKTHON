import { useState, useEffect } from 'react';
import { Notification } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Simulate loading notifications with more realistic data
    const mockNotifications: Notification[] = [
      {
        id: '1',
        userId: user.id,
        type: 'answer',
        message: 'react_expert answered your question "How to implement React hooks properly?"',
        relatedId: 'q1',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
      },
      {
        id: '2',
        userId: user.id,
        type: 'mention',
        message: 'hooks_master mentioned you in an answer: "As @demo_user suggested, this approach works well..."',
        relatedId: 'a2',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
      },
      {
        id: '3',
        userId: user.id,
        type: 'accept',
        message: 'Your answer was accepted as the best solution for "CSS Grid vs Flexbox"',
        relatedId: 'a3',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
      },
      {
        id: '4',
        userId: user.id,
        type: 'mention',
        message: 'css_ninja mentioned you: "Thanks @demo_user for the detailed explanation!"',
        relatedId: 'a4',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() // 4 hours ago
      },
      {
        id: '5',
        userId: user.id,
        type: 'answer',
        message: 'js_wizard answered your question "JavaScript async/await vs Promises"',
        relatedId: 'q3',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() // 2 days ago
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);

    // Simulate real-time notifications
    const interval = setInterval(() => {
      // Randomly add new notifications (for demo purposes)
      if (Math.random() < 0.1) { // 10% chance every 5 seconds
        const newNotification: Notification = {
          id: Date.now().toString(),
          userId: user.id,
          type: Math.random() > 0.5 ? 'mention' : 'answer',
          message: Math.random() > 0.5 
            ? `Someone mentioned you: "@${user.username} your solution is perfect!"`
            : 'Someone answered your recent question',
          relatedId: 'new',
          read: false,
          createdAt: new Date().toISOString()
        };

        setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep only 10 notifications
        setUnreadCount(prev => prev + 1);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;

    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      userId: user.id,
      createdAt: new Date().toISOString()
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
    setUnreadCount(prev => prev + 1);
  };

  // Function to detect mentions in text and create notifications
  const processMentions = (text: string, relatedId: string, type: 'answer' | 'comment') => {
    const mentionRegex = /@(\w+)/g;
    const mentions = text.match(mentionRegex);
    
    if (mentions) {
      mentions.forEach(mention => {
        const username = mention.substring(1);
        // In a real app, you'd check if this user exists and create a notification
        console.log(`Creating mention notification for @${username}`);
        
        // For demo purposes, if mentioning the current user
        if (user && username === user.username) {
          addNotification({
            type: 'mention',
            message: `You were mentioned in ${type === 'answer' ? 'an answer' : 'a comment'}: "${text.substring(0, 50)}..."`,
            relatedId,
            read: false
          });
        }
      });
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    processMentions
  };
};