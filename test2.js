const checkIn = '2026-07-03';
const checkOut = '2026-08-02';
const pricePerMonth = 10000;

  const checkInDate = new Date(checkIn);
  let checkOutDate = new Date(checkOut);
  
  checkInDate.setHours(0, 0, 0, 0);
  checkOutDate.setHours(0, 0, 0, 0);

  const billingEndDateObj = checkOutDate;
  const billingEndDate = billingEndDateObj.toISOString().split('T')[0];

  let months = 0;
  let currentCycleStart = new Date(checkInDate);
  while (true) {
    let nextStart = new Date(currentCycleStart);
    nextStart.setMonth(nextStart.getMonth() + 1);
    let cycleEnd = new Date(nextStart.getTime() - 24 * 60 * 60 * 1000);
    
    if (cycleEnd <= billingEndDateObj) {
      months++;
      currentCycleStart = nextStart;
    } else {
      break;
    }
  }

  let oddDays = 0;
  if (currentCycleStart <= billingEndDateObj) {
    const diffTime = billingEndDateObj.getTime() - currentCycleStart.getTime();
    oddDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
  
  console.log(months, oddDays);
