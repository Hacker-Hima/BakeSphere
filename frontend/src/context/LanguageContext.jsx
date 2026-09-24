import { createContext, useContext, useState, useEffect } from "react";
import { translations } from "../i18n/translations.js";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("bakesphere_lang") || "en";
  });

  useEffect(() => {
    localStorage.setItem("bakesphere_lang", language);
  }, [language]);

  const t = (key) => {
    const dict = translations[language] || translations.en;
    return dict[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
