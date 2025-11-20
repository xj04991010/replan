export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  plan: "free" | "pro";
  customTasks: {
    [taskId: string]: {
      label: string;
      active: boolean;
      order: number;
    };
  };
  createdAt: any;
}

export interface DailyLog {
  id: string;
  uid: string;
  date: string;
  taskCompletion: {
    [taskId: string]: boolean;
  };
  moodScore?: number;
  note?: string;
  updatedAt: any;
}

export interface CoachReport {
  id: string;
  uid: string;
  rangeType: "7days";
  startDate: string;
  endDate: string;
  content: {
    trend_summary: string;
    tough_love: string;
    action_plan: string[];
  };
  createdAt: any;
}

export interface EventLog {
  id: string;
  uid: string;
  type: "fake_door_click" | "weekly_report_generated";
  createdAt: any;
  metadata?: {
    [key: string]: any;
  };
}
