import { useState, useCallback, useMemo } from 'react';
import { Node, Edge, addEdge, Connection } from '@xyflow/react';
import { TaskNodeData } from '../components/TaskNode';
import { Task } from '../types/project';
import * as XLSX from 'xlsx';

interface VisualTask {
  id: string;
  name: string;
  duration: number;
  predecessors: string[];
}

export const useVisualProject = () => {
  const [nodes, setNodes] = useState<Node<TaskNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [nodeIdCounter, setNodeIdCounter] = useState(1);

  // Detect circular dependencies
  const hasCircularDependency = useCallback((newEdge: Connection): boolean => {
    const allEdges = [...edges, newEdge];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const outgoingEdges = allEdges.filter(edge => edge.source === nodeId);
      for (const edge of outgoingEdges) {
        if (hasCycle(edge.target)) return true;
      }

      recursionStack.delete(nodeId);
      return false;
    };

    return hasCycle(newEdge.source!);
  }, [edges]);

  const updateTask = useCallback((id: string, data: { name: string; duration: number }) => {
    setNodes(prev => prev.map(node => 
      node.id === id 
        ? { ...node, data: { ...node.data, ...data } }
        : node
    ));
  }, []);

  const deleteTask = useCallback((id: string) => {
    console.log('Deleting task:', id); // Debug log
    setNodes(prev => {
      const newNodes = prev.filter(node => node.id !== id);
      console.log('Nodes after delete:', newNodes.length); // Debug log
      return newNodes;
    });
    setEdges(prev => {
      const newEdges = prev.filter(edge => edge.source !== id && edge.target !== id);
      console.log('Edges after delete:', newEdges.length); // Debug log
      return newEdges;
    });
  }, []);

  const addTask = useCallback(() => {
    const newId = `task-${nodeIdCounter}`;
    
    const newNode: Node<TaskNodeData> = {
      id: newId,
      type: 'taskNode',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: {
        id: newId,
        name: `Tarefa ${nodeIdCounter}`,
        duration: 1,
        onUpdate: (id: string, data: { name: string; duration: number }) => {
          updateTask(id, data);
        },
        onDelete: (id: string) => {
          deleteTask(id);
        },
      },
    };

    setNodes(prev => [...prev, newNode]);
    setNodeIdCounter(prev => prev + 1);
  }, [nodeIdCounter, updateTask, deleteTask]);

  const onConnect = useCallback((connection: Connection) => {
    if (hasCircularDependency(connection)) {
      alert('Esta conexão criaria uma dependência circular!');
      return;
    }

    setEdges(prev => addEdge({
      ...connection,
      type: 'smoothstep',
      animated: true,
      style: { stroke: 'hsl(var(--primary))' },
    }, prev));
  }, [hasCircularDependency]);

  // Convert visual data to Excel-compatible format
  const visualTasks = useMemo((): VisualTask[] => {
    return nodes.map(node => {
      const predecessors = edges
        .filter(edge => edge.target === node.id)
        .map(edge => edge.source);

      return {
        id: node.data.id,
        name: node.data.name,
        duration: node.data.duration,
        predecessors,
      };
    });
  }, [nodes, edges]);

  const exportToExcel = useCallback(() => {
    const excelData = visualTasks.map(task => ({
      ID: task.id,
      Name: task.name,
      Duration: task.duration,
      Predecessors: task.predecessors.join(','),
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    XLSX.utils.book_append_sheet(wb, ws, 'Tarefas');
    XLSX.writeFile(wb, 'projeto_visual.xlsx');
  }, [visualTasks]);

  const clearProject = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setNodeIdCounter(1);
  }, []);

  const importFromTasks = useCallback((tasks: Task[]) => {
    // Clear existing project
    clearProject();

    // Create nodes
    const newNodes: Node<TaskNodeData>[] = tasks.map((task, index) => ({
      id: task.id,
      type: 'taskNode',
      position: { 
        x: (index % 4) * 220 + 100, 
        y: Math.floor(index / 4) * 150 + 100 
      },
      data: {
        id: task.id,
        name: task.name,
        duration: task.duration,
        onUpdate: (id: string, data: { name: string; duration: number }) => {
          updateTask(id, data);
        },
        onDelete: (id: string) => {
          deleteTask(id);
        },
      },
    }));

    // Create edges based on predecessors
    const newEdges: Edge[] = [];
    tasks.forEach(task => {
      task.predecessors.forEach(predId => {
        if (tasks.find(t => t.id === predId)) {
          newEdges.push({
            id: `${predId}-${task.id}`,
            source: predId,
            target: task.id,
            type: 'smoothstep',
            animated: true,
            style: { stroke: 'hsl(var(--primary))' },
          });
        }
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
    setNodeIdCounter(tasks.length + 1);
  }, [updateTask, deleteTask, clearProject]);

  return {
    nodes,
    edges,
    addTask,
    onConnect,
    exportToExcel,
    clearProject,
    importFromTasks,
    visualTasks,
    hasUnsavedChanges: nodes.length > 0 || edges.length > 0,
  };
};