import { html, LitElement } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { PlayerIdResponseSchema, UserMeResponse } from "../core/ApiSchemas";
import { getServerConfigFromClient } from "../core/configuration/ConfigLoader";
import { GameType } from "../core/game/Game";
import { PlayerStats, PlayerStatsSchema } from "../core/StatsSchemas";
import "./components/baseComponents/PlayerStatsGrid";
import "./components/baseComponents/PlayerStatsTable";

@customElement("player-info-modal")
export class PlayerInfoModal extends LitElement {
  @query("o-modal") private modalEl!: HTMLElement & {
    open: () => void;
    close: () => void;
  };

  @state() private userMeResponse: UserMeResponse | null = null;
  @state() private visibility: GameType = GameType.Public;
  @state() private expandedGameId: string | null = null;

  private statsPublic: PlayerStats | null = null;
  private statsPrivate: PlayerStats | null = null;

  private _publicTotalsCache: {
    wins: number;
    losses: number;
    total: number;
  } | null = null;
  private _privateTotalsCache: {
    wins: number;
    losses: number;
    total: number;
  } | null = null;

  private recentGames: {
    gameId: string;
    start: string;
    map: string;
    difficulty: string;
    type: string;
    gameMode: "ffa" | "team";
    teamCount?: number;
    teamColor?: string;
  }[] = [];

  private viewGame(gameId: string): void {
    this.close();
    const path = location.pathname;
    const search = location.search;
    const hash = `#join=${encodeURIComponent(gameId)}`;
    const newUrl = `${path}${search}${hash}`;

    history.pushState({ join: gameId }, "", newUrl);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }

  private toggleGameDetails(gameId: string): void {
    this.expandedGameId = this.expandedGameId === gameId ? null : gameId;
  }

  private formatPlayTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  }

  createRenderRoot() {
    return this;
  }

  private getStoredFlag(): string {
    const storedFlag = localStorage.getItem("flag");
    return storedFlag ?? "";
  }

  private getStoredName(): string {
    const storedName = localStorage.getItem("username");
    return storedName ?? "";
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  private getDisplayedStats(): PlayerStats | null {
    switch (this.visibility) {
      case GameType.Public:
        return this.statsPublic;
      case GameType.Private:
        return this.statsPrivate;
      default:
        return null;
    }
  }

  private setVisibility(v: GameType.Public | GameType.Private) {
    this.visibility = v;
    this.requestUpdate();
  }

  private applyBackendStats(rawStats: any): void {
    let pubStatsAgg: PlayerStats | null = null;
    let prvStatsAgg: PlayerStats | null = null;

    const totals = {
      public: { wins: 0, losses: 0, total: 0 },
      private: { wins: 0, losses: 0, total: 0 },
    } as const;

    const publicTotals = { ...totals.public };
    const privateTotals = { ...totals.private };

    for (const [typeKey, typeNode] of Object.entries<any>(rawStats ?? {})) {
      if (!typeNode || typeof typeNode !== "object") continue;
      const vis: "public" | "private" | null =
        typeKey === "Public"
          ? "public"
          : typeKey === "Private"
            ? "private"
            : null;
      if (!vis) continue;

      for (const modeNode of Object.values<any>(typeNode)) {
        if (!modeNode || typeof modeNode !== "object") continue;

        for (const diffNode of Object.values<any>(modeNode)) {
          if (!diffNode || typeof diffNode !== "object") continue;

          const parsed = PlayerStatsSchema.safeParse(diffNode.stats ?? {});
          if (parsed.success) {
            if (vis === "public") {
              pubStatsAgg = pubStatsAgg
                ? this.mergePlayerStats(pubStatsAgg, parsed.data)
                : parsed.data;
            } else {
              prvStatsAgg = prvStatsAgg
                ? this.mergePlayerStats(prvStatsAgg, parsed.data)
                : parsed.data;
            }
          }

          const wins = Number((diffNode as any).wins ?? 0);
          const losses = Number((diffNode as any).losses ?? 0);
          const total = Number((diffNode as any).total ?? 0);
          if (vis === "public") {
            publicTotals.wins += wins;
            publicTotals.losses += losses;
            publicTotals.total += total;
          } else {
            privateTotals.wins += wins;
            privateTotals.losses += losses;
            privateTotals.total += total;
          }
        }
      }
    }

    this.statsPublic = pubStatsAgg;
    this.statsPrivate = prvStatsAgg;

    this._publicTotalsCache = { ...publicTotals };
    this._privateTotalsCache = { ...privateTotals };

    this.requestUpdate();
  }

  private mergePlayerStats(a: PlayerStats, b: PlayerStats): PlayerStats {
    const safeA = a ?? {};
    const safeB = b ?? {};
    const mergeArrays = (arr1?: any[], arr2?: any[]) => {
      if (!arr1 && !arr2) return undefined;
      if (!arr1) return arr2;
      if (!arr2) return arr1;
      return arr1.map((v, i) => Number(v ?? 0) + Number(arr2[i] ?? 0));
    };
    return {
      attacks: mergeArrays(safeA.attacks, safeB.attacks),
      betrayals: (safeA.betrayals ?? 0n) + (safeB.betrayals ?? 0n),
      boats: { ...(safeA.boats ?? {}), ...(safeB.boats ?? {}) },
      bombs: { ...(safeA.bombs ?? {}), ...(safeB.bombs ?? {}) },
      gold: mergeArrays(safeA.gold, safeB.gold),
      units: { ...(safeA.units ?? {}), ...(safeB.units ?? {}) },
    };
  }

  render() {
    const flag = this.getStoredFlag();
    const playerName = this.getStoredName();

    const u = this.userMeResponse?.user;
    const discordName = u?.username ?? "";
    const avatarUrl = u?.avatar
      ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${u.avatar.startsWith("a_") ? "gif" : "png"}`
      : u?.discriminator !== undefined
        ? `https://cdn.discordapp.com/embed/avatars/${Number(u.discriminator) % 5}.png`
        : "";

    const visTotals =
      this.visibility === GameType.Public
        ? (this._publicTotalsCache ?? { wins: 0, losses: 0, total: 0 })
        : (this._privateTotalsCache ?? { wins: 0, losses: 0, total: 0 });
    const wins = visTotals.wins;
    const losses = visTotals.losses;
    const gamesPlayed = visTotals.total;
    const wlr = wins === 0 ? 0 : losses === 0 ? wins : wins / losses;
    const lastActive = this.recentGames.length
      ? new Date(
          Math.max(...this.recentGames.map((g) => Date.parse(g.start))),
        ).toLocaleDateString()
      : "N/A";
    const playTimeText = "N/A";

    return html`
      <o-modal id="playerInfoModal" title="Player Info" alwaysMaximized>
        <div class="flex flex-col items-center mt-2 mb-4">
          <br />
          <div class="flex items-center gap-2">
            <div class="p-[3px] rounded-full bg-gray-500">
              <img
                class="size-[48px] rounded-full block"
                src="/flags/${flag ?? "xx"}.svg"
                alt="Flag"
              />
            </div>

            <!-- Names -->
            <span class="font-semibold">${playerName}</span>
            <span>|</span>
            <span class="font-semibold">${discordName}</span>

            <!-- Avatar -->
            ${avatarUrl
              ? html`
                  <div class="p-[3px] rounded-full bg-gray-500">
                    <img
                      class="size-[48px] rounded-full block"
                      src="${avatarUrl}"
                      alt="Avatar"
                    />
                  </div>
                `
              : null}
          </div>
          <!-- Visibility toggle under names -->
          <div class="flex gap-2 mt-2">
            <button
              class="text-xs px-2 py-0.5 rounded border ${this.visibility ===
              GameType.Public
                ? "border-white/60 text-white"
                : "border-white/20 text-gray-300"}"
              @click=${() => this.setVisibility(GameType.Public)}
            >
              Public
            </button>
            <button
              class="text-xs px-2 py-0.5 rounded border ${this.visibility ===
              GameType.Private
                ? "border-white/60 text-white"
                : "border-white/20 text-gray-300"}"
              @click=${() => this.setVisibility(GameType.Private)}
            >
              Private
            </button>
          </div>

          <hr class="w-2/3 border-gray-600 my-2" />

          <player-stats-grid
            .titles=${[
              "Wins",
              "Losses",
              "Win:Loss Ratio",
              "Games Played",
              "Play Time",
              "Last Active",
            ]}
            .values=${[
              wins,
              losses,
              wlr,
              gamesPlayed,
              playTimeText,
              lastActive,
            ]}
          ></player-stats-grid>

          <hr class="w-2/3 border-gray-600 my-2" />

          <hr class="w-2/3 border-gray-600 my-2" />

          <player-stats-table
            .stats=${this.getDisplayedStats()}
          ></player-stats-table>

          <hr class="w-2/3 border-gray-600 my-2" />

          <hr class="w-2/3 border-gray-600 my-2" />

          <div class="mt-4 w-full max-w-md">
            <div class="text-sm text-gray-400 font-semibold mb-1">
              🎮 Recent Games
            </div>
            <div class="flex flex-col gap-2">
              ${this.recentGames.map(
                (game) => html`
                  <div
                    class="bg-white/5 rounded border border-white/10 overflow-hidden transition-all duration-300"
                  >
                    <!-- header row -->
                    <div class="flex items-center justify-between px-4 py-2">
                      <div>
                        <div class="text-sm font-semibold text-white">
                          Game ID: ${game.gameId}
                        </div>
                        <div class="text-xs text-gray-400">
                          Mode:
                          ${game.gameMode === "ffa"
                            ? "Free-for-All"
                            : html`Team (${game.teamCount} teams)`}
                        </div>
                        ${game.gameMode === "team" && game.teamColor
                          ? html`
                              <div class="text-white text-xs font-semibold">
                                Player Team Color: ${game.teamColor}
                              </div>
                            `
                          : null}
                      </div>
                      <div class="flex gap-2">
                        <button
                          class="text-sm text-gray-300 bg-gray-700 px-3 py-1 rounded"
                          @click=${() => this.viewGame(game.gameId)}
                        >
                          View
                        </button>
                        <button
                          class="text-sm text-gray-300 bg-gray-600 px-3 py-1 rounded"
                          @click=${() => this.toggleGameDetails(game.gameId)}
                        >
                          Details
                        </button>
                      </div>
                    </div>
                    <!-- collapsible details inside the same card -->
                    <div
                      class="px-4 pb-2 text-xs text-gray-300 transition-all duration-300"
                      style="max-height: ${this.expandedGameId === game.gameId
                        ? "200px"
                        : "0"};
                             ${this.expandedGameId === game.gameId
                        ? ""
                        : "padding-top:0;padding-bottom:0;"}"
                    >
                      <div>
                        <span class="font-semibold">Started:</span> ${new Date(
                          game.start,
                        ).toLocaleString()}
                      </div>
                      <div>
                        <span class="font-semibold">Mode:</span>
                        ${game.gameMode === "ffa"
                          ? "Free-for-All"
                          : `Team (${game.teamCount ?? "?"} teams)`}
                      </div>
                      <div>
                        <span class="font-semibold">Map:</span> ${game.map}
                      </div>
                      <div>
                        <span class="font-semibold">Difficulty:</span>
                        ${game.difficulty}
                      </div>
                      <div>
                        <span class="font-semibold">Type:</span> ${game.type}
                      </div>
                    </div>
                  </div>
                `,
              )}
            </div>
          </div>
        </div>
      </o-modal>
    `;
  }

  public open() {
    this.requestUpdate();
    this.modalEl?.open();
  }

  public close() {
    this.modalEl?.close();
  }

  onUserMe(userMeResponse: UserMeResponse) {
    this.userMeResponse = userMeResponse;
    const playerId = userMeResponse?.player?.publicId;
    if (playerId) {
      this.loadFromApi(playerId);
    }
    this.requestUpdate();
  }

  onLoggedOut() {
    this.userMeResponse = null;
  }

  private async loadFromApi(playerId: string): Promise<void> {
    try {
      const config = await getServerConfigFromClient();
      const url = new URL(config.jwtIssuer());
      url.pathname = "/player/" + playerId;

      const res = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) {
        console.error("API error:", res.status, res.statusText);
        return;
      }

      const json = await res.json();

      const parsed = PlayerIdResponseSchema.safeParse(json);
      if (!parsed.success) {
        console.error("PlayerApiTopSchema validation failed:", parsed.error);
        return;
      }

      const data = parsed.data;

      this.applyBackendStats(data.stats);

      this.recentGames = data.games.map((g) => ({
        gameId: g.gameId,
        start: g.start,
        map: g.map,
        difficulty: g.difficulty,
        type: g.type,
        gameMode:
          g.mode && String(g.mode).toLowerCase().includes("team")
            ? "team"
            : "ffa",
      }));

      this.requestUpdate();
    } catch (err) {
      console.error("Failed to load player data from API:", err);
    }
  }
}
