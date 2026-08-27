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
	yearSefira: string;
	decadeSefira: string;
	hundredSefira: string;
	thousandSefira: string;
	seasonMaBen: string;
	shenatShemita: string;
	shemita: string;
	yovel: string;
	systemDaysLine: string;
}

function getWeekFace(day: number): string {
	if (day >= 1 && day <= 7) return 'אבא';
	if (day >= 8 && day <= 14) return 'אמא';
	if (day >= 15 && day <= 21) return 'ז״א';
	return 'נוק׳';
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

	return {
		hebrewDateLine,
		monthEvar,
		roshChodeshLine,
		daySefira,
		weekFace,
		monthSefira,
		monthPasuk,
		yearSefira,
		decadeSefira,
		hundredSefira,
		thousandSefira,
		seasonMaBen,
		shenatShemita,
		shemita,
		yovel,
		systemDaysLine,
	};
}
