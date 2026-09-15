/**
 * Rechtstexte der App. Inhaber-/Kontaktdaten zentral hier pflegen.
 *
 * Hinweis: Die Texte sind eine sorgfältig erstellte Vorlage nach DSGVO, DDG und
 * gängiger Praxis – sie ersetzen keine anwaltliche Prüfung. Vor dem Store-Release
 * bitte einmal von einer Anwältin / einem Anwalt oder einem Datenschutz-Dienst
 * (z. B. eRecht24, IT-Recht Kanzlei) gegenlesen lassen.
 */

export const OPERATOR = {
  name: 'KÖRPER.KOMPASS',
  owners: 'Sebastian Walker und Alina Walker',
  legalForm: 'Inhaber: Sebastian Walker und Alina Walker (GbR)',
  street: 'Robert-Bosch-Str. 18',
  city: '72654 Neckartenzlingen',
  country: 'Deutschland',
  email: 'hallo@dein-körperkompass.de',
  /** ASCII-Schreibweise der IDN-Domain, für mailto:-Links */
  emailAscii: 'hallo@xn--dein-krperkompass-4zb.de',
  phone: '0160 92076311',
  phoneIntl: '+4916092076311',
  website: 'https://dein-körperkompass.de',
} as const;

export const LEGAL_VERSION = '2026-09-15';

export interface LegalSection {
  title: string;
  paragraphs: string[];
}

export interface LegalDocument {
  id: 'impressum' | 'datenschutz' | 'nutzung' | 'bildnachweise';
  title: string;
  intro?: string;
  sections: LegalSection[];
}

export const IMPRESSUM: LegalDocument = {
  id: 'impressum',
  title: 'Impressum',
  intro: 'Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz) und § 18 Abs. 2 MStV.',
  sections: [
    {
      title: 'Anbieter',
      paragraphs: [
        `${OPERATOR.name}\n${OPERATOR.legalForm}\n${OPERATOR.street}\n${OPERATOR.city}\n${OPERATOR.country}`,
      ],
    },
    {
      title: 'Kontakt',
      paragraphs: [`Telefon: ${OPERATOR.phone}\nE-Mail: ${OPERATOR.email}`],
    },
    {
      title: 'Verantwortlich für den Inhalt',
      paragraphs: [`${OPERATOR.owners}, Anschrift wie oben.`],
    },
    {
      title: 'Umsatzsteuer',
      paragraphs: ['Umsatzsteuer-Identifikationsnummer: wird ergänzt, sobald vorhanden. Bis dahin gilt ggf. die Kleinunternehmerregelung nach § 19 UStG.'],
    },
    {
      title: 'Streitbeilegung',
      paragraphs: [
        'Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.',
      ],
    },
    {
      title: 'Haftung für Inhalte',
      paragraphs: [
        'Die Inhalte dieser App wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte – insbesondere der berechneten Nährwertangaben – können wir jedoch keine Gewähr übernehmen.',
        'Rezepte, Nährwertangaben und Hinweise in dieser App dienen ausschließlich der allgemeinen Information und Inspiration. Sie stellen keine medizinische, ernährungstherapeutische oder psychotherapeutische Beratung dar und ersetzen diese nicht.',
      ],
    },
    {
      title: 'Quellen',
      paragraphs: [
        'Nährwertdaten: Bundeslebensmittelschlüssel (BLS) 4.0, Max Rubner-Institut, Bundesforschungsinstitut für Ernährung und Lebensmittel, Karlsruhe. Lizenz CC BY 4.0. DOI 10.25826/Data20251217-134202-0.',
        'Rezeptfotos: siehe Bildnachweise. Die Fotos stammen von Wikimedia Commons und stehen unter freien Lizenzen (Creative Commons bzw. gemeinfrei); Urheber und Lizenz sind jeweils angegeben.',
      ],
    },
  ],
};

export const DATENSCHUTZ: LegalDocument = {
  id: 'datenschutz',
  title: 'Datenschutzerklärung',
  intro: `Stand: ${LEGAL_VERSION}. Wir nehmen den Schutz deiner Daten ernst. Diese Erklärung informiert dich nach Art. 13 und 14 DSGVO darüber, welche Daten die App KÖRPER.KOMPASS verarbeitet, wozu und welche Rechte du hast.`,
  sections: [
    {
      title: '1. Verantwortliche Stelle',
      paragraphs: [`${OPERATOR.name}\n${OPERATOR.legalForm}\n${OPERATOR.street}\n${OPERATOR.city}\nE-Mail: ${OPERATOR.email}\nTelefon: ${OPERATOR.phone}`],
    },
    {
      title: '2. Grundsatz: so wenig Daten wie möglich',
      paragraphs: [
        'Die App fragt bewusst kein Gewicht, keine Körpergröße, keinen BMI, kein Wunschgewicht und keine Kalorienziele ab und verarbeitet keine Gesundheitsdaten im Sinne von Art. 9 DSGVO. Angaben zu Allergien und Unverträglichkeiten machst du freiwillig; sie dienen ausschließlich dazu, passende Rezepte auszublenden, und werden nicht ausgewertet.',
        'Ohne Konto bleiben alle Daten ausschließlich auf deinem Gerät. Ein Konto ist optional und nur nötig, wenn du deine Daten auf mehreren Geräten synchronisieren möchtest.',
      ],
    },
    {
      title: '3. Welche Daten verarbeitet werden',
      paragraphs: [
        'Profil und Präferenzen: Ernährungsweise (z. B. vegetarisch), Allergien/Unverträglichkeiten, Kochzeit, Portionen, Anzeigeeinstellungen.',
        'Nutzungsdaten in der App: Favoriten, Wisch-Entscheidungen (mag ich / weiter), angesehene Rezepte, Wochenplan, Einkaufsliste, Vorratsliste.',
        'Bei Konto: E-Mail-Adresse (für den Anmeldelink), Zeitpunkt der Anmeldung sowie die oben genannten Daten, gespiegelt auf dem Server.',
        'Technische Daten beim Laden von Inhalten aus dem Internet (z. B. Rezeptfotos): IP-Adresse, Zeitpunkt, Gerätetyp/Browser – diese werden vom jeweiligen Server technisch benötigt (siehe Abschnitt 6).',
      ],
    },
    {
      title: '4. Zwecke und Rechtsgrundlagen',
      paragraphs: [
        'Bereitstellung der App-Funktionen (Rezeptvorschläge, Wochenplan, Einkaufsliste, Nährwertberechnung): Art. 6 Abs. 1 lit. b DSGVO (Vertrag/Nutzungsverhältnis).',
        'Optionales Konto und Synchronisation: Art. 6 Abs. 1 lit. b DSGVO; die Angabe von Allergien erfolgt freiwillig auf Grundlage deiner Einwilligung, Art. 6 Abs. 1 lit. a DSGVO.',
        'Anonyme Nutzungsstatistik (welche Funktionen genutzt werden, ohne Personenbezug): nur mit deiner Einwilligung, Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG. Du kannst sie in den Einstellungen jederzeit ein- oder ausschalten.',
        'Technisch notwendige Speicherung auf dem Gerät (lokale Datenbank): § 25 Abs. 2 Nr. 2 TDDDG – dafür ist keine Einwilligung erforderlich.',
      ],
    },
    {
      title: '5. Speicherung auf dem Gerät',
      paragraphs: [
        'Deine Daten werden lokal auf deinem Gerät gespeichert (App-Speicher bzw. Browser-Speicher in der Web-Version). Über „Profil → Alle meine Daten löschen“ kannst du sie jederzeit vollständig entfernen. Beim Deinstallieren der App werden sie ebenfalls gelöscht.',
      ],
    },
    {
      title: '6. Empfänger und Auftragsverarbeiter',
      paragraphs: [
        'Server/Datenbank (nur bei Konto): Supabase Inc. – wir nutzen einen Server-Standort in der EU (Frankfurt). Mit Supabase besteht ein Auftragsverarbeitungsvertrag nach Art. 28 DSGVO.',
        'Rezeptfotos: Die Fotos werden beim Anzeigen von den Servern der Wikimedia Foundation Inc. (USA) geladen. Dabei wird technisch deine IP-Adresse übertragen. Die Wikimedia Foundation verarbeitet diese Daten nach ihrer Datenschutzrichtlinie; eine Übermittlung in die USA erfolgt auf Grundlage von Art. 49 Abs. 1 lit. b DSGVO. Wir planen, die Fotos künftig auf einem Server in der EU zu speichern.',
        'App-Stores (Apple App Store, Google Play) verarbeiten beim Download und bei Updates Daten in eigener Verantwortung.',
        'Eine Weitergabe an Dritte zu Werbezwecken findet nicht statt. Es werden keine Werbe- oder Tracking-Dienste Dritter eingesetzt.',
      ],
    },
    {
      title: '7. Speicherdauer',
      paragraphs: [
        'Lokale Daten: bis du sie löschst oder die App deinstallierst. Kontodaten: bis zur Löschung des Kontos, die du jederzeit in der App auslösen kannst („Profil → Konto löschen“); danach werden alle zugehörigen Daten unverzüglich und vollständig gelöscht. Anonyme Statistiken enthalten keinen Personenbezug und werden nach spätestens 24 Monaten aggregiert.',
      ],
    },
    {
      title: '8. Deine Rechte',
      paragraphs: [
        'Du hast das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21 DSGVO). Eine erteilte Einwilligung kannst du jederzeit mit Wirkung für die Zukunft widerrufen.',
        `Wende dich dafür einfach an ${OPERATOR.email}. Außerdem hast du das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren – zuständig ist für uns der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Baden-Württemberg (www.baden-wuerttemberg.datenschutz.de).`,
      ],
    },
    {
      title: '9. Kinder',
      paragraphs: ['Die App richtet sich an Erwachsene. Wir erheben wissentlich keine Daten von Kindern unter 16 Jahren.'],
    },
    {
      title: '10. Änderungen',
      paragraphs: ['Wir passen diese Erklärung an, wenn sich die App oder die Rechtslage ändert. Die jeweils aktuelle Fassung findest du in der App unter Profil → Datenschutz.'],
    },
  ],
};

export const NUTZUNG: LegalDocument = {
  id: 'nutzung',
  title: 'Nutzungshinweise',
  intro: 'Bitte kurz lesen – damit du weißt, was die App kann und was sie bewusst nicht ist.',
  sections: [
    {
      title: 'Keine medizinische Beratung',
      paragraphs: [
        'KÖRPER.KOMPASS ist keine Diät-App und kein Medizinprodukt. Rezepte, Nährwerte und Hinweise sind allgemeine Informationen und ersetzen keine ärztliche, ernährungstherapeutische oder psychotherapeutische Beratung. Bei gesundheitlichen Fragen, Schwangerschaft, Erkrankungen oder einer Essstörung wende dich bitte an Fachpersonen.',
        'Wenn es dir gerade nicht gut geht: Die Telefonseelsorge ist rund um die Uhr kostenlos erreichbar unter 0800 111 0 111 oder 0800 111 0 222. Beratung zu Essstörungen bietet die BZgA unter 0221 892031.',
      ],
    },
    {
      title: 'Nährwertangaben',
      paragraphs: [
        'Nährwerte werden aus den Zutatenmengen mit dem Bundeslebensmittelschlüssel (BLS 4.0) berechnet. Es sind Näherungswerte – sie hängen von Produkten, Reifegrad und Zubereitung ab und können vom tatsächlichen Gericht abweichen. Fehlen Daten zu einer Zutat, zeigt die App das offen an, statt Werte zu schätzen.',
        'Die App setzt bewusst keine Ziele und bewertet dein Essen nicht. Zahlen sind eine Orientierung, kein Maßstab.',
      ],
    },
    {
      title: 'Allergien und Unverträglichkeiten',
      paragraphs: [
        'Die Allergen-Filter helfen beim Vorsortieren, ersetzen aber nicht den Blick auf die Zutatenliste und die Verpackung der verwendeten Produkte. Spuren und Kreuzkontaminationen können nicht berücksichtigt werden. Bei schweren Allergien prüfe bitte jede Zutat selbst.',
      ],
    },
    {
      title: 'Inhalte und Urheberrecht',
      paragraphs: [
        'Rezepttexte und App-Design sind urheberrechtlich geschützt. Für den privaten Gebrauch (kochen, Einkaufsliste, Teilen mit Familie und Freunden) darfst du sie frei nutzen. Rezeptfotos stehen unter den jeweils angegebenen freien Lizenzen (siehe Bildnachweise).',
      ],
    },
    {
      title: 'Verfügbarkeit',
      paragraphs: ['Wir bemühen uns um einen zuverlässigen Betrieb, können aber keine ständige Verfügbarkeit garantieren. Funktionen können sich mit Updates ändern.'],
    },
  ],
};
