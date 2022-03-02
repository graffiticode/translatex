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

use-local-packages:
	rm -rf node_modules || true
	rm package-lock.json || true
	npm i ../parselatex
	npm i

update-dependencies:
	rm package-lock.json || true
	rm -rf node_modules || true
	rm -f *.tgz || true
	cp ../parselatex/*.tgz .
	npm i file:artcompiler-parselatex-1.6.0.tgz
	npm i
	npm pack .

.PHONY: archive all init clean build

