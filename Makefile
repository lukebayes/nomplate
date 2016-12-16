###########################################################
# Nomplate build script
###########################################################

# Operating System (darwin or linux)
PLATFORM:=$(shell uname | tr A-Z a-z)
ARCH=x64

# Nodejs
NODE_VERSION=7.2.0
NODE=lib/nodejs/bin/node
NPM=lib/nodejs/bin/npm

# Derived values
NODE_FILENAME=node-v$(NODE_VERSION)-$(PLATFORM)-$(ARCH)
TEST_FILES=`find . -name "*_test.js" ! -path "*node_modules*"`
NODE_MODULES_BIN=node_modules/.bin

# Node utilities
ESLINT=$(NODE_MODULES_BIN)/eslint
MOCHA=$(NODE_MODULES_BIN)/_mocha
WEBPACK=$(NODE_MODULES_BIN)/webpack
BABEL=$(NODE_MODULES_BIN)/babel
BABEL_NODE=$(NODE_MODULES_BIN)/babel-node
WEBPACK_CLIENT_CONFIG=webpack-client.config.js
WEBPACK_SERVER_CONFIG=webpack-server.config.js

.PHONY: test test-w dev-install build build-module lint clean

build: dist/index.js dist/nomplate.min.js dist/nomplate.min.gz

# Run all JavaScript tests
test: ${NODE}
	${MOCHA} --compilers js:babel-core/register --reporter dot ${TEST_FILES}

test-w: ${NODE}
	${MOCHA} --compilers js:babel-core/register --reporter dot ${TEST_FILES} -w

build-module: src/*

publish: clean build
	cd dist/ && npm publish

serve:
	$(BABEL_NODE) server.js

dist/index.js: src/* index.js express.js package.json bin/*
	$(BABEL) src/ --out-dir dist/src --copy-files
	$(BABEL) index.js --out-file dist/index.js
	$(BABEL) express.js --out-file dist/express.js
	mkdir -p dist/bin
	$(BABEL) bin/nomplate.js --out-file dist/bin/nomplate.js
	cp package.json dist/package.json

dist/nomplate.min.js:
	$(WEBPACK) --optimize-minimize --config $(WEBPACK_CLIENT_CONFIG) index.js dist/nomplate.min.js

dist/nomplate.min.gz:
	gzip --best -c dist/nomplate.min.js > dist/nomplate.min.gz

dist/express.js:
	$(WEBPACK) --config $(WEBPACK_SERVER_CONFIG) express.js dist/express.js
	
lint:
	$(ESLINT) --config $(PROJECT_ROOT)/.eslintrc.json .

module-install: 
	$(NPM) install

integrate: clean lint build test

clean: 
	rm -rf dist
	rm -rf tmp

# Intall development dependencies (OS X and Linux only)
dev-install: $(NODE) $(NODE_MODULES_BIN)

# Download and unpack the Node binaries into lib/nodejs.
$(NODE):
	mkdir -p tmp
	wget -O tmp/nodejs.tar.xz --no-check-certificate "https://nodejs.org/dist/v$(NODE_VERSION)/$(NODE_FILENAME).tar.xz"
	touch tmp/nodejs.tar.xz
	mkdir -p lib/nodejs
	tar -xvf tmp/nodejs.tar.xz -C lib/nodejs --strip 1
	touch lib/nodejs/README.md
	rm -rf tmp

# Install npm dependencies
$(NODE_MODULES_BIN): $(PROJECT_ROOT)/package.json
	$(NPM) install --development

