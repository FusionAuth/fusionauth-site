import { getCollection } from "astro:content";

interface QuickStartSection {
  key: string;
  icon?: string;
  faIcon?: string;
  color: string;
  title: string;
  anchorTag: string;
  desc?: string;
  articles: {
    href?: string;
    data?: any
    title: string;
    description?: string;
    icon: string;
    comingSoon?: boolean;
    faIcon?: string;
    navColor?: string;
  }[];
}

const qsSections: QuickStartSection[] = [
  {
    key: 'web',
    icon: '/img/icons/web-application.svg',
    faIcon: 'fa-code-simple',
    color: 'indigo',
    title: 'Web Application',
    anchorTag: 'web-application',
    desc: 'Traditional web applications that run on servers',
    articles: [
      {
        href: '/blog/2022/03/07/single-sign-on-with-drupal',
        title: 'Drupal',
        icon: '/img/icons/drupal.svg',
        faIcon: 'fa-droplet',
        navColor: 'blue',
      },
      {
        href: '/blog/2023/03/13/single-sign-on-laravel-fusionauth',
        title: 'Laravel',
        icon: '/img/icons/laravel.svg',
        faIcon: 'fa-block',
        navColor: 'rose',
      },
      {
        href: '/blog/2021/12/06/how-to-set-up-single-sign-on-between-fusionauth-wordpress',
        title: 'Wordpress',
        icon: '/img/icons/wordpress.svg',
        faIcon: 'fa-w',
        navColor: 'fuchsia',
      },
    ],
  },
  {
    key: 'spa',
    icon: '/img/icons/single-page-app.svg',
    faIcon: 'fa-laptop-code',
    color: 'orange',
    title: 'Single-Page App (SPA)',
    anchorTag: 'spa',
    desc: 'JavaScript app that runs in the browser',
    articles: [
    ],
  },
  {
    key: 'native',
    icon: '/img/icons/native-mobile-app.svg',
    faIcon: 'fa-mobile-screen',
    color: 'blue',
    title: 'Native/Mobile App',
    anchorTag: 'mobile-app',
    desc: 'Mobile application that runs natively on a device',
    articles: [
/*
      {
        href: '/docs/quickstarts/quickstart-flutter-native',
        title: 'Flutter',
        icon: '/img/icons/flutter.svg',
        faIcon: 'fa-snake',
        navColor: 'indigo'
      },
*/
    ],
  },
  {
    key: 'api',
    icon: '/img/icons/backend-api.svg',
    faIcon: 'fa-binary',
    color: 'green',
    title: 'Backend/API',
    anchorTag: 'api',
    desc: 'An API or service protected by FusionAuth and access tokens',
    articles: [
/*
      {
        href: '/docs/quickstarts/quickstart-dotnet-api',
        title: '.NET Core',
        icon: '/img/icons/dotnet-c.svg',
        faIcon: 'fa-hashtag',
        navColor: 'blue',
      },
*/
    ],
  },
  {
      key: 'fiveminute',
      icon: '/img/icons/qs-main.svg',
      faIcon: 'fa-code-simple',
      color: 'indigo',
      title: '5-minute Guides',
      anchorTag: '5-minute',
      desc: 'Guides for getting up and running quickly',
      articles: [
      ],
    },
];

// merge in quickstarts managed by astro to the list of quickstart links we have above
const quickstarts = await getCollection("quickstarts");

quickstarts.filter(quickstart => quickstart.id.indexOf("index.md") === -1)
  .map(qs => (
    {
      href: `/docs/quickstarts/${qs.slug}/`,
      title: qs.data.title,
      icon: qs.data.icon,
      faIcon: qs.data.faIcon,
      navColor: qs.data.color,
      ...qs
    }))
  .forEach(qs => qsSections.find(section => section.key === qs.data.section).articles.unshift(qs));

export const quickstartSections = qsSections;
