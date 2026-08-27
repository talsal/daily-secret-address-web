// בונה נתיב מוחלט הכולל את ה-base של האתר (חשוב כי trailingSlash: 'never'
// גורם לקישורים/נכסים יחסיים מדף השורש (index, בלי / בסוף) להתפרש שגוי --
// יחסית להורה של ה-base ולא ל-base עצמו. ראו גם yosef-ly-synagogue/src/data/site.ts.
export function withBase(path: string): string {
	const base = import.meta.env.BASE_URL.replace(/\/$/, '');
	const cleanPath = path.replace(/^\//, '');
	return `${base}/${cleanPath}`;
}
