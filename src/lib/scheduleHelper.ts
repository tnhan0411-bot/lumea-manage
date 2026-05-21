export function calculateNextCleaningDate(daysOfWeek: number[], time: string, fromDateStr: string = new Date().toISOString()): { date: string, time: string } | null {
  if (!daysOfWeek || daysOfWeek.length === 0) return null;
  
  let fromDate = new Date(fromDateStr);
  const currentDay = fromDate.getDay();
  
  // Sort daysOfWeek
  let sortedDays = [...daysOfWeek].sort((a,b) => a - b);
  
  // Find the next day in the week
  let nextDay = sortedDays.find(d => d > currentDay);
  let daysToAdd = 0;
  
  if (nextDay !== undefined) {
    daysToAdd = nextDay - currentDay;
  } else {
    // Wrap around to next week
    daysToAdd = 7 - currentDay + sortedDays[0];
  }
  
  let nextDate = new Date(fromDate);
  nextDate.setDate(nextDate.getDate() + daysToAdd);
  
  return {
    date: nextDate.toISOString().split('T')[0],
    time: time
  };
}
