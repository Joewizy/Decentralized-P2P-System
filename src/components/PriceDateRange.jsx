import { useState } from "react";
import { format, subDays, startOfWeek, startOfMonth, endOfDay, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";

function DateRangeCalculator({ data, valueField = "amount", onTotalCalculated, forDateRange }) {
  const [range, setRange] = useState({ from: null, to: null });

  // Predefined ranges
  const predefinedRanges = {
    Today: {
      from: startOfDay(new Date()),
      to: endOfDay(new Date()),
    },
    Yesterday: {
      from: startOfDay(subDays(new Date(), 1)),
      to: endOfDay(subDays(new Date(), 1)),
    },
    "Last 7 days": {
      from: startOfWeek(subDays(new Date(), 7)),
      to: endOfDay(new Date()),
    },
    "Last 30 days": {
      from: startOfMonth(subDays(new Date(), 30)),
      to: endOfDay(new Date()),
    },
  };

  // Calculate total for a given range
  const calculateTotal = (dateRange) => {
    if (!data || !Array.isArray(data)) return 0;
  
    const { from, to } = dateRange;
  
    const total = data
      .filter((item) => {
        const itemDate = new Date(item.timestamp); // Assumes `timestamp` field for dates
        return (
          (!from || itemDate >= startOfDay(new Date(from))) &&
          (!to || itemDate <= endOfDay(new Date(to)))
        );
      })
      .reduce((sum, item) => {
        const amount = Number(item[valueField]) || 0;
        const type = item.type;
  
        // Add sales, subtract expenditures (losses)
        if (type === "sales") {
          return sum + amount;
        } else if (type === "expenditures") {
          return sum - amount;
        }
  
        return sum;
      }, 0);
  
    onTotalCalculated(total); // Call the callback with the calculated total
    
    forDateRange(dateRange);
  };
  

  const handleDateChange = (dateRange) => {
    setRange(dateRange);
    calculateTotal(dateRange);
  };

  const applyPredefinedRange = (key) => {
    const selectedRange = predefinedRanges[key];
    setRange(selectedRange);
    calculateTotal(selectedRange);
  };

  return (
    <div className="flex gap-2 items-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className="w-[300px] justify-start text-left font-normal"
          >
            <CalendarIcon />
            {range?.from ? (
              range.to ? (
                <>
                  {format(range.from, "LLL dd, y")} -{" "}
                  {format(range.to, "LLL dd, y")}
                </>
              ) : (
                format(range.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            selected={range}
            onSelect={handleDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      <div className="flex gap-2">
        {Object.keys(predefinedRanges).map((key) => (
          <Button
            key={key}
            variant="ghost"
            onClick={() => applyPredefinedRange(key)}
          >
            {key}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default DateRangeCalculator;
