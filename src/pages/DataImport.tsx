import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileSpreadsheet, FileJson, ArrowRight, CheckCircle, AlertCircle, Loader2, Download } from "lucide-react";
import {
import { Helmet } from "react-helmet-async";
  parseCSV, parseJSON, autoMapColumns, applyMappings,
  TARGET_FIELDS, type ImportType, type ParsedRow, type ColumnMapping
} from "@/utils/importParser";

type Step = 'upload' | 'map' | 'preview' | 'importing' | 'done';

export default function DataImport() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('upload');
  const [importType, setImportType] = useState<ImportType>('tasks');
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [importResult, setImportResult] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 });
  const [projectId, setProjectId] = useState<string>('');
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);

  // Load user projects
  const loadProjects = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('pmi_projects').select('id, name').eq('user_id', user.id);
    if (data && data.length > 0) {
      setProjects(data);
      setProjectId(data[0].id);
    }
  }, []);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [importType]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [importType]);

  const processFile = async (file: File) => {
    setFileName(file.name);
    const text = await file.text();
    const isJSON = file.name.endsWith('.json') || text.trim().startsWith('[') || text.trim().startsWith('{');

    try {
      const parsed = isJSON ? parseJSON(text) : parseCSV(text);
      if (parsed.headers.length === 0) {
        toast({ title: "Empty file", description: "No data found in the uploaded file.", variant: "destructive" });
        return;
      }
      setHeaders(parsed.headers);
      setRows(parsed.rows);
      const auto = autoMapColumns(parsed.headers, importType);
      setMappings(auto);
      setStep('map');
      toast({ title: `Parsed ${parsed.rows.length} rows`, description: `${auto.length} columns auto-mapped.` });
    } catch {
      toast({ title: "Parse error", description: "Could not parse the file. Check the format.", variant: "destructive" });
    }
  };

  const updateMapping = (targetField: string, sourceColumn: string) => {
    setMappings(prev => {
      const existing = prev.filter(m => m.targetField !== targetField);
      if (sourceColumn === '__none__') return existing;
      return [...existing, { sourceColumn, targetField }];
    });
  };

  const getMappedSource = (targetField: string) =>
    mappings.find(m => m.targetField === targetField)?.sourceColumn ?? '__none__';

  const handleImport = async () => {
    const requiredFields = TARGET_FIELDS[importType].filter(f => f.required);
    const missingRequired = requiredFields.filter(f => !mappings.some(m => m.targetField === f.field));
    if (missingRequired.length > 0) {
      toast({ title: "Missing required mappings", description: `Map: ${missingRequired.map(f => f.label).join(', ')}`, variant: "destructive" });
      return;
    }

    if (importType !== 'projects' && !projectId) {
      toast({ title: "Select a project", description: "You need a project to import into.", variant: "destructive" });
      return;
    }

    setStep('importing');
    const mapped = applyMappings(rows, mappings);
    let success = 0, failed = 0;

    // Batch insert
    const BATCH = 50;
    for (let i = 0; i < mapped.length; i += BATCH) {
      const batch = mapped.slice(i, i + BATCH);

      if (importType === 'tasks') {
        const items = batch.map((r, idx) => ({
          title: String(r.title || 'Untitled Task'),
          description: r.description as string | null,
          status: (r.status as string) || 'backlog',
          priority: (r.priority as string) || 'medium',
          story_points: r.story_points as number | null,
          item_type: (r.item_type as string) || 'story',
          due_date: r.due_date as string | null,
          labels: r.labels as string[] | null,
          project_id: projectId,
          position: i + idx,
        }));
        const { error } = await supabase.from('native_backlog_items').insert(items);
        if (error) { failed += batch.length; } else { success += batch.length; }
      } else if (importType === 'epics') {
        const { data: { user } } = await supabase.auth.getUser();
        const items = batch.map(r => ({
          title: String(r.title || 'Untitled Epic'),
          description: r.description as string | null,
          status: (r.status as string) || 'draft',
          priority: (r.priority as string) || 'medium',
          business_value: r.business_value as number | null,
          effort_estimate: r.effort_estimate as number | null,
          start_date: r.start_date as string | null,
          end_date: r.end_date as string | null,
          business_justification: r.business_justification as string | null,
          created_by: user?.id,
        }));
        const { error } = await supabase.from('epics').insert(items);
        if (error) { failed += batch.length; } else { success += batch.length; }
      } else if (importType === 'projects') {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) break;
        for (const r of batch) {
          const { error } = await supabase.from('pmi_projects').insert({
            name: String(r.name || 'Untitled Project'),
            description: r.description as string | null,
            status: (r.status as string) || 'active',
            target_completion_date: r.target_completion_date as string | null,
            user_id: user.id,
          });
          if (error) { failed++; } else { success++; }
        }
      }
    }

    setImportResult({ success, failed });
    setStep('done');
  };

  const downloadTemplate = (type: ImportType) => {
    const fields = TARGET_FIELDS[type];
    const header = fields.map(f => f.field).join(',');
    const example = fields.map(f => {
      const examples: Record<string, string> = {
        title: 'Example Item', name: 'My Project', description: 'A description',
        status: 'active', priority: 'high', story_points: '5', item_type: 'story',
        due_date: '2026-04-30', labels: 'frontend,urgent', business_value: '8',
        effort_estimate: '13', start_date: '2026-04-01', end_date: '2026-06-30',
        business_justification: 'Increases retention by 20%',
        target_completion_date: '2026-06-30',
      };
      return examples[f.field] ?? '';
    }).join(',');

    const csv = `${header}\n${example}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${type}_template.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const previewData = applyMappings(rows.slice(0, 5), mappings);

  return (
    <DashboardLayout>
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Helmet>
          <title>Import Data - SAAI</title>
          <meta name="description" content="Import your existing project data from CSV, Jira, or other tools into SAAI." />
        </Helmet>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("pages.dataImport.title")}</h1>
          <p className="text-muted-foreground">{t("pages.dataImport.subtitle")}</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-8">
          {(['upload', 'map', 'preview', 'done'] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === s || (step === 'importing' && s === 'preview') ? 'bg-primary text-primary-foreground'
                : ['map', 'preview', 'done'].indexOf(step) > ['upload', 'map', 'preview', 'done'].indexOf(s) ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
              }`}>{i + 1}</div>
              {i < 3 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
            </div>
          ))}
        </div>

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Choose Import Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {(['tasks', 'epics', 'projects'] as ImportType[]).map(t => (
                    <button
                      key={t}
                      onClick={() => setImportType(t)}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        importType === t ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <p className="font-semibold capitalize">{t === 'projects' ? 'Project Charters' : t}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t === 'tasks' ? 'Backlog items & stories' : t === 'epics' ? 'Large initiatives' : 'Project definitions'}
                      </p>
                    </button>
                  ))}
                </div>

                <Button variant="outline" size="sm" onClick={() => downloadTemplate(importType)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download {importType} CSV template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upload File</CardTitle>
                <CardDescription>Drag & drop or click to upload a CSV or JSON file</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className="border-2 border-dashed rounded-xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <div className="flex justify-center gap-3 mb-4">
                    <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
                    <FileJson className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium mb-1">Drop your file here</p>
                  <p className="text-sm text-muted-foreground">Supports .csv and .json formats</p>
                  <input
                    id="file-input"
                    type="file"
                    accept=".csv,.json"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Column Mapping */}
        {step === 'map' && (
          <Card>
            <CardHeader>
              <CardTitle>Map Columns</CardTitle>
              <CardDescription>
                {fileName} — {rows.length} rows detected. Map your columns to Spark-Agile fields.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {importType !== 'projects' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Project</label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                    <SelectContent>
                      {projects.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {projects.length === 0 && (
                    <p className="text-sm text-destructive">No projects found. Create a project first or import as Project Charters.</p>
                  )}
                </div>
              )}

              <div className="space-y-3">
                {TARGET_FIELDS[importType].map(target => (
                  <div key={target.field} className="flex items-center gap-4">
                    <div className="w-48 flex items-center gap-2">
                      <span className="text-sm font-medium">{target.label}</span>
                      {target.required && <Badge variant="destructive" className="text-[10px] px-1 py-0">Required</Badge>}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Select value={getMappedSource(target.field)} onValueChange={v => updateMapping(target.field, v)}>
                      <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— Skip —</SelectItem>
                        {headers.map(h => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {getMappedSource(target.field) !== '__none__' && (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep('upload')}>Back</Button>
                <Button onClick={() => setStep('preview')}>Preview Import</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Preview */}
        {(step === 'preview' || step === 'importing') && (
          <Card>
            <CardHeader>
              <CardTitle>Preview ({rows.length} rows total, showing first 5)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {mappings.map(m => (
                        <TableHead key={m.targetField}>{TARGET_FIELDS[importType].find(f => f.field === m.targetField)?.label ?? m.targetField}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((row, i) => (
                      <TableRow key={i}>
                        {mappings.map(m => (
                          <TableCell key={m.targetField} className="max-w-48 truncate">
                            {row[m.targetField] != null ? String(row[m.targetField]) : '—'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('map')} disabled={step === 'importing'}>Back</Button>
                <Button onClick={handleImport} disabled={step === 'importing'}>
                  {step === 'importing' ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Importing...</>
                  ) : (
                    <><Upload className="h-4 w-4 mr-2" />Import {rows.length} {importType}</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Done */}
        {step === 'done' && (
          <Card>
            <CardContent className="py-12 text-center space-y-4">
              {importResult.failed === 0 ? (
                <CheckCircle className="h-16 w-16 text-primary mx-auto" />
              ) : (
                <AlertCircle className="h-16 w-16 text-accent mx-auto" />
              )}
              <h2 className="text-2xl font-bold">Import Complete</h2>
              <div className="flex justify-center gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{importResult.success}</p>
                  <p className="text-sm text-muted-foreground">Imported</p>
                </div>
                {importResult.failed > 0 && (
                  <div className="text-center">
                    <p className="text-3xl font-bold text-destructive">{importResult.failed}</p>
                    <p className="text-sm text-muted-foreground">Failed</p>
                  </div>
                )}
              </div>
              <div className="flex justify-center gap-3 pt-4">
                <Button variant="outline" onClick={() => { setStep('upload'); setRows([]); setHeaders([]); setMappings([]); }}>
                  Import More
                </Button>
                <Button onClick={() => window.location.href = importType === 'projects' ? '/my-projects' : '/project-command-centre'}>
                  View {importType === 'projects' ? 'Projects' : 'Board'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </DashboardLayout>
  );
}
