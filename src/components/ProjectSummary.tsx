
import { ProjectData } from '../types/project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface ProjectSummaryProps {
  projectData: ProjectData;
}

export const ProjectSummary = ({ projectData }: ProjectSummaryProps) => {
  const criticalTasks = projectData.tasks.filter(task => task.isCritical);
  const nonCriticalTasks = projectData.tasks.filter(task => !task.isCritical);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Duração do Projeto</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{projectData.projectDuration} dias</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tarefas Críticas</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{criticalTasks.length}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {criticalTasks.map(task => task.name).join(', ')}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tarefas Não Críticas</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{nonCriticalTasks.length}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Com folga total de {nonCriticalTasks.reduce((sum, task) => sum + task.slack, 0)} dias
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
