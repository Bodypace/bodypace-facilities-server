<p align="center">
  <a href="https://bodypace.org" target="_blank">
    <img src="https://bodypace.org/favicon.ico" width="75"/>
  </a>
</p>

# Bodypace public data server

<p align="center">
  <a href="https://github.com/Bodypace/bodypace-public-data-server/blob/master/LICENSE">
  <img src="https://img.shields.io/github/license/bodypace/bodypace-public-data-server" alt="Package License" /></a>
  <img alt="GitHub commit activity (branch)" src="https://img.shields.io/github/commit-activity/t/bodypace/bodypace-public-data-server">
  <img alt="GitHub package.json version (branch)" src="https://img.shields.io/github/package-json/v/bodypace/bodypace-public-data-server/master">
  <img alt="" src="https://img.shields.io/badge/tests-passing%20(I%20run%20them%20manually,%20no%20CI%20yet)-green" />
  <img alt="" src="https://img.shields.io/badge/status-not%20ready%20yet%20(under%20development)-yellow" />
</p>

## Description

Server that aggregates, stores and shares various kinds of information related to health. For now only queues to benefits provided by Poland public healthcare (NFZ).

This project is not ready for production use, and development is paused until version 0.0.1 of [bodypace-personal-data-server](https://github.com/Bodypace/bodypace-personal-data-server) is finished. It should work tho if you want to try it out (all tests are passing but idk if setup on fresh machine is as simple as `npm install`).

## Features to do

- Diet
  - API for supermarkets: products (name, ingredients, nutrition facts,...), prices
  - API for meal recepies
- Medicine
  - API for public clinics: locations, websites, open-hours, services, waiting periods
  - API for pharmacies: locations, websites, open-hours, inventory, prices
  - API for blood test laboratories: locations, websites, open-hours, services, prices
  - API for DNA sequencing laboratories: locations, websites, open-hours, services, prices
  - API for private clinics (if legal): locations, websites, open-hours, services, prices

Ideally for entire Planet, now for Poland, one provider at a time.

## Implementation details to do

- General
  - API docs: Swagger, OpenAPI, jsonschema, jsonapi https://jsonapi.org/, etc. (pick some)
- App
  - [feat]: add ConfigModule
  - [fix]: do and remove all "TODO" comments from code
  - [refactor]: tests of correct logging refactor (there is a lot of duplication)
  - [refactor]: tests should always use logger.aggregate, not e.g. logger.log
  - Geocoder
    - [feat]: logging network errors
    - [feat]: logging database errors
    - [feat]: read config (API key) from ConfigModule, not process.env
  - Database
    - [feat]: read config from ConfigModule, not process.env
    - [fix]: onDelete cascade not working (entities are incorrectly written and generated migration does not mention it from what I saw)
    - [fix]: in entities datetime() does not work (it literally stores the string "datetime()" in createdAt column, instead of calling SQL function DATETIME())
    - [fix]: sqlite UPPER and LOWER could not handle polish characters on my system, therefore should check that, because it could result in sometimes not working ILIKE (now tests for case sensitivity use KATOWICE so there is no checking of polish characters) (btw, some sqlite config should probably seal it that LIKE is case insensitive, not I'm just trusting that the default conf is right)
  - NfzQueuesCache
    - [feat]: read config from ConfigModule and make more things configurable
    - [feat]: configurable db errors handling (decide if it is allowed or not, or when/for what queries (e.g. whem making vague queries cache has to be working, for smaller queries we can permit db failure and posible duplicated fetch in future))
    - [feat]: purge task (e.g. cron job)
    - [test]: there is no test check that store() and get() do not modify query or queues (that could fuck up tests and in general whole code)
    - [test]: method get() for stored query that is too specific should hide queues that are broader, incorrectly saved under such too specific query (this test is probably not that important to add, as this logic is already kinda tested)
    - [test]: method get() treating undefined, null, "" and not mentioned key the same way
    - [fix]: method get() has bug as it selects TERYT by province * 2 no left padded by '0', therefore e.g. for province = 4 it will select queues that have TERYT code like '8%' instead of '08%'.
    - [refactor]: tests - there is a lot of them, their layout could be better, they take A LOT OF TIME TO RUN (like 30 minutes...)

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

> Note: idk if below works or do you also have to create an `.sqlite` database first (and maybe something more, and linux is probably required), but anyway if you manage to get this working, do `export SKIP_GENERATED_TESTS=1` to avoid runing ~6500 generated tests that take around 30 minutes when you just want to play with tests, and not actually run them all like I do before pushing (btw. I will update docs later on with steps that work for sure)

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Random notes

Here are some links that I found interesting regarding NFZ in Poland.

| description | URL |
|:------------|:----|
| not very related, map of poland |  https://polska.e-mapa.net |
| idk | https://mapadotacji.gov.pl/ |
| idk | https://www.mapawydatkow.pl/ |
| NFZ                  | https://www.nfz.gov.pl/ |
| NFZ oddziały         | https://www.nfz.gov.pl/kontakt/oddzialy-nfz/ |
| NFZ katowice         | https://www.nfz-katowice.pl/ |
| NFZ GSL              | https://gsl.nfz.gov.pl/ |
| NFZ API              | https://api.nfz.gov.pl/ |
| NFZ kolejki          | https://terminyleczenia.nfz.gov.pl (stronka NFZ Wrocław ma po prawej liste takich rzeczy) (główna NFZ też w "dla pacjenta") |
| NFZ diety            | https://diety.nfz.gov.pl/ |
| NFZ akademia         | https://akademia.nfz.gov.pl/ |
| NFZ moje fizjo+      | https://mojefizjo.nfz.gov.pl/ |
| NFZ aplikacje        | https://aplikacje.nfz.gov.pl/ |
| GOV ezdrowie         | https://ezdrowie.gov.pl/ |
| GOV ezdrowie rej     | https://rejestrymedyczne.ezdrowie.gov.pl/ |
| GOV RA dokumentacja  | https://ezdrowie.gov.pl/portal/home/rejestry-medyczne/rejestr-aptek/ra (przyklad dla aptek) |
| GOV gabinet          | https://gabinet.gov.pl/zaloguj/uzytkownik |
| GOV NCBR             | https://www.gov.pl/web/ncbr  (to od nich był konkurs NUTRITECH) |
| GOV MZ               | https://www.gov.pl/web/zdrowie |
| GOV MZ konkurs       | https://www.gov.pl/web/ncbr/innowacje-w-zywieniu-ncbr-oglasza-wyniki-i-konkursu-nutritech |
| GOV dane             | https://dane.gov.pl/ |
| planuje długie życie | https://planujedlugiezycie.pl/ |
| GOV pacjent (IKP)    | https://pacjent.gov.pl/ |
| GOV PZH (NIZP PIB)   | https://www.pzh.gov.pl/    |
| GOV PZH              | - |
| GOV PZH NCEZ         | https://ncez.pzh.gov.pl/ |
| GOV PZH EPIBAZA      | https://epibaza.pzh.gov.pl/ |
| GOV PZH WĄTROBA      | https://watrobanieboli.pzh.gov.pl/ |
| GOV PZH PROFIBAZA    | https://profibaza.pzh.gov.pl/ |
| GOV AOTM (AOTMiT)    | https://www.aotm.gov.pl/ |
| GOV GIS              | https://www.gov.pl/web/gis |
| GOV GIS kąpieliska   | https://sk.gis.gov.pl/ |
| GOV CEZ              | https://www.cez.gov.pl/pl    (Centrum e-Zdrowia) |
| GOV NIL              | https://www.nil.gov.pl/      (Narodowy Instytut Leków) |

> PZH = Narodowy Instytut Zdrowia Publicznego - Państwowy Zakład Higieny - Państwowy Instytut Badawczy
>
> NCEZ = Narodowe Centrum Edukacji Żywieniowej

And some links related to other stuff.

| description | URL |
|:------------|:----|
| NIL                  | https://nil.org.pl/ |
| WHO                  | https://www.who.int/ |
| IHE                  | https://www.ihe.net/ |
| HL7                  | http://www.hl7.org/ |

## License

Bodypace is licensed under [Apache License 2.0](LICENSE).
