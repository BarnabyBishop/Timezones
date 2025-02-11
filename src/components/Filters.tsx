import { Dispatch, SetStateAction } from "react";
import { TimeZone } from "../App";

type FiltersProps = {
  timeZones: TimeZone[];
  setTimeZones: Dispatch<SetStateAction<TimeZone[]>>;
};

const Filter = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean, zoneLabel: string) => void;
}) => {
  return (
    <div
      key={`selectors_${label}`}
      className="border-t border-b border-r rounded-r-lg shadow-md"
    >
      <label
        htmlFor={`selectors_control_${label}`}
        className="flex gap-1 text-sm p-2 w-full cursor-pointer rounded-r-lg bg-white hover:bg-slate-50"
      >
        <input
          id={`selectors_control_${label}`}
          name={`selectors_control_${label}`}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked, label)}
        />
        {label}
      </label>
    </div>
  );
};
export const Filters = ({ timeZones, setTimeZones }: FiltersProps) => {
  return (
    <div className="fixed left-0 top-14 z-10 flex flex-col gap-1">
      <Filter
        checked={timeZones.find(({ selected }) => !selected) ? false : true}
        label="All"
        onChange={(checked) =>
          setTimeZones((prev) =>
            prev.map((zone) => ({
              ...zone,
              selected: checked,
            }))
          )
        }
      />
      {timeZones.map((zone) => (
        <Filter
          key={`filter_${zone.label}`}
          label={zone.label}
          checked={zone.selected}
          onChange={(checked, zoneLabel) =>
            setTimeZones((prev) =>
              prev.map((prevZone) => ({
                ...prevZone,
                selected:
                  prevZone.label === zoneLabel ? checked : prevZone.selected,
              }))
            )
          }
        />
      ))}
    </div>
  );
};
