import { SearchList } from "./components/SearchList";
import { SOURCES } from "./lib/sources";

const source = SOURCES["views"];

export default function Command() {
  return <SearchList search={source.search} placeholder="Search APEX views..." />;
}
