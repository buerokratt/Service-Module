export interface ServiceTestError {
  dslName: string;
  stepName: string;
  causeCode: 'E_unknown' | 'E_null' | 'E_script';
  message: string;
}
