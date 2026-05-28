"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

type QuizSearchItem = {
  category: string;
  href: string;
  summary: string;
  title: string;
};

type QuizSearchProps = {
  currentLanguage: {
    flag: string;
    label: string;
  };
  items: QuizSearchItem[];
  labels: {
    label: string;
    noResults: string;
    placeholder: string;
  };
  languageLabel: string;
  languageLinks: Array<{
    flag: string;
    href: string;
    isCurrent: boolean;
    label: string;
  }>;
  navLinks: Array<{
    href: string;
    label: string;
  }>;
};

function normalize(value: string) {
  return value.toLowerCase().trim();
}

export function QuizSearch({ currentLanguage, items, labels, languageLabel, languageLinks, navLinks }: QuizSearchProps) {
  const inputId = useId();
  const dropdownId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const trimmedQuery = normalize(query);
  const results = useMemo(() => {
    if (!trimmedQuery) {
      return items.slice(0, 5);
    }

    return items
      .filter((item) => {
        const haystack = normalize(`${item.title} ${item.summary} ${item.category}`);
        return haystack.includes(trimmedQuery);
      })
      .slice(0, 6);
  }, [items, trimmedQuery]);
  const showResults = isOpen && query.length > 0;

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function onDocumentPointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function onDocumentKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", onDocumentPointerDown);
    document.addEventListener("keydown", onDocumentKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onDocumentPointerDown);
      document.removeEventListener("keydown", onDocumentKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="quiz-search" ref={wrapperRef}>
      <button
        type="button"
        className="quiz-search__button"
        aria-expanded={isOpen}
        aria-controls={dropdownId}
        onClick={() => setIsOpen((value) => !value)}
      >
        <span className="quiz-search__menu-icon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="sr-only">{labels.placeholder}</span>
      </button>

      {isOpen ? (
        <div className="quiz-search__menu" id={dropdownId}>
          <nav className="quiz-search__nav" aria-label="Quick links">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setIsOpen(false)}>
                {link.label}
              </a>
            ))}
          </nav>

          <details className="quiz-search__language">
            <summary aria-label={languageLabel}>
              <span aria-hidden="true">{currentLanguage.flag}</span>
              <span>{currentLanguage.label}</span>
            </summary>
            <div className="quiz-search__language-menu">
              {languageLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  aria-current={link.isCurrent ? "page" : undefined}
                  onClick={() => setIsOpen(false)}
                >
                  <span aria-hidden="true">{link.flag}</span>
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          </details>

          <div className="quiz-search__field">
            <label className="sr-only" htmlFor={inputId}>
              {labels.label}
            </label>
            <span className="quiz-search__icon" aria-hidden="true">
              🔎
            </span>
            <input
              id={inputId}
              autoComplete="off"
              inputMode="search"
              type="search"
              value={query}
              placeholder={labels.placeholder}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          {showResults ? (
            <div className="quiz-search__results" role="listbox">
              {results.length ? (
                results.map((item) => (
                  <a key={item.href} href={item.href} role="option" onClick={() => setIsOpen(false)}>
                    <strong>{item.title}</strong>
                    <span>{item.summary}</span>
                  </a>
                ))
              ) : (
                <p>{labels.noResults}</p>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
