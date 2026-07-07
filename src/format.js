/** e.g. 12.5 -> "12' 6\"" */
export function formatFeetInches(decimalFeet) {
  const totalInches = Math.round(decimalFeet * 12)
  const feet = Math.floor(totalInches / 12)
  const inches = totalInches % 12
  return inches === 0 ? `${feet}'` : `${feet}' ${inches}"`
}

const FT_PER_METER = 3.28084

export function feetToMeters(feet) {
  return feet / FT_PER_METER
}

export function metersToFeet(meters) {
  return meters * FT_PER_METER
}

export function formatDimension(valueFeet, unitSystem = 'imperial') {
  if (unitSystem === 'metric') {
    return `${feetToMeters(valueFeet).toFixed(2)} m`
  }
  return formatFeetInches(valueFeet)
}
