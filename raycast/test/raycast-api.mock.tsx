// Minimal stand-in for @raycast/api so commands can be rendered in Node.
import type { ReactNode } from "react";

type Props = Record<string, unknown> & { children?: ReactNode };

export const preferences: Record<string, string> = { primaryAction: "paste" };
export const getPreferenceValues = () => preferences;

const named = new Proxy({}, { get: (_, key) => String(key) });
export const Icon = named;
export const Color = named;
export const Image = {};
export const Keyboard = { Shortcut: { Common: { Copy: { modifiers: ["cmd", "shift"], key: "c" } } } };

const json = (value: unknown) => JSON.stringify(value ?? null);

function Container({ children, ...props }: Props) {
  return <div data-container={json(props.searchBarPlaceholder)}>{children}</div>;
}
function Item(props: Props) {
  return (
    <div
      data-item={props.title as string}
      data-subtitle={props.subtitle as string}
      data-icon={json(props.icon ?? (props.content as { value?: unknown })?.value)}
      data-accessories={json(props.accessories)}
    >
      {props.actions as ReactNode}
    </div>
  );
}

export const List = Object.assign(Container, { Item });
export const Grid = Object.assign(Container, { Item, Inset: { Large: "large" } });

export function ActionPanel({ children }: Props) {
  return <div data-actions="">{children}</div>;
}

const action = (kind: string) =>
  function MockAction(props: Props) {
    return <span data-action={kind} data-title={props.title as string} data-value={(props.content ?? props.url) as string} />;
  };
export const Action = {
  OpenInBrowser: action("open"),
  CopyToClipboard: action("copy"),
  Paste: action("paste"),
};
