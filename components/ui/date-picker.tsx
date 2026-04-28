"use client";

import { format, getMonth, getYear, setMonth, setYear } from "date-fns";
import * as React from "react";
import { FiEdit2 } from "react-icons/fi";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { MdDateRange } from "react-icons/md";

interface DatePickerProps {
  selectedDate: Date | null;
  startYear?: number;
  endYear?: number;
  setDateFn: (date: Date) => void;
  disabledDates?: any;
}
export function DatePicker({
  selectedDate = null,
  startYear = getYear(new Date()) - 100,
  endYear = getYear(new Date()),
  disabledDates,
  setDateFn,
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | null>(selectedDate);
  const [open, setOpen] = React.useState(false);
  const [selectOpen, setSelectOpen] = React.useState(false);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  );

  const currentDate = new Date();
  const currentYear = getYear(currentDate);
  const defaultDate = currentYear >= startYear && currentYear <= endYear 
    ? currentDate 
    : setYear(currentDate, endYear);

  const handleMonthChange = (month: string) => {
    if (date) {
      const newDate = setMonth(date, months.indexOf(month));
      setDate(newDate);
      setDateFn(newDate);
    } else {
      const newDate1 = setMonth(
        defaultDate,
        months.indexOf(month)
      );
      setDate(newDate1);
      setDateFn(newDate1);
    }
  };

  const handleYearChange = (year: string) => {
    if (date) {
      const newDate = setYear(date, parseInt(year));
      setDate(newDate);
      setDateFn(newDate);
    } else {
      const newDate = setYear(defaultDate, parseInt(year));
      setDate(newDate);
      setDateFn(newDate);
    }
  };

  const handleSelect = (selectedData: Date | undefined) => {
    if (selectedData) {
      setDate(selectedData);
      setDateFn(selectedData);
      setOpen(false);
    }
  };

  const isMonthDisabled = (monthIndex: number) => {
    if (!disabledDates || typeof disabledDates !== 'object') return false;
    
    const selectedYear = getYear(date ?? defaultDate);
    const firstDayOfMonth = new Date(selectedYear, monthIndex, 1);
    const lastDayOfMonth = new Date(selectedYear, monthIndex + 1, 0, 23, 59, 59, 999);

    if (disabledDates.before && disabledDates.before instanceof Date && lastDayOfMonth < disabledDates.before) return true;
    if (disabledDates.after && disabledDates.after instanceof Date && firstDayOfMonth > disabledDates.after) return true;

    return false;
  };

  return (
    <Popover open={open} onOpenChange={(v) => !selectOpen && setOpen(v)}>
      <PopoverTrigger asChild>
        <div
          className={`mt-1 block w-full bg-white border ${"border-gray-300"} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary`}
        >
        <div className="flex items-center justify-between w-full">
          <p
            className={`text-black ${
              date ? "text-opacity-100" : "text-opacity-40"
            }`}
          >
            {date ? format(date, "PPP") : "Pick a date"}
          </p>
          <MdDateRange className="text-black/40 w-4 h-4 flex-shrink-0" />
        </div>
        </div>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-auto p-0">
        <div className="flex justify-between p-2">
          <Select
            onValueChange={handleMonthChange}
            value={months[getMonth(date ?? defaultDate)]}
            open={selectOpen}
            onOpenChange={setSelectOpen}
          >
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => {
                if (isMonthDisabled(index)) return null;
                return (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Select
            onValueChange={handleYearChange}
            value={getYear(date ?? defaultDate).toString()}
          >
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Calendar
          mode="single"
          selected={date ?? defaultDate}
          onSelect={handleSelect}
          month={date ?? defaultDate}
          onMonthChange={setDate}
          initialFocus
          disabled={disabledDates ?? { after: setYear(new Date(), endYear) }}
          fromYear={startYear}
          toYear={endYear}
        />
      </PopoverContent>
    </Popover>
  );
}