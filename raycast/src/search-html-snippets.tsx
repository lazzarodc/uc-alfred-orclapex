import { SearchList } from "./components/SearchList";
import { SOURCES } from "./lib/sources";

const source = SOURCES["html-snippets"];

export default function Command() {
  return <SearchList search={source.search} placeholder="Search HTML snippets..." />;
}
