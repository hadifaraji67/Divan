export interface VoidableEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  voidedAt?: string | null;
  voidReason?: string | null;
}

export function isActiveRecord<T extends { voidedAt?: string | null }>(record: T): boolean {
  return !record.voidedAt;
}
