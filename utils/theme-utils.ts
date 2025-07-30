export const getCmsSectionId = (navTitle: string) => {
  return "/" + navTitle.toLowerCase().replaceAll(" ", "-");
};
export const getCmsSectionIdHash = (navTitle: string) => {
  return "/#" + navTitle.toLowerCase().replaceAll(" ", "-");
};

type DayHoursInput = {
  day: string;
  active: boolean;
  hours: {
    start: string;
    end: string;
  }[];
}[];

export const groupHoursByDays = (input: DayHoursInput): string[] => {
  // Map full day names to abbreviations
  const dayAbbreviations: Record<string, string> = {
    Monday: "Mon",
    Tuesday: "Tue",
    Wednesday: "Wed",
    Thursday: "Thu",
    Friday: "Fri",
    Saturday: "Sat",
    Sunday: "Sun",
  };

  // Convert 24-hour time to 12-hour time with AM/PM
  function convertTo12Hour(time: string): string {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const adjustedHours = hours % 12 || 12;
    return `${adjustedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  }

  // Separate active and inactive days
  const activeDays = input.filter((day) => day.active);
  const inactiveDays = input
    .filter((day) => !day.active)
    .map((day) => dayAbbreviations[day.day]);

  // Group active days by their timing strings
  const dayToHours = activeDays.map((day) => ({
    day: dayAbbreviations[day.day],
    hours: day.hours
      .map(
        (hour) =>
          `${convertTo12Hour(hour.start)} to ${convertTo12Hour(hour.end)}`
      )
      .join(", "),
  }));

  const groupedDays: Record<string, string[]> = {};
  for (const { day, hours } of dayToHours) {
    if (!groupedDays[hours]) {
      groupedDays[hours] = [];
    }
    groupedDays[hours].push(day);
  }

  // Generate result strings for active days
  const result: string[] = [];
  for (const [hours, days] of Object.entries(groupedDays)) {
    if (days.length === 7) {
      // All week same hours
      result.push(`Mon - Sun: ${hours}`);
      break; // Only one entry needed if all days are the same
    } else if (days.length > 1) {
      // Group multiple days
      const startDay = days[0];
      const endDay = days[days.length - 1];
      if (days.length > 2 && areConsecutiveDays(days)) {
        result.push(`${startDay} - ${endDay}: ${hours}`);
      } else {
        result.push(`${days.join(", ")}: ${hours}`);
      }
    } else {
      // Single day with unique timing
      result.push(`${days[0]}: ${hours}`);
    }
  }

  // Handle inactive days
  if (inactiveDays.length > 0) {
    if (inactiveDays.length === 7) {
      result.push("Mon - Sun: Closed");
    } else if (inactiveDays.length > 1) {
      result.push(`${inactiveDays.join(", ")}: Closed`);
    } else {
      result.push(`${inactiveDays[0]}: Closed`);
    }
  }

  return result;
};

// Helper function to check if the days are consecutive
function areConsecutiveDays(days: string[]): boolean {
  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const indices = days
    .map((day) => weekDays.indexOf(day))
    .sort((a, b) => a - b);
  for (let i = 0; i < indices.length - 1; i++) {
    if (indices[i + 1] - indices[i] !== 1) {
      return false;
    }
  }
  return true;
}

/**
 * Injects f_auto and q_auto parameters into a Cloudinary URL.
 *
 * @param url - The original Cloudinary image URL.
 * @returns The optimized Cloudinary URL with f_auto and q_auto.
 */
export function getOptimizedCloudinaryUrl(url: string): string {
  // Basic validation to ensure the URL contains "/upload/"
  if (!url.includes("/upload/")) {
    return url; // or throw an Error if you want strict enforcement
  }

  // Split the URL into two parts:
  //   [0]: everything before "/upload/"
  //   [1]: everything after "/upload/"
  const [cloudinaryRoot, imagePath] = url.split("/upload/");

  // Construct the new URL by inserting our transformations
  // (f_auto,q_auto). You can also add more transformations here.
  const optimizedUrl = `${cloudinaryRoot}/upload/f_auto,q_auto/${imagePath}`;

  return optimizedUrl;
}
