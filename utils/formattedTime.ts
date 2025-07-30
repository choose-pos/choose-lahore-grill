import { DateTime } from "luxon";

type Avl = {
  day: string;
  active: boolean;
  hours: { start: string; end: string }[];
};

export const availabilityCheck = (
  restaurantTz: string,
  avl: Avl[],
  checkDate: Date
): boolean => {
  restaurantTz = restaurantTz?.split(" ")[0] ?? "";
  const customerNow = checkDate;

  const restaurantNowLuxon = DateTime.fromISO(customerNow.toISOString(), {
    zone: restaurantTz,
  });

  const dayName = restaurantNowLuxon.weekdayLong ?? "";

  // Find the availability for the current day
  const availability = avl.find(
    (day) => day.day.toLowerCase() === dayName.toLowerCase()
  );

  if (!availability || !availability.active) {
    return false; // Restaurant is closed today
  }

  // Convert current time to minutes since midnight
  const nowMinutes = restaurantNowLuxon.hour * 60 + restaurantNowLuxon.minute;

  // Check if within any available slot
  for (const slot of availability.hours) {
    const [startHours, startMinutes] = slot.start.split(":").map(Number);
    const [endHours, endMinutes] = slot.end.split(":").map(Number);

    const startTimeMinutes = startHours * 60 + startMinutes;
    let endTimeMinutes = endHours * 60 + endMinutes;

    // Handle cross-midnight
    if (endTimeMinutes < startTimeMinutes) {
      endTimeMinutes += 24 * 60;
    }

    if (nowMinutes >= startTimeMinutes && nowMinutes <= endTimeMinutes) {
      return true; // Current time is within this slot
    }
  }

  return false; // No matching slot found
};

export const isAsapAvailable = (
  restaurantTz: string,
  avl: Avl[],
  prepTimeMinutes: number,
  orderStartMins: number, // Time after start time to begin accepting orders
  orderEndMins: number // Time before end time to stop accepting orders
): boolean => {
  const customerNow = new Date();
  const restaurantNowLuxon = DateTime.fromISO(customerNow.toISOString(), {
    zone: restaurantTz,
  });

  const dayName = restaurantNowLuxon.weekdayLong ?? "";

  // Find the availability for the current day
  const availability = avl.find(
    (day) => day.day.toLowerCase() === dayName.toLowerCase()
  );

  if (!availability || !availability.active) {
    return false; // Restaurant is closed today
  }

  // Convert current time to minutes since midnight
  const nowMinutes =
    restaurantNowLuxon.hour * 60 + restaurantNowLuxon.minute + prepTimeMinutes;

  // Check if within any available slot
  for (const slot of availability.hours) {
    const [startHours, startMinutes] = slot.start.split(":").map(Number);
    const [endHours, endMinutes] = slot.end.split(":").map(Number);

    const startTimeMinutes = startHours * 60 + startMinutes + orderStartMins;
    const endTimeMinutes = endHours * 60 + endMinutes - orderEndMins;

    // // Handle cross-midnight
    // if (endTimeMinutes < startTimeMinutes) {
    //   endTimeMinutes += 24 * 60;
    // }

    if (nowMinutes >= startTimeMinutes && nowMinutes <= endTimeMinutes) {
      return true; // Current time is within this slot
    }
  }

  return false; // No matching slot found
};

export const scheduleDaysList = (
  restaurantTz: string,
  avl: Avl[]
): { value: Date; label: string }[] => {
  const daysCount = 8;

  const customerNow = new Date();
  const restaurantNowLuxon = DateTime.fromISO(customerNow.toISOString(), {
    zone: restaurantTz,
  });

  const result: { value: Date; label: string }[] = [];
  let dayOffset = 0;

  while (result.length < daysCount) {
    // "Candidate" day in the restaurant's local time
    const candidateDate = restaurantNowLuxon.plus({ days: dayOffset });

    // e.g. "Monday", "Tuesday"
    const candidateDayName = candidateDate.weekdayLong?.toLowerCase() ?? "";

    // Look up if we have a matching availability record for this day name
    const availability = avl.find(
      (day) => day.day.toLowerCase() === candidateDayName
    );

    // If not found or not active, skip
    if (!availability || !availability.active) {
      dayOffset++;
      continue;
    }

    // If it's "today" (dayOffset === 0), check if at least one shift is still open
    if (dayOffset === 0) {
      // Are *all* shifts already ended? (We’ll check each shift)
      const allShiftsClosed = availability.hours.every((shift) => {
        // shift.end is "HH:mm" in 24-hour format, e.g. "17:00"
        const [endHour, endMinute] = shift.end.split(":").map(Number);

        // Construct the endTime for *today* in the restaurant's timezone
        const shiftEndTime = candidateDate.set({
          hour: endHour,
          minute: endMinute,
          second: 0,
        });

        // If current time >= shiftEndTime, that shift is closed
        // We'll keep track if *every* shift is closed
        return restaurantNowLuxon >= shiftEndTime;
      });

      // If "allShiftsClosed" is true, skip today entirely
      if (allShiftsClosed) {
        dayOffset++;
        continue;
      }
    }

    // Construct the label (e.g. "Today Jan 11" or "Tomorrow Jan 12" or "Thursday Jan 13")
    const label =
      dayOffset === 0
        ? `Today ${candidateDate.toFormat("LLL dd")}`
        : dayOffset === 1
          ? `Tomorrow ${candidateDate.toFormat("LLL dd")}`
          : `${candidateDate.toFormat("EEEE LLL dd")}`;

    // Finally, add this day to the result
    result.push({
      value: candidateDate.toJSDate(),
      label,
    });

    // Move on to the next day
    dayOffset++;
  }

  return result;
};

export const getTimeSlots = (
  restaurantTz: string,
  avl: Avl[],
  selectedDayLabel: string,
  isAsap: boolean,
  prepTimeMinutes: number,
  startMins: number, // Time after start time to begin accepting orders
  endMins: number // Time before end time to stop accepting orders
): string[] => {
  const customerNow = new Date();
  const restaurantNowLuxon = DateTime.fromISO(customerNow.toISOString(), {
    zone: restaurantTz,
  });

  // Parse selected day label
  const [dayLabel, , dayDate] = selectedDayLabel.split(" ");
  const selectedDate = restaurantNowLuxon.set({ day: Number(dayDate) });

  // Get the day name
  const dayName = selectedDate.weekdayLong ?? "";

  // Find availability for the selected day
  const availability = avl.find(
    (day) => day.day.toLowerCase() === dayName.toLowerCase()
  );

  if (!availability || !availability.active) {
    return []; // Return empty list if the day is not active
  }

  const timeSlots: string[] = [];
  const interval = 15; // Slot interval in minutes

  for (const slot of availability.hours) {
    const [startHours, startMinutes] = slot.start.split(":").map(Number);
    const [endHours, endMinutes] = slot.end.split(":").map(Number);

    let slotStartTime = selectedDate.set({
      hour: startHours,
      minute: startMinutes + startMins + prepTimeMinutes,
      second: 0,
      millisecond: 0,
    });

    let slotEndTime = selectedDate.set({
      hour: endHours,
      minute: endMinutes - endMins,
      second: 0,
      millisecond: 0,
    });

    // Adjust start time to the upper 15-minute interval
    slotStartTime = slotStartTime.plus({
      minute: 15 - (slotStartTime.minute % 15),
    });

    // Adjust end time to the lower 15-minute interval
    slotEndTime = slotEndTime.plus({
      minute: -(slotEndTime.minute % 15),
    });

    // Adjust for ASAP logic
    if (isAsap || dayLabel === "Today") {
      // Calculate the first available slot
      const prepTime = restaurantNowLuxon.plus({ minute: prepTimeMinutes });
      const nearest15MinSlot = prepTime.plus({
        minute: 15 - (prepTime.minute % 15),
      });

      if (nearest15MinSlot > slotStartTime) {
        slotStartTime = nearest15MinSlot; // Start from the nearest ASAP slot
      }
      if (slotEndTime < nearest15MinSlot) {
        continue;
      }
    }

    let currentTime = slotStartTime;

    while (currentTime <= slotEndTime) {
      const slotString = currentTime.toFormat("hh:mm a ZZZZ");

      timeSlots.push(slotString);
      currentTime = currentTime.plus({ minute: interval }); // Increment by interval
    }
  }

  return timeSlots;
};

export const convertNowToUtc = (
  restaurantTz: string, // Restaurant timezone,
  prepTimeMinutes: number
): string => {
  const customerNow = new Date();
  const restaurantNowLuxon = DateTime.fromISO(customerNow.toISOString(), {
    zone: restaurantTz,
  });

  return restaurantNowLuxon.plus({ minute: prepTimeMinutes }).toISO() ?? "";
};

export const convertToUtcForTimeSlots = (
  selectedDayLabel: string, // e.g., "Mon Nov 18"
  selectedTimeSlot: string, // e.g., "07:00 AM GMT-5"
  restaurantTz: string // Restaurant timezone
): string => {
  const customerNow = new Date();
  const restaurantNowLuxon = DateTime.fromISO(customerNow.toISOString(), {
    zone: restaurantTz,
  });

  const [, monthStr, dayDate] = selectedDayLabel.split(" ");
  const [hourMins, amPm] = selectedTimeSlot.split(" ");

  const [h, m] = hourMins.split(":");
  let hour = Number(h);
  const minute = Number(m);

  if (amPm === "PM") {
    if (hour <= 11) {
      hour += 12;
    }
  } else if (amPm === "AM") {
    if (hour === 12) {
      hour = 0;
    }
  }

  const monthMap: Record<string, number> = {
    Jan: 1,
    Feb: 2,
    Mar: 3,
    Apr: 4,
    May: 5,
    Jun: 6,
    Jul: 7,
    Aug: 8,
    Sep: 9,
    Oct: 10,
    Nov: 11,
    Dec: 12,
  };

  const month = monthMap[monthStr];

  const selectedDate = restaurantNowLuxon.set({
    month: month,
    day: Number(dayDate),
    hour: hour,
    minute: minute,
    second: 0,
    millisecond: 0,
  });

  return selectedDate.toISO() ?? "";
};

export const convertToRestoTimezone = (restaurantTz: string, date: Date) => {
  return (
    DateTime.fromJSDate(date, { zone: restaurantTz }).toFormat(
      "dd MMM hh:mm a ZZZZ"
    ) ?? ""
  );
};
