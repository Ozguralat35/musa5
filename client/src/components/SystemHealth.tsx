import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/apiClient';

interface HealthStatus {
  status: 'healthy' | 'down' | 'checking';
  database: {
    supabase: 'connected' | 'disconnected';
  };
  timestamp: string;
}

const SystemHealth: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus>({
    status: 'checking',
    database: {
      supabase: 'disconnected'
    },
    timestamp: new Date().toISOString()
  });

  const checkHealth = async () => {
    try {
      const { data, error } = await apiClient.getSystemHealth();
      
      if (error || !data) {
        setHealth(prev => ({
          ...prev,
          status: 'down'
        }));
        return;
      }

      setHealth(data);
    } catch (error) {
      console.warn('Health check failed:', error);
      setHealth(prev => ({
        ...prev,
        status: 'down'
      }));
    }
  };

  useEffect(() => {
    checkHealth();
    
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      case 'checking':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Sistem Durumu
        </h3>
        <button
          onClick={checkHealth}
          className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Yenile
        </button>
      </div>
      
      <div className={`p-3 rounded-lg ${health.status === 'healthy' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`font-medium ${getStatusColor(health.status)}`}>
            {health.status === 'healthy' && '✅ Sistem Sağlıklı'}
            {health.status === 'down' && '❌ Sistem Çalışmıyor'}
            {health.status === 'checking' && '🔄 Kontrol Ediliyor...'}
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${health.database.supabase === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
            Supabase: {health.database.supabase}
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Son güncelleme: {new Date(health.timestamp).toLocaleTimeString('tr-TR')}
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;