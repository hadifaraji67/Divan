// Type declaration for scripts/migration-plan.mjs
// جایگزین checkJs برای یک فایل خاص

declare module '*/migration-plan.mjs' {
  export interface MigrationStep {
    id: string;
    sql: string;
  }
  export interface MigrationPlan {
    version: number;
    steps: MigrationStep[];
  }
  export const MIGRATIONS: MigrationPlan[];
  export function plan(): MigrationPlan[];
  export const migrationPlan: MigrationPlan[];
}

declare module '../../scripts/migration-plan.mjs' {
  export const MIGRATIONS: any[];
  export function plan(): any[];
}
