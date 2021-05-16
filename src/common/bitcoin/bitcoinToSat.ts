export const bitcoinToSat = (value: number) => {
  return (
    Math.floor(value * 100000000)
  )
}