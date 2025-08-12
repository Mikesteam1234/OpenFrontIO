import { z } from "zod";
import { base64urlToUuid } from "./Base64";
import { BigIntStringSchema, PlayerStatsSchema } from "./StatsSchemas";
import { Difficulty, GameMapType, GameMode, GameType } from "./game/Game";

export const RefreshResponseSchema = z.object({
  token: z.string(),
});
export type RefreshResponse = z.infer<typeof RefreshResponseSchema>;

/* eslint-disable sort-keys */
export const TokenPayloadSchema = z.object({
  jti: z.string(),
  sub: z
    .string()
    .refine(
      (val) => {
        const uuid = base64urlToUuid(val);
        return !!uuid;
      },
      {
        message: "Invalid base64-encoded UUID",
      },
    )
    .transform((val) => {
      const uuid = base64urlToUuid(val);
      if (!uuid) throw new Error("Invalid base64 UUID");
      return uuid;
    }),
  iat: z.number(),
  iss: z.string(),
  aud: z.string(),
  exp: z.number(),
});
export type TokenPayload = z.infer<typeof TokenPayloadSchema>;

export const UserMeResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    avatar: z.string().nullable(),
    username: z.string(),
    global_name: z.string().nullable(),
    discriminator: z.string(),
    locale: z.string().optional(),
  }),
  player: z.object({
    publicId: z.string(),
    roles: z.string().array().optional(),
    flares: z.string().array().optional(),
  }),
});
export type UserMeResponse = z.infer<typeof UserMeResponseSchema>;

export const PlayerIdResponseSchema = z.object({
  createdAt: z.iso.datetime(),
  user: z
    .object({
      id: z.string(),
      avatar: z.string().nullable(),
      username: z.string(),
      global_name: z.string().nullable(),
      discriminator: z.string(),
    })
    .optional(),
  games: z.array(
    z.object({
      gameId: z.string(),
      start: z.iso.datetime(),
      mode: z.enum(GameMode),
      type: z.enum(GameType),
      map: z.enum(GameMapType),
      difficulty: z.enum(Difficulty),
      clientId: z.string().optional(),
    }),
  ),
  stats: z.partialRecord(
    z.enum(GameType),
    z.partialRecord(
      z.enum(GameMode),
      z.partialRecord(
        z.enum(Difficulty),
        z.object({
          wins: BigIntStringSchema,
          losses: BigIntStringSchema,
          total: BigIntStringSchema,
          stats: PlayerStatsSchema,
        }),
      ),
    ),
  ),
});
