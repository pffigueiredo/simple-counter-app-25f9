
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type UpdateCounterInput, type Counter } from '../schema';
import { sql } from 'drizzle-orm';

export const updateCounter = async (input: UpdateCounterInput): Promise<Counter> => {
  try {
    // Get the first counter or create one if none exists
    const existingCounters = await db.select()
      .from(countersTable)
      .limit(1)
      .execute();

    let result;

    if (existingCounters.length === 0) {
      // Create initial counter with value based on operation
      const initialValue = input.operation === 'increment' ? 1 : -1;
      const insertResult = await db.insert(countersTable)
        .values({
          value: initialValue
        })
        .returning()
        .execute();
      
      result = insertResult[0];
    } else {
      // Update existing counter
      const currentCounter = existingCounters[0];
      const newValue = input.operation === 'increment' 
        ? currentCounter.value + 1 
        : currentCounter.value - 1;

      const updateResult = await db.update(countersTable)
        .set({ 
          value: newValue,
          updated_at: sql`NOW()`
        })
        .where(sql`id = ${currentCounter.id}`)
        .returning()
        .execute();

      result = updateResult[0];
    }

    return result;
  } catch (error) {
    console.error('Counter update failed:', error);
    throw error;
  }
};
