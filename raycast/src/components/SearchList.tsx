import { Action, ActionPanel, getPreferenceValues, Keyboard, List } from "@raycast/api";
import { useMemo, useState } from "react";

import { ApexItem, isUrl, SOURCES } from "../lib/sources";

interface Props {
  search: (input: string) => ApexItem[];
  placeholder: string;
  /** Show which category each result belongs to (used by "Search Everything"). */
  showSource?: boolean;
}

export function SearchList({ search, placeholder, showSource = false }: Props) {
  const [searchText, setSearchText] = useState("");
  const items = useMemo(() => search(searchText), [search, searchText]);

  return (
    <List filtering={false} onSearchTextChange={setSearchText} searchBarPlaceholder={placeholder} throttle>
      {items.map((item) => {
        const source = SOURCES[item.sourceId];
        return (
          <List.Item
            key={`${item.sourceId}:${item.uid}`}
            icon={item.icon ?? source.icon}
            title={item.title}
            subtitle={item.subtitle}
            accessories={showSource ? [{ tag: source.label }] : undefined}
            actions={<ItemActions item={item} />}
          />
        );
      })}
    </List>
  );
}

export function ItemActions({ item }: { item: ApexItem }) {
  const { primaryAction } = getPreferenceValues<Preferences>();

  if (isUrl(item.arg)) {
    return (
      <ActionPanel>
        <Action.OpenInBrowser url={item.arg} />
        <Action.CopyToClipboard title="Copy URL" content={item.arg} />
        <Action.CopyToClipboard title="Copy Title" content={item.title} shortcut={Keyboard.Shortcut.Common.Copy} />
      </ActionPanel>
    );
  }

  const paste = <Action.Paste key="paste" content={item.arg} />;
  const copy = <Action.CopyToClipboard key="copy" content={item.arg} />;

  return (
    <ActionPanel>
      {primaryAction === "copy" ? [copy, paste] : [paste, copy]}
      {item.subtitle && (
        <Action.CopyToClipboard
          title="Copy Description"
          content={item.subtitle}
          shortcut={Keyboard.Shortcut.Common.Copy}
        />
      )}
    </ActionPanel>
  );
}
