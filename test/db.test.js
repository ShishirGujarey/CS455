import { query } from '../db.js';

jest.mock('../db.js');

describe('Database Module', () => {
  beforeEach(() => {
    query.mockClear();
  });

  it('should call query with correct SQL and parameters', async () => {
    query.mockResolvedValue({ rows: [{ now: '2023-10-10T10:00:00Z' }] });

    const result = await query('SELECT NOW()');

    expect(query).toHaveBeenCalledWith('SELECT NOW()');
    expect(result).toEqual({ rows: [{ now: '2023-10-10T10:00:00Z' }] });
  });

  it('should handle query errors gracefully', async () => {
    query.mockRejectedValue(new Error('Database error'));

    await expect(query('SELECT NOW()')).rejects.toThrow('Database error');
    expect(query).toHaveBeenCalledWith('SELECT NOW()');
  });
});
