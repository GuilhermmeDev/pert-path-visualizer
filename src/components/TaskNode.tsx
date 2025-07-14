import { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Edit3, Check } from 'lucide-react';

export interface TaskNodeData extends Record<string, unknown> {
  id: string;
  name: string;
  duration: number;
  onUpdate: (id: string, data: { name: string; duration: number }) => void;
  onDelete: (id: string) => void;
}

const TaskNode = memo(({ data }: NodeProps) => {
  const taskData = data as TaskNodeData;
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(taskData.name);
  const [duration, setDuration] = useState(taskData.duration.toString());

  const handleSave = useCallback(() => {
    const durationNum = parseInt(duration) || 1;
    taskData.onUpdate(taskData.id, { name: name.trim() || 'Nova Tarefa', duration: durationNum });
    setIsEditing(false);
  }, [name, duration, taskData]);

  const handleCancel = useCallback(() => {
    setName(taskData.name);
    setDuration(taskData.duration.toString());
    setIsEditing(false);
  }, [taskData.name, taskData.duration]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  }, [handleSave, handleCancel]);

  return (
    <Card className="min-w-[180px] bg-background border-2 border-border shadow-lg">
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-primary !border-primary-foreground"
      />
      
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-muted-foreground">#{taskData.id}</span>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <Check className="h-3 w-3" /> : <Edit3 className="h-3 w-3" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              onClick={() => taskData.onDelete(taskData.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Nome da tarefa"
              className="h-8 text-sm"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Duração"
                className="h-8 text-sm"
                min="1"
              />
              <span className="text-xs text-muted-foreground">dias</span>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="font-medium text-sm text-foreground">{taskData.name}</div>
            <div className="text-xs text-muted-foreground">
              Duração: {taskData.duration} dias
            </div>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-primary !border-primary-foreground"
      />
    </Card>
  );
});

TaskNode.displayName = 'TaskNode';

export default TaskNode;