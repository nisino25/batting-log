// Japanese national holidays (内閣府 rules) and the default round size:
// weekday (not a holiday) -> 25 pitches, weekend or holiday -> 20 pitches.
(function (root) {
  // Fixed-date holidays, "M-D"
  const FIXED = ['1-1', '2-11', '2-23', '4-29', '5-3', '5-4', '5-5', '8-11', '11-3', '11-23'];

  // The n-th Monday of month m (1-based), as a day of month
  function nthMonday(y, m, n) {
    const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
    const offset = (1 - first + 7) % 7;
    return 1 + offset + (n - 1) * 7;
  }

  // Equinox day approximation (valid 1980-2099)
  function equinoxDay(y, base) {
    return Math.floor(base + 0.242194 * (y - 1980) - Math.floor((y - 1980) / 4));
  }

  function key(d) {
    return (d.getMonth() + 1) + '-' + d.getDate();
  }

  const cache = {};
  function holidaysOf(y) {
    if (cache[y]) return cache[y];

    const set = new Set(FIXED);
    set.add('1-' + nthMonday(y, 1, 2));   // Coming of Age Day
    set.add('7-' + nthMonday(y, 7, 3));   // Marine Day
    set.add('9-' + nthMonday(y, 9, 3));   // Respect for the Aged Day
    set.add('10-' + nthMonday(y, 10, 2)); // Sports Day
    set.add('3-' + equinoxDay(y, 20.8431)); // Vernal Equinox
    set.add('9-' + equinoxDay(y, 23.2488)); // Autumnal Equinox

    // Days in the year, in order
    const days = [];
    for (let d = new Date(y, 0, 1); d.getFullYear() === y; d = new Date(y, d.getMonth(), d.getDate() + 1)) {
      days.push(d);
    }

    // Substitute holiday: a holiday on Sunday moves to the next non-holiday day
    const base = new Set(set);
    days.forEach(d => {
      if (base.has(key(d)) && d.getDay() === 0) {
        let n = new Date(y, d.getMonth(), d.getDate() + 1);
        while (set.has(key(n))) n = new Date(y, n.getMonth(), n.getDate() + 1);
        if (n.getFullYear() === y) set.add(key(n));
      }
    });

    // Citizens' Holiday: a day sandwiched between two holidays
    for (let i = 1; i < days.length - 1; i++) {
      const d = days[i];
      if (!set.has(key(d)) && set.has(key(days[i - 1])) && set.has(key(days[i + 1]))) {
        set.add(key(d));
      }
    }

    cache[y] = set;
    return set;
  }

  function isJpHoliday(date) {
    return holidaysOf(date.getFullYear()).has(key(date));
  }

  function defaultRoundSize(date) {
    const d = date || new Date();
    const weekend = d.getDay() === 0 || d.getDay() === 6;
    return weekend || isJpHoliday(d) ? 20 : 25;
  }

  const api = { isJpHoliday, defaultRoundSize };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.JpHoliday = api;
})(typeof window !== 'undefined' ? window : globalThis);
