// היום העברי מתחיל בצאת הכוכבים, לא בחצות הגרגוריאני. אם "עכשיו" הוא אחרי צאת
// הכוכבים המקומי (לפי המיקום האמיתי של המשתמש, מ-Geolocation API של הדפדפן),
// אז היום העברי כבר "מחר" -- למרות שהשעון עדיין לפני חצות. מקביל ל-
// EffectiveHebrewDay.swift/LocationProvider.swift באפליקציית ה-iOS.

import { tzetHakochavim } from './sunCalculator';

const JERUSALEM_FALLBACK = { latitude: 31.7683, longitude: 35.2137 };
const STORAGE_KEY = 'dsa-last-known-location';

interface Coordinate {
	latitude: number;
	longitude: number;
}

function getCachedCoordinate(): Coordinate | null {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') return parsed;
	} catch {
		// localStorage לא זמין (מצב פרטי וכו') או תוכן פגום -- נתעלם ונשתמש בברירת מחדל
	}
	return null;
}

function storeCoordinate(coordinate: Coordinate) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(coordinate));
	} catch {
		// לא קריטי -- פשוט לא נשמור ל-load הבא
	}
}

/** מבקש את המיקום האמיתי של המשתמש (עם timeout וברירת מחדל אם המשתמש דוחה/לא נתמך). */
function requestLocation(timeoutMs = 4000): Promise<Coordinate> {
	return new Promise((resolve) => {
		const cached = getCachedCoordinate();
		if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
			resolve(cached ?? JERUSALEM_FALLBACK);
			return;
		}
		const timer = setTimeout(() => resolve(cached ?? JERUSALEM_FALLBACK), timeoutMs);
		navigator.geolocation.getCurrentPosition(
			(position) => {
				clearTimeout(timer);
				const coordinate = { latitude: position.coords.latitude, longitude: position.coords.longitude };
				storeCoordinate(coordinate);
				resolve(coordinate);
			},
			() => {
				clearTimeout(timer);
				resolve(cached ?? JERUSALEM_FALLBACK);
			},
			{ maximumAge: 30 * 60 * 1000, timeout: timeoutMs }
		);
	});
}

/** מחזיר תאריך מותאם (עם תוספת של יום אחד אם עברנו את צאת הכוכבים המקומי של היום)
 *  שיש להזין הלאה לחישוב היום העברי הרגיל. */
export async function resolveEffectiveNow(now: Date = new Date()): Promise<Date> {
	const { latitude, longitude } = await requestLocation();
	const tzet = tzetHakochavim(latitude, longitude, now);
	if (tzet && now >= tzet) {
		const next = new Date(now);
		next.setDate(next.getDate() + 1);
		return next;
	}
	return now;
}
