import React, { FunctionComponent, useCallback } from "react";
import { useSearch } from "../../hooks/use-search";
import classes from "./Search.module.scss";
import { ReactComponent as SearchIcon } from "../../assets/icons/search.svg";
import { ReactComponent as CancelIcon } from "../../assets/icons/cancel.svg";
import { useRef } from "react";
import classNames from "classnames";

export type SearchProps = {
  className?: string;
  context?: string;
  responsive?: boolean;
};

const Search: FunctionComponent<SearchProps> = ({
  className,
  context = "default",
  responsive,
}) => {
  const { searchTerm, setSearchTerm, placeholder } = useSearch(context);

  const onSearchChange = useCallback((event) => {
    const term = event.target.value;
    setSearchTerm(term);
  }, []);

  const clearSearchState = useCallback(() => {
    setSearchTerm("");
  }, []);

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={classNames(classes.root, className, {
        // TODO(milestone-x): Add back "disabled" functionality if needed
        [classes.disabled]: false,
        [classes.responsive]: responsive,
      })}
      onClick={() => {
        inputRef.current?.focus();
      }}
    >
      <SearchIcon className={classes.searchIcon} />
      <input
        ref={inputRef}
        type="text"
        onChange={onSearchChange}
        value={searchTerm}
        placeholder={placeholder}
      />
      {!!searchTerm && (
        <CancelIcon
          className={`${classes.cancelIcon}`}
          onClick={clearSearchState}
        />
      )}
    </div>
  );
};

export default Search;