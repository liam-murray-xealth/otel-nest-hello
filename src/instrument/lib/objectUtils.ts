export function renameField(record: Record<string, unknown>, from: string, to: string) {
  if (from in record) {
    record[to] = record[from]
    delete record[from]
  }
}
export function renameFields(record: Record<string, unknown>, mapping: Record<string, string>) {
  for (const [key, value] of Object.entries(mapping)) {
    renameField(record, key, value)
  }
}
