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
"8-things-to-know-about-okta-and-fusionauth.mdx": {
  id: "8-things-to-know-about-okta-and-fusionauth.mdx",
  slug: "8-things-to-know-about-okta-and-fusionauth",
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
"amazon-cognito-and-fusionauth-comparison.mdx": {
  id: "amazon-cognito-and-fusionauth-comparison.mdx",
  slug: "amazon-cognito-and-fusionauth-comparison",
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
"auth0-and-fusionauth-a-tale-of-two-solutions.mdx": {
  id: "auth0-and-fusionauth-a-tale-of-two-solutions.mdx",
  slug: "auth0-and-fusionauth-a-tale-of-two-solutions",
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
"consents-example.mdx": {
  id: "consents-example.mdx",
  slug: "consents-example",
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
"download-install-mac-tutorial.mdx": {
  id: "download-install-mac-tutorial.mdx",
  slug: "download-install-mac-tutorial",
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
"fusionauth-and-svb.mdx": {
  id: "fusionauth-and-svb.mdx",
  slug: "fusionauth-and-svb",
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
"fusionauth-introduces-pass-wordle.mdx": {
  id: "fusionauth-introduces-pass-wordle.mdx",
  slug: "fusionauth-introduces-pass-wordle",
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
"fusionauth-loves-open-source.mdx": {
  id: "fusionauth-loves-open-source.mdx",
  slug: "fusionauth-loves-open-source",
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
"fusionauth-website-how-we-do-it.mdx": {
  id: "fusionauth-website-how-we-do-it.mdx",
  slug: "fusionauth-website-how-we-do-it",
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
"onelogin-and-fusionauth.mdx": {
  id: "onelogin-and-fusionauth.mdx",
  slug: "onelogin-and-fusionauth",
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
"quick-comparison-ping-identity-and-fusionauth.mdx": {
  id: "quick-comparison-ping-identity-and-fusionauth.mdx",
  slug: "quick-comparison-ping-identity-and-fusionauth",
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
"see-you-at-kcdc-2023.mdx": {
  id: "see-you-at-kcdc-2023.mdx",
  slug: "see-you-at-kcdc-2023",
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
"switchboard-reduced-migration-time.mdx": {
  id: "switchboard-reduced-migration-time.mdx",
  slug: "switchboard-reduced-migration-time",
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
"winning-customer-auth-market.mdx": {
  id: "winning-customer-auth-market.mdx",
  slug: "winning-customer-auth-market",
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
"quickstart-golang-web.mdx": {
  id: "quickstart-golang-web.mdx",
  slug: "quickstart-golang-web",
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
"quickstart-springboot-web.mdx": {
  id: "quickstart-springboot-web.mdx",
  slug: "quickstart-springboot-web",
  body: string,
  collection: "quickstarts",
  data: InferEntrySchema<"quickstarts">
} & { render(): Render[".mdx"] },
},

	};

	type ContentConfig = typeof import("../src/content/config.js");
}
