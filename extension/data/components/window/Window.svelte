<script lang="ts">
    import {createEventDispatcher} from 'svelte';

	import {icons} from '../../tbconstants';

    export let title: string;
    export let cssClass = '';
    export let meta: string | null = null;
    export let closable = true;
	export let large = false;

	export let draggable = true;
	export let initialTop = '0px';
	export let initialLeft = '0px';

	const emit = createEventDispatcher<{
		close: undefined;
	}>();

	import jQuery from 'jquery';
	function drag (el: HTMLElement, {draggable, top, left}: {
		draggable: boolean;
		top: string;
		left: string;
	}) {
		if (!draggable) {
			return;
		}
		const jqEl = jQuery(el);
		jqEl.css({
			top,
			left,
		});
		setTimeout(() => {
			// @ts-expect-error drag is a jquery plugin
			jqEl.drag(jqEl.find('.tb-window-header'))
		}, 100);
	}
</script>

<div
	class="tb-window {cssClass}"
	class:tb-window-draggable={draggable}
	class:tb-window-large={large}
	use:drag={{
		draggable,
		top: initialTop,
		left: initialLeft,
	}}
>
	{#if meta != null}
		<div class="meta" style="display: none;">
			{@html meta}
		</div>
	{/if}

	<div class="tb-window-header">
		<div class="tb-window-title">
			{title}
		</div>
		<div class="buttons">
			<slot name="extraButtons" />
			{#if closable}
				<a
					class="close"
					href="javascript:;"
					on:click={() => emit('close')}
				>
					<i class="tb-icons">{@html icons.close}</i>
				</a>
			{/if}
		</div>
	</div>

	<slot>
		<div class="tb-window-content">
			<slot name="content" />
		</div>
	</slot>

	{#if $$slots.footer}
		<div class="tb-window-footer">
			<slot name="footer" />
		</div>
	{/if}
</div>
