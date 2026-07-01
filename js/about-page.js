/**
 * about-page.js — Pri-paĝo lingvo-bazita enhavo (eltirita el about.html por strikta CSP)
 */

(function () {
  var LANGS = { eo: 'Esperanto', en: 'English', lv: 'Latviešu', be: 'Беларуская', tp: 'Toki Pona' };

  var T = {
    en: {
      htmlLang: 'en',
      tagline: 'The cleanest GPS altimeter ever made.',
      lede: 'Gova shows your altitude — by GPS, barometer, geoid-corrected sea level, and real terrain — and asks for nothing in return. No ads. No accounts. No tracking. No servers. Just your height, done right.',
      features: [
        ['🚫', 'No ads. Ever.', 'Not a single banner, popup, or “upgrade to pro”. The whole app is free, forever.'],
        ['🔒', 'Nothing leaves your device', 'No servers, no accounts, no analytics by default. Your location is never stored or sent — unless you opt in to the terrain lookup.'],
        ['🎯', 'Genuinely accurate', 'Real WGS84 GPS, EGM96 geoid correction to true mean sea level, barometric pressure, and SRTM terrain — not one raw number dressed up.'],
        ['📡', 'Works offline', 'A full altimeter with no connection. Install it as an app and it just works on a mountain with no signal.'],
        ['🌍', 'Speaks your language', 'Esperanto, English, Latviešu, Беларуская, and Toki Pona.'],
        ['💛', 'Open source', 'Every line is on GitHub. Read it, audit it, improve it.']
      ],
      closing: 'Built by one person who just wanted an honest altimeter. That’s it.',
      cta: 'Open Gova',
      privacy: 'Privacy'
    },
    eo: {
      htmlLang: 'eo',
      tagline: 'La plej pura GPS-altimetro iam ajn farita.',
      lede: 'Gova montras vian altecon — per GPS, barometro, geoide-korektita marnivelo, kaj vera tereno — kaj petas nenion interŝanĝe. Neniuj reklamoj. Neniuj kontoj. Neniu spurado. Neniuj serviloj. Nur via alteco, ĝuste farita.',
      features: [
        ['🚫', 'Neniam reklamoj', 'Eĉ ne unu standardo, ŝprucfenestro, aŭ “pliboniĝu al pro”. La tuta aplikaĵo estas senpaga, por ĉiam.'],
        ['🔒', 'Nenio forlasas vian aparaton', 'Neniuj serviloj, neniuj kontoj, neniu analizo defaŭlte. Via loko neniam estas konservata aŭ sendata — krom se vi elektas la terenan serĉon.'],
        ['🎯', 'Vere preciza', 'Vera WGS84 GPS, EGM96 geoida korekto al vera marnivelo, barometra premo, kaj SRTM-tereno — ne nur kruda numero alivestita.'],
        ['📡', 'Funkcias senrete', 'Plena altimetro sen konekto. Instalu ĝin kiel aplikaĵon kaj ĝi simple funkcias sur monto sen signalo.'],
        ['🌍', 'Parolas vian lingvon', 'Esperanto, la angla, la latva, la belarusa, kaj Toki Pona.'],
        ['💛', 'Malferma fonto', 'Ĉiu linio estas en GitHub. Legu ĝin, kontrolu ĝin, plibonigu ĝin.']
      ],
      closing: 'Konstruita de unu persono kiu nur volis honestan altimetron. Jen ĉio.',
      cta: 'Malfermi Gova',
      privacy: 'Privateco'
    },
    lv: {
      htmlLang: 'lv',
      tagline: 'Tīrākais GPS altimetrs, kāds jebkad radīts.',
      lede: 'Gova rāda tavu augstumu — ar GPS, barometru, ģeoīda koriģētu jūras līmeni un reālu reljefu — un neprasa neko pretī. Nekādu reklāmu. Nekādu kontu. Nekādas izsekošanas. Nekādu serveru. Tikai tavs augstums, izdarīts pareizi.',
      features: [
        ['🚫', 'Nekad nav reklāmu', 'Neviena reklāmkaroga, uznirstošā loga vai “jaunini uz pro”. Visa lietotne ir bezmaksas, mūžīgi.'],
        ['🔒', 'Nekas neatstāj tavu ierīci', 'Nav serveru, nav kontu, pēc noklusējuma nav analītikas. Tava atrašanās vieta nekad netiek saglabāta vai nosūtīta — ja vien tu neizvēlies reljefa meklēšanu.'],
        ['🎯', 'Patiesi precīzs', 'Īsts WGS84 GPS, EGM96 ģeoīda korekcija līdz patiesam jūras līmenim, barometriskais spiediens un SRTM reljefs.'],
        ['📡', 'Darbojas bezsaistē', 'Pilns altimetrs bez savienojuma. Instalē to kā lietotni, un tas vienkārši darbojas kalnā bez signāla.'],
        ['🌍', 'Runā tavā valodā', 'Esperanto, angļu, latviešu, baltkrievu un Toki Pona.'],
        ['💛', 'Atvērtā koda', 'Katra rindiņa ir GitHub. Lasi to, pārbaudi, uzlabo.']
      ],
      closing: 'Radīts vienam cilvēkam, kurš vienkārši gribēja godīgu altimetru. Tas arī viss.',
      cta: 'Atvērt Gova',
      privacy: 'Privātums'
    },
    be: {
      htmlLang: 'be',
      tagline: 'Найчысты GPS-вышынямер, які калі-небудзь быў зроблены.',
      lede: 'Gova паказвае вашу вышыню — праз GPS, барометр, скарэкціраваны геоідам марскі ўзровень і рэальны рэльеф — і нічога не просіць узамен. Ніякай рэкламы. Ніякіх акаўнтаў. Ніякага сачэння. Ніякіх сервераў. Толькі ваша вышыня, зробленая правільна.',
      features: [
        ['🚫', 'Ніколі ніякай рэкламы', 'Ні аднаго банера, усплывальнага акна ці “перайдзіце на pro”. Уся праграма бясплатная, назаўжды.'],
        ['🔒', 'Нічога не пакідае вашу прыладу', 'Ніякіх сервераў, ніякіх акаўнтаў, без аналітыкі па змаўчанні. Ваша месцазнаходжанне ніколі не захоўваецца і не адпраўляецца — калі вы самі не ўключыце пошук рэльефу.'],
        ['🎯', 'Сапраўды дакладны', 'Сапраўдны WGS84 GPS, карэкцыя геоіда EGM96 да сапраўднага марскога ўзроўню, барметрычны ціск і рэльеф SRTM.'],
        ['📡', 'Працуе без сеткі', 'Поўны вышынямер без злучэння. Усталюйце як праграму — і яна проста працуе ў гарах без сігналу.'],
        ['🌍', 'Размаўляе на вашай мове', 'Эсперанта, англійская, латышская, беларуская і Toki Pona.'],
        ['💛', 'Адкрыты зыходны код', 'Кожны радок на GitHub. Чытайце, правярайце, паляпшайце.']
      ],
      closing: 'Зроблена адным чалавекам, які проста хацеў сумленны вышынямер. Вось і ўсё.',
      cta: 'Адкрыць Gova',
      privacy: 'Прыватнасць'
    },
    tp: {
      htmlLang: 'tok',
      tagline: 'ilo Gova li ilo pi sona sewi. ona li pona mute. ona li jo ala e esun.',
      lede: 'ilo Gova li toki e sewi sina — kepeken ilo sewi (GPS), kepeken kon (barometer), kepeken telo suli, kepeken ma. ona li wile ala e mani sina. esun ala li lon. jan ala li lukin e sina. sewi sina taso li lon.',
      features: [
        ['🚫', 'esun ala', 'sitelen esun li lon ala. ilo ale li pona tawa sina kepeken mani ala, tenpo ale.'],
        ['🔒', 'sina taso li jo e sona sina', 'ilo ante li jo ala e sona sina. jan ala li lukin. ma sina li tawa ala — sina wile la, ona li ken tawa taso tan wile sina.'],
        ['🎯', 'sona sewi li lon', 'ona li kepeken nasin mute: GPS WGS84, nasin EGM96 tawa telo suli lon, kon, ma SRTM. ona li toki e lon, ala e powe.'],
        ['📡', 'ona li pali kepeken ala linluwi', 'ilo sewi ale li pali lon tenpo pi linluwi ala. sina ken kepeken ona lon nena suli pi kon ala.'],
        ['🌍', 'ona li toki e toki sina', 'toki Epelanto, toki Inli, toki Lasi, toki Pelalusi, toki pona.'],
        ['💛', 'lipu open', 'sitelen ale li lon GitHub. jan ale li ken lukin, li ken pona e ona.']
      ],
      closing: 'jan wan li pali e ni. ona li wile taso e ilo pi sona sewi pona.',
      cta: 'open e ilo Gova',
      privacy: 'sona len'
    }
  };

  function pickLang() {
    var saved = (localStorage.getItem('gova_lang') || '').toLowerCase();
    if (T[saved]) return saved;
    var nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
    if (T[nav]) return nav;
    return 'en';
  }

  function render(lang) {
    var t = T[lang] || T.en;
    document.documentElement.lang = t.htmlLang;
    document.getElementById('tagline').textContent = t.tagline;
    document.getElementById('lede').textContent = t.lede;
    document.getElementById('closing').textContent = t.closing;
    document.getElementById('cta').textContent = t.cta;
    document.getElementById('f-privacy').textContent = t.privacy;

    var grid = document.getElementById('grid');
    grid.innerHTML = '';
    t.features.forEach(function (f) {
      var c = document.createElement('div');
      c.className = 'card';
      var ico = document.createElement('div'); ico.className = 'ico'; ico.textContent = f[0];
      var h = document.createElement('h3'); h.textContent = f[1];
      var p = document.createElement('p'); p.textContent = f[2];
      c.appendChild(ico); c.appendChild(h); c.appendChild(p);
      grid.appendChild(c);
    });

    document.querySelectorAll('.langbar button').forEach(function (b) {
      b.classList.toggle('active', b.dataset.lang === lang);
    });
  }

  var bar = document.getElementById('langbar');
  Object.keys(LANGS).forEach(function (code) {
    var b = document.createElement('button');
    b.dataset.lang = code;
    b.textContent = LANGS[code];
    b.addEventListener('click', function () {
      localStorage.setItem('gova_lang', code); // sync with the app
      render(code);
    });
    bar.appendChild(b);
  });

  render(pickLang());
})();
