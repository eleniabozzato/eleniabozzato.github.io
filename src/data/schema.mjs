// Structured data (schema.org JSON-LD) shared by the page wrapper and the blog templates.
// One Person and one ProfessionalService, referenced by @id from every other block, so search
// engines can tie the pages, the articles and the business to the same entity.
// The phone number stays out on purpose: the site only shows it obfuscated (data-wa).
import { SITE_URL } from './pages.mjs';

export const PERSON_ID = `${SITE_URL}/#elenia`;
export const BUSINESS_ID = `${SITE_URL}/#business`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const OG_IMAGE = '/assets/img/og-elenia.jpg';

const SAME_AS = ['https://www.instagram.com/bozzygram97/', 'https://www.linkedin.com/in/elenia-bozzato/'];
const ADDRESS = {
  '@type': 'PostalAddress',
  addressLocality: 'Cordovado',
  addressRegion: 'PN',
  postalCode: '33075',
  addressCountry: 'IT',
};
const AREA = [
  { '@type': 'AdministrativeArea', name: 'Friuli-Venezia Giulia' },
  { '@type': 'AdministrativeArea', name: 'Veneto' },
];
const JOB = { it: 'Brand strategist e communication designer', en: 'Brand strategist and communication designer' };

export function person({ lang, aboutUrl }) {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: 'Elenia Bozzato',
    url: aboutUrl,
    image: SITE_URL + OG_IMAGE,
    jobTitle: JOB[lang],
    email: 'mailto:hello@eleniabozzato.com',
    address: ADDRESS,
    worksFor: { '@id': BUSINESS_ID },
    sameAs: SAME_AS,
    knowsAbout: ['Brand strategy', 'Brand identity', 'Rebranding', 'Brand management', 'Communication design', 'Social media'],
  };
}

// Home page: the site, the business and the person in one graph.
export function homeGraph({ lang, t, homeUrl, aboutUrl, services }) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: `${SITE_URL}/`,
        name: 'Elenia Bozzato',
        inLanguage: ['en', 'it'],
        publisher: { '@id': PERSON_ID },
      },
      {
        '@type': 'ProfessionalService',
        '@id': BUSINESS_ID,
        name: 'Elenia Bozzato',
        description: t.home.meta.description,
        url: homeUrl,
        image: SITE_URL + OG_IMAGE,
        logo: `${SITE_URL}/assets/img/logo-elenia.png`,
        email: 'mailto:hello@eleniabozzato.com',
        vatID: 'IT04701970271',
        address: ADDRESS,
        areaServed: AREA,
        founder: { '@id': PERSON_ID },
        sameAs: SAME_AS,
        makesOffer: services.map((name) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name } })),
      },
      person({ lang, aboutUrl }),
    ],
  };
}

// About page: a profile page whose main entity is the person.
export function profileGraph({ lang, url, aboutUrl }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url,
    inLanguage: lang,
    mainEntity: person({ lang, aboutUrl }),
  };
}

export function breadcrumbs(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })),
  };
}

// Author / publisher of the blog articles: a reference to the person, with name and url for
// consumers that do not resolve @id.
export const author = (aboutUrl) => ({ '@type': 'Person', '@id': PERSON_ID, name: 'Elenia Bozzato', url: aboutUrl });
