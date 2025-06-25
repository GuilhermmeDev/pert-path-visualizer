
import { useState } from 'react';
import { FileUpload } from '../components/FileUpload';
import { PertDiagram } from '../components/PertDiagram';
import { ProjectSummary } from '../components/ProjectSummary';
import { parseExcelFile } from '../utils/excelParser';
import { calculateCriticalPath } from '../utils/criticalPath';
import { ProjectData, Task } from '../types/project';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';

const Index = () => {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string>('');

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setFileName(file.name);
    
    try {
      const tasks = await parseExcelFile(file);
      
      if (tasks.length === 0) {
        throw new Error('Nenhuma tarefa encontrada no arquivo.');
      }
      
      const calculatedProject = calculateCriticalPath(tasks);
      setProjectData(calculatedProject);
      
      toast({
        title: "Arquivo processado com sucesso!",
        description: `${tasks.length} tarefas foram carregadas e o caminho crítico foi calculado.`,
      });
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      toast({
        title: "Erro ao processar arquivo",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setProjectData(null);
    setFileName('');
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        ID: 'A',
        Name: 'Tarefa A',
        Duration: 5,
        Predecessors: ''
      },
      {
        ID: 'B',
        Name: 'Tarefa B',
        Duration: 3,
        Predecessors: 'A'
      },
      {
        ID: 'C',
        Name: 'Tarefa C',
        Duration: 4,
        Predecessors: 'A'
      },
      {
        ID: 'D',
        Name: 'Tarefa D',
        Duration: 2,
        Predecessors: 'B,C'
      }
    ];
    
    // Simple CSV download for template
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Name,Duration,Predecessors\n"
      + templateData.map(row => `${row.ID},${row.Name},${row.Duration},"${row.Predecessors}"`).join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "template_projeto.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Gerador de Diagrama PERT
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Carregue um arquivo Excel com suas tarefas e gere automaticamente um diagrama PERT 
            com o cálculo do caminho crítico usando o Método do Caminho Crítico (CPM).
          </p>
          
          <div className="flex justify-center gap-4 mt-6">
            <Button onClick={downloadTemplate} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Baixar Template
            </Button>
            {projectData && (
              <Button onClick={handleReset} variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Novo Projeto
              </Button>
            )}
          </div>
        </div>

        {!projectData ? (
          <div className="max-w-4xl mx-auto">
            <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Análise do Projeto: {fileName}
                </h2>
                <div className="text-sm text-gray-500">
                  {projectData.tasks.length} tarefas | Caminho crítico: {projectData.criticalPath.length} tarefas
                </div>
              </div>
              
              <ProjectSummary projectData={projectData} />
              
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Diagrama PERT</h3>
                <p className="text-sm text-gray-600 mb-4">
                  As tarefas em <span className="text-red-600 font-medium">vermelho</span> fazem parte do caminho crítico.
                  ES = Início Mais Cedo, EF = Fim Mais Cedo, LS = Início Mais Tarde, LF = Fim Mais Tarde
                </p>
              </div>
              
              <PertDiagram projectData={projectData} />
              
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-red-800 mb-3">Caminho Crítico</h3>
                  <div className="space-y-2">
                    {projectData.tasks
                      .filter(task => task.isCritical)
                      .map(task => (
                        <div key={task.id} className="bg-red-50 border border-red-200 rounded p-3">
                          <div className="font-medium">{task.name}</div>
                          <div className="text-sm text-gray-600">
                            Duração: {task.duration} dias | Folga: {task.slack} dias
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-green-800 mb-3">Tarefas Não Críticas</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {projectData.tasks
                      .filter(task => !task.isCritical)
                      .map(task => (
                        <div key={task.id} className="bg-green-50 border border-green-200 rounded p-3">
                          <div className="font-medium">{task.name}</div>
                          <div className="text-sm text-gray-600">
                            Duração: {task.duration} dias | Folga: {task.slack} dias
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
