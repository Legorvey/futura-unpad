const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export const formatMechaturaDateTime = (value: string | null) =>
  value ? dateFormatter.format(new Date(value)) : "-";
