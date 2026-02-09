import { ChatMessagePF2e, Check } from "foundry-pf2e";
import { MODULE } from "foundry-pf2e/utilities";
import moduleJson from "../module.json" with { type: "json" };

MODULE.register(moduleJson.id);

const enum KEEP_MODES {
    NEW,
    HIGHER,
    LOWER
}

Hooks.once("init", () => {
    game.settings.register(MODULE.id, "keepMode", {
        name: "PF2eRerollSettings.Settings.KeepMode.Name",
        hint: "PF2eRerollSettings.Settings.KeepMode.Hint",
        scope: "world",
        config: true,
        type: new foundry.data.fields.NumberField({
            required: true,
            initial: KEEP_MODES.NEW,
            choices: {
                [KEEP_MODES.NEW]: "PF2eRerollSettings.Settings.KeepMode.Choices.KeepNew",
                [KEEP_MODES.HIGHER]: "PF2eRerollSettings.Settings.KeepMode.Choices.KeepHigher",
                [KEEP_MODES.LOWER]: "PF2eRerollSettings.Settings.KeepMode.Choices.KeepLower"
            }
        })
    });
});

Hooks.once("ready", () => {
    libWrapper.register(
        MODULE.id,
        "game.pf2e.Check.rerollFromMessage",
        async function (
            this: typeof Check,
            wrapped: (typeof Check)["rerollFromMessage"],
            message: ChatMessagePF2e,
            { resource, keep }: { resource?: string; keep?: "new" | "higher" | "lower" } = {}
        ) {
            if (resource !== undefined && keep === undefined) {
                switch (game.settings.get(MODULE.id, "keepMode") as KEEP_MODES) {
                    case KEEP_MODES.NEW:
                        keep = "new";
                        break;
                    case KEEP_MODES.HIGHER:
                        keep = "higher";
                        break;
                    case KEEP_MODES.LOWER:
                        keep = "lower";
                        break;
                }
            }

            return wrapped(message, { resource, keep });
        },
        "WRAPPER"
    );
});

if (import.meta.hot) {
    import.meta.hot.accept(() => {
        import.meta.hot?.invalidate();
    });
}
