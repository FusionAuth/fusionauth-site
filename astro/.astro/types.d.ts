declare module 'astro:content' {
	interface Render {
		'.mdx': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	interface Render {
		'.md': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	export { z } from 'astro/zod';
	export type CollectionEntry<C extends keyof typeof entryMap> =
		(typeof entryMap)[C][keyof (typeof entryMap)[C]];

	// This needs to be in sync with ImageMetadata
	export const image: () => import('astro/zod').ZodObject<{
		src: import('astro/zod').ZodString;
		width: import('astro/zod').ZodNumber;
		height: import('astro/zod').ZodNumber;
		format: import('astro/zod').ZodUnion<
			[
				import('astro/zod').ZodLiteral<'png'>,
				import('astro/zod').ZodLiteral<'jpg'>,
				import('astro/zod').ZodLiteral<'jpeg'>,
				import('astro/zod').ZodLiteral<'tiff'>,
				import('astro/zod').ZodLiteral<'webp'>,
				import('astro/zod').ZodLiteral<'gif'>,
				import('astro/zod').ZodLiteral<'svg'>
			]
		>;
	}>;

	type BaseSchemaWithoutEffects =
		| import('astro/zod').AnyZodObject
		| import('astro/zod').ZodUnion<import('astro/zod').AnyZodObject[]>
		| import('astro/zod').ZodDiscriminatedUnion<string, import('astro/zod').AnyZodObject[]>
		| import('astro/zod').ZodIntersection<
				import('astro/zod').AnyZodObject,
				import('astro/zod').AnyZodObject
		  >;

	type BaseSchema =
		| BaseSchemaWithoutEffects
		| import('astro/zod').ZodEffects<BaseSchemaWithoutEffects>;

	type BaseCollectionConfig<S extends BaseSchema> = {
		schema?: S;
		slug?: (entry: {
			id: CollectionEntry<keyof typeof entryMap>['id'];
			defaultSlug: string;
			collection: string;
			body: string;
			data: import('astro/zod').infer<S>;
		}) => string | Promise<string>;
	};
	export function defineCollection<S extends BaseSchema>(
		input: BaseCollectionConfig<S>
	): BaseCollectionConfig<S>;

	type EntryMapKeys = keyof typeof entryMap;
	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidEntrySlug<C extends EntryMapKeys> = AllValuesOf<(typeof entryMap)[C]>['slug'];

	export function getEntryBySlug<
		C extends keyof typeof entryMap,
		E extends ValidEntrySlug<C> | (string & {})
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E
	): E extends ValidEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getCollection<C extends keyof typeof entryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E
	): Promise<E[]>;
	export function getCollection<C extends keyof typeof entryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown
	): Promise<CollectionEntry<C>[]>;

	type InferEntrySchema<C extends keyof typeof entryMap> = import('astro/zod').infer<
		Required<ContentConfig['collections'][C]>['schema']
	>;

	const entryMap: {
		"articles": {
"authentication/avoid-lockin.md": {
  id: "authentication/avoid-lockin.md",
  slug: "authentication/avoid-lockin",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"authentication/common-authentication-implementation-risks.md": {
  id: "authentication/common-authentication-implementation-risks.md",
  slug: "authentication/common-authentication-implementation-risks",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"authentication/developer-benefits-single-sign-on.md": {
  id: "authentication/developer-benefits-single-sign-on.md",
  slug: "authentication/developer-benefits-single-sign-on",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"authentication/how-sso-works.mdx": {
  id: "authentication/how-sso-works.mdx",
  slug: "authentication/how-sso-works",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"authentication/index.mdx": {
  id: "authentication/index.mdx",
  slug: "authentication",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"authentication/login-failures.md": {
  id: "authentication/login-failures.md",
  slug: "authentication/login-failures",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"authentication/multi-factor-authentication.md": {
  id: "authentication/multi-factor-authentication.md",
  slug: "authentication/multi-factor-authentication",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"authentication/types-of-kubernetes-auth.md": {
  id: "authentication/types-of-kubernetes-auth.md",
  slug: "authentication/types-of-kubernetes-auth",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"authentication/webauthn-explained.md": {
  id: "authentication/webauthn-explained.md",
  slug: "authentication/webauthn-explained",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"ciam/auth-and-the-bottleneck-architecture.md": {
  id: "ciam/auth-and-the-bottleneck-architecture.md",
  slug: "ciam/auth-and-the-bottleneck-architecture",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"ciam/auth-facade-pattern.md": {
  id: "ciam/auth-facade-pattern.md",
  slug: "ciam/auth-facade-pattern",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"ciam/challenges-of-ciam.mdx": {
  id: "ciam/challenges-of-ciam.mdx",
  slug: "ciam/challenges-of-ciam",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"ciam/ciam-vs-iam.md": {
  id: "ciam/ciam-vs-iam.md",
  slug: "ciam/ciam-vs-iam",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"ciam/demise-of-third-party-cookies-running-own-ciam.md": {
  id: "ciam/demise-of-third-party-cookies-running-own-ciam.md",
  slug: "ciam/demise-of-third-party-cookies-running-own-ciam",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"ciam/developers-guide-to-gdpr.md": {
  id: "ciam/developers-guide-to-gdpr.md",
  slug: "ciam/developers-guide-to-gdpr",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"ciam/index.mdx": {
  id: "ciam/index.mdx",
  slug: "ciam",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"ciam/making-sure-your-auth-system-scales.md": {
  id: "ciam/making-sure-your-auth-system-scales.md",
  slug: "ciam/making-sure-your-auth-system-scales",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"ciam/unlocking-growth-low-friction-signup-process.md": {
  id: "ciam/unlocking-growth-low-friction-signup-process.md",
  slug: "ciam/unlocking-growth-low-friction-signup-process",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"ciam/what-is-ciam.md": {
  id: "ciam/what-is-ciam.md",
  slug: "ciam/what-is-ciam",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"gaming-entertainment/benefits-self-hosting-reduce-latency.md": {
  id: "gaming-entertainment/benefits-self-hosting-reduce-latency.md",
  slug: "gaming-entertainment/benefits-self-hosting-reduce-latency",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"gaming-entertainment/best-practices-spiky-registration.md": {
  id: "gaming-entertainment/best-practices-spiky-registration.md",
  slug: "gaming-entertainment/best-practices-spiky-registration",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"gaming-entertainment/cross-platform-game-accounts.md": {
  id: "gaming-entertainment/cross-platform-game-accounts.md",
  slug: "gaming-entertainment/cross-platform-game-accounts",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"gaming-entertainment/gaming-identity-provider-needs.md": {
  id: "gaming-entertainment/gaming-identity-provider-needs.md",
  slug: "gaming-entertainment/gaming-identity-provider-needs",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"gaming-entertainment/index.mdx": {
  id: "gaming-entertainment/index.mdx",
  slug: "gaming-entertainment",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"gaming-entertainment/oauth-device-grant-gaming.md": {
  id: "gaming-entertainment/oauth-device-grant-gaming.md",
  slug: "gaming-entertainment/oauth-device-grant-gaming",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"gaming-entertainment/securing-game-account.md": {
  id: "gaming-entertainment/securing-game-account.md",
  slug: "gaming-entertainment/securing-game-account",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"identity-basics/complete-authentication-system.md": {
  id: "identity-basics/complete-authentication-system.md",
  slug: "identity-basics/complete-authentication-system",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"identity-basics/due-diligence-authentication-vendors.md": {
  id: "identity-basics/due-diligence-authentication-vendors.md",
  slug: "identity-basics/due-diligence-authentication-vendors",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"identity-basics/index.mdx": {
  id: "identity-basics/index.mdx",
  slug: "identity-basics",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"identity-basics/magic-links.md": {
  id: "identity-basics/magic-links.md",
  slug: "identity-basics/magic-links",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"identity-basics/multi-tenancy-vs-single-tenant-idaas-solutions.md": {
  id: "identity-basics/multi-tenancy-vs-single-tenant-idaas-solutions.md",
  slug: "identity-basics/multi-tenancy-vs-single-tenant-idaas-solutions",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"identity-basics/open-source-vs-commercial.md": {
  id: "identity-basics/open-source-vs-commercial.md",
  slug: "identity-basics/open-source-vs-commercial",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"identity-basics/outsource-auth-system-blueprint.md": {
  id: "identity-basics/outsource-auth-system-blueprint.md",
  slug: "identity-basics/outsource-auth-system-blueprint",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"identity-basics/registration-best-practices.md": {
  id: "identity-basics/registration-best-practices.md",
  slug: "identity-basics/registration-best-practices",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"identity-basics/slow-migration.mdx": {
  id: "identity-basics/slow-migration.mdx",
  slug: "identity-basics/slow-migration",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"identity-basics/try-before-you-buy.md": {
  id: "identity-basics/try-before-you-buy.md",
  slug: "identity-basics/try-before-you-buy",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"identity-basics/what-is-identity-proofing.md": {
  id: "identity-basics/what-is-identity-proofing.md",
  slug: "identity-basics/what-is-identity-proofing",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"identity-basics/what-is-scim.mdx": {
  id: "identity-basics/what-is-scim.mdx",
  slug: "identity-basics/what-is-scim",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"identity-basics/what-to-do-when-auth-system-vendor-acquired.md": {
  id: "identity-basics/what-to-do-when-auth-system-vendor-acquired.md",
  slug: "identity-basics/what-to-do-when-auth-system-vendor-acquired",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"login-authentication-workflows/authentication-workflows-overview.md": {
  id: "login-authentication-workflows/authentication-workflows-overview.md",
  slug: "login-authentication-workflows/authentication-workflows-overview",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"login-authentication-workflows/index.mdx": {
  id: "login-authentication-workflows/index.mdx",
  slug: "login-authentication-workflows",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"login-authentication-workflows/mobile/native-login-form-to-application-backend-jwts-refresh-tokens.mdx": {
  id: "login-authentication-workflows/mobile/native-login-form-to-application-backend-jwts-refresh-tokens.mdx",
  slug: "login-authentication-workflows/mobile/native-login-form-to-application-backend-jwts-refresh-tokens",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"login-authentication-workflows/mobile/native-login-form-to-fusionauth-jwts-refresh-tokens.mdx": {
  id: "login-authentication-workflows/mobile/native-login-form-to-fusionauth-jwts-refresh-tokens.mdx",
  slug: "login-authentication-workflows/mobile/native-login-form-to-fusionauth-jwts-refresh-tokens",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"login-authentication-workflows/mobile/oauth-resource-owner-password-credentials-grant-jwts-refresh-tokens.mdx": {
  id: "login-authentication-workflows/mobile/oauth-resource-owner-password-credentials-grant-jwts-refresh-tokens.mdx",
  slug: "login-authentication-workflows/mobile/oauth-resource-owner-password-credentials-grant-jwts-refresh-tokens",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"login-authentication-workflows/spa/native-login-form-to-application-backend-jwts-refresh-tokens-cookies.mdx": {
  id: "login-authentication-workflows/spa/native-login-form-to-application-backend-jwts-refresh-tokens-cookies.mdx",
  slug: "login-authentication-workflows/spa/native-login-form-to-application-backend-jwts-refresh-tokens-cookies",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"login-authentication-workflows/spa/native-login-form-to-application-backend-sessions-refresh-tokens-cookies.mdx": {
  id: "login-authentication-workflows/spa/native-login-form-to-application-backend-sessions-refresh-tokens-cookies.mdx",
  slug: "login-authentication-workflows/spa/native-login-form-to-application-backend-sessions-refresh-tokens-cookies",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"login-authentication-workflows/spa/native-login-form-to-application-backend-sessions.mdx": {
  id: "login-authentication-workflows/spa/native-login-form-to-application-backend-sessions.mdx",
  slug: "login-authentication-workflows/spa/native-login-form-to-application-backend-sessions",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"login-authentication-workflows/spa/native-login-form-to-fusionauth-jwts-local-storage-refresh-tokens-cookies.mdx": {
  id: "login-authentication-workflows/spa/native-login-form-to-fusionauth-jwts-local-storage-refresh-tokens-cookies.mdx",
  slug: "login-authentication-workflows/spa/native-login-form-to-fusionauth-jwts-local-storage-refresh-tokens-cookies",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"login-authentication-workflows/spa/native-login-form-to-fusionauth-jwts-refresh-tokens-cookies.mdx": {
  id: "login-authentication-workflows/spa/native-login-form-to-fusionauth-jwts-refresh-tokens-cookies.mdx",
  slug: "login-authentication-workflows/spa/native-login-form-to-fusionauth-jwts-refresh-tokens-cookies",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"login-authentication-workflows/spa/native-login-form-to-fusionauth-same-domain-jwts-refresh-tokens-cookies.mdx": {
  id: "login-authentication-workflows/spa/native-login-form-to-fusionauth-same-domain-jwts-refresh-tokens-cookies.mdx",
  slug: "login-authentication-workflows/spa/native-login-form-to-fusionauth-same-domain-jwts-refresh-tokens-cookies",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"login-authentication-workflows/spa/oauth-authorization-code-grant-jwts-refresh-tokens-cookies.mdx": {
  id: "login-authentication-workflows/spa/oauth-authorization-code-grant-jwts-refresh-tokens-cookies.mdx",
  slug: "login-authentication-workflows/spa/oauth-authorization-code-grant-jwts-refresh-tokens-cookies",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"login-authentication-workflows/spa/oauth-authorization-code-grant-sessions-refresh-tokens-cookies.mdx": {
  id: "login-authentication-workflows/spa/oauth-authorization-code-grant-sessions-refresh-tokens-cookies.mdx",
  slug: "login-authentication-workflows/spa/oauth-authorization-code-grant-sessions-refresh-tokens-cookies",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"login-authentication-workflows/spa/oauth-authorization-code-grant-sessions.mdx": {
  id: "login-authentication-workflows/spa/oauth-authorization-code-grant-sessions.mdx",
  slug: "login-authentication-workflows/spa/oauth-authorization-code-grant-sessions",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"login-authentication-workflows/spa/oauth-implicit-grant-jwts-cookies.mdx": {
  id: "login-authentication-workflows/spa/oauth-implicit-grant-jwts-cookies.mdx",
  slug: "login-authentication-workflows/spa/oauth-implicit-grant-jwts-cookies",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"login-authentication-workflows/spa/oauth-implicit-grant-jwts-local-storage.mdx": {
  id: "login-authentication-workflows/spa/oauth-implicit-grant-jwts-local-storage.mdx",
  slug: "login-authentication-workflows/spa/oauth-implicit-grant-jwts-local-storage",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"login-authentication-workflows/spa/oauth-implicit-grant-sessions.mdx": {
  id: "login-authentication-workflows/spa/oauth-implicit-grant-sessions.mdx",
  slug: "login-authentication-workflows/spa/oauth-implicit-grant-sessions",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"login-authentication-workflows/spa/oauth-resource-owner-password-credentials-grant-jwts-refresh-tokens-cookies.mdx": {
  id: "login-authentication-workflows/spa/oauth-resource-owner-password-credentials-grant-jwts-refresh-tokens-cookies.mdx",
  slug: "login-authentication-workflows/spa/oauth-resource-owner-password-credentials-grant-jwts-refresh-tokens-cookies",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"login-authentication-workflows/spa/oauth-resource-owner-password-credentials-grant-sessions-refresh-tokens-cookies.mdx": {
  id: "login-authentication-workflows/spa/oauth-resource-owner-password-credentials-grant-sessions-refresh-tokens-cookies.mdx",
  slug: "login-authentication-workflows/spa/oauth-resource-owner-password-credentials-grant-sessions-refresh-tokens-cookies",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"login-authentication-workflows/spa/oauth-resource-owner-password-credentials-grant-sessions.mdx": {
  id: "login-authentication-workflows/spa/oauth-resource-owner-password-credentials-grant-sessions.mdx",
  slug: "login-authentication-workflows/spa/oauth-resource-owner-password-credentials-grant-sessions",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"login-authentication-workflows/webapp/native-login-form-to-application-backend-jwts-refresh-tokens-cookies.mdx": {
  id: "login-authentication-workflows/webapp/native-login-form-to-application-backend-jwts-refresh-tokens-cookies.mdx",
  slug: "login-authentication-workflows/webapp/native-login-form-to-application-backend-jwts-refresh-tokens-cookies",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"login-authentication-workflows/webapp/native-login-form-to-application-backend-sessions-refresh-tokens-cookies.mdx": {
  id: "login-authentication-workflows/webapp/native-login-form-to-application-backend-sessions-refresh-tokens-cookies.mdx",
  slug: "login-authentication-workflows/webapp/native-login-form-to-application-backend-sessions-refresh-tokens-cookies",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"login-authentication-workflows/webapp/native-login-form-to-application-backend-sessions.mdx": {
  id: "login-authentication-workflows/webapp/native-login-form-to-application-backend-sessions.mdx",
  slug: "login-authentication-workflows/webapp/native-login-form-to-application-backend-sessions",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"login-authentication-workflows/webapp/oauth-authorization-code-grant-jwts-refresh-tokens-cookies.mdx": {
  id: "login-authentication-workflows/webapp/oauth-authorization-code-grant-jwts-refresh-tokens-cookies.mdx",
  slug: "login-authentication-workflows/webapp/oauth-authorization-code-grant-jwts-refresh-tokens-cookies",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"login-authentication-workflows/webapp/oauth-authorization-code-grant-sessions-refresh-tokens-cookies.mdx": {
  id: "login-authentication-workflows/webapp/oauth-authorization-code-grant-sessions-refresh-tokens-cookies.mdx",
  slug: "login-authentication-workflows/webapp/oauth-authorization-code-grant-sessions-refresh-tokens-cookies",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"login-authentication-workflows/webapp/oauth-authorization-code-grant-sessions.mdx": {
  id: "login-authentication-workflows/webapp/oauth-authorization-code-grant-sessions.mdx",
  slug: "login-authentication-workflows/webapp/oauth-authorization-code-grant-sessions",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"login-authentication-workflows/webapp/oauth-resource-owner-password-credentials-grant-jwts-refresh-tokens-cookies.mdx": {
  id: "login-authentication-workflows/webapp/oauth-resource-owner-password-credentials-grant-jwts-refresh-tokens-cookies.mdx",
  slug: "login-authentication-workflows/webapp/oauth-resource-owner-password-credentials-grant-jwts-refresh-tokens-cookies",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"login-authentication-workflows/webapp/oauth-resource-owner-password-credentials-grant-sessions-refresh-tokens-cookies.mdx": {
  id: "login-authentication-workflows/webapp/oauth-resource-owner-password-credentials-grant-sessions-refresh-tokens-cookies.mdx",
  slug: "login-authentication-workflows/webapp/oauth-resource-owner-password-credentials-grant-sessions-refresh-tokens-cookies",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"login-authentication-workflows/webapp/oauth-resource-owner-password-credentials-grant-sessions.mdx": {
  id: "login-authentication-workflows/webapp/oauth-resource-owner-password-credentials-grant-sessions.mdx",
  slug: "login-authentication-workflows/webapp/oauth-resource-owner-password-credentials-grant-sessions",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"oauth/complete-list-oauth-grants.md": {
  id: "oauth/complete-list-oauth-grants.md",
  slug: "oauth/complete-list-oauth-grants",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"oauth/differences-between-oauth-2-oauth-2-1.md": {
  id: "oauth/differences-between-oauth-2-oauth-2-1.md",
  slug: "oauth/differences-between-oauth-2-oauth-2-1",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"oauth/index.mdx": {
  id: "oauth/index.mdx",
  slug: "oauth",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"oauth/modern-guide-to-oauth.mdx": {
  id: "oauth/modern-guide-to-oauth.mdx",
  slug: "oauth/modern-guide-to-oauth",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"oauth/oauth-device-authorization.mdx": {
  id: "oauth/oauth-device-authorization.mdx",
  slug: "oauth/oauth-device-authorization",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"oauth/oauth-token-storage.mdx": {
  id: "oauth/oauth-token-storage.mdx",
  slug: "oauth/oauth-token-storage",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"oauth/oauth-v1-signed-requests.mdx": {
  id: "oauth/oauth-v1-signed-requests.mdx",
  slug: "oauth/oauth-v1-signed-requests",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"oauth/saml-vs-oauth.mdx": {
  id: "oauth/saml-vs-oauth.mdx",
  slug: "oauth/saml-vs-oauth",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"oauth/value-standards-compliant-authentication.md": {
  id: "oauth/value-standards-compliant-authentication.md",
  slug: "oauth/value-standards-compliant-authentication",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"oauth/why-no-authentication-in-oauth.md": {
  id: "oauth/why-no-authentication-in-oauth.md",
  slug: "oauth/why-no-authentication-in-oauth",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"security/breached-password-detection.md": {
  id: "security/breached-password-detection.md",
  slug: "security/breached-password-detection",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"security/guide-to-user-data-security.mdx": {
  id: "security/guide-to-user-data-security.mdx",
  slug: "security/guide-to-user-data-security",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"security/index.mdx": {
  id: "security/index.mdx",
  slug: "security",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"security/math-of-password-hashing-algorithms-entropy.md": {
  id: "security/math-of-password-hashing-algorithms-entropy.md",
  slug: "security/math-of-password-hashing-algorithms-entropy",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"security/password-security-compliance-checklist.mdx": {
  id: "security/password-security-compliance-checklist.mdx",
  slug: "security/password-security-compliance-checklist",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"security/steps-secure-your-authentication-system.md": {
  id: "security/steps-secure-your-authentication-system.md",
  slug: "security/steps-secure-your-authentication-system",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"security/zero-trust-identity-provider.md": {
  id: "security/zero-trust-identity-provider.md",
  slug: "security/zero-trust-identity-provider",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"tokens/building-a-secure-jwt.md": {
  id: "tokens/building-a-secure-jwt.md",
  slug: "tokens/building-a-secure-jwt",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"tokens/index.mdx": {
  id: "tokens/index.mdx",
  slug: "tokens",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"tokens/jwt-components-explained.md": {
  id: "tokens/jwt-components-explained.md",
  slug: "tokens/jwt-components-explained",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"tokens/pros-and-cons-of-jwts.md": {
  id: "tokens/pros-and-cons-of-jwts.md",
  slug: "tokens/pros-and-cons-of-jwts",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"tokens/revoking-jwts.md": {
  id: "tokens/revoking-jwts.md",
  slug: "tokens/revoking-jwts",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"tokens/tokens-microservices-boundaries.md": {
  id: "tokens/tokens-microservices-boundaries.md",
  slug: "tokens/tokens-microservices-boundaries",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
},
"blog": {
"10log-fusionauth.mdx": {
  id: "10log-fusionauth.mdx",
  slug: "10log-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"6-ways-fusionauth-api-gdpr-ready.mdx": {
  id: "6-ways-fusionauth-api-gdpr-ready.mdx",
  slug: "6-ways-fusionauth-api-gdpr-ready",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"8-things-to-know-about-okta-and-fusionauth.mdx": {
  id: "8-things-to-know-about-okta-and-fusionauth.mdx",
  slug: "8-things-to-know-about-okta-and-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"aaas-security-due-diligence-excerpt.mdx": {
  id: "aaas-security-due-diligence-excerpt.mdx",
  slug: "aaas-security-due-diligence-excerpt",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"active-directory-and-fusionauth-ciam-comparison.mdx": {
  id: "active-directory-and-fusionauth-ciam-comparison.mdx",
  slug: "active-directory-and-fusionauth-ciam-comparison",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"active-directory-connector.mdx": {
  id: "active-directory-connector.mdx",
  slug: "active-directory-connector",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"adcellerant-migrated-from-mongodb.mdx": {
  id: "adcellerant-migrated-from-mongodb.mdx",
  slug: "adcellerant-migrated-from-mongodb",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"advanced-registration-form.mdx": {
  id: "advanced-registration-form.mdx",
  slug: "advanced-registration-form",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"amazon-cognito-and-fusionauth-comparison.mdx": {
  id: "amazon-cognito-and-fusionauth-comparison.mdx",
  slug: "amazon-cognito-and-fusionauth-comparison",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"angulardenver-fusionauth-sponsor.mdx": {
  id: "angulardenver-fusionauth-sponsor.mdx",
  slug: "angulardenver-fusionauth-sponsor",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"announcing-early-access-program.mdx": {
  id: "announcing-early-access-program.mdx",
  slug: "announcing-early-access-program",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"announcing-fusionauth-1-16.mdx": {
  id: "announcing-fusionauth-1-16.mdx",
  slug: "announcing-fusionauth-1-16",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"announcing-fusionauth-1-17.mdx": {
  id: "announcing-fusionauth-1-17.mdx",
  slug: "announcing-fusionauth-1-17",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"announcing-fusionauth-1-18.mdx": {
  id: "announcing-fusionauth-1-18.mdx",
  slug: "announcing-fusionauth-1-18",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"announcing-fusionauth-1-19.mdx": {
  id: "announcing-fusionauth-1-19.mdx",
  slug: "announcing-fusionauth-1-19",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"announcing-fusionauth-1-20.mdx": {
  id: "announcing-fusionauth-1-20.mdx",
  slug: "announcing-fusionauth-1-20",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"announcing-fusionauth-1-21.mdx": {
  id: "announcing-fusionauth-1-21.mdx",
  slug: "announcing-fusionauth-1-21",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"announcing-fusionauth-1-22.mdx": {
  id: "announcing-fusionauth-1-22.mdx",
  slug: "announcing-fusionauth-1-22",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"announcing-fusionauth-1-23.mdx": {
  id: "announcing-fusionauth-1-23.mdx",
  slug: "announcing-fusionauth-1-23",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"announcing-fusionauth-1-24.mdx": {
  id: "announcing-fusionauth-1-24.mdx",
  slug: "announcing-fusionauth-1-24",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"announcing-fusionauth-1-25.mdx": {
  id: "announcing-fusionauth-1-25.mdx",
  slug: "announcing-fusionauth-1-25",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"announcing-fusionauth-1-26.mdx": {
  id: "announcing-fusionauth-1-26.mdx",
  slug: "announcing-fusionauth-1-26",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"announcing-fusionauth-1-27.mdx": {
  id: "announcing-fusionauth-1-27.mdx",
  slug: "announcing-fusionauth-1-27",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"announcing-fusionauth-1-28.mdx": {
  id: "announcing-fusionauth-1-28.mdx",
  slug: "announcing-fusionauth-1-28",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"announcing-fusionauth-1-29.mdx": {
  id: "announcing-fusionauth-1-29.mdx",
  slug: "announcing-fusionauth-1-29",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"announcing-fusionauth-1-30.mdx": {
  id: "announcing-fusionauth-1-30.mdx",
  slug: "announcing-fusionauth-1-30",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"announcing-fusionauth-1-31.mdx": {
  id: "announcing-fusionauth-1-31.mdx",
  slug: "announcing-fusionauth-1-31",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"announcing-fusionauth-1-32.mdx": {
  id: "announcing-fusionauth-1-32.mdx",
  slug: "announcing-fusionauth-1-32",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"announcing-fusionauth-1-33.mdx": {
  id: "announcing-fusionauth-1-33.mdx",
  slug: "announcing-fusionauth-1-33",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"announcing-fusionauth-1-34.mdx": {
  id: "announcing-fusionauth-1-34.mdx",
  slug: "announcing-fusionauth-1-34",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"announcing-fusionauth-1-35.mdx": {
  id: "announcing-fusionauth-1-35.mdx",
  slug: "announcing-fusionauth-1-35",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"announcing-fusionauth-1-36.mdx": {
  id: "announcing-fusionauth-1-36.mdx",
  slug: "announcing-fusionauth-1-36",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"announcing-fusionauth-1-37.mdx": {
  id: "announcing-fusionauth-1-37.mdx",
  slug: "announcing-fusionauth-1-37",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"announcing-fusionauth-1-38.mdx": {
  id: "announcing-fusionauth-1-38.mdx",
  slug: "announcing-fusionauth-1-38",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"announcing-fusionauth-1-39.mdx": {
  id: "announcing-fusionauth-1-39.mdx",
  slug: "announcing-fusionauth-1-39",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"announcing-fusionauth-1-40.mdx": {
  id: "announcing-fusionauth-1-40.mdx",
  slug: "announcing-fusionauth-1-40",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"announcing-fusionauth-1-41.mdx": {
  id: "announcing-fusionauth-1-41.mdx",
  slug: "announcing-fusionauth-1-41",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"announcing-fusionauth-1-42.mdx": {
  id: "announcing-fusionauth-1-42.mdx",
  slug: "announcing-fusionauth-1-42",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"announcing-fusionauth-1-43.mdx": {
  id: "announcing-fusionauth-1-43.mdx",
  slug: "announcing-fusionauth-1-43",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"announcing-fusionauth-1-45.mdx": {
  id: "announcing-fusionauth-1-45.mdx",
  slug: "announcing-fusionauth-1-45",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"announcing-fusionauth-1-46.mdx": {
  id: "announcing-fusionauth-1-46.mdx",
  slug: "announcing-fusionauth-1-46",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"announcing-fusionauth-1-47.mdx": {
  id: "announcing-fusionauth-1-47.mdx",
  slug: "announcing-fusionauth-1-47",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"arm-architecture-support.mdx": {
  id: "arm-architecture-support.mdx",
  slug: "arm-architecture-support",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"asp-net-core-identity-considered-harmful.mdx": {
  id: "asp-net-core-identity-considered-harmful.mdx",
  slug: "asp-net-core-identity-considered-harmful",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"auth-and-the-bottleneck-architecture.mdx": {
  id: "auth-and-the-bottleneck-architecture.mdx",
  slug: "auth-and-the-bottleneck-architecture",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"auth-facade-pattern.mdx": {
  id: "auth-facade-pattern.mdx",
  slug: "auth-facade-pattern",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"auth0-and-fusionauth-a-tale-of-two-solutions.mdx": {
  id: "auth0-and-fusionauth-a-tale-of-two-solutions.mdx",
  slug: "auth0-and-fusionauth-a-tale-of-two-solutions",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"authenticators-ceremonies-webauthn-oh-my.mdx": {
  id: "authenticators-ceremonies-webauthn-oh-my.mdx",
  slug: "authenticators-ceremonies-webauthn-oh-my",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"avoid-lockin-insulate-your-application-and-have-backup-plan-excerpt.mdx": {
  id: "avoid-lockin-insulate-your-application-and-have-backup-plan-excerpt.mdx",
  slug: "avoid-lockin-insulate-your-application-and-have-backup-plan-excerpt",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"aws-savings-plans.mdx": {
  id: "aws-savings-plans.mdx",
  slug: "aws-savings-plans",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"become-education-fusionauth.mdx": {
  id: "become-education-fusionauth.mdx",
  slug: "become-education-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"best-places-to-work.mdx": {
  id: "best-places-to-work.mdx",
  slug: "best-places-to-work",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"breached-password-detection-best-practices.mdx": {
  id: "breached-password-detection-best-practices.mdx",
  slug: "breached-password-detection-best-practices",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"breached-password-detection.mdx": {
  id: "breached-password-detection.mdx",
  slug: "breached-password-detection",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"building-cli-app-with-device-grant-and-golang.mdx": {
  id: "building-cli-app-with-device-grant-and-golang.mdx",
  slug: "building-cli-app-with-device-grant-and-golang",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"building-fusionauth-homebrew-formula.mdx": {
  id: "building-fusionauth-homebrew-formula.mdx",
  slug: "building-fusionauth-homebrew-formula",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"building-profile-portal-with-flask-oauth-apis.mdx": {
  id: "building-profile-portal-with-flask-oauth-apis.mdx",
  slug: "building-profile-portal-with-flask-oauth-apis",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"building-protected-api-with-rails-and-jwt.mdx": {
  id: "building-protected-api-with-rails-and-jwt.mdx",
  slug: "building-protected-api-with-rails-and-jwt",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"ciam-vs-iam.mdx": {
  id: "ciam-vs-iam.mdx",
  slug: "ciam-vs-iam",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"circleboom-fusionauth-single-sign-on.mdx": {
  id: "circleboom-fusionauth-single-sign-on.mdx",
  slug: "circleboom-fusionauth-single-sign-on",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"clearspend-customizes-fusionauth.mdx": {
  id: "clearspend-customizes-fusionauth.mdx",
  slug: "clearspend-customizes-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"congrats-auth0-okta-acquisition.mdx": {
  id: "congrats-auth0-okta-acquisition.mdx",
  slug: "congrats-auth0-okta-acquisition",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"consents-example.mdx": {
  id: "consents-example.mdx",
  slug: "consents-example",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"contaim-fusionauth.mdx": {
  id: "contaim-fusionauth.mdx",
  slug: "contaim-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"contenda-saved-time-with-fusionauth.mdx": {
  id: "contenda-saved-time-with-fusionauth.mdx",
  slug: "contenda-saved-time-with-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"critical-infrastructure-latency-gaming.mdx": {
  id: "critical-infrastructure-latency-gaming.mdx",
  slug: "critical-infrastructure-latency-gaming",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"currentdesk-saved-with-fusionauth.mdx": {
  id: "currentdesk-saved-with-fusionauth.mdx",
  slug: "currentdesk-saved-with-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"cybanetix-fusionauth-pci-dss.mdx": {
  id: "cybanetix-fusionauth-pci-dss.mdx",
  slug: "cybanetix-fusionauth-pci-dss",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"data-partners-gdpr-questions-to-ask.mdx": {
  id: "data-partners-gdpr-questions-to-ask.mdx",
  slug: "data-partners-gdpr-questions-to-ask",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"datastax-switch-fusionauth-case-study.mdx": {
  id: "datastax-switch-fusionauth-case-study.mdx",
  slug: "datastax-switch-fusionauth-case-study",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"deactivating-reactivating-deleting-user-fusionauth-python.mdx": {
  id: "deactivating-reactivating-deleting-user-fusionauth-python.mdx",
  slug: "deactivating-reactivating-deleting-user-fusionauth-python",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"dealcloser-saves-developer-time-with-fusionauth.mdx": {
  id: "dealcloser-saves-developer-time-with-fusionauth.mdx",
  slug: "dealcloser-saves-developer-time-with-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"denver-startup-week-wrapup.mdx": {
  id: "denver-startup-week-wrapup.mdx",
  slug: "denver-startup-week-wrapup",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"disclosure-conference-report.mdx": {
  id: "disclosure-conference-report.mdx",
  slug: "disclosure-conference-report",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"django-and-oauth.mdx": {
  id: "django-and-oauth.mdx",
  slug: "django-and-oauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"dolphinvc-fusionauth.mdx": {
  id: "dolphinvc-fusionauth.mdx",
  slug: "dolphinvc-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"dot-net-command-line-client.mdx": {
  id: "dot-net-command-line-client.mdx",
  slug: "dot-net-command-line-client",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"download-counts-from-google-cloud-storage.mdx": {
  id: "download-counts-from-google-cloud-storage.mdx",
  slug: "download-counts-from-google-cloud-storage",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"download-install-linux-tutorial.mdx": {
  id: "download-install-linux-tutorial.mdx",
  slug: "download-install-linux-tutorial",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"download-install-mac-tutorial.mdx": {
  id: "download-install-mac-tutorial.mdx",
  slug: "download-install-mac-tutorial",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"easy-integration-fusionauth-nodejs.mdx": {
  id: "easy-integration-fusionauth-nodejs.mdx",
  slug: "easy-integration-fusionauth-nodejs",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"easy-integration-of-fusionauth-and-spring.mdx": {
  id: "easy-integration-of-fusionauth-and-spring.mdx",
  slug: "easy-integration-of-fusionauth-and-spring",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"extending-fusionauth-roles-with-cerbos.mdx": {
  id: "extending-fusionauth-roles-with-cerbos.mdx",
  slug: "extending-fusionauth-roles-with-cerbos",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"firebase-and-fusionauth-ciam-comparison.mdx": {
  id: "firebase-and-fusionauth-ciam-comparison.mdx",
  slug: "firebase-and-fusionauth-ciam-comparison",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"fitt-finder-fusionauth.mdx": {
  id: "fitt-finder-fusionauth.mdx",
  slug: "fitt-finder-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"fusionauth-advanced-mfa.mdx": {
  id: "fusionauth-advanced-mfa.mdx",
  slug: "fusionauth-advanced-mfa",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"fusionauth-and-svb.mdx": {
  id: "fusionauth-and-svb.mdx",
  slug: "fusionauth-and-svb",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"fusionauth-announces-biotech.mdx": {
  id: "fusionauth-announces-biotech.mdx",
  slug: "fusionauth-announces-biotech",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"fusionauth-codemash.mdx": {
  id: "fusionauth-codemash.mdx",
  slug: "fusionauth-codemash",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"fusionauth-colorado-company-to-watch.mdx": {
  id: "fusionauth-colorado-company-to-watch.mdx",
  slug: "fusionauth-colorado-company-to-watch",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"fusionauth-family-model-consent-management.mdx": {
  id: "fusionauth-family-model-consent-management.mdx",
  slug: "fusionauth-family-model-consent-management",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"fusionauth-g2-high-performer.mdx": {
  id: "fusionauth-g2-high-performer.mdx",
  slug: "fusionauth-g2-high-performer",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"fusionauth-inc-5000.mdx": {
  id: "fusionauth-inc-5000.mdx",
  slug: "fusionauth-inc-5000",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"fusionauth-introduces-pass-wordle.mdx": {
  id: "fusionauth-introduces-pass-wordle.mdx",
  slug: "fusionauth-introduces-pass-wordle",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"fusionauth-introduces-simplepass.mdx": {
  id: "fusionauth-introduces-simplepass.mdx",
  slug: "fusionauth-introduces-simplepass",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"fusionauth-lambda-http-connect.mdx": {
  id: "fusionauth-lambda-http-connect.mdx",
  slug: "fusionauth-lambda-http-connect",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"fusionauth-learning-from-incidents.mdx": {
  id: "fusionauth-learning-from-incidents.mdx",
  slug: "fusionauth-learning-from-incidents",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"fusionauth-lets-iot-firm-focus-their-app.mdx": {
  id: "fusionauth-lets-iot-firm-focus-their-app.mdx",
  slug: "fusionauth-lets-iot-firm-focus-their-app",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"fusionauth-loves-open-source.mdx": {
  id: "fusionauth-loves-open-source.mdx",
  slug: "fusionauth-loves-open-source",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"fusionauth-names-don-bergal-ceo.mdx": {
  id: "fusionauth-names-don-bergal-ceo.mdx",
  slug: "fusionauth-names-don-bergal-ceo",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"fusionauth-on-digitalocean-marketplace.mdx": {
  id: "fusionauth-on-digitalocean-marketplace.mdx",
  slug: "fusionauth-on-digitalocean-marketplace",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"fusionauth-passwordless.mdx": {
  id: "fusionauth-passwordless.mdx",
  slug: "fusionauth-passwordless",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"fusionauth-re-invent-2.mdx": {
  id: "fusionauth-re-invent-2.mdx",
  slug: "fusionauth-re-invent-2",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"fusionauth-re-invent.mdx": {
  id: "fusionauth-re-invent.mdx",
  slug: "fusionauth-re-invent",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"fusionauth-recognized-industry-distinctions-comparecamp.mdx": {
  id: "fusionauth-recognized-industry-distinctions-comparecamp.mdx",
  slug: "fusionauth-recognized-industry-distinctions-comparecamp",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"fusionauth-releases-advanced-threat-detection.mdx": {
  id: "fusionauth-releases-advanced-threat-detection.mdx",
  slug: "fusionauth-releases-advanced-threat-detection",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"fusionauth-releases-entity-management.mdx": {
  id: "fusionauth-releases-entity-management.mdx",
  slug: "fusionauth-releases-entity-management",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"fusionauth-reviews-around-world.mdx": {
  id: "fusionauth-reviews-around-world.mdx",
  slug: "fusionauth-reviews-around-world",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"fusionauth-secures-soc2-type2-certification.mdx": {
  id: "fusionauth-secures-soc2-type2-certification.mdx",
  slug: "fusionauth-secures-soc2-type2-certification",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"fusionauth-self-service-registration-typescript.mdx": {
  id: "fusionauth-self-service-registration-typescript.mdx",
  slug: "fusionauth-self-service-registration-typescript",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"fusionauth-soc2-type2-certification.mdx": {
  id: "fusionauth-soc2-type2-certification.mdx",
  slug: "fusionauth-soc2-type2-certification",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"fusionauth-supports-kubernetes.mdx": {
  id: "fusionauth-supports-kubernetes.mdx",
  slug: "fusionauth-supports-kubernetes",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"fusionauth-update-saml.mdx": {
  id: "fusionauth-update-saml.mdx",
  slug: "fusionauth-update-saml",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"fusionauth-vc-free.mdx": {
  id: "fusionauth-vc-free.mdx",
  slug: "fusionauth-vc-free",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"fusionauth-website-how-we-do-it.mdx": {
  id: "fusionauth-website-how-we-do-it.mdx",
  slug: "fusionauth-website-how-we-do-it",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"get-more-value-out-of-fusionauth.mdx": {
  id: "get-more-value-out-of-fusionauth.mdx",
  slug: "get-more-value-out-of-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"getting-started-with-email-templates.mdx": {
  id: "getting-started-with-email-templates.mdx",
  slug: "getting-started-with-email-templates",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"gluu-fusionauth-compare-identity-management-solutions.mdx": {
  id: "gluu-fusionauth-compare-identity-management-solutions.mdx",
  slug: "gluu-fusionauth-compare-identity-management-solutions",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"gnap-next-gen-oauth.mdx": {
  id: "gnap-next-gen-oauth.mdx",
  slug: "gnap-next-gen-oauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"got-users-100-million.mdx": {
  id: "got-users-100-million.mdx",
  slug: "got-users-100-million",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"hackfests-fusionauth.mdx": {
  id: "hackfests-fusionauth.mdx",
  slug: "hackfests-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"hotspot-authentication-with-fusionauth.mdx": {
  id: "hotspot-authentication-with-fusionauth.mdx",
  slug: "hotspot-authentication-with-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"how-sso-works.mdx": {
  id: "how-sso-works.mdx",
  slug: "how-sso-works",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"how-to-authenticate-your-react-app.mdx": {
  id: "how-to-authenticate-your-react-app.mdx",
  slug: "how-to-authenticate-your-react-app",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"how-to-integrate-fusionauth-with-php.mdx": {
  id: "how-to-integrate-fusionauth-with-php.mdx",
  slug: "how-to-integrate-fusionauth-with-php",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"how-to-migrate-from-azure-ad-b2c.mdx": {
  id: "how-to-migrate-from-azure-ad-b2c.mdx",
  slug: "how-to-migrate-from-azure-ad-b2c",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"how-to-migrate-from-cognito.mdx": {
  id: "how-to-migrate-from-cognito.mdx",
  slug: "how-to-migrate-from-cognito",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"how-to-migrate-from-firebase.mdx": {
  id: "how-to-migrate-from-firebase.mdx",
  slug: "how-to-migrate-from-firebase",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"how-to-migrate-user-data-centralized-auth-system.mdx": {
  id: "how-to-migrate-user-data-centralized-auth-system.mdx",
  slug: "how-to-migrate-user-data-centralized-auth-system",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"how-to-securely-implement-oauth-angular.mdx": {
  id: "how-to-securely-implement-oauth-angular.mdx",
  slug: "how-to-securely-implement-oauth-angular",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"how-to-securely-implement-oauth-rails.mdx": {
  id: "how-to-securely-implement-oauth-rails.mdx",
  slug: "how-to-securely-implement-oauth-rails",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"how-to-set-up-single-sign-on-between-fusionauth-joomla.mdx": {
  id: "how-to-set-up-single-sign-on-between-fusionauth-joomla.mdx",
  slug: "how-to-set-up-single-sign-on-between-fusionauth-joomla",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"how-to-set-up-single-sign-on-between-fusionauth-wordpress.mdx": {
  id: "how-to-set-up-single-sign-on-between-fusionauth-wordpress.mdx",
  slug: "how-to-set-up-single-sign-on-between-fusionauth-wordpress",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"iam-product-of-the-year.mdx": {
  id: "iam-product-of-the-year.mdx",
  slug: "iam-product-of-the-year",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"identiverse-conference-report.mdx": {
  id: "identiverse-conference-report.mdx",
  slug: "identiverse-conference-report",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"illustrative-mathematics-saved-with-fusionauth.mdx": {
  id: "illustrative-mathematics-saved-with-fusionauth.mdx",
  slug: "illustrative-mathematics-saved-with-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"implementation-risks-excerpt.mdx": {
  id: "implementation-risks-excerpt.mdx",
  slug: "implementation-risks-excerpt",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"implementing-fusionauth-python.mdx": {
  id: "implementing-fusionauth-python.mdx",
  slug: "implementing-fusionauth-python",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"introducing-biometric-authentication.mdx": {
  id: "introducing-biometric-authentication.mdx",
  slug: "introducing-biometric-authentication",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"introducing-fusionauth-reactor-breached-password-detection.mdx": {
  id: "introducing-fusionauth-reactor-breached-password-detection.mdx",
  slug: "introducing-fusionauth-reactor-breached-password-detection",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"introducing-unlimited-custom-domains-for-fusionauth-cloud.mdx": {
  id: "introducing-unlimited-custom-domains-for-fusionauth-cloud.mdx",
  slug: "introducing-unlimited-custom-domains-for-fusionauth-cloud",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"introduction-login-authentication-workflows.mdx": {
  id: "introduction-login-authentication-workflows.mdx",
  slug: "introduction-login-authentication-workflows",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"inversoft-adds-grolnick-miller-board-directors.mdx": {
  id: "inversoft-adds-grolnick-miller-board-directors.mdx",
  slug: "inversoft-adds-grolnick-miller-board-directors",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"inversoft-record-results.mdx": {
  id: "inversoft-record-results.mdx",
  slug: "inversoft-record-results",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"is-fusionauth-gdpr-compliant.mdx": {
  id: "is-fusionauth-gdpr-compliant.mdx",
  slug: "is-fusionauth-gdpr-compliant",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"jerry-hopper-gdpr-arm-manuals.mdx": {
  id: "jerry-hopper-gdpr-arm-manuals.mdx",
  slug: "jerry-hopper-gdpr-arm-manuals",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"join-us-boulder-startup-week.mdx": {
  id: "join-us-boulder-startup-week.mdx",
  slug: "join-us-boulder-startup-week",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"jwt-authorization-microservices-gateway.mdx": {
  id: "jwt-authorization-microservices-gateway.mdx",
  slug: "jwt-authorization-microservices-gateway",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"keycloak-fusionauth-comparison.mdx": {
  id: "keycloak-fusionauth-comparison.mdx",
  slug: "keycloak-fusionauth-comparison",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"like-avatar-can-keep.mdx": {
  id: "like-avatar-can-keep.mdx",
  slug: "like-avatar-can-keep",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"llm-for-fusionauth-documentation.mdx": {
  id: "llm-for-fusionauth-documentation.mdx",
  slug: "llm-for-fusionauth-documentation",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"locking-an-account-with-breached-password.mdx": {
  id: "locking-an-account-with-breached-password.mdx",
  slug: "locking-an-account-with-breached-password",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"log4j-fusionauth.mdx": {
  id: "log4j-fusionauth.mdx",
  slug: "log4j-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"maila-networks-fusionauth-openstack.mdx": {
  id: "maila-networks-fusionauth-openstack.mdx",
  slug: "maila-networks-fusionauth-openstack",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"manage-custom-user-profile-data.mdx": {
  id: "manage-custom-user-profile-data.mdx",
  slug: "manage-custom-user-profile-data",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"microservices-gateway.mdx": {
  id: "microservices-gateway.mdx",
  slug: "microservices-gateway",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"migrate-from-auth0.mdx": {
  id: "migrate-from-auth0.mdx",
  slug: "migrate-from-auth0",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"migration-types.mdx": {
  id: "migration-types.mdx",
  slug: "migration-types",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"mitigate-acquisition-risks-auth-vendor-excerpt.mdx": {
  id: "mitigate-acquisition-risks-auth-vendor-excerpt.mdx",
  slug: "mitigate-acquisition-risks-auth-vendor-excerpt",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"modeling-family-and-consents.mdx": {
  id: "modeling-family-and-consents.mdx",
  slug: "modeling-family-and-consents",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"multi-tenancy-in-a-single-tenant-architecture.mdx": {
  id: "multi-tenancy-in-a-single-tenant-architecture.mdx",
  slug: "multi-tenancy-in-a-single-tenant-architecture",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"new-feature-login-theme.mdx": {
  id: "new-feature-login-theme.mdx",
  slug: "new-feature-login-theme",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"new-feature-social-login-facebook-google-twitter.mdx": {
  id: "new-feature-social-login-facebook-google-twitter.mdx",
  slug: "new-feature-social-login-facebook-google-twitter",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"nextjs-and-fusionauth-passwordless.mdx": {
  id: "nextjs-and-fusionauth-passwordless.mdx",
  slug: "nextjs-and-fusionauth-passwordless",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"nextjs-single-sign-on.mdx": {
  id: "nextjs-single-sign-on.mdx",
  slug: "nextjs-single-sign-on",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"nodejs-and-twitter-oauth.mdx": {
  id: "nodejs-and-twitter-oauth.mdx",
  slug: "nodejs-and-twitter-oauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"oggeh-fusionauth-gluu.mdx": {
  id: "oggeh-fusionauth-gluu.mdx",
  slug: "oggeh-fusionauth-gluu",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"omedym-chooses-fusionauth.mdx": {
  id: "omedym-chooses-fusionauth.mdx",
  slug: "omedym-chooses-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"onelogin-and-fusionauth.mdx": {
  id: "onelogin-and-fusionauth.mdx",
  slug: "onelogin-and-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"open-office-hours-19-12-17.mdx": {
  id: "open-office-hours-19-12-17.mdx",
  slug: "open-office-hours-19-12-17",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"open-source-auth-considerations.mdx": {
  id: "open-source-auth-considerations.mdx",
  slug: "open-source-auth-considerations",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"orbitvu-fusionauth-story.mdx": {
  id: "orbitvu-fusionauth-story.mdx",
  slug: "orbitvu-fusionauth-story",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"outsourced-auth-team-buy-in.mdx": {
  id: "outsourced-auth-team-buy-in.mdx",
  slug: "outsourced-auth-team-buy-in",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"partnering-passwordless-decade.mdx": {
  id: "partnering-passwordless-decade.mdx",
  slug: "partnering-passwordless-decade",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"password-history.mdx": {
  id: "password-history.mdx",
  slug: "password-history",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"plaintext-passwords.mdx": {
  id: "plaintext-passwords.mdx",
  slug: "plaintext-passwords",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"powered-by-coffee-fusionauth.mdx": {
  id: "powered-by-coffee-fusionauth.mdx",
  slug: "powered-by-coffee-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"private-labeling-with-multi-tenant.mdx": {
  id: "private-labeling-with-multi-tenant.mdx",
  slug: "private-labeling-with-multi-tenant",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"quick-comparison-ping-identity-and-fusionauth.mdx": {
  id: "quick-comparison-ping-identity-and-fusionauth.mdx",
  slug: "quick-comparison-ping-identity-and-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"rbac-with-kubernetes-fusionauth.mdx": {
  id: "rbac-with-kubernetes-fusionauth.mdx",
  slug: "rbac-with-kubernetes-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"react-example-application.mdx": {
  id: "react-example-application.mdx",
  slug: "react-example-application",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"readymag-typescript-apis-support-fusionauth.mdx": {
  id: "readymag-typescript-apis-support-fusionauth.mdx",
  slug: "readymag-typescript-apis-support-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"reconinfosec-fusionauth.mdx": {
  id: "reconinfosec-fusionauth.mdx",
  slug: "reconinfosec-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"remix-demo.mdx": {
  id: "remix-demo.mdx",
  slug: "remix-demo",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"saml-and-oidc-difference.mdx": {
  id: "saml-and-oidc-difference.mdx",
  slug: "saml-and-oidc-difference",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"scaling-auth-system-excerpt.mdx": {
  id: "scaling-auth-system-excerpt.mdx",
  slug: "scaling-auth-system-excerpt",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"securely-implement-oauth-in-react.mdx": {
  id: "securely-implement-oauth-in-react.mdx",
  slug: "securely-implement-oauth-in-react",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"securely-implement-oauth-vuejs.mdx": {
  id: "securely-implement-oauth-vuejs.mdx",
  slug: "securely-implement-oauth-vuejs",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"securing-a-golang-app-with-oauth.mdx": {
  id: "securing-a-golang-app-with-oauth.mdx",
  slug: "securing-a-golang-app-with-oauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"securing-asp-netcore-razor-pages-app-with-oauth.mdx": {
  id: "securing-asp-netcore-razor-pages-app-with-oauth.mdx",
  slug: "securing-asp-netcore-razor-pages-app-with-oauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"securing-flutter-oauth.mdx": {
  id: "securing-flutter-oauth.mdx",
  slug: "securing-flutter-oauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"securing-golang-microservice.mdx": {
  id: "securing-golang-microservice.mdx",
  slug: "securing-golang-microservice",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"securing-react-native-with-oauth.mdx": {
  id: "securing-react-native-with-oauth.mdx",
  slug: "securing-react-native-with-oauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"see-you-at-gdc.mdx": {
  id: "see-you-at-gdc.mdx",
  slug: "see-you-at-gdc",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"see-you-at-gluecon.mdx": {
  id: "see-you-at-gluecon.mdx",
  slug: "see-you-at-gluecon",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"see-you-at-kcdc-2023.mdx": {
  id: "see-you-at-kcdc-2023.mdx",
  slug: "see-you-at-kcdc-2023",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"see-you-at-kcdc.mdx": {
  id: "see-you-at-kcdc.mdx",
  slug: "see-you-at-kcdc",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"see-you-at-that-conference.mdx": {
  id: "see-you-at-that-conference.mdx",
  slug: "see-you-at-that-conference",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"seegno-thousands-tenants.mdx": {
  id: "seegno-thousands-tenants.mdx",
  slug: "seegno-thousands-tenants",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"setting-up-single-sign-on-for-nodebb.mdx": {
  id: "setting-up-single-sign-on-for-nodebb.mdx",
  slug: "setting-up-single-sign-on-for-nodebb",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"sharing-custom-oauth-claims-with-a-asp-netcore-app.mdx": {
  id: "sharing-custom-oauth-claims-with-a-asp-netcore-app.mdx",
  slug: "sharing-custom-oauth-claims-with-a-asp-netcore-app",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"single-sign-on-django-fusionauth.mdx": {
  id: "single-sign-on-django-fusionauth.mdx",
  slug: "single-sign-on-django-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"single-sign-on-laravel-fusionauth.mdx": {
  id: "single-sign-on-laravel-fusionauth.mdx",
  slug: "single-sign-on-laravel-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"single-sign-on-sso-with-fusionauth.mdx": {
  id: "single-sign-on-sso-with-fusionauth.mdx",
  slug: "single-sign-on-sso-with-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"single-sign-on-vs-single-log-out.mdx": {
  id: "single-sign-on-vs-single-log-out.mdx",
  slug: "single-sign-on-vs-single-log-out",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"single-sign-on-with-discord.mdx": {
  id: "single-sign-on-with-discord.mdx",
  slug: "single-sign-on-with-discord",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"single-sign-on-with-drupal.mdx": {
  id: "single-sign-on-with-drupal.mdx",
  slug: "single-sign-on-with-drupal",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"single-sign-on-with-shopify.mdx": {
  id: "single-sign-on-with-shopify.mdx",
  slug: "single-sign-on-with-shopify",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"softozor-fusionauth-hasura-kubernetes.mdx": {
  id: "softozor-fusionauth-hasura-kubernetes.mdx",
  slug: "softozor-fusionauth-hasura-kubernetes",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"spring-and-fusionauth.mdx": {
  id: "spring-and-fusionauth.mdx",
  slug: "spring-and-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"spring-fusionauth.mdx": {
  id: "spring-fusionauth.mdx",
  slug: "spring-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"sunfinity-fusionauth-python.mdx": {
  id: "sunfinity-fusionauth-python.mdx",
  slug: "sunfinity-fusionauth-python",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"supercharge-development-with-fusionauth.mdx": {
  id: "supercharge-development-with-fusionauth.mdx",
  slug: "supercharge-development-with-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"switchboard-reduced-migration-time.mdx": {
  id: "switchboard-reduced-migration-time.mdx",
  slug: "switchboard-reduced-migration-time",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"talent-funnel-fusionauth.mdx": {
  id: "talent-funnel-fusionauth.mdx",
  slug: "talent-funnel-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"the-value-of-try-before-you-buy-excerpt.mdx": {
  id: "the-value-of-try-before-you-buy-excerpt.mdx",
  slug: "the-value-of-try-before-you-buy-excerpt",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"theme-registration-form.mdx": {
  id: "theme-registration-form.mdx",
  slug: "theme-registration-form",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"tips-for-gameday-launches.mdx": {
  id: "tips-for-gameday-launches.mdx",
  slug: "tips-for-gameday-launches",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"top-forum-posts-apr-2021.mdx": {
  id: "top-forum-posts-apr-2021.mdx",
  slug: "top-forum-posts-apr-2021",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"top-forum-posts-mar-2021.mdx": {
  id: "top-forum-posts-mar-2021.mdx",
  slug: "top-forum-posts-mar-2021",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"top-forum-posts-may-2021.mdx": {
  id: "top-forum-posts-may-2021.mdx",
  slug: "top-forum-posts-may-2021",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"treefort-uses-fusionauth-for-all-auth.mdx": {
  id: "treefort-uses-fusionauth-for-all-auth.mdx",
  slug: "treefort-uses-fusionauth-for-all-auth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"unio-saves-100k-with-fusionauth.mdx": {
  id: "unio-saves-100k-with-fusionauth.mdx",
  slug: "unio-saves-100k-with-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"unlimited-domains-fusionauth.mdx": {
  id: "unlimited-domains-fusionauth.mdx",
  slug: "unlimited-domains-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"unsupervised-avoids-development-maintenance-with-with-fusionauth.mdx": {
  id: "unsupervised-avoids-development-maintenance-with-with-fusionauth.mdx",
  slug: "unsupervised-avoids-development-maintenance-with-with-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"updating-crufty-php-application.mdx": {
  id: "updating-crufty-php-application.mdx",
  slug: "updating-crufty-php-application",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"user-data-security-is-a-breach.mdx": {
  id: "user-data-security-is-a-breach.mdx",
  slug: "user-data-security-is-a-breach",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"user-registration-and-sign-in-with-laravel.mdx": {
  id: "user-registration-and-sign-in-with-laravel.mdx",
  slug: "user-registration-and-sign-in-with-laravel",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"using-fusionauth-with-cockroachdb.mdx": {
  id: "using-fusionauth-with-cockroachdb.mdx",
  slug: "using-fusionauth-with-cockroachdb",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"using-java-to-manage-fusionauth.mdx": {
  id: "using-java-to-manage-fusionauth.mdx",
  slug: "using-java-to-manage-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"using-oauth-and-pkce-to-add-authentication-to-your-gatsby-site.mdx": {
  id: "using-oauth-and-pkce-to-add-authentication-to-your-gatsby-site.mdx",
  slug: "using-oauth-and-pkce-to-add-authentication-to-your-gatsby-site",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"using-the-setup-wizard.mdx": {
  id: "using-the-setup-wizard.mdx",
  slug: "using-the-setup-wizard",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"using-user-actions.mdx": {
  id: "using-user-actions.mdx",
  slug: "using-user-actions",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"using-webhooks-to-delete-user-data.mdx": {
  id: "using-webhooks-to-delete-user-data.mdx",
  slug: "using-webhooks-to-delete-user-data",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"weroad-migrated-from-auth0-to-fusionauth.mdx": {
  id: "weroad-migrated-from-auth0-to-fusionauth.mdx",
  slug: "weroad-migrated-from-auth0-to-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"what-happens-after-oauth-authentication-event.mdx": {
  id: "what-happens-after-oauth-authentication-event.mdx",
  slug: "what-happens-after-oauth-authentication-event",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"what-is-scim.mdx": {
  id: "what-is-scim.mdx",
  slug: "what-is-scim",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"what-is-webauthn-why-do-you-care.mdx": {
  id: "what-is-webauthn-why-do-you-care.mdx",
  slug: "what-is-webauthn-why-do-you-care",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"whats-new-in-oauth-2-1.mdx": {
  id: "whats-new-in-oauth-2-1.mdx",
  slug: "whats-new-in-oauth-2-1",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"whats-wrong-with-implicit-grant.mdx": {
  id: "whats-wrong-with-implicit-grant.mdx",
  slug: "whats-wrong-with-implicit-grant",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"when-to-self-host.mdx": {
  id: "when-to-self-host.mdx",
  slug: "when-to-self-host",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"why-consider-standards-based-auth-options-excerpt.mdx": {
  id: "why-consider-standards-based-auth-options-excerpt.mdx",
  slug: "why-consider-standards-based-auth-options-excerpt",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"why-cross-platform-gaming-account.mdx": {
  id: "why-cross-platform-gaming-account.mdx",
  slug: "why-cross-platform-gaming-account",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"why-device-grant-game-login.mdx": {
  id: "why-device-grant-game-login.mdx",
  slug: "why-device-grant-game-login",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"why-no-auth-in-oauth.mdx": {
  id: "why-no-auth-in-oauth.mdx",
  slug: "why-no-auth-in-oauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"why-outsource-auth.mdx": {
  id: "why-outsource-auth.mdx",
  slug: "why-outsource-auth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"why-secure-gaming-accounts.mdx": {
  id: "why-secure-gaming-accounts.mdx",
  slug: "why-secure-gaming-accounts",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"why-user-multi-factor-authentication.mdx": {
  id: "why-user-multi-factor-authentication.mdx",
  slug: "why-user-multi-factor-authentication",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"winning-customer-auth-market.mdx": {
  id: "winning-customer-auth-market.mdx",
  slug: "winning-customer-auth-market",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"xkit-and-fusionauth.mdx": {
  id: "xkit-and-fusionauth.mdx",
  slug: "xkit-and-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"zanocloud-helps-companies-with-fusionauth.mdx": {
  id: "zanocloud-helps-companies-with-fusionauth.mdx",
  slug: "zanocloud-helps-companies-with-fusionauth",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"zendesk-sso-with-hypr.mdx": {
  id: "zendesk-sso-with-hypr.mdx",
  slug: "zendesk-sso-with-hypr",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
"zero-trust-idps.mdx": {
  id: "zero-trust-idps.mdx",
  slug: "zero-trust-idps",
  body: string,
  collection: "blog",
  data: any
} & { render(): Render[".mdx"] },
},
"dev-tools": {
"base64-encoder-decoder.mdx": {
  id: "base64-encoder-decoder.mdx",
  slug: "base64-encoder-decoder",
  body: string,
  collection: "dev-tools",
  data: InferEntrySchema<"dev-tools">
} & { render(): Render[".mdx"] },
"date-time.mdx": {
  id: "date-time.mdx",
  slug: "date-time",
  body: string,
  collection: "dev-tools",
  data: InferEntrySchema<"dev-tools">
} & { render(): Render[".mdx"] },
"index.mdx": {
  id: "index.mdx",
  slug: "index",
  body: string,
  collection: "dev-tools",
  data: InferEntrySchema<"dev-tools">
} & { render(): Render[".mdx"] },
"jwt-decoder.mdx": {
  id: "jwt-decoder.mdx",
  slug: "jwt-decoder",
  body: string,
  collection: "dev-tools",
  data: InferEntrySchema<"dev-tools">
} & { render(): Render[".mdx"] },
"url-encoder-decoder.mdx": {
  id: "url-encoder-decoder.mdx",
  slug: "url-encoder-decoder",
  body: string,
  collection: "dev-tools",
  data: InferEntrySchema<"dev-tools">
} & { render(): Render[".mdx"] },
"uuid-generator.mdx": {
  id: "uuid-generator.mdx",
  slug: "uuid-generator",
  body: string,
  collection: "dev-tools",
  data: InferEntrySchema<"dev-tools">
} & { render(): Render[".mdx"] },
},
"quickstarts": {
"quickstart-dotnet-web.mdx": {
  id: "quickstart-dotnet-web.mdx",
  slug: "quickstart-dotnet-web",
  body: string,
  collection: "quickstarts",
  data: InferEntrySchema<"quickstarts">
} & { render(): Render[".mdx"] },
"quickstart-golang-web.mdx": {
  id: "quickstart-golang-web.mdx",
  slug: "quickstart-golang-web",
  body: string,
  collection: "quickstarts",
  data: InferEntrySchema<"quickstarts">
} & { render(): Render[".mdx"] },
"quickstart-python-django-web.mdx": {
  id: "quickstart-python-django-web.mdx",
  slug: "quickstart-python-django-web",
  body: string,
  collection: "quickstarts",
  data: InferEntrySchema<"quickstarts">
} & { render(): Render[".mdx"] },
"quickstart-python-flask-web.mdx": {
  id: "quickstart-python-flask-web.mdx",
  slug: "quickstart-python-flask-web",
  body: string,
  collection: "quickstarts",
  data: InferEntrySchema<"quickstarts">
} & { render(): Render[".mdx"] },
"quickstart-ruby-rails-web.mdx": {
  id: "quickstart-ruby-rails-web.mdx",
  slug: "quickstart-ruby-rails-web",
  body: string,
  collection: "quickstarts",
  data: InferEntrySchema<"quickstarts">
} & { render(): Render[".mdx"] },
"quickstart-springboot-api.mdx": {
  id: "quickstart-springboot-api.mdx",
  slug: "quickstart-springboot-api",
  body: string,
  collection: "quickstarts",
  data: InferEntrySchema<"quickstarts">
} & { render(): Render[".mdx"] },
"quickstart-springboot-web.mdx": {
  id: "quickstart-springboot-web.mdx",
  slug: "quickstart-springboot-web",
  body: string,
  collection: "quickstarts",
  data: InferEntrySchema<"quickstarts">
} & { render(): Render[".mdx"] },
"quickstart-wordpress-web.mdx": {
  id: "quickstart-wordpress-web.mdx",
  slug: "quickstart-wordpress-web",
  body: string,
  collection: "quickstarts",
  data: InferEntrySchema<"quickstarts">
} & { render(): Render[".mdx"] },
},

	};

	type ContentConfig = typeof import("../src/content/config.js");
}
