import { TZDate } from "@date-fns/tz";
import { addHours, format } from "date-fns";
import "./App.css";
import { useEffect, useState } from "react";

type TimeZone = {
  label: string;
  timezone: string;
  gmtOffset: number;
  abbreviation: string;
  hasDST: boolean;
};

const DEFAULT_ZONE = "Sydney";

const timeZones = [
  {
    label: "UK",
    timezone: "Europe/London",
    gmtOffset: 1,
    abbreviation: "BST",
    hasDST: true,
  },
  {
    label: "Poland",
    timezone: "Europe/Warsaw",
    gmtOffset: 2,
    abbreviation: "CEST",
    hasDST: true,
  },
  {
    label: "India",
    timezone: "Asia/Kolkata",
    gmtOffset: 5.5,
    abbreviation: "IST",
    hasDST: false,
  },
  {
    label: "Perth",
    timezone: "Australia/Perth",
    gmtOffset: 8,
    abbreviation: "AWST",
    hasDST: false,
  },
  {
    label: "Seoul",
    timezone: "Asia/Seoul",
    gmtOffset: 9,
    abbreviation: "KST",
    hasDST: false,
  },
  {
    label: "Brisbane",
    timezone: "Australia/Brisbane",
    gmtOffset: 10,
    abbreviation: "AEST",
    hasDST: false,
  },
  {
    label: "Sydney",
    timezone: "Australia/Sydney",
    gmtOffset: 11,
    abbreviation: "AEDT",
    hasDST: true,
  },
  {
    label: "New Zealand",
    timezone: "Pacific/Auckland",
    gmtOffset: 13,
    abbreviation: "NZDT",
    hasDST: true,
  },
];

function App() {
  // Used to rerender every minute to update the 'now' line
  const [now, setNow] = useState(new Date());

  const [selectedZones, setSelectedZones] = useState(
    Object.fromEntries(timeZones.map(({ label }) => [label, true]))
  );

  const [selectedRows, setSelectedRows] = useState<Array<number>>([]);

  // Set a timer to rerender every minute
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(timer);
  });

  // Toggle the visibility of each timezone. This only hides the times, it doesn't remove the timezone column
  const toggleZone = (zone: TimeZone) => {
    // If the default zone is clicked, toggle a full selection or unselection based on how many items are selected.
    // Easy for toggling all on and off
    if (zone.label === DEFAULT_ZONE) {
      // Are most of the zones enabled or disabled?
      let selected = 0;
      let notSelected = 0;

      Object.values(selectedZones).forEach((enabled) => {
        if (enabled) {
          selected++;
        } else {
          notSelected++;
        }
      });

      if (selected > notSelected) {
        setSelectedZones(
          Object.fromEntries(
            timeZones.map(({ label }) =>
              label === DEFAULT_ZONE ? [label, true] : [label, false]
            )
          )
        );
      } else {
        setSelectedZones(
          Object.fromEntries(timeZones.map(({ label }) => [label, true]))
        );
      }
      return;
    }

    setSelectedZones((prev) => ({
      ...selectedZones,
      [zone.label]: !prev[zone.label],
    }));
  };

  const toggleRow = (index: number) => {
    if (selectedRows.includes(index)) {
      setSelectedRows((prev) => prev.filter((row) => row !== index));
    } else {
      setSelectedRows((prev) => [...prev, index]);
    }
  };

  const nowHour = now.getHours();
  const nowMinutes = now.getMinutes();
  const rowHeight = 48;
  const rowHeightClass = "h-12";
  // Hours plus heading minus 1px for each hour row (to offset the mt-[-1px] to remove double border) plus minutes
  const hourTop = nowHour * rowHeight + rowHeight;
  // const borderOffsetTop = nowHour * 1;- borderOffsetTop
  const minuteTop = (48 / 60) * nowMinutes;
  const nowPosition = hourTop + minuteTop;

  return (
    <div>
      <div className="fixed left-1 top-14 z-10">
        <div key={`selectors_all`} className="flex gap-1 cursor-pointer">
          <input
            id={`selectors_all_control`}
            name={`selectors_all_control`}
            type="checkbox"
            checked={
              Object.entries(selectedZones).find(
                ([zone, selected]) => !selected
              )
                ? false
                : true
            }
            onChange={(e) =>
              setSelectedZones(
                Object.fromEntries(
                  timeZones.map(({ label }) => [label, e.target.checked])
                )
              )
            }
          />
          <label htmlFor={`selectors_all_control`} className="text-sm">
            All
          </label>
        </div>
        {Object.entries(selectedZones).map(([zone, selected]) => {
          return (
            <div
              key={`selectors_${zone}`}
              className="flex gap-1 cursor-pointer"
            >
              <input
                id={`selectors_${zone}_control`}
                name={`selectors_${zone}_control`}
                type="checkbox"
                checked={selected}
                onChange={(e) =>
                  setSelectedZones((prev) => ({
                    ...prev,
                    [zone]: !!e.target.checked,
                  }))
                }
              />
              <label htmlFor={`selectors_${zone}_control`} className="text-sm">
                {zone}
              </label>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-8 relative" key={now.toString()}>
        {timeZones.map((zone) => (
          <div
            className={`
              text-gray-400
              text-sm
              ${rowHeightClass}
              bg-white
              rounded-sm
              cursor-pointer
              font-bold
              align-bottom
              select-none
            `}
            key={zone.label}
            onClick={() => toggleZone(zone)}
          >
            {zone.label}
          </div>
        ))}
        {Array.from({ length: 24 }, (_, index) => index).map((index) => (
          <div
            className={`
              grid
              grid-cols-subgrid
              col-span-8
              ${rowHeightClass}
              border-b
              cursor-pointer
              gap-4
              justify-center
              items-center 
              ${
                selectedRows.includes(index)
                  ? "bg-slate-100"
                  : "hover:bg-slate-50"
              }
              `}
            key={`row-${index}`}
            onClick={() => toggleRow(index)}
          >
            {timeZones.map((zone) => {
              const time = new Date();
              time.setHours(index, 0, 0, 0);
              // console.log(time);

              const tzDate = new TZDate(time, zone.timezone);
              addHours(tzDate, index).toString();
              // const time = `${index > 12 ? index - 12 : index}:00 ${index >= 12 ? "PM" : "AM"}`
              return (
                <div
                  className={`
                  text-sm
                  p-1
                  rounded-sm
                  ${zone.label === DEFAULT_ZONE ? "font-bold" : ""}
                  ${
                    !selectedZones[zone.label]
                      ? "text-transparent"
                      : "text-gray-400"
                  }
                `}
                  key={`${zone.label}_${tzDate.toString()}`}
                >
                  {format(tzDate, "hh:mm aa")}
                </div>
              );
            })}
          </div>
        ))}
        <div
          className={`
            absolute
            h-[1px]
            w-full
            border-t
            border-t-red-500
          `}
          style={{ top: `${nowPosition}px` }}
        >
          <div
            className={`
            absolute
            top-1/2
            -translate-y-1/2
            mt-[-1px]
            left-full
            pl-1
            text-xs
            text-red-600
            whitespace-nowrap
            
            `}
          >
            {format(now, "hh:mm aa")}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
