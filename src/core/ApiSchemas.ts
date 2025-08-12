import { z } from "zod";
import { base64urlToUuid } from "./Base64";
import { PlayerStatsSchema } from "./StatsSchemas";
import { Difficulty, GameMode, GameType } from "./game/Game";

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
      start: z.string(),
      mode: z.string(),
      type: z.string(),
      map: z.string(),
      difficulty: z.string(),
      clientId: z.string(),
    }),
  ),
  stats: z.partialRecord(
    z.enum(GameType),
    z.partialRecord(
      z.enum(GameMode),
      z.partialRecord(
        z.enum(Difficulty),
        z.object({
          wins: z.string(),
          losses: z.string(),
          total: z.string(),
          stats: PlayerStatsSchema,
        }),
      ),
    ),
  ),
});
