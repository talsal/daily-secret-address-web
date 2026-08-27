// שולף תאריך עברי (שנה/חודש/יום) עבור תאריך לועזי נתון, דרך Hebcal API הציבורי.
// אין תלות בספרייה מקומית לחישוב הלוח העברי -- Hebcal עושה את כל העבודה.

export interface HebrewDate {
	/** שנה עברית, למשל 5786 */
	year: number;
	/** שם החודש באנגלית, בדיוק כפי ש-Hebcal מחזיר (Tishrei, Cheshvan, Kislev, Tevet,
	 *  Sh'vat, Adar, Adar I, Adar II, Nisan, Iyyar, Sivan, Tamuz, Av, Elul) */
	month: string;
	/** יום בחודש, 1-30 */
	day: number;
	/** יום בשבוע (Sunday..Saturday) */
	weekday: string;
	/** התאריך העברי בכתיב עברי מלא, כפי שHebcal מחזיר */
	hebrewText: string;
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export async function fetchHebrewDate(date: Date): Promise<HebrewDate> {
	const gy = date.getFullYear();
	const gm = date.getMonth() + 1;
	const gd = date.getDate();

	const res = await fetch(`https://www.hebcal.com/converter?cfg=json&gy=${gy}&gm=${gm}&gd=${gd}&g2h=1`);
	if (!res.ok) throw new Error('Hebcal converter request failed');

	const data = await res.json();
	return {
		year: data.hy,
		month: data.hm,
		day: data.hd,
		weekday: WEEKDAYS[date.getDay()],
		hebrewText: data.hebrew,
	};
}

/** שם החודש שרלוונטי ל"ספירת החודש"/"מקום עמידתו" -- ביום ל' בחודש, זה חודש
 *  המחר (ראו hebrewCalendarDayThirtyRule.md / DailyContentEngine.swift בפרויקט iOS). */
export async function fetchMonthForSefira(date: Date, hebrewDate: HebrewDate): Promise<string> {
	if (hebrewDate.day !== 30) return hebrewDate.month;
	const tomorrow = new Date(date);
	tomorrow.setDate(tomorrow.getDate() + 1);
	const tomorrowHebrew = await fetchHebrewDate(tomorrow);
	return tomorrowHebrew.month;
}
