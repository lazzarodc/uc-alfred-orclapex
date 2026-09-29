import { LaunchProps } from "@raycast/api";

import { SearchList } from "./components/SearchList";
import { SOURCES } from "./lib/sources";

const source = SOURCES["api-192"];

export default function Command({ fallbackText }: LaunchProps) {
  return (
    <SearchList initialSearchText={fallbackText} search={source.search} placeholder="Search APEX 19.2 API docs..." />
  );
}
