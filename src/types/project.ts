
export interface Task {
  id: string;
  name: string;
  duration: number;
  predecessors: string[];
  earlyStart: number;
  earlyFinish: number;
  lateStart: number;
  lateFinish: number;
  slack: number;
  isCritical: boolean;
}

export interface ProjectData {
  tasks: Task[];
  criticalPath: string[];
  projectDuration: number;
}
