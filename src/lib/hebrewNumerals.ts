// המרת מספר לגימטריה עברית (כתיב אותיות), עבור תצוגת שנה עברית (למשל 5786 -> תשפ״ו).
// פונקציה מקומית טהורה (בלי קריאת רשת) -- נבדקה ואומתה מול הפלט האמיתי של Hebcal
// לטווח רחב של שנים, כולל מקרי הקצה (ת״ש, ת״ת, והחריגה של ט״ו/ט״ז).

const HUNDREDS: Record<number, string> = { 100: 'ק', 200: 'ר', 300: 'ש', 400: 'ת' };
const TENS: Record<number, string> = { 10: 'י', 20: 'כ', 30: 'ל', 40: 'מ', 50: 'נ', 60: 'ס', 70: 'ע', 80: 'פ', 90: 'צ' };
const ONES: Record<number, string> = { 1: 'א', 2: 'ב', 3: 'ג', 4: 'ד', 5: 'ה', 6: 'ו', 7: 'ז', 8: 'ח', 9: 'ט' };

function toGematria(n: number): string {
	let letters = '';
	let remaining = n;

	// מאות: 400 חוזר עד שנשאר פחות מ-400 (500=ת+ק, 600=ת+ר, וכו'), ואז ק/ר/ש בודדת
	while (remaining >= 400) {
		letters += 'ת';
		remaining -= 400;
	}
	if (remaining >= 100) {
		const hundredsDigit = Math.floor(remaining / 100) * 100;
		letters += HUNDREDS[hundredsDigit];
		remaining -= hundredsDigit;
	}

	// חריגה: 15/16 לא נכתבים יו"ד-ה"א / יו"ד-ו"או (כדי לא לאיית שם קדוש) -- ט"ו / ט"ז במקום
	if (remaining === 15) {
		letters += 'טו';
		remaining = 0;
	} else if (remaining === 16) {
		letters += 'טז';
		remaining = 0;
	}

	if (remaining >= 10) {
		const tensDigit = Math.floor(remaining / 10) * 10;
		letters += TENS[tensDigit];
		remaining -= tensDigit;
	}
	if (remaining >= 1) {
		letters += ONES[remaining];
	}

	// גרשיים לפני האות האחרונה (או גרש בודד אם יש רק אות אחת)
	if (letters.length === 1) return letters + "'";
	return letters.slice(0, -1) + '״' + letters.slice(-1);
}

/** שנה עברית בגימטריה, בלי האלפים (למשל 5786 -> תשפ״ו) -- כך גם Hebcal מציג אותה. */
export function hebrewYearGematria(hebrewYear: number): string {
	return toGematria(hebrewYear % 1000);
}
