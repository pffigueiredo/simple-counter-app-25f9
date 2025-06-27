
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { Minus, Plus } from 'lucide-react';
// Using type-only import for better TypeScript compliance
import type { Counter } from '../../server/src/schema';

function App() {
  const [counter, setCounter] = useState<Counter | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // useCallback to memoize function used in useEffect
  const loadCounter = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await trpc.getCounter.query();
      setCounter(result);
    } catch (error) {
      console.error('Failed to load counter:', error);
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty deps since trpc is stable

  // useEffect with proper dependencies
  useEffect(() => {
    loadCounter();
  }, [loadCounter]);

  const handleUpdate = async (operation: 'increment' | 'decrement') => {
    setIsUpdating(true);
    try {
      const updatedCounter = await trpc.updateCounter.mutate({ operation });
      setCounter(updatedCounter);
    } catch (error) {
      console.error('Failed to update counter:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-80 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="animate-pulse">
              <div className="h-16 bg-slate-200 rounded mb-6"></div>
              <div className="flex gap-4">
                <div className="h-12 bg-slate-200 rounded flex-1"></div>
                <div className="h-12 bg-slate-200 rounded flex-1"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-80 shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Counter Display */}
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-slate-700">Counter</h1>
              <div className="text-6xl font-bold text-slate-800 font-mono tracking-tight">
                {counter?.value ?? 0}
              </div>
              {counter?.updated_at && (
                <p className="text-xs text-slate-500">
                  Last updated: {counter.updated_at.toLocaleTimeString()}
                </p>
              )}
            </div>

            {/* Control Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={() => handleUpdate('decrement')}
                disabled={isUpdating}
                variant="outline"
                size="lg"
                className="flex-1 h-12 text-lg hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors"
              >
                <Minus className="w-5 h-5 mr-1" />
                {isUpdating ? '...' : '−1'}
              </Button>
              
              <Button
                onClick={() => handleUpdate('increment')}
                disabled={isUpdating}
                size="lg"
                className="flex-1 h-12 text-lg bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-1" />
                {isUpdating ? '...' : '+1'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
