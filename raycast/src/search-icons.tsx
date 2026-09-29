import { Grid } from "@raycast/api";
import { useMemo, useState } from "react";

import { ItemActions } from "./components/SearchList";
import { SOURCES } from "./lib/sources";

const source = SOURCES["icons"];

export default function Command() {
  const [searchText, setSearchText] = useState("");
  const items = useMemo(() => source.search(searchText), [searchText]);

  return (
    <Grid
      columns={8}
      inset={Grid.Inset.Large}
      filtering={false}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search Font APEX icons..."
      throttle
    >
      {items.map((item) => (
        <Grid.Item
          key={item.uid}
          content={{ value: item.icon ?? source.icon, tooltip: item.subtitle ?? item.title }}
          title={item.title.replace(/^fa-/, "")}
          actions={<ItemActions item={item} />}
        />
      ))}
    </Grid>
  );
}
