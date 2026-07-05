import { db } from '../db/db';
import { menuPreviews } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

export interface PreviewData {
  name: string;
  type: string;
  slogan: string;
  logo: string;
  logoIcon?: string;
  currency: string;
  theme: string;
  locale: 'fa' | 'en' | 'tr';
  defaultLayout: 'pinterest' | 'simple' | 'card';
  gridImage?: string;
  gridSize?: number;
  brandStyle?: string;
  photoConcepts?: string[];
  categories: Array<{
    id: string;
    name: string;
    status: 'active' | 'unavailable';
    items: Array<{
      id: string;
      name: string;
      slug?: string;
      price: number;
      image?: string;
      description?: string;
      discount?: {
        originalPrice: number;
        discountText: string;
      };
      span2: boolean;
      status: 'active' | 'unavailable';
      gridIndex?: number;
    }>;
  }>;
}

export const previews = {
  async get(id: string): Promise<PreviewData | null> {
    try {
      const [row] = await db
        .select()
        .from(menuPreviews)
        .where(eq(menuPreviews.id, id))
        .limit(1);
      return row ? (row.data as PreviewData) : null;
    } catch (err) {
      console.error(`Error fetching preview ${id} from database:`, err);
      return null;
    }
  },

  async set(id: string, data: PreviewData): Promise<void> {
    try {
      await db
        .insert(menuPreviews)
        .values({
          id,
          data,
          createdAt: new Date(),
        })
        .onConflictDoUpdate({
          target: menuPreviews.id,
          set: { data },
        });
    } catch (err) {
      console.error(`Error saving preview ${id} to database:`, err);
      throw err;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      // Instead of completely deleting, we mark it as converted to keep a history
      await db
        .update(menuPreviews)
        .set({ convertedAt: new Date() })
        .where(eq(menuPreviews.id, id));
    } catch (err) {
      console.error(`Error marking preview ${id} as converted:`, err);
      throw err;
    }
  },

  async getAll(): Promise<Array<{ id: string; data: any; createdAt: Date; convertedAt: Date | null }>> {
    try {
      return await db
        .select()
        .from(menuPreviews)
        .orderBy(desc(menuPreviews.createdAt));
    } catch (err) {
      console.error('Error fetching all previews:', err);
      return [];
    }
  }
};
