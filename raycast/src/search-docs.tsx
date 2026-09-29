import { SearchList } from "./components/SearchList";
import { SOURCES } from "./lib/sources";

const source = SOURCES["doc"];

export default function Command() {
  return <SearchList search={source.search} placeholder="Search APEX API docs (PL/SQL and JS)..." />;
}
