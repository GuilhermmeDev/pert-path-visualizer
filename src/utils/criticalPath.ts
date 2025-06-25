
import { Task, ProjectData } from '../types/project';

export const calculateCriticalPath = (tasks: Task[]): ProjectData => {
  // Create a map for quick task lookup
  const taskMap = new Map(tasks.map(task => [task.id, task]));
  
  // Forward pass - calculate early start and early finish
  const calculateForwardPass = () => {
    const visited = new Set<string>();
    
    const calculateEarlyTimes = (taskId: string): void => {
      if (visited.has(taskId)) return;
      
      const task = taskMap.get(taskId);
      if (!task) return;
      
      // Calculate predecessors first
      for (const predId of task.predecessors) {
        calculateEarlyTimes(predId);
      }
      
      // Calculate early start
      if (task.predecessors.length === 0) {
        task.earlyStart = 0;
      } else {
        task.earlyStart = Math.max(
          ...task.predecessors.map(predId => {
            const pred = taskMap.get(predId);
            return pred ? pred.earlyFinish : 0;
          })
        );
      }
      
      // Calculate early finish
      task.earlyFinish = task.earlyStart + task.duration;
      visited.add(taskId);
    };
    
    // Calculate for all tasks
    tasks.forEach(task => calculateEarlyTimes(task.id));
  };
  
  // Backward pass - calculate late start and late finish
  const calculateBackwardPass = (projectDuration: number) => {
    const visited = new Set<string>();
    
    const calculateLateTimes = (taskId: string): void => {
      if (visited.has(taskId)) return;
      
      const task = taskMap.get(taskId);
      if (!task) return;
      
      // Find successors
      const successors = tasks.filter(t => t.predecessors.includes(taskId));
      
      // Calculate successors first
      for (const successor of successors) {
        calculateLateTimes(successor.id);
      }
      
      // Calculate late finish
      if (successors.length === 0) {
        task.lateFinish = projectDuration;
      } else {
        task.lateFinish = Math.min(
          ...successors.map(successor => successor.lateStart)
        );
      }
      
      // Calculate late start
      task.lateStart = task.lateFinish - task.duration;
      visited.add(taskId);
    };
    
    // Calculate for all tasks
    tasks.forEach(task => calculateLateTimes(task.id));
  };
  
  // Calculate slack and identify critical path
  const calculateSlackAndCriticalPath = () => {
    const criticalTasks: string[] = [];
    
    tasks.forEach(task => {
      task.slack = task.lateStart - task.earlyStart;
      task.isCritical = task.slack === 0;
      
      if (task.isCritical) {
        criticalTasks.push(task.id);
      }
    });
    
    return criticalTasks;
  };
  
  // Execute calculations
  calculateForwardPass();
  const projectDuration = Math.max(...tasks.map(task => task.earlyFinish));
  calculateBackwardPass(projectDuration);
  const criticalPath = calculateSlackAndCriticalPath();
  
  return {
    tasks,
    criticalPath,
    projectDuration
  };
};
