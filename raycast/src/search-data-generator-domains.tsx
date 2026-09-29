import { SearchList } from "./components/SearchList";
import { SOURCES } from "./lib/sources";

const source = SOURCES["data_generator_domains"];

export default function Command() {
  return <SearchList search={source.search} placeholder="Search Data Generator domains..." />;
}
