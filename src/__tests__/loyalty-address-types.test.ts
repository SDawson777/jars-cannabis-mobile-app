import type { LoyaltyStatus } from '../api/hooks/useLoyaltyStatus';
import type { ParsedAddress } from '../utils/address';

describe('loyalty and address types', () => {
  describe('LoyaltyStatus', () => {
    it('creates a valid loyalty status', () => {
      const status: LoyaltyStatus = {
        points: 150,
        level: 'silver',
      };

      expect(status.points).toBe(150);
      expect(status.level).toBe('silver');
    });

    it('supports different loyalty levels', () => {
      const levels: LoyaltyStatus[] = [
        { points: 0, level: 'bronze' },
        { points: 500, level: 'silver' },
        { points: 1000, level: 'gold' },
        { points: 2500, level: 'platinum' },
      ];

      expect(levels).toHaveLength(4);
      expect(levels.map(l => l.level)).toContain('gold');
    });

    it('handles new users with zero points', () => {
      const status: LoyaltyStatus = {
        points: 0,
        level: 'bronze',
      };

      expect(status.points).toBe(0);
      expect(status.level).toBe('bronze');
    });

    it('handles high point values', () => {
      const status: LoyaltyStatus = {
        points: 99999,
        level: 'diamond',
      };

      expect(status.points).toBe(99999);
    });

    it('can check if user can level up', () => {
      const status: LoyaltyStatus = {
        points: 480,
        level: 'bronze',
      };

      const silverThreshold = 500;
      const canLevelUp = status.points >= silverThreshold;

      expect(canLevelUp).toBe(false);
    });

    it('can calculate points needed for next level', () => {
      const status: LoyaltyStatus = {
        points: 750,
        level: 'silver',
      };

      const goldThreshold = 1000;
      const pointsNeeded = goldThreshold - status.points;

      expect(pointsNeeded).toBe(250);
    });

    it('supports loyalty rewards calculation', () => {
      const status: LoyaltyStatus = {
        points: 200,
        level: 'silver',
      };

      const pointsPerDollar = 10;
      const spendRequired = 50;
      const pointsEarned = spendRequired * pointsPerDollar;
      const newPoints = status.points + pointsEarned;

      expect(newPoints).toBe(700);
    });

    it('can track loyalty history', () => {
      interface LoyaltyHistory {
        current: LoyaltyStatus;
        previous?: LoyaltyStatus;
      }

      const history: LoyaltyHistory = {
        current: { points: 600, level: 'silver' },
        previous: { points: 450, level: 'bronze' },
      };

      expect(history.current.level).toBe('silver');
      expect(history.previous?.level).toBe('bronze');
    });

    it('supports level comparisons', () => {
      const status1: LoyaltyStatus = { points: 200, level: 'bronze' };
      const status2: LoyaltyStatus = { points: 800, level: 'silver' };

      const levelOrder = ['bronze', 'silver', 'gold', 'platinum'];
      const status1Index = levelOrder.indexOf(status1.level);
      const status2Index = levelOrder.indexOf(status2.level);

      expect(status2Index).toBeGreaterThan(status1Index);
    });
  });

  describe('ParsedAddress', () => {
    it('creates a valid parsed address', () => {
      const address: ParsedAddress = {
        line1: '123 Main Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
      };

      expect(address.line1).toBe('123 Main Street');
      expect(address.city).toBe('San Francisco');
      expect(address.state).toBe('CA');
      expect(address.zipCode).toBe('94102');
    });

    it('supports optional line2', () => {
      const address: ParsedAddress = {
        line1: '456 Oak Avenue',
        line2: 'Apt 4B',
        city: 'Oakland',
        state: 'CA',
        zipCode: '94601',
      };

      expect(address.line2).toBe('Apt 4B');
    });

    it('supports optional zipPlus4', () => {
      const address: ParsedAddress = {
        line1: '789 Elm Street',
        city: 'Berkeley',
        state: 'CA',
        zipCode: '94704',
        zipPlus4: '1234',
      };

      expect(address.zipPlus4).toBe('1234');
    });

    it('handles full address with all fields', () => {
      const address: ParsedAddress = {
        line1: '101 Business Blvd',
        line2: 'Suite 200',
        city: 'San Jose',
        state: 'CA',
        zipCode: '95112',
        zipPlus4: '5678',
      };

      expect(address.line1).toBe('101 Business Blvd');
      expect(address.line2).toBe('Suite 200');
      expect(address.city).toBe('San Jose');
      expect(address.state).toBe('CA');
      expect(address.zipCode).toBe('95112');
      expect(address.zipPlus4).toBe('5678');
    });

    it('handles addresses without line2', () => {
      const address: ParsedAddress = {
        line1: '222 Simple Street',
        city: 'Denver',
        state: 'CO',
        zipCode: '80202',
      };

      expect(address.line2).toBeUndefined();
    });

    it('handles addresses without zipPlus4', () => {
      const address: ParsedAddress = {
        line1: '333 Basic Ave',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98101',
      };

      expect(address.zipPlus4).toBeUndefined();
    });

    it('supports different state codes', () => {
      const addresses: ParsedAddress[] = [
        { line1: '1 Main St', city: 'New York', state: 'NY', zipCode: '10001' },
        { line1: '2 Main St', city: 'Austin', state: 'TX', zipCode: '73301' },
        { line1: '3 Main St', city: 'Portland', state: 'OR', zipCode: '97201' },
        { line1: '4 Main St', city: 'Miami', state: 'FL', zipCode: '33101' },
      ];

      expect(addresses.map(a => a.state)).toContain('TX');
      expect(addresses.every(a => a.state.length === 2)).toBe(true);
    });

    it('validates zip code format', () => {
      const address: ParsedAddress = {
        line1: '444 Test St',
        city: 'TestCity',
        state: 'CA',
        zipCode: '94105',
      };

      const isValidZip = /^\d{5}$/.test(address.zipCode);

      expect(isValidZip).toBe(true);
    });

    it('validates zipPlus4 format', () => {
      const address: ParsedAddress = {
        line1: '555 Test Ave',
        city: 'TestCity',
        state: 'CA',
        zipCode: '94105',
        zipPlus4: '1234',
      };

      const isValidPlus4 = address.zipPlus4 ? /^\d{4}$/.test(address.zipPlus4) : true;

      expect(isValidPlus4).toBe(true);
    });

    it('can format address for display', () => {
      const address: ParsedAddress = {
        line1: '123 Main St',
        line2: 'Apt 5',
        city: 'Boulder',
        state: 'CO',
        zipCode: '80301',
      };

      const formatted = [
        address.line1,
        address.line2,
        `${address.city}, ${address.state} ${address.zipCode}`,
      ]
        .filter(Boolean)
        .join('\n');

      expect(formatted).toContain('123 Main St');
      expect(formatted).toContain('Apt 5');
      expect(formatted).toContain('Boulder, CO 80301');
    });

    it('can compare addresses', () => {
      const addr1: ParsedAddress = {
        line1: '123 Main St',
        city: 'Denver',
        state: 'CO',
        zipCode: '80202',
      };

      const addr2: ParsedAddress = {
        line1: '123 Main St',
        city: 'Denver',
        state: 'CO',
        zipCode: '80202',
      };

      const areEqual =
        addr1.line1 === addr2.line1 &&
        addr1.city === addr2.city &&
        addr1.state === addr2.state &&
        addr1.zipCode === addr2.zipCode;

      expect(areEqual).toBe(true);
    });

    it('supports apartment/unit variations', () => {
      const addresses: ParsedAddress[] = [
        { line1: '100 Oak St', line2: 'Apt 1A', city: 'City', state: 'CA', zipCode: '90001' },
        { line1: '200 Elm St', line2: 'Unit 2B', city: 'City', state: 'CA', zipCode: '90001' },
        { line1: '300 Pine St', line2: 'Suite 3C', city: 'City', state: 'CA', zipCode: '90001' },
        { line1: '400 Maple St', line2: '#4D', city: 'City', state: 'CA', zipCode: '90001' },
      ];

      expect(addresses.every(a => a.line2)).toBe(true);
    });

    it('can validate required fields', () => {
      const address: ParsedAddress = {
        line1: '777 Valid St',
        city: 'ValidCity',
        state: 'CA',
        zipCode: '94102',
      };

      const hasRequiredFields = !!(
        address.line1 &&
        address.city &&
        address.state &&
        address.zipCode
      );

      expect(hasRequiredFields).toBe(true);
    });
  });

  describe('type compatibility', () => {
    it('loyalty status works in user profile', () => {
      interface UserProfileWithLoyalty {
        id: string;
        name: string;
        loyalty: LoyaltyStatus;
      }

      const profile: UserProfileWithLoyalty = {
        id: 'user-123',
        name: 'John Doe',
        loyalty: { points: 500, level: 'silver' },
      };

      expect(profile.loyalty.points).toBe(500);
    });

    it('parsed address works in address book', () => {
      interface AddressBookEntry {
        id: string;
        label: string;
        address: ParsedAddress;
      }

      const entry: AddressBookEntry = {
        id: 'addr-1',
        label: 'Home',
        address: {
          line1: '123 Home St',
          city: 'Denver',
          state: 'CO',
          zipCode: '80202',
        },
      };

      expect(entry.address.city).toBe('Denver');
    });

    it('loyalty and address work together in checkout', () => {
      interface CheckoutInfo {
        deliveryAddress: ParsedAddress;
        loyaltyStatus: LoyaltyStatus;
        usePoints: boolean;
      }

      const checkout: CheckoutInfo = {
        deliveryAddress: {
          line1: '999 Order St',
          city: 'TestCity',
          state: 'CA',
          zipCode: '94105',
        },
        loyaltyStatus: { points: 300, level: 'silver' },
        usePoints: true,
      };

      expect(checkout.loyaltyStatus.points).toBe(300);
      expect(checkout.deliveryAddress.zipCode).toBe('94105');
    });
  });
});
