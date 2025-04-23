type CalcParams = {
    sqm: number
    sprayRate: number
    formula: number
    type: 'Bitumen' | 'Asphalt' | 'Roadbase' | 'Stone'
  }
  
  export function calculateMaterialQuantity({ sqm, sprayRate, formula, type }: CalcParams): number {
    if (!sqm || !sprayRate || !formula) return 0
  
    switch (type) {
      case 'Bitumen':
        return round(sqm * sprayRate / formula)
      case 'Asphalt':
      case 'Roadbase':
        return round(sqm * sprayRate * formula)
      case 'Stone':
        return round(sqm / sprayRate * formula)
      default:
        return 0
    }
  }
  
  function round(value: number) {
    return Math.round(value * 100) / 100
  }
  