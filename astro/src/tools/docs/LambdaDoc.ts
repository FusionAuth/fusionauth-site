export interface LambdaDoc {
  /**
   * User friendly name
   */
  displayName: string;
  /**
   * User friendly name, shortened. Used in nav menu if available.
   */
  shortDisplayName: string;
  /**
   * font-awesome css classes, like fa-apple fab. used in nav menu.
   */
  menuIcon: string;
  /**
   * what is the API type name. Should match the java enum value from https://github.com/FusionAuth/fusionauth-client-builder/blob/main/src/main/domain/io.fusionauth.domain.LambdaType.json
   */
  typeText: string;
  /**
   * version where it was introduced. like 1.26.0. Omit this key if we don't have a version this field was introduced in (or it was introduced when lambdas were introduced).
   */
  version?: string;
  /**
   * relative link to the lambda doc page (not the API doc)
   */
  docLink: string;
}