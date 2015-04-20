CC = sass

CSS = \
	css/ \
	css/campusMap.css

all: $(CSS)

css/:
	mkdir css

css/%.css: scss/%.scss
	$(CC) $< $@

clean:
	-rm -rf css
