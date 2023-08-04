<script lang="ts">
	import RelativeTime from '../../../components/time/RelativeTime.svelte';

	import {createEventDispatcher} from 'svelte';
    import {link } from '../../../tbcore';
    import {icons} from '../../../tbui';

	import {labelColors, labelNames, typeNames} from '../constants';
	import {getContextURL} from '../contextPermalinks'

	export let note: any;

	const emit = createEventDispatcher<{
		delete: undefined;
	}>();

	$: createdAt = new Date(note.created_at * 1000);
	$: mod = note.operator;

	// Get the context URL for the note, but where it rejects if there is no
	// context URL - this plays nice with {#await} blocks
	$: contextURLPromise = getContextURL(note).then(url => {
		if (url == null) {
			throw new Error('promise rejects');
		}
		return url;
	});

	const typeName = (note: any) => typeNames[note.type as keyof typeof typeNames];
	const labelName = (note: any) => labelNames[note.user_note_data.label as keyof typeof labelNames] || note.user_note_data.label;
	const labelColor = (note: any) => labelColors[note.user_note_data.label as keyof typeof labelColors];
</script>

<tr>
	<td>
		<a href={link(`/user/${encodeURIComponent(mod)}`)}>
			/u/{mod}
		</a>
		<br>
		{#await contextURLPromise}
			<small>
				<RelativeTime date={createdAt} />
			</small>
		{:then url}
			<a href={url}>
				<small>
					<RelativeTime date={createdAt} />
				</small>
			</a>
		{:catch}
			<small>
				<RelativeTime date={createdAt} />
			</small>
		{/await}
	</td>

	<td>
		{typeName(note)}
	</td>

	<td>
		{#if note.mod_action_data?.action}
			<span class="tb-modnote-action-summary">
				Took action "{note.mod_action_data.action}"
				{#if note.mod_action_data.details}({note.mod_action_data.details}){/if}{#if note.mod_action_data.description}: {note.mod_action_data.description}{/if}
			</span>
		{/if}
		{#if note.user_note_data?.note}
			<blockquote>
				{#if note.user_note_data.label}
					<span style="color:{labelColor(note)}">
						[{labelName(note)}]
					</span>
				{/if}
				{note.user_note_data.note}
			</blockquote>
		{/if}
	</td>

	<td>
		<!-- only show delete button for mod notes, not actions -->
		{#if note.user_note_data?.note}
			<a
				class="tb-modnote-delete-button tb-icons tb-icons-negative"
				role="button"
				title="Delete note"
				on:click={() => emit('delete')}
			>
				{@html icons.delete}
			</a>
		{/if}
	</td>
</tr>
