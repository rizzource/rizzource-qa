import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileSpreadsheet, Shield } from 'lucide-react';
import { useAuth } from './AuthProvider';

import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

export const DataExport = () => {
  const [selectedTable, setSelectedTable] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const { isAdmin } = useAuth();

  const tableOptions = [
    { value: 'mentees', label: 'Mentees', description: 'All mentee applications and details' },
    { value: 'mentors', label: 'Mentors', description: 'All mentor applications and details' },
    { value: 'feedback', label: 'Feedback', description: 'User feedback submissions' },
  ];

  const exportToExcel = async () => {
    if (!selectedTable) {
      toast.error("Please select a table to export");
      return;
    }

    if (!isAdmin()) {
      toast.error("Admin privileges required for data export");
      return;
    }

    setIsExporting(true);
    
    try {
      // Call the secure export function
      const { data, error } = await supabase
        .rpc('export_data_to_json', { table_name: selectedTable });

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        toast.info(`No records found in ${selectedTable} table`);
        setIsExporting(false);
        return;
      }

      // Convert JSON to Excel
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, selectedTable);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${selectedTable}_export_${timestamp}.xlsx`;

      // Download file
      XLSX.writeFile(workbook, filename);

      toast.success(`${data.length} records exported to ${filename}`);

    } catch (error) {
      console.error('Export error:', error);
      toast.error(error.message || "Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  if (!isAdmin()) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-destructive" />
            Access Restricted
          </CardTitle>
          <CardDescription>
            Admin privileges required to access data export functionality.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Data Export
        </CardTitle>
        <CardDescription>
          Export mentorship program data to Excel for analysis and continuity with existing systems.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Select Table to Export</label>
          <Select value={selectedTable} onValueChange={setSelectedTable}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a table..." />
            </SelectTrigger>
            <SelectContent>
              {tableOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={exportToExcel} 
          disabled={!selectedTable || isExporting}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export to Excel'}
        </Button>

        <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
          <strong>Security Note:</strong> All data exports are logged and audited. 
          Only administrators can access sensitive personal information.
        </div>
      </CardContent>
    </Card>
  );
};