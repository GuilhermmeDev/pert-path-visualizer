
import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ProjectData } from '../types/project';

interface PertDiagramProps {
  projectData: ProjectData;
}

export const PertDiagram = ({ projectData }: PertDiagramProps) => {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    // Calculate positions using a simple grid layout
    const cols = Math.ceil(Math.sqrt(projectData.tasks.length));
    const spacing = 200;
    
    projectData.tasks.forEach((task, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      nodes.push({
        id: task.id,
        type: 'default',
        position: { x: col * spacing, y: row * spacing },
        data: {
          label: (
            <div className="text-center">
              <div className="font-bold text-sm">{task.name}</div>
              <div className="text-xs mt-1">
                <div>Duração: {task.duration}d</div>
                <div>ES: {task.earlyStart} | EF: {task.earlyFinish}</div>
                <div>LS: {task.lateStart} | LF: {task.lateFinish}</div>
                <div>Folga: {task.slack}</div>
              </div>
            </div>
          )
        },
        style: {
          background: task.isCritical ? '#fee2e2' : '#f3f4f6',
          border: task.isCritical ? '2px solid #dc2626' : '1px solid #d1d5db',
          borderRadius: '8px',
          width: 160,
          height: 120,
          fontSize: '12px'
        }
      });
    });
    
    // Create edges based on predecessors
    projectData.tasks.forEach(task => {
      task.predecessors.forEach(predId => {
        edges.push({
          id: `${predId}-${task.id}`,
          source: predId,
          target: task.id,
          type: 'smoothstep',
          animated: task.isCritical && projectData.tasks.find(t => t.id === predId)?.isCritical,
          style: {
            stroke: task.isCritical && projectData.tasks.find(t => t.id === predId)?.isCritical 
              ? '#dc2626' 
              : '#6b7280',
            strokeWidth: task.isCritical && projectData.tasks.find(t => t.id === predId)?.isCritical 
              ? 2 
              : 1
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: task.isCritical && projectData.tasks.find(t => t.id === predId)?.isCritical 
              ? '#dc2626' 
              : '#6b7280'
          }
        });
      });
    });
    
    return { nodes, edges };
  }, [projectData]);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  return (
    <div className="w-full h-[600px] border border-gray-200 rounded-lg bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <Background variant="dots" gap={20} size={1} />
      </ReactFlow>
    </div>
  );
};
