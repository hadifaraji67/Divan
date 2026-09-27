/**
 * لایه‌ی موجودی چند‌انباره
 *
 * نکته‌ی مهم معماری: Product.stock همچنان «موجودی کل» کالاست و منبع اصلی
 * برای فاکتور فروش/خرید و هشدار کمبود موجودی باقی می‌ماند — این لایه چیزی
 * را در آن مسیر جایگزین نمی‌کند. این‌جا فقط این را دنبال می‌کنیم که موجودیِ
 * از قبل موجود، بین کدام انبارها پخش شده (برای نقل‌وانتقال و انبارگردانی).
 * اگر کالایی هنوز در این لایه ردیابی نشده باشد، کل Product.stock آن به‌صورت
 * پیش‌فرض متعلق به «انبار مرکزی» در نظر گرفته می‌شود.
 */
import { loadData, saveData, genId } from './storage';
import type { Warehouse, WarehouseStockEntry, StockMovement, StockMovementType, Product } from '../types/models';

const DEFAULT_WAREHOUSE_ID = 'wh-default';

export function ensureDefaultWarehouse(): Warehouse {
  const warehouses = loadData<Warehouse[]>('warehouses', []);
  const existing = warehouses.find(w => w.id === DEFAULT_WAREHOUSE_ID);
  if (existing) return existing;

  const def: Warehouse = {
    id: DEFAULT_WAREHOUSE_ID,
    name: 'انبار مرکزی',
    code: 'WH-MAIN',
    isDefault: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  saveData('warehouses', [def, ...warehouses]);
  return def;
}

function getStockEntries(): WarehouseStockEntry[] {
  return loadData<WarehouseStockEntry[]>('warehouse_stock', []);
}

function saveStockEntries(entries: WarehouseStockEntry[]): void {
  saveData('warehouse_stock', entries);
}

/** موجودی یک کالا در یک انبار خاص */
export function getWarehouseStock(warehouseId: string, productId: string): number {
  const entry = getStockEntries().find(e => e.warehouseId === warehouseId && e.productId === productId);
  return entry?.quantity || 0;
}

/** موجودی یک کالا به تفکیک همه‌ی انبارها؛ اگر هنوز ردیابی نشده، کل موجودی به انبار مرکزی نسبت داده می‌شود */
export function getProductStockByWarehouse(productId: string, product?: Product): { warehouseId: string; quantity: number }[] {
  const entries = getStockEntries().filter(e => e.productId === productId);
  if (entries.length > 0) {
    return entries.map(e => ({ warehouseId: e.warehouseId, quantity: e.quantity }));
  }
  // هنوز ردیابی نشده — فرض: کل موجودی در انبار مرکزی است
  ensureDefaultWarehouse();
  const total = product?.stock ?? 0;
  return total > 0 ? [{ warehouseId: DEFAULT_WAREHOUSE_ID, quantity: total }] : [];
}

function setWarehouseStock(warehouseId: string, productId: string, quantity: number): void {
  const entries = getStockEntries();
  const idx = entries.findIndex(e => e.warehouseId === warehouseId && e.productId === productId);
  if (idx >= 0) {
    entries[idx] = { ...entries[idx], quantity: Math.max(0, quantity) };
  } else {
    entries.push({ warehouseId, productId, quantity: Math.max(0, quantity) });
  }
  saveStockEntries(entries);
}

/**
 * اگر کالایی هنوز در لایه‌ی چندانباره ردیابی نشده، آن را با فرض «همه‌ی موجودی در انبار مرکزی» مقداردهی اولیه می‌کند
 * این تابع باید قبل از هر انتقال/اصلاح صدا زده شود تا محاسبات درست باشند
 */
export function seedProductIfUntracked(product: Product): void {
  const entries = getStockEntries().filter(e => e.productId === product.id);
  if (entries.length > 0) return;
  ensureDefaultWarehouse();
  if (product.stock > 0) {
    setWarehouseStock(DEFAULT_WAREHOUSE_ID, product.id, product.stock);
  }
}

function addMovement(m: Omit<StockMovement, 'id' | 'createdAt'>): void {
  const list = loadData<StockMovement[]>('stock_movements', []);
  const entry: StockMovement = { ...m, id: genId(), createdAt: new Date().toISOString() };
  saveData('stock_movements', [entry, ...list]);
}

export function getStockMovements(): StockMovement[] {
  return loadData<StockMovement[]>('stock_movements', []);
}

/**
 * انتقال مقداری از یک کالا از یک انبار به انبار دیگر
 * Product.stock دست‌نخورده می‌ماند چون این فقط جابه‌جایی داخلی است، نه ورود/خروج واقعی
 */
export function transferStock(
  product: Product,
  fromWarehouse: Warehouse,
  toWarehouse: Warehouse,
  quantity: number,
  reason?: string,
): { ok: boolean; error?: string } {
  if (quantity <= 0) return { ok: false, error: 'مقدار باید بزرگ‌تر از صفر باشد' };
  if (fromWarehouse.id === toWarehouse.id) return { ok: false, error: 'انبار مبدا و مقصد نمی‌توانند یکی باشند' };

  seedProductIfUntracked(product);
  const available = getWarehouseStock(fromWarehouse.id, product.id);
  if (available < quantity) {
    return { ok: false, error: `موجودی کافی در «${fromWarehouse.name}» نیست (موجود: ${available})` };
  }

  setWarehouseStock(fromWarehouse.id, product.id, available - quantity);
  setWarehouseStock(toWarehouse.id, product.id, getWarehouseStock(toWarehouse.id, product.id) + quantity);

  addMovement({
    productId: product.id,
    productName: product.name,
    type: 'انتقال',
    fromWarehouseId: fromWarehouse.id,
    fromWarehouseName: fromWarehouse.name,
    toWarehouseId: toWarehouse.id,
    toWarehouseName: toWarehouse.name,
    quantity,
    reason,
    date: new Date().toISOString(),
  });

  return { ok: true };
}

/**
 * ثبت نتیجه‌ی انبارگردانی برای یک کالا در یک انبار — موجودی سیستم را با شمارش فیزیکی تطبیق می‌دهد
 * و اختلاف را به‌صورت یک سند «اصلاح انبارگردانی» ثبت می‌کند
 */
export function recordStockTake(
  product: Product,
  warehouse: Warehouse,
  countedQuantity: number,
  reason?: string,
): { ok: boolean; diff: number } {
  seedProductIfUntracked(product);
  const systemQuantity = getWarehouseStock(warehouse.id, product.id);
  const diff = countedQuantity - systemQuantity;

  if (diff === 0) return { ok: true, diff: 0 };

  setWarehouseStock(warehouse.id, product.id, countedQuantity);

  addMovement({
    productId: product.id,
    productName: product.name,
    type: 'اصلاح انبارگردانی',
    toWarehouseId: diff > 0 ? warehouse.id : undefined,
    toWarehouseName: diff > 0 ? warehouse.name : undefined,
    fromWarehouseId: diff < 0 ? warehouse.id : undefined,
    fromWarehouseName: diff < 0 ? warehouse.name : undefined,
    quantity: Math.abs(diff),
    reason: reason || (diff > 0 ? 'مازاد شمارش فیزیکی' : 'کسری شمارش فیزیکی'),
    date: new Date().toISOString(),
  });

  return { ok: true, diff };
}

export type { StockMovementType };
