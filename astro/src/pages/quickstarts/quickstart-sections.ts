import { getCollection } from "astro:content";

interface QuickStartSection {
  key: string;
  icon?: string;
  title: string;
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
    title: 'Web Application',
    desc: 'Traditional web applications that run on servers',
    articles: [
      {
        href: '/docs/v1/tech/tutorials/integrate-python-django',
        title: 'Django',
        icon: '/img/icons/python.svg',
        faIcon: 'fa-snake',
        navColor: 'orange'
      },
      {
        href: '/blog/2022/03/07/single-sign-on-with-drupal',
        title: 'Drupal',
        icon: '/img/icons/drupal.svg',
        faIcon: 'fa-droplet',
        navColor: 'blue',
      },
      {
        href: '/docs/v1/tech/tutorials/integrate-expressjs',
        title: 'Express',
        icon: '/img/icons/javascript.svg',
        faIcon: 'fa-x',
        navColor: 'gray'
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
        navColor: 'slate',
      },
      {
        title: '.NET',
        icon: '/img/icons/dotnet-c.svg',
        faIcon: 'fa-hashtag',
        comingSoon: true,
        navColor: 'blue'
      },
      {
        href: '/blog/2023/04/26/nextjs-single-sign-on',
        title: '.Next.js',
        icon: '/img/icons/nextjs.svg',
        faIcon: 'fa-n',
        navColor: 'green',
      },
      {
        title: 'Go',
        icon: '/img/icons/golang.svg',
        faIcon: 'fa-g',
        comingSoon: true,
        navColor: 'blue',
      },
      {
        title: 'PHP',
        icon: '/img/icons/php.svg',
        faIcon: 'fa-php',
        comingSoon: true,
        navColor: 'purple'
      },
    ],
  },
  {
    key: 'spa',
    icon: '/img/icons/single-page-app.svg',
    title: 'Single-Page App (SPA)',
    desc: 'JavaScript app that runs in the browser',
    articles: [
      {
        href: '/docs/v1/tech/tutorials/integrate-react',
        title: 'React',
        icon: '/img/icons/react.svg',
        faIcon: 'fa-r',
        navColor: 'blue',
      },
      {
        href: '/blog/2022/07/15/remix-demo',
        title: 'Remix',
        icon: '/img/icons/javascript.svg',
        faIcon: 'fa-j',
        navColor: 'yellow'
      },
      {
        title: 'Angular',
        icon: '/img/icons/angular-spa.svg',
        faIcon: 'fa-snake',
        comingSoon: true,
      },
      {
        title: 'Vue.js',
        icon: '/img/icons/vue.js.svg',
        faIcon: 'fa-snake',
        comingSoon: true,
      },
    ],
  },
  {
    key: 'native',
    icon: '/img/icons/native-mobile-app.svg',
    title: 'Native/Mobile App',
    desc: 'Mobile application that runs natively on a device',
    articles: [
      {
        title: 'Flutter',
        icon: '/img/icons/flutter.svg',
        faIcon: 'fa-snake',
        comingSoon: true,
      },
      {
        href: '/blog/2020/08/19/securing-react-native-with-oauth',
        title: 'React Native',
        icon: '/img/icons/react.svg',
        faIcon: 'fa-r',
        navColor: 'indigo'
      },
    ],
  },
  {
    key: 'api',
    icon: '/img/icons/backend-api.svg',
    title: 'Backend/API',
    desc: 'An API or service protected by FusionAuth and access tokens',
    articles: [
      {
        href: '/docs/v1/tech/tutorials/integrate-ruby-rails-api',
        title: 'Ruby on Rails',
        icon: '/img/icons/ruby-on-rails.svg',
        faIcon: 'fa-gem',
        navColor: 'red',
      },
      {
        href: '/blog/2021/02/18/securing-golang-microservice',
        title: 'Go',
        icon: '/img/icons/golang.svg',
        faIcon: 'fa-g',
        navColor: 'blue',
      },
    ],
  },
];

const quickstarts = await getCollection("quickstarts");

quickstarts.filter(quickstart => quickstart.id.indexOf("index.md") === -1)
  .map(qs => (
    {
      href: `/quickstarts/${qs.slug}/`,
      title: qs.data.title,
      icon: qs.data.icon,
      faIcon: qs.data.faIcon,
      navColor: qs.data.color,
      ...qs
    }))
  .forEach(qs => qsSections.find(section => section.key === qs.data.section).articles.unshift(qs));

export const quickstartSections = qsSections;