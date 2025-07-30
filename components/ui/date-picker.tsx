"use client";

import { format, getMonth, getYear, setMonth, setYear } from "date-fns";
import * as React from "react";

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

interface DatePickerProps {
  selectedDate: Date | null;
  startYear?: number;
  endYear?: number;
  setDateFn: (date: Date) => void;
}
export function DatePicker({
  selectedDate = null,
  startYear = getYear(new Date()) - 100,
  endYear = getYear(new Date()),
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

  const handleMonthChange = (month: string) => {
    if (date) {
      const newDate = setMonth(date, months.indexOf(month));
      setDate(newDate);
      setDateFn(newDate);
    } else {
      const newDate1 = setMonth(
        setYear(new Date(), endYear),
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
      const newDate = setYear(setYear(new Date(), endYear), parseInt(year));
      setDate(newDate);
      setDateFn(newDate);
    }
  };

  const handleSelect = (selectedData: Date | undefined) => {
    if (selectedData) {
      setDate(selectedData);
      setDateFn(selectedData);
    }
  };

  return (
    <Popover open={open} onOpenChange={(v) => !selectOpen && setOpen(v)}>
      <PopoverTrigger asChild>
        <div
          className={`mt-1 block w-full bg-white border ${"border-gray-300"} rounded-full shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary`}
        >
          <p
            className={`text-black ${
              date ? "text-opacity-100" : "text-opacity-40"
            }`}
          >
            {date ? format(date, "PPP") : "Pick a date"}
          </p>
        </div>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-auto p-0">
        <div className="flex justify-between p-2">
          <Select
            onValueChange={handleMonthChange}
            value={months[getMonth(date ?? setYear(new Date(), endYear))]}
            open={selectOpen}
            onOpenChange={setSelectOpen}
          >
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            onValueChange={handleYearChange}
            value={getYear(date ?? setYear(new Date(), endYear)).toString()}
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
          selected={date ?? setYear(new Date(), endYear)}
          onSelect={handleSelect}
          month={date ?? setYear(new Date(), endYear)}
          onMonthChange={setDate}
          initialFocus
          disabled={{ after: setYear(new Date(), endYear) }}
          fromYear={startYear}
          toYear={endYear}
        />
      </PopoverContent>
    </Popover>
  );
}
