.PHONY: build

all: init build

init: .npm-install-done

.npm-install-done:
	npm install
	touch .npm-install-done

default: lint test

lint:
	npm run lint

build:
	npm run build

test:
	npm run test

debug:
	npm run debug

clean:
	rm -f .npm-install-done
	rm -rf node_modules
	rm -rf dist
	rm -rf build

.PHONY: all init clean
