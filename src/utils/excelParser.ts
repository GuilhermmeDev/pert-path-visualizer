
import * as XLSX from 'xlsx';
import { Task, ProjectData } from '../types/project';

export const parseExcelFile = (file: File): Promise<Task[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const tasks: Task[] = jsonData.map((row: any, index: number) => {
          const predecessors = row.Predecessors || row.Predecessoras || '';
          const predecessorList = predecessors
            .toString()
            .split(',')
            .map((p: string) => p.trim())
            .filter((p: string) => p !== '');
            
          return {
            id: row.ID?.toString() || (index + 1).toString(),
            name: row.Name || row.Nome || row.Task || row.Tarefa || `Tarefa ${index + 1}`,
            duration: parseInt(row.Duration || row.Duracao || row.Duração || '0'),
            predecessors: predecessorList,
            earlyStart: 0,
            earlyFinish: 0,
            lateStart: 0,
            lateFinish: 0,
            slack: 0,
            isCritical: false
          };
        });
        
        resolve(tasks);
      } catch (error) {
        reject(new Error('Erro ao processar arquivo Excel. Verifique o formato.'));
      }
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler o arquivo.'));
    reader.readAsArrayBuffer(file);
  });
};
