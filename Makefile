PYTHON = python3
DATA_SCRIPT_PATH = ./createJapaneseData.py
RESOURCE_PATH = ~/Dropbox/AcnicoyResources
OUTPUT_PATH = ./language-content/Japanese-English
ELECTRON_PATH = ./node_modules/.bin/electron

DICTIONARY_PATH = $(RESOURCE_PATH)/JMdict.xml
DICT_TEXTS_PATH = $(RESOURCE_PATH)/improved-dictionary-texts.json
KANJI_PATH = $(RESOURCE_PATH)/kanjidic.txt
KANJI_MEANINGS_PATH = $(RESOURCE_PATH)/improved-kanji-meanings.json
KANJI_RADICALS_PATH = $(RESOURCE_PATH)/radical.utf8.txt
KANJI_PARTS_PATH = $(RESOURCE_PATH)/kradfile
KANJI_STROKES_PATH = $(RESOURCE_PATH)/kanjivg-20150615-2.xml
KANJI_NUMERALS_PATH = $(RESOURCE_PATH)/numeric-kanji.json
KANJI_COUNTERS_PATH = $(RESOURCE_PATH)/counter-kanji.json
NEW_JLPT_N3_PATH = $(RESOURCE_PATH)./new-jlpt-n3-kanji.txt

.PHONY: data dictionary_data kanji_data build start install

all: build

build:
	gulp

start:
	$(ELECTRON_PATH) .

install:
	npm install
	bash install.sh $(ELECTRON_PATH)

data: dictionary_data kanji_data

dictionary_data:
	mkdir -p $(OUTPUT_PATH)
	$(PYTHON) $(DATA_SCRIPT_PATH) \
        --dict $(DICTIONARY_PATH) \
        --texts $(DICT_TEXTS_PATH) \
        -o $(OUTPUT_PATH)

kanji_data:
	mkdir -p $(OUTPUT_PATH)
	$(PYTHON) $(DATA_SCRIPT_PATH) \
        --kanji $(KANJI_PATH) \
        --kanji-meanings $(KANJI_MEANINGS_PATH) \
        --kanji-radicals $(KANJI_RADICALS_PATH) \
        --kanji-parts $(KANJI_PARTS_PATH) \
        --kanji-strokes $(KANJI_STROKES_PATH) \
        --kanji-jlpt $(NEW_JLPT_N3_PATH) \
        -o $(OUTPUT_PATH)
	cp $(KANJI_NUMERALS_PATH) $(OUTPUT_PATH)
	cp $(KANJI_COUNTERS_PATH) $(OUTPUT_PATH)
