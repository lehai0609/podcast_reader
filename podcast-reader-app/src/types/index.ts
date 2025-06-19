// Common type definitions
export interface User {
  id: string;
  email: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  topics: string[];
  notificationSettings: NotificationSettings;
}

export interface NotificationSettings {
  enabled: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  timeWindow?: {
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
  dailyLimit: number;
}

export interface Episode {
  id: string;
  title: string;
  showName: string;
  transcriptText: string;
  summaryArticle: string;
  publishedDate: Date;
  audioUrl?: string;
  topics: string[];
}

export interface Topic {
  id: string;
  name: string;
  category: string;
}
