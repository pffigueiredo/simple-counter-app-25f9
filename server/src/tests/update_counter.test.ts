
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type UpdateCounterInput } from '../schema';
import { updateCounter } from '../handlers/update_counter';

describe('updateCounter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create initial counter with increment operation', async () => {
    const input: UpdateCounterInput = {
      operation: 'increment'
    };

    const result = await updateCounter(input);

    expect(result.id).toBeDefined();
    expect(result.value).toEqual(1);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create initial counter with decrement operation', async () => {
    const input: UpdateCounterInput = {
      operation: 'decrement'
    };

    const result = await updateCounter(input);

    expect(result.id).toBeDefined();
    expect(result.value).toEqual(-1);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should increment existing counter', async () => {
    // Create initial counter
    await db.insert(countersTable)
      .values({ value: 5 })
      .execute();

    const input: UpdateCounterInput = {
      operation: 'increment'
    };

    const result = await updateCounter(input);

    expect(result.value).toEqual(6);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should decrement existing counter', async () => {
    // Create initial counter
    await db.insert(countersTable)
      .values({ value: 10 })
      .execute();

    const input: UpdateCounterInput = {
      operation: 'decrement'
    };

    const result = await updateCounter(input);

    expect(result.value).toEqual(9);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save updated counter to database', async () => {
    // Create initial counter
    const initialResult = await db.insert(countersTable)
      .values({ value: 3 })
      .returning()
      .execute();

    const counterId = initialResult[0].id;

    const input: UpdateCounterInput = {
      operation: 'increment'
    };

    await updateCounter(input);

    // Verify the counter was updated in the database
    const counters = await db.select()
      .from(countersTable)
      .execute();

    expect(counters).toHaveLength(1);
    expect(counters[0].id).toEqual(counterId);
    expect(counters[0].value).toEqual(4);
    expect(counters[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle multiple operations correctly', async () => {
    // Start with increment (creates counter with value 1)
    await updateCounter({ operation: 'increment' });

    // Increment again (should be 2)
    const result1 = await updateCounter({ operation: 'increment' });
    expect(result1.value).toEqual(2);

    // Decrement (should be 1)
    const result2 = await updateCounter({ operation: 'decrement' });
    expect(result2.value).toEqual(1);

    // Decrement again (should be 0)
    const result3 = await updateCounter({ operation: 'decrement' });
    expect(result3.value).toEqual(0);
  });
});
