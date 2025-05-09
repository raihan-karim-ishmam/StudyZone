// Mock chat data in OpenAI API format
const mockChatMessages = {
  // Chats are organized by subject and chat ID
  "Algemeen": {
    "alg-1": [
      {
        role: "system",
        content: "You are StudyZone AI, a helpful assistant for students."
      },
      {
        role: "user", 
        content: "Wat is het verschil tussen fotosynthese en cellulaire ademhaling?"
      },
      {
        role: "assistant",
        content: "Fotosynthese en cellulaire ademhaling zijn beide essentiële processen voor het leven, maar ze zijn elkaars tegengesteld:\n\n**Fotosynthese:**\n- Gebeurt in planten, algen en sommige bacteriën\n- Zet koolstofdioxide (CO₂) en water (H₂O) om in glucose en zuurstof (O₂)\n- Gebruikt lichtenergie van de zon\n- Formule: 6CO₂ + 6H₂O + lichtenergie → C₆H₁₂O₆ + 6O₂\n- Slaat energie op in chemische bindingen\n\n**Cellulaire ademhaling:**\n- Gebeurt in alle levende organismen, inclusief planten\n- Zet glucose en zuurstof (O₂) om in koolstofdioxide (CO₂), water (H₂O) en energie (ATP)\n- Verbruikt opgeslagen energie\n- Formule: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energie (ATP)\n- Haalt energie uit chemische bindingen"
      }
    ]
  },
  "Scheikunde": {
    "chem-1": [
      {
        role: "system",
        content: "You are StudyZone AI, a helpful assistant for chemistry students."
      },
      {
        role: "user",
        content: "Wat is het verschil tussen een zuur en een base?"
      },
      {
        role: "assistant",
        content: "**Zuren en basen** verschillen in hun chemische eigenschappen:\n\n**Zuren:**\n- Doneren H⁺ ionen (protonen) in een oplossing\n- Hebben een pH lager dan 7\n- Smaken zuur (zoals citroenzuur in citroen)\n- Reageren met metalen om waterstofgas te vormen\n- Voorbeelden: zoutzuur (HCl), zwavelzuur (H₂SO₄), azijnzuur (CH₃COOH)\n\n**Basen:**\n- Accepteren H⁺ ionen of doneren OH⁻ ionen in een oplossing\n- Hebben een pH hoger dan 7\n- Voelen zeepachtig aan\n- Voorbeelden: natriumhydroxide (NaOH), ammoniak (NH₃)\n\nWanneer een zuur en een base met elkaar reageren, vindt er een neutralisatiereactie plaats waarbij water en een zout worden gevormd."
      },
      {
        role: "user",
        content: "Wat is de pH-schaal?"
      },
      {
        role: "assistant",
        content: "De **pH-schaal** is een maat voor de zuurgraad of alkaliteit van een oplossing:\n\n- Loopt van 0 tot 14\n- pH = -log[H⁺], waarbij [H⁺] de concentratie waterstofionen is in mol/L\n- pH < 7: zuur (hoe lager, hoe zuurder)\n- pH = 7: neutraal (zoals zuiver water)\n- pH > 7: basisch/alkalisch (hoe hoger, hoe meer basisch)\n\nElke stap op de pH-schaal vertegenwoordigt een 10-voudige verandering in de concentratie H⁺-ionen. Bijvoorbeeld, een oplossing met pH 4 heeft 10 keer meer H⁺-ionen dan een oplossing met pH 5, en 100 keer meer dan een oplossing met pH 6."
      }
    ],
    "chem-2": [
      {
        role: "system",
        content: "You are StudyZone AI, a helpful assistant for chemistry students."
      },
      {
        role: "user",
        content: "Wat zijn de belangrijkste metalen in de scheikunde?"
      },
      {
        role: "assistant",
        content: "In de scheikunde zijn er verschillende belangrijke metalen, elk met unieke eigenschappen en toepassingen:\n\n**Alkali metalen (Groep 1):**\n- Lithium (Li), Natrium (Na), Kalium (K)\n- Zeer reactief, komen niet in vrije vorm in de natuur voor\n- Reageren heftig met water\n\n**Aardalkalimetalen (Groep 2):**\n- Magnesium (Mg), Calcium (Ca)\n- Minder reactief dan alkalimetalen, maar nog steeds actief\n\n**Overgangsmetalen:**\n- IJzer (Fe): basis voor staal, belangrijk in hemoglobine\n- Koper (Cu): uitstekende elektrische geleider\n- Zilver (Ag): hoogste elektrische geleidbaarheid\n- Goud (Au): zeer inert, gebruikt in elektronica\n- Zink (Zn): gebruikt in batterijen en galvanisatie\n\n**Andere belangrijke metalen:**\n- Aluminium (Al): licht en corrosiebestendig\n- Kwik (Hg): vloeibaar bij kamertemperatuur\n- Lood (Pb): hoge dichtheid, gebruikt voor bescherming tegen straling"
      }
    ]
  },
  "Wiskunde B": {
    "math-1": [
      {
        role: "system",
        content: "You are StudyZone AI, a helpful assistant for mathematics students."
      },
      {
        role: "user",
        content: "Hoe los ik een kwadratische vergelijking op?"
      },
      {
        role: "assistant",
        content: "Je kunt een kwadratische vergelijking (ax² + bx + c = 0) op verschillende manieren oplossen:\n\n**1. Discriminant methode (abc-formule):**\n- Gebruik de formule: x = (-b ± √(b² - 4ac)) / 2a\n- De discriminant (D = b² - 4ac) bepaalt het aantal oplossingen:\n  - Als D > 0: twee verschillende reële oplossingen\n  - Als D = 0: één reële oplossing (dubbele wortel)\n  - Als D < 0: twee verschillende complexe oplossingen\n\n**2. Ontbinden in factoren:**\n- Herschrijf ax² + bx + c = 0 als (x - r)(x - s) = 0, waarbij r en s de oplossingen zijn\n- Dan is x = r of x = s\n\n**3. Kwadraatafsplitsen:**\n- Herschrijf ax² + bx + c in de vorm a(x - p)² + q\n- Als a(x - p)² + q = 0, dan is (x - p)² = -q/a\n- Dus x = p ± √(-q/a)\n\nVoorbeeld: los op 2x² - 4x - 6 = 0\nMet de abc-formule: a=2, b=-4, c=-6\nDiscriminant: D = (-4)² - 4(2)(-6) = 16 + 48 = 64\nx = (4 ± √64) / 4 = (4 ± 8) / 4\nx = 3 of x = -1"
      }
    ]
  },
  "Biologie": {
    "bio-1": [
      {
        role: "system",
        content: "You are StudyZone AI, a helpful assistant for biology students."
      },
      {
        role: "user",
        content: "Wat zijn de functies van DNA?"
      },
      {
        role: "assistant",
        content: "**DNA (Desoxyribonucleïnezuur)** heeft verschillende essentiële functies in levende organismen:\n\n**1. Genetische informatie opslag**\n- Bevat de complete genetische code (genoom) van een organisme\n- Slaat instructies op voor alle cellulaire activiteiten\n\n**2. Replicatie**\n- Kan zichzelf kopiëren tijdens celdelingen\n- Zorgt voor het doorgeven van genetische informatie aan dochtercellen\n\n**3. Eiwitsynthese**\n- Codeert voor de productie van eiwitten via transcriptie (DNA naar RNA) en translatie (RNA naar eiwit)\n- Bepaalt de aminozuurvolgorde in eiwitten\n\n**4. Genetische variatie**\n- Maakt genetische diversiteit mogelijk door mutatie en recombinatie\n- Stelt soorten in staat zich aan te passen aan veranderende omgevingen\n\n**5. Cellulaire differentiatie**\n- Reguleert welke genen tot expressie komen in verschillende celtypen\n- Maakt specialisatie van cellen mogelijk\n\n**6. Evolutie**\n- Maakt erfelijke veranderingen en natuurlijke selectie mogelijk\n- Vormt de basis voor de evolutionaire geschiedenis van alle leven"
      }
    ]
  }
};

export default mockChatMessages; 