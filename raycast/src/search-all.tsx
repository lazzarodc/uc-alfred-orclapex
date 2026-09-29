import { LaunchProps } from "@raycast/api";

import { SearchList } from "./components/SearchList";
import { searchAll } from "./lib/sources";

export default function Command({ fallbackText }: LaunchProps) {
  return (
    <SearchList
      initialSearchText={fallbackText}
      search={searchAll}
      placeholder="Search all Oracle APEX resources..."
      showSource
    />
  );
}
