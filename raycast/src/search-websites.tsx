import { SearchList } from "./components/SearchList";
import { SOURCES } from "./lib/sources";

const source = SOURCES["websites"];

export default function Command() {
  return <SearchList search={source.search} placeholder="Search APEX websites..." />;
}
