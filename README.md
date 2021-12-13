# forest carbon

### Site

The site is in the root directory of this repo: index.html and map.js,
and the data files.

### Scripts

`./xlsx_to_map_data.py` and `./xlsx_to_map_data_1.py` run over the
input XLSX files, join them to the input geometry files `./gadm36_0.json`
and `./gadm36_1.json`, and join them into joined files (`_join.json`).

They also generate `./meta_0.json` and `./meta_1.json`, which are
used to generate ramps for the choropleth representation.

### Structure

- `country_stats` is the Google Drive-downloaded folder of xlsx files. It's
  ignored for space concerns, but you can download it from Google Drive.
  Should have files like `gadm00_stats_fnf_carbon_2001_gt10pix.xlsx` in it.
