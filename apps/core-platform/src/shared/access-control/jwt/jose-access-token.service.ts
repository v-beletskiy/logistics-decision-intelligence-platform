import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import { randomUUIDv7 } from "node:crypto";
import {
  type IdentifiedSchema,
  JSON_SCHEMA_DRAFT_07,
  SchemaRegistry,
} from "@logistics-decision-intelligence/validation/json-schema";

import {
  APP_CONFIG,
  AppConfigurationError,
  type AppConfig,
} from "../../infra/config/app-config";
import { corePlatformSchemaId } from "../../infra/validation/schema-id";
import { AuthenticationException } from "../authentication/authentication.exception";
import type { Identity, UserIdentity } from "../identity/identity";
import { IdentityType } from "../identity/identity-type.enum";
import { Role } from "../roles/role.enum";
import {
  AccessTokenIssuer,
  type IssuedAccessToken,
} from "./access-token-issuer";
import { IdentityTokenVerifier } from "./identity-token-verifier";

const ALGORITHM = "ES256";
const TOKEN_TYPE = "at+jwt";
const userAccessTokenClaimsSchema = {
  $schema: JSON_SCHEMA_DRAFT_07,
  $id: corePlatformSchemaId(
    "access-control",
    "jwt",
    "user-access-token-claims",
    "v1",
  ),
  type: "object",
  additionalProperties: true,
  required: [
    "sub",
    "tenantId",
    "roles",
    "type",
    "iss",
    "aud",
    "iat",
    "exp",
    "jti",
  ],
  properties: {
    sub: { type: "string", format: "uuid" },
    tenantId: { type: "string", format: "uuid" },
    roles: {
      type: "array",
      minItems: 1,
      uniqueItems: true,
      items: { enum: Object.values(Role) },
    },
    type: { const: IdentityType.User },
    iss: { type: "string", minLength: 1 },
    aud: { type: "string", minLength: 1 },
    iat: { type: "integer", minimum: 0 },
    exp: { type: "integer", minimum: 0 },
    jti: { type: "string", format: "uuid" },
  },
} satisfies IdentifiedSchema;

interface UserAccessTokenClaims {
  readonly sub: string;
  readonly tenantId: string;
  readonly roles: readonly Role[];
  readonly type: IdentityType.User;
}

const claimsRegistry = new SchemaRegistry([userAccessTokenClaimsSchema]);

@Injectable()
export class JoseAccessTokenService
  extends IdentityTokenVerifier
  implements AccessTokenIssuer, OnModuleInit
{
  private readonly issuer: string;
  private readonly audience: string;
  private readonly expiresIn: number;
  private readonly privateKeyPem?: string;
  private readonly publicKeyPem?: string;
  private readonly validateKeysOnInit: boolean;
  private privateKey?: Promise<CryptoKey>;
  private publicKey?: Promise<CryptoKey>;

  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    super();
    this.issuer = config.authentication.issuer;
    this.audience = config.authentication.audience;
    this.expiresIn = config.authentication.accessTokenTtlSeconds;
    this.privateKeyPem = config.authentication.privateKeyPem;
    this.publicKeyPem = config.authentication.publicKeyPem;
    this.validateKeysOnInit = config.processRoles.includes("api");
  }

  async onModuleInit(): Promise<void> {
    if (this.validateKeysOnInit) {
      await Promise.all([this.getPrivateKey(), this.getPublicKey()]);
    }
  }

  async issue(identity: UserIdentity): Promise<IssuedAccessToken> {
    const { SignJWT } = await import("jose");
    const key = await this.getPrivateKey();
    const accessToken = await new SignJWT({
      tenantId: identity.tenantId,
      roles: identity.roles,
      type: identity.type,
    })
      .setProtectedHeader({ alg: ALGORITHM, typ: TOKEN_TYPE })
      .setSubject(identity.id)
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .setIssuedAt()
      .setJti(randomUUIDv7())
      .setExpirationTime(`${this.expiresIn}s`)
      .sign(key);

    return { accessToken, tokenType: "Bearer", expiresIn: this.expiresIn };
  }

  async verify(token: string): Promise<Identity> {
    try {
      const { jwtVerify } = await import("jose");
      const key = await this.getPublicKey();
      const { payload } = await jwtVerify(token, key, {
        algorithms: [ALGORITHM],
        audience: this.audience,
        issuer: this.issuer,
        requiredClaims: ["iat", "exp", "jti"],
        typ: TOKEN_TYPE,
      });
      const claims = claimsRegistry.assert<UserAccessTokenClaims>(
        userAccessTokenClaimsSchema.$id,
        payload,
      );
      return {
        id: claims.sub,
        tenantId: claims.tenantId,
        roles: claims.roles,
        type: IdentityType.User,
      };
    } catch {
      throw new AuthenticationException();
    }
  }

  private async getPrivateKey(): Promise<CryptoKey> {
    const { importPKCS8 } = await import("jose");
    return (this.privateKey ??= importPKCS8(
      requireKey(this.privateKeyPem, "JWT_PRIVATE_KEY"),
      ALGORITHM,
    ));
  }

  private async getPublicKey(): Promise<CryptoKey> {
    const { importSPKI } = await import("jose");
    return (this.publicKey ??= importSPKI(
      requireKey(this.publicKeyPem, "JWT_PUBLIC_KEY"),
      ALGORITHM,
    ));
  }
}

function requireKey(value: string | undefined, variableName: string): string {
  if (value === undefined) {
    throw new AppConfigurationError(
      `${variableName} must be configured for the API process.`,
    );
  }
  return value;
}
