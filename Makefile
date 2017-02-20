SHELL := /bin/bash
export PATH := $(PWD)/node_modules/.bin:$(PATH)
export NODE_PATH = ./

MOCHA_CMD = mocha --compilers js:babel-core/register

test:
	$(MOCHA_CMD) ./tests/test_plugin.js