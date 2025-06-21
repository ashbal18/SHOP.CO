"use client";
import { useState } from "react";

export const DropdownMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("En");

  interface Language {
    code: string;
    name: string;
  }

  const languages = [
    { code: "En", name: "En" },
    { code: "Id", name: "Id" },
  ];

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelectLanguage = (language: Language) => {
    setSelectedLanguage(language.code);
    setIsOpen(false);
  };

  const selectedLanguageName = languages.find(
    (lang) => lang.code === selectedLanguage
  )?.name;

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="inline-flex justify-center w-full rounded-2xl text-[16px] pl-[16px] py-[18.5px] border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100"
          id="menu-button"
          aria-expanded={isOpen ? "true" : "false"}
          onClick={toggleDropdown}
        >
          {selectedLanguageName}
          <svg
            className="ml-[8px] h-[24px] mr-[13px]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06 0L10 10.394l3.71-3.184a.75.75 0 111.02 1.1l-4 3.415a.75.75 0 01-1.02 0l-4-3.415a.75.75 0 010-1.1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div
          className="absolute z-[3] origin-top-right right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
        >
          <div className="py-1" role="none">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleSelectLanguage(language)}
                className="text-gray-700 block w-full px-4 py-2 text-sm text-left"
                role="menuitem"
              >
                {language.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
