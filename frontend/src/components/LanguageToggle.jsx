import { useTranslation } from "react-i18next";

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith("ja") ? "ja" : "en";

  return (
    <div className="flex items-center gap-1 rounded-lg border border-navy-700 bg-navy-800 p-1">
      <button
        onClick={() => i18n.changeLanguage("en")}
        className={`rounded-md px-3 py-1 text-sm font-medium transition-all duration-200 ${
          current === "en" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => i18n.changeLanguage("ja")}
        className={`rounded-md px-3 py-1 text-sm font-semibold transition-all duration-200 ${
          current === "ja" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
        }`}
      >
        日本語
      </button>
    </div>
  );
}
