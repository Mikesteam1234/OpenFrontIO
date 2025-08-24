import "./components/baseComponents/stats/DiscordUserHeader";
import "./components/baseComponents/stats/GameList";
import "./components/baseComponents/stats/PlayerStatsTable";
import "./components/baseComponents/stats/PlayerStatsTree";
import { Difficulty, GameMode, GameType, isGameMode } from "../core/game/Game";
import { LitElement, html } from "lit";
import {
  PlayerGame,
  PlayerStatsTree,
  UserMeResponse,
} from "../core/ApiSchemas";
import { customElement, query, state } from "lit/decorators.js";
import { fetchPlayerById } from "./jwt";
import { translateText } from "./Utils";

@customElement("player-info-modal")
export class PlayerInfoModal extends LitElement {
  @query("o-modal") private readonly modalEl!: HTMLElement & {
    open: () => void;
    close: () => void;
  };

  @state() private userMeResponse: UserMeResponse | null = null;
  @state() private visibility: GameType = GameType.Public;
  @state() private loadError: string | null = null;
  @state() private selectedMode: GameMode = GameMode.FFA;
  @state() private selectedDifficulty: Difficulty = Difficulty.Medium;
  @state() private warningMessage: string | null = null;

  private statsTree: PlayerStatsTree | null = null;
  private recentGames: PlayerGame[] = [];

  private viewGame(gameId: string): void {
    this.close();
    const path = location.pathname;
    const { search } = location;
    const hash = `#join=${encodeURIComponent(gameId)}`;
    const newUrl = `${path}${search}${hash}`;

    history.pushState({ join: gameId }, "", newUrl);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  private setGameType(type: GameType) {
    this.visibility = type;
    const typeKey: GameType = this.visibility;
    const typeNode = this.statsTree?.[typeKey] ?? {};
    const modes = Object.keys(typeNode).filter(isGameMode);
    if (modes.length) {
      if (!modes.includes(this.selectedMode)) this.selectedMode = modes[0];
    }
    this.requestUpdate();
  }

  private setMode(m: GameMode) {
    this.selectedMode = m;

    const typeKey: GameType = this.visibility;
    const typeNode = this.statsTree?.[typeKey];

    if (!typeNode || !typeNode[m]) {
      this.warningMessage = "player_modal.no_data";
      this.requestUpdate();
      return;
    }

    this.warningMessage = null;
    this.requestUpdate();
  }

  private setDifficulty(d: Difficulty) {
    this.selectedDifficulty = d;

    const typeKey: GameType = this.visibility;
    const modeNode = this.statsTree?.[typeKey]?.[this.selectedMode];

    if (!modeNode || !modeNode[d]) {
      this.warningMessage = "player_modal.no_data";
    } else {
      this.warningMessage = null;
    }

    this.requestUpdate();
  }

  render() {
    return html`
      <o-modal
        id="playerInfoModal"
        title="${translateText("player_modal.title")}"
        alwaysMaximized
      >
        <div class="flex flex-col items-center mt-2 mb-4">
          ${this.loadError
            ? html`
                <div
                  class="w-full max-w-md mb-3 px-3 py-2 rounded border text-sm text-center"
                  style="
                    background: rgba(220,38,38,0.15);
                    border-color: rgba(248,113,113,0.6);
                    color: rgb(254,202,202);
                  "
                >
                  ${translateText(this.loadError)}
                </div>
              `
            : null}
          ${this.warningMessage
            ? html`
                <div
                  class="w-full max-w-md mb-3 px-3 py-2 rounded border text-sm text-center"
                  style="background: rgba(202,138,4,0.15); border-color: rgba(253,224,71,0.6); color: rgb(253,224,71);"
                >
                  ${translateText(this.warningMessage)}
                </div>
              `
            : null}
          <br />
          <discord-user-header
            .data=${this.userMeResponse?.user ?? null}
          ></discord-user-header>
          <!-- Visibility toggle under names -->
          <div class="flex gap-2 mt-2">
            <button
              class="text-xs px-2 py-0.5 rounded border ${this.visibility ===
              GameType.Public
                ? "border-white/60 text-white"
                : "border-white/20 text-gray-300"}"
              @click=${() => this.setGameType(GameType.Public)}
            >
              ${translateText("player_modal.public")}
            </button>
            <button
              class="text-xs px-2 py-0.5 rounded border ${this.visibility ===
              GameType.Private
                ? "border-white/60 text-white"
                : "border-white/20 text-gray-300"}"
              @click=${() => this.setGameType(GameType.Private)}
            >
              ${translateText("player_modal.private")}
            </button>
          </div>

          <!-- Mode selector -->
          <div class="flex gap-2 mt-2">
            ${([GameMode.FFA, GameMode.Team] as const).map(
              (m) => html`
                <button
                  class="text-xs px-2 py-0.5 rounded border ${this
                    .selectedMode === m
                    ? "border-white/60 text-white"
                    : "border-white/20 text-gray-300"}"
                  @click=${() => this.setMode(m)}
                  title=${translateText("player_modal.mode")}
                >
                  ${m === GameMode.FFA
                    ? translateText("player_modal.mode_ffa")
                    : translateText("player_modal.mode_team")}
                </button>
              `,
            )}
          </div>

          <!-- Difficulty selector -->
          <div class="flex gap-2 mt-2">
            ${(
              [
                Difficulty.Easy,
                Difficulty.Medium,
                Difficulty.Hard,
                Difficulty.Impossible,
              ] as const
            ).map(
              (d) => html`
                <button
                  class="text-xs px-2 py-0.5 rounded border ${this
                    .selectedDifficulty === d
                    ? "border-white/60 text-white"
                    : "border-white/20 text-gray-300"}"
                  @click=${() => this.setDifficulty(d)}
                  title=${translateText("player_modal.difficulty")}
                >
                  ${d}
                </button>
              `,
            )}
          </div>

          <hr class="w-2/3 border-gray-600 my-2" />

          <player-stats-tree-view
            .props=${{
              statsTree: this.statsTree,
              visibility: this.visibility,
              selectedMode: this.selectedMode,
              selectedDifficulty: this.selectedDifficulty,
            }}
          ></player-stats-tree-view>

          <hr class="w-2/3 border-gray-600 my-2" />

          <div class="mt-4 w-full max-w-md">
            <div class="text-sm text-gray-400 font-semibold mb-1">
              🎮 ${translateText("player_modal.recent_games")}
            </div>
            <game-list
              .games=${this.recentGames}
              .onViewGame=${(id: string) => this.viewGame(id)}
            ></game-list>
          </div>
        </div>
      </o-modal>
    `;
  }

  public open() {
    this.loadError = null;
    this.requestUpdate();
    this.modalEl?.open();
  }

  public close() {
    this.modalEl?.close();
  }

  onUserMe(userMeResponse: UserMeResponse | null) {
    this.userMeResponse = userMeResponse;
    const playerId = userMeResponse?.player?.publicId;
    if (playerId) {
      this.loadFromApi(playerId);
    } else {
      this.statsTree = null;
      this.recentGames = [];
      this.warningMessage = null;
      this.loadError = null;
      this.visibility = GameType.Public;
      this.selectedMode = GameMode.FFA;
      this.selectedDifficulty = Difficulty.Medium;
    }
    this.requestUpdate();
  }

  private async loadFromApi(playerId: string): Promise<void> {
    try {
      this.loadError = null;

      const data = await fetchPlayerById(playerId);
      if (!data) {
        this.loadError = "player_modal.error.load";
        this.requestUpdate();
        return;
      }

      this.recentGames = data.games;
      this.statsTree = data.stats;

      this.requestUpdate();
    } catch (err) {
      console.warn("Failed to load player data:", err);
      this.loadError = "player_modal.error.load";
      this.requestUpdate();
    }
  }
}
