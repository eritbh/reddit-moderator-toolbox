/** An object mapping modnote types to human-friendly display names. */
export const typeNames = {
    NOTE: 'Note',
    APPROVAL: 'Approve',
    REMOVAL: 'Remove',
    BAN: 'Ban',
    MUTE: 'Mail Mute',
    INVITE: 'Invite',
    SPAM: 'Spam',
    CONTENT_CHANGE: 'Update Post',
    MOD_ACTION: 'Mod Action',
};

/**
 * An object mapping modnote labels to display colors. All colors are from
 * the default Toolbox usernote type colors, except the `HELPFUL_USER` label
 * which doesn't have an analogue in Toolbox usernotes.
 */
export const labelColors = {
    BOT_BAN: 'black',
    PERMA_BAN: 'darkred',
    BAN: 'red',
    ABUSE_WARNING: 'orange',
    SPAM_WARNING: 'purple',
    SPAM_WATCH: 'fuchsia',
    SOLID_CONTRIBUTOR: 'green',
    HELPFUL_USER: 'lightseagreen',
};

/** An object mapping modnote lavels to human-friendly display names. */
export const labelNames = {
    BOT_BAN: 'Bot Ban',
    PERMA_BAN: 'Permaban',
    BAN: 'Ban',
    ABUSE_WARNING: 'Abuse Warning',
    SPAM_WARNING: 'Spam Warning',
    SPAM_WATCH: 'Spam Watch',
    SOLID_CONTRIBUTOR: 'Solid Contributor',
    HELPFUL_USER: 'Helpful User',
};
