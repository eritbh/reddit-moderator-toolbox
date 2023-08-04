<script lang="ts">
	import Window from '../../../components/window/Window.svelte';
    import WindowTabs from '../../../components/window/WindowTabs.svelte';
    import ModNotesWindowTab from './ModNotesWindowTab.svelte';

	import {createModNote, deleteModNote} from '../../../tbapi';
    import {FEEDBACK_NEGATIVE, FEEDBACK_POSITIVE, textFeedback} from '../../../tbui';

	import {labelNames} from '../constants';
    import {createEventDispatcher} from 'svelte';

	export let user: string;
	export let subreddit: string;
	export let notes: any[] = [];
	export let contextId: string | undefined;
	export let defaultNoteLabel: string;
	export let defaultTabName: string;

	export let initialTop: string;
	export let initialLeft: string;

	const emit = createEventDispatcher<{
		close: undefined;
	}>();

	$: notesOnly = notes.filter(note => note.user_note_data?.note);
	$: actionsOnly = notes.filter(note => note.mod_action_data?.action);

	// set initial active tab based on `defaultTabName` setting
	let activeTab = (() => {
		switch (defaultTabName) {
			case 'notes': return 1;
			case 'actions': return 2;
			default: return 0;
		}
	})();

	// use: helper to focus an element when it's presented
	function focus (el: HTMLElement) {
		el.focus();
	}

	/** Deletes a mod note of a given ID from the current user and subreddit */
	async function deleteNote(id: string) {
		try {
            await deleteModNote({
                user,
                subreddit,
                id,
            });
        } catch (error) {
            console.error('Failed to delete note:', error);
            textFeedback('Failed to delete note', FEEDBACK_NEGATIVE);
			return;
        }

		const index = notes.findIndex(note => note.id === id);
		if (index !== -1) {
			notes.splice(index, 1)
			notes = notes;
		}

		textFeedback('Note removed!', FEEDBACK_POSITIVE);
	}

	// #region Note creation form
	let note = '';
	let label: string | undefined;

	/** Creates a note based on the values of the create note form */
	async function createNote() {
		try {
            await createModNote({
                user,
                subreddit,
                note,
                label,
                redditID: contextId,
            });
        } catch (error) {
            console.error('Failed to create mod note:', error);
            textFeedback('Failed to create mod note', FEEDBACK_NEGATIVE);
        }

		textFeedback('Note saved', FEEDBACK_POSITIVE);
		emit('close');
	}
	// #endregion
</script>

<Window
	title="Mod notes for /u/{user} in /r/{subreddit}"
	on:close={() => emit('close')}
	draggable
	{initialTop}
	{initialLeft}
>
	<WindowTabs
		{activeTab}
		tabs={[
			{
				title: 'All Activity',
				component: ModNotesWindowTab,
				props: {
					notes,
					onDeleteNote: deleteNote,
				},
			},
			{
				title: 'Notes',
				component: ModNotesWindowTab,
				props: {
					notes: notesOnly,
					onDeleteNote: deleteNote,
				},
			},
			{
				title: 'Actions',
				component: ModNotesWindowTab,
				props: {
					notes: actionsOnly,
					onDeleteNote: deleteNote,
				},
			},
		]}
	/>

	<form
		slot="footer"
		class="tb-modnote-create-form"
		on:submit={event => {
			event.preventDefault();
			createNote();
		}}
	>
		<select
			class="tb-action-button tb-modnote-label-select"
			bind:value={label}
		>
			<option
				value={undefined}
				selected={defaultNoteLabel === 'none'}
			>
				(no label)
			</option>
			{#each Object.entries(labelNames).reverse() as [value, name] }
				<option
					{value}
					selected={defaultNoteLabel === name.toLowerCase().replace(/\s/g, '_')}
				>
					{name}
				</option>
			{/each}
		</select>

		<input
			type="text"
			class="tb-modnote-text-input tb-input"
			placeholder="Add a note..."
			bind:value={note}
			use:focus
		>

		<button
			type="submit"
			class="tb-action-button"
		>
			Create Note
		</button>
	</form>
</Window>
