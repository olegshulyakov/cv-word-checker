<script lang="ts">
	import { page } from '$app/state';
</script>

<div class="error-container">
	<h1>{page.status}</h1>
	<p>{page.error?.message ?? 'Page not found'}</p>
	<a href="/" class="btn-primary">Return Home</a>
</div>

<style>
	.error-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 50vh;
		text-align: center;
		gap: 1.5rem;
	}

	h1 {
		font-size: 6rem;
		font-weight: 800;
		margin: 0;
		color: var(--text-color);
		line-height: 1;
	}

	p {
		font-size: 1.5rem;
		color: var(--text-muted);
		margin: 0;
	}

	.btn-primary {
		display: inline-block;
		background-color: var(--accent-color);
		color: white;
		border: none;
		border-radius: 8px;
		padding: 0.75rem 2rem;
		font-size: 1rem;
		font-weight: 600;
		text-decoration: none;
		transition:
			background-color 0.2s,
			transform 0.1s;
	}

	.btn-primary:hover {
		background-color: var(--accent-hover);
		color: white;
		text-decoration: none;
	}

	.btn-primary:active {
		transform: translateY(1px);
	}
</style>
