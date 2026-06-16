import React, { useEffect, useState } from 'react';
import { FaRocket, FaDatabase } from 'react-icons/fa';
import './NotificationsPage.css';
import API_BASE_URL from '../config/api';

const iconMap = {
  warning: <FaDatabase />,
  reminder: <FaDatabase />,
  system: <FaRocket />,
  group_message: <FaRocket />,
  private_message: <FaRocket />
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/notifications`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken')
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setNotifications(data.data);
        } else {
          setError(data.message || 'Erreur lors du chargement des notifications');
        }
      })
      .catch(() => {
        setError('Erreur reseau lors du chargement des notifications');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Chargement des notifications...</p>;

  return (
    <div className="notifications-page">
      <header className="notifications-header">
        <h2>Notifications</h2>
        <p className="notifications-count">{notifications.length} notifications</p>
      </header>

      {error && <p className="error-message">{error}</p>}

      <section className="notifications-list">
        {notifications.map((notif) => (
          <div key={notif.notification_id} className="notification-card">
            <div className="notification-icon">
              {iconMap[notif.type] || <FaDatabase />}
            </div>
            <div className="notification-content">
              <strong>{notif.type.charAt(0).toUpperCase() + notif.type.slice(1)}</strong>
              <p>{notif.content}</p>
            </div>
            <div className="notification-time">
              {new Date(notif.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default NotificationsPage;
