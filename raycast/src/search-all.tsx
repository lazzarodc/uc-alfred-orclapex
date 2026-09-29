import { SearchList } from "./components/SearchList";
import { searchAll } from "./lib/sources";

export default function Command() {
  return <SearchList search={searchAll} placeholder="Search all Oracle APEX resources..." showSource />;
}
