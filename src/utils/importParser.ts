// CSV/JSON parser for data import

export type ImportType = 'tasks' | 'epics' | 'projects';

export interface ParsedRow {
  [key: string]: string;
}

export interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
}

export const TARGET_FIELDS: Record<ImportType, { field: string; label: string; required: boolean }[]> = {
  tasks: [
    { field: 'title', label: 'Title', required: true },
    { field: 'description', label: 'Description', required: false },
    { field: 'status', label: 'Status', required: false },
    { field: 'priority', label: 'Priority', required: false },
    { field: 'story_points', label: 'Story Points', required: false },
    { field: 'item_type', label: 'Type (story/task/bug)', required: false },
    { field: 'due_date', label: 'Due Date', required: false },
    { field: 'labels', label: 'Labels (comma-separated)', required: false },
  ],
  epics: [
    { field: 'title', label: 'Title', required: true },
    { field: 'description', label: 'Description', required: false },
    { field: 'status', label: 'Status', required: false },
    { field: 'priority', label: 'Priority', required: false },
    { field: 'business_value', label: 'Business Value', required: false },
    { field: 'effort_estimate', label: 'Effort Estimate', required: false },
    { field: 'start_date', label: 'Start Date', required: false },
    { field: 'end_date', label: 'End Date', required: false },
    { field: 'business_justification', label: 'Business Justification', required: false },
  ],
  projects: [
    { field: 'name', label: 'Project Name', required: true },
    { field: 'description', label: 'Description', required: false },
    { field: 'status', label: 'Status', required: false },
    { field: 'target_completion_date', label: 'Target Completion Date', required: false },
  ],
};

export function parseCSV(text: string): { headers: string[]; rows: ParsedRow[] } {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = parseCSVLine(lines[0]);
  const rows: ParsedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0 || (values.length === 1 && !values[0])) continue;
    const row: ParsedRow = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? '';
    });
    rows.push(row);
  }

  return { headers, rows };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current.trim());
  return result;
}

export function parseJSON(text: string): { headers: string[]; rows: ParsedRow[] } {
  const data = JSON.parse(text);
  const arr = Array.isArray(data) ? data : data.items ?? data.data ?? data.rows ?? [data];

  if (arr.length === 0) return { headers: [], rows: [] };

  const headers = [...new Set(arr.flatMap((item: Record<string, unknown>) => Object.keys(item)))];
  const rows: ParsedRow[] = arr.map((item: Record<string, unknown>) => {
    const row: ParsedRow = {};
    headers.forEach(h => {
      const val = item[h];
      row[h] = val == null ? '' : typeof val === 'object' ? JSON.stringify(val) : String(val);
    });
    return row;
  });

  return { headers, rows };
}

export function autoMapColumns(sourceHeaders: string[], importType: ImportType): ColumnMapping[] {
  const targets = TARGET_FIELDS[importType];
  const mappings: ColumnMapping[] = [];

  for (const target of targets) {
    const normalised = target.field.toLowerCase().replace(/_/g, '');
    const match = sourceHeaders.find(h => {
      const hn = h.toLowerCase().replace(/[_\s-]/g, '');
      return hn === normalised
        || hn === target.label.toLowerCase().replace(/[_\s-]/g, '')
        || hn.includes(normalised)
        || normalised.includes(hn);
    });
    if (match) {
      mappings.push({ sourceColumn: match, targetField: target.field });
    }
  }

  return mappings;
}

export function applyMappings(rows: ParsedRow[], mappings: ColumnMapping[]): Record<string, string | number | string[] | null>[] {
  return rows.map(row => {
    const mapped: Record<string, string | number | string[] | null> = {};
    for (const m of mappings) {
      let value: string | number | string[] | null = row[m.sourceColumn] ?? '';
      // Type coercion
      if (['story_points', 'business_value', 'effort_estimate', 'progress'].includes(m.targetField)) {
        const num = Number(value);
        value = isNaN(num) ? null : num;
      }
      if (m.targetField === 'labels' && typeof value === 'string' && value) {
        value = value.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      mapped[m.targetField] = value || null;
    }
    return mapped;
  });
}
