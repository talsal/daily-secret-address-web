// חישוב שקיעה/צאת הכוכבים מקומי לחלוטין (ללא רשת, ללא API חיצוני) לפי מיקום
// ותאריך. מבוסס על נוסחת NOAA הסטנדרטית לחישוב מיקום השמש האסטרונומי -- פורט
// זהה ל-SunCalculator.swift באפליקציית ה-iOS (אותה נוסחה, אותם קבועים,
// נבדק מול אותם ערכי ייחוס), כדי ששני הפלטפורמות יחשבו את אותו רגע בדיוק.
// הערה: תאריכי JS Date נלקחים תמיד לפי אזור-הזמן המקומי של הדפדפן (getFullYear/
// getMonth/getDate), בדיוק כמו TimeZone.current בצד ה-iOS -- אין צורך בפרמטר
// timeZone נפרד.

/** זווית שקיעת החמה מתחת לאופק המוגדרת כ"צאת הכוכבים" (במעלות). 8.5° היא הזווית
 *  המקובלת בלוחות זמנים של הרבנות הראשית לישראל לצאת הכוכבים. */
export const TZET_HAKOCHAVIM_DEPRESSION_DEGREES = 8.5;

/** מחשב את זמן צאת הכוכבים (השמש X מעלות מתחת לאופק) עבור תאריך ומיקום נתונים.
 *  מחזיר null באזורים קיצוניים שבהם השמש לא יורדת מספיק (למשל חוגי הקוטב בקיץ). */
export function tzetHakochavim(latitude: number, longitude: number, date: Date): Date | null {
	return sunEvent(latitude, longitude, date, TZET_HAKOCHAVIM_DEPRESSION_DEGREES, false);
}

/** חישוב כללי של זריחה/שקיעה עבור זווית נתונה מתחת לאופק (0.833 = שקיעה גאומטרית רגילה).
 *  נוסחת NOAA: https://gml.noaa.gov/grad/solcalc/solareqns.PDF */
export function sunEvent(
	latitude: number,
	longitude: number,
	date: Date,
	depressionDegrees: number,
	rising: boolean
): Date | null {
	const year = date.getFullYear();
	const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
	const daysInYear = isLeap ? 366 : 365;

	const startOfYear = new Date(year, 0, 1);
	const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000) + 1;

	// זווית שבר-היום (fractional year) ברדיאנים
	const gamma = ((2 * Math.PI) / daysInYear) * (dayOfYear - 1);

	// משוואת הזמן (בדקות) ושיפוע השמש (ברדיאנים)
	const eqTime =
		229.18 *
		(0.000075 +
			0.001868 * Math.cos(gamma) -
			0.032077 * Math.sin(gamma) -
			0.014615 * Math.cos(2 * gamma) -
			0.040849 * Math.sin(2 * gamma));
	const decl =
		0.006918 -
		0.399912 * Math.cos(gamma) +
		0.070257 * Math.sin(gamma) -
		0.006758 * Math.cos(2 * gamma) +
		0.000907 * Math.sin(2 * gamma) -
		0.002697 * Math.cos(3 * gamma) +
		0.00148 * Math.sin(3 * gamma);

	const latRad = (latitude * Math.PI) / 180;
	const zenithRad = ((90 + depressionDegrees) * Math.PI) / 180;

	const cosHourAngle =
		Math.cos(zenithRad) / (Math.cos(latRad) * Math.cos(decl)) - Math.tan(latRad) * Math.tan(decl);
	if (cosHourAngle < -1 || cosHourAngle > 1) return null; // השמש לא מגיעה לזווית הזו באותו יום (אזורים קיצוניים)

	let hourAngleDeg = (Math.acos(cosHourAngle) * 180) / Math.PI;
	if (rising) hourAngleDeg = -hourAngleDeg;

	// זמן השיא הסולארי (בדקות UTC), ואז זמן האירוע (זריחה/שקיעה)
	const solarNoonUTCMinutes = 720 - 4 * longitude - eqTime;
	const eventUTCMinutes = solarNoonUTCMinutes + hourAngleDeg * 4;

	// עוגן ל-UTC חצות של אותו תאריך קלנדרי מקומי (אותם שנה/חודש/יום, כאילו UTC),
	// ואז הוספת דקות-האירוע.
	const midnightUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
	return new Date(midnightUTC + eventUTCMinutes * 60000);
}
