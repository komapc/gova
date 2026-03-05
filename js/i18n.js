/**
 * i18n.js — Traduka mekanismo por Gova
 */

const I18n = (() => {
  const LANGUAGES = {
    eo: 'Esperanto',
    lv: 'Latviešu',
    be: 'Беларуская',
    tp: 'Toki Pona',
    arc: 'ܐܪܡܝܐ'
  };

  const STRINGS = {
    arc: {
      subtitle: 'ܡܫܘܚܐ ܕܪܘܡܐ',
      searching: 'ܒܨܝܐ ܥܠ GPS...',
      locked: 'GPS ܐܫܟܚ',
      error: 'ܦܘܕܐ ܒ GPS',
      unit: 'ܟܝܘܠ̈ܐ',
      meters: 'ܡܬܪ̈ܐ',
      feet: 'ܦܘܛ̈ܐ',
      baseHeight: 'ܪܘܡܐ ܫܪܫܝܐ',
      setBase: 'ܣܝܡ ܪܘܡܐ ܗܫܝܐ ܐܝܟ ܫܪܫܐ',
      clearBase: 'ܫܩܘܠ ܫܪܫܐ',
      noBase: 'ܠܝܬ ܪܘܡܐ ܫܪܫܝܐ',
      hasBase: 'ܫܪܫܐ: ',
      theme: 'ܨܘܪܬܐ',
      auto: 'ܝܬܝܐ',
      light: 'ܒܗܝܪܐ',
      dark: 'ܚܫܘܟܐ',
      history: 'ܬܫܥܝܬܐ',
      viewHistory: 'ܚܙܝ ܬܫܥܝܬܐ',
      points: 'ܢܘܩܙ̈ܐ ܢܛܝܪ̈ܐ',
      savePoint: '💾 ܢܛܘܪ ܢܘܩܙܐ ܗܫܝܐ',
      todayHigh: 'ܪܘܡܐ ܥܠܝܐ ܕܝܘܡܐ:',
      todayLow: 'ܪܘܡܐ ܬܚܬܝܐ ܕܝܘܡܐ:',
      viewPoints: '📍 ܚܙܝ ܟܠ ܢܘܩܙ̈ܐ',
      about: 'ܡܢ ܓܘܒܐ',
      aboutDesc: 'ܓܘܒܐ ܗܘ ܡܐܢܐ ܕܡܫܘܚܐ ܕܪܘܡܐ ܒܠܫܢܐ ܐܣܦܪܢܛܘ.',
      precisionDesc: 'ܚܬܝܬܘܬܐ: GPS ܥܠ WGS84. MSL ܥܠ Geoid. TERO ܗܘ ܐܪܥܐ. BARO ܗܘ ܚܝܠܐ ܕܐܐܪ.',
      github: 'ܦܪܘܓܪܡܐ ܒ GitHub ↗',
      install: 'ܐܬܩܢ ܐܦܠܝܩܣܝܘܢ',
      installBtn: 'ܐܬܩܢ ܓܘܒܐ',
      installDesc: 'ܐܬܩܢ ܠܡܛܝܬܐ ܩܠܝܠܬܐ',
      close: 'ܣܟܘܪ',
      versionDate: 'ܐܕܪ 2026',
      toastNoGps: 'ܠܝܬ ܝܕܥܬܐ ܕ GPS',
      toastNoLoc: 'ܠܝܬ ܝܕܥܬܐ ܕܕܘܟܬܐ',
      toastSaved: 'ܢܘܩܙܐ ܐܬܢܛܪ!',
      toastBaseSet: 'ܫܪܫܐ ܐܬܣܝܡ',
      toastBaseCleared: 'ܫܪܫܐ ܐܬܫܩܠ',
      historyTitle: 'ܬܫܥܝܬܐ ܕܪܘܡܐ',
      min: 'ܬܚܬܝܐ',
      max: 'ܥܠܝܐ',
      avg: 'ܡܨܥܝܐ',
      range: 'ܦܪܝܫܘܬܐ',
      noHistory: 'ܠܝܬ ܬܫܥܝܬܐ ܥܕܟܝܠ',
      historyDesc: 'ܝܕܥܬ̈ܐ ܡܬܟܢܫܝܢ ܟܕ ܡܦܠܚ ܐܢܬ ܠܐܦܠܝܩܣܝܘܢ',
      exportJson: 'ܦܠܘܛ JSON',
      exportCsv: 'ܦܠܘܛ CSV',
      clearHistory: 'ܫܩܘܠ ܬܫܥܝܬܐ',
      cancel: 'ܒܛܘܠ',
      back: 'ܠܒܬܪܐ',
      pointsTitle: 'ܢܘܩܙ̈ܐ ܢܛܝܪ̈ܐ',
      noPoints: 'ܠܝܬ ܢܘܩܙ̈ܐ ܢܛܝܪ̈ܐ ܥܕܟܝܠ',
      deletePoint: 'ܫܩܘܠ',
      deleteAllPoints: 'ܫܩܘܠ ܟܠ',
      signLabel: 'ܐܬܬܐ',
      satLabel: 'ܠܘܚܝ̈ܐ',
      baroLabel: 'ܒܐܪܘ'
    },
    eo: {
      subtitle: 'Alteco-Monitorilo',
      searching: 'Serĉas GPS...',
      locked: 'GPS ŝlosita',
      error: 'GPS-eraro',
      unit: 'Unuo',
      meters: 'Metroj',
      feet: 'Futoj',
      baseHeight: 'Baza Alteco',
      setBase: 'Agordi Nunan kiel Bazon',
      clearBase: 'Forigi Bazon',
      noBase: 'Neniu baza alteco agordita',
      hasBase: 'Bazo: ',
      theme: 'Temo',
      auto: 'Aŭtomata',
      light: 'Hela',
      dark: 'Malhela',
      history: 'Historio',
      viewHistory: 'Vidi Historion',
      points: 'Konservitaj Punktoj',
      savePoint: '💾 Konservi Nunan Punkton',
      todayHigh: 'Hodiaŭa plej alta:',
      todayLow: 'Hodiaŭa plej malalta:',
      viewPoints: '📍 Vidi Ĉiujn Punktojn',
      about: 'Pri Gova',
      aboutDesc: 'Gova estas malfermkoda ilo por monitori altecon en Esperanto.',
      precisionDesc: 'Precizeco: GPS baziĝas sur WGS84. MSL uzas Geoid-modelon. TERO estas grundo. BARO uzas aerpremon.',
      github: 'GitHub Projekto ↗',
      install: 'Instali Aplikaĵon',
      installBtn: 'Instali Gova',
      installDesc: 'Instalo eblas por pli rapida aliro kaj offline-uzo',
      close: 'Fermi',
      versionDate: 'Marto 2026',
      toastNoGps: 'Neniu GPS-datumo disponebla',
      toastNoLoc: 'Neniu loko-datumo disponebla',
      toastSaved: 'Punkto konservita!',
      toastBaseSet: 'Bazo agordita',
      toastBaseCleared: 'Bazo forigita',
      historyTitle: 'Alteco-Historio',
      min: 'Minimuma',
      max: 'Maksimuma',
      avg: 'Averaĝa',
      range: 'Amplekso',
      noHistory: 'Neniu historio-datumoj ankoraŭ',
      historyDesc: 'Datumoj kolektiĝos aŭtomate dum vi uzas la aplikaĵon',
      exportJson: 'Eksporti JSON',
      exportCsv: 'Eksporti CSV',
      clearHistory: 'Forigi Historion',
      cancel: 'Nuligi',
      back: 'Reen',
      pointsTitle: 'Konservitaj Punktoj',
      noPoints: 'Neniu konservita punkto ankoraŭ',
      deletePoint: 'Forigi',
      deleteAllPoints: 'Forigi Ĉion',
      signLabel: 'SIGN',
      satLabel: 'SAT',
      baroLabel: 'BARO'
    },
    lv: {
      subtitle: 'Augstuma mērītājs',
      searching: 'Meklē GPS...',
      locked: 'GPS atrasts',
      error: 'GPS kļūda',
      unit: 'Vienība',
      meters: 'Metri',
      feet: 'Pēdas',
      baseHeight: 'Bāzes augstums',
      setBase: 'Iestatīt pašreizējo kā bāzi',
      clearBase: 'Dzēst bāzi',
      noBase: 'Bāzes augstums nav iestatīts',
      hasBase: 'Bāze: ',
      theme: 'Tēma',
      auto: 'Automātiska',
      light: 'Gaiša',
      dark: 'Tumša',
      history: 'Vēsture',
      viewHistory: 'Skatīt vēsturi',
      points: 'Saglabātie punkti',
      savePoint: '💾 Saglabāt pašreizējo punktu',
      todayHigh: 'Šodienas augstākais:',
      todayLow: 'Šodienas zemākais:',
      viewPoints: '📍 Skatīt visus punktus',
      about: 'Par Gova',
      aboutDesc: 'Gova ir atvērtā pirmkoda augstuma mērītājs.',
      precisionDesc: 'Precizitāte: GPS pamatā ir WGS84. MSL izmanto Geoīda modeli. TERO ir zemes augstums. BARO izmanto spiedienu.',
      github: 'GitHub Projekts ↗',
      install: 'Instalēt lietotni',
      installBtn: 'Instalēt Gova',
      installDesc: 'Instalējiet ātrākai piekļuvei un bezsaistes lietošanai',
      close: 'Aizvērt',
      versionDate: '2026. gada marts',
      toastNoGps: 'GPS dati nav pieejami',
      toastNoLoc: 'Atrašanās vietas dati nav pieejami',
      toastSaved: 'Punkts saglabāts!',
      toastBaseSet: 'Bāze iestatīta',
      toastBaseCleared: 'Bāze dzēsta',
      historyTitle: 'Augstuma vēsture',
      min: 'Minimālais',
      max: 'Maksimālais',
      avg: 'Vidējais',
      range: 'Amplitūda',
      noHistory: 'Vēstures datu vēl nav',
      historyDesc: 'Dati tiks vākti automātiski, lietojot lietotni',
      exportJson: 'Eksportēt JSON',
      exportCsv: 'Eksportēt CSV',
      clearHistory: 'Dzēst vēsturi',
      cancel: 'Atcelt',
      back: 'Atpakaļ',
      pointsTitle: 'Saglabātie punkti',
      noPoints: 'Vēl nav saglabātu punktu',
      deletePoint: 'Dzēst',
      deleteAllPoints: 'Dzēst visu',
      signLabel: 'SIGN',
      satLabel: 'SAT',
      baroLabel: 'BARO'
    },
    be: {
      subtitle: 'Манітор вышыні',
      searching: 'Пошук GPS...',
      locked: 'GPS знойдзены',
      error: 'Памылка GPS',
      unit: 'Адзінка',
      meters: 'Метры',
      feet: 'Футы',
      baseHeight: 'Базавая вышыня',
      setBase: 'Усталяваць бягучую як базу',
      clearBase: 'Выдаліць базу',
      noBase: 'Базавая вышыня не ўсталяваная',
      hasBase: 'База: ',
      theme: 'Тэма',
      auto: 'Аўтаматычная',
      light: 'Светлая',
      dark: 'Цёмная',
      history: 'Гісторыя',
      viewHistory: 'Глядзець гісторыю',
      points: 'Захаваныя пункты',
      savePoint: '💾 Захаваць бягучы пункт',
      todayHigh: 'Сённяшні максімум:',
      todayLow: 'Сённяшні мінімум:',
      viewPoints: '📍 Глядзець усе пункты',
      about: 'Пра Gova',
      aboutDesc: 'Gova — гэта інструмент з адкрытым зыходным кодам для маніторынгу вышыні.',
      precisionDesc: 'Дакладнасць: GPS на аснове WGS84. MSL выкарыстоўвае мадэль геоіда. TERO — гэта вышыня зямлі. BARO выкарыстоўвае ціск.',
      github: 'GitHub Праект ↗',
      install: 'Усталяваць дадатак',
      installBtn: 'Усталяваць Gova',
      installDesc: 'Усталюйце для хуткага доступу і працы па-за сеткай',
      close: 'Закрыць',
      versionDate: 'Сакавік 2026',
      toastNoGps: 'Дадзеныя GPS недаступныя',
      toastNoLoc: 'Дадзеныя пра месцазнаходжанне недаступныя',
      toastSaved: 'Пункт захаваны!',
      toastBaseSet: 'База ўсталяваная',
      toastBaseCleared: 'База выдаленая',
      historyTitle: 'Гісторыя вышыні',
      min: 'Мінімальная',
      max: 'Максімальная',
      avg: 'Сярэдняя',
      range: 'Дыяпазон',
      noHistory: 'Гісторыі пакуль няма',
      historyDesc: 'Дадзеныя будуць збірацца аўтаматычна пры выкарыстанні дадатку',
      exportJson: 'Экспарт JSON',
      exportCsv: 'Экспарт CSV',
      clearHistory: 'Ачысціць гісторыю',
      cancel: 'Адмена',
      back: 'Назад',
      pointsTitle: 'Захаваныя пункты',
      noPoints: 'Захаваных пунктаў пакуль няма',
      deletePoint: 'Выдаліць',
      deleteAllPoints: 'Выдаліць усё',
      signLabel: 'СІГН',
      satLabel: 'САТ',
      baroLabel: 'БАРО'
    },
    tp: {
      subtitle: 'ilo pi suli sewi',
      searching: 'mi alasa e GPS...',
      locked: 'mi jo e GPS',
      error: 'pakala pi GPS',
      unit: 'kipisi',
      meters: 'mete',
      feet: 'futu',
      baseHeight: 'suli open',
      setBase: 'ni li suli open',
      clearBase: 'weka e suli open',
      noBase: 'suli open li lon ala',
      hasBase: 'suli open: ',
      theme: 'kule',
      auto: 'ona li pali',
      light: 'suno',
      dark: 'pimeja',
      history: 'tenpo pini',
      viewHistory: 'o lukin e tenpo pini',
      points: 'tomo pi lipu sewi',
      savePoint: '💾 o pana e suli ni',
      todayHigh: 'sewi pi tenpo ni:',
      todayLow: 'anpa pi tenpo ni:',
      viewPoints: '📍 o lukin e suli ale',
      about: 'tan Gova',
      aboutDesc: 'Gova li ilo pi suli sewi li ilo pi ken ale.',
      precisionDesc: 'ilo GPS li lukin e sewi. ilo TERO li lukin e ma anpa. ilo BARO li lukin e kon.',
      github: 'lipu GitHub ↗',
      install: 'o pana e ilo ni',
      installBtn: 'o pana e ilo Gova',
      installDesc: 'o pana e ilo ni tawa pali pona lon tenpo ale',
      close: 'o pini',
      versionDate: 'tenpo mun 3 pi suli 2026',
      toastNoGps: 'mi jo ala e GPS',
      toastNoLoc: 'mi jo ala e ma',
      toastSaved: 'suli li lon lipu!',
      toastBaseSet: 'suli open li lon',
      toastBaseCleared: 'suli open li weka',
      historyTitle: 'suli pi tenpo pini',
      min: 'suli anpa',
      max: 'suli sewi',
      avg: 'suli insa',
      range: 'suli ante',
      noHistory: 'suli lon tenpo pini li lon ala',
      historyDesc: 'ilo ni li pana e suli lon tenpo ale',
      exportJson: 'o pana e lipu JSON',
      exportCsv: 'o pana e lipu CSV',
      clearHistory: 'o weka e suli ale',
      cancel: 'o pini ala',
      back: 'o tawa monsi',
      pointsTitle: 'tomo suli',
      noPoints: 'suli li lon ala',
      deletePoint: 'o weka',
      deleteAllPoints: 'o weka e ale',
      signLabel: 'KON',
      satLabel: 'MUN',
      baroLabel: 'KON'
    }
  };

  let currentLang = 'eo';

  function init() {
    const savedLang = localStorage.getItem('gova_lang');
    if (savedLang && STRINGS[savedLang]) {
      currentLang = savedLang;
    } else {
      // Detekti lingvon de la retumilo
      const browserLang = navigator.language.split('-')[0]; // ekz. 'lv-LV' -> 'lv'
      if (STRINGS[browserLang]) {
        currentLang = browserLang;
      } else {
        currentLang = 'eo'; // Defaŭlto
      }
    }
    updateUI();
  }

  function setLang(lang) {
    if (STRINGS[lang]) {
      currentLang = lang;
      localStorage.setItem('gova_lang', lang);
      updateUI();
    }
  }

  function get(key) {
    return STRINGS[currentLang][key] || STRINGS['eo'][key] || key;
  }

  function updateUI() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const text = get(key);
      if (text) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = text;
        } else {
          el.textContent = text;
        }
      }
    });

    // Special cases like aria-labels
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.dataset.i18nAria;
      const text = get(key);
      if (text) el.setAttribute('aria-label', text);
    });
    
    // Update language selector UI
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });

    // Handle RTL (Right-to-Left)
    if (currentLang === 'arc') {
      document.body.dir = 'rtl';
      document.body.classList.add('rtl');
    } else {
      document.body.dir = 'ltr';
      document.body.classList.remove('rtl');
    }
  }

  return {
    init,
    setLang,
    get,
    LANGUAGES
  };
})();
