function calculateRentForMonth(price, leaseStart, leaseEnd, currentMonth) {
  if (!leaseStart) return price;
  
  const getCycleDate = (year, month0, day) => {
    let d = new Date(year, month0, day);
    const expectedMonth = (month0 % 12 + 12) % 12;
    if (d.getMonth() !== expectedMonth) {
      d = new Date(year, month0 + 1, 0);
    }
    return d;
  };

  const lStart = new Date(leaseStart);
  
  const cycleDay = lStart.getDate();
  const [curYear, curMonthNum] = currentMonth.split('-').map(Number);
  
  const cycleStart = getCycleDate(curYear, curMonthNum - 1, cycleDay);
  const nextCycleStart = getCycleDate(curYear, curMonthNum, cycleDay);
  
  cycleStart.setHours(0,0,0,0);
  nextCycleStart.setHours(0,0,0,0);
  
  const cycleEnd = new Date(nextCycleStart.getTime() - 24 * 60 * 60 * 1000);
  
  if (leaseEnd) {
    const lEnd = new Date(leaseEnd);
    lEnd.setHours(0,0,0,0);
    
    const billingEndDateObj = new Date(lEnd.getTime());
      
    if (billingEndDateObj < cycleStart) return 0;
      
    if (billingEndDateObj <= cycleEnd) {
      if (billingEndDateObj.getTime() === cycleEnd.getTime()) {
        return price;
      }
      const diffTime = billingEndDateObj.getTime() - cycleStart.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
      return Math.round((price / 30) * diffDays);
    }
  }
  
  return price;
}

console.log(calculateRentForMonth(10000, '2026-07-03', '2026-08-02', '2026-07')); // Expected: 10000
console.log(calculateRentForMonth(10000, '2026-07-03', '2026-08-05', '2026-07')); // Expected: 10000
console.log(calculateRentForMonth(10000, '2026-07-03', '2026-08-05', '2026-08')); // Expected: 10000/30 * 3 = 1000
