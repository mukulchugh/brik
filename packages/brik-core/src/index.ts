import {
    NodeSchema,
    RootSchema,
    type Accessibility,
    type Node,
    type NormalizedStyle,
    type Root,
} from '@brik/schemas';

export type { Accessibility, Node, NormalizedStyle, Root };

export const validateRoot = (data: unknown): Root => {
  const parsed = RootSchema.safeParse(data);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid IR Root:\n${message}`);
  }
  return parsed.data;
};

export const validateNode = (node: unknown): Node => {
  const parsed = NodeSchema.safeParse(node);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid IR Node:\n${message}`);
  }
  return parsed.data;
};

export interface Diagnostic {
  code: string;
  message: string;
  filePath?: string;
  loc?: { line: number; column: number };
  severity: 'error' | 'warning' | 'info';
}

export class BrikError extends Error {
  public diagnostic?: Diagnostic;
  constructor(message: string, diagnostic?: Diagnostic) {
    super(message);
    this.name = 'BrikError';
    this.diagnostic = diagnostic;
  }
}

export const BRIK_DIR = '.brik';






