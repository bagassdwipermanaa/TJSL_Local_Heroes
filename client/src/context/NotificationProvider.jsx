import React, { useState, useCallback, useEffect } from 'react';
import { AUDIT_LOG_KEY } from '../utils/constants';
import { NotificationContext } from './notificationContextInstance';

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [auditLogs, setAuditLogs] = useState(() => {
    try {
      const saved = localStorage.getItem(AUDIT_LOG_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save audit logs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(auditLogs));
    } catch (err) {
      console.error('Failed to save audit logs:', err);
    }
  }, [auditLogs]);

  const addAuditLog = useCallback((logEntry) => {
    const entry = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString(),
      formattedTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      formattedDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      ...logEntry
    };
    setAuditLogs(prev => [entry, ...prev.slice(0, 199)]); // Keep last 200 logs
  }, []);

  const showNotification = useCallback(({ type = 'info', title, message, duration = 3500 }) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newToast = { id, type, title, message };

    setNotifications(prev => [...prev, newToast]);

    // Also record into Audit Log
    addAuditLog({
      type,
      title,
      message,
      action: title
    });

    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, [addAuditLog]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearAuditLogs = useCallback(() => {
    setAuditLogs([]);
    try {
      localStorage.removeItem(AUDIT_LOG_KEY);
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification, notifications, removeNotification, auditLogs, clearAuditLogs }}>
      {children}
    </NotificationContext.Provider>
  );
}
