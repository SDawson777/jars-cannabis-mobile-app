import type { DataCategory } from '../api/hooks/useDataCategories';

describe('data category types', () => {
  describe('DataCategory', () => {
    it('creates a valid data category', () => {
      const category: DataCategory = {
        id: 'category-1',
        label: 'Purchase History',
      };

      expect(category.id).toBe('category-1');
      expect(category.label).toBe('Purchase History');
    });

    it('supports multiple data categories', () => {
      const categories: DataCategory[] = [
        { id: 'cat-1', label: 'Purchase History' },
        { id: 'cat-2', label: 'Browsing History' },
        { id: 'cat-3', label: 'Personal Information' },
        { id: 'cat-4', label: 'Location Data' },
        { id: 'cat-5', label: 'Device Information' },
      ];

      expect(categories).toHaveLength(5);
      expect(categories.map(c => c.label)).toContain('Location Data');
    });

    it('supports privacy-related categories', () => {
      const categories: DataCategory[] = [
        { id: 'privacy-1', label: 'Email Address' },
        { id: 'privacy-2', label: 'Phone Number' },
        { id: 'privacy-3', label: 'Mailing Address' },
        { id: 'privacy-4', label: 'Date of Birth' },
      ];

      expect(categories.every(c => c.id && c.label)).toBe(true);
    });

    it('supports marketing categories', () => {
      const categories: DataCategory[] = [
        { id: 'marketing-1', label: 'Email Marketing' },
        { id: 'marketing-2', label: 'SMS Marketing' },
        { id: 'marketing-3', label: 'Push Notifications' },
      ];

      expect(categories).toHaveLength(3);
    });

    it('can find category by id', () => {
      const categories: DataCategory[] = [
        { id: 'cat-1', label: 'Category 1' },
        { id: 'cat-2', label: 'Category 2' },
        { id: 'cat-3', label: 'Category 3' },
      ];

      const category = categories.find(c => c.id === 'cat-2');

      expect(category?.label).toBe('Category 2');
    });

    it('can filter categories by label keyword', () => {
      const categories: DataCategory[] = [
        { id: '1', label: 'Purchase History' },
        { id: '2', label: 'Product Reviews' },
        { id: '3', label: 'Account Settings' },
        { id: '4', label: 'Purchase Preferences' },
      ];

      const purchaseCategories = categories.filter(c => c.label.toLowerCase().includes('purchase'));

      expect(purchaseCategories).toHaveLength(2);
    });

    it('can sort categories alphabetically', () => {
      const categories: DataCategory[] = [
        { id: '1', label: 'Zebra' },
        { id: '2', label: 'Apple' },
        { id: '3', label: 'Mango' },
      ];

      const sorted = [...categories].sort((a, b) => a.label.localeCompare(b.label));

      expect(sorted[0].label).toBe('Apple');
      expect(sorted[2].label).toBe('Zebra');
    });

    it('supports categories for data export', () => {
      const exportableCategories: DataCategory[] = [
        { id: 'export-1', label: 'All Personal Data' },
        { id: 'export-2', label: 'Account Information' },
        { id: 'export-3', label: 'Transaction History' },
        { id: 'export-4', label: 'Communication Logs' },
      ];

      expect(exportableCategories).toHaveLength(4);
    });

    it('supports categories for data deletion', () => {
      const deletableCategories: DataCategory[] = [
        { id: 'delete-1', label: 'Browsing History' },
        { id: 'delete-2', label: 'Search History' },
        { id: 'delete-3', label: 'Saved Items' },
      ];

      expect(deletableCategories.every(c => c.id.startsWith('delete-'))).toBe(true);
    });

    it('can group categories', () => {
      interface CategoryGroup {
        groupName: string;
        categories: DataCategory[];
      }

      const groups: CategoryGroup[] = [
        {
          groupName: 'Personal Information',
          categories: [
            { id: 'pi-1', label: 'Name' },
            { id: 'pi-2', label: 'Email' },
          ],
        },
        {
          groupName: 'Activity',
          categories: [
            { id: 'act-1', label: 'Purchases' },
            { id: 'act-2', label: 'Reviews' },
          ],
        },
      ];

      expect(groups).toHaveLength(2);
      expect(groups[0].categories).toHaveLength(2);
    });

    it('supports consent tracking', () => {
      interface ConsentedCategory extends DataCategory {
        consented: boolean;
        consentedAt?: string;
      }

      const consentedCategories: ConsentedCategory[] = [
        { id: 'cat-1', label: 'Essential', consented: true, consentedAt: '2026-01-20T10:00:00Z' },
        { id: 'cat-2', label: 'Analytics', consented: false },
        { id: 'cat-3', label: 'Marketing', consented: true, consentedAt: '2026-01-20T10:00:00Z' },
      ];

      const consented = consentedCategories.filter(c => c.consented);

      expect(consented).toHaveLength(2);
    });

    it('can map categories to permissions', () => {
      interface CategoryPermission {
        category: DataCategory;
        canView: boolean;
        canExport: boolean;
        canDelete: boolean;
      }

      const permissions: CategoryPermission[] = [
        {
          category: { id: '1', label: 'Purchase History' },
          canView: true,
          canExport: true,
          canDelete: false,
        },
        {
          category: { id: '2', label: 'Saved Items' },
          canView: true,
          canExport: true,
          canDelete: true,
        },
      ];

      expect(permissions[0].category.label).toBe('Purchase History');
      expect(permissions[1].canDelete).toBe(true);
    });

    it('supports nested category structure', () => {
      interface NestedCategory extends DataCategory {
        children?: DataCategory[];
      }

      const categories: NestedCategory[] = [
        {
          id: 'parent-1',
          label: 'Account Data',
          children: [
            { id: 'child-1', label: 'Profile Information' },
            { id: 'child-2', label: 'Security Settings' },
          ],
        },
        {
          id: 'parent-2',
          label: 'Shopping Data',
          children: [
            { id: 'child-3', label: 'Cart History' },
            { id: 'child-4', label: 'Order History' },
          ],
        },
      ];

      expect(categories[0].children).toHaveLength(2);
      expect(categories[1].children?.[0].label).toBe('Cart History');
    });

    it('supports GDPR compliance categories', () => {
      const gdprCategories: DataCategory[] = [
        { id: 'gdpr-1', label: 'Right to Access' },
        { id: 'gdpr-2', label: 'Right to Rectification' },
        { id: 'gdpr-3', label: 'Right to Erasure' },
        { id: 'gdpr-4', label: 'Right to Data Portability' },
        { id: 'gdpr-5', label: 'Right to Object' },
      ];

      expect(gdprCategories).toHaveLength(5);
      expect(gdprCategories.map(c => c.label)).toContain('Right to Erasure');
    });

    it('can check if all required categories exist', () => {
      const categories: DataCategory[] = [
        { id: '1', label: 'Essential' },
        { id: '2', label: 'Functional' },
        { id: '3', label: 'Analytics' },
      ];

      const requiredIds = ['1', '2', '3'];
      const allPresent = requiredIds.every(id => categories.some(c => c.id === id));

      expect(allPresent).toBe(true);
    });

    it('can count categories by type', () => {
      const categories: DataCategory[] = [
        { id: 'personal-1', label: 'Name' },
        { id: 'personal-2', label: 'Email' },
        { id: 'activity-1', label: 'Purchases' },
        { id: 'activity-2', label: 'Reviews' },
        { id: 'activity-3', label: 'Browsing' },
      ];

      const personalCount = categories.filter(c => c.id.startsWith('personal-')).length;
      const activityCount = categories.filter(c => c.id.startsWith('activity-')).length;

      expect(personalCount).toBe(2);
      expect(activityCount).toBe(3);
    });

    it('supports category descriptions', () => {
      interface DetailedCategory extends DataCategory {
        description?: string;
      }

      const categories: DetailedCategory[] = [
        {
          id: 'cat-1',
          label: 'Purchase History',
          description: 'Records of all your past purchases and transactions.',
        },
        {
          id: 'cat-2',
          label: 'Preferences',
          description: 'Your saved preferences and settings.',
        },
      ];

      expect(categories[0].description).toContain('past purchases');
    });
  });

  describe('type compatibility', () => {
    it('categories work in privacy dashboard', () => {
      interface PrivacyDashboard {
        categories: DataCategory[];
        selectedCategory?: DataCategory;
      }

      const dashboard: PrivacyDashboard = {
        categories: [
          { id: '1', label: 'Category 1' },
          { id: '2', label: 'Category 2' },
        ],
        selectedCategory: { id: '1', label: 'Category 1' },
      };

      expect(dashboard.selectedCategory?.id).toBe('1');
    });

    it('categories can be used in forms', () => {
      interface DataRequestForm {
        requestedCategories: DataCategory[];
        requestType: 'export' | 'delete';
      }

      const form: DataRequestForm = {
        requestedCategories: [
          { id: '1', label: 'Purchase History' },
          { id: '2', label: 'Account Data' },
        ],
        requestType: 'export',
      };

      expect(form.requestedCategories).toHaveLength(2);
    });

    it('categories support filtering and searching', () => {
      interface CategoryFilter {
        categories: DataCategory[];
        searchQuery: string;
      }

      const filter: CategoryFilter = {
        categories: [
          { id: '1', label: 'Purchase History' },
          { id: '2', label: 'Profile Data' },
          { id: '3', label: 'Purchase Preferences' },
        ],
        searchQuery: 'purchase',
      };

      const filtered = filter.categories.filter(c =>
        c.label.toLowerCase().includes(filter.searchQuery.toLowerCase())
      );

      expect(filtered).toHaveLength(2);
    });
  });
});
