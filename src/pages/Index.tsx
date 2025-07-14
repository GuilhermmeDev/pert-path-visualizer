import { useState } from 'react';
import { FileUpload } from '../components/FileUpload';
import { PertDiagram } from '../components/PertDiagram';
import { ProjectSummary } from '../components/ProjectSummary';
import { DiagramEditor } from '../components/DiagramEditor';
import { parseExcelFile } from '../utils/excelParser';
import { calculateCriticalPath } from '../utils/criticalPath';
import { ProjectData, Task } from '../types/project';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileText, Edit, BarChart3 } from 'lucide-react';
import * as XLSX from 'xlsx';

const Index = () => {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [activeTab, setActiveTab] = useState('upload');

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
      setActiveTab('analysis');
      
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
    setActiveTab('upload');
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
    
    // Create Excel workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Tarefas');
    
    // Generate Excel file and download
    XLSX.writeFile(wb, 'template_projeto.xlsx');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Gerador de Diagrama PERT
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Crie e edite diagramas de projeto visualmente ou importe dados do Excel. 
            Calcule automaticamente o caminho crítico usando o Método do Caminho Crítico (CPM).
          </p>
          
          <div className="flex justify-center gap-4 mt-6">
            <Button onClick={downloadTemplate} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Baixar Template Excel
            </Button>
            {projectData && (
              <Button onClick={handleReset} variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Novo Projeto
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-7xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Importar Excel
            </TabsTrigger>
            <TabsTrigger value="editor" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Editor Visual
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2" disabled={!projectData}>
              <BarChart3 className="h-4 w-4" />
              Análise PERT
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-6">
            <div className="max-w-4xl mx-auto">
              <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />
            </div>
          </TabsContent>

          <TabsContent value="editor" className="mt-6">
            <div className="h-[700px]">
              <DiagramEditor onImportFromExcel={() => setActiveTab('upload')} />
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="mt-6">
            {projectData && (
              <div className="bg-card rounded-lg shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-foreground">
                    Análise do Projeto: {fileName}
                  </h2>
                  <div className="text-sm text-muted-foreground">
                    {projectData.tasks.length} tarefas | Caminho crítico: {projectData.criticalPath.length} tarefas
                  </div>
                </div>
                
                <ProjectSummary projectData={projectData} />
                
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Diagrama PERT</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    As tarefas em <span className="text-destructive font-medium">vermelho</span> fazem parte do caminho crítico.
                    ES = Início Mais Cedo, EF = Fim Mais Cedo, LS = Início Mais Tarde, LF = Fim Mais Tarde
                  </p>
                </div>
                
                <PertDiagram projectData={projectData} />
                
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-destructive mb-3">Caminho Crítico</h3>
                    <div className="space-y-2">
                      {projectData.tasks
                        .filter(task => task.isCritical)
                        .map(task => (
                          <div key={task.id} className="bg-destructive/10 border border-destructive/20 rounded p-3">
                            <div className="font-medium">{task.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Duração: {task.duration} dias | Folga: {task.slack} dias
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-3">Tarefas Não Críticas</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {projectData.tasks
                        .filter(task => !task.isCritical)
                        .map(task => (
                          <div key={task.id} className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded p-3">
                            <div className="font-medium">{task.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Duração: {task.duration} dias | Folga: {task.slack} dias
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
