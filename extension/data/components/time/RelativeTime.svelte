<script lang="ts">
	import jQuery from 'jquery';

	export let date: Date;

	function timeago(el: HTMLTimeElement) {
		// @ts-expect-error timeago is a jquery plugin with no types
		jQuery(el).timeago();
	}
</script>

<time datetime={date.toISOString()} use:timeago>
	{date.toLocaleString()}
</time>
