package main

import "math"

var cnDigits = []string{"零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"}
var cnUnits = []string{"", "拾", "佰", "仟", "万", "拾", "佰", "仟", "亿"}

func amountToChinese(amount float64) string {
	if amount < 0 {
		return "负" + amountToChinese(-amount)
	}

	intPart := int(math.Floor(amount))
	fracPart := int(math.Round((amount - float64(intPart)) * 100))

	if intPart == 0 && fracPart == 0 {
		return "零元整"
	}

	result := ""

	if intPart > 0 {
		digits := []int{}
		for n := intPart; n > 0; n /= 10 {
			digits = append(digits, n%10)
		}
		needZero := false
		for i := len(digits) - 1; i >= 0; i-- {
			d := digits[i]
			if d == 0 {
				needZero = true
			} else {
				if needZero && result != "" {
					result += "零"
				}
				needZero = false
				result += cnDigits[d] + cnUnits[i]
			}
		}
		result += "元"
	} else {
		result += "零元"
	}

	if fracPart == 0 {
		result += "整"
	} else {
		jiao := fracPart / 10
		fen := fracPart % 10
		if jiao > 0 {
			result += cnDigits[jiao] + "角"
		}
		if fen > 0 {
			result += cnDigits[fen] + "分"
		}
	}

	return result
}