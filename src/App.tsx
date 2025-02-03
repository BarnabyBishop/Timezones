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
/** TODO
 * - Set favourites (ELMO, AW etc)
 * - Hover current time bar
 * - Click row to copy Slack ready time (10:30am WA / 12:00pm NSW (AEST) / 4:30pm NZ)
 */
const DEFAULT_ZONE = "Seoul";

const DEFAULT_TIMEZONES = [
  {
    label: "UK",
    timezone: "Europe/London",
    gmtOffset: 1,
    abbreviation: "BST",
    hasDST: true,
    selected: false,
  },
  {
    label: "Poland",
    timezone: "Europe/Warsaw",
    gmtOffset: 2,
    abbreviation: "CEST",
    hasDST: true,
    selected: false,
  },
  {
    label: "India",
    timezone: "Asia/Kolkata",
    gmtOffset: 5.5,
    abbreviation: "IST",
    hasDST: false,
    selected: false,
  },
  {
    label: "Perth",
    timezone: "Australia/Perth",
    gmtOffset: 8,
    abbreviation: "AWST",
    hasDST: false,
    selected: true,
  },
  {
    label: "Seoul",
    timezone: "Asia/Seoul",
    gmtOffset: 9,
    abbreviation: "KST",
    hasDST: false,
    selected: true,
  },
  {
    label: "QLD",
    timezone: "Australia/Brisbane",
    gmtOffset: 10,
    abbreviation: "AEST",
    hasDST: false,
    selected: true,
  },
  {
    label: "NSW",
    timezone: "Australia/Sydney",
    gmtOffset: 11,
    abbreviation: "AEDT",
    hasDST: true,
    selected: true,
  },
  {
    label: "New Zealand",
    timezone: "Pacific/Auckland",
    gmtOffset: 13,
    abbreviation: "NZDT",
    hasDST: true,
    selected: true,
  },
];

function App() {
  // Used to rerender every minute to update the 'now' line
  const [now, setNow] = useState(new Date());

  const [timeZones, setTimeZones] = useState(DEFAULT_TIMEZONES);

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
      let selectedCount = 0;
      let notSelectedCount = 0;

      timeZones.forEach(({ selected }) => {
        if (selected) {
          selectedCount++;
        } else {
          notSelectedCount++;
        }
      });

      if (selectedCount > notSelectedCount) {
        setTimeZones(
          timeZones.map((zone) =>
            zone.label === DEFAULT_ZONE
              ? { ...zone, selected: true }
              : { ...zone, selected: false }
          )
        );
      } else {
        setTimeZones(timeZones.map((zone) => ({ ...zone, selected: true })));
      }
      return;
    }

    setTimeZones((prev) =>
      prev.map((zone) => ({ ...zone, selected: !zone.selected }))
    );
  };

  const toggleRow = (index: number) => {
    navigator.clipboard.writeText(
      selectedTimeZones
        .map((zone) => {
          const time = new Date();
          time.setHours(index, 0, 0, 0);

          const tzDate = new TZDate(time, zone.timezone);
          addHours(tzDate, index).toString();
          return `${format(tzDate, "hh:mmaa")} ${zone.label}`;
        })
        .join(" / ")
    );
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
  const selectedTimeZones = timeZones.filter(
    (zone) => zone.selected || zone.label === DEFAULT_ZONE
  );

  return (
    <div className="grid justify-center">
      <div className="fixed left-0 top-14 z-10 flex flex-col gap-1">
        <div
          key={`selectors_all`}
          className="border-t border-b border-r rounded-r-lg"
        >
          <label
            htmlFor={`selectors_all_control`}
            className="flex gap-1 text-sm p-2 w-full cursor-pointer rounded-r-lg hover:bg-slate-50"
          >
            <input
              id={`selectors_all_control`}
              name={`selectors_all_control`}
              type="checkbox"
              checked={
                timeZones.find(({ selected }) => !selected) ? false : true
              }
              onChange={(e) =>
                setTimeZones((prev) =>
                  prev.map((zone) => ({
                    ...zone,
                    selected: e.target.checked,
                  }))
                )
              }
            />
            All
          </label>
        </div>
        {timeZones.map((zone) => {
          return (
            <div
              key={`selectors_${zone.label}`}
              className="border-t border-b border-r rounded-r-lg"
            >
              <label
                htmlFor={`selectors_${zone.label}_control`}
                className="flex gap-1 text-sm p-2 w-full cursor-pointer rounded-r-lg hover:bg-slate-50"
              >
                <input
                  id={`selectors_${zone.label}_control`}
                  name={`selectors_${zone.label}_control`}
                  type="checkbox"
                  checked={zone.selected}
                  onChange={(e) =>
                    setTimeZones((prev) =>
                      prev.map((prevZone) => ({
                        ...prevZone,
                        selected:
                          prevZone.label === zone.label
                            ? e.target.checked
                            : prevZone.selected,
                      }))
                    )
                  }
                />
                {zone.label}
              </label>
            </div>
          );
        })}
      </div>
      <div
        className={`grid relative border rounded-lg`}
        key={now.toString()}
        style={{
          gridTemplateColumns: `repeat(${
            selectedTimeZones.length || 1
          }, minmax(0, 140px))`,
        }}
      >
        <div
          className={`
              grid
              grid-cols-subgrid
              col-span-${selectedTimeZones.length}
              ${rowHeightClass}
              border-b
              gap-4
              justify-center
              items-center 
              text-gray-400
              text-sm
              font-bold
              select-none
              
              `}
        >
          {selectedTimeZones.map((zone) => (
            <div
              className={`
              ${rowHeightClass}
              cursor-pointer
              p-3
              `}
              key={zone.label}
              onClick={() => toggleZone(zone)}
            >
              {zone.label}
            </div>
          ))}
        </div>
        {Array.from({ length: 24 }, (_, index) => index).map((index) => (
          <div
            className={`
              grid
              grid-cols-subgrid
              col-span-${selectedTimeZones.length}
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
            {selectedTimeZones.map((zone) => {
              const time = new Date();
              time.setHours(index, 0, 0, 0);

              const tzDate = new TZDate(time, zone.timezone);
              addHours(tzDate, index).toString();
              return (
                <div
                  className={`
                    text-sm
                    p-1
                    rounded-sm
                    ${zone.label === DEFAULT_ZONE ? "font-bold" : ""}
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
