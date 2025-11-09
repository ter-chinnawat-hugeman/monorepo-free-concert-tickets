import { User, UserRole } from '../entities/user.entity';

describe('User Entity', () => {
  const baseDate = new Date('2024-01-01');

  describe('isAdmin', () => {
    it('should return true for ADMIN role', () => {
      const user = new User(
        'user-1',
        'Admin User',
        'password_hash',
        'salt',
        UserRole.ADMIN,
        baseDate,
        baseDate,
      );

      expect(user.isAdmin()).toBe(true);
    });

    it('should return false for USER role', () => {
      const user = new User(
        'user-1',
        'Regular User',
        'password_hash',
        'salt',
        UserRole.USER,
        baseDate,
        baseDate,
      );

      expect(user.isAdmin()).toBe(false);
    });
  });
});
