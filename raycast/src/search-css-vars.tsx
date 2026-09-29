import { SearchList } from "./components/SearchList";
import { SOURCES } from "./lib/sources";

const source = SOURCES["css-vars"];

export default function Command() {
  return <SearchList search={source.search} placeholder="Search Universal Theme CSS variables..." />;
}
