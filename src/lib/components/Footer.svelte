<footer class="footer">
	<div class="container">
		<p class="processing-note">All processing is local. Your data never leaves your browser.</p>
		<nav class="links">
			<a href="/privacy">Privacy Policy</a>
		</nav>
	</div>
</footer>

<style>
	.footer {
		margin-top: auto;
		border-top: 1px solid var(--border-color);
		padding: 1rem;
		background-color: var(--surface-color);
		color: var(--text-muted);
		font-size: 0.875rem;
	}

	.container {
		max-width: var(--max-width);
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		text-align: center;
	}

	@media (min-width: 640px) {
		.container {
			flex-direction: row;
			justify-content: space-between;
			text-align: left;
		}
	}

	.processing-note {
		margin: 0;
	}

	.links {
		display: flex;
		gap: 1rem;
	}

	a {
		color: var(--text-muted);
		text-decoration: none;
	}

	a:hover {
		color: var(--accent-color);
		text-decoration: underline;
	}
</style>
