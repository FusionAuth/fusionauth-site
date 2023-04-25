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
"authentication/login-authentication-workflows.md": {
  id: "authentication/login-authentication-workflows.md",
  slug: "authentication/login-authentication-workflows",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"authentication/mobile/native-login-form-to-application-backend-jwts-refresh-tokens.mdx": {
  id: "authentication/mobile/native-login-form-to-application-backend-jwts-refresh-tokens.mdx",
  slug: "authentication/mobile/native-login-form-to-application-backend-jwts-refresh-tokens",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"authentication/mobile/native-login-form-to-fusionauth-jwts-refresh-tokens.mdx": {
  id: "authentication/mobile/native-login-form-to-fusionauth-jwts-refresh-tokens.mdx",
  slug: "authentication/mobile/native-login-form-to-fusionauth-jwts-refresh-tokens",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"authentication/mobile/oauth-resource-owner-password-credentials-grant-jwts-refresh-tokens.mdx": {
  id: "authentication/mobile/oauth-resource-owner-password-credentials-grant-jwts-refresh-tokens.mdx",
  slug: "authentication/mobile/oauth-resource-owner-password-credentials-grant-jwts-refresh-tokens",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"authentication/multi-factor-authentication.md": {
  id: "authentication/multi-factor-authentication.md",
  slug: "authentication/multi-factor-authentication",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"authentication/spa/native-login-form-to-application-backend-jwts-refresh-tokens-cookies.mdx": {
  id: "authentication/spa/native-login-form-to-application-backend-jwts-refresh-tokens-cookies.mdx",
  slug: "authentication/spa/native-login-form-to-application-backend-jwts-refresh-tokens-cookies",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"authentication/spa/native-login-form-to-application-backend-sessions-refresh-tokens-cookies.mdx": {
  id: "authentication/spa/native-login-form-to-application-backend-sessions-refresh-tokens-cookies.mdx",
  slug: "authentication/spa/native-login-form-to-application-backend-sessions-refresh-tokens-cookies",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"authentication/spa/native-login-form-to-application-backend-sessions.mdx": {
  id: "authentication/spa/native-login-form-to-application-backend-sessions.mdx",
  slug: "authentication/spa/native-login-form-to-application-backend-sessions",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"authentication/spa/native-login-form-to-fusionauth-jwts-local-storage-refresh-tokens-cookies.mdx": {
  id: "authentication/spa/native-login-form-to-fusionauth-jwts-local-storage-refresh-tokens-cookies.mdx",
  slug: "authentication/spa/native-login-form-to-fusionauth-jwts-local-storage-refresh-tokens-cookies",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"authentication/spa/native-login-form-to-fusionauth-jwts-refresh-tokens-cookies.mdx": {
  id: "authentication/spa/native-login-form-to-fusionauth-jwts-refresh-tokens-cookies.mdx",
  slug: "authentication/spa/native-login-form-to-fusionauth-jwts-refresh-tokens-cookies",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"authentication/spa/native-login-form-to-fusionauth-same-domain-jwts-refresh-tokens-cookies.mdx": {
  id: "authentication/spa/native-login-form-to-fusionauth-same-domain-jwts-refresh-tokens-cookies.mdx",
  slug: "authentication/spa/native-login-form-to-fusionauth-same-domain-jwts-refresh-tokens-cookies",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"authentication/spa/oauth-authorization-code-grant-jwts-refresh-tokens-cookies.mdx": {
  id: "authentication/spa/oauth-authorization-code-grant-jwts-refresh-tokens-cookies.mdx",
  slug: "authentication/spa/oauth-authorization-code-grant-jwts-refresh-tokens-cookies",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"authentication/spa/oauth-authorization-code-grant-sessions-refresh-tokens-cookies.mdx": {
  id: "authentication/spa/oauth-authorization-code-grant-sessions-refresh-tokens-cookies.mdx",
  slug: "authentication/spa/oauth-authorization-code-grant-sessions-refresh-tokens-cookies",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"authentication/spa/oauth-authorization-code-grant-sessions.mdx": {
  id: "authentication/spa/oauth-authorization-code-grant-sessions.mdx",
  slug: "authentication/spa/oauth-authorization-code-grant-sessions",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"authentication/spa/oauth-implicit-grant-jwts-cookies.mdx": {
  id: "authentication/spa/oauth-implicit-grant-jwts-cookies.mdx",
  slug: "authentication/spa/oauth-implicit-grant-jwts-cookies",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"authentication/spa/oauth-implicit-grant-jwts-local-storage.mdx": {
  id: "authentication/spa/oauth-implicit-grant-jwts-local-storage.mdx",
  slug: "authentication/spa/oauth-implicit-grant-jwts-local-storage",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"authentication/spa/oauth-implicit-grant-sessions.mdx": {
  id: "authentication/spa/oauth-implicit-grant-sessions.mdx",
  slug: "authentication/spa/oauth-implicit-grant-sessions",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"authentication/spa/oauth-resource-owner-password-credentials-grant-jwts-refresh-tokens-cookies.mdx": {
  id: "authentication/spa/oauth-resource-owner-password-credentials-grant-jwts-refresh-tokens-cookies.mdx",
  slug: "authentication/spa/oauth-resource-owner-password-credentials-grant-jwts-refresh-tokens-cookies",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"authentication/spa/oauth-resource-owner-password-credentials-grant-sessions-refresh-tokens-cookies.mdx": {
  id: "authentication/spa/oauth-resource-owner-password-credentials-grant-sessions-refresh-tokens-cookies.mdx",
  slug: "authentication/spa/oauth-resource-owner-password-credentials-grant-sessions-refresh-tokens-cookies",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"authentication/spa/oauth-resource-owner-password-credentials-grant-sessions.mdx": {
  id: "authentication/spa/oauth-resource-owner-password-credentials-grant-sessions.mdx",
  slug: "authentication/spa/oauth-resource-owner-password-credentials-grant-sessions",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"authentication/types-of-kubernetes-auth.md": {
  id: "authentication/types-of-kubernetes-auth.md",
  slug: "authentication/types-of-kubernetes-auth",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
"authentication/webapp/native-login-form-to-application-backend-jwts-refresh-tokens-cookies.mdx": {
  id: "authentication/webapp/native-login-form-to-application-backend-jwts-refresh-tokens-cookies.mdx",
  slug: "authentication/webapp/native-login-form-to-application-backend-jwts-refresh-tokens-cookies",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"authentication/webapp/native-login-form-to-application-backend-sessions-refresh-tokens-cookies.mdx": {
  id: "authentication/webapp/native-login-form-to-application-backend-sessions-refresh-tokens-cookies.mdx",
  slug: "authentication/webapp/native-login-form-to-application-backend-sessions-refresh-tokens-cookies",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"authentication/webapp/native-login-form-to-application-backend-sessions.mdx": {
  id: "authentication/webapp/native-login-form-to-application-backend-sessions.mdx",
  slug: "authentication/webapp/native-login-form-to-application-backend-sessions",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"authentication/webapp/oauth-authorization-code-grant-jwts-refresh-tokens-cookies.mdx": {
  id: "authentication/webapp/oauth-authorization-code-grant-jwts-refresh-tokens-cookies.mdx",
  slug: "authentication/webapp/oauth-authorization-code-grant-jwts-refresh-tokens-cookies",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"authentication/webapp/oauth-authorization-code-grant-sessions-refresh-tokens-cookies.mdx": {
  id: "authentication/webapp/oauth-authorization-code-grant-sessions-refresh-tokens-cookies.mdx",
  slug: "authentication/webapp/oauth-authorization-code-grant-sessions-refresh-tokens-cookies",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"authentication/webapp/oauth-authorization-code-grant-sessions.mdx": {
  id: "authentication/webapp/oauth-authorization-code-grant-sessions.mdx",
  slug: "authentication/webapp/oauth-authorization-code-grant-sessions",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"authentication/webapp/oauth-resource-owner-password-credentials-grant-jwts-refresh-tokens-cookies.mdx": {
  id: "authentication/webapp/oauth-resource-owner-password-credentials-grant-jwts-refresh-tokens-cookies.mdx",
  slug: "authentication/webapp/oauth-resource-owner-password-credentials-grant-jwts-refresh-tokens-cookies",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"authentication/webapp/oauth-resource-owner-password-credentials-grant-sessions-refresh-tokens-cookies.mdx": {
  id: "authentication/webapp/oauth-resource-owner-password-credentials-grant-sessions-refresh-tokens-cookies.mdx",
  slug: "authentication/webapp/oauth-resource-owner-password-credentials-grant-sessions-refresh-tokens-cookies",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"authentication/webapp/oauth-resource-owner-password-credentials-grant-sessions.mdx": {
  id: "authentication/webapp/oauth-resource-owner-password-credentials-grant-sessions.mdx",
  slug: "authentication/webapp/oauth-resource-owner-password-credentials-grant-sessions",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".mdx"] },
"authentication/webauthn-explained.md": {
  id: "authentication/webauthn-explained.md",
  slug: "authentication/webauthn-explained",
  body: string,
  collection: "articles",
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] },
},

	};

	type ContentConfig = typeof import("../src/content/config.js");
}
