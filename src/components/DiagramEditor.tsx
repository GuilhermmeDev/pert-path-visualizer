import React, { useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import TaskNode, { TaskNodeData } from './TaskNode';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Download, Trash2, Upload } from 'lucide-react';
import { useVisualProject } from '../hooks/useVisualProject';

const nodeTypes = {
  taskNode: TaskNode as any,
};

interface DiagramEditorProps {
  onImportFromExcel?: () => void;
}

export const DiagramEditor = ({ onImportFromExcel }: DiagramEditorProps) => {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    addTask,
    onConnect,
    exportToExcel,
    clearProject,
    visualTasks,
    hasUnsavedChanges,
  } = useVisualProject();

  const [nodesState, setNodesState, onNodesChange] = useNodesState(nodes as Node[]);
  const [edgesState, setEdgesState, onEdgesChange] = useEdgesState(edges);

  // Sync with hook state
  React.useEffect(() => {
    setNodesState(nodes as Node[]);
  }, [nodes, setNodesState]);

  React.useEffect(() => {
    setEdgesState(edges);
  }, [edges, setEdgesState]);

  // Sync changes back to hook
  React.useEffect(() => {
    setNodes(nodesState as Node<TaskNodeData>[]);
  }, [nodesState, setNodes]);

  React.useEffect(() => {
    setEdges(edgesState);
  }, [edgesState, setEdges]);

  const onDoubleClick = useCallback((event: React.MouseEvent) => {
    // Prevent adding nodes when double-clicking on existing nodes
    if ((event.target as HTMLElement).closest('.react-flow__node')) {
      return;
    }
    addTask();
  }, [addTask]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Toolbar */}
      <Card className="p-4 mb-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <Button onClick={addTask} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Tarefa
            </Button>
            <Button 
              variant="outline" 
              onClick={onImportFromExcel}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Importar do Excel
            </Button>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={exportToExcel}
              disabled={visualTasks.length === 0}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar para Excel
            </Button>
            <Button 
              variant="destructive" 
              onClick={clearProject}
              disabled={!hasUnsavedChanges}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Limpar Projeto
            </Button>
          </div>
        </div>

        <div className="mt-3 text-sm text-muted-foreground">
          <p>
            <strong>Dica:</strong> Clique duas vezes no canvas para adicionar uma nova tarefa. 
            Arraste das conexões para criar dependências entre tarefas.
          </p>
          {visualTasks.length > 0 && (
            <p className="mt-1">
              <strong>Status:</strong> {visualTasks.length} tarefas criadas
            </p>
          )}
        </div>
      </Card>

      {/* Diagram Canvas */}
      <div className="flex-1 border border-border rounded-lg bg-background relative">
        <ReactFlow
          nodes={nodesState}
          edges={edgesState}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDoubleClick={onDoubleClick}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          fitViewOptions={{
            padding: 0.2,
            includeHiddenNodes: false,
          }}
          attributionPosition="bottom-left"
          className="bg-background"
        >
          <Controls />
          <Background 
            gap={20} 
            size={1} 
            className="opacity-25" 
          />
        </ReactFlow>

        {visualTasks.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-muted-foreground">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-medium mb-2">Nenhuma tarefa criada</h3>
              <p className="text-sm max-w-md">
                Clique duas vezes no canvas ou use o botão "Adicionar Tarefa" para começar a criar seu diagrama de projeto.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};