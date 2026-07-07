/** e.g. 12.5 -> "12' 6\"" */
export function formatFeetInches(decimalFeet) {
  const totalInches = Math.round(decimalFeet * 12)
  const feet = Math.floor(totalInches / 12)
  const inches = totalInches % 12
  return inches === 0 ? `${feet}'` : `${feet}' ${inches}"`
}
