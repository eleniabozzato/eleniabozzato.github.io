.DEFAULT_GOAL := help

# The 'help' implementation extracts all Makefile targets with comments starting with ##,
# sorts them, and prints a colorized help summary.
help: ## List all available tasks
	@grep -hE '^[A-Za-z0-9_ \.\-]*?:.*##.*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

dependencies: ## Install dev dependencies and the Chromium used by the visual check
	@npm install
	@npx playwright install chromium

build: ## Build the static site into dist/
	@node build.mjs

start: ## Build and serve dist/ on http://localhost:8080 (also on the LAN)
	@npm run --silent serve

identity: ## Check that the build is byte-identical to the hand-written Italian pages
	@node tools/identity.mjs

visual: ## Screenshot every page and compare with a base ref (BASE=<ref>, default HEAD)
	@node tools/visual.mjs $(if $(BASE),--base $(BASE),) $(ARGS)

check: ## Build, identity check and internal links check
	@npm run --silent check
