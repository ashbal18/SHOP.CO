"use client";

import { Destination } from "./editaddress";


interface Props {
  keyword: string;
  setKeyword: (v: string) => void;
  results: Destination[];
  onSearch: () => void;
  loading: boolean;
  error: string;
  onSelect: (d: Destination) => void;
}

export default function DestinationSearch({
  keyword,
  setKeyword,
  results,
  onSearch,
  loading,
  error,
  onSelect,
}: Props) {
  return (
    <div>
      <input
        type="text"
        value={keyword}
        onChange={(e) => {
          setKeyword(e.target.value);
        }}
        placeholder="Cari Kota/Kabupaten & Provinsi"
        className="w-full border rounded px-3 py-2 mb-1"
      />
      <button
        type="button"
        onClick={onSearch}
        disabled={loading}
        className="px-3 py-1 bg-blue-600 text-white rounded mb-2"
      >
        {loading ? "Mencari..." : "Cari"}
      </button>
      {error && <p className="text-red-500">{error}</p>}
      {results.length > 0 && (
        <ul className="border rounded max-h-40 overflow-y-auto">
          {results.map((d, i) => (
            <li
              key={i}
              onClick={() => onSelect(d)}
              className="p-2 hover:bg-gray-100 cursor-pointer"
            >
              <strong>{d.label}</strong>
              <br />
              <span className="text-sm text-gray-500">
                {d.subdistrict_name}, {d.city_name}, {d.province_name}, {d.zip_code}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
