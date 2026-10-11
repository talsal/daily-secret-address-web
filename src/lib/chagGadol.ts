import { getHebrewYearInfo } from './hebrewDate';

// בין יו"כ לסוכות: מיום י"א עד ט"ו בתשרי יש להמשיך אור פנימי מיוחד בכל יום
// (ראה שער הכוונות). מוצג כתמונה סרוקה מתוך הספר ולא כטקסט מוקלד, כדי
// למנוע טעויות תעתוק בתוכן קבלי רגיש.
export const NESHAMA_DAYS = new Set([11, 12, 13, 14, 15]);

// מערכת זמנים גדול (חגים): מראש השנה ועד סוף סוכות (א'-כ"ג בתשרי) הספירה
// היא גבורה. לימי ר"ה עצמם (א'-ב') יש נוסח מלא עם כח"ב/מ"ה-ב"ן/פנימיות-
// חיצוניות; לשאר הימים (כולל יוה"כ וסוכות, עד שיימסר הנוסח המלא שלהם) יש
// רק נוסח מצומצם -- ספירה ושם החג, בלי כח"ב ובלי שורה 2.
export interface ChagGadolContent {
	sefirah: string;
	chagName: string;
	line1Suffix?: string;
	dayLabel?: string;
	line2Phrase?: string;
}

const TISHREI_CHAG_GADOL: Record<number, ChagGadolContent> = {
	1: {
		sefirah: 'גבורה',
		chagName: 'חגי תשרי',
		line1Suffix: 'כח״ב (ג״ר דכללות השנה)',
		dayLabel: 'פנימיות',
		line2Phrase: 'דמ״ה דמ״ה ודמ״ה דב״ן, ודב״ן דמ״ה ודב״ן דב״ן',
	},
	2: {
		sefirah: 'גבורה',
		chagName: 'ר״ה',
		line1Suffix: 'כח״ב (ג״ר דכללות השנה)',
		dayLabel: 'חיצוניות',
		line2Phrase: 'דמ״ה דמ״ה ודמ״ה דב״ן, ודב״ן דמ״ה ודב״ן דב״ן',
	},
};

// שאר החגים: עד שיימסר הנוסח המלא (כח"ב/מ"ה-ב"ן) לכל אחד מהם, כמו שכבר
// נמסר לר"ה -- מוצג נוסח מצומצם: רק ספירה ושם החג.
function reducedChagGadol(sefirah: string, chagName: string): ChagGadolContent {
	return { sefirah, chagName };
}

// חנוכה חוצה חודשים (כ"ה בכסלו ועוד 7 ימים) ואורך כסלו משתנה בין שנים
// (כ"ט או ל'), כך שהיום האחרון בטבת (ב' או ג') תלוי בשנה הספציפית.
function chanukahDaysInTevet(kislevLength: number): number {
	const daysInKislev = kislevLength - 25 + 1; // ימי כסלו שנחגגו: כ"ה עד סוף החודש
	return 8 - daysInKislev;
}

export async function getChagGadolContent(month: string, day: number, year: number): Promise<ChagGadolContent | null> {
	if (month === 'Tishrei') {
		if (day < 1 || day > 23) return null;
		return TISHREI_CHAG_GADOL[day] ?? reducedChagGadol('גבורה', 'חגי תשרי');
	}
	if (month === 'Nisan' && day >= 15 && day <= 22) return reducedChagGadol('חסד', 'פסח');
	if (month === 'Sivan' && day >= 6 && day <= 7) return reducedChagGadol('תפארת', 'שבועות');
	if (month === 'Av' && day === 15) return reducedChagGadol('יסוד', 'ט״ו באב');
	if ((month === 'Adar' || month === 'Adar II') && (day === 14 || day === 15)) return reducedChagGadol('נצח', 'פורים');
	if (month === 'Kislev' && day >= 25) return reducedChagGadol('הוד', 'חנוכה');
	if (month === 'Tevet') {
		const yearInfo = await getHebrewYearInfo(year);
		const kislevLength = yearInfo.dayCounts['Kislev'] ?? 30;
		if (day >= 1 && day <= chanukahDaysInTevet(kislevLength)) return reducedChagGadol('הוד', 'חנוכה');
	}
	return null;
}

export interface ChagGadolLines {
	line1: string;
	line2: string | null;
	line3: string;
}

// שלוש שורות המערכת לתצוגה: ספירה+שם החג (+כח"ב), שורת פנימיות/חיצוניות (אם יש),
// ושורת ספירות השנה באותיות.
export function chagGadolLines(
	chag: ChagGadolContent,
	yearSefiros: { yearSefira: string; decadeSefira: string; hundredSefira: string; thousandSefira: string },
	yearLetters: string
): ChagGadolLines {
	let line1 = `א״ק ואבי״ע ד${chag.sefirah} (${chag.chagName})`;
	if (chag.line1Suffix) line1 += `, ד${chag.line1Suffix}`;
	const line2 = chag.dayLabel && chag.line2Phrase ? `*ד${chag.dayLabel}: ${chag.line2Phrase}` : null;
	const line3 = `ד${yearSefiros.yearSefira} ד${yearSefiros.decadeSefira} ד${yearSefiros.hundredSefira} ד${yearSefiros.thousandSefira} ${yearLetters}`;
	return { line1, line2, line3 };
}
