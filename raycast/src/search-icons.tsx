import { SearchList } from "./components/SearchList";
import { SOURCES } from "./lib/sources";

const source = SOURCES["icons"];

export default function Command() {
  return <SearchList search={source.search} placeholder="Search Font APEX icons..." />;
}
