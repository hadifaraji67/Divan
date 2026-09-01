import { Field } from "@/components/field";
import { getCities, getCounties, PROVINCES } from "@/lib/locations";

const selectClass = "flex h-11 w-full rounded-md border border-input bg-card px-3 text-sm";

export type LocationValue = {
  province: string;
  county: string;
  city: string;
};

/** Cascading استان / شهرستان / شهر selects, backed by the full Iran dataset. */
export function LocationFields({
  value,
  onChange,
}: {
  value: LocationValue;
  onChange: (next: LocationValue) => void;
}) {
  const counties = value.province ? getCounties(value.province) : [];
  const cities = value.province && value.county ? getCities(value.province, value.county) : [];

  return (
    <>
      <Field label="استان">
        <select
          className={selectClass}
          value={value.province}
          onChange={(e) => onChange({ province: e.target.value, county: "", city: "" })}
        >
          <option value="">انتخاب کنید</option>
          {PROVINCES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </Field>
      <Field label="شهرستان">
        <select
          className={selectClass}
          value={value.county}
          disabled={!value.province}
          onChange={(e) => onChange({ ...value, county: e.target.value, city: "" })}
        >
          <option value="">انتخاب کنید</option>
          {counties.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>
      <Field label="شهر">
        <select
          className={selectClass}
          value={value.city}
          disabled={!value.county}
          onChange={(e) => onChange({ ...value, city: e.target.value })}
        >
          <option value="">انتخاب کنید</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>
    </>
  );
}
