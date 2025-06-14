
export interface SearchableItem {
  id: string;
  name: string;
  category?: string;
  description?: string;
  brand?: string;
  email?: string;
  username?: string;
  [key: string]: any;
}

export function searchItems<T extends SearchableItem>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[] = ['name', 'category', 'description', 'brand']
): T[] {
  if (!searchTerm.trim()) return items;

  const normalizedSearch = searchTerm.toLowerCase().trim();
  
  return items.filter(item => {
    return searchFields.some(field => {
      const fieldValue = item[field];
      if (typeof fieldValue === 'string') {
        return fieldValue.toLowerCase().includes(normalizedSearch);
      }
      return false;
    });
  });
}

export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
}

// Fuzzy search for more flexible matching
export function fuzzySearch<T extends SearchableItem>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[] = ['name', 'category', 'description']
): T[] {
  if (!searchTerm.trim()) return items;

  const normalizedSearch = searchTerm.toLowerCase().trim();
  const searchWords = normalizedSearch.split(' ').filter(word => word.length > 0);
  
  return items.filter(item => {
    return searchWords.every(word => {
      return searchFields.some(field => {
        const fieldValue = item[field];
        if (typeof fieldValue === 'string') {
          return fieldValue.toLowerCase().includes(word);
        }
        return false;
      });
    });
  });
}
