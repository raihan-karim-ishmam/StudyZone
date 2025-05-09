const mockNotes = [
  {
    id: '0',
    title: 'Klimaatveranderingen in het Westen',
    content: `<h1>Klimaatverandering: Een Globaal Probleem</h1>

<p>Klimaatverandering is een van de grootste uitdagingen waarmee onze planeet wordt geconfronteerd. Het is een <strong>complex probleem</strong> dat invloed heeft op alle aspecten van ons leven.</p>

<h2>Oorzaken van klimaatverandering</h2>

<p>Er zijn verschillende factoren die bijdragen aan klimaatverandering:</p>

<ul>
  <li>Uitstoot van broeikasgassen zoals CO<sub>2</sub></li>
  <li>Ontbossing en verandering in landgebruik</li>
  <li>Industriële processen en energieproductie</li>
  <li>Landbouw en veeteelt</li>
</ul>

<h2>Gevolgen voor Nederland</h2>

<p>Nederland, als laaggelegen land, is bijzonder kwetsbaar voor de gevolgen van klimaatverandering:</p>

<ol>
  <li><em>Zeespiegelstijging</em> bedreigt onze kustgebieden</li>
  <li>Extremer weer, waaronder:
    <ul>
      <li>Hevigere regenval en overstromingen</li>
      <li>Langere periodes van droogte</li>
    </ul>
  </li>
  <li>Veranderingen in biodiversiteit</li>
</ol>

<blockquote>
  "Klimaatverandering is geen toekomstprobleem, maar een realiteit waar we nu al mee te maken hebben." — KNMI
</blockquote>

<h3>Wat kunnen we doen?</h3>

<p>Er zijn verschillende maatregelen die we kunnen nemen om klimaatverandering tegen te gaan:</p>

<ol>
  <li>Verminderen van onze CO<sub>2</sub>-uitstoot</li>
  <li>Overstappen op <a href="#">hernieuwbare energiebronnen</a></li>
  <li>Aanpassen van onze consumptiepatronen</li>
  <li>Investeren in klimaatadaptatie</li>
</ol>

<h3>Wetenschappelijke consensus</h3>

<p>Uit onderzoek blijkt dat de aarde opwarmt met ongeveer <code>0.2°C</code> per decennium als gevolg van menselijke activiteiten. Dit heeft verstrekkende gevolgen voor ecosystemen wereldwijd.</p>

<pre><code>
// Eenvoudig voorbeeld van CO2-berekening
function berekenCO2Uitstoot(energieVerbruik, emissieFactor) {
  return energieVerbruik * emissieFactor;
}
</code></pre>

<p>Het is belangrijk dat we <mark>nu actie ondernemen</mark> om de ergste gevolgen van klimaatverandering te voorkomen.</p>`,
    folder: 'Aardrijkskunde',
    dateCreated: '2025-05-01T08:15:00Z', // This month
    dateLastModified: '2025-05-01T09:00:00Z',
    tags: ['Klimaat', 'Afgerond'],
  },
  {
    id: '1',
    title: 'Broeikasgas',
    content: 'Dit gebeurt doordat broeikasgassen zoals:\n- koolstofdioxide (CO₂)\n- methaan (CH₄)\n- waterdamp (H₂O)\nin de atmosfeer warmte vasthouden die atmosfeer warmte vasthouden.',
    folder: 'Aardrijkskunde',
    dateCreated: '2025-04-25T10:00:00Z', // This week
    dateLastModified: '2025-04-26T11:30:00Z',
    tags: ['Onáfgerond', 'Favoriet', 'Klimaat'],
  },
  {
    id: '2',
    title: 'Differentiëren',
    content: 'De afgeleide of hellingsfunctie (in dit voorbeeld f\'(x)=2x−4) geeft voor elk waarde van \'x\' de helling in het punt (x,f(x)) van de functie f. Voor het bepalen van de afgeleide is het niet nodig om steeds deze limiet op deze manier te bepalen.',
    folder: 'Wiskunde B',
    dateCreated: '2025-04-01T08:15:00Z', // Today
    dateLastModified: '2025-04-01T09:00:00Z',
    tags: ['Onáfgerond', 'Favoriet', 'Calculus'],
  },
  {
    id: '3',
    title: 'Titratie',
    content: 'Berekeningen met titratie-uitkomsten zijn niet altijd even gemakkelijk. Daarom hier de uitwerking van opgave 12 uit hoofdstuk 13, als voorbeeld.\nHier wordt steeds 5 mL NaOH-opl. toegevoegd aan verdund zoutzuur.',
    folder: 'Scheikunde',
    dateCreated: '2025-04-28T08:00:00Z', // This week
    dateLastModified: '2025-04-28T16:45:00Z',
    tags: ['Onáfgerond', 'Favoriet', 'Reacties'],
  },
  {
    id: '4',
    title: 'Past Simple',
    content: 'Wanneer gebruik je de past simple? Eerst gaan we een klein stapje terug.\n- I play tennis. --> dit doe je met regelmaat, dat is een feit.\nMaar wat als je nou bijvoorbeeld...',
    folder: 'Engels',
    dateCreated: '2025-04-29T13:00:00Z', // Today
    dateLastModified: '2025-04-29T13:00:00Z',
    tags: ['Onáfgerond', 'Favoriet', 'Grammatica'],
  },
  { id: '5', title: 'Vulkanen', content: 'Info over vulkanen...', folder: 'Aardrijkskunde', dateCreated: '2025-03-15T09:00:00Z', dateLastModified: '2025-03-16T10:00:00Z', tags: ['Geologie'] }, // Last month
  { id: '6', title: 'Integreren', content: 'Info over integreren...', folder: 'Wiskunde B', dateCreated: '2025-04-16T11:00:00Z', dateLastModified: '2025-04-17T12:00:00Z', tags: ['Calculus'] }, // This month
  { id: '7', title: 'Organische Chemie', content: 'Info over koolstofverbindingen...', folder: 'Scheikunde', dateCreated: '2025-04-27T14:00:00Z', dateLastModified: '2025-04-27T15:00:00Z', tags: ['Organisch'] }, // This week
  { id: '8', title: 'Present Perfect', content: 'Info over present perfect...', folder: 'Engels', dateCreated: '2025-04-29T10:00:00Z', dateLastModified: '2025-04-29T11:00:00Z', tags: ['Grammatica'] }, // Today
  { id: '9', title: 'Klimaat Zones', content: 'Info over klimaat zones...', folder: 'Aardrijkskunde', dateCreated: '2025-04-19T08:30:00Z', dateLastModified: '2025-04-19T09:30:00Z', tags: ['Klimaat'] }, // This month
  { id: '10', title: 'Limieten', content: 'Info over limieten...', folder: 'Wiskunde B', dateCreated: '2025-02-15T15:00:00Z', dateLastModified: '2025-02-15T16:00:00Z', tags: ['Calculus'] }, // Older
  { id: '11', title: 'Ander Onderwerp', content: 'Info over present perfect...', folder: 'Engels', dateCreated: '2025-04-21T10:00:00Z', dateLastModified: '2025-04-21T11:00:00Z', tags: ['Grammatica'] }, // This month
  {
    id: '12',
    title: 'Elektrische stroom',
    content: `<h1>Elektrische Stroom: Fundamentele Concepten</h1>

<p>Elektrische stroom is een <strong>gerichte beweging van elektrisch geladen deeltjes</strong> (meestal elektronen) door een geleider, zoals een metalen draad. De basiseenheid van elektrische stroom is de <em>ampère (A)</em>.</p>

<h2>Basisprincipes van Elektrische Stroom</h2>

<p>Elektrische stroom wordt veroorzaakt door een potentiaalverschil (spanning) tussen twee punten. De relatie tussen stroom, spanning en weerstand wordt beschreven door de <strong>Wet van Ohm</strong>:</p>

<div class="formula">
  <p>I = V / R</p>
</div>

<p>Waarbij:</p>
<ul>
  <li>I = stroomsterkte in ampère (A)</li>
  <li>V = spanning in volt (V)</li>
  <li>R = weerstand in ohm (Ω)</li>
</ul>

<h2>Soorten Elektrische Stroom</h2>

<ol>
  <li><strong>Gelijkstroom (DC)</strong>: Stroom die in één richting vloeit
    <ul>
      <li>Voorbeeld: Batterijen, zonnecellen</li>
      <li>Symbool: <code>⎓</code></li>
    </ul>
  </li>
  <li><strong>Wisselstroom (AC)</strong>: Stroom die periodiek van richting verandert
    <ul>
      <li>Voorbeeld: Elektriciteitsnet (in Nederland: 230V, 50Hz)</li>
      <li>Symbool: <code>∿</code></li>
    </ul>
  </li>
</ol>

<h3>Formules en Berekeningen</h3>

<p>Enkele belangrijke formules voor elektrische berekeningen:</p>

<pre><code>
// Wet van Ohm
I = V / R

// Elektrisch vermogen
P = V * I

// Elektrische energie
E = P * t
</code></pre>

<blockquote>
  "Elektriciteit is eigenlijk niets anders dan elektronen die door een draad bewegen, zoals water door een tuinslang." — Richard Feynman
</blockquote>

<h3>Schakelingen</h3>

<p>Er zijn twee hoofdtypen elektrische schakelingen:</p>

<table>
  <tr>
    <th>Type</th>
    <th>Kenmerken</th>
  </tr>
  <tr>
    <td><strong>Serieschakeling</strong></td>
    <td>
      - Dezelfde stroom door alle componenten<br>
      - Totale spanning is som van spanningen<br>
      - R<sub>totaal</sub> = R<sub>1</sub> + R<sub>2</sub> + ...
    </td>
  </tr>
  <tr>
    <td><strong>Parallelschakeling</strong></td>
    <td>
      - Dezelfde spanning over alle componenten<br>
      - Totale stroom is som van stromen<br>
      - 1/R<sub>totaal</sub> = 1/R<sub>1</sub> + 1/R<sub>2</sub> + ...
    </td>
  </tr>
</table>

<p>Een van de grootste doorbraken in elektriciteit was de ontwikkeling van <mark>halfgeleiders</mark>, die de basis vormen van moderne elektronica en computers.</p>`,
    folder: 'Natuurkunde',
    dateCreated: '2025-05-01T08:30:00Z', // Today
    dateLastModified: '2025-05-01T09:30:00Z',
    tags: ['Elektriciteit', 'Afgerond', 'Favoriet', 'Natuurkunde'],
  },
  { id: '13', title: 'Cellen', content: 'Info over cellen...', folder: 'Biologie', dateCreated: '2025-03-15T15:00:00Z', dateLastModified: '2025-03-15T16:00:00Z', tags: ['Biologie'] }, // Last month
  { id: '14', title: 'Algemeen 1', content: 'algemeen content 1', folder: 'Algemeen', dateCreated: '2025-04-21T10:00:00Z', dateLastModified: '2025-04-21T11:00:00Z', tags: ['Onafgerond'] }, // This month
  { id: '15', title: 'Algemeen 2', content: 'algemeen content 2', folder: 'Algemeen', dateCreated: '2025-04-19T08:30:00Z', dateLastModified: '2025-04-19T09:30:00Z', tags: ['Afgerond'] }, // This month
  { id: '16', title: 'Algemeen 3', content: 'algemeen content 3', folder: 'Algemeen', dateCreated: '2025-04-15T15:00:00Z', dateLastModified: '2025-04-15T16:00:00Z', tags: ['Favoriet'] }, // This month
  { id: '17', title: 'Planten', content: 'Planten content', folder: 'Biologie', dateCreated: '2025-04-25T15:00:00Z', dateLastModified: '2025-04-25T16:00:00Z', tags: ['Favoriet'] }, // This week
  { id: '18', title: 'Ionen', content: 'Ionen content', folder: 'Scheikunde', dateCreated: '2025-04-01T15:00:00Z', dateLastModified: '2025-04-01T16:00:00Z', tags: ['Favoriet', 'Scheikunde'] }, // This month
  { 
    id: '19', 
    title: 'Grammar', 
    content: 'Past Continuous is een grammatica die wordt gebruikt om een actie te beschrijven die in het verleden begon en nog niet is afgerond.', 
    folder: 'Engels', 
    dateCreated: '2025-04-29T14:47:00Z', // Today
    dateLastModified: '2025-04-29T14:47:00Z', 
    tags: ['Literatuur', 'Onáfgerond'] 
  },
];

export default mockNotes;