<script lang="ts">
	import PagerForItems from '../../../components/pager/PagerForItems.svelte';
    import ModNotesWindowTableRow from './ModNotesWindowTableRow.svelte';

	export let notes: any[];

	// NOTE: svelte doesn't let us pass through events dynamically, so we have
	//       to implement this "event" as a callback prop instead
	export let onDeleteNote: ((id: string) => void) = (() => {});
</script>

<div class="tb-window-content">
	<PagerForItems items={notes} itemsPerPage={10} let:pageItems>
		<table class="tb-modnote-table">
			<thead>
				<tr>
					<th>Author</th>
					<th>Type</th>
					<th>Details</th>
					<th></th>
				</tr>
			</thead>

			<tbody>
				{#each pageItems as note}
					<ModNotesWindowTableRow
						{note}
						on:delete={() => onDeleteNote(note.id)}
					/>
				{/each}
			</tbody>
		</table>
	</PagerForItems>
</div>
