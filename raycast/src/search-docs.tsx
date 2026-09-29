import { LaunchProps } from "@raycast/api";

import { SearchList } from "./components/SearchList";
import { SOURCES } from "./lib/sources";

const source = SOURCES["doc"];

export default function Command({ fallbackText }: LaunchProps) {
  return (
    <SearchList
      initialSearchText={fallbackText}
      search={source.search}
      placeholder="Search APEX API docs (PL/SQL and JS)..."
    />
  );
}
