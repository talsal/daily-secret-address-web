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

/** ממיר תאריך עברי (שנה/חודש/יום) לתאריך לועזי, דרך Hebcal (h2g=1). */
export async function convertHebrewToGregorian(hy: number, hm: string, hd: number): Promise<Date> {
	const res = await fetch(
		`https://www.hebcal.com/converter?cfg=json&hy=${hy}&hm=${encodeURIComponent(hm)}&hd=${hd}&h2g=1`
	);
	if (!res.ok) throw new Error('Hebcal converter request failed');
	const data = await res.json();
	// Hebcal מחזיר gy/gm/gd -- בונים תאריך מקומי בצהריים (לא UTC) כדי להימנע מבעיות
	// גלישת יום כשממירים בין אזורי זמן.
	return new Date(data.gy, data.gm - 1, data.gd, 12, 0, 0);
}

export interface HebrewYearInfo {
	isLeap: boolean;
	/** סדר החודשים בשנה זו, בכתיב Hebcal (Adar / Adar I+Adar II לפי המצב) */
	monthOrder: string[];
	/** מספר הימים בכל חודש בשנה זו */
	dayCounts: Record<string, number>;
}

const yearInfoCache = new Map<number, Promise<HebrewYearInfo>>();

/** קובע אם שנה עברית נתונה מעוברת (13 חודשים), ואת אורך כל החודשים בה --
 *  באמצעות Hebcal (לא נוסחת מחזור 19 שנה מקומית), כדי לשמור על מקור אמת יחיד
 *  לכל חישובי הלוח העברי באתר, כפי ש-fetchHebrewDate כבר עושה. */
export async function getHebrewYearInfo(hy: number): Promise<HebrewYearInfo> {
	const cached = yearInfoCache.get(hy);
	if (cached) return cached;

	const promise = (async (): Promise<HebrewYearInfo> => {
		// שאילת "אדר ב'" -- אם השנה מעוברת, Hebcal יחזיר hm="Adar II" כפי שנשאל;
		// אם לא, הוא נופל בחזרה בשקט ל"אדר" הרגיל.
		const adarIIRes = await fetch(
			`https://www.hebcal.com/converter?cfg=json&hy=${hy}&hm=Adar+II&hd=1&h2g=1`
		);
		const adarIIData = await adarIIRes.json();
		const isLeap = adarIIData.hm === 'Adar II';

		// חשוון וכסלו הם החודשים היחידים שמשתנים (29 או 30 ימים) בין שנה לשנה --
		// כל שאר החודשים קבועים תמיד. בודקים אם יום 30 "מחזיק מעמד" באותו חודש.
		async function variableMonthLength(month: string): Promise<number> {
			// Hebcal מחזיר 400 + {"error": "...out of valid range..."} כשמבקשים יום 30
			// בחודש שיש בו רק 29 ימים באותה שנה -- זו בדיוק הדרך שבה קובעים את זה.
			const res = await fetch(
				`https://www.hebcal.com/converter?cfg=json&hy=${hy}&hm=${month}&hd=30&h2g=1`
			);
			if (!res.ok) return 29;
			const data = await res.json();
			return data.hm === month ? 30 : 29;
		}
		const [cheshvanLength, kislevLength] = await Promise.all([
			variableMonthLength('Cheshvan'),
			variableMonthLength('Kislev'),
		]);

		const monthOrder = isLeap
			? ['Tishrei', 'Cheshvan', 'Kislev', 'Tevet', "Sh'vat", 'Adar I', 'Adar II', 'Nisan', 'Iyyar', 'Sivan', 'Tamuz', 'Av', 'Elul']
			: ['Tishrei', 'Cheshvan', 'Kislev', 'Tevet', "Sh'vat", 'Adar', 'Nisan', 'Iyyar', 'Sivan', 'Tamuz', 'Av', 'Elul'];

		const dayCounts: Record<string, number> = {
			Tishrei: 30,
			Cheshvan: cheshvanLength,
			Kislev: kislevLength,
			Tevet: 29,
			"Sh'vat": 30,
			Nisan: 30,
			Iyyar: 29,
			Sivan: 30,
			Tamuz: 29,
			Av: 30,
			Elul: 29,
		};
		if (isLeap) {
			dayCounts['Adar I'] = 30;
			dayCounts['Adar II'] = 29;
		} else {
			dayCounts['Adar'] = 30;
		}

		return { isLeap, monthOrder, dayCounts };
	})();

	yearInfoCache.set(hy, promise);
	return promise;
}
