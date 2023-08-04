import $ from 'jquery';

import {Module} from '../../tbmodule.js';
import {isModSub, isNewModmail} from '../../tbcore.js';
import {htmlEncode} from '../../tbhelpers.js';
import * as TBApi from '../../tbapi.js';
import {drawPosition} from '../../tbui.js';
import TBListener from '../../tblistener.js';
import {setSettingAsync} from '../../tbstorage.js';
import {labelColors, labelNames, typeNames} from './constants.ts';

import ModNotesWindow from './components/ModNotesWindow.svelte';

// A queue of users and subreddits whose latest note will be fetched in the next
// bulk call, alongside the associated resolve and reject functions so we can
// pass the individual results back to their callers; used by `getLatestModNote`
let pendingLatestNoteRequests = [];

// The ID of the timeout for performing the bulk API request; used by
// `getLatestModNote` to debounce the request
let fetchLatestNotesTimeout;

/**
 * Fetches the most recent mod note on the given user in the given subreddit.
 * @param {string} subreddit The name of the subreddit
 * @param {string} user The name of the user
 * @returns {Promise} Resolves to a note object or `null`, or rejects an error
 */
function getLatestModNote (subreddit, user) {
    return new Promise((resolve, reject) => {
        // Add this user/subreddit to the queue to be included in the next call,
        // alongside this promise's resolve and reject functions so we can pass
        // the result back to the caller
        pendingLatestNoteRequests.push({
            subreddit,
            user,
            resolve,
            reject,
        });

        // Each time this function is called, we set a timeout to process the
        // queue 500ms later. However, if the function is called again in that
        // time, that should be cancelled and rescheduled for 500ms after the
        // later call.

        // Cancel any existing timeout
        clearTimeout(fetchLatestNotesTimeout);
        fetchLatestNotesTimeout = null;

        // If we have 500 users/subs queued, that's the max the API can handle
        // at once, so process the queue now rather than waiting longer
        if (pendingLatestNoteRequests.length === 500) {
            processQueue();
            return;
        }

        // Otherwise, set a timeout to process the queue in 500ms
        fetchLatestNotesTimeout = setTimeout(processQueue, 500);
    });

    // This function executes the API request to fetch the latest note for all
    // the users/subreddits queued, and distributes results (or errors) to their
    // corresponding callers.
    async function processQueue () {
        // Store a copy of the queue as it is right now, then immediately clear
        // the queue, so additional requests can be queued for the next batch
        // while we handle the current batch
        const queuedRequests = pendingLatestNoteRequests;
        pendingLatestNoteRequests = [];

        try {
            // The API takes separate arrays of subs and users, so build those
            const subreddits = queuedRequests.map(entry => entry.subreddit);
            const users = queuedRequests.map(entry => entry.user);

            // Perform the request to fetch the notes
            const notes = await TBApi.getRecentModNotes(subreddits, users);

            // We now have to pass each note to the appropriate caller's promise
            // resolver; since the arrays are in the same order, we can loop
            // over all the resolve functions and call them, passing the note at
            // the corresponding index in the notes array
            for (const [i, {resolve}] of Object.entries(queuedRequests)) {
                resolve(notes[i]);
            }
        } catch (error) {
            // If there was an error, reject all the the promises
            for (const {reject} of queuedRequests) {
                reject(error);
            }
        }
    }
}

/**
 * Creates a mod note badge for the given information.
 * @param {object} data Data associated with the badge
 * @param {string} data.user Name of the relevant user
 * @param {string} data.subreddit Name of the relevant subreddit
 * @param {string} data.label Text shown in the badge if there are no notes
 * @param {object} [data.note] The most recent mod note left on the user
 * @returns {jQuery} The created badge
 */
function createModNotesBadge ({
    user,
    subreddit,
    label = 'NN',
    note,
}) {
    const $badge = $(`
        <a
            class="tb-bracket-button tb-modnote-badge"
            role="button"
            tabindex="0"
            title="Mod notes for /u/${user} in /r/${subreddit}"
            data-user="${user}"
            data-subreddit="${subreddit}"
            data-label="${label}"
        >
    `);

    updateModNotesBadge($badge, {
        note,
    });

    return $badge;
}

/**
 * Updates mod note badges in place with the given information.
 * @param {jQuery} $badge The badge(s) to update
 * @param {object} note The most recent mod note left on the user, or null
 */
function updateModNotesBadge ($badge, note) {
    if (!note || !note.user_note_data) {
        $badge.text($badge.attr('data-label'));
        return;
    }

    $badge.empty();
    $badge.append(`
        <b style="${note.user_note_data.label ? `color: ${labelColors[note.user_note_data.label]}` : ''}">
            ${htmlEncode(note.user_note_data.note)}
        </b>
    `);
}

export default new Module({
    name: 'Mod Notes',
    id: 'ModNotes',
    beta: true,
    enabledByDefault: true,
    settings: [
        {
            id: 'defaultTabName',
            description: 'Default tab for the modnotes window',
            type: 'selector',
            values: [
                'All Activity',
                'Notes',
                'Actions',
            ],
            default: 'all_activity',
        },
        {
            id: 'defaultNoteLabel',
            description: 'Default label for new notes',
            type: 'selector',
            values: [
                'None',
                ...Object.values(labelNames),
            ],
            default: 'none',
        },
    ],
}, function ({defaultTabName, defaultNoteLabel}) {
    // Clean up old broken cache storage key
    // TODO: Remove this a couple versions from now when people have reasonably
    //       probably updated past this
    setSettingAsync(this.id, 'cachedParentFullnames', undefined);

    // Handle authors showing up on the page
    TBListener.on('author', async e => {
        const subreddit = e.detail.data.subreddit.name;
        const author = e.detail.data.author;
        const contextID = isNewModmail ? undefined : e.detail.data.comment?.id || e.detail.data.post?.id;

        // Deleted users can't have notes
        if (author === '[deleted]') {
            return;
        }

        // Can't fetch notes in a sub you're not a mod of
        // TODO: What specific permissions are required to fetch notes?
        const isMod = await isModSub(subreddit);
        if (!isMod) {
            return;
        }

        // Return early if we don't have the things we need
        if (!e.detail.data.subreddit.name || !e.detail.data.author) {
            return;
        }

        // Display badge for notes if not already present
        const $target = $(e.target);
        let $badge = $target.find('.tb-modnote-badge');
        if (!$badge.length) {
            $badge = createModNotesBadge({
                user: e.detail.data.author,
                subreddit: e.detail.data.subreddit.name,
            });
            // TODO: don't register this directly on the badge, use $body.on('click', selector, ...)
            $badge.on('click', async clickEvent => {
                // TODO: open popup with more information for this user
                this.info(`clicked badge for /u/${author} in /r/${subreddit}`);

                // Fetch all usernotes for this user
                let notes;
                try {
                    // TODO: store these somewhere persistent so they can be
                    //       added to later if the user wants to load more
                    notes = await TBApi.getModNotes(subreddit, author);
                } catch (error) {
                    this.error(`Error fetching mod notes for /u/${author} in /r/${subreddit}`, error);
                }

                // Create, position, and display popup
                const mountEl = $('<div>')
                    .addClass('tb-modnotes-popup-svelte-mount')
                    // Position at the top of the document to set a consistent
                    // anchor for the draggable window; ensure it's as wide as
                    // the window to avoid early horizontal wrapping of the
                    // window contents; make 0px high to avoid eating pointer
                    // events
                    .css({
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        right: '0',
                        height: '0',
                    })
                    .appendTo($('body'));
                const positions = drawPosition(clickEvent);
                const notesWindow = new ModNotesWindow({
                    target: mountEl[0],
                    props: {
                        user: author,
                        subreddit,
                        notes,
                        contextID,
                        defaultTabName,
                        defaultNoteLabel,
                        initialTop: positions.topPosition,
                        initialLeft: positions.leftPosition,
                    },
                });
                // when the window close button is pressed, close it
                notesWindow.$on('close', () => {
                    notesWindow.$destroy();
                    mountEl.remove();
                });
            });
            $badge.appendTo($target);
        }

        this.debug(`Fetching latest mod note for /u/${author} in /r/${subreddit}`);
        try {
            const note = await getLatestModNote(subreddit, author);
            this.info(`Got note for /u/${author} in /r/${subreddit}:`, note);
            updateModNotesBadge($badge, note);
        } catch (error) {
            this.error(`Error fetching mod notes for /u/${author} in /r/${subreddit}:`, error);
        }
    });
});
