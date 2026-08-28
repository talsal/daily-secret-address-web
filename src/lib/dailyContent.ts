// מנוע חישוב תוכן היום -- הכתובת היומית לפי הרש"ש.
// פורטו מ-DailyContentEngine.swift (פרויקט ה-iOS), עם שינוי אחד: שמות החודשים
// כאן הם בכתיב של Hebcal API (Sh'vat/Cheshvan/Iyyar/Tishrei) ולא כתיב Foundation
// (Shevat/Heshvan/Iyar/Tishri) -- ראו hebrewDate.ts.

const HEBREW_DAY_LETTERS: Record<number, string> = {
	1: 'א', 2: 'ב', 3: 'ג', 4: 'ד', 5: 'ה', 6: 'ו', 7: 'ז', 8: 'ח', 9: 'ט', 10: 'י',
	11: 'יא', 12: 'יב', 13: 'יג', 14: 'יד', 15: 'טו', 16: 'טז', 17: 'יז', 18: 'יח', 19: 'יט', 20: 'כ',
	21: 'כא', 22: 'כב', 23: 'כג', 24: 'כד', 25: 'כה', 26: 'כו', 27: 'כז', 28: 'כח', 29: 'כט', 30: 'ל',
};

const WEEKDAY_HEBREW: Record<string, string> = {
	Sunday: 'ראשון', Monday: 'שני', Tuesday: 'שלישי', Wednesday: 'רביעי',
	Thursday: 'חמישי', Friday: 'שישי', Saturday: 'שבת',
};

const MONTH_HEBREW: Record<string, string> = {
	Tishrei: 'תשרי', Cheshvan: 'חשון', Kislev: 'כסליו', Tevet: 'טבת',
	"Sh'vat": 'שבט', Adar: 'אדר', 'Adar I': 'אדר א', 'Adar II': 'אדר ב',
	Nisan: 'ניסן', Iyyar: 'אייר', Sivan: 'סיון', Tamuz: 'תמוז', Av: 'אב', Elul: 'אלול',
};

const MONTH_SEFIRA: Record<string, string> = {
	Tishrei: 'חסד', Cheshvan: 'גבורה', Kislev: 'תפארת', Tevet: 'נצח', "Sh'vat": 'הוד',
	Adar: 'יסוד', 'Adar I': 'יסוד', 'Adar II': 'יסוד',
	Nisan: 'חסד', Iyyar: 'גבורה', Sivan: 'תפארת', Tamuz: 'נצח', Av: 'הוד', Elul: 'יסוד',
};

const MONTH_EVAR: Record<string, string> = {
	Tishrei: 'גלגלתא דז״א', Cheshvan: 'אזן ימין דז״א', Kislev: 'אזן שמאל דז״א',
	Tevet: 'עין ימין דז״א', "Sh'vat": 'עין שמאל דז״א',
	Adar: 'חוטמא דז״א', 'Adar I': 'חוטמא דז״א', 'Adar II': 'פה דז״א',
	Nisan: 'גלגלתא דנוק׳', Iyyar: 'אזן ימין דנוק׳', Sivan: 'אזן שמאל דנוק׳',
	Tamuz: 'עין ימין דנוק׳', Av: 'עין שמאל דנוק׳', Elul: 'חוטמא דנוק׳',
};

const WINTER_MONTHS = new Set(['Tishrei', 'Cheshvan', 'Kislev', 'Tevet', "Sh'vat", 'Adar', 'Adar I', 'Adar II']);

const DAY_SEFIRA: Record<string, string> = {
	Sunday: 'חסד', Monday: 'גבורה', Tuesday: 'תפארת', Wednesday: 'נצח',
	Thursday: 'הוד', Friday: 'יסוד', Saturday: 'מלכות',
};

const MONTH_PASUK: Record<string, string> = {
	Tishrei: 'וַיִּרְאוּ אֹתָהּ שָׂרֵי פַרְעֹה',
	Cheshvan: 'וְדָבַשׁ הַיּוֹם הַזֶּה ה׳',
	Kislev: 'וַיַּרְא יוֹשֵׁב הָאָרֶץ הַכְּנַעֲנִי',
	Tevet: 'לַה׳ אִתִּי וּנְרוֹמְמָה שְׁמוֹ',
	"Sh'vat": 'הָמֵר יְמִירֶנּוּ וְהָיָה הוּא',
	Adar: 'עִירָה וְלַשּׂרֵקָה בְּנִי אַתֹנוֹ',
	'Adar I': 'עִירָה וְלַשּׂרֵקָה בְּנִי אַתֹנוֹ',
	'Adar II': 'עִירָה וְלַשּׂרֵקָה בְּנִי אַתֹנוֹ',
	Nisan: 'יִשְׂמְחוּ הַשָּׁמַיִם וְתָגֵל הָאָרֶץ',
	Iyyar: 'יִתְהַלֵּל הַמִּתְהַלֵּל הַשְׂכֵּל וְיָדֹעַ',
	Sivan: 'יְדֹתָיו וּלְצֶלַע הַמִּשְׁכָּן הַשֵּׁנִית',
	Tamuz: 'זֶה אֵינֶנּוּ שֹוֶה לִי',
	Av: 'הַסְכֵּת וּשְׁמַע יִשְׂרָאֵל הַיּוֹם',
	Elul: 'וּצְדָקָה תִּהְיֶה לָּנוּ כִּי',
};

// חודשים שבהם הצירוף נלקח מהאות האחרונה של כל מילה (סופי תיבות), לא הראשונה
const SUFFIX_MONTHS = new Set(['Tishrei', 'Tevet', 'Adar', 'Adar I', 'Adar II', 'Tamuz', 'Elul']);

const ONES_SEFIRA: Record<number, string> = {
	1: 'חכמה', 2: 'בינה', 3: 'דעת', 4: 'חסד', 5: 'גבורה', 6: 'תפארת', 7: 'נצח', 8: 'הוד', 9: 'יסוד', 0: 'מלכות',
};
const TENS_SEFIRA: Record<number, string> = {
	0: 'חכמה', 1: 'בינה', 2: 'דעת', 3: 'חסד', 4: 'גבורה', 5: 'תפארת', 6: 'נצח', 7: 'הוד', 8: 'יסוד', 9: 'מלכות',
};
const HUNDRED_SEFIRA = TENS_SEFIRA;
const THOUSAND_SEFIRA: Record<number, string> = {
	0: 'חסד', 1: 'גבורה', 2: 'תפארת', 3: 'נצח', 4: 'הוד', 5: 'יסוד',
};

export interface DailySpiritualContent {
	hebrewDateLine: string;
	monthEvar: string;
	roshChodeshLine: string | null;
	daySefira: string;
	weekFace: string;
	monthSefira: string;
	monthPasuk: string;
	tzerufHavaya: string;
	yearSefira: string;
	decadeSefira: string;
	hundredSefira: string;
	thousandSefira: string;
	seasonMaBen: string;
	shenatShemita: string;
	shemita: string;
	yovel: string;
	systemDaysLine: string;
	systemTimesLine: string;
}

// א' הוא תמיד ר"ח; משם ואילך 4 שבועות של 7 ימים כל אחד: אבא ב'-ח', אמא ט'-ט"ו,
// ז"א ט"ז-כ"ב, נוק' כ"ג-כ"ט. ל' (בחודש מלא) אינו חלק ממחזור השבועות ונשאר עם
// נוק' כערך הקודם, ו-א' עם אבא, כדי לשמור על התנהגות קודמת בקצוות שלא תוקנו.
function getWeekFace(day: number): string {
	if (day >= 2 && day <= 8) return 'אבא';
	if (day >= 9 && day <= 15) return 'אמא';
	if (day >= 16 && day <= 22) return 'ז״א';
	if (day >= 23 && day <= 29) return 'נוק׳';
	if (day === 1) return 'אבא';
	return 'נוק׳'; // day === 30
}

function yearOnes(year: number): number {
	return year % 10;
}

function yearDecade(year: number): number {
	const decades = Math.floor((year % 100) / 10);
	// תואם ל-Swift: אם הספרה האחרונה 0, מציגים את העשרות "הקודמות" (עדיין לא הושלם העשור)
	return yearOnes(year) === 0 ? decades - 1 : decades;
}

function getShenatShemita(year: number): string {
	const diff = year - 5776 + 1;
	const mod = ((diff % 7) + 7) % 7;
	return mod === 0 ? 'שמיטה' : String(mod);
}

function getShemita(year: number): string {
	const diff = year - 5776 + 1;
	return String(Math.floor(diff / 8) + 4);
}

function getYovel(year: number): string {
	if (year <= 5803) return 'ס״ז';
	if (year <= 5853) return 'ס״ח';
	if (year <= 5903) return 'ס״ט';
	if (year <= 5953) return 'ע';
	return 'ע״א';
}

// מחלץ אות אחת (עם ניקוד) מכל מילה בפסוק, ובונה מהן את צירוף הוי"ה של החודש.
// פורטו מ-applyStyle/getTzerufHavaya ב-ViewController.swift. באופן לא-אינטואיטיבי
// (אך מכוון, כך המקור): הניקוד תמיד נלקח מהאות הראשונה של המילה, גם כשהאות
// המוצגת עצמה (isSuffix) היא האחרונה.
const HEBREW_COMBINING_MARK = /[֑-ׇ]/;

function graphemeAt(text: string, startIndex: number): string {
	let end = startIndex + 1;
	while (end < text.length && HEBREW_COMBINING_MARK.test(text[end])) {
		end++;
	}
	return text.slice(startIndex, end);
}

// עבור כל מילה בפסוק, מוצא את "מיקום ההדגשה" -- האות הראשונה של המילה בד"כ,
// או האחרונה (בין העיצורים העבריים, לא כולל ניקוד) בחודשי סופי תיבות.
// מחזיר גם את מיקום תחילת כל מילה (currentPos), כי צירוף ההוי"ה שואב את הניקוד
// דווקא משם -- גם כשהאות המודגשת/הנבחרת עצמה היא האחרונה.
function computeHighlightLocations(fullText: string, isSuffix: boolean): { wordStart: number; highlightLocation: number }[] {
	const words = fullText.split(' ');
	let currentPos = 0;
	const result: { wordStart: number; highlightLocation: number }[] = [];

	for (const word of words) {
		if (word.length > 0) {
			let highlightLocation = currentPos;
			if (isSuffix) {
				highlightLocation = currentPos + word.length - 1;
				for (let i = word.length - 1; i >= 0; i--) {
					const code = word.charCodeAt(i);
					if (code >= 0x05d0 && code <= 0x05ea) {
						highlightLocation = currentPos + i;
						break;
					}
				}
			}
			result.push({ wordStart: currentPos, highlightLocation });
		}
		currentPos += word.length + 1;
	}

	return result;
}

function extractTzeruf(fullText: string, isSuffix: boolean): string {
	const locations = computeHighlightLocations(fullText, isSuffix);
	const letters: string[] = [];

	for (const { wordStart, highlightLocation } of locations) {
		const chosenLetterOnly = fullText[highlightLocation] ?? '';
		const firstLetterFull = graphemeAt(fullText, wordStart);

		let letterAttr = chosenLetterOnly;
		for (const scalar of firstLetterFull) {
			const val = scalar.codePointAt(0)!;
			if (val === 0x05c1 || val === 0x05c2) continue; // נקודת שין/שמאל -- מסונן
			if (val === 0x05bc) {
				if (chosenLetterOnly === 'ו') continue; // שורוק על וי"ו -- לא מוסיפים סימן נפרד
				letterAttr = scalar + letterAttr;
				continue;
			}
			if (val >= 0x05b0 && val <= 0x05bb) {
				letterAttr = letterAttr + scalar;
			}
		}
		letters.push(letterAttr);
	}

	return letters.join('  ');
}

export interface PasukSegment {
	text: string;
	highlighted: boolean;
}

// מפרק את הפסוק לקטעים, כאשר הקטעים המודגשים הם בדיוק אותן אותיות (עם הניקוד
// הצמוד להן עצמן) שנבחרו לצירוף ההוי"ה -- מקביל להדגשה הכחולה בתוך הפסוק
// באפליקציית ה-iOS (applyStyle, highlightRange).
export function getPasukSegments(monthForSefira: string): PasukSegment[] {
	const fullText = MONTH_PASUK[monthForSefira];
	if (!fullText) return [];
	const isSuffix = SUFFIX_MONTHS.has(monthForSefira);
	const locations = computeHighlightLocations(fullText, isSuffix);

	const segments: PasukSegment[] = [];
	let pos = 0;
	for (const { highlightLocation } of locations) {
		const grapheme = graphemeAt(fullText, highlightLocation);
		if (highlightLocation > pos) {
			segments.push({ text: fullText.slice(pos, highlightLocation), highlighted: false });
		}
		segments.push({ text: grapheme, highlighted: true });
		pos = highlightLocation + grapheme.length;
	}
	if (pos < fullText.length) {
		segments.push({ text: fullText.slice(pos), highlighted: false });
	}
	return segments;
}

export function computeDailyContent(params: {
	year: number;
	month: string;
	day: number;
	weekday: string;
	monthForSefira: string;
	yesterdayDay: number;
}): DailySpiritualContent {
	const { year, month, day, weekday, monthForSefira, yesterdayDay } = params;

	const hebDayLetter = HEBREW_DAY_LETTERS[day] ?? '?';
	const hebrewDateLine = `שנת ${year} ${hebDayLetter} ${MONTH_HEBREW[month] ?? month} יום ${WEEKDAY_HEBREW[weekday] ?? weekday}`;

	let roshChodeshLine: string | null = null;
	if (hebDayLetter === 'ל') {
		roshChodeshLine = 'פנימיות חג“ת נהי“ם דא“א';
	} else if (hebDayLetter === 'א') {
		roshChodeshLine = yesterdayDay === 30 ? 'חיצוניות חג“ת נהי“ם דא“א' : 'פנימיות וחיצוניות חג“ת נהי“ם דא“א';
	}

	const daySefira = DAY_SEFIRA[weekday] ?? '';
	const weekFace = getWeekFace(day);
	const monthSefira = MONTH_SEFIRA[monthForSefira] ?? '';
	const monthEvar = MONTH_EVAR[monthForSefira] ?? '';
	const monthPasuk = MONTH_PASUK[monthForSefira] ?? '';
	const tzerufHavaya = monthPasuk ? extractTzeruf(monthPasuk, SUFFIX_MONTHS.has(monthForSefira)) : '';
	const seasonMaBen = WINTER_MONTHS.has(month) ? 'מ״ה דמ״ה ומ״ה דב״ן (דז״א)' : 'ב״ן דמ״ה וב״ן דב״ן (דנוק׳)';

	const yearSefira = ONES_SEFIRA[yearOnes(year)];
	const decadeSefira = TENS_SEFIRA[yearDecade(year)];
	const hundredSefira = HUNDRED_SEFIRA[Math.floor((year % 1000) / 100)];
	const thousandSefira = THOUSAND_SEFIRA[Math.floor(year / 1000)];

	const shenatShemita = getShenatShemita(year);
	const shemita = getShemita(year);
	const yovel = getYovel(year);

	const systemDaysLine =
		`${daySefira} ד${weekFace} ד${monthSefira} ד${seasonMaBen} ד${yearSefira} ד${decadeSefira} ד${hundredSefira} ד${thousandSefira}`;
	const systemTimesLine = `דשנה ${shenatShemita} לשמיטה ${shemita} ליובל ${yovel}`;

	return {
		hebrewDateLine,
		monthEvar,
		roshChodeshLine,
		daySefira,
		weekFace,
		monthSefira,
		monthPasuk,
		tzerufHavaya,
		yearSefira,
		decadeSefira,
		hundredSefira,
		thousandSefira,
		seasonMaBen,
		shenatShemita,
		shemita,
		yovel,
		systemDaysLine,
		systemTimesLine,
	};
}
