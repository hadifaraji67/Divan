import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../src/lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const invoices = await sql`
        SELECT i.id, i.total_amount, i.status, i.created_at, c.name as customer_name 
        FROM invoices i 
        LEFT JOIN customers c ON i.customer_id = c.id 
        ORDER BY i.created_at DESC
      `;
      return res.status(200).json({ success: true, data: invoices });
    } catch (error) {
      return res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { customerId, items, totalAmount } = req.body;
      const [invoice] = await sql`
        INSERT INTO invoices (customer_id, total_amount, status)
        VALUES (${customerId}, ${totalAmount}, 'paid')
        RETURNING id, created_at
      `;

      for (const item of items) {
        await sql`
          INSERT INTO invoice_items (invoice_id, product_id, title, quantity, unit_price, total_price)
          VALUES (${invoice.id}, ${item.productId || null}, ${item.title}, ${item.quantity}, ${item.unitPrice}, ${item.totalPrice})
        `;
      }

      return res.status(201).json({ success: true, invoiceId: invoice.id });
    } catch (error) {
      return res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
