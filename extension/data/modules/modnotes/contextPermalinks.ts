import {getInfo} from '../../tbapi';
import {link} from '../../tbcore';

/**
 * In-page cache of comment fullnames to the fullnames of their parent posts.
 * Values of this object are promises which resolve to fullnames, rather than
 * bare strings - we keep the promises around after they're resolved, and always
 * deal with this cache asynchronously.
 * @constant {Record<string, Promise<string>>}
 */
const parentFullnamesCache = Object.create(null);

/**
 * Gets the parent fullname of a comment.
 * @param {string} commentFullname Fullname of a comment
 * @returns {Promise<string>} Fullname of the comment's parent post
 */
function getParentFullname (commentFullname: string) {
    // If it's in cache, return that
    const cached = parentFullnamesCache[commentFullname];
    if (cached) {
        return cached;
    }

    // Fetch the parent fullname fresh
    // Note that we're not awaiting this - we want the full promise
    const parentFullnamePromise = getInfo(commentFullname)
        .then((info: any) => info.data.parent_id);

    // Write to cache and return
    parentFullnamesCache[commentFullname] = parentFullnamePromise;
    return parentFullnamePromise;
}

/**
 * Gets a link to the context item of a note.
 * @param {object} note A mod note object
 * @returns {Promise<string | null>} Resolves to a URL that points to the note's
 * context item, or `null` if there is none
 */
export async function getContextURL (note: any) {
    const itemFullname = note.user_note_data?.reddit_id || note.mod_action_data?.reddit_id;

    // Can't link to something that isn't there
    if (!itemFullname) {
        return null;
    }

    // Split fullname into type and ID
    const [itemType, itemID] = itemFullname.split('_');

    // Post links only require the ID of the post itself, which we have
    if (itemType === 't3') {
        return link(`/comments/${itemID}`);
    }

    // Comment links require the ID of their parent post, which we need to fetch
    if (itemType === 't1') {
        const parentFullname = await getParentFullname(itemFullname);
        return link(`/comments/${parentFullname.replace('t3_', '')}/_/${itemID}`);
    }

    // This ID is for some other item type which we can't process
    return null;
}
