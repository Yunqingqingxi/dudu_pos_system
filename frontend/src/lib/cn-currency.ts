const CN_DIGITS = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
const CN_UNITS = ["", "拾", "佰", "仟", "万", "拾", "佰", "仟", "亿"];

export function amountToChinese(amount: number): string {
  if (amount < 0) return "负" + amountToChinese(-amount);

  const intPart = Math.floor(amount);
  const fracPart = Math.round((amount - intPart) * 100);

  if (intPart === 0 && fracPart === 0) return "零元整";

  let result = "";

  // Integer part
  if (intPart > 0) {
    const digits: number[] = [];
    let n = intPart;
    while (n > 0) {
      digits.push(n % 10);
      n = Math.floor(n / 10);
    }

    let needZero = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      const d = digits[i];
      if (d === 0) {
        needZero = true;
      } else {
        if (needZero && result !== "") {
          result += "零";
        }
        needZero = false;
        result += CN_DIGITS[d] + CN_UNITS[i];
      }
    }
    result += "元";
  } else {
    result += "零元";
  }

  // Fractional part
  if (fracPart === 0) {
    result += "整";
  } else {
    const jiao = Math.floor(fracPart / 10);
    const fen = fracPart % 10;
    if (jiao > 0) result += CN_DIGITS[jiao] + "角";
    if (fen > 0) result += CN_DIGITS[fen] + "分";
  }

  return result;
}
