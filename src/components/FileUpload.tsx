
import { useCallback } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

export const FileUpload = ({ onFileUpload, isLoading }: FileUploadProps) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.match(/\.(xlsx|xls)$/)) {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione um arquivo Excel (.xlsx ou .xls)",
          variant: "destructive"
        });
        return;
      }
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.match(/\.(xlsx|xls)$/)) {
      onFileUpload(file);
    } else {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione um arquivo Excel (.xlsx ou .xls)",
        variant: "destructive"
      });
    }
  }, [onFileUpload]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
          disabled={isLoading}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <FileSpreadsheet className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Carregue seu arquivo Excel
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Arraste e solte ou clique para selecionar
              </p>
            </div>
            <Button variant="outline" disabled={isLoading}>
              <Upload className="h-4 w-4 mr-2" />
              {isLoading ? 'Processando...' : 'Selecionar Arquivo'}
            </Button>
          </div>
        </label>
      </div>
      
      <div className="mt-6 text-sm text-gray-600">
        <h4 className="font-medium mb-2">Formato esperado do Excel:</h4>
        <ul className="space-y-1 text-xs">
          <li>• <strong>ID:</strong> Identificador único da tarefa</li>
          <li>• <strong>Name/Nome:</strong> Nome da tarefa</li>
          <li>• <strong>Duration/Duracao:</strong> Duração em dias</li>
          <li>• <strong>Predecessors/Predecessoras:</strong> IDs das tarefas predecessoras (separados por vírgula)</li>
        </ul>
      </div>
    </div>
  );
};
