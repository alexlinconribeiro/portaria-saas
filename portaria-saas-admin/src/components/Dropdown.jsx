import { useState, useRef, useEffect } from "react";

export default function Dropdown({
  options,
  value,
  onChange,
  placeholder,
  searchable = false
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef();

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);

  const filteredOptions = searchable
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  return (
    <div className={`dropdown ${open ? "open" : ""}`} ref={ref}>
      <div className="dropdown-control" onClick={() => setOpen(!open)}>
        {selected ? selected.label : placeholder}
      </div>

      {open && (
        <div className="dropdown-menu">
          {searchable && (
            <div className="dropdown-search-wrap">
              <input
                className="dropdown-search"
                placeholder="Pesquisar..."
                value={search}
                autoFocus
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <div className="dropdown-list">
            {filteredOptions.length === 0 ? (
              <div className="dropdown-empty">Nenhum resultado</div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  className="dropdown-item"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  {opt.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}