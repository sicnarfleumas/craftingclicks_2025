export interface ValidationResult {
  isValid: boolean;
  message: string;
  type: 'success' | 'warning' | 'error';
}

export interface MetaTagValidation {
  title: ValidationResult[];
  description: ValidationResult[];
  keywords: ValidationResult[];
} 