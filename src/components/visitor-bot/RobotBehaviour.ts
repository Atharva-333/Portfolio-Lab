import { Vector2 } from "three";

export type BotState =
  | "IDLE"
  | "CURIOUS"
  | "OBSERVING"
  | "SURPRISED"
  | "THINKING"
  | "GREETING"
  | "FAREWELL";

const SECTION_MESSAGES: Record<string, string[]> = {
  home: [
    "Oh, hello.",
    "Nice place you got here.",
    "I see you're back at the top.",
  ],
  experience: [
    "Quite the journey.",
    "Lots of commits...",
    "Impressive timeline.",
  ],
  projects: [
    "That's quite a collection.",
    "Overengineered, isn't it?",
    "I like this one.",
    "Some cool builds here.",
  ],
  skills: [
    "I wonder what this does...",
    "A talking terminal?",
    "I should try typing 'help'.",
  ],
  contact: [
    "Leaving so soon?",
    "Don't be a stranger.",
    "Let's build something.",
  ],
  default: [
    "Interesting...",
    "Still exploring?",
    "I wonder what else is here.",
  ],
};

export class RobotBehaviour {
  public state: BotState = "GREETING";
  public targetLookAt = new Vector2(0, 0);
  public currentLookAt = new Vector2(0, 0);

  private lastInteraction = Date.now();
  private activeSection = "home";
  private nextStateTimeout: ReturnType<typeof setTimeout> | null = null;
  private messageIndex = 0;
  private onStateChange: (state: BotState, message?: string) => void;

  constructor(onStateChange: (state: BotState, message?: string) => void) {
    this.onStateChange = onStateChange;
    this.enterState("GREETING", "Oh, hello.");
  }

  public update() {
    this.currentLookAt.x += (this.targetLookAt.x - this.currentLookAt.x) * 0.05;
    this.currentLookAt.y += (this.targetLookAt.y - this.currentLookAt.y) * 0.05;

    if (this.state === "IDLE" && Date.now() - this.lastInteraction > 12000) {
      this.enterState("THINKING", this.getRandomMessage());
    }
  }

  public setSection(sectionId: string) {
    this.activeSection = sectionId;
    this.messageIndex = 0;

    let nextState: BotState = "IDLE";

    if (sectionId === "contact") {
      nextState = "FAREWELL";
    } else if (sectionId === "projects") {
      nextState = "CURIOUS";
    } else if (sectionId === "skills" || sectionId === "experience") {
      nextState = "OBSERVING";
    } else if (sectionId === "home") {
      nextState = "GREETING";
    } else {
      nextState = "THINKING";
    }

    this.enterState(nextState, this.getRandomMessage());
  }

  public handleMouseMove(mouseX: number, mouseY: number) {
    this.targetLookAt.set(mouseX * 0.5, mouseY * 0.5);
    this.lastInteraction = Date.now();
  }

  public handleClick() {
    this.lastInteraction = Date.now();
    if (this.state !== "SURPRISED" && this.state !== "GREETING") {
      this.enterState("SURPRISED", this.getRandomMessage());
    }
  }

  private getRandomMessage(): string {
    const msgs =
      SECTION_MESSAGES[this.activeSection] || SECTION_MESSAGES.default;
    const msg = msgs[this.messageIndex % msgs.length];
    this.messageIndex++;
    return msg;
  }

  private enterState(newState: BotState, message?: string) {
    if (this.nextStateTimeout) clearTimeout(this.nextStateTimeout);

    this.state = newState;
    this.onStateChange(newState, message);

    if (newState !== "IDLE" && newState !== "FAREWELL") {
      this.nextStateTimeout = setTimeout(() => {
        this.enterState("IDLE");
      }, 6000);
    }
  }

  public destroy() {
    if (this.nextStateTimeout) clearTimeout(this.nextStateTimeout);
  }
}
