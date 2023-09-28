<p align="center">
  <a href="https://bodypace.org" target="_blank">
    <img src="https://bodypace.org/favicon.ico" width="75"/>
  </a>
</p>

# Bodypace facilities server

<p align="center">
  <a href="https://github.com/Bodypace/bodypace-facilities-server/blob/master/LICENSE">
  <img src="https://img.shields.io/github/license/bodypace/bodypace-facilities-server" alt="Package License" /></a>
  <img alt="GitHub commit activity (branch)" src="https://img.shields.io/github/commit-activity/t/bodypace/bodypace-facilities-server">
  <img alt="GitHub package.json version (branch)" src="https://img.shields.io/github/package-json/v/bodypace/bodypace-facilities-server/master">
  <img alt="" src="https://img.shields.io/badge/tests-passing%20(I%20run%20them%20manually,%20no%20CI%20yet)-green" />
  <img alt="" src="https://img.shields.io/badge/status-not%20ready%20yet%20(under%20development)-yellow" />
</p>

## Description

API server that stores and shares data about various facilities related to healthcare. For now only queues to NFZ in Poland.

This project is not ready for use, and will be paused to develop [bodypace-personal-data-server](https://github.com/Bodypace/bodypace-personal-data-server) and [bodypace-mobile-app](https://github.com/Bodypace/Mobile).

Here is a current list of notes and generally things to do:

- geocodes
- configuration
  - geocoder API key
  - database config
  - cache config
  - cache db errors handling (permit or not or when or for what queries)
- purge task (e.g. cron job) for NfzQueuesCacheModule
- tests
  - there is no check that cache store() and get() do not modify query or queues (that could fuck up tests and in general whole code)
  - cache service get() for stored query that is too specific should hide queues that are broader, incorrectly saved under such too specific query (this test is probably not that important to add, as this logic is already kinda tested)
  - cache service get() treating undefined, null, "" and not mentioned key the same way
- fixes
  - fix onDelete cascade not working (entities are incorrectly written and generated migration does not mention it from what I saw)
  - cache service get has bug as it selects TERYT by province * 2 no left padded by '0', therefore e.g. for province = 4 it will select queues that have TERYT code like '8%' instead of '08%'.
  - do and remove all "TODO" comments from code
  - sqlite UPPER and LOWER could not handle polish characters on my system, therefore should check that, because it could result in sometimes not working ILIKE (now tests for case sensitivity use KATOWICE so there is no checking of polish characters) (btw, some sqlite config should probably seal it that LIKE is case insensitive, not I'm just trusting that the default conf is right)
- refactors
  - test logs refactor (there is a lot of duplication)
  - all tests should use logger.aggregate, not e.g. logger.log or logger.warn
  - cache service tests (there is a lot of them, their layout could be better, they take A LOT OF TIME TO RUN (like 8 minutes...))

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

> Note: idk if below works or do you also have to create an `.sqlite` database first (and maybe something more, and linux is probably required), but anyway if you manage to get this working, do `export SKIP_GENERATED_TESTS=1` to avoid runing ~6500 generated tests that take around 10 minutes when you just want to play with tests, and not actually run them all like I do before pushing (btw. I will update docs later on with steps that work for sure)

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

Bodypace is licensed under [Apache License 2.0](LICENSE).
