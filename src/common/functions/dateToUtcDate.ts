export const dateToUtcDate = (date: Date) => (
  new Date(date.toUTCString().slice(0,-4))
)
