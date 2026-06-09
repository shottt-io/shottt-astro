// In-memory RAM storage for menus preview configuration
// Persists across requests within the same Node.js process using globalThis.

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

// Attach previews Map to globalThis to prevent resetting during HMR/dev reloads
const globalStore = globalThis as any;
if (!globalStore.previews) {
  globalStore.previews = new Map<string, PreviewData>();
}

export const previews: Map<string, PreviewData> = globalStore.previews;
